export function LogsTableHeader() {
  return (
    <thead className="issue-table-header">
      <tr>
        <th scope="col">Level</th>
        <th scope="col">Message</th>
        <th scope="col">Logger</th>
        <th scope="col">Occurred</th>
        <th scope="col">Trace</th>
      </tr>
    </thead>
  );
}
