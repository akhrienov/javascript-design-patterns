import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Task, TaskQueue } from './iterator.implementation.js';
import { createTask, createTaskQueue } from './iterator.functional.js';

function createSampleTasks(implementation = 'class') {
  if (implementation === 'class') {
    return [
      new Task('task-1', 'Task 1', 'Description 1', 2),
      new Task('task-2', 'Task 2', 'Description 2', 3),
      new Task('task-3', 'Task 3', 'Description 3', 1),
    ];
  } else {
    return [
      createTask('task-1', 'Task 1', 'Description 1', 2),
      createTask('task-2', 'Task 2', 'Description 2', 3),
      createTask('task-3', 'Task 3', 'Description 3', 1),
    ];
  }
}

describe('Class-based Implementation', () => {
  describe('Task', () => {
    it('should create a task with the correct properties', () => {
      const task = new Task('task-1', 'Test Task', 'Task description', 2);

      expect(task.id).toBe('task-1');
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Task description');
      expect(task.priority).toBe(2);
      expect(task.status).toBe('pending');
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.startedAt).toBeNull();
      expect(task.completedAt).toBeNull();
    });

    it('should update status when starting a task', () => {
      const task = new Task('task-1', 'Test Task', 'Task description');
      task.start();

      expect(task.status).toBe('in-progress');
      expect(task.startedAt).toBeInstanceOf(Date);
    });

    it('should update status when completing a task', () => {
      const task = new Task('task-1', 'Test Task', 'Task description');
      task.start();
      task.complete();

      expect(task.status).toBe('completed');
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    it('should update status and store error when failing a task', () => {
      const task = new Task('task-1', 'Test Task', 'Task description');
      const error = new Error('Test error');
      task.start();
      task.fail(error);

      expect(task.status).toBe('failed');
      expect(task.error).toBe('Test error');
      expect(task.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('TaskQueue', () => {
    let taskQueue;
    let sampleTasks;

    beforeEach(() => {
      taskQueue = new TaskQueue();
      sampleTasks = createSampleTasks('class');
      taskQueue.addTasks(sampleTasks);
    });

    it('should add tasks to the queue', () => {
      const newTask = new Task('task-4', 'Task 4', 'Description 4');
      taskQueue.addTask(newTask);

      expect(taskQueue.tasks.length).toBe(4);
      expect(taskQueue.tasks[3]).toBe(newTask);
    });

    it('should find tasks by ID', () => {
      const task = taskQueue.getTaskById('task-2');

      expect(task).toBe(sampleTasks[1]);
      expect(task.title).toBe('Task 2');
    });

    it('should filter tasks by status', () => {
      sampleTasks[0].status = 'completed';
      sampleTasks[1].status = 'completed';

      const completedTasks = taskQueue.getTasksByStatus('completed');

      expect(completedTasks.length).toBe(2);
      expect(completedTasks[0].id).toBe('task-1');
      expect(completedTasks[1].id).toBe('task-2');
    });

    it('should count tasks by status', () => {
      sampleTasks[0].status = 'completed';
      sampleTasks[1].status = 'in-progress';

      const counts = taskQueue.getTaskCounts();

      expect(counts.total).toBe(3);
      expect(counts.pending).toBe(1);
      expect(counts['in-progress']).toBe(1);
      expect(counts.completed).toBe(1);
      expect(counts.failed).toBe(0);
    });

    it('should process a task', async () => {
      const task = sampleTasks[0];
      const processor = vi.fn();

      await taskQueue.processTask(task, processor);

      expect(processor).toHaveBeenCalledOnce();
      expect(processor).toHaveBeenCalledWith(task);
      expect(task.status).toBe('completed');
    });

    it('should handle errors during task processing', async () => {
      const task = sampleTasks[0];
      const error = new Error('Processing error');
      const processor = vi.fn().mockRejectedValue(error);

      await taskQueue.processTask(task, processor);

      expect(processor).toHaveBeenCalledOnce();
      expect(task.status).toBe('failed');
      expect(task.error).toBe('Processing error');
    });

    it('should iterate through tasks in priority order', () => {
      const taskIds = [];

      for (const task of taskQueue) {
        taskIds.push(task.id);
      }

      // Should iterate in descending priority order
      expect(taskIds).toEqual(['task-2', 'task-1', 'task-3']);
    });
  });

  describe('TaskQueueIterator', () => {
    let taskQueue;
    let sampleTasks;

    beforeEach(() => {
      taskQueue = new TaskQueue();
      sampleTasks = createSampleTasks('class');
      taskQueue.addTasks(sampleTasks);
    });

    it('should create an iterator that iterates through all tasks', () => {
      const iterator = taskQueue.createIterator();

      expect(iterator.hasNext()).toBe(true);
      expect(iterator.next().id).toBe('task-2'); // Highest priority first
      expect(iterator.next().id).toBe('task-1');
      expect(iterator.next().id).toBe('task-3');
      expect(iterator.hasNext()).toBe(false);
      expect(iterator.next()).toBeNull();
    });

    it('should filter tasks by status', () => {
      sampleTasks[0].status = 'completed';
      sampleTasks[1].status = 'completed';

      const iterator = taskQueue.createIterator({ status: 'completed' });

      expect(iterator.hasNext()).toBe(true);
      expect(iterator.tasks.length).toBe(2);
      expect(iterator.next().id).toBe('task-2');
      expect(iterator.next().id).toBe('task-1');
      expect(iterator.hasNext()).toBe(false);
    });

    it('should return tasks in batches', () => {
      const iterator = taskQueue.createIterator({ batchSize: 2 });

      expect(iterator.hasNext()).toBe(true);

      const firstBatch = iterator.next();
      expect(Array.isArray(firstBatch)).toBe(true);
      expect(firstBatch.length).toBe(2);
      expect(firstBatch[0].id).toBe('task-2');
      expect(firstBatch[1].id).toBe('task-1');

      const secondBatch = iterator.next();
      expect(Array.isArray(secondBatch)).toBe(true);
      expect(secondBatch.length).toBe(1);
      expect(secondBatch[0].id).toBe('task-3');

      expect(iterator.hasNext()).toBe(false);
    });

    it('should reset the iterator', () => {
      const iterator = taskQueue.createIterator();

      iterator.next(); // task-2
      iterator.next(); // task-1
      expect(iterator.currentIndex).toBe(2);

      iterator.reset();
      expect(iterator.currentIndex).toBe(0);
      expect(iterator.next().id).toBe('task-2');
    });

    it('should filter tasks with a custom predicate', () => {
      const iterator = taskQueue.createIterator().filter((task) => task.priority > 2);

      expect(iterator.hasNext()).toBe(true);
      expect(iterator.next().id).toBe('task-2');
      expect(iterator.hasNext()).toBe(false);
    });

    it('should process remaining tasks', async () => {
      const iterator = taskQueue.createIterator();
      const processor = vi.fn();

      await iterator.processRemaining(processor);

      expect(processor).toHaveBeenCalledTimes(3);
      expect(sampleTasks[0].status).toBe('completed');
      expect(sampleTasks[1].status).toBe('completed');
      expect(sampleTasks[2].status).toBe('completed');
    });

    it('should process remaining tasks with concurrency', async () => {
      const iterator = taskQueue.createIterator();

      // Processor that returns a promise
      const processor = vi.fn().mockImplementation((task) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            task.processed = true;
            resolve();
          }, 10);
        });
      });

      // Process with concurrency of 2
      await iterator.processRemaining(processor, { concurrency: 2 });

      expect(processor).toHaveBeenCalledTimes(3);
      expect(sampleTasks[0].processed).toBe(true);
      expect(sampleTasks[1].processed).toBe(true);
      expect(sampleTasks[2].processed).toBe(true);
    });

    it('should support the iterable protocol', () => {
      const iterator = taskQueue.createIterator();
      const taskIds = [];

      for (const task of iterator) {
        taskIds.push(task.id);
      }

      expect(taskIds).toEqual(['task-2', 'task-1', 'task-3']);
    });
  });
});

describe('Functional Implementation', () => {
  describe('createTask', () => {
    it('should create a task with the correct properties', () => {
      const task = createTask('task-1', 'Test Task', 'Task description', 2);

      expect(task.id).toBe('task-1');
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Task description');
      expect(task.priority).toBe(2);
      expect(task.status).toBe('pending');
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.startedAt).toBeNull();
      expect(task.completedAt).toBeNull();
    });

    it('should update status when starting a task', () => {
      const task = createTask('task-1', 'Test Task', 'Task description');
      task.start();

      expect(task.status).toBe('in-progress');
      expect(task.startedAt).toBeInstanceOf(Date);
    });

    it('should update status when completing a task', () => {
      const task = createTask('task-1', 'Test Task', 'Task description');
      task.start();
      task.complete();

      expect(task.status).toBe('completed');
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    it('should update status and store error when failing a task', () => {
      const task = createTask('task-1', 'Test Task', 'Task description');
      const error = new Error('Test error');
      task.start();
      task.fail(error);

      expect(task.status).toBe('failed');
      expect(task.error).toBe('Test error');
      expect(task.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('createTaskQueue', () => {
    let taskQueue;
    let sampleTasks;

    beforeEach(() => {
      taskQueue = createTaskQueue();
      sampleTasks = createSampleTasks('functional');
      taskQueue.addTasks(sampleTasks);
    });

    it('should add tasks to the queue', () => {
      const newTask = createTask('task-4', 'Task 4', 'Description 4');
      taskQueue.addTask(newTask);

      expect(taskQueue.getTaskById('task-4')).toBe(newTask);
    });

    it('should find tasks by ID', () => {
      const task = taskQueue.getTaskById('task-2');

      expect(task).toBe(sampleTasks[1]);
      expect(task.title).toBe('Task 2');
    });

    it('should filter tasks by status', () => {
      sampleTasks[0].status = 'completed';
      sampleTasks[1].status = 'completed';

      const completedTasks = taskQueue.getTasksByStatus('completed');

      expect(completedTasks.length).toBe(2);
      expect(completedTasks[0].id).toBe('task-1');
      expect(completedTasks[1].id).toBe('task-2');
    });

    it('should count tasks by status', () => {
      sampleTasks[0].status = 'completed';
      sampleTasks[1].status = 'in-progress';

      const counts = taskQueue.getTaskCounts();

      expect(counts.total).toBe(3);
      expect(counts.pending).toBe(1);
      expect(counts['in-progress']).toBe(1);
      expect(counts.completed).toBe(1);
      expect(counts.failed).toBe(0);
    });

    it('should process a task', async () => {
      const task = sampleTasks[0];
      const processor = vi.fn();

      await taskQueue.processTask(task, processor);

      expect(processor).toHaveBeenCalledOnce();
      expect(processor).toHaveBeenCalledWith(task);
      expect(task.status).toBe('completed');
    });

    it('should handle errors during task processing', async () => {
      const task = sampleTasks[0];
      const error = new Error('Processing error');
      const processor = vi.fn().mockRejectedValue(error);

      await taskQueue.processTask(task, processor);

      expect(processor).toHaveBeenCalledOnce();
      expect(task.status).toBe('failed');
      expect(task.error).toBe('Processing error');
    });

    it('should iterate through tasks in priority order', () => {
      const taskIds = [];

      for (const task of taskQueue) {
        taskIds.push(task.id);
      }

      // Should iterate in descending priority order
      expect(taskIds).toEqual(['task-2', 'task-1', 'task-3']);
    });

    describe('Task Queue Iterator', () => {
      it('should create an iterator that iterates through all tasks', () => {
        const iterator = taskQueue.iterator();

        expect(iterator.hasNext()).toBe(true);
        expect(iterator.next().id).toBe('task-2'); // Highest priority first
        expect(iterator.next().id).toBe('task-1');
        expect(iterator.next().id).toBe('task-3');
        expect(iterator.hasNext()).toBe(false);
        expect(iterator.next()).toBeNull();
      });

      it('should filter tasks by status', () => {
        sampleTasks[0].status = 'completed';
        sampleTasks[1].status = 'completed';

        const iterator = taskQueue.iterator({ status: 'completed' });

        expect(iterator.hasNext()).toBe(true);
        expect(iterator.next().id).toBe('task-2');
        expect(iterator.next().id).toBe('task-1');
        expect(iterator.hasNext()).toBe(false);
      });

      it('should return tasks in batches', () => {
        const iterator = taskQueue.iterator({ batchSize: 2 });

        expect(iterator.hasNext()).toBe(true);

        const firstBatch = iterator.next();
        expect(Array.isArray(firstBatch)).toBe(true);
        expect(firstBatch.length).toBe(2);
        expect(firstBatch[0].id).toBe('task-2');
        expect(firstBatch[1].id).toBe('task-1');

        const secondBatch = iterator.next();
        expect(Array.isArray(secondBatch)).toBe(true);
        expect(secondBatch.length).toBe(1);
        expect(secondBatch[0].id).toBe('task-3');

        expect(iterator.hasNext()).toBe(false);
      });

      it('should reset the iterator', () => {
        const iterator = taskQueue.iterator();

        iterator.next(); // task-2
        iterator.next(); // task-1

        iterator.reset();
        expect(iterator.next().id).toBe('task-2');
      });

      it('should filter tasks with a custom predicate', () => {
        const iterator = taskQueue.iterator().filter((task) => task.priority > 2);

        expect(iterator.hasNext()).toBe(true);
        expect(iterator.next().id).toBe('task-2');
        expect(iterator.hasNext()).toBe(false);
      });

      it('should process remaining tasks', async () => {
        const iterator = taskQueue.iterator();
        const processor = vi.fn();

        await iterator.processRemaining(processor);

        expect(processor).toHaveBeenCalledTimes(3);
        expect(sampleTasks[0].status).toBe('completed');
        expect(sampleTasks[1].status).toBe('completed');
        expect(sampleTasks[2].status).toBe('completed');
      });

      it('should process remaining tasks with concurrency', async () => {
        const iterator = taskQueue.iterator();

        // Processor that returns a promise
        const processor = vi.fn().mockImplementation((task) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              task.processed = true;
              resolve();
            }, 10);
          });
        });

        // Process with concurrency of 2
        await iterator.processRemaining(processor, { concurrency: 2 });

        expect(processor).toHaveBeenCalledTimes(3);
        expect(sampleTasks[0].processed).toBe(true);
        expect(sampleTasks[1].processed).toBe(true);
        expect(sampleTasks[2].processed).toBe(true);
      });

      it('should support the iterable protocol', () => {
        const iterator = taskQueue.iterator();
        const taskIds = [];

        for (const task of iterator) {
          taskIds.push(task.id);
        }

        expect(taskIds).toEqual(['task-2', 'task-1', 'task-3']);
      });
    });
  });
});
