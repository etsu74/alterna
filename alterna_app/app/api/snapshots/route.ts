import { supabaseServiceRole } from '@/lib/supabase/service-role';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { data: snapshots, error: fetchError } = await supabaseServiceRole
      .from('al_offering_snaps')
      .select('*')
      .order('captured_at', { ascending: false });

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return Response.json({
        ok: false,
        error: 'Failed to fetch snapshots from database',
        items: []
      }, { status: 500 });
    }

    if (!snapshots || snapshots.length === 0) {
      return Response.json({
        ok: true,
        items: []
      });
    }

    const snapshotsWithUrls = await Promise.all(
      snapshots.map(async (snapshot) => {
        try {
          // Extract relative path from full URL if needed
          let relativePath = snapshot.image_path;
          if (relativePath.includes('/storage/v1/object/sign/snapshots/')) {
            relativePath = relativePath.split('/storage/v1/object/sign/snapshots/')[1];
          }

          const { data: signedUrlData, error: urlError } = await supabaseServiceRole.storage
            .from('snapshots')
            .createSignedUrl(relativePath, 3600); // 1時間有効

          if (urlError) {
            console.error(`Signed URL generation failed for ${relativePath}:`, urlError);
          }

          return {
            id: snapshot.id,
            url: snapshot.url,
            title: snapshot.title,
            note: snapshot.note,
            captured_at: snapshot.captured_at,
            signed_url: signedUrlData?.signedUrl || null
          };
        } catch (error) {
          console.error(`Error processing snapshot ${snapshot.id}:`, error);
          return {
            id: snapshot.id,
            url: snapshot.url,
            title: snapshot.title,
            note: snapshot.note,
            captured_at: snapshot.captured_at,
            signed_url: null
          };
        }
      })
    );

    return Response.json({
      ok: true,
      items: snapshotsWithUrls
    });
  } catch (error) {
    console.error('Snapshots API error:', error);
    return Response.json({
      ok: false,
      error: 'Internal server error',
      items: []
    }, { status: 500 });
  }
}