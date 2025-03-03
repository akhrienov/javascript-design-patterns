import { describe, it, expect, beforeEach } from 'vitest';
import {
  deepClone,
  DocumentPrototype,
  createDocumentPrototype,
  TemplateRegistry,
} from './prototype.implementation.js';

describe('Prototype Pattern Implementation', () => {
  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('test')).toBe('test');
      expect(deepClone(null)).toBe(null);
    });

    it('should clone dates', () => {
      const date = new Date();
      const clonedDate = deepClone(date);
      expect(clonedDate).toBeInstanceOf(Date);
      expect(clonedDate.getTime()).toBe(date.getTime());
    });

    it('should clone arrays', () => {
      const array = [1, { test: 'value' }, [3, 4]];
      const clonedArray = deepClone(array);
      expect(clonedArray).toEqual(array);
      expect(clonedArray).not.toBe(array);
    });

    it('should clone nested objects', () => {
      const obj = {
        a: 1,
        b: { c: 2 },
        d: [3, { e: 4 }],
      };
      const clonedObj = deepClone(obj);
      expect(clonedObj).toEqual(obj);
      expect(clonedObj).not.toBe(obj);
      expect(clonedObj.b).not.toBe(obj.b);
    });
  });

  describe('DocumentPrototype - Class-based implementation', () => {
    /** @type {DocumentPrototype} */
    let prototype;

    beforeEach(() => {
      prototype = new DocumentPrototype({
        title: 'Default Title',
        content: 'Default Content',
        metadata: {
          author: 'Default Author',
          createdAt: new Date('2024-01-01'),
          tags: ['default'],
        },
      });
    });

    it('should create a clone of the template', () => {
      const cloned = prototype.clone();
      expect(cloned).toEqual(prototype.template);
      expect(cloned).not.toBe(prototype.template);
    });

    it('should create a customized clone', () => {
      const customized = prototype.customize({
        title: 'Custom Title',
        metadata: {
          author: 'Custom Author',
        },
      });

      expect(customized.title).toBe('Custom Title');
      expect(customized.metadata.author).toBe('Custom Author');
      expect(customized.content).toBe('Default Content');
    });
  });

  describe('createDocumentPrototype - Functional implementation', () => {
    /** @type {ReturnType<typeof createDocumentPrototype>} */
    let prototype;

    beforeEach(() => {
      prototype = createDocumentPrototype({
        title: 'Default Title',
        content: 'Default Content',
        metadata: {
          author: 'Default Author',
          createdAt: new Date('2024-01-01'),
          tags: ['default'],
        },
      });
    });

    it('should create a clone of the template', () => {
      const cloned = prototype.clone();
      expect(cloned).toEqual(prototype.clone());
      expect(cloned).not.toBe(prototype.clone());
    });

    it('should create a customized clone', () => {
      const customized = prototype.customize({
        title: 'Custom Title',
        metadata: {
          author: 'Custom Author',
        },
      });

      expect(customized.title).toBe('Custom Title');
      expect(customized.metadata.author).toBe('Custom Author');
      expect(customized.content).toBe('Default Content');
    });
  });

  describe('TemplateRegistry', () => {
    /** @type {TemplateRegistry} */
    let registry;
    /** @type {DocumentPrototype} */
    let template;

    beforeEach(() => {
      registry = new TemplateRegistry();
      template = new DocumentPrototype({
        title: 'Default Title',
        content: 'Default Content',
        metadata: {
          author: 'Default Author',
          createdAt: new Date('2024-01-01'),
          tags: ['default'],
        },
      });
    });

    it('should register and retrieve templates', () => {
      registry.register('test', template);
      expect(registry.getTemplate('test')).toBe(template);
    });

    it('should throw error when template not found', () => {
      expect(() => registry.getTemplate('nonexistent')).toThrow(
        'Template "nonexistent" not found!'
      );
    });

    it('should unregister templates', () => {
      registry.register('test', template);
      registry.unregister('test');
      expect(() => registry.getTemplate('test')).toThrow('Template "test" not found!');
    });

    it('should create document from template', () => {
      registry.register('test', template);
      const document = registry.createFromTemplate('test', {
        title: 'New Title',
      });

      expect(document.title).toBe('New Title');
      expect(document.content).toBe('Default Content');
    });
  });
});
