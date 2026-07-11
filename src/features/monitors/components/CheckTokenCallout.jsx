import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { useToast } from "../../../shared/components/useToast";

// Only ever shown once, right after creation/regeneration - same
// one-time-visible convention as a project's DSN. No shared clipboard
// component exists in this app yet (ProjectRow.jsx does the same
// navigator.clipboard.writeText inline) - mirrored here rather than
// introducing a new shared component for a single call site.
export function CheckTokenCallout({ checkToken }) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(checkToken);
      setCopied(true);
      notify({ title: "Copied", description: "Check token copied to clipboard.", tone: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify({ title: "Copy failed", description: "Could not copy to clipboard.", tone: "danger" });
    }
  };

  return (
    <div className="callout callout-warning">
      <strong>Save this check token now - it won't be shown again.</strong>
      <p className="muted">
        Configure your cron job to POST it to the check-in URL below when the job starts/finishes.
      </p>
      <div className="copy-field-row">
        <input className="input" readOnly value={checkToken} />
        <button className="icon-button" type="button" onClick={copyToken} aria-label="Copy check token">
          {copied ? <FiCheck /> : <FiCopy />}
        </button>
      </div>
    </div>
  );
}
