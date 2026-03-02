export type BinOp = "AND" | "OR" | "IMPL" | "IFF";

export type Expr =
  | { kind: "VAR"; name: string }
  | { kind: "NOT"; expr: Expr }
  | { kind: "BIN"; op: BinOp; left: Expr; right: Expr };

export const Var = (name: string): Expr => ({ kind: "VAR", name });
export const Not = (expr: Expr): Expr => ({ kind: "NOT", expr });
export const Bin = (op: BinOp, left: Expr, right: Expr): Expr => ({
  kind: "BIN",
  op,
  left,
  right,
});

export function deepEqual(a: Expr, b: Expr): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "VAR" && b.kind === "VAR") return a.name === b.name;
  if (a.kind === "NOT" && b.kind === "NOT") return deepEqual(a.expr, b.expr);
  if (a.kind === "BIN" && b.kind === "BIN") {
    return a.op === b.op && deepEqual(a.left, b.left) && deepEqual(a.right, b.right);
  }
  return false;
}