import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { FormField } from "../../../shared/ui/FormField";
import { QueryBuilderFields } from "./QueryBuilderFields";
import { DEFAULT_QUERY } from "./queryDefaults";
import { QueryPreview } from "./QueryPreview";

const blankWidget = () => ({ title: "", chartType: "stat", query: { ...DEFAULT_QUERY, filters: {} } });

export function WidgetForm({ initialWidget, onSave, onCancel }) {
  const [widget, setWidget] = useState(initialWidget || blankWidget());

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(widget);
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField
        label="Widget title"
        value={widget.title}
        onChange={(event) => setWidget((current) => ({ ...current, title: event.target.value }))}
        placeholder="Open critical issues"
        required
      />

      <QueryBuilderFields
        query={widget.query}
        onChange={(query) => setWidget((current) => ({ ...current, query }))}
      />

      <QueryPreview query={widget.query} />

      <div className="form-actions project-dialog-footer">
        <button className="secondary-button" type="button" onClick={onCancel}>
          <FiX />
          Cancel
        </button>
        <button className="primary-button" type="submit" disabled={!widget.title || !widget.query.dataset}>
          <FiPlus />
          Save widget
        </button>
      </div>
    </form>
  );
}
