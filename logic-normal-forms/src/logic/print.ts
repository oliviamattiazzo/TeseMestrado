import type { Expr, BinOp } from "./ast";

function precOf(e: Expr): number {
  if (e.kind === "VAR") return 100;
  if (e.kind === "NOT") return 90;
  // BIN
  switch (e.op) {
    case "AND":
      return 40;
    case "OR":
      return 30;
    case "IMPL":
      return 20;
    case "IFF":
      return 10;
  }
}

function opLex(op: BinOp) {
  switch (op) {
    case "AND":
      return "&";
    case "OR":
      return "|";
    case "IMPL":
      return "->";
    case "IFF":
      return "<->";
  }
}

export function printExpr(e: Expr): string {
  if (e.kind === "VAR") return e.name;
  if (e.kind === "NOT") {
    const inner = e.expr;
    const s = printExpr(inner);
    const needs = inner.kind === "BIN";
    return needs ? `~(${s})` : `~${s}`;
  }

  const left = e.left;
  const right = e.right;

  const me = precOf(e);
  const l = precOf(left);
  const r = precOf(right);

  const ls = printExpr(left);
  const rs = printExpr(right);

  const lp = l < me ? `(${ls})` : ls;
  const rp = r < me ? `(${rs})` : rs;

  return `${lp} ${opLex(e.op)} ${rp}`;
}