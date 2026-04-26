// 



export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.info({
      requestId,
      level: "info",
      message: "Worker 2 - D1 Handler received request",
      method: request.method,
      path: url.pathname,
      country: request.cf?.country ?? "unknown",
    });

    try {

      // Health check
      if (url.pathname === "/health") {
        console.info({ requestId, level: "info", message: "Health check OK" });
        return Response.json({
          status: "healthy",
          worker: "worker-2",
          requestId,
          timestamp: new Date().toISOString(),
        });
      }

      // D1 - create table
      if (url.pathname === "/setup") {
        try {
          await env.MY_BINDING.exec(`
            CREATE TABLE IF NOT EXISTS requests (
              id         INTEGER PRIMARY KEY AUTOINCREMENT,
              request_id TEXT NOT NULL,
              method     TEXT NOT NULL,
              path       TEXT NOT NULL,
              country    TEXT,
              created_at TEXT DEFAULT (datetime('now'))
            )
          `);
          console.info({ requestId, level: "info", message: "D1 table setup complete" });
          return Response.json({ worker: "worker-2", requestId, message: "Database setup complete" });

        } catch (dbErr) {
          console.error({
            requestId,
            level: "error",
            message: "D1 setup failed",
            error: dbErr.message,
            stack: dbErr.stack,
          });
          return Response.json({ error: "Database setup failed", requestId }, { status: 500 });
        }
      }

      // D1 - log request
      if (url.pathname === "/log") {
        try {
          await env.MY_BINDING.prepare(
            `INSERT INTO requests (request_id, method, path, country) VALUES (?, ?, ?, ?)`
          ).bind(
            requestId,
            request.method,
            url.pathname,
            request.cf?.country ?? "unknown"
          ).run();

          console.info({ requestId, level: "info", message: "Request logged to D1 successfully" });
          return Response.json({
            worker: "worker-2",
            requestId,
            message: "Request logged successfully",
            timestamp: new Date().toISOString(),
          });

        } catch (dbErr) {
          console.error({
            requestId,
            level: "error",
            message: "D1 insert failed",
            error: dbErr.message,
            stack: dbErr.stack,
          });
          return Response.json({ error: "Failed to log request", requestId }, { status: 500 });
        }
      }

      // D1 - get logs
      if (url.pathname === "/logs") {
        try {
          const { results } = await env.MY_BINDING.prepare(
            `SELECT * FROM requests ORDER BY created_at DESC LIMIT 20`
          ).all();

          const elapsed = Date.now() - startTime;

          if (results.length === 0) {
            console.warn({ requestId, level: "warn", message: "No logs found in D1 — table may be empty" });
          } else {
            console.info({ requestId, level: "info", message: "Fetched logs from D1", count: results.length, elapsed });
          }

          return Response.json({
            worker: "worker-2",
            requestId,
            count: results.length,
            elapsed_ms: elapsed,
            data: results,
          });

        } catch (dbErr) {
          console.error({
            requestId,
            level: "error",
            message: "D1 select failed",
            error: dbErr.message,
            stack: dbErr.stack,
          });
          return Response.json({ error: "Failed to fetch logs", requestId }, { status: 500 });
        }
      }

      // D1 - clear logs
      if (url.pathname === "/clear") {
        if (request.method !== "DELETE") {
          console.warn({
            requestId,
            level: "warn",
            message: "Clear route called with wrong method",
            method: request.method,
            expected: "DELETE",
          });
          return Response.json({ error: "Method not allowed, use DELETE" }, { status: 405 });
        }

        try {
          await env.MY_BINDING.prepare(`DELETE FROM requests`).run();
          console.info({ requestId, level: "info", message: "All D1 logs cleared" });
          return Response.json({ worker: "worker-2", requestId, message: "All logs cleared" });

        } catch (dbErr) {
          console.error({
            requestId,
            level: "error",
            message: "D1 delete failed",
            error: dbErr.message,
            stack: dbErr.stack,
          });
          return Response.json({ error: "Failed to clear logs", requestId }, { status: 500 });
        }
      }

      // Unknown route
      if (url.pathname !== "/") {
        console.warn({
          requestId,
          level: "warn",
          message: "Unknown route requested",
          path: url.pathname,
        });
      }

      // Default - fetch external for trace
      let upstream;
      try {
        upstream = await fetch("https://httpbin.org/get");
        if (!upstream.ok) {
          console.error({
            requestId,
            level: "error",
            message: "httpbin fetch failed",
            status: upstream.status,
          });
        }
      } catch (fetchErr) {
        console.error({
          requestId,
          level: "error",
          message: "httpbin fetch threw exception",
          error: fetchErr.message,
        });
      }

      const elapsed = Date.now() - startTime;
      console.info({ requestId, level: "info", message: "Default request completed", elapsed });

      return Response.json({
        worker: "worker-2",
        requestId,
        message: "D1 Database Worker is running",
        elapsed_ms: elapsed,
        routes: ["/health", "/setup", "/log", "/logs", "/clear"],
        timestamp: new Date().toISOString(),
      });

    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.error({
        requestId,
        level: "error",
        message: "Unhandled exception in Worker 2",
        error: err.message,
        stack: err.stack,
        elapsed,
      });
      return Response.json({
        error: "Internal Server Error",
        requestId,
      }, { status: 500 });
    }
  },
};