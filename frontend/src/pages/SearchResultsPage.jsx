import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      const res = await fetch(`/api/search?query=${query}`);
      const data = await res.json();
      setResults(data);
    };
    fetchResults();
  }, [query]);

  if (!results) return <p>Loading...</p>;

  return (
    <div>
      <h2>Results for "{query}"</h2>
      <h3>Users</h3>
      {results.users.map((user) => (
        <p key={user._id}>{user.username}</p>
      ))}
      <h3>Products</h3>
      {results.products.map((p) => (
        <p key={p._id}>{p.name}</p>
      ))}
      {}
    </div>
  );
};

export default SearchResultsPage;
