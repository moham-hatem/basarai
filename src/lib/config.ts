export const appConfig = {
  name: "Basarai",
  description: "Brand-based multi-tenant SaaS social media generator.",
  defaultLocale: "en",
  supportedLocales: ["en", "ar"],
  mvpBoundaries: {
    billing: "No Stripe in MVP",
    publishing: "No direct publishing in MVP",
  },
} as const;
