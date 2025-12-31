import type { Step } from "../types/normalizer";

type Props = {
  steps: Step[];
};

export default function StepsPanel({ steps }: Props) {
  if (!steps.length) {
    return <p className="muted">Os passos vão aparecer aqui depois da normalização.</p>;
  }

  return (
    <ol className="steps">
      {steps.map((s) => (
        <li key={s.index} className="step">
          <div className="stepHeader">
            <span className="badge">#{s.index}</span>
            <strong>{s.rule}</strong>
          </div>

          <div className="stepBody">
            <div>
              <div className="label">Antes</div>
              <code className="code block">{s.before}</code>
            </div>

            <div>
              <div className="label">Depois</div>
              <code className="code block">{s.after}</code>
            </div>
          </div>

          {s.note && <p className="note">{s.note}</p>}
        </li>
      ))}
    </ol>
  );
}
