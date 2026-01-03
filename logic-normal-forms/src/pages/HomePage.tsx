import { useMemo, useState } from "react";
import ExpressionInput from "../components/ExpressionInput";
import ResultsPanel from "../components/ResultsPanel";
import StepsPanel from "../components/StepsPanel";
import type { NormalizeResponse, NormalForm, Step } from "../types/normalizer";

const MOCK: NormalizeResponse = {
  cnf: "(p ∨ q) ∧ (¬p ∨ r)",
  dnf: "(p ∧ r) ∨ (q ∧ r)",
  stepsToCnf: [
    { index: 1, rule: "Eliminate →", before: "p → q", after: "¬p ∨ q", note: "Use A → B ≡ ¬A ∨ B." },
    { index: 2, rule: "De Morgan", before: "¬(p ∧ q)", after: "¬p ∨ ¬q", note: "Negation distributes over ∧." },
  ],
  stepsToDnf: [
    { index: 1, rule: "Distribute ∧ over ∨", before: "r ∧ (p ∨ q)", after: "(r ∧ p) ∨ (r ∧ q)" },
  ],
};

export default function HomePage() {
  const [expression, setExpression] = useState("");
  const [active, setActive] = useState<NormalForm>("CNF");
  const [result, setResult] = useState<NormalizeResponse | null>(null);
  const [error, setNormalizationError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [sintaxError, setSintaxError] = useState(false);

  const steps: Step[] = useMemo(() => {
    if (!result) return [];
    return active === "CNF" ? result.stepsToCnf : result.stepsToDnf;
  }, [result, active]);

  async function handleNormalize() {
    setNormalizationError(null);
    setIsRunning(true);

    try {
      // Por enquanto mock. Depois você troca pelo fetch do backend.
      await new Promise((r) => setTimeout(r, 250));
      setResult(MOCK);
    } catch (e) {
      setNormalizationError("Falha ao normalizar. Tenta novamente.");
    } finally {
      setIsRunning(false);
    }
  }

  function handleClear() {
    setExpression("");
    setResult(null);
    setNormalizationError(null);
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Laboratório de Formas Normais</h1>
        <p className="subtitle">
          Um ambiente para experimentação em lógica proposicional. Escreva uma expressão lógica e veja a transformação passo a passo em CNF e DNF.
        </p>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Expressão</h2>

          <ExpressionInput
            value={expression}
            onChange={setExpression}
            placeholder="Ex: (p -> q) & ~(r | s)"
            onValidityChange={(hasErrors) => setSintaxError(hasErrors)}
          />

          <div className="row">
            <button onClick={handleNormalize} disabled={!expression.trim() || isRunning || sintaxError}>
              {isRunning ? "Normalizando..." : "Normalizar"}
            </button>

            <button className="secondary" onClick={handleClear} disabled={isRunning && !result}>
              Limpar
            </button>

            <div className="tabs">
              <button
                className={active === "CNF" ? "tab active" : "tab"}
                onClick={() => setActive("CNF")}
                disabled={!result}
              >
                CNF
              </button>
              <button
                className={active === "DNF" ? "tab active" : "tab"}
                onClick={() => setActive("DNF")}
                disabled={!result}
              >
                DNF
              </button>
            </div>
          </div>

          {error && <p className="error">{error}</p>}
        </section>

        <section className="card">
          <h2>Resultado</h2>
          <ResultsPanel result={result} active={active} />
        </section>

        <section className="card full">
          <h2>Passo a passo</h2>
          <StepsPanel steps={steps} />
        </section>
      </main>

      <footer className="footer">
        <small>Sem banco. Sem rastreio. Só lógica e paz.</small>
      </footer>
    </div>
  );
}
