// src/server/prisma.js
//
// Prisma Client singleton with Azure Managed Identity authentication.
//
// Production: Fetches a short-lived Entra ID token via DefaultAzureCredential
// and injects it into DATABASE_URL. Token is refreshed every 45 minutes.
// No static password is stored anywhere.
//
// Development: Falls back to standard DATABASE_URL with password auth
// (from .env file) so local development doesn't require Azure credentials.
//
// Note: Prisma 6's driver adapter (PrismaPg) did not work — it ignored the
// adapter and connected via DATABASE_URL/localhost regardless. This approach
// sets DATABASE_URL directly with the token. Revisit with Prisma 7 where
// driver adapters are the default. See ADR-026.

import { PrismaClient } from '@prisma/client';

let prisma;

const isDev = process.env.NODE_ENV === 'development';
const useManagedIdentity = process.env.AZURE_MANAGED_IDENTITY === 'true';

console.log('[prisma] NODE_ENV:', process.env.NODE_ENV);
console.log('[prisma] AZURE_MANAGED_IDENTITY:', process.env.AZURE_MANAGED_IDENTITY);
console.log('[prisma] DB_HOST:', process.env.DB_HOST);

if (isDev && !useManagedIdentity) {
  prisma = new PrismaClient();
} else {
  const { DefaultAzureCredential } = await import('@azure/identity');

  const credential = new DefaultAzureCredential({
    managedIdentityClientId: process.env.AZURE_MI_CLIENT_ID,
  });

  const host     = process.env.DB_HOST;
  const port     = process.env.DB_PORT || '5432';
  const database = process.env.DB_NAME;
  const user     = encodeURIComponent(process.env.DB_USER);

  const buildUrl = async () => {
    const tokenResponse = await credential.getToken(
      'https://ossrdbms-aad.database.windows.net/.default'
    );
    if (!tokenResponse || !tokenResponse.token) {
      throw new Error('Failed to acquire Entra ID access token for PostgreSQL');
    }
    const password = encodeURIComponent(tokenResponse.token);
    return `postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=require`;
  };

  process.env.DATABASE_URL = await buildUrl();
  prisma = new PrismaClient();
  console.log('[prisma] Managed identity connection configured');

  // Token refresh every 45 min (tokens last ~60 min)
  setInterval(async () => {
    try {
      process.env.DATABASE_URL = await buildUrl();
      await prisma.$disconnect();
      console.log('[prisma] Token refreshed, connection pool reset');
    } catch (err) {
      console.error('[prisma] Token refresh failed:', err.name, err.message);
    }
  }, 45 * 60 * 1000);
}

export default prisma;
