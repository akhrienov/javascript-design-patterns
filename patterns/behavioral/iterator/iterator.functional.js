/**
 * Creates a new task object
 * @param {string} id - Unique identifier for the task
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {number} priority - Priority level (higher = more important)
 * @param {string} status - Task status (pending, in-progress, completed, failed)
 * @returns {Object} - Task object with methods
 */
const createTask = (id, title, description, priority = 1, status = 'pending') => {
  const task = {
    id,
    title,
    description,
    priority,
    status,
    createdAt: new Date(),
    startedAt: null,
    completedAt: null,
    error: null,

    // Task methods
    start() {
      task.status = 'in-progress';
      task.startedAt = new Date();
      return task;
    },

    complete() {
      task.status = 'completed';
      task.completedAt = new Date();
      return task;
    },

    fail(error) {
      task.status = 'failed';
      task.error = error?.message || 'Unknown error';
      task.completedAt = new Date();
      return task;
    },
  };

  return task;
};

/**
 * Creates a task queue with iterator capabilities
 * @param {Object} options - Queue configuration options
 * @param {boolean} [options.processByPriority=true] - Whether to process tasks by priority
 * @returns {Object} - Task queue object with methods
 */
const createTaskQueue = (options = {}) => {
  // Internal state
  const state = {
    tasks: [],
    processByPriority: options.processByPriority !== false,
    eventListeners: {
      taskAdded: [],
      taskStarted: [],
      taskCompleted: [],
      taskFailed: [],
    },
  };

  /**
   * Notify event listeners
   * @param {string} event - Event name
   * @param {Object} task - The related task
   * @param {Error} [error] - Optional error information
   */
  const notifyListeners = (event, task, error) => {
    const listeners = state.eventListeners[event] || [];
    listeners.forEach((callback) => callback(task, error));
  };

  /**
   * Get filtered and sorted tasks based on criteria
   * @param {Object} filters - Filtering criteria
   * @param {string} [filters.status] - Filter by status
   * @returns {Array} - Filtered and sorted tasks
   */
  const getFilteredTasks = (filters = {}) => {
    let filteredTasks = [...state.tasks];

    // Apply status filter if specified
    if (filters.status) {
      filteredTasks = filteredTasks.filter((task) => task.status === filters.status);
    }

    // Sort by priority if enabled
    if (state.processByPriority) {
      filteredTasks.sort((a, b) => b.priority - a.priority);
    }

    return filteredTasks;
  };

  // Public API
  const taskQueue = {
    /**
     * Add a task to the queue
     * @param {Object} task - The task to add
     * @returns {Object} - Returns taskQueue for method chaining
     */
    addTask(task) {
      state.tasks.push(task);
      notifyListeners('taskAdded', task);
      return taskQueue;
    },

    /**
     * Add multiple tasks to the queue
     * @param {Array} tasks - Array of tasks to add
     * @returns {Object} - Returns taskQueue for method chaining
     */
    addTasks(tasks) {
      tasks.forEach((task) => taskQueue.addTask(task));
      return taskQueue;
    },

    /**
     * Get a task by its ID
     * @param {string} id - The task ID to find
     * @returns {Object|undefined} - The found task or undefined
     */
    getTaskById(id) {
      return state.tasks.find((task) => task.id === id);
    },

    /**
     * Get all tasks with a specific status
     * @param {string} status - The status to filter by
     * @returns {Array} - Array of matching tasks
     */
    getTasksByStatus(status) {
      return state.tasks.filter((task) => task.status === status);
    },

    /**
     * Count tasks by status
     * @returns {Object} - Counts of tasks by status
     */
    getTaskCounts() {
      const counts = {
        total: state.tasks.length,
        pending: 0,
        'in-progress': 0,
        completed: 0,
        failed: 0,
      };

      state.tasks.forEach((task) => {
        counts[task.status]++;
      });

      return counts;
    },

    /**
     * Process a single task
     * @param {Object} task - The task to process
     * @param {Function} processor - Function to process the task
     * @returns {Promise<Object>} - The processed task
     */
    async processTask(task, processor) {
      try {
        task.start();
        notifyListeners('taskStarted', task);

        await processor(task);

        task.complete();
        notifyListeners('taskCompleted', task);
      } catch (error) {
        task.fail(error);
        notifyListeners('taskFailed', task, error);
      }

      return task;
    },

    /**
     * Subscribe to task events
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} - Unsubscribe function
     */
    on(event, callback) {
      if (!state.eventListeners[event]) {
        state.eventListeners[event] = [];
      }

      state.eventListeners[event].push(callback);

      // Return unsubscribe function
      return () => {
        state.eventListeners[event] = state.eventListeners[event].filter((cb) => cb !== callback);
      };
    },

    /**
     * Create an iterator for this task queue
     * @param {Object} options - Iterator options
     * @param {string} [options.status] - Filter tasks by status
     * @param {number} [options.batchSize=1] - Number of tasks to yield at once
     * @returns {Object} - A task queue iterator
     */
    iterator(options = {}) {
      let currentIndex = 0;
      const batchSize = options.batchSize || 1;

      // Initial filtered tasks
      let tasks = getFilteredTasks({ status: options.status });

      // Iterator object
      const iterator = {
        /**
         * Check if there are more tasks to process
         * @returns {boolean} - True if there are more tasks
         */
        hasNext() {
          // Refresh tasks to get the latest state
          tasks = getFilteredTasks({ status: options.status });
          return currentIndex < tasks.length;
        },

        /**
         * Get the next task or batch of tasks
         * @returns {Object|Array|null} - The next task(s) or null if no more tasks
         */
        next() {
          if (!iterator.hasNext()) {
            return null;
          }

          if (batchSize === 1) {
            return tasks[currentIndex++];
          } else {
            const batch = [];
            const endIndex = Math.min(currentIndex + batchSize, tasks.length);

            while (currentIndex < endIndex) {
              batch.push(tasks[currentIndex++]);
            }

            return batch;
          }
        },

        /**
         * Reset the iterator to the beginning
         */
        reset() {
          currentIndex = 0;
          tasks = getFilteredTasks({ status: options.status });
        },

        /**
         * Process remaining tasks with the given processor function
         * @param {Function} processor - Function to process each task
         * @param {Object} options - Processing options
         * @param {number} [options.concurrency=1] - How many tasks to process at once
         * @returns {Promise<Array>} - The processed tasks
         */
        async processRemaining(processor, options = {}) {
          const concurrency = options.concurrency || 1;
          const processedTasks = [];

          if (concurrency === 1) {
            // Sequential processing
            while (iterator.hasNext()) {
              const task = iterator.next();
              const processedTask = await taskQueue.processTask(task, processor);
              processedTasks.push(processedTask);
            }
          } else {
            // Parallel processing with limited concurrency
            while (iterator.hasNext()) {
              const batch = [];
              const batchSize = Math.min(concurrency, tasks.length - currentIndex);

              for (let i = 0; i < batchSize && iterator.hasNext(); i++) {
                batch.push(iterator.next());
              }

              const results = await Promise.all(
                batch.map((task) => taskQueue.processTask(task, processor))
              );

              processedTasks.push(...results);
            }
          }

          return processedTasks;
        },

        /**
         * Create a new iterator that filters tasks by a custom predicate
         * @param {Function} predicate - Filter function returning boolean
         * @returns {Object} - A new filtered iterator
         */
        filter(predicate) {
          return taskQueue
            .iterator({
              ...options,
              // Override the getFilteredTasks function for this specific iterator
              status: null, // Clear the status filter since we're using a custom predicate
              customFilter: true,
            })
            .withCustomFilter(predicate);
        },

        /**
         * Apply a custom filter to this iterator
         * @param {Function} predicate - Filter function
         * @returns {Object} - This iterator with custom filter applied
         */
        withCustomFilter(predicate) {
          const originalHasNext = iterator.hasNext;

          // Override the hasNext method to apply custom filtering
          iterator.hasNext = () => {
            tasks = getFilteredTasks({ status: options.status }).filter(predicate);
            return currentIndex < tasks.length;
          };

          return iterator;
        },

        /**
         * Make the iterator iterable (for...of support)
         */
        [Symbol.iterator]() {
          iterator.reset();

          return {
            next() {
              if (iterator.hasNext()) {
                const value = iterator.next();
                return { value, done: false };
              }
              return { done: true };
            },
          };
        },
      };

      return iterator;
    },

    /**
     * Create iterator following the iterable protocol (for...of support)
     * @returns {Object} - An iterator object
     */
    [Symbol.iterator]() {
      const iter = taskQueue.iterator();

      return {
        next() {
          if (iter.hasNext()) {
            const value = iter.next();
            return { value, done: false };
          }
          return { done: true };
        },
      };
    },
  };

  return taskQueue;
};

export { createTask, createTaskQueue };
