import Editor from "@monaco-editor/react";
import { useMemo, useRef } from "react";
import { normalizeAsciiInput, validateAsciiInput } from "../utils/logicInput";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function ExpressionInput({ value, onChange, placeholder }: Props) {
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const suppressRef = useRef(false);

  const diagnostics = useMemo(() => validateAsciiInput(value), [value]);

  function applyMarkers() {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    const markers = diagnostics.map((d) => {
      const startPos = model.getPositionAt(d.start);
      const endPos = model.getPositionAt(d.end);

      return {
        severity: monaco.MarkerSeverity.Error,
        message: d.message,
        startLineNumber: startPos.lineNumber,
        startColumn: startPos.column,
        endLineNumber: endPos.lineNumber,
        endColumn: endPos.column,
      };
    });

    monaco.editor.setModelMarkers(model, "logic-input", markers);
  }

  return (
    <div className="monacoWrap">
      {!value.trim() && placeholder && (
        <div className="monacoPlaceholder">{placeholder}</div>
      )}

      <Editor
        height="160px"
        defaultLanguage="plaintext"
        theme="vs-dark"
        value={value}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
          
          applyMarkers();

          editor.onDidChangeModelContent(() => {
            setTimeout(applyMarkers, 0);
          });
        }}
        onChange={(raw) => {
          const nextRaw = raw ?? "";

          // Normalização (ASCII-friendly)
          const normalized = normalizeAsciiInput(nextRaw);

          // Evitar loop: se normalizar não muda nada, só propaga
          if (normalized === value) return;

          // Se a normalização alterou o texto, atualiza sem “brigar” com o cursor
          if (normalized !== nextRaw) {
            const editor = editorRef.current;
            if (editor && !suppressRef.current) {
              suppressRef.current = true;

              const model = editor.getModel();
              const sel = editor.getSelection();

              // aplica o valor normalizado direto no model, preservando seleção
              model?.pushEditOperations(
                [],
                [
                  {
                    range: model.getFullModelRange(),
                    text: normalized,
                  },
                ],
                () => (sel ? [sel] : null)
              );

              // atualiza estado React
              onChange(normalized);

              // libera depois do tick
              setTimeout(() => {
                suppressRef.current = false;
                applyMarkers();
              }, 0);

              return;
            }
          }

          // Caso normalização não tenha alterado (ou sem editor), segue normal
          onChange(normalized);
          setTimeout(applyMarkers, 0);
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "off",
          wordWrap: "on",
          scrollBeyondLastLine: false,
          overviewRulerLanes: 0,
          glyphMargin: false,
          folding: false,
          renderLineHighlight: "none",
          padding: { top: 10, bottom: 10 },
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
        }}
      />

      {/* resumo de erros abaixo do editor (aluno agradece) */}
      {diagnostics.length > 0 && (
        <div className="inlineErrors">
          <div className="inlineErrorsTitle">Erros encontrados:</div>
          <ul>
            {diagnostics.slice(0, 3).map((d, idx) => (
              <li key={idx}>{d.message}</li>
            ))}
            {diagnostics.length > 3 && <li>…e mais {diagnostics.length - 3}.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
