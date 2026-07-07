import { useState } from "react";
import * as Label from "@radix-ui/react-label";
import { FiEye, FiEyeOff } from "react-icons/fi";

export function PasswordField({ label, ...inputProps }) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? FiEyeOff : FiEye;

  return (
    <div className="field">
      <Label.Root className="label">{label}</Label.Root>
      <div className="password-control">
        <input className="input password-input" type={isVisible ? "text" : "password"} {...inputProps} />
        <button
          className="password-toggle"
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          onClick={() => setIsVisible((current) => !current)}
          disabled={inputProps.disabled}
        >
          <Icon />
        </button>
      </div>
    </div>
  );
}
