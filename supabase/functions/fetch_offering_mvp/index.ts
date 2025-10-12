import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(() => new Response(
  JSON.stringify({
    ok: false,
    code: "GONE",
    message: "This function has been deprecated and removed.",
  }),
  { status: 410, headers: { "Content-Type": "application/json" } }
));
