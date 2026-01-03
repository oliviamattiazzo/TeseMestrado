type Props = {
  onInsert: (token: string) => void;
};

const OPS = ["~", "&", "|", "->", "<->"] as const;

export default function OperatorToolbar({ onInsert }: Props) {
  return (
    <div className="opToolbar" role="toolbar" aria-label="Operadores lógicos">
      {OPS.map((op) => (
        <button
          key={op}
          type="button"
          className="opBtn"
          onClick={() => onInsert(op)}
          title={`Inserir ${op}`}
        >
          {op}
        </button>
      ))}
    </div>
  );
}
