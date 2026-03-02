import { Bin, Not, Var, type Expr, type BinOp } from "./ast";
import { tokenize, type Token, type TokType } from "./tokenize";

type Prec = { prec: number; assoc: "left" | "right"; op: BinOp };

const BIN_INFO: Record<TokType, Prec | undefined> = {
  AND: { prec: 40, assoc: "left", op: "AND" },
  OR: { prec: 30, assoc: "left", op: "OR" },
  IMPL: { prec: 20, assoc: "right", op: "IMPL" },
  IFF: { prec: 10, assoc: "right", op: "IFF" },
  VAR: undefined,
  NOT: undefined,
  LPAREN: undefined,
  RPAREN: undefined,
  EOF: undefined,
};

export function parseExpression(input: string): Expr {
  const tokens = tokenize(input);
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function expect(type: TokType) {
    const t = peek();
    if (t.type !== type) {
      throw new Error(`Esperado ${type}, mas veio ${t.type} perto de '${t.lexeme}'.`);
    }
    return consume();
  }

  function parsePrimary(): Expr {
    const t = peek();

    if (t.type === "NOT") {
      consume();
      return Not(parsePrimary());
    }

    if (t.type === "VAR") {
      consume();
      return Var(t.lexeme);
    }

    if (t.type === "LPAREN") {
      consume();
      const inside = parseBinExpr(0);
      expect("RPAREN");
      return inside;
    }

    throw new Error(`Token inesperado: ${t.type} perto de '${t.lexeme}'.`);
  }

  function parseBinExpr(minPrec: number): Expr {
    let left = parsePrimary();

    while (true) {
      const t = peek();
      const info = BIN_INFO[t.type];
      if (!info) break;

      if (info.prec < minPrec) break;

      consume(); // consume operator
      const nextMin = info.assoc === "left" ? info.prec + 1 : info.prec;
      const right = parseBinExpr(nextMin);
      left = Bin(info.op, left, right);
    }

    return left;
  }

  const expr = parseBinExpr(0);
  if (peek().type !== "EOF") {
    throw new Error(`Sobrou entrada perto de '${peek().lexeme}'.`);
  }
  return expr;
}