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
    <div className="search-control">
      <FiSearch aria-hidden="true" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
