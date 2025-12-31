import type { NormalizeResponse, NormalForm } from "../types/normalizer";

type Props = {
  result: NormalizeResponse | null;
  active: NormalForm;
};

export default function ResultsPanel({ result, active }: Props) {
  if (!result) {
    return <p className="muted">Digite uma expressão e clique em Normalizar.</p>;
  }

  const text = active === "CNF" ? result.cnf : result.dnf;

  return (
    <div className="resultBox">
      <code className="code">{text}</code>
    </div>
  );
}
