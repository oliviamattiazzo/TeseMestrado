export type TokType =
  | "VAR"
  | "NOT"
  | "AND"
  | "OR"
  | "IMPL"
  | "IFF"
  | "LPAREN"
  | "RPAREN"
  | "EOF";

export type Token = {
  type: TokType;
  lexeme: string;
  start: number;
  end: number;
};

function isVarStart(ch: string) {
  return /[a-zA-Z_]/.test(ch);
}
function isVarPart(ch: string) {
  return /[a-zA-Z0-9_]/.test(ch);
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const push = (type: TokType, lexeme: string, start: number, end: number) => {
    tokens.push({ type, lexeme, start, end });
  };

  while (i < input.length) {
    const ch = input[i];

    if (ch === " " || ch === "\t" || ch === "\n") {
      i++;
      continue;
    }

    if (input.startsWith("<->", i)) {
      push("IFF", "<->", i, i + 3);
      i += 3;
      continue;
    }
    if (input.startsWith("->", i)) {
      push("IMPL", "->", i, i + 2);
      i += 2;
      continue;
    }

    if (ch === "~") {
      push("NOT", "~", i, i + 1);
      i++;
      continue;
    }
    if (ch === "&") {
      push("AND", "&", i, i + 1);
      i++;
      continue;
    }
    if (ch === "|") {
      push("OR", "|", i, i + 1);
      i++;
      continue;
    }
    if (ch === "(") {
      push("LPAREN", "(", i, i + 1);
      i++;
      continue;
    }
    if (ch === ")") {
      push("RPAREN", ")", i, i + 1);
      i++;
      continue;
    }

    if (isVarStart(ch)) {
      const start = i;
      i++;
      while (i < input.length && isVarPart(input[i])) i++;
      push("VAR", input.slice(start, i), start, i);
      continue;
    }

    // Se chegou aqui, é caractere inválido. O ideal é integrar com seu validador.
    throw new Error(`Símbolo inválido '${ch}' na posição ${i}.`);
  }

  push("EOF", "", input.length, input.length);
  return tokens;
}