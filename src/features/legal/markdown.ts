/**
 * Un rendu Markdown minimal, pour les pages légales.
 *
 * ═══ Pourquoi pas une bibliothèque ═══
 *
 * `react-markdown` et ses greffons pèsent une soixantaine de
 * kilo-octets, sur une page que presque personne n'ouvre. Ce qu'on a
 * besoin de rendre tient en six règles : des titres, du gras, des
 * listes, des tableaux, des citations, des paragraphes. Une dépendance
 * pour cela serait payée par tous les visiteurs, y compris ceux qui ne
 * liront jamais les conditions.
 *
 * ═══ Pourquoi c'est sans risque ici ═══
 *
 * Le texte vient d'une constante du code, jamais d'une saisie. Le seul
 * échappement nécessaire est celui des chevrons, au cas où un article
 * citerait du HTML — et il est fait avant toute autre transformation.
 *
 * N'utilisez **pas** cette fonction sur du contenu venu d'ailleurs :
 * elle produit du HTML brut, et n'assainit rien.
 */

export type Block =
  | { kind: "h2" | "h3" | "p" | "quote"; html: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "hr" };

function inline(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

/** Découpe le texte en blocs. Les titres de niveau 1 sont ignorés : la
 *  page porte déjà son `<h1>`, et deux titres de premier niveau brouillent
 *  la structure autant pour un lecteur d'écran que pour un moteur. */
export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
    } else if (line.startsWith("---")) {
      blocks.push({ kind: "hr" });
      i += 1;
    } else if (line.startsWith("### ")) {
      blocks.push({ kind: "h3", html: inline(line.slice(4)) });
      i += 1;
    } else if (line.startsWith("## ")) {
      blocks.push({ kind: "h2", html: inline(line.slice(3)) });
      i += 1;
    } else if (line.startsWith("# ")) {
      i += 1;
    } else if (line.startsWith("> ")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        parts.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ kind: "quote", html: inline(parts.join(" ").trim()) });
    } else if (line.startsWith("| ")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i]
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim());
        // La ligne de séparation `|---|---|` n'est pas une donnée.
        if (!cells.every((cell) => /^:?-+:?$/.test(cell))) rows.push(cells);
        i += 1;
      }
      if (rows.length) blocks.push({ kind: "table", head: rows[0], rows: rows.slice(1) });
    } else if (/^\d+\.\s/.test(line) || line.startsWith("- ")) {
      const ordered = /^\d+\.\s/.test(line);
      const items: string[] = [];
      while (
        i < lines.length &&
        (/^\d+\.\s/.test(lines[i]) || lines[i].startsWith("- ") || /^\s{2,}\S/.test(lines[i]))
      ) {
        if (/^\s{2,}\S/.test(lines[i]) && items.length) {
          // Continuation d'un point sur plusieurs lignes.
          items[items.length - 1] += " " + inline(lines[i].trim());
        } else {
          items.push(inline(lines[i].replace(/^(\d+\.|-)\s/, "")));
        }
        i += 1;
      }
      blocks.push({ kind: ordered ? "ol" : "ul", items });
    } else {
      const parts: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].startsWith("#") &&
        !lines[i].startsWith("|") &&
        !lines[i].startsWith(">") &&
        !lines[i].startsWith("---") &&
        !lines[i].startsWith("- ") &&
        !/^\d+\.\s/.test(lines[i])
      ) {
        parts.push(lines[i].trim());
        i += 1;
      }
      blocks.push({ kind: "p", html: inline(parts.join(" ")) });
    }
  }

  return blocks;
}
