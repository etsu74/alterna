// supabase/functions/fetch_feeds/index.ts
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { parse } from "https://deno.land/x/xml@2.0.4/mod.ts";
// const SECRET = Deno.env.get("FUNCTION_SECRET");
function assertAuthorized(req) {
  const got = req.headers.get("x-function-secret");
  if (!SECRET || got !== SECRET) return new Response("forbidden", {
    status: 403
  });
  return null;
}
async function logToDb(supabaseUrl, serviceKey, level, message, details = {}) {
  if (supabaseUrl && serviceKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/function_logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`
        },
        body: JSON.stringify({
          level,
          message,
          details
        })
      });
    } catch (e) {
      console.error("Failed to log to DB:", e);
    }
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, details);
  }
}
const FEEDS = [
  {
    source: "PRTIMES",
    url: "https://prtimes.jp/index.rdf"
  },
  {
    source: "GOOGLE_NEWS",
    url: "https://news.google.com/rss/search?q=%E3%82%AA%E3%83%AB%E3%82%BF%E3%83%8A+%E4%B8%89%E4%BA%95%E7%89%A9%E7%94%A3&hl=ja&gl=JP&ceid=JP:ja"
  }
];
// ---------- ユーティリティ（x/xml のノード表現に対応） ----------
function t(node) {
  // _text と __text の両方を許容
  if (node == null) return "";
  if (typeof node === "string") return node.trim();
  return (node._text ?? node.__text ?? "").toString().trim();
}
function attr(node, name) {
  const a = node?._attributes ?? node?.attributes ?? {};
  const v = a?.[name];
  return (v ?? "").toString().trim();
}
function pickLink(n) {
  // RSS2: <link>text</link>
  const linkText = t(n?.link);
  if (linkText) return linkText;
  // Atom: <link href="...">
  const linkHref = attr(n?.link, "href");
  if (linkHref) return linkHref;
  // 代替: id / guid
  const id = t(n?.id);
  if (id) return id;
  const guid = t(n?.guid);
  if (guid) return guid;
  return "";
}
// RSS/Atom/RDF をまとめて配列へ
function parseFeed(doc) {
  const out = [];
  // --- RSS 2.0 ---
  const rssItems = doc?.rss?.channel?.item;
  if (Array.isArray(rssItems) && rssItems.length) {
    for (const n of rssItems){
      out.push({
        title: t(n?.title),
        link: pickLink(n),
        content: t(n?.description),
        published: t(n?.pubDate) || new Date().toUTCString(),
        author: t(n?.["dc:creator"])
      });
    }
    return out;
  }
  // --- RSS 1.0 / RDF (PRTIMES) ---
  const rdf = doc?.["rdf:RDF"] ?? doc?.RDF ?? null;
  const rdfItems = rdf?.item;
  if (Array.isArray(rdfItems) && rdfItems.length) {
    for (const n of rdfItems){
      // PR TIMESは dcterms:issued or dc:date に時刻が入ることがある
      out.push({
        title: t(n?.title),
        link: pickLink(n),
        content: t(n?.description),
        published: t(n?.["dcterms:issued"]) || t(n?.["dc:date"]) || new Date().toUTCString(),
        author: t(n?.["dc:creator"])
      });
    }
    return out;
  }
  // --- Atom ---
  const atomEntries = doc?.feed?.entry;
  if (Array.isArray(atomEntries) && atomEntries.length) {
    for (const n of atomEntries){
      out.push({
        title: t(n?.title),
        link: pickLink(n),
        content: t(n?.summary) || t(n?.content),
        published: t(n?.updated) || new Date().toUTCString(),
        author: t(n?.author?.name)
      });
    }
    return out;
  }
  return out; // 空
}
// ---------- 正規化 ----------
function toNumberOrNull(m, factor = 1) {
  if (!m) return null;
  const v = parseFloat(m[1]);
  return Number.isFinite(v) ? v * factor : null;
}
function normalize(text) {
  const event_type = /償還|運用終了/.test(text) ? "REDEMPTION" : /分配|配当|利回り/.test(text) ? "RESULT" : /募集|申込|応募|販売開始|公開|受付開始|提供開始|新着/.test(text) ? "NEW_LISTING" : /レビュー|体験|感想|当選|落選/.test(text) ? "REVIEW" : "NEWS";
  const subscription_method = /抽選/.test(text) ? "DRAW" : /先着|FCFS/.test(text) ? "FCFS" : null;
  const min_invest = toNumberOrNull(text.match(/([1-9][0-9]*(?:\.[0-9]+)?)\s*万円/), 10000);
  const expected_yield = toNumberOrNull(text.match(/([0-9]+(?:\.[0-9]+)?)\s*%/));
  const sentiment = /想定超|当選|好評/.test(text) ? 1 : /落選|遅延|下回り/.test(text) ? -1 : 0;
  return {
    event_type,
    subscription_method,
    min_invest,
    expected_yield,
    sentiment
  };
}
serve(async (req)=>{
  // const denied = assertAuthorized(req);
  // if (denied) return denied;
  await logToDb(null, null, "INFO", "Starting function execution");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  await logToDb(null, null, "INFO", "Environment variables read", {
    SUPABASE_URL_present: !!SUPABASE_URL,
    SERVICE_KEY_present: !!SERVICE_KEY,
    SERVICE_KEY_masked: SERVICE_KEY ? SERVICE_KEY.substring(0, 4) + '...' : 'N/A'
  });
  if (!SUPABASE_URL || !SERVICE_KEY) {
    await logToDb(null, null, "ERROR", "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response(JSON.stringify({
      ok: false,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  // Service Role で本当に書けるかの自己テスト（sources_raw を使う）
  // const selfUrl = `https://selftest/${Date.now()}`;
  // const { error: selfErr } = await supabase
  //   .from("sources_raw")
  //   .insert({ source: "SELFTEST", url: selfUrl, title: "self", content: "", published_at: new Date().toISOString(), author: "edge" });
  // if (selfErr) {
  //   await logToDb("ERROR", "SELFTEST INSERT FAILED (likely not service_role)", {
  //     code: selfErr.code, message: selfErr.message, details: selfErr.details, hint: selfErr.hint
  //   });
  //   return new Response(JSON.stringify({ ok: false, selfErr }), { status: 500, headers: { "Content-Type": "application/json" } });
  // }
  let okSources = 0, ngSources = 0, okEvents = 0, ngEvents = 0;
  const errors = [];
  // --- Start of ALTERNA-Z.COM scraping logic ---
  try {
    await logToDb(SUPABASE_URL, SERVICE_KEY, "INFO", "Fetching alterna-z.com for projects");
    const res = await fetch("https://alterna-z.com/", {
      headers: {
        "User-Agent": "alterna-lite-monitor/1.0"
      }
    });
    if (!res.ok) {
      throw new Error(`Fetch failed with status ${res.status}`);
    }
    const html = await res.text();
    const nextDataMarker = '<script id="__NUXT_DATA__" type="application/json">';
    const startIndex = html.indexOf(nextDataMarker);
    if (startIndex === -1) {
      throw new Error("__NEXT_DATA__ not found");
    }
    const endIndex = html.indexOf("</script>", startIndex);
    const jsonText = html.slice(startIndex + nextDataMarker.length, endIndex);
    const nextData = JSON.parse(jsonText);
    const projects = nextData?.props?.pageProps?.projects;
    if (projects && Array.isArray(projects)) {
      await logToDb(SUPABASE_URL, SERVICE_KEY, "INFO", `Found ${projects.length} projects in __NEXT_DATA__`);
      const eventsToUpsert = [];
      const published_at = new Date().toISOString();
      for (const p of projects){
        // We are only interested in projects that are currently open for application
        if (p.status === '仮申込受付中') {
          const url = `https://alterna-z.com/projects/${p.id}`;
          const title = p.name;
          const yield_ = parseFloat(p.yield);
          const min_invest_match = p.min_investment.match(/([0-9,]+)/);
          const min_invest = min_invest_match ? parseInt(min_invest_match[1].replace(/,/g, ''), 10) * 10000 : null;
          eventsToUpsert.push({
            url: url,
            event_type: "NEW_LISTING",
            project_name: title,
            asset_type: p.asset_type_name,
            location: p.address,
            min_investment: min_invest,
            expected_yield: isNaN(yield_) ? null : yield_ / 100,
            term_months: p.investment_period,
            subscription_method: "DRAW",
            sentiment: 0,
            published_at: p.application_start_at || published_at
          });
        }
      }
      if (eventsToUpsert.length > 0) {
        await logToDb(SUPABASE_URL, SERVICE_KEY, "INFO", `Upserting ${eventsToUpsert.length} new listing events from alterna-z.com`);
        const { error } = await fetch(`${SUPABASE_URL}/rest/v1/al_tr_events?on_conflict=url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SERVICE_KEY,
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(eventsToUpsert)
        }).then((res)=>res.json());
        if (error) {
          ngEvents += eventsToUpsert.length;
          await logToDb(SUPABASE_URL, SERVICE_KEY, "ERROR", "Failed to batch upsert al_tr_events for alterna-z.com", {
            code: error.code,
            message: error.message
          });
          errors.push({
            feed: "ALTERNA-Z",
            error: "DB upsert failed"
          });
        } else {
          okEvents += eventsToUpsert.length;
        }
      }
    } else {
      // Log the whole data structure if projects are not found, to help debugging
      await logToDb(SUPABASE_URL, SERVICE_KEY, "WARN", "Projects data not found or not an array in __NEXT_DATA__", {
        data_structure: nextData
      });
    }
  } catch (e) {
    errors.push({
      feed: "ALTERNA-Z",
      error: String(e)
    });
    await logToDb(SUPABASE_URL, SERVICE_KEY, "ERROR", "Error processing alterna-z.com", {
      error: String(e)
    });
  }
  // --- End of ALTERNA-Z.COM scraping logic ---
  for (const f of FEEDS){
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), 15000); // 15 second timeout
    try {
      await logToDb(SUPABASE_URL, SERVICE_KEY, "INFO", `Fetching feed: ${f.source}`, {
        url: f.url
      });
      const res = await fetch(f.url, {
        headers: {
          "User-Agent": "alterna-lite-monitor/1.0"
        },
        signal: controller.signal
      });
      if (!res.ok) {
        throw new Error(`Fetch failed with status ${res.status}`);
      }
      const xml = await res.text();
      // XML -> JSオブジェクトへ
      let doc = null;
      try {
        doc = parse(xml);
      } catch (e) {
        await logToDb(SUPABASE_URL, SERVICE_KEY, "ERROR", `XML parse error: ${f.source}`, {
          error: String(e),
          sample: xml.slice(0, 200)
        });
        continue; // to finally block
      }
      const items = parseFeed(doc);
      if (!items.length) {
        await logToDb(SUPABASE_URL, SERVICE_KEY, "INFO", `No items found in ${f.source}`, {
          count: 0
        });
        continue;
      }
      await logToDb(SUPABASE_URL, SERVICE_KEY, "INFO", `Parsed ${items.length} items from ${f.source}`);
      const sourcesToUpsert = [];
      const eventsToUpsert = [];
      const fetched_at = new Date().toISOString();
      for (const it of items){
        const url = pickLink(it);
        if (!url) {
          await logToDb(SUPABASE_URL, SERVICE_KEY, "WARN", "skip (no url)", {
            source: f.source,
            title: it.title ?? ""
          });
          continue;
        }
        const title = it.title ?? "";
        const content = (it.content ?? "").slice(0, 1000);
        const text = `${title} ${content}`;
        // Refactored Filter: Only process items that include the keywords
        if (text.includes("オルタナ") || text.includes("三井物産")) {
          const published_at = new Date(it.published ?? Date.now()).toISOString();
          const author = it.author ?? "";
          // Prepare for batch upsert
          sourcesToUpsert.push({
            source: f.source,
            url,
            title,
            content,
            published_at,
            author,
            fetched_at
          });
          const n = normalize(text);
          if (n) {
            eventsToUpsert.push({
              url,
              event_type: n.event_type,
              project_name: title,
              asset_type: null,
              location: null,
              min_investment: n.min_invest,
              expected_yield: n.expected_yield,
              term_months: null,
              subscription_method: n.subscription_method,
              sentiment: n.sentiment,
              published_at
            });
          }
        }
      }
      // Batch upsert to sources_raw
      if (sourcesToUpsert.length > 0) {
        await logToDb(SUPABASE_URL, SERVICE_KEY, "INFO", `Upserting ${sourcesToUpsert.length} items to sources_raw`);
        const { error: e1 } = await fetch(`${SUPABASE_URL}/rest/v1/sources_raw?on_conflict=url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SERVICE_KEY,
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(sourcesToUpsert)
        }).then((res)=>res.json());
        if (e1) {
          ngSources += sourcesToUpsert.length;
          await logToDb(SUPABASE_URL, SERVICE_KEY, "ERROR", `Failed to batch upsert sources_raw for ${f.source}`, {
            code: e1.code,
            message: e1.message
          });
        } else {
          okSources += sourcesToUpsert.length;
        }
      }
      // Batch upsert to al_tr_events
      if (eventsToUpsert.length > 0) {
        await logToDb(SUPABASE_URL, SERVICE_KEY, "INFO", `Upserting ${eventsToUpsert.length} items to al_tr_events`);
        const { error: e2 } = await fetch(`${SUPABASE_URL}/rest/v1/al_tr_events?on_conflict=url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SERVICE_KEY,
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(eventsToUpsert)
        }).then((res)=>res.json());
        if (e2) {
          ngEvents += eventsToUpsert.length;
          await logToDb(SUPABASE_URL, SERVICE_KEY, "ERROR", `Failed to batch upsert al_tr_events for ${f.source}`, {
            code: e2.code,
            message: e2.message
          });
        } else {
          okEvents += eventsToUpsert.length;
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        errors.push({
          feed: f.source,
          error: "Timeout"
        });
        await logToDb(SUPABASE_URL, SERVICE_KEY, "ERROR", `Fetch timed out for feed: ${f.source}`, {
          error: String(e)
        });
      } else {
        errors.push({
          feed: f.source,
          error: String(e)
        });
        await logToDb(SUPABASE_URL, SERVICE_KEY, "ERROR", `Error processing feed: ${f.source}`, {
          error: String(e)
        });
      }
    } finally{
      clearTimeout(timeoutId);
      await new Promise((r)=>setTimeout(r, 400));
    }
  }
  await logToDb(SUPABASE_URL, SERVICE_KEY, errors.length ? "WARN" : "INFO", "run summary", {
    okSources,
    ngSources,
    okEvents,
    ngEvents,
    errors
  });
  return new Response(JSON.stringify({
    okSources,
    ngSources,
    okEvents,
    ngEvents,
    errors
  }, null, 2), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
