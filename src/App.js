import { useState, useEffect, useCallback } from "react";
import { algoliasearch } from "algoliasearch";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { Input, Spin, Card, Empty } from "antd";
const { Search } = Input;

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID,
  process.env.REACT_APP_ALGOLIA_API_KEY
);

const App = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { results } = await searchClient.search([
          {
            indexName: process.env.REACT_APP_ALGOLIA_INDEX,
            query: searchQuery,
          },
        ]);
        setResults(results[0]?.hits || []);
      } catch (err) {
        setError("Failed to fetch results");
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    search(query);
  }, [query, search]);

  return (
    <div className="container">
      <Search
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        enterButton
        size="large"
        className="search-box"
      />

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="loader"
        >
          <Spin size="large" />
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="error-message"
        >
          {error}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {loading && results.length === 0 && (
          <div className="loading-cards">
            {Array(3)
              .fill("")
              .map((_, index) => (
                <Card key={index} loading={true} className="card" />
              ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <Empty description="No results found" className="empty" />
        )}

        {results.length > 0 && !loading && (
          <div className="results">
            {results.map((item) => (
              <motion.div
                key={item.objectID}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card hoverable className="card">
                  {item.title}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default App;
