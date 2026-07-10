import { FiUserPlus } from "react-icons/fi";

export function AssigneeButton({ assignee }) {
  const label = assignee?.name ?? assignee?.email ?? "Unassigned";

  return (
    <span className="assignee-pill">
      <FiUserPlus />
      {label}
    </span>
  );
}
