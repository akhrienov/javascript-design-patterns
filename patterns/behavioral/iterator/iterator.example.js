import { Task, TaskQueue } from './iterator.implementation.js';
import { createTask, createTaskQueue } from './iterator.functional.js';

/**
 * Example 1: Basic Task Queue Usage (Class-based)
 */
function basicClassExample() {
  console.log('------ BASIC CLASS-BASED EXAMPLE ------');

  // Create a task queue
  const taskQueue = new TaskQueue();

  // Add some tasks
  taskQueue.addTask(
    new Task('task-1', 'Send email notification', 'Send weekly newsletter to subscribers', 2)
  );
  taskQueue.addTask(new Task('task-2', 'Process payment', 'Process subscription payment', 3));
  taskQueue.addTask(new Task('task-3', 'Generate report', 'Generate monthly sales report', 1));

  // Register event listeners
  taskQueue.on('taskCompleted', (task) => {
    console.log(`Task completed: ${task.title}`);
  });

  // Iterate over tasks by priority (highest first)
  console.log('Processing tasks by priority:');
  for (const task of taskQueue) {
    console.log(`- ${task.title} (Priority: ${task.priority})`);
  }

  console.log('\n');
}

/**
 * Example 2: Basic Task Queue Usage (Functional)
 */
function basicFunctionalExample() {
  console.log('------ BASIC FUNCTIONAL EXAMPLE ------');

  // Create a task queue
  const taskQueue = createTaskQueue();

  // Add some tasks
  taskQueue.addTask(
    createTask('task-1', 'Send email notification', 'Send weekly newsletter to subscribers', 2)
  );
  taskQueue.addTask(createTask('task-2', 'Process payment', 'Process subscription payment', 3));
  taskQueue.addTask(createTask('task-3', 'Generate report', 'Generate monthly sales report', 1));

  // Register event listeners
  taskQueue.on('taskCompleted', (task) => {
    console.log(`Task completed: ${task.title}`);
  });

  // Iterate over tasks by priority (highest first)
  console.log('Processing tasks by priority:');
  for (const task of taskQueue) {
    console.log(`- ${task.title} (Priority: ${task.priority})`);
  }

  console.log('\n');
}

/**
 * Example 3: Advanced Task Queue Features (Class-based)
 */
async function advancedClassExample() {
  console.log('------ ADVANCED CLASS-BASED EXAMPLE ------');

  // Create a task queue
  const taskQueue = new TaskQueue();

  // Add a mix of tasks with different priorities
  taskQueue.addTasks([
    new Task('task-1', 'Validate user data', 'Validate new user registration data', 2),
    new Task('task-2', 'Sync with external API', 'Sync inventory with external API', 3),
    new Task('task-3', 'Send welcome email', 'Send welcome email to new user', 1),
    new Task('task-4', 'Update user permissions', 'Apply new role permissions to user', 3),
    new Task('task-5', 'Clean up temp files', 'Remove temporary uploaded files', 1),
  ]);

  // Using a custom iterator with filtering
  const highPriorityIterator = taskQueue.createIterator().filter((task) => task.priority >= 3);

  console.log('High priority tasks:');
  for (const task of highPriorityIterator) {
    console.log(`- ${task.title} (Priority: ${task.priority})`);
  }

  // Process tasks in batches
  console.log('\nProcessing tasks in batches:');
  const batchIterator = taskQueue.createIterator({ batchSize: 2 });

  while (batchIterator.hasNext()) {
    const batch = batchIterator.next();
    console.log('Processing batch:');
    batch.forEach((task) => console.log(`- ${task.title}`));
  }

  // Process tasks with a processor function
  console.log('\nProcessing pending tasks with a processor function:');
  const pendingTaskIterator = taskQueue.createIterator({ status: 'pending' });

  // Simple processor function
  const processTask = async (task) => {
    console.log(`Processing task: ${task.title}`);
    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  try {
    // Process tasks with concurrency
    await pendingTaskIterator.processRemaining(processTask, { concurrency: 2 });

    // Check task counts after processing
    const counts = taskQueue.getTaskCounts();
    console.log('\nTask counts after processing:');
    console.log(`- Total: ${counts.total}`);
    console.log(`- Completed: ${counts.completed}`);
  } catch (error) {
    console.error('Error processing tasks:', error);
  }

  console.log('\n');
}

/**
 * Example 4: Advanced Task Queue Features (Functional)
 */
async function advancedFunctionalExample() {
  console.log('------ ADVANCED FUNCTIONAL EXAMPLE ------');

  // Create a task queue
  const taskQueue = createTaskQueue();

  // Add a mix of tasks with different priorities
  taskQueue.addTasks([
    createTask('task-1', 'Validate user data', 'Validate new user registration data', 2),
    createTask('task-2', 'Sync with external API', 'Sync inventory with external API', 3),
    createTask('task-3', 'Send welcome email', 'Send welcome email to new user', 1),
    createTask('task-4', 'Update user permissions', 'Apply new role permissions to user', 3),
    createTask('task-5', 'Clean up temp files', 'Remove temporary uploaded files', 1),
  ]);

  // Using a custom iterator with filtering
  const highPriorityIterator = taskQueue.iterator().filter((task) => task.priority >= 3);

  console.log('High priority tasks:');
  for (const task of highPriorityIterator) {
    console.log(`- ${task.title} (Priority: ${task.priority})`);
  }

  // Process tasks in batches
  console.log('\nProcessing tasks in batches:');
  const batchIterator = taskQueue.iterator({ batchSize: 2 });

  while (batchIterator.hasNext()) {
    const batch = batchIterator.next();
    console.log('Processing batch:');
    batch.forEach((task) => console.log(`- ${task.title}`));
  }

  // Process tasks with a processor function
  console.log('\nProcessing pending tasks with a processor function:');
  const pendingTaskIterator = taskQueue.iterator({ status: 'pending' });

  // Simple processor function
  const processTask = async (task) => {
    console.log(`Processing task: ${task.title}`);
    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  try {
    // Process tasks with concurrency
    await pendingTaskIterator.processRemaining(processTask, { concurrency: 2 });

    // Check task counts after processing
    const counts = taskQueue.getTaskCounts();
    console.log('\nTask counts after processing:');
    console.log(`- Total: ${counts.total}`);
    console.log(`- Completed: ${counts.completed}`);
  } catch (error) {
    console.error('Error processing tasks:', error);
  }
}

/**
 * Example 5: Real-world scenario - Background Job Processor
 */
async function realWorldExample() {
  console.log('------ REAL-WORLD EXAMPLE: BACKGROUND JOB PROCESSOR ------');

  // Create a job queue with priority processing
  const jobQueue = new TaskQueue({ processByPriority: true });

  // Simulate adding jobs from different parts of the application
  jobQueue.addTasks([
    new Task('job-1', 'Send invoice email', 'Send monthly invoice to customer', 2),
    new Task('job-2', 'Process refund', 'Process customer refund request', 5), // High priority
    new Task('job-3', 'Generate analytics report', 'Create weekly analytics report', 1),
    new Task('job-4', 'Sync inventory', 'Update inventory counts from warehouse', 3),
    new Task('job-5', 'Update search index', 'Update product search index', 2),
    new Task('job-6', 'Clean database', 'Remove old temporary records', 1),
  ]);

  // Set up event listeners for monitoring
  jobQueue.on('taskStarted', (task) => {
    console.log(`[${new Date().toISOString()}] Starting job: ${task.title}`);
  });

  jobQueue.on('taskCompleted', (task) => {
    console.log(
      `[${new Date().toISOString()}] Completed job: ${task.title} in ${
        task.completedAt - task.startedAt
      }ms`
    );
  });

  jobQueue.on('taskFailed', (task, error) => {
    console.error(`[${new Date().toISOString()}] Failed job: ${task.title} - Error: ${task.error}`);
  });

  // Define job processors for different job types
  const jobProcessors = {
    async sendEmail(task) {
      console.log(`Sending email: ${task.title}`);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate email sending
    },

    async processPayment(task) {
      console.log(`Processing payment: ${task.title}`);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate payment processing

      // Randomly fail some payment jobs to demonstrate error handling
      if (Math.random() < 0.3) {
        throw new Error('Payment gateway timeout');
      }
    },

    async generateReport(task) {
      console.log(`Generating report: ${task.title}`);
      await new Promise((resolve) => setTimeout(resolve, 700)); // Simulate report generation
    },

    async syncData(task) {
      console.log(`Syncing data: ${task.title}`);
      await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate data syncing
    },
  };

  // Map jobs to processors based on job title keywords
  function getProcessorForJob(job) {
    if (job.title.includes('email') || job.title.includes('invoice')) {
      return jobProcessors.sendEmail;
    } else if (job.title.includes('refund') || job.title.includes('payment')) {
      return jobProcessors.processPayment;
    } else if (job.title.includes('report') || job.title.includes('analytics')) {
      return jobProcessors.generateReport;
    } else {
      return jobProcessors.syncData; // Default processor
    }
  }

  // Main job processing function
  async function processJobs() {
    console.log('Starting job processor...');
    console.log(`Jobs in queue: ${jobQueue.getTaskCounts().total}`);

    // Create an iterator for pending jobs
    const jobIterator = jobQueue.createIterator({ status: 'pending' });

    // Process high-priority jobs first (priority >= 4)
    console.log('\nProcessing high-priority jobs:');
    const highPriorityIterator = jobIterator.filter((job) => job.priority >= 4);

    while (highPriorityIterator.hasNext()) {
      const job = highPriorityIterator.next();
      const processor = getProcessorForJob(job);

      try {
        await jobQueue.processTask(job, processor);
      } catch (error) {
        console.error(`Error processing high-priority job ${job.id}:`, error);
      }
    }

    // Process remaining jobs with concurrency for efficiency
    console.log('\nProcessing regular jobs with concurrency:');
    const regularJobIterator = jobQueue.createIterator({ status: 'pending' });

    await regularJobIterator.processRemaining(
      async (job) => {
        const processor = getProcessorForJob(job);
        await processor(job);
      },
      { concurrency: 2 }
    );

    // Show final job counts
    const counts = jobQueue.getTaskCounts();
    console.log('\nJob processing complete.');
    console.log('Final job counts:');
    console.log(`- Total: ${counts.total}`);
    console.log(`- Completed: ${counts.completed}`);
    console.log(`- Failed: ${counts.failed}`);
    console.log(`- Pending: ${counts.pending}`);

    // List any failed jobs
    const failedJobs = jobQueue.getTasksByStatus('failed');
    if (failedJobs.length > 0) {
      console.log('\nFailed jobs:');
      failedJobs.forEach((job) => {
        console.log(`- ${job.title}: ${job.error}`);
      });

      // Demonstrate re-queuing failed jobs (not actually executing here)
      console.log('\nRe-queuing failed jobs would look like:');
      console.log('const failedJobIterator = jobQueue.createIterator({ status: "failed" });');
      console.log('// Reset failed jobs to pending');
      console.log('for (const job of failedJobIterator) {');
      console.log('  job.status = "pending";');
      console.log('  job.error = null;');
      console.log('}');
    }
  }

  // Run the example
  await processJobs();
}

// Run all examples
async function runExamples() {
  basicClassExample();
  basicFunctionalExample();
  await advancedClassExample();
  await advancedFunctionalExample();
  await realWorldExample();
}

runExamples().catch(console.error);
