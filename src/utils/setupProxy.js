const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/supabase',
    createProxyMiddleware({
      target: 'https://psgsygzjsjulyfxfksiq.supabase.co',
      changeOrigin: true,
      pathRewrite: {
        '^/supabase': '/rest/v1',
      },
      onProxyReq: (proxyReq) => {
        const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZ3N5Z3pqc2p1bHlmeGZrc2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTM0NTUsImV4cCI6MjA2NTIyOTQ1NX0.9iivqPSRgtNh_4enQsDaq0bUVHK3Zum-Kbt8hYO7mdE';
        proxyReq.setHeader('apikey', key);
        proxyReq.setHeader('Authorization', `Bearer ${key}`);
      },
      secure: true,
    })
  );
};
