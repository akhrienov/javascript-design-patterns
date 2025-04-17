import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  TaskManager,
  CreateTaskCommand,
  CompleteTaskCommand,
  UncompleteTaskCommand,
  UpdatePriorityCommand,
  DeleteTaskCommand,
  CommandManager,
  TaskManagerApp,
} from './command.implementation.js';
import {
  createTaskManager,
  createCreateTaskCommand,
  createCompleteTaskCommand,
  createUpdatePriorityCommand,
  createCommandManager,
  createTaskManagerApp,
} from './command.functional.js';

describe('Class-based Command Pattern Implementation', () => {
  describe('TaskManager', () => {
    let taskManager;

    beforeEach(() => {
      taskManager = new TaskManager();
    });

    it('should create a task with correct properties', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);

      expect(task).toHaveProperty('id');
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Description');
      expect(task.priority).toBe(3);
      expect(task.completed).toBe(false);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.completedAt).toBeNull();
    });

    it('should complete a task and return previous state', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const previousState = taskManager.completeTask(task.id);
      const updatedTask = taskManager.getTask(task.id);

      expect(previousState.completed).toBe(false);
      expect(updatedTask.completed).toBe(true);
      expect(updatedTask.completedAt).toBeInstanceOf(Date);
    });

    it('should uncomplete a task and return previous state', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      taskManager.completeTask(task.id);
      const previousState = taskManager.uncompleteTask(task.id);
      const updatedTask = taskManager.getTask(task.id);

      expect(previousState.completed).toBe(true);
      expect(updatedTask.completed).toBe(false);
      expect(updatedTask.completedAt).toBeNull();
    });

    it('should update task priority and return previous state', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const previousState = taskManager.updateTaskPriority(task.id, 5);
      const updatedTask = taskManager.getTask(task.id);

      expect(previousState.priority).toBe(3);
      expect(updatedTask.priority).toBe(5);
    });

    it('should throw an error for invalid priority', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);

      expect(() => taskManager.updateTaskPriority(task.id, 6)).toThrow();
      expect(() => taskManager.updateTaskPriority(task.id, 0)).toThrow();
    });

    it('should delete a task and return the deleted task', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const deletedTask = taskManager.deleteTask(task.id);

      expect(deletedTask).toEqual(task);
      expect(taskManager.getTask(task.id)).toBeNull();
    });

    it('should restore a deleted task', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const deletedTask = taskManager.deleteTask(task.id);

      taskManager.restoreTask(deletedTask);

      expect(taskManager.getTask(task.id)).toEqual(task);
    });

    it('should get all tasks', () => {
      taskManager.createTask('Task 1', 'Description 1', 3);
      taskManager.createTask('Task 2', 'Description 2', 4);

      const allTasks = taskManager.getAllTasks();

      expect(allTasks).toHaveLength(2);
      expect(allTasks[0].title).toBe('Task 1');
      expect(allTasks[1].title).toBe('Task 2');
    });
  });

  describe('Command Classes', () => {
    let taskManager;

    beforeEach(() => {
      taskManager = new TaskManager();
    });

    it('CreateTaskCommand should create and undo task creation', () => {
      const command = new CreateTaskCommand(taskManager, 'Test Task', 'Description', 3);
      const task = command.execute();

      expect(taskManager.getTask(task.id)).toBeTruthy();

      command.undo();

      expect(taskManager.getTask(task.id)).toBeNull();
    });

    it('CompleteTaskCommand should complete and undo task completion', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const command = new CompleteTaskCommand(taskManager, task.id);

      command.execute();
      expect(taskManager.getTask(task.id).completed).toBe(true);

      command.undo();
      expect(taskManager.getTask(task.id).completed).toBe(false);
    });

    it('UncompleteTaskCommand should uncomplete and undo task uncompletion', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      taskManager.completeTask(task.id);

      const command = new UncompleteTaskCommand(taskManager, task.id);

      command.execute();
      expect(taskManager.getTask(task.id).completed).toBe(false);

      command.undo();
      expect(taskManager.getTask(task.id).completed).toBe(true);
    });

    it('UpdatePriorityCommand should update and undo priority changes', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const command = new UpdatePriorityCommand(taskManager, task.id, 5);

      command.execute();
      expect(taskManager.getTask(task.id).priority).toBe(5);

      command.undo();
      expect(taskManager.getTask(task.id).priority).toBe(3);
    });

    it('DeleteTaskCommand should delete and undo task deletion', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const command = new DeleteTaskCommand(taskManager, task.id);

      command.execute();
      expect(taskManager.getTask(task.id)).toBeNull();

      command.undo();
      expect(taskManager.getTask(task.id)).toEqual(task);
    });
  });

  describe('CommandManager', () => {
    let taskManager;
    let commandManager;

    beforeEach(() => {
      taskManager = new TaskManager();
      commandManager = new CommandManager();
    });

    it('should execute commands and add them to history', () => {
      const createCmd = new CreateTaskCommand(taskManager, 'Test Task', 'Description', 3);

      commandManager.executeCommand(createCmd);

      expect(commandManager.getHistory()).toHaveLength(1);
    });

    it('should undo the last command', () => {
      const createCmd = new CreateTaskCommand(taskManager, 'Test Task', 'Description', 3);
      const task = commandManager.executeCommand(createCmd);

      expect(taskManager.getTask(task.id)).toBeTruthy();

      commandManager.undo();

      expect(taskManager.getTask(task.id)).toBeNull();
    });

    it('should clear the redo stack when a new command is executed', () => {
      const createCmd1 = new CreateTaskCommand(taskManager, 'Task 1', 'Description', 3);
      const createCmd2 = new CreateTaskCommand(taskManager, 'Task 2', 'Description', 3);

      commandManager.executeCommand(createCmd1);
      commandManager.undo();

      // Execute a new command after undoing
      commandManager.executeCommand(createCmd2);

      // Redo should do nothing since the redo stack should be cleared
      const undoSpy = vi.spyOn(createCmd1, 'execute');
      commandManager.redo();

      expect(undoSpy).not.toHaveBeenCalled();
    });
  });

  describe('TaskManagerApp', () => {
    let app;

    beforeEach(() => {
      app = new TaskManagerApp();
    });

    it('should create tasks', () => {
      const task = app.createTask('Test Task', 'Description', 3);

      expect(app.getTask(task.id)).toEqual(task);
    });

    it('should complete tasks', () => {
      const task = app.createTask('Test Task', 'Description', 3);

      app.completeTask(task.id);

      expect(app.getTask(task.id).completed).toBe(true);
    });

    it('should update task priorities', () => {
      const task = app.createTask('Test Task', 'Description', 3);

      app.updateTaskPriority(task.id, 5);

      expect(app.getTask(task.id).priority).toBe(5);
    });

    it('should delete tasks', () => {
      const task = app.createTask('Test Task', 'Description', 3);

      app.deleteTask(task.id);

      expect(app.getTask(task.id)).toBeNull();
    });

    it('should support undo and redo operations', () => {
      const task = app.createTask('Test Task', 'Description', 3);

      app.completeTask(task.id);
      expect(app.getTask(task.id).completed).toBe(true);

      app.undo();
      expect(app.getTask(task.id).completed).toBe(false);

      app.redo();
      expect(app.getTask(task.id).completed).toBe(true);
    });

    it('should provide command history', () => {
      app.createTask('Task 1', 'Description', 3);
      app.createTask('Task 2', 'Description', 4);

      const history = app.getCommandHistory();

      expect(history).toHaveLength(2);
      expect(history[0].description).toContain('Create task: Task 1');
      expect(history[1].description).toContain('Create task: Task 2');
    });
  });
});

describe('Functional Command Pattern Implementation', () => {
  describe('taskManager', () => {
    let taskManager;

    beforeEach(() => {
      taskManager = createTaskManager();
    });

    it('should create a task with correct properties', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);

      expect(task).toHaveProperty('id');
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Description');
      expect(task.priority).toBe(3);
      expect(task.completed).toBe(false);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.completedAt).toBeNull();
    });

    it('should complete a task and return previous state', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const previousState = taskManager.completeTask(task.id);
      const updatedTask = taskManager.getTask(task.id);

      expect(previousState.completed).toBe(false);
      expect(updatedTask.completed).toBe(true);
      expect(updatedTask.completedAt).toBeInstanceOf(Date);
    });

    it('should update task priority and return previous state', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const previousState = taskManager.updateTaskPriority(task.id, 5);
      const updatedTask = taskManager.getTask(task.id);

      expect(previousState.priority).toBe(3);
      expect(updatedTask.priority).toBe(5);
    });
  });

  describe('Command Factories', () => {
    let taskManager;

    beforeEach(() => {
      taskManager = createTaskManager();
    });

    it('createCreateTaskCommand should create and undo task creation', () => {
      const command = createCreateTaskCommand(taskManager, 'Test Task', 'Description', 3);
      const task = command.execute();

      expect(taskManager.getTask(task.id)).toBeTruthy();

      command.undo();

      expect(taskManager.getTask(task.id)).toBeNull();
    });

    it('createCompleteTaskCommand should complete and undo task completion', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const command = createCompleteTaskCommand(taskManager, task.id);

      command.execute();
      expect(taskManager.getTask(task.id).completed).toBe(true);

      command.undo();
      expect(taskManager.getTask(task.id).completed).toBe(false);
    });

    it('createUpdatePriorityCommand should update and undo priority changes', () => {
      const task = taskManager.createTask('Test Task', 'Description', 3);
      const command = createUpdatePriorityCommand(taskManager, task.id, 5);

      command.execute();
      expect(taskManager.getTask(task.id).priority).toBe(5);

      command.undo();
      expect(taskManager.getTask(task.id).priority).toBe(3);
    });
  });

  describe('commandManager', () => {
    let taskManager;
    let commandManager;

    beforeEach(() => {
      taskManager = createTaskManager();
      commandManager = createCommandManager();
    });

    it('should execute commands and add them to history', () => {
      const createCmd = createCreateTaskCommand(taskManager, 'Test Task', 'Description', 3);

      commandManager.executeCommand(createCmd);

      expect(commandManager.getHistory()).toHaveLength(1);
    });

    it('should undo the last command', () => {
      const createCmd = createCreateTaskCommand(taskManager, 'Test Task', 'Description', 3);
      const task = commandManager.executeCommand(createCmd);

      expect(taskManager.getTask(task.id)).toBeTruthy();

      commandManager.undo();

      expect(taskManager.getTask(task.id)).toBeNull();
    });
  });

  describe('taskManagerApp', () => {
    let app;

    beforeEach(() => {
      app = createTaskManagerApp();
    });

    it('should create tasks', () => {
      const task = app.createTask('Test Task', 'Description', 3);

      expect(app.getTask(task.id)).toEqual(task);
    });

    it('should complete tasks', () => {
      const task = app.createTask('Test Task', 'Description', 3);

      app.completeTask(task.id);

      expect(app.getTask(task.id).completed).toBe(true);
    });

    it('should support undo and redo operations', () => {
      const task = app.createTask('Test Task', 'Description', 3);

      app.completeTask(task.id);
      expect(app.getTask(task.id).completed).toBe(true);

      app.undo();
      expect(app.getTask(task.id).completed).toBe(false);

      app.redo();
      expect(app.getTask(task.id).completed).toBe(true);
    });

    it('should provide command history', () => {
      app.createTask('Task 1', 'Description', 3);
      app.createTask('Task 2', 'Description', 4);

      const history = app.getCommandHistory();

      expect(history).toHaveLength(2);
      expect(history[0].description).toContain('Create task: Task 1');
      expect(history[1].description).toContain('Create task: Task 2');
    });
  });
});

describe('Integration Tests', () => {
  it('should support a complete workflow with the class-based implementation', () => {
    const app = new TaskManagerApp();

    const task1 = app.createTask('Task 1', 'Description 1', 3);
    const task2 = app.createTask('Task 2', 'Description 2', 4);
    const task3 = app.createTask('Task 3', 'Description 3', 2);

    app.completeTask(task1.id);
    app.updateTaskPriority(task2.id, 5);
    app.deleteTask(task3.id);

    expect(app.getTask(task1.id).completed).toBe(true);
    expect(app.getTask(task2.id).priority).toBe(5);
    expect(app.getTask(task3.id)).toBeNull();

    app.undo();
    app.undo();
    app.undo();

    expect(app.getTask(task1.id).completed).toBe(false);
    expect(app.getTask(task2.id).priority).toBe(4);
    expect(app.getTask(task3.id)).toBeTruthy();
    expect(app.getTask(task3.id).priority).toBe(2);

    app.redo();
    app.redo();
    app.redo();

    expect(app.getTask(task1.id).completed).toBe(true);
    expect(app.getTask(task2.id).priority).toBe(5);
    expect(app.getTask(task3.id)).toBeNull();
  });

  it('should support a complete workflow with the functional implementation', () => {
    const app = createTaskManagerApp();

    const task1 = app.createTask('Task 1', 'Description 1', 3);
    const task2 = app.createTask('Task 2', 'Description 2', 4);
    const task3 = app.createTask('Task 3', 'Description 3', 2);

    app.completeTask(task1.id);
    app.updateTaskPriority(task2.id, 5);
    app.deleteTask(task3.id);

    expect(app.getTask(task1.id).completed).toBe(true);
    expect(app.getTask(task2.id).priority).toBe(5);
    expect(app.getTask(task3.id)).toBeNull();

    app.undo();
    app.undo();
    app.undo();

    expect(app.getTask(task1.id).completed).toBe(false);
    expect(app.getTask(task2.id).priority).toBe(4);
    expect(app.getTask(task3.id)).toBeTruthy();
    expect(app.getTask(task3.id).priority).toBe(2);

    app.redo();
    app.redo();
    app.redo();

    expect(app.getTask(task1.id).completed).toBe(true);
    expect(app.getTask(task2.id).priority).toBe(5);
    expect(app.getTask(task3.id)).toBeNull();
  });
});

describe('Real-world Scenario Tests', () => {
  it('should handle multiple undos after a series of operations', () => {
    const app = new TaskManagerApp();

    const taskIds = [];

    for (let i = 1; i <= 5; i++) {
      const task = app.createTask(`Task ${i}`, `Description ${i}`, i);
      taskIds.push(task.id);
    }

    app.completeTask(taskIds[0]);
    app.completeTask(taskIds[1]);

    app.updateTaskPriority(taskIds[2], 5);
    app.updateTaskPriority(taskIds[3], 1);

    app.deleteTask(taskIds[4]);

    expect(app.getTask(taskIds[0]).completed).toBe(true);
    expect(app.getTask(taskIds[1]).completed).toBe(true);
    expect(app.getTask(taskIds[2]).priority).toBe(5);
    expect(app.getTask(taskIds[3]).priority).toBe(1);
    expect(app.getTask(taskIds[4])).toBeNull();

    for (let i = 0; i < 5; i++) {
      app.undo();
    }

    expect(app.getTask(taskIds[0]).completed).toBe(false);
    expect(app.getTask(taskIds[1]).completed).toBe(false);
    expect(app.getTask(taskIds[2]).priority).toBe(3);
    expect(app.getTask(taskIds[3]).priority).toBe(4);
    expect(app.getTask(taskIds[4])).toBeTruthy();
    expect(app.getTask(taskIds[4]).priority).toBe(5);
  });

  it('should support concurrent operations with proper history', () => {
    const app = createTaskManagerApp();
    const task1 = app.createTask('Shared task', 'Team task', 4);

    // User 1: Complete the task
    app.completeTask(task1.id);

    // User 2: Increase priority (would happen in parallel in real-world)
    app.updateTaskPriority(task1.id, 5);

    // User 1: Decide it's not completed yet
    app.uncompleteTask(task1.id);

    // Get history
    const history = app.getCommandHistory();

    // Verify history has all operations in correct order
    expect(history).toHaveLength(4);
    expect(history[0].description).toContain('Create task');
    expect(history[1].description).toContain('Complete task');
    expect(history[2].description).toContain('Update priority');
    expect(history[3].description).toContain('Uncomplete task');

    // Verify final state
    const finalTask = app.getTask(task1.id);
    expect(finalTask.completed).toBe(false);
    expect(finalTask.priority).toBe(5);

    // Undo last operation (uncomplete)
    app.undo();
    expect(app.getTask(task1.id).completed).toBe(true);

    // Undo another operation (update priority)
    app.undo();
    expect(app.getTask(task1.id).priority).toBe(4);
  });
});
