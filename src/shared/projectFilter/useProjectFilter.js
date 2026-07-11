import { useContext } from "react";
import { ProjectFilterContext } from "./projectFilterContext";

export function useProjectFilter() {
  const context = useContext(ProjectFilterContext);

  if (!context) {
    throw new Error("useProjectFilter must be used inside ProjectFilterProvider");
  }

  return context;
}
