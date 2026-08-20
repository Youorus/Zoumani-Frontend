import { defineConfig, devices } from "@playwright/test";

/**
 * ═══ Pourquoi `webServer` a été ajouté ═══
 *
 * Sans lui, Playwright suppose qu'un serveur tourne déjà sur le port
 * 3000. En local c'est souvent le cas — d'où le fait que personne ne l'ait
 * remarqué. En intégration continue, non : les trois spécifications
 * auraient échoué sur des connexions refusées, ou pire, seraient passées
 * sur une page d'erreur.
 *
 * `reuseExistingServer` en développement : on ne relance pas un serveur
 * quand `npm run dev` tourne déjà dans un autre terminal. En CI il est
 * faux, pour ne jamais tester contre un serveur laissé par un job
 * précédent.
 *
 * ═══ Pourquoi `build` et non `dev` ═══
 *
 * La vitrine est entièrement pré-calculée : c'est sa propriété
 * structurante, et c'est donc la version compilée qu'il faut éprouver. Un
 * serveur de développement rend les pages à la demande et masquerait
 * précisément ce qu'on veut vérifier.
 *
 * `next start` avertit qu'il ne va pas avec `output: "standalone"`. Ici
 * l'avertissement est sans conséquence : toutes les pages sont
 * pré-rendues, il n'y a rien à servir dynamiquement, et il sert les mêmes
 * fichiers que le serveur autonome. Passer par
 * `node .next/standalone/server.js` obligerait à recopier `.next/static`
 * et `public` à la main — de la plomberie pour un gain nul.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
