export default {
  // HTTP handler
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

      // D1 - create tables (run once)
      if (url.pathname === "/setup") {
        try {

          await env.MY_BINDING.prepare(
            "CREATE TABLE IF NOT EXISTS requests (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL, method TEXT NOT NULL, path TEXT NOT NULL, country TEXT, created_at TEXT DEFAULT (datetime('now')))"
          ).run();

          await env.MY_BINDING.prepare(
            "CREATE TABLE IF NOT EXISTS queue_jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL, type TEXT NOT NULL, payload TEXT, status TEXT DEFAULT 'processed', processed_at TEXT DEFAULT (datetime('now')))"
          ).run();

          console.info({ requestId, level: "info", message: "D1 tables setup complete" });

          return Response.json({
            worker: "worker-2",
            requestId,
            message: "Database setup complete",
            tables: ["requests", "queue_jobs"],
          });

        } catch (dbErr) {
          console.error({
            requestId,
            level: "error",
            message: "D1 setup failed",
            error: dbErr.message,
            stack: dbErr.stack,
          });
          return Response.json({
            error: "Database setup failed",
            detail: dbErr.message,
            requestId,
          }, { status: 500 });
        }
      }

      // D1 - log this request
      if (url.pathname === "/log") {
        try {
          await env.MY_BINDING.prepare(
            "INSERT INTO requests (request_id, method, path, country) VALUES (?, ?, ?, ?)"
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
          return Response.json({
            error: "Failed to log request",
            detail: dbErr.message,
            requestId,
          }, { status: 500 });
        }
      }

      // D1 - get recent logs
      if (url.pathname === "/logs") {
        try {
          const { results: requestLogs } = await env.MY_BINDING.prepare(
            "SELECT * FROM requests ORDER BY created_at DESC LIMIT 20"
          ).all();

          const { results: jobLogs } = await env.MY_BINDING.prepare(
            "SELECT * FROM queue_jobs ORDER BY processed_at DESC LIMIT 20"
          ).all();

          const elapsed = Date.now() - startTime;

          if (requestLogs.length === 0 && jobLogs.length === 0) {
            console.warn({
              requestId,
              level: "warn",
              message: "No logs found in D1 — tables may be empty",
            });
          } else {
            console.info({
              requestId,
              level: "info",
              message: "Fetched logs from D1",
              request_count: requestLogs.length,
              job_count: jobLogs.length,
              elapsed,
            });
          }

          return Response.json({
            worker: "worker-2",
            requestId,
            elapsed_ms: elapsed,
            requests: {
              count: requestLogs.length,
              data: requestLogs,
            },
            queue_jobs: {
              count: jobLogs.length,
              data: jobLogs,
            },
          });

        } catch (dbErr) {
          console.error({
            requestId,
            level: "error",
            message: "D1 select failed",
            error: dbErr.message,
            stack: dbErr.stack,
          });
          return Response.json({
            error: "Failed to fetch logs",
            detail: dbErr.message,
            requestId,
          }, { status: 500 });
        }
      }

      // D1 - clear all logs
      if (url.pathname === "/clear") {
        if (request.method !== "DELETE") {
          console.warn({
            requestId,
            level: "warn",
            message: "Clear route called with wrong method",
            method: request.method,
            expected: "DELETE",
          });
          return Response.json({
            error: "Method not allowed, use DELETE",
            requestId,
          }, { status: 405 });
        }

        try {
          await env.MY_BINDING.prepare("DELETE FROM requests").run();
          await env.MY_BINDING.prepare("DELETE FROM queue_jobs").run();

          console.info({ requestId, level: "info", message: "All D1 logs cleared" });

          return Response.json({
            worker: "worker-2",
            requestId,
            message: "All logs cleared",
            tables: ["requests", "queue_jobs"],
          });

        } catch (dbErr) {
          console.error({
            requestId,
            level: "error",
            message: "D1 delete failed",
            error: dbErr.message,
            stack: dbErr.stack,
          });
          return Response.json({
            error: "Failed to clear logs",
            detail: dbErr.message,
            requestId,
          }, { status: 500 });
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

      const elapsed = Date.now() - startTime;
      console.info({ requestId, level: "info", message: "Default request completed", elapsed });

      return Response.json({
        worker: "worker-2",
        requestId,
        message: "D1 + Queue Consumer Worker is running",
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

  // Queue consumer handler
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
      const { requestId, type, payload, timestamp } = message.body;

      try {
        console.info({
          batchId,
          requestId,
          level: "info",
          message: "Processing queue message",
          type,
          queue: batch.queue,
          timestamp,
        });

        // Save processed job to D1
        await env.MY_BINDING.prepare(
          "INSERT INTO queue_jobs (request_id, type, payload, status) VALUES (?, ?, ?, 'processed')"
        ).bind(
          requestId ?? batchId,
          type ?? "unknown",
          JSON.stringify(payload ?? {})
        ).run();

        // Acknowledge message
        message.ack();

        console.info({
          batchId,
          requestId,
          level: "info",
          message: "Queue message processed and acked",
          type,
          queue: batch.queue,
        });

      } catch (err) {
        console.error({
          batchId,
          requestId,
          level: "error",
          message: "Failed to process queue message",
          error: err.message,
          stack: err.stack,
          type,
          queue: batch.queue,
        });

        // Retry with delay
        message.retry({ delaySeconds: 10 });
      }
    }
  },
};