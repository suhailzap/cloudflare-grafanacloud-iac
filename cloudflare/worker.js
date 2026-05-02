export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.info({
      requestId,
      level: "info",
      message: "Worker 1 - API Gateway received request",
      method: request.method,
      path: url.pathname,
      country: request.cf?.country ?? "unknown",
    });

    try {

      if (url.pathname === "/health") {
        return Response.json({ status: "healthy", worker: "worker-1", requestId });
      }

      // Send a job to the queue
      if (url.pathname === "/enqueue") {
        const body = await request.json().catch(() => ({}));

        const message = {
          requestId,
          timestamp: new Date().toISOString(),
          type: body.type ?? "default",
          payload: body.payload ?? {},
          country: request.cf?.country ?? "unknown",
        };

        await env.JOBS_QUEUE.send(message);

        console.info({
          requestId,
          level: "info",
          message: "Job enqueued successfully",
          type: message.type,
        });

        return Response.json({
          worker: "worker-1",
          requestId,
          message: "Job enqueued",
          job: message,
        });
      }

      // Send batch of messages
      if (url.pathname === "/enqueue/batch") {
        const body = await request.json().catch(() => ({ items: [] }));
        const items = body.items ?? [];

        if (items.length === 0) {
          console.warn({ requestId, level: "warn", message: "Empty batch enqueue attempted" });
          return Response.json({ error: "No items provided" }, { status: 400 });
        }

        const messages = items.map((item) => ({
          body: {
            requestId,
            timestamp: new Date().toISOString(),
            type: item.type ?? "batch",
            payload: item,
          },
        }));

        await env.JOBS_QUEUE.sendBatch(messages);

        console.info({
          requestId,
          level: "info",
          message: "Batch enqueued successfully",
          count: messages.length,
        });

        return Response.json({
          worker: "worker-1",
          requestId,
          message: "Batch enqueued",
          count: messages.length,
        });
      }

      // Send notification
      if (url.pathname === "/notify") {
        const body = await request.json().catch(() => ({}));

        await env.NOTIFICATIONS_QUEUE.send({
          requestId,
          timestamp: new Date().toISOString(),
          notification: body.message ?? "No message",
          priority: body.priority ?? "normal",
        });

        console.info({ requestId, level: "info", message: "Notification enqueued" });

        return Response.json({
          worker: "worker-1",
          requestId,
          message: "Notification enqueued",
        });
      }

      const elapsed = Date.now() - startTime;
      return Response.json({
        worker: "worker-1",
        requestId,
        message: "API Gateway is running",
        elapsed_ms: elapsed,
        routes: ["/health", "/enqueue", "/enqueue/batch", "/notify", "/info", "/echo"],
        timestamp: new Date().toISOString(),
      });

    } catch (err) {
      console.error({
        requestId,
        level: "error",
        message: "Unhandled exception in Worker 1",
        error: err.message,
        stack: err.stack,
      });
      return Response.json({ error: "Internal Server Error", requestId }, { status: 500 });
    }
  },
};