import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export default async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/login', async (request, reply) => {
        const body = loginSchema.safeParse(request.body);
        if (!body.success) {
            reply.code(400);
            return { error: 'Invalid input', details: body.error.issues };
        }

        const { email, password } = body.data;

        try {
            const user = await prisma.user.findUnique({
                where: { email },
                include: { role: true }
            });

            if (!user) {
                reply.code(401);
                return { error: 'Credenciales inválidas' };
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                reply.code(401);
                return { error: 'Credenciales inválidas' };
            }

            const token = fastify.jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    roleId: user.roleId,
                    sapSalesPersonCode: user.sapSalesPersonCode,
                    scopeLevel: user.role.scopeLevel,
                },
                { expiresIn: '24h' }
            );

            // Record login timestamp
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });

            // Set Cookie
            reply.setCookie('token', token, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24, // 1 day
            });

            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roleId: user.roleId,
                    role: user.role.name,
                    sapSalesPersonCode: user.sapSalesPersonCode,
                    scopeLevel: user.role.scopeLevel,
                },
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    fastify.get('/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { userId } = request.user as { userId: string };
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { role: true }
            });

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
                    role: user.role.name,
                    sapSalesPersonCode: user.sapSalesPersonCode,
                    scopeLevel: user.role.scopeLevel,
                },
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    fastify.post('/logout', async (request, reply) => {
        reply.clearCookie('token');
        return { success: true, message: 'Sesión cerrada exitosamente' };
    });
}

