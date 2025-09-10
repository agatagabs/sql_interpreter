// sqlHelper.ts
// Destaque de keywords com preservação de strings e comentários.
// Mantém seguro via escape de HTML.

const KEYWORD_PHRASES = [
  "FULL OUTER JOIN",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "GROUP BY",
  "ORDER BY",
  "PARTITION BY",
  "UNION ALL",
  "FETCH FIRST",
  "FETCH NEXT",
  "QUALIFY" // BigQuery
];

const KEYWORDS = new Set([
  // Consulta e filtragem
  "SELECT","FROM","WHERE","GROUP","BY","HAVING","ORDER","LIMIT","OFFSET","DISTINCT",
  "UNION","INTERSECT","EXCEPT","ALL","WITH","QUALIFY","TOP","COUNT",
  // Joins
  "JOIN","INNER","LEFT","RIGHT","FULL","CROSS","OUTER","NATURAL","ON","USING",
  // DML
  "INSERT","INTO","VALUES","UPDATE","SET","DELETE","MERGE","RETURNING",
  // DDL
  "CREATE","ALTER","DROP","TRUNCATE","RENAME","TABLE","VIEW","MATERIALIZED","INDEX","SEQUENCE","SCHEMA","DATABASE",
  // Predicados e lógica
  "AND","OR","NOT","NULL","IS","IN","LIKE","BETWEEN","EXISTS","ANY","SOME","ALL",
  "CASE","WHEN","THEN","ELSE","END",
  // Janela
  "OVER","PARTITION","ROWS","RANGE"
]);

function escapeHtml(s) {
  return s
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;");
}

export function highlightSqlSyntax(input) {
  if (!input) return "";
  const src = escapeHtml(input);
  let i = 0;
  const n = src.length;
  let out = "";

  const push = (s) => (out += s);

  const consumeUntilEol = () => {
    let j = i;
    while (j < n && src[j] !== "\n") j++;
    const chunk = src.slice(i, j);
    i = j;
    return chunk;
  };

  const consumeUntil = (endToken, allowEscapeDouble = false) => {
    let j = i;
    while (j < n) {
      if (allowEscapeDouble && src[j] === endToken && src[j + 1] === endToken) {
        j += 2; // '' ou ""
        continue;
      }
      if (src[j] === endToken) {
        const chunk = src.slice(i, j + 1);
        i = j + 1;
        return chunk;
      }
      j++;
    }
    const chunk = src.slice(i);
    i = n;
    return chunk;
  };

  const tryMatchPhrase = () => {
    for (const phrase of KEYWORD_PHRASES) {
      const re = new RegExp("^" + phrase.replace(/\s+/g, "\\s+") + "\\b", "i");
      const m = src.slice(i).match(re);
      if (m) {
        i += m[0].length;
        return `<span class="kw">${m[0]}</span>`;
      }
    }
    return null;
  };

  const consumeWord = () => {
    const start = i;
    while (i < n && /[A-Za-z0-9_]/.test(src[i])) i++;
    const word = src.slice(start, i);
    const upper = word.toUpperCase();
    if (KEYWORDS.has(upper)) {
      return `<span class="kw">${word}</span>`;
    }
    return word;
  };

  const consumeNumber = () => {
    const start = i;
    while (i < n && /[0-9]/.test(src[i])) i++;
    if (src[i] === "." && /[0-9]/.test(src[i + 1])) {
      i++;
      while (i < n && /[0-9]/.test(src[i])) i++;
    }
    return `<span class="num">${src.slice(start, i)}</span>`;
  };

  while (i < n) {
    const ch = src[i];

    // -- comentário de linha
    if (ch === "-" && src[i + 1] === "-") {
      const start = i;
      i += 2;
      consumeUntilEol();
      const txt = src.slice(start, i);
      push(`<span class="cmt">${txt}</span>`);
      continue;
    }

    // /* ... */ comentário de bloco
    if (ch === "/" && src[i + 1] === "*") {
      const start = i;
      i += 2;
      let j = i;
      while (j < n && !(src[j] === "*" && src[j + 1] === "/")) j++;
      if (j < n) j += 2;
      const chunk = src.slice(start, j);
      i = j;
      push(`<span class="cmt">${chunk}</span>`);
      continue;
    }

    // strings '...'
//   if (ch === "'") {
//   const start = i; i++;
//   const str = src.slice(start, i) + consumeUntil("'", true).slice(1);
//   push(`<span class="str">${str}</span>`);
//   continue;
// }
// if (ch === '"') {
//   const start = i; i++;
//   const str = src.slice(start, i) + consumeUntil('"', true).slice(1);
//   push(`<span class="str">${ str}</span>`);
//   continue;
// }

    // identificadores `...` (MySQL/SQLite)
    if (ch === "`") {
      const start = i;
      i++;
      const str = src.slice(start, i) + consumeUntil("`", false).slice(1);
      push(`<span class="idf">${str}</span>`);
      continue;
    }

    const phrase = tryMatchPhrase();
    if (phrase) {
      push(phrase);
      continue;
    }

    if (/[0-9]/.test(ch)) {
      push(consumeNumber());
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      push(consumeWord());
      continue;
    }

    push(ch);
    i++;
  }

  return out;
}

// Placeholder simples — se você já tem um formatador melhor, mantenha o seu.
export function formatSql(input){
  return input;
}
