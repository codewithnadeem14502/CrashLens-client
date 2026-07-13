// Legend for the workflow diagram's connector styling - sync HTTP vs async
// RabbitMQ, verified against each service's actual communication pattern.

export const COMMUNICATION_LEGEND = [
  { kind: "sync", label: "Synchronous HTTP", description: "A request/response call - client-to-gateway, gateway-to-service, or alert-service's system-token reads." },
  { kind: "async", label: "Asynchronous RabbitMQ", description: "A publish onto the crashlens.events topic exchange, consumed independently by one or more queues." },
];
