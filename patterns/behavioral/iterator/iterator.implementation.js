/**
 * Represents a task in the queue
 */
class Task {
  /**
   * Create a new task
   * @param {string} id - Unique identifier for the task
   * @param {string} title - Task title
   * @param {string} description - Task description
   * @param {number} priority - Priority level (higher = more important)
   * @param {string} status - Task status (pending, in-progress, completed, failed)
   */
  constructor(id, title, description, priority = 1, status = 'pending') {
    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.status = status;
    this.createdAt = new Date();
    this.startedAt = null;
    this.completedAt = null;
  }

  /**
   * Start the task execution
   * @returns {Task} - The updated task
   */
  start() {
    this.status = 'in-progress';
    this.startedAt = new Date();
    return this;
  }

  /**
   * Mark the task as completed
   * @returns {Task} - The updated task
   */
  complete() {
    this.status = 'completed';
    this.completedAt = new Date();
    return this;
  }

  /**
   * Mark the task as failed
   * @param {Error} [error] - Optional error information
   * @returns {Task} - The updated task
   */
  fail(error) {
    this.status = 'failed';
    this.error = error?.message || 'Unknown error';
    this.completedAt = new Date();
    return this;
  }
}

/**
 * TaskQueue - Manages a collection of tasks with prioritization
 */
class TaskQueue {
  /**
   * Create a new task queue
   * @param {Object} options - Queue configuration options
   * @param {boolean} [options.processByPriority=true] - Whether to process tasks by priority
   */
  constructor(options = {}) {
    this.tasks = [];
    this.processByPriority = options.processByPriority !== false;
    this.eventListeners = {
      taskAdded: [],
      taskStarted: [],
      taskCompleted: [],
      taskFailed: [],
    };
  }

  /**
   * Add a task to the queue
   * @param {Task} task - The task to add
   * @returns {TaskQueue} - Returns this for method chaining
   */
  addTask(task) {
    this.tasks.push(task);
    this._notifyListeners('taskAdded', task);
    return this;
  }

  /**
   * Add multiple tasks to the queue
   * @param {Task[]} tasks - Array of tasks to add
   * @returns {TaskQueue} - Returns this for method chaining
   */
  addTasks(tasks) {
    tasks.forEach((task) => this.addTask(task));
    return this;
  }

  /**
   * Get a task by its ID
   * @param {string} id - The task ID to find
   * @returns {Task|undefined} - The found task or undefined
   */
  getTaskById(id) {
    return this.tasks.find((task) => task.id === id);
  }

  /**
   * Get all tasks with a specific status
   * @param {string} status - The status to filter by
   * @returns {Task[]} - Array of matching tasks
   */
  getTasksByStatus(status) {
    return this.tasks.filter((task) => task.status === status);
  }

  /**
   * Count tasks by status
   * @returns {Object} - Counts of tasks by status
   */
  getTaskCounts() {
    const counts = {
      total: this.tasks.length,
      pending: 0,
      'in-progress': 0,
      completed: 0,
      failed: 0,
    };

    this.tasks.forEach((task) => {
      counts[task.status]++;
    });

    return counts;
  }

  /**
   * Process a single task
   * @param {Task} task - The task to process
   * @param {Function} processor - Function to process the task
   * @returns {Promise<Task>} - The processed task
   */
  async processTask(task, processor) {
    try {
      task.start();
      this._notifyListeners('taskStarted', task);

      await processor(task);

      task.complete();
      this._notifyListeners('taskCompleted', task);
    } catch (error) {
      task.fail(error);
      this._notifyListeners('taskFailed', task, error);
    }

    return task;
  }

  /**
   * Subscribe to task events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }

    this.eventListeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.eventListeners[event] = this.eventListeners[event].filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify event listeners
   * @private
   * @param {string} event - Event name
   * @param {Task} task - The related task
   * @param {Error} [error] - Optional error information
   */
  _notifyListeners(event, task, error) {
    const listeners = this.eventListeners[event] || [];
    listeners.forEach((callback) => callback(task, error));
  }

  /**
   * Create an iterator for this task queue
   * @param {Object} options - Iterator options
   * @param {string} [options.status] - Filter tasks by status
   * @param {number} [options.batchSize=1] - Number of tasks to yield at once
   * @returns {TaskQueueIterator} - An iterator for the filtered tasks
   */
  createIterator(options = {}) {
    return new TaskQueueIterator(this, options);
  }

  /**
   * Create iterator following the iterable protocol (for...of support)
   * @returns {Object} - An iterator object
   */
  [Symbol.iterator]() {
    const filteredTasks = [...this.tasks];

    if (this.processByPriority) {
      filteredTasks.sort((a, b) => b.priority - a.priority);
    }

    let index = 0;

    return {
      next() {
        if (index < filteredTasks.length) {
          return { value: filteredTasks[index++], done: false };
        }
        return { done: true };
      },
    };
  }
}

/**
 * TaskQueueIterator - Provides various ways to iterate through tasks
 */
class TaskQueueIterator {
  /**
   * Create a new task queue iterator
   * @param {TaskQueue} taskQueue - The task queue to iterate
   * @param {Object} options - Iterator options
   * @param {string} [options.status] - Filter tasks by status
   * @param {number} [options.batchSize=1] - Number of tasks to yield at once
   */
  constructor(taskQueue, options = {}) {
    this.taskQueue = taskQueue;
    this.status = options.status;
    this.batchSize = options.batchSize || 1;
    this.currentIndex = 0;
    this._refreshTasks();
  }

  /**
   * Refresh the tasks array based on current filters
   * @private
   */
  _refreshTasks() {
    let tasks = [...this.taskQueue.tasks];

    // Apply status filter if specified
    if (this.status) {
      tasks = tasks.filter((task) => task.status === this.status);
    }

    // Sort by priority if enabled in the queue
    if (this.taskQueue.processByPriority) {
      tasks.sort((a, b) => b.priority - a.priority);
    }

    this.tasks = tasks;
  }

  /**
   * Check if there are more tasks to process
   * @returns {boolean} - True if there are more tasks
   */
  hasNext() {
    return this.currentIndex < this.tasks.length;
  }

  /**
   * Get the next task or batch of tasks
   * @returns {Task|Task[]|null} - The next task(s) or null if no more tasks
   */
  next() {
    this._refreshTasks(); // Refresh to get any new tasks or status changes

    if (!this.hasNext()) {
      return null;
    }

    if (this.batchSize === 1) {
      return this.tasks[this.currentIndex++];
    } else {
      const batch = [];
      const endIndex = Math.min(this.currentIndex + this.batchSize, this.tasks.length);

      while (this.currentIndex < endIndex) {
        batch.push(this.tasks[this.currentIndex++]);
      }

      return batch;
    }
  }

  /**
   * Reset the iterator to the beginning
   */
  reset() {
    this.currentIndex = 0;
  }

  /**
   * Process remaining tasks with the given processor function
   * @param {Function} processor - Function to process each task
   * @param {Object} options - Processing options
   * @param {number} [options.concurrency=1] - How many tasks to process at once
   * @returns {Promise<Task[]>} - The processed tasks
   */
  async processRemaining(processor, options = {}) {
    const concurrency = options.concurrency || 1;
    const processedTasks = [];

    if (concurrency === 1) {
      // Sequential processing
      while (this.hasNext()) {
        const task = this.next();
        const processedTask = await this.taskQueue.processTask(task, processor);
        processedTasks.push(processedTask);
      }
    } else {
      // Parallel processing with limited concurrency
      while (this.hasNext()) {
        const batch = [];
        const batchSize = Math.min(concurrency, this.tasks.length - this.currentIndex);

        for (let i = 0; i < batchSize && this.hasNext(); i++) {
          batch.push(this.next());
        }

        const results = await Promise.all(
          batch.map((task) => this.taskQueue.processTask(task, processor))
        );

        processedTasks.push(...results);
      }
    }

    return processedTasks;
  }

  /**
   * Create a new iterator that filters tasks by a custom predicate
   * @param {Function} predicate - Filter function returning boolean
   * @returns {TaskQueueIterator} - A new filtered iterator
   */
  filter(predicate) {
    const newIterator = new TaskQueueIterator(this.taskQueue, {
      batchSize: this.batchSize,
    });

    // Override the tasks with filtered results
    newIterator._refreshTasks = () => {
      let tasks = [...this.taskQueue.tasks];
      tasks = tasks.filter(predicate);

      if (this.taskQueue.processByPriority) {
        tasks.sort((a, b) => b.priority - a.priority);
      }

      newIterator.tasks = tasks;
    };

    newIterator._refreshTasks();
    return newIterator;
  }

  /**
   * Create a generator for iterating through tasks
   * Allows using for...of syntax with the iterator
   * @generator
   * @yields {Task} Task objects
   */
  *[Symbol.iterator]() {
    this.reset(); // Reset before iteration
    while (this.hasNext()) {
      yield this.next();
    }
  }
}

export { Task, TaskQueue, TaskQueueIterator };
