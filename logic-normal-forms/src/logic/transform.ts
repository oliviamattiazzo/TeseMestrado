import { Bin, Not, type Expr, deepEqual } from "./ast";
import { printExpr } from "./print";

export type Step = {
  index: number;
  rule: string;
  before: string;
  after: string;
  note?: string;
};

function record(steps: Step[], rule: string, beforeAst: Expr, afterAst: Expr, note?: string) {
  const before = printExpr(beforeAst);
  const after = printExpr(afterAst);
  if (before === after) return;
  steps.push({ index: steps.length + 1, rule, before, after, note });
}

// Reescreve recursivamente aplicando f; se mudar algo, retorna novo AST
function rewrite(expr: Expr, f: (e: Expr) => Expr): Expr {
  const once = f(expr);
  if (!deepEqual(once, expr)) return once;

  if (expr.kind === "NOT") {
    const inner = rewrite(expr.expr, f);
    return deepEqual(inner, expr.expr) ? expr : Not(inner);
  }
  if (expr.kind === "BIN") {
    const l = rewrite(expr.left, f);
    const r = rewrite(expr.right, f);
    if (deepEqual(l, expr.left) && deepEqual(r, expr.right)) return expr;
    return Bin(expr.op, l, r);
  }
  return expr;
}

export function eliminateIffImpl(expr: Expr, steps: Step[]) {
  let cur = expr;

  // 1) Eliminar IFF: (A <-> B) = (A -> B) & (B -> A)
  while (true) {
    const next = rewrite(cur, (e) => {
      if (e.kind === "BIN" && e.op === "IFF") {
        return Bin(
          "AND",
          Bin("IMPL", e.left, e.right),
          Bin("IMPL", e.right, e.left)
        );
      }
      return e;
    });
    if (deepEqual(next, cur)) break;
    record(steps, "Eliminate <->", cur, next, "A <-> B ≡ (A -> B) & (B -> A).");
    cur = next;
  }

  // 2) Eliminar IMPL: (A -> B) = (~A | B)
  while (true) {
    const next = rewrite(cur, (e) => {
      if (e.kind === "BIN" && e.op === "IMPL") {
        return Bin("OR", Not(e.left), e.right);
      }
      return e;
    });
    if (deepEqual(next, cur)) break;
    record(steps, "Eliminate ->", cur, next, "A -> B ≡ ~A | B.");
    cur = next;
  }

  return cur;
}

// Converte para NNF: negação só em variáveis, usando De Morgan e dupla negação
export function toNNF(expr: Expr, steps: Step[]) {
  let cur = expr;

  // dupla negação ~~A => A
  while (true) {
    const next = rewrite(cur, (e) => {
      if (e.kind === "NOT" && e.expr.kind === "NOT") {
        return e.expr.expr;
      }
      return e;
    });
    if (deepEqual(next, cur)) break;
    record(steps, "Double negation", cur, next, "~~A ≡ A.");
    cur = next;
  }

  // De Morgan: ~(A & B) => ~A | ~B ; ~(A | B) => ~A & ~B
  while (true) {
    const next = rewrite(cur, (e) => {
      if (e.kind === "NOT" && e.expr.kind === "BIN") {
        const b = e.expr;
        if (b.op === "AND") return Bin("OR", Not(b.left), Not(b.right));
        if (b.op === "OR") return Bin("AND", Not(b.left), Not(b.right));
      }
      return e;
    });
    if (deepEqual(next, cur)) break;
    record(steps, "De Morgan", cur, next, "Push negation inward.");
    cur = next;

    // após De Morgan pode surgir ~~ novamente
    const dd = rewrite(cur, (e) => (e.kind === "NOT" && e.expr.kind === "NOT" ? e.expr.expr : e));
    if (!deepEqual(dd, cur)) {
      record(steps, "Double negation", cur, dd, "~~A ≡ A.");
      cur = dd;
    }
  }

  return cur;
}

// Distribuição para CNF: A | (B & C) => (A|B) & (A|C)
export function toCNF_fromNNF(nnf: Expr, steps: Step[]) {
  let cur = nnf;

  while (true) {
    const next = rewrite(cur, (e) => {
      if (e.kind === "BIN" && e.op === "OR") {
        const A = e.left;
        const B = e.right;

        if (B.kind === "BIN" && B.op === "AND") {
          return Bin("AND", Bin("OR", A, B.left), Bin("OR", A, B.right));
        }
        if (A.kind === "BIN" && A.op === "AND") {
          return Bin("AND", Bin("OR", A.left, B), Bin("OR", A.right, B));
        }
      }
      return e;
    });
    if (deepEqual(next, cur)) break;
    record(steps, "Distribute | over & (CNF)", cur, next, "A | (B & C) ≡ (A|B) & (A|C).");
    cur = next;
  }

  return cur;
}

// Distribuição para DNF: A & (B | C) => (A&B) | (A&C)
export function toDNF_fromNNF(nnf: Expr, steps: Step[]) {
  let cur = nnf;

  while (true) {
    const next = rewrite(cur, (e) => {
      if (e.kind === "BIN" && e.op === "AND") {
        const A = e.left;
        const B = e.right;

        if (B.kind === "BIN" && B.op === "OR") {
          return Bin("OR", Bin("AND", A, B.left), Bin("AND", A, B.right));
        }
        if (A.kind === "BIN" && A.op === "OR") {
          return Bin("OR", Bin("AND", A.left, B), Bin("AND", A.right, B));
        }
      }
      return e;
    });
    if (deepEqual(next, cur)) break;
    record(steps, "Distribute & over | (DNF)", cur, next, "A & (B | C) ≡ (A&B) | (A&C).");
    cur = next;
  }

  return cur;
}