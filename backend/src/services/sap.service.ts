import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { COMPANIES, CompanyConfig, CountryCode } from '../config/companies';

interface Session {
    sessionId: string;
    lastUsed: number;
}

class SapService {
    private static instance: SapService;
    private sessions: Map<string, Session> = new Map();
    private loginPromises: Map<string, Promise<string>> = new Map();
    private baseUrl: string = 'https://sap-stiacmzdr-sl.skyinone.net:50000/b1s/v1';
    private httpsAgent: https.Agent;

    private constructor() {
        // C-1: Require SAP credentials from environment — no hardcoded fallbacks
        if (!process.env.SAP_USER || !process.env.SAP_PASSWORD) {
            throw new Error('[SAP] SAP_USER and SAP_PASSWORD environment variables are required.');
        }

        // C-2: SSL verification is env-dependent
        const rejectUnauthorized = process.env.SAP_SSL_VERIFY !== 'false';
        this.httpsAgent = new https.Agent({ rejectUnauthorized });
        if (!rejectUnauthorized) {
            console.warn('[SAP] SSL verification disabled (SAP_SSL_VERIFY=false). Use only for self-signed certs.');
        }
    }

    public static getInstance(): SapService {
        if (!SapService.instance) {
            SapService.instance = new SapService();
        }
        return SapService.instance;
    }

    // C-3: Login deduplication mutex — prevents race condition when multiple
    // concurrent requests trigger login for the same company simultaneously
    private async login(companyCode: CountryCode): Promise<string> {
        // If a login is already in progress for this company, reuse it
        const pending = this.loginPromises.get(companyCode);
        if (pending) return pending;

        const loginPromise = this.doLogin(companyCode).finally(() => {
            this.loginPromises.delete(companyCode);
        });
        this.loginPromises.set(companyCode, loginPromise);
        return loginPromise;
    }

    private async doLogin(companyCode: CountryCode): Promise<string> {
        const company = COMPANIES[companyCode];
        if (!company) throw new Error(`Invalid company code: ${companyCode}`);

        try {
            const response = await axios.post(`${this.baseUrl}/Login`, {
                CompanyDB: company.dbName,
                UserName: process.env.SAP_USER,
                Password: process.env.SAP_PASSWORD,
            }, { httpsAgent: this.httpsAgent });

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
            httpsAgent: this.httpsAgent,
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
