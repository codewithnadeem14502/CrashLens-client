// Mirrors ProjectRow.jsx's local ProjectDetailItem (same label/value/icon
// shape) so it stays on the shared token-driven `.project-detail-item`
// class instead of the hardcoded light-theme Tailwind utilities (bg-white,
// text-gray-*) this component previously used, which rendered a white card
// against the app's dark theme.
const InfoCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="project-detail-item">
      <span>
        <Icon />
        {label}
      </span>
      <strong>{value || "-"}</strong>
    </div>
  );
};
export default InfoCard;
