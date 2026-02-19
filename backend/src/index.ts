import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

import authPlugin from './plugins/auth';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contacts.routes';
import opportunityRoutes from './routes/opportunities.routes';
import activityRoutes from './routes/activities.routes';
import dashboardRoutes from './routes/dashboard.routes';
import leadRoutes from './routes/leads.routes';
import productRoutes from './routes/products.routes';
import quoteRoutes from './routes/quotes.routes';
import orderRoutes from './routes/orders.routes';
import caseRoutes from './routes/cases.routes';
import accountRoutes from './routes/accounts.routes';
import invoiceRoutes from './routes/invoices.routes';
import forecastRoutes from './routes/forecast.routes';
import searchRoutes from './routes/search.routes';
import managerRoutes from './routes/manager.routes';
import reportsRoutes from './routes/reports.routes';
import agingRoutes from './routes/aging.routes';
import adminRoutes from './routes/admin.routes';
import traceabilityRoutes from './routes/traceability.routes';
import lostDealsRoutes from './routes/lost-deals.routes';
import notificationsRoutes from './routes/notifications.routes';
import auditRoutes from './routes/audit.routes';




import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';

// Plugins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true,
});

fastify.register(cookie);

// I-2: Rate limiting — global 100 req/min, auth routes stricter via route config
fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' });

fastify.register(helmet);
fastify.register(authPlugin);
// Global Company Middleware
import { companyMiddleware } from './middleware/company.middleware';
fastify.addHook('preHandler', companyMiddleware);

fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(contactRoutes, { prefix: '/api/contacts' });
fastify.register(opportunityRoutes, { prefix: '/api/opportunities' });
fastify.register(activityRoutes, { prefix: '/api/activities' });
fastify.register(dashboardRoutes, { prefix: '/api/dashboard' });
fastify.register(leadRoutes, { prefix: '/api/leads' });
fastify.register(productRoutes, { prefix: '/api/products' });
fastify.register(quoteRoutes, { prefix: '/api/quotes' });
fastify.register(orderRoutes, { prefix: '/api/orders' });
fastify.register(invoiceRoutes, { prefix: '/api/invoices' });

fastify.register(caseRoutes, { prefix: '/api/cases' });
fastify.register(accountRoutes, { prefix: '/api/accounts' });
fastify.register(forecastRoutes, { prefix: '/api/forecast' });
fastify.register(searchRoutes, { prefix: '/api/search' });
fastify.register(managerRoutes, { prefix: '/api/manager' });
fastify.register(reportsRoutes, { prefix: '/api/reports' });
fastify.register(agingRoutes, { prefix: '/api/aging' });
fastify.register(adminRoutes, { prefix: '/api/admin' });
fastify.register(traceabilityRoutes, { prefix: '/api/traceability' });
fastify.register(lostDealsRoutes, { prefix: '/api/lost-deals' });
fastify.register(notificationsRoutes, { prefix: '/api/notifications' });
fastify.register(auditRoutes, { prefix: '/api/audit' });




// Health check
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'STIA CRM API',
  };
});

// API Info
fastify.get('/api', async () => {
  return {
    name: 'STIA CRM API',
    version: '1.0.0',
    description: 'CRM MVP inspirado en Microsoft Dynamics',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth/login, /api/auth/logout',
      contacts: '/api/contacts (GET, POST, PUT, DELETE)',
      opportunities: '/api/opportunities (GET, POST, PUT, DELETE)',
      activities: '/api/activities (GET, POST, PUT, DELETE)',
      dashboard: '/api/dashboard/stats',
    },
  };
});



// Contacts endpoints (Moved to routes/contacts.routes.ts)


// Opportunities endpoints (Moved to routes/opportunities.routes.ts)


// Endpoints moved to individual route files


// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    console.log('');
    console.log('🚀 STIA CRM Backend is running!');
    console.log('');
    console.log(`📍 Server: http://localhost:${port}`);
    console.log(`📍 Health: http://localhost:${port}/health`);
    console.log(`📍 API Info: http://localhost:${port}/api`);
    console.log('');
    console.log('⚡ Press Ctrl+C to stop');
    console.log('');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
