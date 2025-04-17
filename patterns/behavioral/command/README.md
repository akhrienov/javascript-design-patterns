# Command Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Command Pattern in JavaScript, demonstrating both class-based and functional approaches. The implementation focuses on task management systems, showcasing practical applications in enterprise scenarios with robust undo/redo functionality.

## Overview

The Command Pattern encapsulates a request as an object, thereby allowing parameterization of clients with different requests, queuing of requests, and logging of the requests. It also supports undoable operations. This pattern promotes loose coupling between the invoker and receiver by introducing a command object that acts as a bridge between them. Our implementation demonstrates how this pattern enables flexible, maintainable, and testable code with powerful history management.

## Repository Structure

```
patterns/
└── behavioral/
    └── command/
        ├── README.md
        ├── command.implementation.js     # Class-based core implementation
        ├── command.functional.js         # Functional core implementation
        ├── command.example.js            # Usage examples and real-world scenarios
        └── command.spec.js               # Test suite
```

## Features

- Two implementation approaches:
    - Class-based Command using ES6 classes with clear inheritance hierarchy
    - Functional approach using factory functions and closures for flexibility
- Task Management System:
    - Comprehensive task operations (create, complete, prioritize, delete)
    - Full undo/redo capability for all operations
    - Command history tracking with timestamps
    - Command description for audit trails
- Comprehensive test coverage with Vitest:
    - Core implementation testing
    - Integration testing with real-world scenarios
    - Performance comparison between approaches

## Implementation Details

### Class-based Approach

```javascript
// Command interface
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

// Concrete Command implementation
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
    this.createdTask = this.taskManager.createTask(
      this.title,
      this.description,
      this.priority
    );
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

// Command Manager (Invoker)
class CommandManager {
  constructor() {
    this.history = [];
    this.redoStack = [];
    this.maxHistorySize = 100;
  }

  executeCommand(command) {
    const result = command.execute();
    
    // Clear redo stack when a new command is executed
    this.redoStack = [];
    
    // Add command to history
    this.history.push(command);
    
    // Maintain maximum history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
    
    return result;
  }

  // Undo/redo and history management methods...
}
```

### Functional Approach

```javascript
// Command factory function
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
    timestamp
  };
};

// Command Manager factory function
const createCommandManager = () => {
  // Private state
  const history = [];
  const redoStack = [];
  const maxHistorySize = 100;

  // Return public API
  return {
    executeCommand: (command) => {
      // Implementation details...
    },
    
    // Undo/redo and history management methods...
  };
};
```

## Real-World Example: Task Management System

Our implementation includes a robust task management system that demonstrates the Command pattern in action. This system:

1. Manages tasks with properties like title, description, priority, and completion status
2. Supports creating, completing, prioritizing, and deleting tasks
3. Maintains a history of all operations with timestamps
4. Provides undo/redo functionality for all operations
5. Can display a chronological audit trail of all actions

### TaskManager (Receiver)

```javascript
class TaskManager {
  constructor() {
    this.tasks = new Map(); // Using Map for O(1) lookup
    this.lastId = 0;
  }

  createTask(title, description, priority = 3) {
    const id = ++this.lastId;
    const task = {
      id,
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date(),
      completedAt: null
    };
    
    this.tasks.set(id, task);
    return task;
  }

  // Additional task management methods...
}
```

### Command Types

```javascript
// Commands for task operations
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

// Additional command types...
```

### TaskManagerApp (Client)

```javascript
class TaskManagerApp {
  constructor() {
    this.taskManager = new TaskManager();
    this.commandManager = new CommandManager();
  }

  createTask(title, description, priority) {
    const command = new CreateTaskCommand(
      this.taskManager,
      title,
      description,
      priority
    );
    
    return this.commandManager.executeCommand(command);
  }

  // Additional methods that create and execute commands...
}
```

## Usage Examples

### Class-based Approach

```javascript
// Create a task manager application
const taskApp = new TaskManagerApp();

// Create some tasks
const task1 = taskApp.createTask('Implement API', 'Create RESTful endpoints for the user service', 4);
const task2 = taskApp.createTask('Write tests', 'Create unit and integration tests', 3);

// Complete a task
taskApp.completeTask(task1.id);

// Update task priority
taskApp.updateTaskPriority(task2.id, 5);

// Undo the last operation
taskApp.undo();  // Reverts the priority update

// Redo the operation
taskApp.redo();  // Reapplies the priority update

// Get command history
const history = taskApp.getCommandHistory();
history.forEach((cmd, index) => {
  console.log(`${index + 1}. ${cmd.description} (${cmd.timestamp.toLocaleTimeString()})`);
});
```

### Functional Approach

```javascript
// Create a task manager application
const taskApp = createTaskManagerApp();

// Create some tasks
const task1 = taskApp.createTask('Refactor database layer', 'Improve query performance', 5);
const task2 = taskApp.createTask('Update documentation', 'Add examples for new features', 2);

// Complete tasks
taskApp.completeTask(task1.id);

// Update task priority
taskApp.updateTaskPriority(task2.id, 3);

// Demonstrate undo/redo
taskApp.undo();  // Reverts the priority update
taskApp.undo();  // Reverts the task completion

// Get command history
const history = taskApp.getCommandHistory();
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
  pnpm test
```

Test suite covers:

- Individual Command behavior
- TaskManager operations
- CommandManager undo/redo functionality
- Task state management
- Command history tracking
- Integration testing with multiple operations
- Performance comparison between class-based and functional approaches

## Key Considerations

1. **Command Encapsulation**

    - Each operation as a self-contained command object
    - Command execution and undo logic contained together
    - Parameter capture at command creation time
    - State preservation for reversible operations

2. **Command History Management**

    - Efficient history tracking
    - Proper redo stack clearing on new commands
    - Memory management with maximum history size
    - Command timestamping for audit trails

3. **Undo/Redo Mechanism**

    - Consistent undo/redo protocol
    - State restoration on undo
    - Proper state rollback/rollforward
    - Multiple sequential undos and redos

4. **Implementation Approaches**
    - Class-based for inheritance hierarchies and OOP principles
    - Functional for flexibility and reduced boilerplate
    - Consistent interfaces between both approaches

## Practical Applications

The Command Pattern is especially useful for:

- Text editors with undo/redo functionality
- Transaction-based systems like financial applications
- Multi-level undo/redo systems
- GUI operations in desktop applications
- Macro recording and playback
- Database transaction management
- Remote procedure calls (RPC)
- Task scheduling and queuing systems
- Workflow engines
- Game development for player actions

## When to Use Command Pattern

The Command Pattern is most beneficial when:

- You need to parameterize objects with operations
- You need to queue, specify, or execute operations at different times
- You want to support undo/redo functionality
- You need to log changes or operations for audit purposes
- You need to structure a system around high-level operations
- You want to implement callback functionality in a structured way
- Operations need to be executed remotely or asynchronously

## When Not to Use Command Pattern

Avoid using the Command Pattern when:

- Simple direct execution would suffice
- Undo/redo functionality is not required
- The command structure would add unnecessary complexity
- Performance is critical and command objects would create overhead
- The operations don't need to be queued, logged, or undone

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Command Pattern as described in the Gang of Four's Design Patterns book
- Modernized for modern JavaScript using ES6+ features
- Enhanced with practical examples drawn from real-world enterprise applications
- Built with clean architecture principles for maintainable, testable code

---

If you find this implementation helpful for understanding the Command Pattern, please consider giving it a star!