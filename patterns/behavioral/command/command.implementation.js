/**
 * TaskManager - Receiver class that handles actual task operations
 * Implements the concrete operations that commands will execute
 */
class TaskManager {
  constructor() {
    this.tasks = new Map();
    this.lastId = 0;
  }

  /**
   * Create a new task with the given details
   * @param {string} title - The task title
   * @param {string} description - The task description
   * @param {number} priority - Priority level (1-5)
   * @returns {object} - The created task object with its ID
   */
  createTask(title, description, priority = 3) {
    const id = ++this.lastId;
    const task = {
      id,
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date(),
      completedAt: null,
    };

    this.tasks.set(id, task);
    return task;
  }

  /**
   * Complete a task by its ID
   * @param {number} taskId - The ID of the task to complete
   * @returns {object|null} - The previous state for undo operations
   */
  completeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    // Store previous state for undo operations
    const previousState = { ...task };

    // Update task state
    task.completed = true;
    task.completedAt = new Date();

    return previousState;
  }

  /**
   * Uncomplete a task by its ID
   * @param {number} taskId - The ID of the task to uncomplete
   * @returns {object|null} - The previous state for undo operations
   */
  uncompleteTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    // Store previous state for undo operations
    const previousState = { ...task };

    // Update task state
    task.completed = false;
    task.completedAt = null;

    return previousState;
  }

  /**
   * Update a task's priority
   * @param {number} taskId - The ID of the task to update
   * @param {number} priority - New priority level (1-5)
   * @returns {object|null} - The previous state for undo operations
   */
  updateTaskPriority(taskId, priority) {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    // Validate priority
    if (priority < 1 || priority > 5) throw new Error('Priority must be between 1 and 5');

    // Store previous state for undo operations
    const previousState = { ...task };

    // Update task state
    task.priority = priority;

    return previousState;
  }

  /**
   * Delete a task by its ID
   * @param {number} taskId - The ID of the task to delete
   * @returns {object|null} - The deleted task for undo operations
   */
  deleteTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    this.tasks.delete(taskId);
    return task;
  }

  /**
   * Restore a deleted task
   * @param {object} task - The task to restore
   */
  restoreTask(task) {
    if (!task || !task.id) return;
    this.tasks.set(task.id, task);
  }

  /**
   * Get a task by its ID
   * @param {number} taskId - The ID of the task to get
   * @returns {object|null} - The task or null if not found
   */
  getTask(taskId) {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Get all tasks
   * @returns {Array} - Array of all tasks
   */
  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  /**
   * Update a task directly with a provided state
   * Used for undo/redo operations
   * @param {number} taskId - The ID of the task to update
   * @param {object} state - The state to apply
   */
  updateTaskState(taskId, state) {
    if (!taskId || !state) return;
    this.tasks.set(taskId, { ...state });
  }
}

/**
 * Command - Abstract command interface
 */
class Command {
  constructor() {
    this.timestamp = new Date();
  }

  execute() {
    throw new Error('execute() method must be implemented');
  }

  undo() {
    throw new Error('undo() method must be implemented');
  }

  describe() {
    return 'Unknown command';
  }
}

/**
 * CreateTaskCommand - Command to create a new task
 */
class CreateTaskCommand extends Command {
  constructor(taskManager, title, description, priority) {
    super();
    this.taskManager = taskManager;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.createdTask = null;
  }

  execute() {
    this.createdTask = this.taskManager.createTask(this.title, this.description, this.priority);
    return this.createdTask;
  }

  undo() {
    if (this.createdTask) {
      this.taskManager.deleteTask(this.createdTask.id);
    }
  }

  describe() {
    return `Create task: ${this.title}`;
  }
}

/**
 * CompleteTaskCommand - Command to mark a task as complete
 */
class CompleteTaskCommand extends Command {
  constructor(taskManager, taskId) {
    super();
    this.taskManager = taskManager;
    this.taskId = taskId;
    this.previousState = null;
  }

  execute() {
    this.previousState = this.taskManager.completeTask(this.taskId);
    return this.previousState !== null;
  }

  undo() {
    if (this.previousState) {
      this.taskManager.updateTaskState(this.taskId, this.previousState);
    }
  }

  describe() {
    const task = this.taskManager.getTask(this.taskId);
    return `Complete task: ${task ? task.title : this.taskId}`;
  }
}

/**
 * UncompleteTaskCommand - Command to mark a task as not complete
 */
class UncompleteTaskCommand extends Command {
  constructor(taskManager, taskId) {
    super();
    this.taskManager = taskManager;
    this.taskId = taskId;
    this.previousState = null;
  }

  execute() {
    this.previousState = this.taskManager.uncompleteTask(this.taskId);
    return this.previousState !== null;
  }

  undo() {
    if (this.previousState) {
      this.taskManager.updateTaskState(this.taskId, this.previousState);
    }
  }

  describe() {
    const task = this.taskManager.getTask(this.taskId);
    return `Uncomplete task: ${task ? task.title : this.taskId}`;
  }
}

/**
 * UpdatePriorityCommand - Command to update a task's priority
 */
class UpdatePriorityCommand extends Command {
  constructor(taskManager, taskId, newPriority) {
    super();
    this.taskManager = taskManager;
    this.taskId = taskId;
    this.newPriority = newPriority;
    this.previousState = null;
  }

  execute() {
    this.previousState = this.taskManager.updateTaskPriority(this.taskId, this.newPriority);
    return this.previousState !== null;
  }

  undo() {
    if (this.previousState) {
      this.taskManager.updateTaskState(this.taskId, this.previousState);
    }
  }

  describe() {
    const task = this.taskManager.getTask(this.taskId);
    return `Update priority of task: ${task ? task.title : this.taskId} to ${this.newPriority}`;
  }
}

/**
 * DeleteTaskCommand - Command to delete a task
 */
class DeleteTaskCommand extends Command {
  constructor(taskManager, taskId) {
    super();
    this.taskManager = taskManager;
    this.taskId = taskId;
    this.deletedTask = null;
  }

  execute() {
    this.deletedTask = this.taskManager.deleteTask(this.taskId);
    return this.deletedTask !== null;
  }

  undo() {
    if (this.deletedTask) {
      this.taskManager.restoreTask(this.deletedTask);
    }
  }

  describe() {
    return `Delete task: ${this.deletedTask ? this.deletedTask.title : this.taskId}`;
  }
}

/**
 * CommandManager - The invoker that manages command execution and history
 */
class CommandManager {
  constructor() {
    this.history = [];
    this.redoStack = [];
    this.maxHistorySize = 100;
  }

  /**
   * Execute a command and add it to history
   * @param {Command} command - The command to execute
   * @returns {*} - The result of command execution
   */
  executeCommand(command) {
    const result = command.execute();

    // Clear redo stack when a new command is executed
    this.redoStack = [];

    // Add command to history
    this.history.push(command);

    // Maintain maximum history size
    if (this.history.length > this.maxHistorySize) this.history.shift();

    return result;
  }

  /**
   * Undo the most recent command
   * @returns {boolean} - Whether the undo was successful
   */
  undo() {
    if (this.history.length === 0) return false;

    const command = this.history.pop();
    command.undo();

    // Move to redo stack
    this.redoStack.push(command);

    return true;
  }

  /**
   * Redo the most recently undone command
   * @returns {boolean} - Whether the redo was successful
   */
  redo() {
    if (this.redoStack.length === 0) return false;

    const command = this.redoStack.pop();
    command.execute();

    // Move back to history
    this.history.push(command);

    return true;
  }

  /**
   * Get the command history
   * @returns {Array} - Array of command descriptions with timestamps
   */
  getHistory() {
    return this.history.map((cmd) => ({
      description: cmd.describe(),
      timestamp: cmd.timestamp,
    }));
  }

  /**
   * Clear all history
   */
  clearHistory() {
    this.history = [];
    this.redoStack = [];
  }
}

/**
 * TaskManagerApp - Client class that uses the Command pattern
 */
class TaskManagerApp {
  constructor() {
    this.taskManager = new TaskManager();
    this.commandManager = new CommandManager();
  }

  /**
   * Create a new task
   * @param {string} title - Task title
   * @param {string} description - Task description
   * @param {number} priority - Task priority (1-5)
   * @returns {object} - The created task
   */
  createTask(title, description, priority) {
    const command = new CreateTaskCommand(this.taskManager, title, description, priority);
    return this.commandManager.executeCommand(command);
  }

  /**
   * Complete a task by ID
   * @param {number} taskId - The ID of the task to complete
   * @returns {boolean} - Whether the operation was successful
   */
  completeTask(taskId) {
    const command = new CompleteTaskCommand(this.taskManager, taskId);
    return this.commandManager.executeCommand(command);
  }

  /**
   * Uncomplete a task by ID
   * @param {number} taskId - The ID of the task to uncomplete
   * @returns {boolean} - Whether the operation was successful
   */
  uncompleteTask(taskId) {
    const command = new UncompleteTaskCommand(this.taskManager, taskId);
    return this.commandManager.executeCommand(command);
  }

  /**
   * Update a task's priority
   * @param {number} taskId - The ID of the task to update
   * @param {number} priority - New priority (1-5)
   * @returns {boolean} - Whether the operation was successful
   */
  updateTaskPriority(taskId, priority) {
    const command = new UpdatePriorityCommand(this.taskManager, taskId, priority);
    return this.commandManager.executeCommand(command);
  }

  /**
   * Delete a task by ID
   * @param {number} taskId - The ID of the task to delete
   * @returns {boolean} - Whether the operation was successful
   */
  deleteTask(taskId) {
    const command = new DeleteTaskCommand(this.taskManager, taskId);
    return this.commandManager.executeCommand(command);
  }

  /**
   * Undo the last command
   * @returns {boolean} - Whether the undo was successful
   */
  undo() {
    return this.commandManager.undo();
  }

  /**
   * Redo the last undone command
   * @returns {boolean} - Whether the redo was successful
   */
  redo() {
    return this.commandManager.redo();
  }

  /**
   * Get all tasks
   * @returns {Array} - Array of all tasks
   */
  getAllTasks() {
    return this.taskManager.getAllTasks();
  }

  /**
   * Get a task by ID
   * @param {number} taskId - The ID of the task to get
   * @returns {object|null} - The task or null if not found
   */
  getTask(taskId) {
    return this.taskManager.getTask(taskId);
  }

  /**
   * Get command history
   * @returns {Array} - Array of command descriptions with timestamps
   */
  getCommandHistory() {
    return this.commandManager.getHistory();
  }
}

export {
  TaskManager,
  Command,
  CreateTaskCommand,
  CompleteTaskCommand,
  UncompleteTaskCommand,
  UpdatePriorityCommand,
  DeleteTaskCommand,
  CommandManager,
  TaskManagerApp,
};
