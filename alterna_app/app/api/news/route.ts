import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const subscriptionMethod = searchParams.get('subscriptionMethod');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const supabase = createClient();

    let query = supabase
      .from('al_tr_events')
      .select('*')
      .order('published_at', { ascending: false });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (subscriptionMethod) {
      query = query.eq('subscription_method', subscriptionMethod);
    }

    if (dateFrom) {
      query = query.gte('published_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('published_at', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      return Response.json({
        ok: false,
        error: `Database error: ${error.message}`,
        items: []
      }, { status: 500 });
    }

    // Map database fields to expected NewsEvent interface
    const mappedData = (data || []).map(item => ({
      id: item.id,
      url: item.url,
      title: item.project_name || 'タイトルなし',
      description: null, // Database doesn't have description field
      event_type: item.event_type,
      subscription_method: item.subscription_method,
      expected_yield: item.expected_yield,
      minimum_investment: item.min_investment,
      deadline: null, // Database doesn't have deadline field
      published_at: item.published_at,
      created_at: item.published_at // Use published_at as created_at
    }));

    return Response.json(mappedData);

  } catch {
    return Response.json({
      ok: false,
      error: 'Internal server error',
      items: []
    }, { status: 500 });
  }
}