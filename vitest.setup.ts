import "@testing-library/jest-dom/vitest";

/**
 * `ResizeObserver` n'existe pas dans jsdom.
 *
 * Les composants Radix — case à cocher, popover, combobox — s'en servent
 * pour se mesurer. Sans lui, ils lèvent au montage, et le test échoue sur
 * une pile d'appels React illisible qui ne dit rien du vrai problème.
 *
 * L'implémentation ne fait rien, et c'est suffisant : ce qu'on teste est
 * le comportement du formulaire, jamais la géométrie d'un élément — que
 * jsdom ne calcule de toute façon pas.
 */
if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

/**
 * `localStorage` n'existe pas non plus.
 *
 * Node 26 le signale lui-même : « localStorage is not available because
 * --localstorage-file was not provided ». jsdom ne le fournit pas
 * davantage dans cette configuration, et `window.localStorage` est donc
 * `undefined` — pas vide, absent.
 *
 * Le code de production s'en accommode : chaque lecture et chaque
 * écriture est déjà enveloppée d'un `try`, parce qu'un navigateur en
 * navigation privée lève à l'accès. Mais un test du consentement qui ne
 * peut rien mémoriser ne teste rien.
 *
 * L'implémentation tient en une `Map` : on vérifie ce que le code écrit
 * et relit, pas la conformité de jsdom au standard du stockage.
 */
if (!("localStorage" in globalThis) || !globalThis.localStorage) {
  const memoire = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (cle: string) => memoire.get(cle) ?? null,
      setItem: (cle: string, valeur: string) => void memoire.set(cle, String(valeur)),
      removeItem: (cle: string) => void memoire.delete(cle),
      clear: () => memoire.clear(),
      key: (i: number) => [...memoire.keys()][i] ?? null,
      get length() {
        return memoire.size;
      },
    },
  });
}
