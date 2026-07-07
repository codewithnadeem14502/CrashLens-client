import * as Accordion from "@radix-ui/react-accordion";
import { FiChevronDown } from "react-icons/fi";
import ProjectRow from "./ProjectRow";

const ProjectList = ({
  projects,
  canUpdateProjects,
  canDeleteProjects,
  onProjectUpdate,
  onDeleteProject,
  onRegenerateDSN,
}) => {
  return (
    <Accordion.Root type="single" collapsible className="space-y-4">
      {projects.map((item) => (
        <Accordion.Item
          key={item.id}
          value={item.id}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          {/* Accordion Header */}

          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50">
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>

                <div className="mt-2 flex gap-2">
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    {item.environment}
                  </span>

                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      item.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                    {item.settings.platform}
                  </span>
                </div>
              </div>

              <FiChevronDown className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>

          {/* Accordion Content */}

          <Accordion.Content className="border-t bg-gray-50">
            <ProjectRow
              project={item}
              onProjectUpdate={onProjectUpdate}
              onDeleteProject={onDeleteProject}
              onRegenerateDSN={onRegenerateDSN}
              canUpdate={canUpdateProjects}
              canDelete={canDeleteProjects}
            />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
};

export default ProjectList;
