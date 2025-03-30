import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Subject, Observer, ConcreteObserver } from './observer.implementation.js';
import { createSubject, createObserver } from './observer.functional.js';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Class-based Observer Pattern Implementation', () => {
  it('should notify observers when state changes', () => {
    const subject = new Subject();
    const mockUpdate1 = vi.fn();
    const mockUpdate2 = vi.fn();

    const observer1 = new ConcreteObserver('Observer1', mockUpdate1);
    const observer2 = new ConcreteObserver('Observer2', mockUpdate2);

    subject.subscribe(observer1).subscribe(observer2);
    subject.setState({ message: 'Test State' });

    expect(mockUpdate1).toHaveBeenCalledTimes(1);
    expect(mockUpdate1).toHaveBeenCalledWith({ message: 'Test State' });
    expect(mockUpdate2).toHaveBeenCalledTimes(1);
    expect(mockUpdate2).toHaveBeenCalledWith({ message: 'Test State' });
  });

  it('should stop notifying unsubscribed observers', () => {
    const subject = new Subject();
    const mockUpdate1 = vi.fn();
    const mockUpdate2 = vi.fn();

    const observer1 = new ConcreteObserver('Observer1', mockUpdate1);
    const observer2 = new ConcreteObserver('Observer2', mockUpdate2);

    subject.subscribe(observer1).subscribe(observer2);
    subject.unsubscribe(observer1);
    subject.setState({ message: 'Test State' });

    expect(mockUpdate1).not.toHaveBeenCalled();
    expect(mockUpdate2).toHaveBeenCalledTimes(1);
  });

  it('should allow method chaining for subscribe and unsubscribe', () => {
    const subject = new Subject();
    const observer1 = new Observer('Observer1');
    const observer2 = new Observer('Observer2');
    const observer3 = new Observer('Observer3');

    subject.subscribe(observer1).subscribe(observer2).subscribe(observer3).unsubscribe(observer2);

    expect(subject.observers).toContain(observer1);
    expect(subject.observers).not.toContain(observer2);
    expect(subject.observers).toContain(observer3);
  });

  it('should not add the same observer twice', () => {
    const subject = new Subject();
    const observer = new Observer('Single Observer');

    subject.subscribe(observer).subscribe(observer);

    expect(subject.observers.length).toBe(1);
  });
});

describe('Functional Observer Pattern Implementation', () => {
  it('should notify observers when state changes', () => {
    const subject = createSubject();
    const mockHandler1 = vi.fn();
    const mockHandler2 = vi.fn();

    const observer1 = createObserver('Observer1', mockHandler1);
    const observer2 = createObserver('Observer2', mockHandler2);

    subject.subscribe(observer1);
    subject.subscribe(observer2);
    subject.setState({ message: 'Test State' });

    expect(mockHandler1).toHaveBeenCalledTimes(1);
    expect(mockHandler1).toHaveBeenCalledWith({ message: 'Test State' });
    expect(mockHandler2).toHaveBeenCalledTimes(1);
    expect(mockHandler2).toHaveBeenCalledWith({ message: 'Test State' });
  });

  it('should stop notifying unsubscribed observers', () => {
    const subject = createSubject();
    const mockHandler1 = vi.fn();
    const mockHandler2 = vi.fn();

    const observer1 = createObserver('Observer1', mockHandler1);
    const observer2 = createObserver('Observer2', mockHandler2);

    const subscription1 = subject.subscribe(observer1);

    subject.subscribe(observer2);
    subscription1.unsubscribe();
    subject.setState({ message: 'Test State' });

    expect(mockHandler1).not.toHaveBeenCalled();
    expect(mockHandler2).toHaveBeenCalledTimes(1);
  });

  it('should keep track of observer count', () => {
    const subject = createSubject();
    const observer1 = createObserver('Observer1');
    const observer2 = createObserver('Observer2');
    const observer3 = createObserver('Observer3');

    const subscription1 = subject.subscribe(observer1);
    const subscription2 = subject.subscribe(observer2);
    const subscription3 = subject.subscribe(observer3);

    expect(subject.observerCount()).toBe(3);

    subscription2.unsubscribe();

    expect(subject.observerCount()).toBe(2);

    subscription1.unsubscribe();
    subscription3.unsubscribe();

    expect(subject.observerCount()).toBe(0);
  });
});
