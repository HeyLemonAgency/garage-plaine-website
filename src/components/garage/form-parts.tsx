// Form building blocks shared by the reprise and offer forms.
import type { ReactNode } from "react";

/** Tappable options backed by real radio buttons or checkboxes (keyboard and screen readers). */
export function Options({
  name,
  legend,
  options,
  multiple = false,
  onChange,
}: {
  name: string;
  legend: string;
  options: readonly string[];
  multiple?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <fieldset className="opt-group">
      <legend>{legend}</legend>
      <div className="opt-set">
        {options.map((o) => (
          <label className="opt" key={o}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={o}
              {...(onChange ? { onChange: () => onChange(o) } : {})}
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
