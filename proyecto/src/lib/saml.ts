import { SAML } from "@node-saml/node-saml";

/**
 * Configuración SAML para integración con ADFS corporativo.
 * Variables de entorno requeridas (ver .env.example):
 *   SAML_ENTRY_POINT    - URL de login del ADFS
 *   SAML_ISSUER         - Entity ID de esta app
 *   SAML_CALLBACK_URL   - URL donde ADFS enviará la respuesta
 *   SAML_IDP_CERT       - Certificado público del IDP (base64, sin headers)
 */
export function getSamlInstance(): SAML {
  const entryPoint = process.env.SAML_ENTRY_POINT;
  const issuer = process.env.SAML_ISSUER;
  const callbackUrl = process.env.SAML_CALLBACK_URL;
  const idpCert = process.env.SAML_IDP_CERT;

  if (!entryPoint || !issuer || !callbackUrl || !idpCert) {
    throw new Error(
      "Faltan variables de entorno SAML. Revisar SAML_ENTRY_POINT, SAML_ISSUER, SAML_CALLBACK_URL, SAML_IDP_CERT"
    );
  }

  return new SAML({
    entryPoint,
    issuer,
    callbackUrl,
    idpCert,
    signatureAlgorithm: "sha256",
    identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
    wantAssertionsSigned: true,
    acceptedClockSkewMs: 5000,
  });
}

/**
 * Atributos esperados en la respuesta SAML del ADFS:
 *   nameID / email   → email del usuario
 *   displayName      → nombre completo
 *   sAMAccountName   → usuario de dominio
 *   groups           → grupos AD (para mapeo de roles)
 */
export interface SamlUser {
  email: string;
  name: string;
  samAccountName: string;
  groups: string[];
}

export function extractSamlUser(profile: Record<string, unknown>): SamlUser {
  const get = (keys: string[]): string => {
    for (const key of keys) {
      const val = profile[key];
      if (val) return String(val);
    }
    return "";
  };

  const groups = (() => {
    const raw =
      profile["http://schemas.microsoft.com/ws/2008/06/identity/claims/groups"] ||
      profile["groups"];
    if (!raw) return [];
    return Array.isArray(raw) ? raw.map(String) : [String(raw)];
  })();

  return {
    email:
      get([
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
        "email",
        "nameID",
      ]) || (profile.nameID as string) || "",
    name: get([
      "http://schemas.microsoft.com/identity/claims/displayname",
      "displayName",
      "name",
    ]),
    samAccountName: get([
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
      "sAMAccountName",
    ]),
    groups,
  };
}
