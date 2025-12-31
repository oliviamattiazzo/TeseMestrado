export type NormalForm = "CNF" | "DNF";

export type Step = {
  index: number;
  rule: string;        // ex: "Eliminate implication"
  before: string;      // expressão antes
  after: string;       // expressão depois
  note?: string;       // explicação curta pro aluno
};

export type NormalizeResponse = {
  cnf: string;
  dnf: string;
  stepsToCnf: Step[];
  stepsToDnf: Step[];
};
