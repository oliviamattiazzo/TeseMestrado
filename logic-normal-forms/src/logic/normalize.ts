import type { Step } from "./transform";
import { eliminateIffImpl, toCNF_fromNNF, toDNF_fromNNF, toNNF } from "./transform";
import { parseExpression } from "./parse";
import { printExpr } from "./print";
import type { Expr } from "./ast";

export type NormalizeResponse = {
  cnf: string;
  dnf: string;
  stepsToCnf: Step[];
  stepsToDnf: Step[];
};

function pipeline(expr: Expr, mode: "CNF" | "DNF"): { result: string; steps: Step[] } {
  const steps: Step[] = [];
  const parsed = expr;

  const noArrows = eliminateIffImpl(parsed, steps);
  const nnf = toNNF(noArrows, steps);

  const finalAst = mode === "CNF" ? toCNF_fromNNF(nnf, steps) : toDNF_fromNNF(nnf, steps);
  return { result: printExpr(finalAst), steps };
}

export function normalize(input: string): NormalizeResponse {
  const ast = parseExpression(input);

  const cnf = pipeline(ast, "CNF");
  const dnf = pipeline(ast, "DNF");

  return {
    cnf: cnf.result,
    dnf: dnf.result,
    stepsToCnf: cnf.steps,
    stepsToDnf: dnf.steps,
  };
}