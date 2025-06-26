import React, { useState } from 'react';
import '../Searchbar.css';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <div className="searchbar-container">
      <form onSubmit={handleSubmit} className="searchbar-form">
        <input
          type="text"
          placeholder="Search places..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="searchbar-input"
        />
        <button type="submit" className="searchbar-button">
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
