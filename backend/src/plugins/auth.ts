import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';

export default fp(async (fastify) => {
    // I-1: JWT secret must be set in production — throw if missing
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.includes('change-this')) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET must be set to a secure value in production.');
        }
        fastify.log.warn('JWT_SECRET no configurado — usando clave por defecto. NO usar en produccion.');
    }
    fastify.register(fastifyJwt, {
        secret: jwtSecret || 'dev-only-jwt-secret-not-for-production',
    });

    // I-11: Return generic 401 on auth failure — don't leak JWT error details
    fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({ error: 'No autorizado' });
        }
    });
});

declare module 'fastify' {
    export interface FastifyInstance {
        authenticate: any;
    }
}
