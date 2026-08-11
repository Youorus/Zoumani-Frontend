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
