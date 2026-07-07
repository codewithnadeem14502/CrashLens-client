const InfoCard = ({ icon: Icon, label, value }) => {
  return (
    <>
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
          <Icon className="text-gray-400" />
          {label}
        </div>

        <p className="break-all text-sm font-semibold text-gray-900">
          {value || "-"}
        </p>
      </div>
    </>
  );
};
export default InfoCard;
