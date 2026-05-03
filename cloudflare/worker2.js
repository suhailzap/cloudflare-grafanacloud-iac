const HTML_UI = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Worker 2 — Consumer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f5f5f5; color: #333; padding: 24px; }
  h1 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #888; margin-bottom: 24px; }
  .card { background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
  .card h2 { font-size: 15px; font-weight: 600; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background .2s; }
  .btn-primary { background: #6366f1; color: #fff; }
  .btn-primary:hover { background: #4f46e5; }
  .btn-danger { background: #fee2e2; color: #991b1b; }
  .btn-danger:hover { background: #fecaca; }
  .btn-secondary { background: #f0f0f0; color: #333; }
  .btn-secondary:hover { background: #e0e0e0; }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .badge-success { background: #d1fae5; color: #065f46; }
  .badge-error { background: #fee2e2; color: #991b1b; }
  .badge-warn { background: #fef3c7; color: #92400e; }
  .badge-info { background: #e0e7ff; color: #3730a3; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
  .stat { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 14px; text-align: center; }
  .stat-value { font-size: 24px; font-weight: 700; color: #6366f1; }
  .stat-label { font-size: 12px; color: #888; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 12px; background: #f9f9f9; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555; font-size: 12px; }
  td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafafa; }
  .payload-cell { font-family: monospace; font-size: 11px; color: #555; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .spinner { width: 14px; height: 14px; border: 2px solid #e5e5e5; border-top-color: #6366f1; border-radius: 50%; animation: spin .6s linear infinite; display: none; }
  .spinner.show { display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty { text-align: center; padding: 40px; color: #aaa; font-size: 14px; }
  .toolbar { display: flex; align-items: center; gap: 8px; }
  .alert { padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 12px; display: none; }
  .alert.show { display: block; }
  .alert-success { background: #d1fae5; color: #065f46; }
  .alert-error { background: #fee2e2; color: #991b1b; }
  .nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .nav-links { display: flex; gap: 8px; }
  .nav-link { padding: 6px 12px; border-radius: 6px; font-size: 13px; text-decoration: none; color: #555; border: 1px solid #e5e5e5; transition: all .2s; }
  .nav-link:hover { background: #f0f0f0; }
  .nav-link.active { background: #0d9488; color: #fff; border-color: #0d9488; }
  .tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid #e5e5e5; }
  .tab { padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; color: #888; }
  .tab.active { color: #0d9488; border-bottom-color: #0d9488; }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
  .country-flag { font-size: 16px; }
</style>
</head>
<body>

<div class="nav">
  <div>
    <h1>🔄 Worker 2 — Consumer</h1>
    <div class="subtitle">bitter2-flower2-57f0-2 · Cloudflare Workers + D1</div>
  </div>
  <div class="nav-links">
    <a class="nav-link" href="https://bitter-flower-57f0.fayizaai7.workers.dev" target="_blank">← Producer</a>
    <a class="nav-link active" href="/">Consumer</a>
  </div>
</div>

<div id="alert" class="alert"></div>

<!-- Stats -->
<div class="stats">
  <div class="stat">
    <div class="stat-value" id="stat-total">—</div>
    <div class="stat-label">Total Jobs</div>
  </div>
  <div class="stat">
    <div class="stat-value" style="color:#10b981" id="stat-processed">—</div>
    <div class="stat-label">Processed</div>
  </div>
  <div class="stat">
    <div class="stat-value" style="color:#ef4444" id="stat-failed">—</div>
    <div class="stat-label">Failed</div>
  </div>
  <div class="stat">
    <div class="stat-value" style="color:#f59e0b" id="stat-queues">—</div>
    <div class="stat-label">Queues Active</div>
  </div>
</div>

<div class="tabs">
  <div class="tab active" onclick="switchTab('jobs')">Processed Jobs</div>
  <div class="tab" onclick="switchTab('failed')">Failed Jobs</div>
  <div class="tab" onclick="switchTab('setup')">Setup / Manage</div>
</div>

<!-- Processed Jobs -->
<div id="tab-jobs" class="tab-content active">
  <div class="card">
    <h2>
      Processed Jobs
      <div class="toolbar">
        <div class="spinner" id="jobs-spinner"></div>
        <button class="btn btn-secondary btn-sm" onclick="loadJobs()">↻ Refresh</button>
      </div>
    </h2>
    <div id="jobs-table">
      <div class="empty">Loading...</div>
    </div>
  </div>
</div>

<!-- Failed Jobs -->
<div id="tab-failed" class="tab-content">
  <div class="card">
    <h2>
      Failed Jobs
      <div class="toolbar">
        <div class="spinner" id="failed-spinner"></div>
        <button class="btn btn-secondary btn-sm" onclick="loadFailed()">↻ Refresh</button>
      </div>
    </h2>
    <div id="failed-table">
      <div class="empty">Loading...</div>
    </div>
  </div>
</div>

<!-- Setup -->
<div id="tab-setup" class="tab-content">
  <div class="card">
    <h2>Database Management</h2>
    <div style="display:flex;flex-direction:column;gap:12px">

      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#f9f9f9;border-radius:8px">
        <div>
          <div style="font-size:14px;font-weight:500">Setup Tables</div>
          <div style="font-size:12px;color:#888;margin-top:2px">Create queue_jobs and failed_jobs tables (safe to run multiple times)</div>
        </div>
        <button class="btn btn-primary" onclick="runAction('/setup', 'Setup complete')">Run Setup</button>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#f9f9f9;border-radius:8px">
        <div>
          <div style="font-size:14px;font-weight:500">Migrate Tables</div>
          <div style="font-size:12px;color:#888;margin-top:2px">Add missing columns to existing tables</div>
        </div>
        <button class="btn btn-secondary" onclick="runAction('/migrate', 'Migration complete')">Run Migration</button>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#fff5f5;border-radius:8px;border:1px solid #fee2e2">
        <div>
          <div style="font-size:14px;font-weight:500;color:#991b1b">Clear All Jobs</div>
          <div style="font-size:12px;color:#888;margin-top:2px">Delete all records from queue_jobs and failed_jobs</div>
        </div>
        <button class="btn btn-danger" onclick="confirmClear()">Clear All</button>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#fff5f5;border-radius:8px;border:1px solid #fee2e2">
        <div>
          <div style="font-size:14px;font-weight:500;color:#991b1b">Reset Tables</div>
          <div style="font-size:12px;color:#888;margin-top:2px">Drop and recreate all tables — all data will be lost</div>
        </div>
        <button class="btn btn-danger" onclick="confirmReset()">Reset</button>
      </div>

    </div>
  </div>
</div>

<script>
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'jobs') loadJobs();
  if (tab === 'failed') loadFailed();
}

function showAlert(msg, type) {
  const el = document.getElementById('alert');
  el.textContent = msg;
  el.className = 'alert show alert-' + type;
  setTimeout(() => el.classList.remove('show'), 4000);
}

function queueBadge(queue) {
  if (!queue) return '<span class="badge" style="background:#f0f0f0;color:#888">—</span>';
  const colors = {
    'worker-jobs-queue': 'badge-info',
    'worker-jobs-dlq': 'badge-error',
    'worker-notifications-queue': 'badge-warn',
  };
  return '<span class="badge ' + (colors[queue] || 'badge-info') + '">' + queue + '</span>';
}

function countryFlag(country) {
  if (!country || country === 'unknown') return '—';
  return '<span title="' + country + '">' + country + '</span>';
}

async function loadJobs() {
  document.getElementById('jobs-spinner').classList.add('show');
  try {
    const res = await fetch('/jobs');
    const data = await res.json();
    document.getElementById('jobs-spinner').classList.remove('show');

    document.getElementById('stat-total').textContent = data.count ?? 0;
    document.getElementById('stat-processed').textContent = data.count ?? 0;

    if (!data.data || data.data.length === 0) {
      document.getElementById('jobs-table').innerHTML = '<div class="empty">No processed jobs yet. Send some from the Producer.</div>';
      return;
    }

    const queues = new Set(data.data.map(r => r.queue).filter(Boolean));
    document.getElementById('stat-queues').textContent = queues.size;

    let html = '<table><thead><tr><th>#</th><th>Type</th><th>Queue</th><th>Payload</th><th>Country</th><th>Processed At</th></tr></thead><tbody>';
    data.data.forEach(row => {
      let payloadStr = row.payload ?? '{}';
      try { payloadStr = JSON.stringify(JSON.parse(row.payload), null, 0); } catch(e) {}
      html += '<tr>';
      html += '<td style="color:#aaa;font-size:11px">' + row.id + '</td>';
      html += '<td><span class="badge badge-success">' + (row.type ?? '—') + '</span></td>';
      html += '<td>' + queueBadge(row.queue) + '</td>';
      html += '<td class="payload-cell" title="' + payloadStr.replace(/"/g,'&quot;') + '">' + payloadStr + '</td>';
      html += '<td>' + countryFlag(row.country) + '</td>';
      html += '<td style="color:#888;font-size:12px">' + (row.processed_at ?? '—') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('jobs-table').innerHTML = html;

  } catch (err) {
    document.getElementById('jobs-spinner').classList.remove('show');
    document.getElementById('jobs-table').innerHTML = '<div class="empty">Error loading jobs: ' + err.message + '</div>';
  }
}

async function loadFailed() {
  document.getElementById('failed-spinner').classList.add('show');
  try {
    const res = await fetch('/failed');
    const data = await res.json();
    document.getElementById('failed-spinner').classList.remove('show');
    document.getElementById('stat-failed').textContent = data.count ?? 0;

    if (!data.data || data.data.length === 0) {
      document.getElementById('failed-table').innerHTML = '<div class="empty">No failed jobs. Everything is working correctly.</div>';
      return;
    }

    let html = '<table><thead><tr><th>#</th><th>Type</th><th>Queue</th><th>Payload</th><th>Error</th><th>Failed At</th></tr></thead><tbody>';
    data.data.forEach(row => {
      let payloadStr = row.payload ?? '{}';
      try { payloadStr = JSON.stringify(JSON.parse(row.payload), null, 0); } catch(e) {}
      html += '<tr>';
      html += '<td style="color:#aaa;font-size:11px">' + row.id + '</td>';
      html += '<td><span class="badge badge-error">' + (row.type ?? '—') + '</span></td>';
      html += '<td>' + queueBadge(row.queue) + '</td>';
      html += '<td class="payload-cell">' + payloadStr + '</td>';
      html += '<td style="color:#ef4444;font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + (row.error ?? '') + '">' + (row.error ?? '—') + '</td>';
      html += '<td style="color:#888;font-size:12px">' + (row.failed_at ?? '—') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('failed-table').innerHTML = html;

  } catch (err) {
    document.getElementById('failed-spinner').classList.remove('show');
    document.getElementById('failed-table').innerHTML = '<div class="empty">Error loading failed jobs: ' + err.message + '</div>';
  }
}

async function runAction(path, successMsg) {
  try {
    const res = await fetch(path);
    const data = await res.json();
    showAlert(successMsg + ': ' + JSON.stringify(data.message ?? data), 'success');
    loadJobs();
  } catch (err) {
    showAlert('Error: ' + err.message, 'error');
  }
}

async function confirmClear() {
  if (!confirm('Delete all jobs from queue_jobs and failed_jobs?')) return;
  try {
    const res = await fetch('/clear', { method: 'DELETE' });
    const data = await res.json();
    showAlert('All jobs cleared', 'success');
    loadJobs();
    loadFailed();
  } catch (err) {
    showAlert('Error: ' + err.message, 'error');
  }
}

async function confirmReset() {
  if (!confirm('This will DROP and recreate all tables. All data will be lost. Continue?')) return;
  try {
    const res = await fetch('/reset');
    const data = await res.json();
    showAlert('Tables reset complete', 'success');
    loadJobs();
  } catch (err) {
    showAlert('Error: ' + err.message, 'error');
  }
}

// Auto load on start
loadJobs();

// Auto refresh every 10 seconds
setInterval(loadJobs, 10000);
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
      message: "Worker 2 - Consumer HTTP request",
      method: request.method,
      path: url.pathname,
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
          worker: "worker-2-consumer",
          requestId,
          timestamp: new Date().toISOString(),
        });
      }

      // Setup D1 tables
      if (url.pathname === "/setup") {
        try {
          await env.MY_BINDING.prepare(
            "CREATE TABLE IF NOT EXISTS queue_jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL, type TEXT NOT NULL, payload TEXT, status TEXT DEFAULT 'processed', queue TEXT, country TEXT, processed_at TEXT DEFAULT (datetime('now')))"
          ).run();
          await env.MY_BINDING.prepare(
            "CREATE TABLE IF NOT EXISTS failed_jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL, type TEXT NOT NULL, payload TEXT, error TEXT, queue TEXT, failed_at TEXT DEFAULT (datetime('now')))"
          ).run();
          console.info({ requestId, level: "info", message: "D1 tables setup complete" });
          return Response.json({ worker: "worker-2-consumer", requestId, message: "Database setup complete", tables: ["queue_jobs", "failed_jobs"] });
        } catch (dbErr) {
          console.error({ requestId, level: "error", message: "D1 setup failed", error: dbErr.message });
          return Response.json({ error: "Database setup failed", detail: dbErr.message, requestId }, { status: 500 });
        }
      }

      // Migrate
      if (url.pathname === "/migrate") {
        try {
          await env.MY_BINDING.prepare("ALTER TABLE queue_jobs ADD COLUMN queue TEXT").run().catch(() => {});
          await env.MY_BINDING.prepare("ALTER TABLE queue_jobs ADD COLUMN country TEXT").run().catch(() => {});
          await env.MY_BINDING.prepare("ALTER TABLE failed_jobs ADD COLUMN queue TEXT").run().catch(() => {});
          console.info({ requestId, level: "info", message: "Migration complete" });
          return Response.json({ worker: "worker-2-consumer", requestId, message: "Migration complete", added_columns: ["queue_jobs.queue", "queue_jobs.country", "failed_jobs.queue"] });
        } catch (err) {
          console.error({ requestId, level: "error", message: "Migration failed", error: err.message });
          return Response.json({ error: "Migration failed", detail: err.message, requestId }, { status: 500 });
        }
      }

      // Reset
      if (url.pathname === "/reset") {
        try {
          await env.MY_BINDING.prepare("DROP TABLE IF EXISTS queue_jobs").run();
          await env.MY_BINDING.prepare("DROP TABLE IF EXISTS failed_jobs").run();
          await env.MY_BINDING.prepare("CREATE TABLE IF NOT EXISTS queue_jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL, type TEXT NOT NULL, payload TEXT, status TEXT DEFAULT 'processed', queue TEXT, country TEXT, processed_at TEXT DEFAULT (datetime('now')))").run();
          await env.MY_BINDING.prepare("CREATE TABLE IF NOT EXISTS failed_jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL, type TEXT NOT NULL, payload TEXT, error TEXT, queue TEXT, failed_at TEXT DEFAULT (datetime('now')))").run();
          console.info({ requestId, level: "info", message: "Tables reset complete" });
          return Response.json({ worker: "worker-2-consumer", requestId, message: "Tables reset complete", tables: ["queue_jobs", "failed_jobs"] });
        } catch (err) {
          console.error({ requestId, level: "error", message: "Reset failed", error: err.message });
          return Response.json({ error: "Reset failed", detail: err.message, requestId }, { status: 500 });
        }
      }

      // View processed jobs
      if (url.pathname === "/jobs") {
        try {
          const { results } = await env.MY_BINDING.prepare("SELECT * FROM queue_jobs ORDER BY processed_at DESC LIMIT 50").all();
          const elapsed = Date.now() - startTime;
          if (results.length === 0) {
            console.warn({ requestId, level: "warn", message: "No processed jobs found in D1" });
          } else {
            console.info({ requestId, level: "info", message: "Fetched processed jobs", count: results.length, elapsed });
          }
          return Response.json({ worker: "worker-2-consumer", requestId, count: results.length, elapsed_ms: elapsed, data: results });
        } catch (dbErr) {
          console.error({ requestId, level: "error", message: "D1 fetch jobs failed", error: dbErr.message });
          return Response.json({ error: "Failed to fetch jobs", detail: dbErr.message, requestId }, { status: 500 });
        }
      }

      // View failed jobs
      if (url.pathname === "/failed") {
        try {
          const { results } = await env.MY_BINDING.prepare("SELECT * FROM failed_jobs ORDER BY failed_at DESC LIMIT 50").all();
          const elapsed = Date.now() - startTime;
          if (results.length === 0) {
            console.warn({ requestId, level: "warn", message: "No failed jobs found in D1" });
          } else {
            console.info({ requestId, level: "info", message: "Fetched failed jobs", count: results.length, elapsed });
          }
          return Response.json({ worker: "worker-2-consumer", requestId, count: results.length, elapsed_ms: elapsed, data: results });
        } catch (dbErr) {
          console.error({ requestId, level: "error", message: "D1 fetch failed jobs error", error: dbErr.message });
          return Response.json({ error: "Failed to fetch failed jobs", detail: dbErr.message, requestId }, { status: 500 });
        }
      }

      // Clear all jobs
      if (url.pathname === "/clear" && request.method === "DELETE") {
        try {
          await env.MY_BINDING.prepare("DELETE FROM queue_jobs").run();
          await env.MY_BINDING.prepare("DELETE FROM failed_jobs").run();
          console.info({ requestId, level: "info", message: "All jobs cleared from D1" });
          return Response.json({ worker: "worker-2-consumer", requestId, message: "All jobs cleared", tables: ["queue_jobs", "failed_jobs"] });
        } catch (dbErr) {
          console.error({ requestId, level: "error", message: "D1 clear failed", error: dbErr.message });
          return Response.json({ error: "Failed to clear jobs", detail: dbErr.message, requestId }, { status: 500 });
        }
      }

      if (url.pathname === "/clear") {
        return Response.json({ error: "Method not allowed, use DELETE", requestId }, { status: 405 });
      }

      // Unknown route
      console.warn({ requestId, level: "warn", message: "Unknown route", path: url.pathname });

      const elapsed = Date.now() - startTime;
      return Response.json({
        worker: "worker-2-consumer",
        requestId,
        message: "Consumer Worker is running",
        elapsed_ms: elapsed,
        routes: {
          "GET    /":        "Consumer UI",
          "GET    /health":  "Health check",
          "GET    /setup":   "Create D1 tables",
          "GET    /migrate": "Add missing columns",
          "GET    /reset":   "Drop and recreate tables",
          "GET    /jobs":    "View processed jobs",
          "GET    /failed":  "View failed jobs",
          "DELETE /clear":   "Clear all jobs",
        },
        timestamp: new Date().toISOString(),
      });

    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.error({ requestId, level: "error", message: "Unhandled exception in Worker 2 fetch", error: err.message, stack: err.stack, elapsed });
      return Response.json({ error: "Internal Server Error", requestId }, { status: 500 });
    }
  },

  // Queue consumer - triggered automatically by Cloudflare
  async queue(batch, env) {
    const batchId = crypto.randomUUID();

    console.info({
      batchId,
      level: "info",
      message: "Queue batch received",
      queue: batch.queue,
      count: batch.messages.length,
    });

    for (const message of batch.messages) {
      try {
        const body      = message.body ?? {};
        const requestId = body.requestId ?? crypto.randomUUID();
        const type      = body.type ?? "unknown";
        const payload   = body.payload ?? {};
        const country   = body.country ?? "unknown";
        const timestamp = body.timestamp ?? new Date().toISOString();

        console.info({
          batchId,
          requestId,
          level: "info",
          message: "Processing queue message",
          type,
          queue: batch.queue,
          timestamp,
          payload,
          country,
        });

        await env.MY_BINDING.prepare(
          "INSERT INTO queue_jobs (request_id, type, payload, status, queue, country) VALUES (?, ?, ?, 'processed', ?, ?)"
        ).bind(requestId, type, JSON.stringify(payload), batch.queue, country).run();

        message.ack();

        console.info({
          batchId,
          requestId,
          level: "info",
          message: "Queue message processed and acked",
          type,
          queue: batch.queue,
          payload,
          country,
        });

      } catch (err) {
        const body      = message.body ?? {};
        const requestId = body.requestId ?? "unknown";
        const type      = body.type ?? "unknown";
        const payload   = body.payload ?? {};

        console.error({
          batchId,
          requestId,
          level: "error",
          message: "Failed to process queue message",
          error: err.message,
          stack: err.stack,
          type,
          payload,
          queue: batch.queue,
          rawBody: JSON.stringify(message.body),
        });

        try {
          await env.MY_BINDING.prepare(
            "INSERT INTO failed_jobs (request_id, type, payload, error, queue) VALUES (?, ?, ?, ?, ?)"
          ).bind(requestId, type, JSON.stringify(body), err.message, batch.queue).run();
        } catch (dbErr) {
          console.error({ batchId, level: "error", message: "Failed to save failed job to D1", error: dbErr.message });
        }

        message.retry({ delaySeconds: 10 });
      }
    }
  },
};