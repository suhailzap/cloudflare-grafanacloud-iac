// /**
//  * Welcome to Cloudflare Workers! This is your first worker.
//  *
//  * - Run "npm run dev" in your terminal to start a development server
//  * - Open a browser tab at http://localhost:8787/ to see your worker in action
//  * - Run "npm run deploy" to publish your worker
//  *
//  * Learn more at https://developers.cloudflare.com/workers/
//  */

// export default {
//   async fetch(request, env, ctx) {
//     // You can view your logs in the Observability dashboard
//         // Force traceable operation
//     await fetch("https://httpbin.org/get");

//     console.log("trace test");
//     console.info({ message: 'Hello World Worker received a request!' }); 
//     return new Response('Hello World! from worker - 1 !');
//   }
// };



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
      userAgent: request.headers.get("user-agent"),
      country: request.cf?.country ?? "unknown",
      city: request.cf?.city ?? "unknown",
    });

    try {

      // Route handling
      if (url.pathname === "/health") {
        console.info({ requestId, level: "info", message: "Health check requested" });
        return Response.json({
          status: "healthy",
          worker: "worker-1",
          requestId,
          timestamp: new Date().toISOString(),
          region: request.cf?.colo ?? "unknown",
        });
      }

      if (url.pathname === "/info") {
        console.info({ requestId, level: "info", message: "Fetching upstream data from httpbin" });

        let upstreamData;
        try {
          const upstream = await fetch("https://httpbin.org/get", {
            headers: { "X-Request-Id": requestId },
          });

          if (!upstream.ok) {
            console.error({
              requestId,
              level: "error",
              message: "Upstream fetch failed",
              status: upstream.status,
              statusText: upstream.statusText,
            });
            return Response.json({ error: "Upstream service unavailable" }, { status: 502 });
          }

          upstreamData = await upstream.json();
          const elapsed = Date.now() - startTime;
          console.info({ requestId, level: "info", message: "Upstream fetch completed", elapsed });

        } catch (fetchErr) {
          console.error({
            requestId,
            level: "error",
            message: "Upstream fetch threw exception",
            error: fetchErr.message,
            stack: fetchErr.stack,
          });
          return Response.json({ error: "Failed to reach upstream" }, { status: 502 });
        }

        const elapsed = Date.now() - startTime;
        return Response.json({
          worker: "worker-1",
          requestId,
          elapsed_ms: elapsed,
          your_ip: upstreamData.origin,
          timestamp: new Date().toISOString(),
          cf: {
            country: request.cf?.country,
            city: request.cf?.city,
            colo: request.cf?.colo,
            asn: request.cf?.asn,
          },
        });
      }

      if (url.pathname === "/echo") {
        if (request.method !== "POST") {
          console.warn({
            requestId,
            level: "warn",
            message: "Echo route called with non-POST method",
            method: request.method,
          });
        }

        let body = null;
        try {
          body = request.method === "POST" ? await request.text() : null;
        } catch (bodyErr) {
          console.error({
            requestId,
            level: "error",
            message: "Failed to read request body",
            error: bodyErr.message,
          });
          return Response.json({ error: "Failed to read body" }, { status: 400 });
        }

        return Response.json({
          worker: "worker-1",
          requestId,
          method: request.method,
          headers: Object.fromEntries(request.headers),
          body,
        });
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
      console.info({ requestId, level: "info", message: "Request completed", elapsed });

      return Response.json({
        worker: "worker-1",
        requestId,
        message: "API Gateway is running",
        elapsed_ms: elapsed,
        routes: ["/health", "/info", "/echo"],
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
      return Response.json({
        error: "Internal Server Error",
        requestId,
      }, { status: 500 });
    }
  },
};