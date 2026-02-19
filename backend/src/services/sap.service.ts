import axios, { AxiosInstance } from 'axios';
import { COMPANIES, CompanyConfig, CountryCode } from '../config/companies';

interface Session {
    sessionId: string;
    lastUsed: number;
}

class SapService {
    private static instance: SapService;
    private sessions: Map<string, Session> = new Map();
    private baseUrl: string = 'https://sap-stiacmzdr-sl.skyinone.net:50000/b1s/v1';

    private constructor() {
        if (!process.env.SAP_USER || !process.env.SAP_PASSWORD) {
            console.warn('[SAP] SAP_USER/SAP_PASSWORD no configurados — usando credenciales por defecto.');
        }
    }

    public static getInstance(): SapService {
        if (!SapService.instance) {
            SapService.instance = new SapService();
        }
        return SapService.instance;
    }

    private async login(companyCode: CountryCode): Promise<string> {
        const company = COMPANIES[companyCode];
        if (!company) throw new Error(`Invalid company code: ${companyCode}`);

        try {
            const response = await axios.post(`${this.baseUrl}/Login`, {
                CompanyDB: company.dbName,
                UserName: process.env.SAP_USER || 'stifmolina2',
                Password: process.env.SAP_PASSWORD || 'FmDiosMio1'
            });

            const sessionId = response.data.SessionId;
            this.sessions.set(companyCode, {
                sessionId,
                lastUsed: Date.now()
            });
            console.log(`[SAP] Logged in to ${company.name} (${company.dbName})`);
            return sessionId;
        } catch (error) {
            console.error(`[SAP] Login failed for ${company.name}`, error);
            throw error;
        }
    }

    private async getSessionId(companyCode: CountryCode): Promise<string> {
        const session = this.sessions.get(companyCode);
        // Simple expiration check (e.g., 25 mins). SAP SL usually 30 mins.
        if (session && (Date.now() - session.lastUsed < 25 * 60 * 1000)) {
            session.lastUsed = Date.now();
            return session.sessionId;
        }
        return this.login(companyCode);
    }

    public async getClient(companyCode: CountryCode): Promise<AxiosInstance> {
        const sessionId = await this.getSessionId(companyCode);

        const client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Cookie': `B1SESSION=${sessionId}`,
                'Prefer': 'odata.maxpagesize=500'
            },
            // Disable SSL verification for self-signed certs if needed (common in dev/private SAP)
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });

        // Add interceptor to handle 401 (Session Expired) -> Retry Login
        client.interceptors.response.use(undefined, async (err: any) => {
            if (err.response && err.response.status === 401) {
                console.log(`[SAP] Session expired for ${companyCode}, retrying...`);
                const newSessionId = await this.login(companyCode);
                err.config.headers['Cookie'] = `B1SESSION=${newSessionId}`;
                return axios.request(err.config);
            }
            return Promise.reject(err);
        });

        return client;
    }

    public async patch(companyCode: CountryCode, path: string, data: any): Promise<any> {
        const client = await this.getClient(companyCode);
        const response = await client.patch(`/${path}`, data);
        return response.data;
    }
}

export default SapService.getInstance();
