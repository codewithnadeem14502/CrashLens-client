import * as Label from "@radix-ui/react-label";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { RoleSelect } from "../../../shared/ui/RoleSelect";

const TYPE_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "webhook", label: "Webhook" },
];

export function NotificationActionsField({ actions, onChange, disabled }) {
  const updateAction = (index, patch) =>
    onChange(actions.map((action, i) => (i === index ? { ...action, ...patch } : action)));

  const removeAction = (index) => onChange(actions.filter((_, i) => i !== index));

  const addAction = () => onChange([...actions, { type: "email", target: "" }]);

  return (
    <div className="field">
      <Label.Root className="label">Notification actions</Label.Root>
      {actions.map((action, index) => (
        <div className="field-row" key={index}>
          <RoleSelect
            value={action.type}
            options={TYPE_OPTIONS}
            disabled={disabled}
            onValueChange={(type) => updateAction(index, { type })}
          />
          <input
            className="input"
            placeholder={action.type === "email" ? "oncall@example.com" : "https://hooks.example.com/incoming"}
            value={action.target}
            disabled={disabled}
            onChange={(event) => updateAction(index, { target: event.target.value })}
          />
          <button
            className="icon-button"
            type="button"
            aria-label="Remove notification action"
            disabled={disabled}
            onClick={() => removeAction(index)}
          >
            <FiTrash2 />
          </button>
        </div>
      ))}
      <button className="secondary-button" type="button" disabled={disabled} onClick={addAction}>
        <FiPlus />
        Add notification action
      </button>
    </div>
  );
}
