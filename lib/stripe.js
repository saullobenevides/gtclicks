/**
 * Stripe Connect - Cliente e helpers
 * Usado para pagamentos, transfers e Connect (onboarding, account session).
 */

import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY is missing. Stripe features will not work.");
}

export const stripe = new Stripe(secretKey || "sk_test_placeholder", {
  typescript: false,
});

/**
 * Cria uma conta Connect Express para um fotógrafo.
 * Preenche business_profile para reduzir campos no onboarding (setor, site, etc).
 * @param {Object} opts
 * @param {string} opts.email - Email do fotógrafo
 * @param {string} opts.businessName - Nome do negócio (username ou nome)
 * @param {string} [opts.username] - Username para URL do perfil
 * @returns {Promise<Stripe.Account>}
 */
export async function createConnectAccount({ email, businessName, username }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gtclicks.com.br";
  const profileUrl = username ? `${baseUrl}/fotografo/${username}` : baseUrl;

  const account = await stripe.accounts.create({
    country: "BR",
    email: email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    business_profile: {
      mcc: "7221", // Photographic Studios
      url: profileUrl,
      product_description:
        "Fotógrafo na plataforma GTClicks - venda de licenças de fotos",
      name: businessName || "Fotógrafo GTClicks",
      support_email: email,
      support_url: baseUrl,
    },
    controller: {
      stripe_dashboard: { type: "express" },
      fees: { payer: "application" },
      losses: { payments: "application" },
    },
  });
  return account;
}

/**
 * Cria uma Account Session para Connect Embedded Components.
 * @param {string} accountId - ID da conta Connect (acct_xxx)
 * @param {Object} components - Componentes a habilitar
 * @returns {Promise<{ clientSecret: string }>}
 */
export async function createAccountSession(accountId, components = {}) {
  const defaultComponents = {
    account_onboarding: { enabled: true },
    ...components,
  };

  const session = await stripe.accountSessions.create({
    account: accountId,
    components: defaultComponents,
  });

  return { clientSecret: session.client_secret };
}
