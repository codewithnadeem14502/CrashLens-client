import * as Tooltip from "@radix-ui/react-tooltip";
import {
  COMMUNICATION_LEGEND,
} from "../content/architecture";
import { MAIN_EDGES, MAIN_FLOW, SUPPORTING_FLOWS } from "../content/workflow";

function FlowConnector({ edge }) {
  return (
    <div
      className={`engineering-flow-connector ${edge.kind}`}
      role="img"
      aria-label={`${edge.kind === "async" ? "Asynchronous" : "Synchronous"}: ${edge.label}`}
    >
      <span className="engineering-flow-arrow engineering-flow-arrow-down" aria-hidden="true">
        ↓
      </span>
      <span className="engineering-flow-arrow engineering-flow-arrow-right" aria-hidden="true">
        →
      </span>
      <span className="engineering-flow-connector-label">{edge.label}</span>
    </div>
  );
}

export function WorkflowDiagram() {
  return (
    <section className="panel engineering-panel">
      <div className="panel-heading">
        <h2>High-level workflow</h2>
        <p className="muted">
          The end-to-end path from an application reporting an error to it appearing
          as an issue on this dashboard.
        </p>
      </div>

      <div className="engineering-legend" aria-hidden="false">
        {COMMUNICATION_LEGEND.map((entry) => (
          <span key={entry.kind} className={`engineering-legend-item ${entry.kind}`}>
            <span className="engineering-legend-swatch" aria-hidden="true" />
            {entry.label}
          </span>
        ))}
      </div>

      <Tooltip.Provider delayDuration={150}>
        <ol className="engineering-flow" aria-label="Main event flow">
          {MAIN_FLOW.map((node, index) => (
            <li key={node.id} className="engineering-flow-step">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className="engineering-flow-node" tabIndex={0}>
                    <strong>{node.title}</strong>
                    <span className="muted">{node.detail}</span>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    sideOffset={6}
                    className="engineering-tooltip-content"
                  >
                    {node.detail}
                    <Tooltip.Arrow className="engineering-tooltip-arrow" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              {index < MAIN_EDGES.length && (
                <FlowConnector edge={MAIN_EDGES[index]} />
              )}
            </li>
          ))}
        </ol>
      </Tooltip.Provider>

      <div className="engineering-supporting-flows">
        <h3>Supporting flows</h3>
        {SUPPORTING_FLOWS.map((flow) => (
          <details key={flow.id} className="engineering-flow-detail">
            <summary>{flow.title}</summary>
            <ol>
              {flow.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </details>
        ))}
      </div>
    </section>
  );
}

export default WorkflowDiagram;
