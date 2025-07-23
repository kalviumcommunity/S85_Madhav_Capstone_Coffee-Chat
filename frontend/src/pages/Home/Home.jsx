import { useEffect } from 'react';

function Home({ setLoading }) {
  useEffect(() => {
    setLoading(true);
    // Simulate fetch or use your real fetch logic
    fetchData().then(() => setLoading(false));
  }, [setLoading]);

  return (
    // ... actual content (no local loading UI)
  );
}

export default Home; 