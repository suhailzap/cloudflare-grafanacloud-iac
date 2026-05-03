const HTML_UI = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Worker 1 — Producer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f5f5f5; color: #333; padding: 24px; }
  h1 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #888; margin-bottom: 24px; }
  .card { background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
  .card h2 { font-size: 15px; font-weight: 600; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
  label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #555; }
  input, select, textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; outline: none; transition: border .2s; }
  input:focus, select:focus, textarea:focus { border-color: #6366f1; }
  textarea { resize: vertical; min-height: 80px; font-family: monospace; font-size: 13px; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background .2s; }
  .btn-primary { background: #6366f1; color: #fff; }
  .btn-primary:hover { background: #4f46e5; }
  .btn-secondary { background: #f0f0f0; color: #333; }
  .btn-secondary:hover { background: #e0e0e0; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-group { margin-bottom: 14px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .badge-success { background: #d1fae5; color: #065f46; }
  .badge-error { background: #fee2e2; color: #991b1b; }
  .badge-info { background: #e0e7ff; color: #3730a3; }
  .response { background: #1e1e2e; color: #cdd6f4; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 12px; overflow-x: auto; white-space: pre; margin-top: 12px; max-height: 260px; overflow-y: auto; display: none; }
  .response.show { display: block; }
  .tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid #e5e5e5; }
  .tab { padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; color: #888; transition: all .2s; }
  .tab.active { color: #6366f1; border-bottom-color: #6366f1; }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
  .batch-item { background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 12px; margin-bottom: 10px; position: relative; }
  .remove-btn { position: absolute; top: 8px; right: 8px; background: none; border: none; color: #999; cursor: pointer; font-size: 16px; line-height: 1; }
  .remove-btn:hover { color: #e53e3e; }
  .add-item-btn { width: 100%; padding: 8px; border: 1px dashed #ccc; border-radius: 6px; background: none; color: #888; cursor: pointer; font-size: 13px; transition: all .2s; }
  .add-item-btn:hover { border-color: #6366f1; color: #6366f1; }
  .status-bar { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 13px; }
  .spinner { width: 14px; height: 14px; border: 2px solid #e5e5e5; border-top-color: #6366f1; border-radius: 50%; animation: spin .6s linear infinite; display: none; }
  .spinner.show { display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .nav-links { display: flex; gap: 8px; }
  .nav-link { padding: 6px 12px; border-radius: 6px; font-size: 13px; text-decoration: none; color: #555; border: 1px solid #e5e5e5; transition: all .2s; }
  .nav-link:hover { background: #f0f0f0; }
  .nav-link.active { background: #6366f1; color: #fff; border-color: #6366f1; }
</style>
</head>
<body>

<div class="nav">
  <div>
    <h1>⚡ Worker 1 — Producer</h1>
    <div class="subtitle">bitter-flower-57f0 · Cloudflare Workers</div>
  </div>
  <div class="nav-links">
    <a class="nav-link active" href="/">Producer</a>
    <a class="nav-link" href="https://bitter2-flower2-57f0-2.fayizaai7.workers.dev" target="_blank">Consumer →</a>
  </div>
</div>

<div class="tabs">
  <div class="tab active" onclick="switchTab('single')">Single Job</div>
  <div class="tab" onclick="switchTab('batch')">Batch Jobs</div>
  <div class="tab" onclick="switchTab('notify')">Notification</div>
</div>

<!-- Single Job -->
<div id="tab-single" class="tab-content active">
  <div class="card">
    <h2>Send Single Job → worker-jobs-queue</h2>
    <div class="row">
      <div class="form-group">
        <label>Job Type</label>
        <select id="single-type">
          <option value="email">email</option>
          <option value="sms">sms</option>
          <option value="push">push</option>
          <option value="webhook">webhook</option>
          <option value="custom">custom</option>
        </select>
      </div>
      <div class="form-group">
        <label>Custom Type (if custom selected)</label>
        <input type="text" id="single-custom-type" placeholder="e.g. report-generation"/>
      </div>
    </div>
    <div class="form-group">
      <label>Payload (JSON)</label>
      <textarea id="single-payload">{"to": "test@example.com", "subject": "Hello"}</textarea>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <button class="btn btn-primary" onclick="sendSingle()">Send Job</button>
      <button class="btn btn-secondary" onclick="clearResponse('single')">Clear</button>
      <div class="spinner" id="single-spinner"></div>
    </div>
    <div class="status-bar" id="single-status"></div>
    <div class="response" id="single-response"></div>
  </div>
</div>

<!-- Batch Jobs -->
<div id="tab-batch" class="tab-content">
  <div class="card">
    <h2>Send Batch Jobs → worker-jobs-queue</h2>
    <div id="batch-items">
      <div class="batch-item" id="batch-item-0">
        <button class="remove-btn" onclick="removeBatchItem(0)">×</button>
        <div class="row">
          <div class="form-group">
            <label>Type</label>
            <select class="batch-type">
              <option value="email">email</option>
              <option value="sms">sms</option>
              <option value="push">push</option>
              <option value="webhook">webhook</option>
            </select>
          </div>
          <div class="form-group">
            <label>Payload (JSON)</label>
            <input type="text" class="batch-payload" value='{"to": "user@example.com"}'/>
          </div>
        </div>
      </div>
    </div>
    <button class="add-item-btn" onclick="addBatchItem()">+ Add Item</button>
    <div style="display:flex;gap:8px;align-items:center;margin-top:14px">
      <button class="btn btn-primary" onclick="sendBatch()">Send Batch</button>
      <button class="btn btn-secondary" onclick="clearResponse('batch')">Clear</button>
      <div class="spinner" id="batch-spinner"></div>
    </div>
    <div class="status-bar" id="batch-status"></div>
    <div class="response" id="batch-response"></div>
  </div>
</div>

<!-- Notification -->
<div id="tab-notify" class="tab-content">
  <div class="card">
    <h2>Send Notification → worker-notifications-queue</h2>
    <div class="form-group">
      <label>Message</label>
      <input type="text" id="notify-message" placeholder="e.g. User signed up" value="User signed up"/>
    </div>
    <div class="form-group">
      <label>Priority</label>
      <select id="notify-priority">
        <option value="low">low</option>
        <option value="normal" selected>normal</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <button class="btn btn-primary" onclick="sendNotify()">Send Notification</button>
      <button class="btn btn-secondary" onclick="clearResponse('notify')">Clear</button>
      <div class="spinner" id="notify-spinner"></div>
    </div>
    <div class="status-bar" id="notify-status"></div>
    <div class="response" id="notify-response"></div>
  </div>
</div>

<script>
let batchCount = 1;

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

function showSpinner(id, show) {
  document.getElementById(id + '-spinner').classList.toggle('show', show);
}

function showStatus(id, ok, text) {
  const el = document.getElementById(id + '-status');
  el.innerHTML = '<span class="badge ' + (ok ? 'badge-success' : 'badge-error') + '">' + (ok ? '✓ Success' : '✗ Error') + '</span> ' + text;
}

function showResponse(id, data) {
  const el = document.getElementById(id + '-response');
  el.textContent = JSON.stringify(data, null, 2);
  el.classList.add('show');
}

function clearResponse(id) {
  document.getElementById(id + '-response').classList.remove('show');
  document.getElementById(id + '-status').innerHTML = '';
}

async function sendSingle() {
  const typeEl = document.getElementById('single-type');
  const type = typeEl.value === 'custom'
    ? document.getElementById('single-custom-type').value.trim()
    : typeEl.value;

  if (!type) {
    showStatus('single', false, 'Type is required');
    return;
  }

  let payload;
  try {
    payload = JSON.parse(document.getElementById('single-payload').value);
  } catch (e) {
    showStatus('single', false, 'Invalid JSON payload');
    return;
  }

  showSpinner('single', true);
  try {
    const res = await fetch('/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    const data = await res.json();
    showSpinner('single', false);
    showStatus('single', res.ok, res.ok ? 'Job enqueued — requestId: ' + data.requestId : data.error);
    showResponse('single', data);
  } catch (err) {
    showSpinner('single', false);
    showStatus('single', false, err.message);
  }
}

function addBatchItem() {
  const id = batchCount++;
  const div = document.createElement('div');
  div.className = 'batch-item';
  div.id = 'batch-item-' + id;
  div.innerHTML = \`
    <button class="remove-btn" onclick="removeBatchItem(\${id})">×</button>
    <div class="row">
      <div class="form-group">
        <label>Type</label>
        <select class="batch-type">
          <option value="email">email</option>
          <option value="sms">sms</option>
          <option value="push">push</option>
          <option value="webhook">webhook</option>
        </select>
      </div>
      <div class="form-group">
        <label>Payload (JSON)</label>
        <input type="text" class="batch-payload" value='{"to": "user@example.com"}'/>
      </div>
    </div>
  \`;
  document.getElementById('batch-items').appendChild(div);
}

function removeBatchItem(id) {
  const el = document.getElementById('batch-item-' + id);
  if (el) el.remove();
}

async function sendBatch() {
  const types = document.querySelectorAll('.batch-type');
  const payloads = document.querySelectorAll('.batch-payload');
  const items = [];

  for (let i = 0; i < types.length; i++) {
    let payload;
    try {
      payload = JSON.parse(payloads[i].value);
    } catch (e) {
      showStatus('batch', false, 'Invalid JSON in item ' + (i + 1));
      return;
    }
    items.push({ type: types[i].value, payload });
  }

  if (items.length === 0) {
    showStatus('batch', false, 'Add at least one item');
    return;
  }

  showSpinner('batch', true);
  try {
    const res = await fetch('/enqueue/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    showSpinner('batch', false);
    showStatus('batch', res.ok, res.ok ? data.count + ' jobs enqueued' : data.error);
    showResponse('batch', data);
  } catch (err) {
    showSpinner('batch', false);
    showStatus('batch', false, err.message);
  }
}

async function sendNotify() {
  const message = document.getElementById('notify-message').value.trim();
  const priority = document.getElementById('notify-priority').value;

  if (!message) {
    showStatus('notify', false, 'Message is required');
    return;
  }

  showSpinner('notify', true);
  try {
    const res = await fetch('/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, priority }),
    });
    const data = await res.json();
    showSpinner('notify', false);
    showStatus('notify', res.ok, res.ok ? 'Notification enqueued — requestId: ' + data.requestId : data.error);
    showResponse('notify', data);
  } catch (err) {
    showSpinner('notify', false);
    showStatus('notify', false, err.message);
  }
}
</script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.info({
      requestId,
      level: "info",
      message: "Worker 1 - Producer received request",
      method: request.method,
      path: url.pathname,
      country: request.cf?.country ?? "unknown",
    });

    try {

      // Serve UI
      if (url.pathname === "/" && request.method === "GET") {
        return new Response(HTML_UI, {
          headers: { "Content-Type": "text/html;charset=UTF-8" },
        });
      }

      // Health check
      if (url.pathname === "/health") {
        console.info({ requestId, level: "info", message: "Health check OK" });
        return Response.json({
          status: "healthy",
          worker: "worker-1-producer",
          requestId,
          timestamp: new Date().toISOString(),
          queues: ["worker-jobs-queue", "worker-notifications-queue"],
        });
      }

      // Enqueue a single job
      if (url.pathname === "/enqueue" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch (e) {
          console.warn({ requestId, level: "warn", message: "Invalid JSON body" });
          return Response.json({ error: "Invalid JSON body", requestId }, { status: 400 });
        }

        if (!body.type) {
          console.warn({ requestId, level: "warn", message: "Missing required field: type" });
          return Response.json({ error: "Missing required field: type", requestId }, { status: 400 });
        }

        const message = {
          requestId,
          timestamp: new Date().toISOString(),
          type: body.type,
          payload: body.payload ?? {},
          country: request.cf?.country ?? "unknown",
        };

        await env.JOBS_QUEUE.send(message);

        console.info({
          requestId,
          level: "info",
          message: "Job enqueued to worker-jobs-queue",
          type: message.type,
          payload: message.payload,
          country: message.country,
          timestamp: message.timestamp,
        });

        return Response.json({
          worker: "worker-1-producer",
          requestId,
          message: "Job enqueued successfully",
          job: message,
          timestamp: new Date().toISOString(),
        });
      }

      // Enqueue batch of jobs
      if (url.pathname === "/enqueue/batch" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch (e) {
          console.warn({ requestId, level: "warn", message: "Invalid JSON body for batch" });
          return Response.json({ error: "Invalid JSON body", requestId }, { status: 400 });
        }

        const items = body.items ?? [];
        if (items.length === 0) {
          console.warn({ requestId, level: "warn", message: "Empty batch enqueue attempted" });
          return Response.json({ error: "No items provided", requestId }, { status: 400 });
        }

        const messages = items.map((item) => ({
          body: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: item.type ?? "batch",
            payload: item.payload ?? item,
            country: request.cf?.country ?? "unknown",
          },
        }));

        await env.JOBS_QUEUE.sendBatch(messages);

        console.info({
          requestId,
          level: "info",
          message: "Batch enqueued to worker-jobs-queue",
          count: messages.length,
          items: messages.map(m => ({
            type: m.body.type,
            payload: m.body.payload,
            country: m.body.country,
          })),
        });

        return Response.json({
          worker: "worker-1-producer",
          requestId,
          message: "Batch enqueued successfully",
          count: messages.length,
          timestamp: new Date().toISOString(),
        });
      }

      // Send notification
      if (url.pathname === "/notify" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch (e) {
          console.warn({ requestId, level: "warn", message: "Invalid JSON body for notify" });
          return Response.json({ error: "Invalid JSON body", requestId }, { status: 400 });
        }

        const notification = {
          requestId,
          timestamp: new Date().toISOString(),
          type: "notification",
          payload: {
            message: body.message ?? "No message",
            priority: body.priority ?? "normal",
          },
          country: request.cf?.country ?? "unknown",
        };

        await env.NOTIFICATIONS_QUEUE.send(notification);

        console.info({
          requestId,
          level: "info",
          message: "Notification enqueued to worker-notifications-queue",
          payload: notification.payload,
          country: notification.country,
          timestamp: notification.timestamp,
        });

        return Response.json({
          worker: "worker-1-producer",
          requestId,
          message: "Notification enqueued successfully",
          notification,
          timestamp: new Date().toISOString(),
        });
      }

      // Wrong method guard
      if (["/enqueue", "/enqueue/batch", "/notify"].includes(url.pathname)) {
        console.warn({
          requestId,
          level: "warn",
          message: "Wrong HTTP method",
          method: request.method,
          path: url.pathname,
        });
        return Response.json({ error: "Method not allowed, use POST", requestId }, { status: 405 });
      }

      // Unknown route
      console.warn({ requestId, level: "warn", message: "Unknown route", path: url.pathname });

      return Response.json({
        worker: "worker-1-producer",
        requestId,
        message: "Producer Worker is running",
        routes: {
          "GET  /":              "Producer UI",
          "POST /enqueue":       "Send single job to queue",
          "POST /enqueue/batch": "Send batch of jobs to queue",
          "POST /notify":        "Send notification to queue",
          "GET  /health":        "Health check",
        },
        timestamp: new Date().toISOString(),
      });

    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.error({
        requestId,
        level: "error",
        message: "Unhandled exception in Worker 1",
        error: err.message,
        stack: err.stack,
        elapsed,
      });
      return Response.json({ error: "Internal Server Error", requestId }, { status: 500 });
    }
  },
};