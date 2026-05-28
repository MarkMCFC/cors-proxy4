export default {
  async fetch(request) {
    // Handle CORS preflight first
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get('url');

    if (!target) {
      return json(
        { error: 'Missing ?url= parameter' },
        400,
      );
    }

    try {
      const outbound = new Request(target, {
        method: request.method,
        headers: request.headers,
        body:
          request.method === 'GET' || request.method === 'HEAD'
            ? undefined
            : request.body,
        redirect: 'follow',
      });

      const response = await fetch(outbound);

      const headers = new Headers(response.headers);

      Object.entries(corsHeaders()).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      return json(
        {
          error: error.message || 'Unknown error',
        },
        500,
      );
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
}
