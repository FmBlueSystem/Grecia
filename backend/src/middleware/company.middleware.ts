import { FastifyReply, FastifyRequest } from 'fastify';
import { CountryCode, DEFAULT_COMPANY } from '../config/companies';

// Extend FastifyRequest to include company context
declare module 'fastify' {
    interface FastifyRequest {
        companyCode: CountryCode;
    }
}

export async function companyMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const companyHeader = request.headers['x-company-id'] as string;

    // Validate if header exists and is valid, otherwise fallback to DEFAULT or Error
    // For now, defaulting is safer for transition, but for multi-tenant strictness we might want to error if missing.
    // Let's default to CR for now.

    if (companyHeader && Object.values(CountryCode).includes(companyHeader as CountryCode)) {
        request.companyCode = companyHeader as CountryCode;
    } else {
        request.companyCode = DEFAULT_COMPANY;
    }

    // You could log switching here
    // request.log.info({ company: request.companyCode }, 'Request Context');
}
