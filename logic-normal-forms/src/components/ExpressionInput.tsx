type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function ExpressionInput({ value, onChange, placeholder }: Props) {
  return (
    <textarea
      className="textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      spellCheck={false}
    />
  );
}
