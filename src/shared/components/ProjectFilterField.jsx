import { useMemo } from "react";
import { RoleSelect } from "../ui/RoleSelect";
import { useLocation } from "react-router-dom";
import { useProjectFilter } from "../projectFilter/useProjectFilter";

export function ProjectFilterField({ className }) {
  const { projects, selectedProjectId, setSelectedProjectId, isLoading } =
    useProjectFilter();
  const location = useLocation();

const currentPage = location.pathname.includes("performance");

  const options = useMemo(
    () => [
      { value: "all", label: "All projects" },
      ...projects.map((project) => ({
        value: project.id ?? project._id,
        label: project.name,
      })),
    ],
    [projects],
  );

  return (
    <div
      className={["performance-filter-field", className]
        .filter(Boolean)
        .join(" ")}
    >
      {currentPage === true && <span>Project</span>}
      <RoleSelect
        value={selectedProjectId}
        options={options}
        onValueChange={setSelectedProjectId}
        disabled={isLoading}
        label="Project"
      />
    </div>
  );
}
