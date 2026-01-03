export type Diagnostic = {
  message: string;
  start: number;
  end: number;
};

export function normalizeAsciiInput(raw: string) {
  // Normalizações “seguras” (não mudam o significado, só padronizam)
  let text = raw;

  // Normalizar quebras de linha/windows
  text = text.replace(/\r\n/g, "\n");

  // Normalizar sinônimos comuns
  text = text.replace(/<=>/g, "<->");
  text = text.replace(/=>/g, "->");

  // Aceitar '!' como negação e normalizar pra '~'
  text = text.replace(/!/g, "~");

  // Aceitar '^' como AND e normalizar pra '&'
  text = text.replace(/\^/g, "&");

  // Colapsar espaços múltiplos
  text = text.replace(/[ \t]+/g, " ");

  return text;
}

type TokenType =
  | "VAR"
  | "NOT"
  | "AND"
  | "OR"
  | "IMPL"
  | "IFF"
  | "LPAREN"
  | "RPAREN"
  | "UNKNOWN";

type Token = {
  type: TokenType;
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

function tokenize(text: string): { tokens: Token[]; diagnostics: Diagnostic[] } {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];

  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    // espaços
    if (ch === " " || ch === "\t" || ch === "\n") {
      i++;
      continue;
    }

    // parênteses
    if (ch === "(") {
      tokens.push({ type: "LPAREN", lexeme: "(", start: i, end: i + 1 });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", lexeme: ")", start: i, end: i + 1 });
      i++;
      continue;
    }

    // operadores de 2/3 chars primeiro
    if (text.startsWith("<->", i)) {
      tokens.push({ type: "IFF", lexeme: "<->", start: i, end: i + 3 });
      i += 3;
      continue;
    }
    if (text.startsWith("->", i)) {
      tokens.push({ type: "IMPL", lexeme: "->", start: i, end: i + 2 });
      i += 2;
      continue;
    }

    // operadores de 1 char
    if (ch === "~") {
      tokens.push({ type: "NOT", lexeme: "~", start: i, end: i + 1 });
      i++;
      continue;
    }
    if (ch === "&") {
      tokens.push({ type: "AND", lexeme: "&", start: i, end: i + 1 });
      i++;
      continue;
    }
    if (ch === "|") {
      tokens.push({ type: "OR", lexeme: "|", start: i, end: i + 1 });
      i++;
      continue;
    }

    // variável
    if (isVarStart(ch)) {
      const start = i;
      i++;
      while (i < text.length && isVarPart(text[i])) i++;
      const lexeme = text.slice(start, i);
      tokens.push({ type: "VAR", lexeme, start, end: i });
      continue;
    }

    // desconhecido
    diagnostics.push({
      message: `Símbolo desconhecido: '${ch}'. Use apenas ~ & | -> <->, parênteses e letras/dígitos/_ para variáveis.`,
      start: i,
      end: i + 1,
    });
    tokens.push({ type: "UNKNOWN", lexeme: ch, start: i, end: i + 1 });
    i++;
  }

  return { tokens, diagnostics };
}

export function validateAsciiInput(text: string) {
  const diagnostics: Diagnostic[] = [];

  const { tokens, diagnostics: lexDiags } = tokenize(text);
  diagnostics.push(...lexDiags);

  // Sem tokens (input vazio ou só espaços) => sem erro
  if (tokens.filter(t => t.type !== "UNKNOWN").length === 0) {
    return diagnostics.slice(0, 10);
  }

  // 1) Parênteses balanceados (por tokens)
  const parenStack: Token[] = [];
  for (const t of tokens) {
    if (t.type === "LPAREN") parenStack.push(t);
    if (t.type === "RPAREN") {
      const open = parenStack.pop();
      if (!open) {
        diagnostics.push({
          message: "Parêntese fechando ')' sem um '(' correspondente.",
          start: t.start,
          end: t.end,
        });
      }
    }
  }
  for (const open of parenStack) {
    diagnostics.push({
      message: "Parêntese abrindo '(' sem um ')' correspondente.",
      start: open.start,
      end: open.end,
    });
  }

  // 2) Sequência mínima (operadores/operandos)
  type Expect = "OPERAND" | "OPERATOR";
  let expect: Expect = "OPERAND";

  const binOps = new Set<TokenType>(["AND", "OR", "IMPL", "IFF"]);

  // stack extra só pra detectar parênteses vazios "()"
  const emptyParenStack: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (t.type === "UNKNOWN") continue; // já reportado no léxico

    if (expect === "OPERAND") {
      if (t.type === "VAR") {
        expect = "OPERATOR";
      } else if (t.type === "NOT") {
        // continua esperando operando
      } else if (t.type === "LPAREN") {
        emptyParenStack.push(t);
        // continua esperando operando
      } else if (t.type === "RPAREN") {
        diagnostics.push({
          message: "Parêntese ')' não pode aparecer aqui. Falta uma expressão antes dele.",
          start: t.start,
          end: t.end,
        });
        expect = "OPERATOR"; // evita cascata
      } else if (binOps.has(t.type)) {
        diagnostics.push({
          message: `Operador ${t.lexeme} não pode aparecer aqui. Ele precisa ficar entre duas expressões (ex.: p ${t.lexeme} q).`,
          start: t.start,
          end: t.end,
        });
        // continua esperando operando
      }
    } else {
      // expect === "OPERATOR"
      if (binOps.has(t.type)) {
        expect = "OPERAND";
      } else if (t.type === "RPAREN") {
        // fecha parênteses: continua no estado OPERATOR (pois ')' conta como fim de um operando)
        emptyParenStack.pop();
        expect = "OPERATOR";
      } else if (t.type === "VAR" || t.type === "NOT" || t.type === "LPAREN") {
        diagnostics.push({
          message: `Está faltando um operador antes de '${t.lexeme}'.`,
          start: t.start,
          end: t.end,
        });
        // tenta se recuperar: trata como se fosse início de operando
        expect = "OPERATOR";
      }
    }

    // Detectar "()"
    if (t.type === "LPAREN") {
      const next = tokens[i + 1];
      if (next && next.type === "RPAREN") {
        diagnostics.push({
          message: "Parênteses vazios '()' não formam uma expressão válida.",
          start: t.start,
          end: next.end,
        });
      }
    }
  }

  // 3) Final inválido: terminou esperando OPERAND (ex.: "p &", "p ->", "~", "(p | q) &")
  if (expect === "OPERAND") {
    const last = tokens[tokens.length - 1];
    diagnostics.push({
      message: "A expressão terminou incompleta. Falta uma variável/expressão depois do último operador.",
      start: Math.max(0, last.end - 1),
      end: last.end,
    });
  }

  return diagnostics.slice(0, 10);
}

