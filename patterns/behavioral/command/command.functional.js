/**
 * Create a task manager (the receiver)
 * @returns {Object} - Task manager API
 */
const createTaskManager = () => {
  // Private state
  const tasks = new Map();
  let lastId = 0;

  // Return public API
  return {
    /**
     * Create a new task with the given details
     * @param {string} title - The task title
     * @param {string} description - The task description
     * @param {number} priority - Priority level (1-5)
     * @returns {object} - The created task object with its ID
     */
    createTask: (title, description, priority = 3) => {
      const id = ++lastId;
      const task = {
        id,
        title,
        description,
        priority,
        completed: false,
        createdAt: new Date(),
        completedAt: null,
      };

      tasks.set(id, task);
      return task;
    },

    /**
     * Complete a task by its ID
     * @param {number} taskId - The ID of the task to complete
     * @returns {object|null} - The previous state for undo operations
     */
    completeTask: (taskId) => {
      const task = tasks.get(taskId);
      if (!task) return null;

      // Store previous state for undo operations
      const previousState = { ...task };

      // Update task state
      task.completed = true;
      task.completedAt = new Date();

      return previousState;
    },

    /**
     * Uncomplete a task by its ID
     * @param {number} taskId - The ID of the task to uncomplete
     * @returns {object|null} - The previous state for undo operations
     */
    uncompleteTask: (taskId) => {
      const task = tasks.get(taskId);
      if (!task) return null;

      // Store previous state for undo operations
      const previousState = { ...task };

      // Update task state
      task.completed = false;
      task.completedAt = null;

      return previousState;
    },

    /**
     * Update a task's priority
     * @param {number} taskId - The ID of the task to update
     * @param {number} priority - New priority level (1-5)
     * @returns {object|null} - The previous state for undo operations
     */
    updateTaskPriority: (taskId, priority) => {
      const task = tasks.get(taskId);
      if (!task) return null;

      // Validate priority
      if (priority < 1 || priority > 5) {
        throw new Error('Priority must be between 1 and 5');
      }

      // Store previous state for undo operations
      const previousState = { ...task };

      // Update task state
      task.priority = priority;

      return previousState;
    },

    /**
     * Delete a task by its ID
     * @param {number} taskId - The ID of the task to delete
     * @returns {object|null} - The deleted task for undo operations
     */
    deleteTask: (taskId) => {
      const task = tasks.get(taskId);
      if (!task) return null;

      tasks.delete(taskId);
      return task;
    },

    /**
     * Restore a deleted task
     * @param {object} task - The task to restore
     */
    restoreTask: (task) => {
      if (!task || !task.id) return;
      tasks.set(task.id, task);
    },

    /**
     * Get a task by its ID
     * @param {number} taskId - The ID of the task to get
     * @returns {object|null} - The task or null if not found
     */
    getTask: (taskId) => tasks.get(taskId) || null,

    /**
     * Get all tasks
     * @returns {Array} - Array of all tasks
     */
    getAllTasks: () => Array.from(tasks.values()),

    /**
     * Update a task directly with a provided state
     * Used for undo/redo operations
     * @param {number} taskId - The ID of the task to update
     * @param {object} state - The state to apply
     */
    updateTaskState: (taskId, state) => {
      if (!taskId || !state) return;
      tasks.set(taskId, { ...state });
    },
  };
};

/**
 * Command factory functions
 * Each returns a command object with execute and undo methods
 */

/**
 * Create a command to create a new task
 * @param {Object} taskManager - The task manager instance
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {number} priority - Task priority
 * @returns {Object} - Command object
 */
const createCreateTaskCommand = (taskManager, title, description, priority) => {
  let createdTask = null;
  const timestamp = new Date();

  return {
    execute: () => {
      createdTask = taskManager.createTask(title, description, priority);
      return createdTask;
    },
    undo: () => {
      if (createdTask) {
        taskManager.deleteTask(createdTask.id);
      }
    },
    describe: () => `Create task: ${title}`,
    timestamp,
  };
};

/**
 * Create a command to complete a task
 * @param {Object} taskManager - The task manager instance
 * @param {number} taskId - ID of the task to complete
 * @returns {Object} - Command object
 */
const createCompleteTaskCommand = (taskManager, taskId) => {
  let previousState = null;
  const timestamp = new Date();

  return {
    execute: () => {
      previousState = taskManager.completeTask(taskId);
      return previousState !== null;
    },
    undo: () => {
      if (previousState) {
        taskManager.updateTaskState(taskId, previousState);
      }
    },
    describe: () => {
      const task = taskManager.getTask(taskId);
      return `Complete task: ${task ? task.title : taskId}`;
    },
    timestamp,
  };
};

/**
 * Create a command to uncomplete a task
 * @param {Object} taskManager - The task manager instance
 * @param {number} taskId - ID of the task to uncomplete
 * @returns {Object} - Command object
 */
const createUncompleteTaskCommand = (taskManager, taskId) => {
  let previousState = null;
  const timestamp = new Date();

  return {
    execute: () => {
      previousState = taskManager.uncompleteTask(taskId);
      return previousState !== null;
    },
    undo: () => {
      if (previousState) {
        taskManager.updateTaskState(taskId, previousState);
      }
    },
    describe: () => {
      const task = taskManager.getTask(taskId);
      return `Uncomplete task: ${task ? task.title : taskId}`;
    },
    timestamp,
  };
};

/**
 * Create a command to update a task's priority
 * @param {Object} taskManager - The task manager instance
 * @param {number} taskId - ID of the task to update
 * @param {number} newPriority - New priority level (1-5)
 * @returns {Object} - Command object
 */
const createUpdatePriorityCommand = (taskManager, taskId, newPriority) => {
  let previousState = null;
  const timestamp = new Date();

  return {
    execute: () => {
      previousState = taskManager.updateTaskPriority(taskId, newPriority);
      return previousState !== null;
    },
    undo: () => {
      if (previousState) {
        taskManager.updateTaskState(taskId, previousState);
      }
    },
    describe: () => {
      const task = taskManager.getTask(taskId);
      return `Update priority of task: ${task ? task.title : taskId} to ${newPriority}`;
    },
    timestamp,
  };
};

/**
 * Create a command to delete a task
 * @param {Object} taskManager - The task manager instance
 * @param {number} taskId - ID of the task to delete
 * @returns {Object} - Command object
 */
const createDeleteTaskCommand = (taskManager, taskId) => {
  let deletedTask = null;
  const timestamp = new Date();

  return {
    execute: () => {
      deletedTask = taskManager.deleteTask(taskId);
      return deletedTask !== null;
    },
    undo: () => {
      if (deletedTask) taskManager.restoreTask(deletedTask);
    },
    describe: () => `Delete task: ${deletedTask ? deletedTask.title : taskId}`,
    timestamp,
  };
};

/**
 * Create a command manager (the invoker)
 * @returns {Object} - Command manager API
 */
const createCommandManager = () => {
  // Private state
  const history = [];
  const redoStack = [];
  const maxHistorySize = 100;

  // Return public API
  return {
    /**
     * Execute a command and add it to history
     * @param {Object} command - The command to execute
     * @returns {*} - Result of command execution
     */
    executeCommand: (command) => {
      const result = command.execute();

      // Clear redo stack when a new command is executed
      redoStack.length = 0;

      // Add command to history
      history.push(command);

      // Maintain maximum history size
      if (history.length > maxHistorySize) {
        history.shift();
      }

      return result;
    },

    /**
     * Undo the most recent command
     * @returns {boolean} - Whether the undo was successful
     */
    undo: () => {
      if (history.length === 0) return false;

      const command = history.pop();
      command.undo();

      // Move to redo stack
      redoStack.push(command);

      return true;
    },

    /**
     * Redo the most recently undone command
     * @returns {boolean} - Whether the redo was successful
     */
    redo: () => {
      if (redoStack.length === 0) return false;

      const command = redoStack.pop();
      command.execute();

      // Move back to history
      history.push(command);

      return true;
    },

    /**
     * Get the command history
     * @returns {Array} - Array of command descriptions with timestamps
     */
    getHistory: () =>
      history.map((cmd) => ({
        description: cmd.describe(),
        timestamp: cmd.timestamp,
      })),

    /**
     * Clear all history
     */
    clearHistory: () => {
      history.length = 0;
      redoStack.length = 0;
    },
  };
};

/**
 * Create a task manager application (the client)
 * @returns {Object} - Task manager app API
 */
const createTaskManagerApp = () => {
  const taskManager = createTaskManager();
  const commandManager = createCommandManager();

  // Return public API
  return {
    /**
     * Create a new task
     * @param {string} title - Task title
     * @param {string} description - Task description
     * @param {number} priority - Task priority (1-5)
     * @returns {object} - The created task
     */
    createTask: (title, description, priority) => {
      const command = createCreateTaskCommand(taskManager, title, description, priority);

      return commandManager.executeCommand(command);
    },

    /**
     * Complete a task by ID
     * @param {number} taskId - The ID of the task to complete
     * @returns {boolean} - Whether the operation was successful
     */
    completeTask: (taskId) => {
      const command = createCompleteTaskCommand(taskManager, taskId);
      return commandManager.executeCommand(command);
    },

    /**
     * Uncomplete a task by ID
     * @param {number} taskId - The ID of the task to uncomplete
     * @returns {boolean} - Whether the operation was successful
     */
    uncompleteTask: (taskId) => {
      const command = createUncompleteTaskCommand(taskManager, taskId);
      return commandManager.executeCommand(command);
    },

    /**
     * Update a task's priority
     * @param {number} taskId - The ID of the task to update
     * @param {number} priority - New priority (1-5)
     * @returns {boolean} - Whether the operation was successful
     */
    updateTaskPriority: (taskId, priority) => {
      const command = createUpdatePriorityCommand(taskManager, taskId, priority);
      return commandManager.executeCommand(command);
    },

    /**
     * Delete a task by ID
     * @param {number} taskId - The ID of the task to delete
     * @returns {boolean} - Whether the operation was successful
     */
    deleteTask: (taskId) => {
      const command = createDeleteTaskCommand(taskManager, taskId);
      return commandManager.executeCommand(command);
    },

    /**
     * Undo the last command
     * @returns {boolean} - Whether the undo was successful
     */
    undo: () => commandManager.undo(),

    /**
     * Redo the last undone command
     * @returns {boolean} - Whether the redo was successful
     */
    redo: () => commandManager.redo(),

    /**
     * Get all tasks
     * @returns {Array} - Array of all tasks
     */
    getAllTasks: () => taskManager.getAllTasks(),

    /**
     * Get a task by ID
     * @param {number} taskId - The ID of the task to get
     * @returns {object|null} - The task or null if not found
     */
    getTask: (taskId) => taskManager.getTask(taskId),

    /**
     * Get command history
     * @returns {Array} - Array of command descriptions with timestamps
     */
    getCommandHistory: () => commandManager.getHistory(),
  };
};

export {
  createTaskManager,
  createCreateTaskCommand,
  createCompleteTaskCommand,
  createUncompleteTaskCommand,
  createUpdatePriorityCommand,
  createDeleteTaskCommand,
  createCommandManager,
  createTaskManagerApp,
};
