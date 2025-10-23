// /api/thrawn-preview.js
export default async function handler(req, res) {
  try {
    const { ticket_url = "", customer_message = "", instructions = "" } = req.query;

    // Call your Glean agent (Project Thrawn)
    const THRAWN_AGENT_URL = "https://app.glean.com/chat/agents/199590ad4d6a4e4587967a09f8d483e6/run";
    const THRAWN_API_KEY = process.env.THRawn_API_KEY || process.env.THRAWN_API_KEY; // support either casing

    const body = {
      ticket_url,
      instructions: instructions || "Draft a reply for this Intercom thread using Apollo style.",
      customer_message
    };

    const resp = await fetch(THRAWN_AGENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${THRAWN_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      res.status(500).send(`<pre>Thrawn call failed:\n${txt}</pre>`);
      return;
    }

    const { final_email_draft = "", quick_summary = "" } = await resp.json();

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<!doctype html><html><head>
<meta charset="utf-8"><title>Thrawn Draft Preview</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:24px;color:#e5e7eb;background:#111827}
.wrap{max-width:900px;margin:0 auto}
h1{font-size:22px;margin:0 0 8px}
.meta{color:#9ca3af;font-size:13px;margin-bottom:16px}
textarea{width:100%;min-height:340px;padding:12px;border-radius:12px;border:1px solid #374151;background:#0b1220;color:#e5e7eb}
.row{display:flex;gap:8px;margin:12px 0 20px}
button,a.btn{padding:10px 14px;border-radius:10px;border:1px solid #374151;background:#1f2937;color:#e5e7eb;text-decoration:none}
button:hover,a.btn:hover{background:#111827}
.summary{white-space:pre-wrap;color:#9ca3af;font-size:13px}
.hint{margin-top:14px;color:#9ca3af;font-size:12px}
</style></head><body><div class="wrap">
<h1>Thrawn Draft Preview</h1>
<div class="meta">Ticket: <a class="btn" href="${ticket_url}" target="_blank" rel="noopener">Open Intercom Thread</a></div>
<textarea id="draft">${final_email_draft.replace(/</g, "&lt;")}</textarea>
<div class="row">
  <button onclick="copyDraft()">Copy Draft</button>
  <button onclick="window.close()">Close</button>
</div>
${quick_summary ? `<div class="summary"><b>Summary</b>: ${quick_summary.replace(/</g, "&lt;")}</div>` : ""}
<div class="hint">Preview only. Nothing was posted to the customer.</div>
</div>
<script>
function copyDraft(){const el=document.getElementById('draft');el.select();document.execCommand('copy');}
</script>
</body></html>`);
  } catch (e) {
    res.status(500).send(`<pre>${e.message || "Unknown error"}</pre>`);
  }
}
