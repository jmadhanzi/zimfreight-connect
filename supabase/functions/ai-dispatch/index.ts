// ZimFreight AI Dispatch — streams Claude (Anthropic) responses as SSE
// deno-lint-ignore-file no-explicit-any

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are ZimFreight AI Dispatcher — the most knowledgeable freight dispatch assistant in Zimbabwe. You work for ZimFreight, Zimbabwe's premier load board.

CURRENT MARKET DATA:
- Active loads today: 847
- Average rate: $2.84/km domestic, $3.50–4.50/km cross-border
- ZWL/USD: 3,850 (use for ZWL conversions)
- Beit Bridge wait: ~2.5h (avoid 8AM–2PM)
- Chirundu wait: ~45 minutes
- Forbes/Mutare wait: ~30 minutes

KEY ROUTES AND RATES:
Harare → Bulawayo    A5  440km  $2.73/km  ($1,100–$1,450)
Harare → Mutare      A3  263km  $3.04/km  ($750–$900)
Beit Bridge → Harare A4  580km  $3.62/km  ($1,900–$2,400)
Harare → Chirundu    A1  340km  $3.09/km  ($950–$1,200)
Bulawayo → Vic Falls A8  440km  $2.91/km  ($1,100–$1,500)
Harare → JHB     A4/N1 1220km  $3.69/km  ($4,000–$5,200)

BEIT BRIDGE — ZIMRA DOCS REQUIRED:
Bill of Lading, ZIMRA Form 32, Commercial Invoice, Road Motor Transportation Certificate, Third Party Insurance (SA-valid), Packing List.

PAYMENT IN ZIMBABWE:
EcoCash (*151*4*...*amount#), InnBucks, OneMoney, USD cash, EFT (FBC, CABS, ZB Bank).
Cross-border payments mostly in USD.

Be conversational. Use Zimbabwean English. Mention specific towns and roads. Format with bold headings (markdown **bold**) and bullet points. Keep responses concise but complete.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "Anthropic key not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anthropicMessages = messages
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: any) => ({ role: m.role, content: m.content }));

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        stream: true,
        messages: anthropicMessages,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text();
      console.error("Anthropic error:", upstream.status, t);
      return new Response(JSON.stringify({ error: `AI error (${upstream.status})` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Translate Anthropic SSE → simple "data: {text}" SSE stream of token deltas
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buf = "";

    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
          return;
        }
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            const evt = JSON.parse(json);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              const text = evt.delta.text || "";
              if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          } catch { /* ignore partial */ }
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("ai-dispatch error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});