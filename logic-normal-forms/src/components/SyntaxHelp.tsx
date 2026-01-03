import { useState } from "react";

export default function SyntaxHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="syntaxHelp">
      <button
        type="button"
        className="syntaxHelpToggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? "Como escrever? (fechar)" : "Como escrever?"}
      </button>

      {open && (
        <div className="syntaxHelpBody">
          <p className="syntaxHelpText">
            Use ASCII para digitar mais rápido (e sem caçar símbolos estranhos).
          </p>

          <ul className="syntaxHelpList">
            <li>
              <code>~p</code> negação (NÃO p).
            </li>
            <li>
              <code>p & q</code> conjunção (p E q).
            </li>
            <li>
              <code>p | q</code> disjunção (p OU q).
            </li>
            <li>
              <code>p -&gt; q</code> implicação (se p então q).
            </li>
            <li>
              <code>p &lt;-&gt; q</code> bicondicional (p sse q).
            </li>
            <li>
              Use parênteses: <code>(p -&gt; q) &amp; ~(r | s)</code>.
            </li>
          </ul>

          <p className="syntaxHelpFoot">
            Dica: variáveis podem ser <code>p</code>, <code>q1</code>, <code>is_valid</code>.
          </p>
        </div>
      )}
    </div>
  );
}
