import { FastifyInstance } from 'fastify';
import { sapGet, loadSalesPersons, CountryCode } from '../services/sap-proxy.service';

interface ChainNode {
    type: 'quote' | 'order' | 'invoice';
    docEntry: number;
    docNum: number;
    cardCode: string;
    cardName: string;
    total: number;
    date: string;
    dueDate: string;
    status: string;
    salesPerson: string;
}

export default async function traceabilityRoutes(fastify: FastifyInstance) {
    // GET /api/traceability/search?docNum=123&type=quote|order|invoice
    fastify.get('/search', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { docNum, type } = request.query as { docNum?: string; type?: string };
            if (!docNum) return reply.code(400).send({ error: 'Se requiere docNum' });
            // Validate docNum is numeric to prevent OData injection
            if (!/^\d+$/.test(docNum)) return reply.code(400).send({ error: 'docNum debe ser numerico' });

            const cc = request.companyCode as CountryCode;
            const spMap = await loadSalesPersons(cc);
            const spName = (code: number) => spMap.get(code) || '-';

            const chain: ChainNode[] = [];
            let foundType = type || '';

            const mapNode = (entity: string, doc: any): ChainNode => ({
                type: entity as ChainNode['type'],
                docEntry: doc.DocEntry,
                docNum: doc.DocNum,
                cardCode: doc.CardCode || '',
                cardName: doc.CardName || '',
                total: Number(doc.DocTotal) || 0,
                date: doc.DocDate,
                dueDate: doc.DocDueDate,
                status: doc.DocumentStatus === 'bost_Open' ? 'Abierta' : 'Cerrada',
                salesPerson: spName(doc.SalesPersonCode),
            });

            // 1. Find the document by DocNum (try all types if not specified)
            let rootDoc: any = null;
            const select = 'DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode,DocumentLines';

            if (!foundType || foundType === 'quote') {
                try {
                    const res = await sapGet(cc, `Quotations?$filter=DocNum eq ${docNum}&$select=${select}&$top=1`);
                    if (res.value?.length) { rootDoc = res.value[0]; foundType = 'quote'; }
                } catch { /* not found */ }
            }
            if (!rootDoc && (!foundType || foundType === 'order')) {
                try {
                    const res = await sapGet(cc, `Orders?$filter=DocNum eq ${docNum}&$select=${select}&$top=1`);
                    if (res.value?.length) { rootDoc = res.value[0]; foundType = 'order'; }
                } catch { /* not found */ }
            }
            if (!rootDoc && (!foundType || foundType === 'invoice')) {
                try {
                    const res = await sapGet(cc, `Invoices?$filter=DocNum eq ${docNum}&$select=${select},PaidToDate&$top=1`);
                    if (res.value?.length) { rootDoc = res.value[0]; foundType = 'invoice'; }
                } catch { /* not found */ }
            }

            if (!rootDoc) {
                return reply.code(404).send({ error: `Documento #${docNum} no encontrado` });
            }

            // 2. Build chain based on document type found
            if (foundType === 'quote') {
                chain.push(mapNode('quote', rootDoc));
                // Find orders from this quote
                try {
                    const orders = await sapGet(cc, `Orders?$filter=DocumentLines/any(d: d/BaseEntry eq ${rootDoc.DocEntry} and d/BaseType eq 23)&$select=${select}&$top=10`);
                    for (const ord of orders.value || []) {
                        chain.push(mapNode('order', ord));
                        // Find invoices from each order
                        try {
                            const invoices = await sapGet(cc, `Invoices?$filter=DocumentLines/any(d: d/BaseEntry eq ${ord.DocEntry} and d/BaseType eq 17)&$select=DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode,PaidToDate&$top=10`);
                            for (const inv of invoices.value || []) {
                                const node = mapNode('invoice', inv);
                                (node as any).paidAmount = Number(inv.PaidToDate) || 0;
                                chain.push(node);
                            }
                        } catch { /* no invoices */ }
                    }
                } catch { /* no orders */ }
            } else if (foundType === 'order') {
                // Trace back to quote
                const baseLine = (rootDoc.DocumentLines || [])[0];
                if (baseLine?.BaseType === 23 && baseLine?.BaseEntry) {
                    try {
                        const quote = await sapGet(cc, `Quotations(${baseLine.BaseEntry})?$select=DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode`);
                        chain.push(mapNode('quote', quote));
                    } catch { /* quote not found */ }
                }
                chain.push(mapNode('order', rootDoc));
                // Trace forward to invoices
                try {
                    const invoices = await sapGet(cc, `Invoices?$filter=DocumentLines/any(d: d/BaseEntry eq ${rootDoc.DocEntry} and d/BaseType eq 17)&$select=DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode,PaidToDate&$top=10`);
                    for (const inv of invoices.value || []) {
                        const node = mapNode('invoice', inv);
                        (node as any).paidAmount = Number(inv.PaidToDate) || 0;
                        chain.push(node);
                    }
                } catch { /* no invoices */ }
            } else if (foundType === 'invoice') {
                // Trace back to order
                const baseLine = (rootDoc.DocumentLines || [])[0];
                if (baseLine?.BaseType === 17 && baseLine?.BaseEntry) {
                    try {
                        const order = await sapGet(cc, `Orders(${baseLine.BaseEntry})?$select=DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode,DocumentLines`);
                        // Trace back to quote from order
                        const orderBaseLine = (order.DocumentLines || [])[0];
                        if (orderBaseLine?.BaseType === 23 && orderBaseLine?.BaseEntry) {
                            try {
                                const quote = await sapGet(cc, `Quotations(${orderBaseLine.BaseEntry})?$select=DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode`);
                                chain.push(mapNode('quote', quote));
                            } catch { /* quote not found */ }
                        }
                        chain.push(mapNode('order', order));
                    } catch { /* order not found */ }
                }
                const invNode = mapNode('invoice', rootDoc);
                (invNode as any).paidAmount = Number(rootDoc.PaidToDate) || 0;
                chain.push(invNode);
            }

            return {
                searchedDocNum: Number(docNum),
                searchedType: foundType,
                client: rootDoc.CardName || '',
                chain,
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al buscar trazabilidad' });
        }
    });
}
