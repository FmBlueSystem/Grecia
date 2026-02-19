/**
 * SAP Service Layer Proxy
 * Provides real-time data access from SAP B1 Service Layer.
 * Maps SAP entities to CRM-compatible formats.
 */
import sapService from './sap.service';
import { CountryCode, COMPANIES } from '../config/companies';
export { CountryCode };

// ─── Tipos compartidos ────────────────────────────────
export interface PaginationParams {
    top?: number;
    skip?: number;
    filter?: string;
    orderBy?: string;
    search?: string;
}

interface SapListResponse<T> {
    data: T[];
    total: number;
}

// ─── Helpers ──────────────────────────────────────────

// C-4: Escape user input for OData filter strings to prevent injection
export function escapeOData(input: string): string {
    return input.replace(/'/g, "''").replace(/[%_\[\]]/g, '');
}

function buildQuery(endpoint: string, select: string, params: PaginationParams = {}): string {
    const parts: string[] = [`$select=${select}`, '$inlinecount=allpages'];
    if (params.top) parts.push(`$top=${params.top}`);
    if (params.skip) parts.push(`$skip=${params.skip}`);
    if (params.filter) parts.push(`$filter=${params.filter}`);
    if (params.orderBy) parts.push(`$orderby=${params.orderBy}`);
    return `${endpoint}?${parts.join('&')}`;
}

export async function sapGet(companyCode: CountryCode, path: string): Promise<any> {
    const client = await sapService.getClient(companyCode);
    const res = await client.get(path);
    return res.data;
}

export async function sapPost(companyCode: CountryCode, path: string, data: any): Promise<any> {
    const client = await sapService.getClient(companyCode);
    const res = await client.post(path, data);
    return res.data;
}

async function sapPatch(companyCode: CountryCode, path: string, data: any): Promise<any> {
    const client = await sapService.getClient(companyCode);
    const res = await client.patch(path, data);
    return res.data;
}

// ─── SalesPersons Cache (para resolver owner names) ──
// I-9: Cache with 30-minute TTL to pick up new sales reps
const SP_CACHE_TTL = 30 * 60 * 1000;
const spCache = new Map<string, { data: Map<number, string>; loadedAt: number }>();

export async function loadSalesPersons(companyCode: CountryCode): Promise<Map<number, string>> {
    const cached = spCache.get(companyCode);
    if (cached && (Date.now() - cached.loadedAt < SP_CACHE_TTL)) return cached.data;
    try {
        const data = await sapGet(companyCode, 'SalesPersons?$select=SalesEmployeeCode,SalesEmployeeName&$top=500');
        const map = new Map<number, string>();
        for (const sp of data.value || []) {
            map.set(sp.SalesEmployeeCode, sp.SalesEmployeeName || '');
        }
        spCache.set(companyCode, { data: map, loadedAt: Date.now() });
        return map;
    } catch {
        return cached?.data || new Map();
    }
}

function resolveOwner(code: number | undefined, spMap: Map<number, string>): any {
    const name = (spMap.get(code ?? -1) || '').trim();
    const parts = name.split(' ');
    return {
        id: String(code ?? -1),
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
    };
}

// ─── Helper: combinar filtro de usuario con filtro de query ─
function withSalesPersonFilter(baseFilter: string, salesPersonCode?: number): string {
    if (salesPersonCode == null) return baseFilter;
    return `(${baseFilter}) and SalesPersonCode eq ${salesPersonCode}`;
}

// ─── ACCOUNTS (BusinessPartners) ──────────────────────
export async function getAccounts(companyCode: CountryCode, params: PaginationParams = {}, salesPersonCode?: number): Promise<SapListResponse<any>> {
    const spMap = await loadSalesPersons(companyCode);
    let filter = params.search
        ? `CardType eq 'C' and contains(CardName,'${escapeOData(params.search)}')`
        : "CardType eq 'C'";
    filter = withSalesPersonFilter(filter, salesPersonCode);
    const path = buildQuery('BusinessPartners',
        'CardCode,CardName,Phone1,Website,Country,Industry,Valid,SalesPersonCode',
        { top: params.top || 50, skip: params.skip || 0, filter, orderBy: params.orderBy || 'CardName asc' }
    );
    const data = await sapGet(companyCode, path);
    const items = (data.value || []).map((bp: any) => mapAccount(bp, spMap));
    return { data: items, total: Number(data['odata.count']) || items.length };
}

export async function getAccountById(companyCode: CountryCode, cardCode: string): Promise<any> {
    const spMap = await loadSalesPersons(companyCode);
    const data = await sapGet(companyCode, `BusinessPartners('${cardCode}')?$select=CardCode,CardName,Phone1,Phone2,Website,Country,Industry,Valid,SalesPersonCode,ContactEmployees`);
    const account = mapAccount(data, spMap);
    account.contacts = (data.ContactEmployees || []).map((cp: any) => mapContact(cp, cardCode, data.CardName || cardCode, data.SalesPersonCode, spMap));
    return account;
}

function mapAccount(bp: any, spMap: Map<number, string>): any {
    return {
        id: bp.CardCode,
        name: bp.CardName || bp.CardCode,
        sapId: bp.CardCode,
        phone: bp.Phone1 || null,
        website: bp.Website || null,
        country: bp.Country || null,
        industry: bp.Industry != null ? String(bp.Industry) : null,
        isActive: bp.Valid === 'tYES' || bp.Valid === 'Y',
        accountType: 'Customer',
        owner: resolveOwner(bp.SalesPersonCode, spMap),
        _count: { contacts: 0, opportunities: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

// ─── CONTACTS (ContactEmployees) ──────────────────────
export async function getContacts(companyCode: CountryCode, params: PaginationParams = {}, salesPersonCode?: number): Promise<SapListResponse<any>> {
    const spMap = await loadSalesPersons(companyCode);
    let filter = params.search
        ? `CardType eq 'C' and contains(CardName,'${escapeOData(params.search)}')`
        : "CardType eq 'C'";
    filter = withSalesPersonFilter(filter, salesPersonCode);

    // Paginar BPs siguiendo odata.nextLink de SAP (max 500 BPs para evitar timeouts)
    const MAX_BPS = 500;
    const allContacts: any[] = [];
    let url: string | null = buildQuery('BusinessPartners',
        'CardCode,CardName,SalesPersonCode,ContactEmployees',
        { filter }
    );
    let bpCount = 0;
    while (url && bpCount < MAX_BPS) {
        const data = await sapGet(companyCode, url);
        for (const bp of data.value || []) {
            for (const cp of bp.ContactEmployees || []) {
                allContacts.push(mapContact(cp, bp.CardCode, bp.CardName, bp.SalesPersonCode, spMap));
            }
        }
        bpCount += (data.value || []).length;
        url = data['odata.nextLink'] || null;
    }

    // Aplicar paginación sobre la lista total de contactos
    const start = params.skip || 0;
    const end = start + (params.top || 50);
    return { data: allContacts.slice(start, end), total: allContacts.length };
}

function mapContact(cp: any, cardCode: string, cardName: string, salesPersonCode?: number, spMap?: Map<number, string>): any {
    const parts = (cp.Name || '').trim().split(' ');
    return {
        id: `${cardCode}-${cp.InternalCode || cp.Name}`,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: cp.E_Mail || null,
        phone: cp.Phone1 || null,
        mobile: cp.MobilePhone || null,
        jobTitle: cp.Position || null,
        isActive: cp.Active === 'tYES' || cp.Active === 'Y',
        accountId: cardCode,
        accountName: cardName || cardCode,
        owner: spMap ? resolveOwner(salesPersonCode, spMap) : { id: String(salesPersonCode ?? -1), firstName: '', lastName: '' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

// ─── PRODUCTS (Items) ─────────────────────────────────
export async function getProducts(companyCode: CountryCode, params: PaginationParams = {}): Promise<SapListResponse<any>> {
    const filter = params.search
        ? `contains(ItemName,'${escapeOData(params.search)}')`
        : undefined;
    // Don't use $select — SAP omits collection properties like ItemPrices when $select is used
    const parts: string[] = ['$inlinecount=allpages'];
    parts.push(`$top=${params.top || 50}`);
    parts.push(`$skip=${params.skip || 0}`);
    if (filter) parts.push(`$filter=${filter}`);
    parts.push('$orderby=ItemName asc');
    const path = `Items?${parts.join('&')}`;
    const data = await sapGet(companyCode, path);
    const items = (data.value || []).map(mapProduct);
    return { data: items, total: Number(data['odata.count']) || items.length };
}

function mapProduct(item: any): any {
    // Get price from price lists, trying multiple fallbacks
    let price = 0;
    if (item.ItemPrices && Array.isArray(item.ItemPrices)) {
        // Priority: PriceList 1 (default) → first non-zero price → any price
        const defaultPrice = item.ItemPrices.find((p: any) => p.PriceList === 1 && Number(p.Price) > 0);
        const anyNonZero = item.ItemPrices.find((p: any) => Number(p.Price) > 0);
        const fallback = item.ItemPrices[0];
        price = Number((defaultPrice || anyNonZero || fallback)?.Price) || 0;
    }
    return {
        id: item.ItemCode,
        code: item.ItemCode,
        name: item.ItemName || item.ItemCode,
        category: item.ItemsGroupCode != null ? String(item.ItemsGroupCode) : 'General',
        price,
        currency: 'USD',
        stockLevel: Number(item.QuantityOnStock) || 0,
        isActive: item.Frozen !== 'tYES' && item.Frozen !== 'Y',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

// ─── QUOTES (Quotations) ─────────────────────────────
export async function getQuotes(companyCode: CountryCode, params: PaginationParams = {}, salesPersonCode?: number): Promise<SapListResponse<any>> {
    const spMap = await loadSalesPersons(companyCode);
    const filter = salesPersonCode != null
        ? (params.filter ? `(${params.filter}) and SalesPersonCode eq ${salesPersonCode}` : `SalesPersonCode eq ${salesPersonCode}`)
        : params.filter;
    const path = buildQuery('Quotations',
        'DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode',
        { top: params.top || 50, skip: params.skip || 0, orderBy: params.orderBy || 'DocDate desc', filter }
    );
    const data = await sapGet(companyCode, path);
    const items = (data.value || []).map((q: any) => mapQuote(q, spMap));
    return { data: items, total: Number(data['odata.count']) || items.length };
}

export async function getQuoteById(companyCode: CountryCode, docEntry: string): Promise<any> {
    const spMap = await loadSalesPersons(companyCode);
    const data = await sapGet(companyCode, `Quotations(${docEntry})`);
    const quote = mapQuote(data, spMap);
    quote.items = (data.DocumentLines || []).map(mapDocLine);
    // Trazabilidad: buscar órdenes derivadas de esta cotización
    try {
        const ordersFromQuote = await sapGet(companyCode,
            `Orders?$filter=DocumentLines/any(d: d/BaseEntry eq ${docEntry} and d/BaseType eq 23)&$select=DocEntry,DocNum,DocTotal,DocDate,DocumentStatus&$top=10`
        );
        quote.linkedOrders = (ordersFromQuote.value || []).map((o: any) => ({
            docEntry: o.DocEntry, docNum: o.DocNum, total: Number(o.DocTotal) || 0, date: o.DocDate,
            status: o.DocumentStatus === 'bost_Close' ? 'Cerrada' : 'Abierta',
        }));
    } catch { quote.linkedOrders = []; }
    return quote;
}

function mapQuote(q: any, spMap: Map<number, string>): any {
    return {
        id: String(q.DocEntry),
        sapDocNum: q.DocNum,
        sapDocEntry: q.DocEntry,
        quoteNumber: `QT-${q.DocNum}`,
        name: `${q.CardName || q.CardCode} - QT-${q.DocNum}`,
        totalAmount: Number(q.DocTotal) || 0,
        currency: 'USD',
        status: q.DocumentStatus === 'bost_Close' ? 'ACCEPTED' : q.DocumentStatus === 'bost_Open' ? 'SENT' : 'DRAFT',
        expirationDate: q.DocDueDate || null,
        account: { name: q.CardName || q.CardCode },
        owner: resolveOwner(q.SalesPersonCode, spMap),
        createdAt: q.DocDate || new Date().toISOString(),
        updatedAt: q.DocDate || new Date().toISOString(),
    };
}

// ─── ORDERS ───────────────────────────────────────────
export async function getOrders(companyCode: CountryCode, params: PaginationParams = {}, salesPersonCode?: number): Promise<SapListResponse<any>> {
    const spMap = await loadSalesPersons(companyCode);
    const filter = salesPersonCode != null
        ? (params.filter ? `(${params.filter}) and SalesPersonCode eq ${salesPersonCode}` : `SalesPersonCode eq ${salesPersonCode}`)
        : params.filter;
    const path = buildQuery('Orders',
        'DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode',
        { top: params.top || 50, skip: params.skip || 0, orderBy: params.orderBy || 'DocDate desc', filter }
    );
    const data = await sapGet(companyCode, path);
    const items = (data.value || []).map((o: any) => mapOrder(o, spMap));
    return { data: items, total: Number(data['odata.count']) || items.length };
}

export async function getOrderById(companyCode: CountryCode, docEntry: string): Promise<any> {
    const spMap = await loadSalesPersons(companyCode);
    const data = await sapGet(companyCode, `Orders(${docEntry})`);
    const order = mapOrder(data, spMap);
    order.items = (data.DocumentLines || []).map(mapDocLine);
    // Trazabilidad: buscar cotización origen y facturas derivadas
    const baseLine = (data.DocumentLines || [])[0];
    if (baseLine?.BaseType === 23 && baseLine?.BaseEntry) {
        order.linkedQuote = { docEntry: baseLine.BaseEntry };
    }
    try {
        const invoicesFromOrder = await sapGet(companyCode,
            `Invoices?$filter=DocumentLines/any(d: d/BaseEntry eq ${docEntry} and d/BaseType eq 17)&$select=DocEntry,DocNum,DocTotal,DocDate,PaidToDate&$top=10`
        );
        order.linkedInvoices = (invoicesFromOrder.value || []).map((i: any) => ({
            docEntry: i.DocEntry, docNum: i.DocNum, total: Number(i.DocTotal) || 0, date: i.DocDate,
            paid: Number(i.PaidToDate) || 0,
        }));
    } catch { order.linkedInvoices = []; }
    return order;
}

function mapOrder(o: any, spMap: Map<number, string>): any {
    return {
        id: String(o.DocEntry),
        sapDocNum: o.DocNum,
        sapDocEntry: o.DocEntry,
        orderNumber: `ORD-${o.DocNum}`,
        sapOrderId: String(o.DocEntry),
        totalAmount: Number(o.DocTotal) || 0,
        currency: 'USD',
        status: o.DocumentStatus === 'bost_Close' ? 'DELIVERED' : 'PROCESSING',
        logisticsStatus: null,
        trackingNumber: null,
        dueDate: o.DocDueDate || null,
        account: { name: o.CardName || o.CardCode },
        owner: resolveOwner(o.SalesPersonCode, spMap),
        createdAt: o.DocDate || new Date().toISOString(),
        updatedAt: o.DocDate || new Date().toISOString(),
    };
}

// ─── INVOICES ─────────────────────────────────────────
export async function getInvoices(companyCode: CountryCode, params: PaginationParams = {}, salesPersonCode?: number): Promise<SapListResponse<any>> {
    const filter = salesPersonCode != null
        ? (params.filter ? `(${params.filter}) and SalesPersonCode eq ${salesPersonCode}` : `SalesPersonCode eq ${salesPersonCode}`)
        : params.filter;
    const path = buildQuery('Invoices',
        'DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,PaidToDate,SalesPersonCode',
        { top: params.top || 50, skip: params.skip || 0, orderBy: params.orderBy || 'DocDate desc', filter }
    );
    const data = await sapGet(companyCode, path);
    const items = (data.value || []).map(mapInvoice);
    return { data: items, total: Number(data['odata.count']) || items.length };
}

export async function getInvoiceStats(companyCode: CountryCode, salesPersonCode?: number): Promise<any> {
    const client = await sapService.getClient(companyCode);
    const spFilter = salesPersonCode != null ? ` and SalesPersonCode eq ${salesPersonCode}` : '';
    // Fetch all open/recent invoices to compute real stats
    const res = await client.get(
        `Invoices?$select=DocTotal,PaidToDate,DocDueDate&$filter=DocDate ge '${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]}'${spFilter}&$top=1000`
    ).catch(() => ({ data: { value: [] } }));
    const invoices: any[] = res.data.value || [];
    const now = new Date();
    let paid = 0, pending = 0, overdue = 0;
    for (const inv of invoices) {
        const amount = Number(inv.DocTotal) || 0;
        const paidAmt = Number(inv.PaidToDate) || 0;
        const due = inv.DocDueDate ? new Date(inv.DocDueDate) : now;
        if (paidAmt >= amount && amount > 0) paid += amount;
        else if (due < now) overdue += amount;
        else pending += amount;
    }
    return { paid, pending, overdue, count: invoices.length };
}

export async function getInvoiceById(companyCode: CountryCode, docEntry: string): Promise<any> {
    const data = await sapGet(companyCode, `Invoices(${docEntry})`);
    const invoice = mapInvoice(data);
    invoice.items = (data.DocumentLines || []).map(mapDocLine);
    return invoice;
}

function mapInvoice(inv: any): any {
    const amount = Number(inv.DocTotal) || 0;
    const paid = Number(inv.PaidToDate) || 0;
    const dueDate = inv.DocDueDate ? new Date(inv.DocDueDate) : new Date();
    let status: string;
    if (paid >= amount && amount > 0) status = 'PAID';
    else if (paid > 0) status = 'PARTIAL';
    else if (dueDate < new Date()) status = 'OVERDUE';
    else status = 'UNPAID';

    return {
        id: String(inv.DocEntry),
        sapDocNum: inv.DocNum,
        sapDocEntry: inv.DocEntry,
        invoiceNumber: `INV-${inv.DocNum}`,
        sapInvoiceId: String(inv.DocEntry),
        amount,
        paidAmount: paid,
        status,
        dueDate: inv.DocDueDate || null,
        paidDate: status === 'PAID' ? new Date().toISOString() : null,
        account: { name: inv.CardName || inv.CardCode },
        createdAt: inv.DocDate || new Date().toISOString(),
        updatedAt: inv.DocDate || new Date().toISOString(),
    };
}

// ─── ACTIVITIES ───────────────────────────────────────
// Helper: resolve CardCode → CardName in batch from BusinessPartners
async function resolveCardNames(companyCode: CountryCode, cardCodes: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (cardCodes.length === 0) return map;
    try {
        const filterStr = cardCodes.slice(0, 50).map(c => `CardCode eq '${c}'`).join(' or ');
        const data = await sapGet(companyCode, `BusinessPartners?$select=CardCode,CardName&$filter=${filterStr}`);
        for (const bp of data.value || []) map.set(bp.CardCode, bp.CardName);
    } catch { /* fallback to CardCode */ }
    return map;
}

export async function getActivities(companyCode: CountryCode, params: PaginationParams = {}, salesPersonCode?: number): Promise<SapListResponse<any>> {
    const spMap = await loadSalesPersons(companyCode);
    // Activities use HandledBy instead of SalesPersonCode
    const filter = salesPersonCode != null
        ? (params.filter ? `(${params.filter}) and HandledBy eq ${salesPersonCode}` : `HandledBy eq ${salesPersonCode}`)
        : params.filter;
    // Note: CardName is NOT a valid field on SAP Activities entity — resolve separately
    const path = buildQuery('Activities',
        'ActivityCode,ActivityType,Subject,Notes,StartDate,EndDate,CloseDate,Status,CardCode,ContactPersonCode,HandledBy',
        { top: params.top || 50, skip: params.skip || 0, orderBy: params.orderBy || 'StartDate desc', filter }
    );
    const data = await sapGet(companyCode, path);
    const activities = data.value || [];
    // Batch-resolve CardCode → CardName
    const uniqueCodes = [...new Set(activities.map((a: any) => a.CardCode).filter(Boolean))] as string[];
    const cardNameMap = await resolveCardNames(companyCode, uniqueCodes);
    // Batch-resolve ContactPersonCode → contact name from BusinessPartners ContactEmployees
    const contactsToResolve = activities.filter((a: any) => a.CardCode && a.ContactPersonCode != null && a.ContactPersonCode >= 0);
    if (contactsToResolve.length > 0) {
        try {
            const resolvedCards = [...new Set(contactsToResolve.map((a: any) => a.CardCode))] as string[];
            for (const cardCode of resolvedCards.slice(0, 20)) {
                const bpData = await sapGet(companyCode, `BusinessPartners('${cardCode}')?$select=ContactEmployees`);
                const employees = bpData.ContactEmployees || [];
                for (const act of activities) {
                    if (act.CardCode === cardCode && act.ContactPersonCode != null) {
                        const emp = employees.find((e: any) => e.InternalCode === act.ContactPersonCode);
                        if (emp) act._contactName = [emp.FirstName, emp.LastName].filter(Boolean).join(' ');
                    }
                }
            }
        } catch { /* fallback to ContactPersonCode number */ }
    }
    for (const act of activities) act.CardName = cardNameMap.get(act.CardCode) || act.CardCode;
    const items = activities.map((act: any) => mapActivity(act, spMap));
    return { data: items, total: Number(data['odata.count']) || items.length };
}

const ACT_TYPE_MAP: Record<number, string> = { [-1]: 'Task', 0: 'Call', 1: 'Meeting', 2: 'Task', 3: 'Note', 4: 'Email' };
// SAP returns Status as integer (-2=Open, -3=Closed) or string enum (cn_Open, cn_Closed, cn_Cancel)
const ACT_STATUS_MAP: Record<string, string> = { cn_Open: 'Planned', cn_Closed: 'Completed', cn_Cancel: 'Cancelled', '-2': 'Planned', '-3': 'Completed' };

function mapActivity(act: any, spMap: Map<number, string>): any {
    const typeLabel = ACT_TYPE_MAP[act.ActivityType] || 'Actividad';
    // SAP Subject is an integer ID, not a description. Use Notes as primary subject.
    const subject = act.Notes
        ? (act.Notes.length > 120 ? act.Notes.substring(0, 120) + '...' : act.Notes)
        : `${typeLabel} #${act.ActivityCode}`;

    // Resolve contact from ContactPersonCode if available
    const contact = act.ContactPersonCode != null && act.ContactPersonCode >= 0
        ? { id: String(act.ContactPersonCode), name: act._contactName || `Contacto #${act.ContactPersonCode}` }
        : null;

    return {
        id: String(act.ActivityCode),
        activityType: typeLabel,
        subject,
        description: act.Notes || null,
        dueDate: act.EndDate || act.CloseDate || act.StartDate || null,
        status: ACT_STATUS_MAP[act.Status] || 'Planned',
        priority: null,
        isCompleted: act.Status === 'cn_Closed' || act.Status === -3,
        completedAt: (act.Status === 'cn_Closed' || act.Status === -3) ? (act.CloseDate || act.StartDate) : null,
        account: act.CardCode ? { id: act.CardCode, name: act.CardName || act.CardCode } : null,
        contact,
        opportunity: null,
        owner: resolveOwner(act.HandledBy, spMap),
        createdAt: act.StartDate || new Date().toISOString(),
        updatedAt: act.StartDate || new Date().toISOString(),
    };
}

// ─── Document Line Items ──────────────────────────────
function mapDocLine(line: any): any {
    return {
        id: String(line.LineNum),
        productId: line.ItemCode,
        product: { id: line.ItemCode, code: line.ItemCode, name: line.ItemDescription || line.ItemCode },
        quantity: Number(line.Quantity) || 1,
        unitPrice: Number(line.UnitPrice) || Number(line.Price) || 0,
        totalPrice: Number(line.LineTotal) || 0,
        discount: Number(line.DiscountPercent) || 0,
    };
}

// ─── DASHBOARD Stats (aggregated from SAP — all real data) ────────────
export async function getDashboardStats(companyCode: CountryCode, salesPersonCode?: number, months: number = 6): Promise<any> {
    const client = await sapService.getClient(companyCode);
    const spFilter = salesPersonCode != null ? ` and SalesPersonCode eq ${salesPersonCode}` : '';
    const spFilterLead = salesPersonCode != null ? `&$filter=SalesPersonCode eq ${salesPersonCode}` : '';

    const now = new Date();
    const rangeMonths = Math.max(1, Math.min(months, 24));
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - (rangeMonths - 1), 1);
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    const fmtD = (d: Date) => d.toISOString().split('T')[0];

    const [openOrdersRes, openQuotesRes, closedOrdersRes, invoicesRes, activitiesRes, salesPersonsRes] = await Promise.all([
        client.get(`Orders?$select=DocTotal,DocEntry,DocNum,CardName,DocDate&$filter=DocumentStatus eq 'bost_Open'${spFilter}&$orderby=DocDate desc&$top=500&$inlinecount=allpages`).catch(() => ({ data: { value: [] } })),
        client.get(`Quotations?$select=DocTotal,DocEntry,DocNum,CardName,DocDate&$filter=DocumentStatus eq 'bost_Open'${spFilter}&$orderby=DocDate desc&$top=500&$inlinecount=allpages`).catch(() => ({ data: { value: [] } })),
        client.get(`Orders?$select=DocEntry&$filter=DocumentStatus eq 'bost_Close'${spFilter}&$top=0&$inlinecount=allpages`).catch(() => ({ data: {} })),
        client.get(`Invoices?$select=DocTotal,DocDate,SalesPersonCode,DocEntry,DocNum,CardName&$filter=DocDate ge '${fmtD(sixMonthsAgo)}'${spFilter}&$orderby=DocDate desc&$top=500`).catch(() => ({ data: { value: [] } })),
        client.get(`Activities?$select=ActivityDate,ActivityType,Status,CardCode,Subject&$filter=ActivityDate ge '${fmtD(weekStart)}'${salesPersonCode != null ? ` and HandledBy eq ${salesPersonCode}` : ''}&$top=500`).catch(() => ({ data: { value: [] } })),
        client.get(`SalesPersons?$select=SalesEmployeeCode,SalesEmployeeName&$top=500`).catch(() => ({ data: { value: [] } })),
    ]);

    const openOrders: any[] = openOrdersRes.data.value || [];
    const openQuotes: any[] = openQuotesRes.data.value || [];
    const openOrdersCount = Number(openOrdersRes.data['odata.count'] || openOrders.length);
    const openQuotesCount = Number(openQuotesRes.data['odata.count'] || openQuotes.length);
    const closedOrdersCount = Number(closedOrdersRes.data['odata.count'] || 0);
    const invoices: any[] = invoicesRes.data.value || [];
    const activities: any[] = activitiesRes.data.value || [];
    const salesPersons: any[] = salesPersonsRes.data.value || [];

    // Resolve CardCode → CardName for activities (CardName is not a valid Activities field)
    if (activities.length > 0) {
        const actCardNames = await resolveCardNames(companyCode,
            [...new Set(activities.map(a => a.CardCode).filter(Boolean))] as string[]);
        for (const a of activities) a.CardName = actCardNames.get(a.CardCode) || a.CardCode;
    }

    // Pipeline totals
    const pipelineOrdersValue = openOrders.reduce((s, o) => s + (Number(o.DocTotal) || 0), 0);
    const pipelineQuotesValue = openQuotes.reduce((s, o) => s + (Number(o.DocTotal) || 0), 0);

    // Revenue by month (from invoices)
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const revenueByMonth: Record<string, number> = {};
    for (const inv of invoices) {
        const d = new Date(inv.DocDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        revenueByMonth[key] = (revenueByMonth[key] || 0) + (Number(inv.DocTotal) || 0);
    }

    // Revenue chart: last N months
    const monthValues: number[] = [];
    const revenueChart: any[] = [];
    for (let i = rangeMonths - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const rev = revenueByMonth[key] || 0;
        monthValues.push(rev);
        revenueChart.push({ month: monthNames[d.getMonth()], revenue: Math.round(rev), target: 0 });
    }
    const nonZero = monthValues.filter(v => v > 0);
    const avgRevenue = nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
    const target = Math.round(avgRevenue);
    for (const item of revenueChart) item.target = target;

    // Current & previous month revenue for trend
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevD = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}`;
    const revenueMTD = revenueByMonth[curKey] || 0;
    const prevRevenue = revenueByMonth[prevKey] || 0;
    const trendPct = prevRevenue > 0 ? Math.round(((revenueMTD - prevRevenue) / prevRevenue) * 100) : 0;
    const trendStr = trendPct >= 0 ? `+${trendPct}%` : `${trendPct}%`;

    // Mix pipeline: pedidos / (pedidos + cotizaciones) — composición del pipeline actual
    const winDenom = openOrdersCount + openQuotesCount;
    const winRate = winDenom > 0 ? Math.round((openOrdersCount / winDenom) * 100) : 0;

    // Pipeline chart (embudo)
    const pipelineChart = [
        { stage: 'Cotizaciones', value: Math.round(pipelineQuotesValue) },
        { stage: 'Órdenes Abiertas', value: Math.round(pipelineOrdersValue) },
    ];

    // Activity chart: this week by day
    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const actByDay: Record<string, { calls: number; meetings: number; tasks: number }> = {};
    for (const label of ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']) {
        actByDay[label] = { calls: 0, meetings: 0, tasks: 0 };
    }
    for (const act of activities) {
        const d = new Date(act.ActivityDate);
        const label = dayLabels[d.getDay()];
        if (!actByDay[label]) continue;
        const t = String(act.ActivityType || '');
        if (t === 'cn_PhoneCall' || t.includes('Phone')) actByDay[label].calls++;
        else if (t === 'cn_Meeting' || t.includes('Meeting')) actByDay[label].meetings++;
        else actByDay[label].tasks++;
    }
    const activityChart = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map(day => ({
        day, ...actByDay[day],
    }));

    // Top sellers (from invoices by SalesPersonCode)
    const sellerTotals: Record<number, { total: number; count: number }> = {};
    for (const inv of invoices) {
        const code = Number(inv.SalesPersonCode);
        if (code < 0) continue;
        if (!sellerTotals[code]) sellerTotals[code] = { total: 0, count: 0 };
        sellerTotals[code].total += Number(inv.DocTotal) || 0;
        sellerTotals[code].count++;
    }
    const spNames: Record<number, string> = {};
    for (const sp of salesPersons) spNames[Number(sp.SalesEmployeeCode)] = sp.SalesEmployeeName;
    const topSellers = Object.entries(sellerTotals)
        .map(([code, v]) => ({ name: spNames[Number(code)] || `Vendedor ${code}`, deals: v.count, revenue: Math.round(v.total) }))
        .filter(s => !['Stia', 'STIA', 'stia'].includes(s.name.trim()))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    const openActivitiesCount = activities.filter(a => a.Status === 'cn_Open' || a.Status === '-2').length;

    // ─── Drill-down documents for KPI cards ─────────────────────
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();
    const currentMonthInvoices = invoices
        .filter(inv => { const d = new Date(inv.DocDate); return d.getMonth() === curMonth && d.getFullYear() === curYear; })
        .slice(0, 20)
        .map(inv => ({ docEntry: inv.DocEntry, docNum: inv.DocNum, client: inv.CardName || '-', amount: Number(inv.DocTotal) || 0, date: inv.DocDate, type: 'invoice' }));

    const topQuotes = openQuotes.slice(0, 20).map(q => ({
        docEntry: q.DocEntry, docNum: q.DocNum, client: q.CardName || '-', amount: Number(q.DocTotal) || 0, date: q.DocDate, type: 'quote',
    }));
    const topOrders = openOrders.slice(0, 20).map(o => ({
        docEntry: o.DocEntry, docNum: o.DocNum, client: o.CardName || '-', amount: Number(o.DocTotal) || 0, date: o.DocDate, type: 'order',
    }));

    const activityTypeLabel = (t: string) => {
        if (t === 'cn_PhoneCall' || t.includes('Phone')) return 'Llamada';
        if (t === 'cn_Meeting' || t.includes('Meeting')) return 'Reunión';
        return 'Tarea';
    };
    const topActivities = activities.slice(0, 20).map(a => ({
        subject: a.Subject || activityTypeLabel(String(a.ActivityType || '')),
        client: a.CardName || '-',
        date: a.ActivityDate,
        activityType: activityTypeLabel(String(a.ActivityType || '')),
        status: a.Status === 'cn_Open' || a.Status === '-2' ? 'Abierta' : 'Cerrada',
    }));

    return {
        revenue: { mtd: revenueMTD, target, percentage: target > 0 ? (revenueMTD / target) * 100 : 0, trend: trendStr },
        pipeline: { value: openOrdersCount, weighted: Math.round(pipelineOrdersValue + pipelineQuotesValue), deals: openQuotesCount },
        winRate: { percentage: winRate, trend: `${openOrdersCount} pedidos de ${winDenom} docs` },
        activities: { today: openActivitiesCount, thisWeek: activities.length, overdue: 0 },
        charts: { revenue: revenueChart, pipeline: pipelineChart, activity: activityChart, topSellers },
        drilldown: {
            revenue: currentMonthInvoices,
            quotes: topQuotes,
            orders: topOrders,
            activities: topActivities,
        },
    };
}

// ─── "Mi Día" — Resumen diario para vendedores ─────────
export async function getMyDay(companyCode: CountryCode, salesPersonCode?: number): Promise<any> {
    const client = await sapService.getClient(companyCode);
    const spFilter = salesPersonCode != null ? ` and SalesPersonCode eq ${salesPersonCode}` : '';
    const handledByFilter = salesPersonCode != null ? ` and HandledBy eq ${salesPersonCode}` : '';
    const now = new Date();
    const fmtD = (d: Date) => d.toISOString().split('T')[0];
    const today = fmtD(now);
    const in7Days = fmtD(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7));

    const [overdueInvRes, expiringQuotesRes, todayActivitiesRes] = await Promise.all([
        // Facturas vencidas (DocDueDate < hoy, no pagadas completamente)
        client.get(`Invoices?$select=DocEntry,DocNum,CardName,DocTotal,DocDueDate,DocumentStatus&$filter=DocDueDate lt '${today}' and DocumentStatus eq 'bost_Open'${spFilter}&$orderby=DocDueDate asc&$top=10`)
            .catch(() => ({ data: { value: [] } })),
        // Cotizaciones que vencen en los próximos 7 días
        client.get(`Quotations?$select=DocEntry,DocNum,CardName,DocTotal,DocDueDate&$filter=DocumentStatus eq 'bost_Open' and DocDueDate ge '${today}' and DocDueDate le '${in7Days}'${spFilter}&$orderby=DocDueDate asc&$top=10`)
            .catch(() => ({ data: { value: [] } })),
        // Actividades de hoy (CardName is NOT a valid Activities field)
        client.get(`Activities?$select=ActivityCode,ActivityDate,ActivityType,Status,CardCode,Subject,StartTime&$filter=ActivityDate eq '${today}'${handledByFilter}&$top=20`)
            .catch(() => ({ data: { value: [] } })),
    ]);

    // Resolve CardCode → CardName for today's activities
    const todayActs: any[] = todayActivitiesRes.data.value || [];
    if (todayActs.length > 0) {
        const actCardNames = await resolveCardNames(companyCode,
            [...new Set(todayActs.map(a => a.CardCode).filter(Boolean))] as string[]);
        for (const a of todayActs) a.CardName = actCardNames.get(a.CardCode) || a.CardCode;
    }

    const overdueInvoices = (overdueInvRes.data.value || []).map((inv: any) => ({
        docEntry: inv.DocEntry, docNum: inv.DocNum, client: inv.CardName || '-',
        amount: Number(inv.DocTotal) || 0, dueDate: inv.DocDueDate,
        daysOverdue: Math.ceil((now.getTime() - new Date(inv.DocDueDate).getTime()) / 86400000),
    }));

    const expiringQuotes = (expiringQuotesRes.data.value || []).map((q: any) => ({
        docEntry: q.DocEntry, docNum: q.DocNum, client: q.CardName || '-',
        amount: Number(q.DocTotal) || 0, dueDate: q.DocDueDate,
        daysLeft: Math.ceil((new Date(q.DocDueDate).getTime() - now.getTime()) / 86400000),
    }));

    const actTypeLabel = (t: string) => {
        if (t === 'cn_PhoneCall' || t?.includes('Phone')) return 'Llamada';
        if (t === 'cn_Meeting' || t?.includes('Meeting')) return 'Reunión';
        return 'Tarea';
    };
    const todayActivities = todayActs.map((a: any) => ({
        id: a.ActivityCode, subject: a.Subject || actTypeLabel(String(a.ActivityType || '')),
        client: a.CardName || '-', type: actTypeLabel(String(a.ActivityType || '')),
        time: a.StartTime ? String(a.StartTime).substring(0, 5) : '',
        status: a.Status === 'cn_Open' || a.Status === '-2' ? 'Pendiente' : 'Completada',
    }));

    return { overdueInvoices, expiringQuotes, todayActivities };
}
