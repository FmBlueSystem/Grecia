import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './utils/db';

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

// Plugins
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
});

fastify.register(helmet);

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

// Authentication endpoints
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body as { email: string; password: string };

  const user = db.getUserByEmail(email);
  if (!user) {
    reply.code(401);
    return { error: 'Credenciales inválidas' };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    reply.code(401);
    return { error: 'Credenciales inválidas' };
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, roleId: user.roleId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
    },
  };
});

fastify.post('/api/auth/logout', async () => {
  return { success: true, message: 'Sesión cerrada exitosamente' };
});

fastify.get('/api/auth/me', async (request, reply) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401);
    return { error: 'No autorizado' };
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.getUserById(decoded.userId);
    if (!user) {
      reply.code(401);
      return { error: 'Usuario no encontrado' };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
      },
    };
  } catch (err) {
    reply.code(401);
    return { error: 'Token inválido' };
  }
});

// Contacts endpoints
fastify.get('/api/contacts', async () => {
  const contacts = db.getContacts();
  return {
    data: contacts,
    total: contacts.length,
  };
});

fastify.get('/api/contacts/:id', async (request) => {
  const { id } = request.params as { id: string };
  const contact = db.getContactById(id);
  if (!contact) {
    return { error: 'Contact not found' };
  }
  return { data: contact };
});

fastify.post('/api/contacts', async (request) => {
  const contactData = request.body as any;
  const newContact = db.createContact({
    firstName: contactData.firstName,
    lastName: contactData.lastName,
    email: contactData.email,
    phone: contactData.phone,
    mobile: contactData.mobile,
    jobTitle: contactData.jobTitle,
    company: contactData.company,
    leadSource: contactData.leadSource,
    tags: contactData.tags || [],
    ownerId: contactData.ownerId || 'user-1',
    isActive: true,
  });
  return { data: newContact };
});

fastify.put('/api/contacts/:id', async (request) => {
  const { id } = request.params as { id: string };
  const contactData = request.body as any;
  const updated = db.updateContact(id, contactData);
  if (!updated) {
    return { error: 'Contact not found' };
  }
  return { data: updated };
});

fastify.delete('/api/contacts/:id', async (request) => {
  const { id } = request.params as { id: string };
  const success = db.deleteContact(id);
  if (!success) {
    return { error: 'Contact not found' };
  }
  return { success: true };
});

// Opportunities endpoints
fastify.get('/api/opportunities', async () => {
  const opportunities = db.getOpportunities();
  const pipelineValue = opportunities.reduce((sum, opp) => sum + opp.amount, 0);
  const weightedPipeline = opportunities.reduce(
    (sum, opp) => sum + opp.amount * (opp.probability / 100),
    0
  );
  return {
    data: opportunities,
    total: opportunities.length,
    pipelineValue,
    weightedPipeline,
  };
});

fastify.get('/api/opportunities/:id', async (request) => {
  const { id } = request.params as { id: string };
  const opportunity = db.getOpportunityById(id);
  if (!opportunity) {
    return { error: 'Opportunity not found' };
  }
  return { data: opportunity };
});

fastify.post('/api/opportunities', async (request) => {
  const oppData = request.body as any;
  const newOpp = db.createOpportunity({
    name: oppData.name,
    amount: oppData.amount,
    currency: oppData.currency || 'USD',
    stage: oppData.stage,
    probability: oppData.probability,
    closeDate: oppData.closeDate,
    accountName: oppData.accountName,
    contactName: oppData.contactName,
    ownerId: oppData.ownerId || 'user-1',
    isClosed: false,
  });
  return { data: newOpp };
});

fastify.put('/api/opportunities/:id', async (request) => {
  const { id } = request.params as { id: string };
  const oppData = request.body as any;
  const updated = db.updateOpportunity(id, oppData);
  if (!updated) {
    return { error: 'Opportunity not found' };
  }
  return { data: updated };
});

fastify.delete('/api/opportunities/:id', async (request) => {
  const { id } = request.params as { id: string };
  const success = db.deleteOpportunity(id);
  if (!success) {
    return { error: 'Opportunity not found' };
  }
  return { success: true };
});

// Activities endpoints
fastify.get('/api/activities', async () => {
  const activities = db.getActivities();
  return {
    data: activities,
    total: activities.length,
  };
});

fastify.get('/api/activities/:id', async (request) => {
  const { id } = request.params as { id: string };
  const activity = db.getActivityById(id);
  if (!activity) {
    return { error: 'Activity not found' };
  }
  return { data: activity };
});

fastify.post('/api/activities', async (request) => {
  const actData = request.body as any;
  const newActivity = db.createActivity({
    activityType: actData.activityType,
    subject: actData.subject,
    description: actData.description,
    dueDate: actData.dueDate,
    status: actData.status || 'Planned',
    priority: actData.priority,
    contactId: actData.contactId,
    opportunityId: actData.opportunityId,
    ownerId: actData.ownerId || 'user-1',
    isCompleted: false,
  });
  return { data: newActivity };
});

fastify.put('/api/activities/:id', async (request) => {
  const { id } = request.params as { id: string };
  const actData = request.body as any;
  const updated = db.updateActivity(id, actData);
  if (!updated) {
    return { error: 'Activity not found' };
  }
  return { data: updated };
});

fastify.delete('/api/activities/:id', async (request) => {
  const { id } = request.params as { id: string };
  const success = db.deleteActivity(id);
  if (!success) {
    return { error: 'Activity not found' };
  }
  return { success: true };
});

// Dashboard stats
fastify.get('/api/dashboard/stats', async () => {
  const opportunities = db.getOpportunities();
  const activities = db.getActivities();

  const pipelineValue = opportunities.reduce((sum, opp) => sum + opp.amount, 0);
  const weightedPipeline = opportunities.reduce(
    (sum, opp) => sum + opp.amount * (opp.probability / 100),
    0
  );

  const now = new Date();
  const todayActivities = activities.filter((a) => {
    if (!a.dueDate) return false;
    const dueDate = new Date(a.dueDate);
    return (
      dueDate.toDateString() === now.toDateString() && !a.isCompleted
    );
  });

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const thisWeekActivities = activities.filter((a) => {
    if (!a.dueDate) return false;
    const dueDate = new Date(a.dueDate);
    return dueDate >= weekStart && !a.isCompleted;
  });

  const overdueActivities = activities.filter((a) => {
    if (!a.dueDate) return false;
    const dueDate = new Date(a.dueDate);
    return dueDate < now && !a.isCompleted;
  });

  return {
    revenue: {
      mtd: 125000,
      target: 200000,
      percentage: 62.5,
      trend: '+15%',
    },
    pipeline: {
      value: pipelineValue,
      weighted: Math.round(weightedPipeline),
      deals: opportunities.length,
    },
    winRate: {
      percentage: 68,
      trend: '+5%',
    },
    activities: {
      today: todayActivities.length,
      thisWeek: thisWeekActivities.length,
      overdue: overdueActivities.length,
    },
  };
});

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
