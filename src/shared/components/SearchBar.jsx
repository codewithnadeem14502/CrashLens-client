import { FiSearch } from "react-icons/fi";
import { useEffect } from "react";

const SearchBar = ({
  data = [],
  searchQuery,
  setSearchQuery,
  filterFn,
  onFilteredData,
  placeholder = "Search...",
}) => {
  useEffect(() => {
    if (!searchQuery?.trim()) {
      onFilteredData(data);
      return;
    }
    onFilteredData(filterFn(data, searchQuery));
  }, [data, filterFn, onFilteredData, searchQuery]);

  return (
    <div className="relative my-4">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          rounded-lg
          border
          border-gray-300
          bg-white
          py-2.5
          pl-10
          pr-4
          text-sm
          shadow-sm
          transition
          focus:border-indigo-500
          focus:ring-2
          focus:ring-indigo-200
          outline-none
        "
      />
    </div>
  );
};

export default SearchBar;
