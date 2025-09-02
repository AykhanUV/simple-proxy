import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const { destination } = getQuery(event);

  if (!destination || typeof destination !== 'string') {
    return new Response('Missing destination parameter', { status: 400 });
  }

  const response = await fetch(destination, {
    headers: event.req.headers,
    method: event.req.method,
    body: event.req.method !== 'GET' && event.req.method !== 'HEAD' ? event.req : undefined,
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
});