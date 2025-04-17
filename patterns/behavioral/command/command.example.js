import { TaskManagerApp } from './command.implementation.js';
import { createTaskManagerApp } from './command.functional.js';

/**
 * Example demonstrating class-based Command Pattern implementation
 */
function classBasedExample() {
  console.log('Class-based Command Pattern Example');
  console.log('----------------------------------');

  // Create a new task manager application
  const taskApp = new TaskManagerApp();

  // Create some tasks
  console.log('Creating tasks...');
  const task1 = taskApp.createTask(
    'Implement API',
    'Create RESTful endpoints for the user service',
    4
  );
  const task2 = taskApp.createTask('Write tests', 'Create unit and integration tests', 3);
  const task3 = taskApp.createTask(
    'Deploy to staging',
    'Deploy the application to the staging environment',
    2
  );

  console.log('\nAll Tasks:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(
      `- ${task.id}: ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`
    );
  });

  // Mark a task as complete
  console.log('\nCompleting task 1...');
  taskApp.completeTask(task1.id);

  console.log('\nUpdate task 2 priority...');
  taskApp.updateTaskPriority(task2.id, 5);

  console.log('\nAll Tasks After Updates:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(
      `- ${task.id}: ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`
    );
  });

  // Undo the last operation (updating task 2 priority)
  console.log('\nUndo last operation...');
  taskApp.undo();

  console.log('\nAll Tasks After Undo:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(
      `- ${task.id}: ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`
    );
  });

  // Redo the operation
  console.log('\nRedo last operation...');
  taskApp.redo();

  console.log('\nAll Tasks After Redo:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(
      `- ${task.id}: ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`
    );
  });

  // Delete a task
  console.log('\nDeleting task 3...');
  taskApp.deleteTask(task3.id);

  console.log('\nAll Tasks After Deletion:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(
      `- ${task.id}: ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`
    );
  });

  // Show command history
  console.log('\nCommand History:');
  taskApp.getCommandHistory().forEach((cmd, index) => {
    console.log(`${index + 1}. ${cmd.description} (${cmd.timestamp.toLocaleTimeString()})`);
  });

  // Undo multiple operations
  console.log('\nUndo 3 operations...');
  taskApp.undo();
  taskApp.undo();
  taskApp.undo();

  console.log('\nAll Tasks After Multiple Undos:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(
      `- ${task.id}: ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`
    );
  });
}

/**
 * Example demonstrating functional Command Pattern implementation
 */
function functionalExample() {
  console.log('\n\nFunctional Command Pattern Example');
  console.log('----------------------------------');

  // Create a new task manager application
  const taskApp = createTaskManagerApp();

  // Create some tasks
  console.log('Creating tasks...');
  const task1 = taskApp.createTask('Refactor database layer', 'Improve query performance', 5);
  const task2 = taskApp.createTask('Update documentation', 'Add examples for new features', 2);
  const task3 = taskApp.createTask('Fix bug #123', 'Address the login issue reported by users', 4);

  console.log('\nAll Tasks:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(
      `- ${task.id}: ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`
    );
  });

  // Complete tasks
  console.log('\nCompleting tasks 1 and 3...');
  taskApp.completeTask(task1.id);
  taskApp.completeTask(task3.id);

  // Update task priority
  console.log('\nUpdating task 2 priority...');
  taskApp.updateTaskPriority(task2.id, 3);

  console.log('\nAll Tasks After Updates:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(
      `- ${task.id}: ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`
    );
  });

  // Demonstrate undo/redo
  console.log('\nUndo last operation (priority update)...');
  taskApp.undo();

  console.log('\nUndo another operation (completing task 3)...');
  taskApp.undo();

  console.log('\nAll Tasks After Undos:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(
      `- ${task.id}: ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`
    );
  });

  // Redo one operation
  console.log('\nRedo one operation...');
  taskApp.redo();

  console.log('\nAll Tasks After Redo:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(
      `- ${task.id}: ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`
    );
  });

  // Show command history
  console.log('\nCommand History:');
  taskApp.getCommandHistory().forEach((cmd, index) => {
    console.log(`${index + 1}. ${cmd.description} (${cmd.timestamp.toLocaleTimeString()})`);
  });
}

/**
 * Real-world scenario example: Task automation in a development workflow
 */
function realWorldExample() {
  console.log('\n\nReal-World Example: Development Workflow Automation');
  console.log('-------------------------------------------------');

  // Create a new task manager application
  const taskApp = new TaskManagerApp();

  console.log('Project kickoff: Setting up development tasks...');

  // Create sprint tasks
  const setupTask = taskApp.createTask(
    'Set up development environment',
    'Install dependencies and configure development tools',
    5
  );

  const designTask = taskApp.createTask(
    'Design database schema',
    'Create ERD and define relationships between entities',
    4
  );

  const implementBackendTask = taskApp.createTask(
    'Implement backend services',
    'Create API endpoints and business logic',
    3
  );

  const implementFrontendTask = taskApp.createTask(
    'Implement frontend components',
    'Create UI components and integrate with backend',
    3
  );

  const testingTask = taskApp.createTask(
    'Write tests',
    'Create unit and integration tests for all features',
    4
  );

  const deploymentTask = taskApp.createTask(
    'Deploy to staging',
    'Configure CI/CD pipeline and deploy to staging environment',
    2
  );

  console.log('\nSprint planning complete! All tasks created:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(`- ${task.title} (Priority: ${task.priority})`);
  });

  // Simulate sprint progress
  console.log('\nDay 1: Starting with environment setup...');
  taskApp.completeTask(setupTask.id);

  console.log('Day 2: Database design completed...');
  taskApp.completeTask(designTask.id);

  console.log('Day 3-5: Working on backend implementation...');
  taskApp.completeTask(implementBackendTask.id);

  console.log('Day 6: Oops, found an issue with the backend implementation, need to revisit...');
  taskApp.uncompleteTask(implementBackendTask.id);
  taskApp.updateTaskPriority(implementBackendTask.id, 5);

  console.log('\nCurrent Task Status:');
  taskApp.getAllTasks().forEach((task) => {
    const status = task.completed ? 'Completed' : 'Pending';
    console.log(`- ${task.title}: ${status} (Priority: ${task.priority})`);
  });

  console.log('\nDay 7: Fixed the backend issues, continuing with frontend...');
  taskApp.completeTask(implementBackendTask.id);

  console.log('Day 8-10: Implementing frontend...');
  taskApp.completeTask(implementFrontendTask.id);

  // Product owner changes requirements
  console.log('\nDay 11: Product owner changed deployment requirements...');
  taskApp.updateTaskPriority(deploymentTask.id, 5);
  taskApp.updateTaskPriority(testingTask.id, 5);

  console.log('\nDay 12-14: Writing tests and preparing deployment...');
  taskApp.completeTask(testingTask.id);
  taskApp.completeTask(deploymentTask.id);

  console.log('\nSprint completed! Final status:');
  taskApp.getAllTasks().forEach((task) => {
    const status = task.completed ? 'Completed' : 'Pending';
    console.log(`- ${task.title}: ${status} (Priority: ${task.priority})`);
  });

  // Show command history to review the sprint journey
  console.log('\nSprint Timeline (Command History):');
  taskApp.getCommandHistory().forEach((cmd, index) => {
    console.log(`${index + 1}. ${cmd.description}`);
  });

  // Product owner wants to see how requirements changed
  console.log('\nReviewing requirement changes...');
  console.log('Undoing last 4 operations to see original priorities...');

  for (let i = 0; i < 4; i++) {
    taskApp.undo();
  }

  console.log('\nOriginal task priorities:');
  taskApp.getAllTasks().forEach((task) => {
    console.log(`- ${task.title} (Priority: ${task.priority})`);
  });

  // Restore to final state
  console.log('\nRestoring to final sprint state...');
  for (let i = 0; i < 4; i++) {
    taskApp.redo();
  }
}

classBasedExample();
functionalExample();
realWorldExample();
