import swaggerUi from 'swagger-ui-express';
import config from './config.js';
import routes from './routes/index.js';

function extractMountPath(layer) {
  if (!layer || !layer.regexp) return '';
  let s = layer.regexp.source;
  s = s.replace('\\/?(?=\\/|$)', '');
  s = s.replace('^', '').replace('$', '');
  s = s.replace(/\\\//g, '/');
  return s;
}

function openapiPath(path) {
  return path.replace(/:([^/]+)/g, '{$1}');
}

function deriveTag(path) {
  const parts = path.split('/').filter(Boolean);
  // prefer the segment after 'api', otherwise the first segment
  const apiIndex = parts.indexOf('api');
  if (apiIndex >= 0 && parts.length > apiIndex + 1) return parts[apiIndex + 1];
  return parts[0] || 'default';
}

export default function mountSwagger(app) {
  const paths = {};

  function scanRouter(router, base) {
    const found = [];
    if (!router || !router.stack) return found;
    router.stack.forEach(layer => {
      if (layer.route) {
        const routePath = base + (layer.route.path === '/' ? '' : layer.route.path);
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
        found.push({ path: routePath, methods });
      }
      else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        const nestedBase = base + (layer.regexp ? extractMountPath(layer) : '');
        found.push(...scanRouter(layer.handle, nestedBase));
      }
    });
    return found;
  }

  // For each exported router in routes/index.js, find its mount path on the app
  Object.keys(routes).forEach(key => {
    const router = routes[key];
    // try to locate the app layer that mounted this router
    const layer = (app._router && app._router.stack) ? app._router.stack.find(l => l.handle === router) : null;
    const base = layer ? extractMountPath(layer) : `/${key}`;
    const entries = scanRouter(router, base);
    entries.forEach(e => {
      const p = openapiPath(e.path);
      if (!paths[p]) paths[p] = {};
      e.methods.forEach(m => {
        const method = m.toLowerCase();
        paths[p][method] = {
          tags: [key],
          summary: `${m} ${p}`,
          responses: { '200': { description: 'OK' } }
        };
      });
    });
  });

  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'oakNglass API',
      version: '1.0.0',
      description: 'Auto-generated API surface (basic)'
    },
    servers: [{ url: `http://${config.backend.host}:${config.backend.port}` }],
    paths
  };

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}
