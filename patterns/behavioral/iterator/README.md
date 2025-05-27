# Iterator Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Iterator Pattern in JavaScript, demonstrating both class-based and functional approaches through an enterprise-grade Task Queue system.

## Overview

The Iterator Pattern provides a way to access elements of a collection sequentially without exposing the underlying structure. This implementation focuses on a Task Queue system that prioritizes, filters, and processes tasks in various ways, demonstrating practical applications in real-world enterprise scenarios.

## Repository Structure

```
patterns/
└── behavioral/
    └── iterator/
        ├── README.md
        ├── iterator.example.js             # Task Queue usage examples
        ├── iterator.implementation.js      # Class-based implementation
        ├── iterator.functional.js          # Functional implementation
        └── iterator.spec.js                # Test suite
```

## Features

- Two implementation approaches:
  - Class-based Iterator using object-oriented principles
  - Functional approach using closures and factory functions
- Task Queue functionality:
  - Task creation with priority levels
  - Task status management (pending, in-progress, completed, failed)
  - Priority-based processing
  - Event subscription system
  - Batch processing capabilities
- Iterator capabilities:
  - Status filtering
  - Custom predicate filtering
  - Batch iteration
  - Concurrent processing with controlled parallelism
  - Standard iteration protocol support (for...of)
- Comprehensive test coverage using Vitest

## Implementation Details

### Class-based Approach

```javascript
class TaskQueue {
  constructor(options = {}) {
    this.tasks = [];
    this.processByPriority = options.processByPriority !== false;
    this.eventListeners = {
      /* event handlers */
    };
  }

  // Creates an iterator for this task queue
  createIterator(options = {}) {
    return new TaskQueueIterator(this, options);
  }

  // Standard iteration protocol support
  [Symbol.iterator]() {
    // Implementation details...
  }

  // Additional methods...
}

class TaskQueueIterator {
  constructor(taskQueue, options = {}) {
    this.taskQueue = taskQueue;
    this.status = options.status;
    this.batchSize = options.batchSize || 1;
    this.currentIndex = 0;
    this._refreshTasks();
  }

  // Iterator methods: hasNext(), next(), reset(), etc.
  // Advanced features: filter(), processRemaining(), etc.
}
```

### Functional Approach

```javascript
const createTaskQueue = (options = {}) => {
  // Private state
  const state = {
    tasks: [],
    processByPriority: options.processByPriority !== false,
    eventListeners: {
      /* event handlers */
    },
  };

  // Public API
  return {
    // Task queue methods...

    // Creates an iterator for this task queue
    iterator(options = {}) {
      // Implementation details...
    },

    // Standard iteration protocol support
    [Symbol.iterator]() {
      // Implementation details...
    },
  };
};
```

## Usage Examples

### Basic Task Queue Example

```javascript
// Create a task queue
const taskQueue = new TaskQueue();

// Add some tasks with different priorities
taskQueue.addTask(new Task('task-1', 'Send email notification', 'Description...', 2));
taskQueue.addTask(new Task('task-2', 'Process payment', 'Description...', 3));
taskQueue.addTask(new Task('task-3', 'Generate report', 'Description...', 1));

// Register event listeners
taskQueue.on('taskCompleted', (task) => {
  console.log(`Task completed: ${task.title}`);
});

// Iterate over tasks by priority (highest first)
for (const task of taskQueue) {
  console.log(`- ${task.title} (Priority: ${task.priority})`);
}
```

### Advanced Filtering and Processing

```javascript
// Create a task queue
const taskQueue = new TaskQueue();

// Add tasks with different priorities and statuses
// ... (task addition code)

// Create a filtered iterator for high-priority tasks
const highPriorityIterator = taskQueue.createIterator().filter((task) => task.priority >= 3);

// Process filtered tasks in batches with concurrency
await highPriorityIterator.processRemaining(
  async (task) => {
    // Task processing logic
    await processor(task);
  },
  { concurrency: 2 }
);
```

### Functional Implementation Example

```javascript
// Create a task queue
const taskQueue = createTaskQueue();

// Add tasks
taskQueue.addTask(createTask('task-1', 'Send email', 'Description...', 2));
// ... more tasks

// Create iterator for pending tasks
const pendingTaskIterator = taskQueue.iterator({ status: 'pending' });

// Process tasks with a processor function
await pendingTaskIterator.processRemaining(async (task) => {
  // Process the task
});
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
pnpm test
```

Test suite covers:

- Task creation and management
- Task Queue operations and event handling
- Iterator creation and traversal
- Filtering capabilities
- Batch processing
- Concurrent execution
- Standard iteration protocol
- Both class-based and functional implementations

## Key Considerations

1. **Separation of Concerns**

   - Collection (TaskQueue) manages data storage and organization
   - Iterator handles traversal logic independently
   - Processing logic remains separate from iteration mechanics

2. **Flexible Iteration Options**

   - Priority-based ordering
   - Status filtering
   - Custom predicate filtering
   - Batch processing for efficiency

3. **Asynchronous Processing Support**

   - Process tasks with async/await
   - Controlled concurrency
   - Error handling during processing

4. **Event System**
   - Task lifecycle events (added, started, completed, failed)
   - Subscription and unsubscription capabilities
   - Error isolation between event handlers

## Best Practices

1. **Collection Independence**

   - Keep collection focused on data management
   - Let iterators handle traversal logic
   - Separate processing from iteration when possible

2. **Iterator Efficiency**

   - Implement lazy evaluation when possible
   - Only calculate filtered collections when needed
   - Allow reset capabilities for reuse

3. **Processing Strategies**

   - Offer both sequential and concurrent processing
   - Provide concurrency controls to prevent overloading
   - Implement proper error handling and recovery

4. **Standard Protocol Compliance**
   - Implement Symbol.iterator for for...of support
   - Follow the iteration protocol with next() and done
   - Make custom iterators compatible with spread operator

## When to Use

The Iterator Pattern is particularly useful when:

- You need to traverse a complex data structure without exposing its internals
- You want to provide multiple traversal methods for the same collection
- Processing large datasets where batch or prioritized processing is beneficial
- You need to decouple collection management from traversal logic
- Concurrent or asynchronous processing is required

## Common Pitfalls to Avoid

1. **Performance Overhead**

   - Avoid recreating filtered collections unnecessarily
   - Be cautious with deeply nested filtering chains
   - Consider memory footprint when working with large collections

2. **Stale Iterators**

   - Handle collection modifications during iteration
   - Consider implementing snapshot iterators for consistency
   - Refresh filtered collections when needed

3. **Complexity Management**

   - Don't overload iterator with business logic
   - Keep collection interfaces simple
   - Consider providing specialized iterators rather than one complex implementation

4. **Concurrency Challenges**
   - Implement proper error handling in concurrent processors
   - Prevent race conditions when modifying the collection
   - Manage resource usage with appropriate concurrency limits

## Use Cases

The Iterator pattern with Task Queue system is well-suited for:

- Background job processing systems
- Work queue implementations
- Task scheduling and prioritization
- Batch processing operations
- ETL (Extract, Transform, Load) pipelines
- Message processing systems
- Workflow engines
- Resource-intensive operations requiring controlled execution

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for the current JavaScript ecosystem
- Enhanced with real-world enterprise requirements

---

If you find this implementation helpful, please consider giving it a star!
