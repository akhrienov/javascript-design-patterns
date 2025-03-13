/**
 * @fileoverview Example usage of the Proxy Pattern implementation.
 *
 * This file demonstrates how to use our API client proxy in a real application,
 * showcasing its caching and rate limiting capabilities.
 */

import { ApiClientProxy } from './proxy.implementation.js';
import { createApiClientProxy } from './proxy.functional.js';

/**
 * Example using the class-based implementation
 */
async function demoClassBasedProxy() {
  console.log('=== Class-Based Proxy Implementation ===');

  // Create a proxy for a public API with custom options
  const api = new ApiClientProxy('https://jsonplaceholder.typicode.com', {
    cacheTtl: 30000, // 30 seconds
    rateLimit: 5, // 5 requests per minute for demo
  });

  try {
    console.log('Fetching posts...');
    const posts = await api.get('/posts', { _limit: 3 });
    console.log(`Got ${posts.length} posts`);

    console.log('Fetching the same posts again (should use cache)...');
    const cachedPosts = await api.get('/posts', { _limit: 3 });
    console.log(`Got ${cachedPosts.length} posts from cache`);

    console.log('Fetching a user...');
    const user = await api.get('/users/1');
    console.log(`Got user: ${user.name}`);

    // Display cache statistics
    const stats = api.getCacheStats();
    console.log('Cache statistics:', stats);

    // Demonstrate POST method
    console.log('Creating a new post...');
    const newPost = await api.post('/posts', {
      title: 'Using the Proxy Pattern',
      body: 'This post demonstrates using the API client proxy',
      userId: 1,
    });
    console.log(`Created post with ID: ${newPost.id}`);

    // Demonstrate cache clearing
    console.log('Clearing the cache...');
    api.clearCache();

    console.log('Fetching posts again (after cache clear)...');
    const freshPosts = await api.get('/posts', { _limit: 3 });
    console.log(`Got ${freshPosts.length} posts`);
  } catch (error) {
    console.error('Error in demo:', error.message);
  }
}

/**
 * Example using the functional implementation
 */
async function demoFunctionalProxy() {
  console.log('\n=== Functional Proxy Implementation ===');

  // Create a proxy for a public API with custom options
  const api = createApiClientProxy('https://jsonplaceholder.typicode.com', {
    cacheTtl: 30000, // 30 seconds
    rateLimit: 5, // 5 requests per minute for demo
  });

  try {
    console.log('Fetching posts...');
    const posts = await api.get('/posts', { _limit: 3 });
    console.log(`Got ${posts.length} posts`);

    console.log('Fetching the same posts again (should use cache)...');
    const cachedPosts = await api.get('/posts', { _limit: 3 });
    console.log(`Got ${cachedPosts.length} posts from cache`);

    console.log('Fetching a user...');
    const user = await api.get('/users/1');
    console.log(`Got user: ${user.name}`);

    // Display cache statistics
    const stats = api.getCacheStats();
    console.log('Cache statistics:', stats);

    // Demonstrate POST method
    console.log('Creating a new post...');
    const newPost = await api.post('/posts', {
      title: 'Using the Functional Proxy Pattern',
      body: 'This post demonstrates using the functional API client proxy',
      userId: 1,
    });
    console.log(`Created post with ID: ${newPost.id}`);

    // Demonstrate cache clearing
    console.log('Clearing the cache...');
    api.clearCache();

    console.log('Fetching posts again (after cache clear)...');
    const freshPosts = await api.get('/posts', { _limit: 3 });
    console.log(`Got ${freshPosts.length} posts`);
  } catch (error) {
    console.error('Error in demo:', error.message);
  }
}

/**
 * Demonstrate rate limiting behavior
 */
async function demoRateLimit() {
  console.log('\n=== Rate Limiting Demonstration ===');

  // Create a proxy with a strict rate limit for demo purposes
  const api = createApiClientProxy('https://jsonplaceholder.typicode.com', {
    rateLimit: 3, // Only 3 requests per minute
  });

  try {
    console.log('Making multiple requests quickly...');

    // First 3 requests should succeed
    for (let i = 1; i <= 3; i++) {
      console.log(`Request ${i}...`);
      const user = await api.get(`/users/${i}`);
      console.log(`Got user: ${user.name}`);
    }

    // 4th request should hit rate limit
    console.log('Attempting 4th request (should hit rate limit)...');
    await api.get('/users/4');
  } catch (error) {
    console.error('Expected error:', error.message);
  }
}

/**
 * Run all the demos sequentially
 */
async function runDemos() {
  try {
    await demoClassBasedProxy();
    await demoFunctionalProxy();
    await demoRateLimit();

    console.log('\nAll demos completed!');
  } catch (error) {
    console.error('Error running demos:', error);
  }
}

runDemos().catch(console.error);
