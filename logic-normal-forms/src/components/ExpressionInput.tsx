import Editor from "@monaco-editor/react";
import { useMemo, useRef, useEffect, useState } from "react";
import { normalizeAsciiInput, validateAsciiInput } from "../utils/logicInput";
import SyntaxHelp from "./SyntaxHelp";
import OperatorToolbar from "./OperatorToolbar";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  placeholder?: string;
};

export default function ExpressionInput({ value, onChange, onValidityChange, placeholder }: Props) {
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const suppressRef = useRef(false);
  const [flash, setFlash] = useState(false);

  const diagnostics = useMemo(() => validateAsciiInput(value), [value]);
  
  const showBadge = value.trim().length > 0;
  const isValid = diagnostics.length === 0;

  useEffect(() => {
    onValidityChange?.(diagnostics.length !== 0);
  }, [diagnostics, onValidityChange]);

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

  function insertAtCursor(token: string) {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const model = editor.getModel();
    const selection = editor.getSelection();
    if (!model || !selection) return;

    const needsSpace = (t: string) => t === "&" || t === "|" || t === "->" || t === "<->";
    const text = needsSpace(token) ? ` ${token} ` : token;

    editor.executeEdits("insert-operator", [
      {
        range: selection,
        text,
        forceMoveMarkers: true,
      },
    ]);

    triggerFlash();
  }

  function triggerFlash() {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 320);
  }

  return (
    <div className="expressionField">
      <div className="expressionHeaderRow">
        <SyntaxHelp />

        {showBadge && (
          <span className={isValid ? "statusBadge ok" : "statusBadge err"}>
            {isValid ? "Expressão válida ✓" : "Expressão inválida ✗"}
          </span>
        )}
      </div>

      <div className={flash ? "monacoWrap flash" : "monacoWrap"}>
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

            const normalized = normalizeAsciiInput(nextRaw);

            if (normalized === value) return;

            if (normalized !== nextRaw) {
              const editor = editorRef.current;
              if (editor && !suppressRef.current) {
                suppressRef.current = true;

                const model = editor.getModel();
                const sel = editor.getSelection();

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

                onChange(normalized);

                setTimeout(() => {
                  suppressRef.current = false;
                  applyMarkers();
                }, 0);

                return;
              }
            }

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
      </div>

      <OperatorToolbar onInsert={insertAtCursor} />

      {/* resumo de erros abaixo do editor */}
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
