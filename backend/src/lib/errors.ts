import type { FastifyReply } from 'fastify';

interface ErrorResponse {
    error: string;
    message?: string;
    statusCode: number;
}

export function sendError(reply: FastifyReply, statusCode: number, error: string, message?: string): void {
    reply.code(statusCode).send({ error, message, statusCode } satisfies ErrorResponse);
}

export function extractSapError(error: any): string {
    return error?.response?.data?.error?.message?.value || 'Error en SAP Service Layer';
}

export function sapErrorCode(error: any): number {
    return error?.response?.status || 500;
}
