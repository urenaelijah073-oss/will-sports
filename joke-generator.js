// Random Joke Generator using JokeAPI
// This fetches random jokes from an external API

// Helper to ensure `fetch` is available in Node.js environments
// - If running in a browser or Node 18+, `fetch` is already present.
// - Otherwise try to load `node-fetch` (supports CommonJS require and dynamic ESM import).
async function ensureFetch() {
  if (typeof fetch !== 'undefined') return fetch;

  // Try CommonJS require (node-fetch v2 or compatible)
  try {
    // eslint-disable-next-line global-require
    const nodeFetch = require('node-fetch');
    if (nodeFetch) {
      // node-fetch v2 exports the function directly
      global.fetch = nodeFetch;
      return global.fetch;
    }
  } catch (e) {
    // ignore and try dynamic import next
  }

  // Try dynamic import (node-fetch v3 is ESM-only)
  try {
    const mod = await import('node-fetch');
    global.fetch = mod.default || mod;
    return global.fetch;
  } catch (e) {
    // No fetch available
    throw new Error('`fetch` is not available. Please run on Node.js 18+ or install `node-fetch`.');
  }
}

const fetchJoke = async () => {
  try {
    const _fetch = await ensureFetch();

    // Fetch a random joke from JokeAPI
    const response = await _fetch('https://v2.jokeapi.dev/joke/Any');

    if (!response.ok) {
      throw new Error('Failed to fetch joke');
    }

    const data = await response.json();

    // JokeAPI returns either a single joke or a two-part joke
    if (data.type === 'single') {
      console.log('Joke:', data.joke);
      return data.joke;
    } else if (data.type === 'twopart') {
      console.log('Setup:', data.setup);
      console.log('Delivery:', data.delivery);
      return `${data.setup}\n${data.delivery}`;
    }

    // Unexpected format
    throw new Error('Unexpected joke format');
  } catch (error) {
    console.error('Error fetching joke:', error.message || error);
    return 'Sorry, could not fetch a joke at this time.';
  }
};

// Function to get a joke from a specific category
const fetchJokeByCategory = async (category = 'Any') => {
  try {
    const _fetch = await ensureFetch();
    const response = await _fetch(`https://v2.jokeapi.dev/joke/${encodeURIComponent(category)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch joke from category: ${category}`);
    }

    const data = await response.json();

    if (data.type === 'single') {
      return data.joke;
    } else if (data.type === 'twopart') {
      return `${data.setup}\n${data.delivery}`;
    }

    throw new Error('Unexpected joke format');
  } catch (error) {
    console.error('Error fetching joke by category:', error.message || error);
    return 'Sorry, could not fetch a joke at this time.';
  }
};

// Categories available: General, Programming, Knock-knock, Spooky, Christmas, Any
// Example usage:
(async () => {
  console.log('\n=== Random Joke ===');
  const random = await fetchJoke();
  console.log(random);

  console.log('\n=== Programming Joke ===');
  const prog = await fetchJokeByCategory('Programming');
  console.log(prog);

  console.log('\n=== Knock-knock Joke ===');
  const kk = await fetchJokeByCategory('Knock-knock');
  console.log(kk);
})();
