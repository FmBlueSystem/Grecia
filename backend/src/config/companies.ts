
export enum CountryCode {
    GT = 'GT',
    SV = 'SV',
    HN = 'HN',
    CR = 'CR',
    PA = 'PA',
}

export interface CompanyConfig {
    code: CountryCode;
    name: string;
    dbName: string;
    currency: string;
}

export const COMPANIES: Record<CountryCode, CompanyConfig> = {
    [CountryCode.GT]: {
        code: CountryCode.GT,
        name: 'Guatemala',
        dbName: 'SBO_GT_STIA_PROD',
        currency: 'GTQ'
    },
    [CountryCode.SV]: {
        code: CountryCode.SV,
        name: 'El Salvador',
        dbName: 'SBO_SV_STIA_FINAL',
        currency: 'USD'
    },
    [CountryCode.HN]: {
        code: CountryCode.HN,
        name: 'Honduras',
        dbName: 'SBO_HO_STIA_PROD',
        currency: 'HNL'
    },
    [CountryCode.CR]: {
        code: CountryCode.CR,
        name: 'Costa Rica',
        dbName: 'SBO_STIACR_PROD',
        currency: 'CRC'
    },
    [CountryCode.PA]: {
        code: CountryCode.PA,
        name: 'Panamá',
        dbName: 'SBO_PA_STIA_PROD', // Placeholder, pending confirmation
        currency: 'USD'
    }
};

export const DEFAULT_COMPANY = CountryCode.CR;
