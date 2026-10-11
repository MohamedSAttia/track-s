// Track Ford GRC — Vercel Routing Middleware (no dependencies)
// The platform is open to everyone; only AI crawlers are blocked.
export const config = { matcher: ['/((?!robots\\.txt|favicon\\.ico).*)'] };

const AI_BOTS = /(GPTBot|ChatGPT|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|Claude-User|CCBot|Google-Extended|PerplexityBot|Perplexity-User|Bytespider|Amazonbot|Applebot-Extended|cohere-ai|Diffbot|YouBot|meta-externalagent|FacebookBot|Timpibot|Omgili|ImagesiftBot|PetalBot|DuckAssistBot|MistralAI|AI2Bot)/i;

const PAGE = (title, msg) => `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noai,noimageai"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0A1B3D;color:#fff;font-family:Tahoma,Arial,sans-serif;padding:16px}
.c{max-width:480px;text-align:center;border:2px solid #C9973B;border-radius:18px;padding:28px;background:#06122B}
h1{color:#E2B85A;font-size:24px;margin:0 0 10px}p{color:#D6DCE8;line-height:1.8;margin:0 0 8px}small{color:#9AA3B4}</style></head>
<body><div class="c"><h1>${title}</h1><p>${msg}</p><p>info@trackford.com · trackford.sa</p><small>تحت إشراف شركة تراكفورد العالمية · جميع الحقوق محفوظة لمحمد عطية</small></div></body></html>`;

export default async function middleware(req) {
  const ua = req.headers.get('user-agent') || '';
  if (AI_BOTS.test(ua)) {
    return new Response(PAGE('الوصول غير مسموح', 'هذا المحتوى محمي ولا يُسمح لأدوات الذكاء الاصطناعي أو الزواحف بالوصول إليه.'),
      { status: 403, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow, noai, noimageai' } });
  }
  // everyone else: continue to the page (no time limit, no cookies)
}
