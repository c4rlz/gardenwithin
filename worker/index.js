// The one redirect public/_redirects can't do on Cloudflare: Squarespace's feed lived at /blog?format=rss,
// and _redirects can't match on the ?format part. Everything else goes straight to the built site.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/blog' && url.searchParams.get('format') === 'rss') {
      return Response.redirect(new URL('/rss.xml', url), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
