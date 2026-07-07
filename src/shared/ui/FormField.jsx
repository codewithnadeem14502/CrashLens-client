import * as Label from "@radix-ui/react-label";

export function FormField({ label, ...inputProps }) {
  return (
    <div className="field">
      <Label.Root className="label">{label}</Label.Root>
      <input className="input" {...inputProps} />
    </div>
  );
}
