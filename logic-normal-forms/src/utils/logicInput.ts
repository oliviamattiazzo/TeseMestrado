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

export function validateAsciiInput(text: string) {
  const diagnostics: Diagnostic[] = [];

  // 1) Parênteses
  const stack: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") stack.push(i);
    if (ch === ")") {
      const open = stack.pop();
      if (open === undefined) {
        diagnostics.push({
          message: "Parêntese fechando ')' sem um '(' correspondente.",
          start: i,
          end: i + 1,
        });
      }
    }
  }
  for (const openIdx of stack) {
    diagnostics.push({
      message: "Parêntese abrindo '(' sem um ')' correspondente.",
      start: openIdx,
      end: openIdx + 1,
    });
  }

  // 2) Símbolos desconhecidos
  // Aceita: letras/dígitos/_/espaço e tokens ASCII: ( ) ~ & | - < >
  const unknown: Diagnostic[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    const ok =
      /[a-zA-Z0-9_ \n\t]/.test(ch) ||
      ch === "(" ||
      ch === ")" ||
      ch === "~" ||
      ch === "&" ||
      ch === "|" ||
      ch === "-" ||
      ch === "<" ||
      ch === ">";

    if (!ok) {
      unknown.push({
        message: `Símbolo desconhecido: '${ch}'. Use apenas ~ & | -> <->, parênteses e letras/dígitos/_ para variáveis.`,
        start: i,
        end: i + 1,
      });
    }
  }
  diagnostics.push(...unknown);

  // 3) Checar setas malformadas
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "-") {
      const slice2 = text.slice(i, i + 2);
      const slice3 = text.slice(i - 1, i + 2); // pode estar no meio do <->

      const isArrow = slice2 === "->" || slice3 === "<->";
      if (!isArrow) {
        diagnostics.push({
          message: "Hífen '-' solto. Você quis escrever '->' ou '<->'?",
          start: i,
          end: i + 1,
        });
      }
    }
  }

  return diagnostics;
}
