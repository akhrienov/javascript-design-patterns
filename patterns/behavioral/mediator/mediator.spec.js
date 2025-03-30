import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Mediator, Component } from './mediator.implementation.js';
import { createMediator, createComponent } from './mediator.functional.js';

describe('Mediator Pattern - Class Implementation', () => {
  let mediator;
  let componentA;
  let componentB;

  beforeEach(() => {
    mediator = new Mediator();

    componentA = new Component('ComponentA');
    componentB = new Component('ComponentB');

    // Mock the receive methods
    componentA.receive = vi.fn().mockReturnValue(componentA);
    componentB.receive = vi.fn().mockReturnValue(componentB);

    // Register components
    mediator.register(componentA).register(componentB);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register components correctly', () => {
    expect(mediator.getComponent('ComponentA')).toBe(componentA);
    expect(mediator.getComponent('ComponentB')).toBe(componentB);
    expect(componentA.mediator).toBe(mediator);
    expect(componentB.mediator).toBe(mediator);
  });

  it('should allow components to send messages to each other', () => {
    const message = { text: 'Hello from A' };

    componentA.send('ComponentB', message);

    expect(componentB.receive).toHaveBeenCalledWith(message);
    expect(componentB.receive).toHaveBeenCalledTimes(1);
  });

  it('should allow components to publish events', () => {
    const callback = vi.fn();
    const data = { value: 42 };

    mediator.on('testEvent', callback);
    componentA.notify('testEvent', data);

    expect(callback).toHaveBeenCalledWith(data);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should allow components to subscribe to events', () => {
    const callback = vi.fn();
    const data = { value: 42 };

    componentA.on('testEvent', callback);
    mediator.notify('testEvent', data);

    expect(callback).toHaveBeenCalledWith(data);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should provide an unsubscribe function', () => {
    const callback = vi.fn();
    const data = { value: 42 };

    const unsubscribe = mediator.on('testEvent', callback);
    mediator.notify('testEvent', data);

    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    mediator.notify('testEvent', data);

    expect(callback).toHaveBeenCalledTimes(1); // Not called again
  });

  it('should handle errors in event handlers', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const errorCallback = () => {
      throw new Error('Test error');
    };

    mediator.on('errorEvent', errorCallback);
    mediator.notify('errorEvent', {});

    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('Mediator Pattern - Functional Implementation', () => {
  let mediator;
  let componentA;
  let componentB;

  beforeEach(() => {
    mediator = createMediator();

    componentA = createComponent('ComponentA');
    componentB = createComponent('ComponentB');

    // Mock the receive methods
    componentA.receive = vi.fn().mockReturnValue(componentA);
    componentB.receive = vi.fn().mockReturnValue(componentB);

    // Register components
    mediator.register('ComponentA', componentA).register('ComponentB', componentB);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register components correctly', () => {
    expect(mediator.getComponent('ComponentA')).toBe(componentA);
    expect(mediator.getComponent('ComponentB')).toBe(componentB);
    expect(componentA.mediator).toBe(mediator);
    expect(componentB.mediator).toBe(mediator);
  });

  it('should allow components to send messages to each other', () => {
    const message = { text: 'Hello from A' };
    componentA.send('ComponentB', message);

    expect(componentB.receive).toHaveBeenCalledWith(message);
    expect(componentB.receive).toHaveBeenCalledTimes(1);
  });

  it('should allow components to publish events', () => {
    const callback = vi.fn();
    const data = { value: 42 };

    mediator.on('testEvent', callback);
    componentA.notify('testEvent', data);

    expect(callback).toHaveBeenCalledWith(data);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should allow components to subscribe to events', () => {
    const callback = vi.fn();
    const data = { value: 42 };

    componentA.on('testEvent', callback);
    mediator.notify('testEvent', data);

    expect(callback).toHaveBeenCalledWith(data);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should provide an unsubscribe function', () => {
    const callback = vi.fn();
    const data = { value: 42 };

    const unsubscribe = mediator.on('testEvent', callback);
    mediator.notify('testEvent', data);

    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    mediator.notify('testEvent', data);

    expect(callback).toHaveBeenCalledTimes(1); // Not called again
  });
});
