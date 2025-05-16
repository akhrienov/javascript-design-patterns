import { describe, test, expect, beforeEach } from 'vitest';

import {
  TextExpression,
  VariableExpression,
  ConditionalExpression,
  LoopExpression,
  CompositeExpression,
  TemplateParser,
  TemplateEngine,
} from './interpreter.implementation.js';
import {
  createTextExpression,
  createVariableExpression,
  createConditionalExpression,
  createLoopExpression,
  createCompositeExpression,
  createTemplateEngine,
} from './interpreter.functional.js';
import { userData } from './interpreter.example';

describe('Class-based Interpreter Implementation', () => {
  describe('Expression Classes', () => {
    test('TextExpression should return its text content', () => {
      const text = 'Hello, World!';
      const expr = new TextExpression(text);
      expect(expr.interpret({})).toBe(text);
    });

    test('VariableExpression should return the variable value from context', () => {
      const expr = new VariableExpression('name');
      const context = { name: 'John' };
      expect(expr.interpret(context)).toBe('John');
    });

    test('VariableExpression should handle nested properties', () => {
      const expr = new VariableExpression('user.name');
      const context = { user: { name: 'John' } };
      expect(expr.interpret(context)).toBe('John');
    });

    test('VariableExpression should handle missing variables gracefully', () => {
      const expr = new VariableExpression('unknown');
      const context = {};
      expect(expr.interpret(context)).toBe('');
    });

    test('ConditionalExpression should interpret true branch when condition is true', () => {
      const trueExpr = new TextExpression('Yes');
      const falseExpr = new TextExpression('No');
      const condition = new ConditionalExpression('value', trueExpr, falseExpr);

      const context = { value: true };
      expect(condition.interpret(context)).toBe('Yes');
    });

    test('ConditionalExpression should interpret false branch when condition is false', () => {
      const trueExpr = new TextExpression('Yes');
      const falseExpr = new TextExpression('No');
      const condition = new ConditionalExpression('value', trueExpr, falseExpr);

      const context = { value: false };
      expect(condition.interpret(context)).toBe('No');
    });

    test('LoopExpression should iterate over a collection', () => {
      const loopBody = new VariableExpression('item');
      const loop = new LoopExpression('item', 'items', loopBody);

      const context = { items: ['a', 'b', 'c'] };
      expect(loop.interpret(context)).toBe('abc');
    });

    test('CompositeExpression should combine multiple expressions', () => {
      const composite = new CompositeExpression([
        new TextExpression('Hello, '),
        new VariableExpression('name'),
        new TextExpression('!'),
      ]);

      const context = { name: 'John' };
      expect(composite.interpret(context)).toBe('Hello, John!');
    });
  });

  describe('TemplateParser', () => {
    let parser;

    beforeEach(() => {
      parser = new TemplateParser();
    });

    test('should parse text content', () => {
      const template = 'Hello, World!';
      const expr = parser.parse(template);

      expect(expr.interpret({})).toBe('Hello, World!');
    });

    test('should parse variable expressions', () => {
      const template = 'Hello, {{ name }}!';
      const expr = parser.parse(template);

      const context = { name: 'John' };
      expect(expr.interpret(context)).toBe('Hello, John!');
    });

    test('should parse loop expressions', () => {
      const template = 'Items: {% for item in items %}{{ item }}{% endfor %}';
      const expr = parser.parse(template);

      const context = { items: ['a', 'b', 'c'] };
      expect(expr.interpret(context)).toBe('Items: abc');
    });

    test('should handle nested expressions', () => {
      const template = `
        {% if hasItems %}
          <ul>
            {% for item in items %}
              <li>{{ item }}</li>
            {% endfor %}
          </ul>
        {% else %}
          <p>No items</p>
        {% endif %}
      `;
      const expr = parser.parse(template);

      // Test with items
      const contextWithItems = { hasItems: true, items: ['a', 'b'] };
      const resultWithItems = expr.interpret(contextWithItems).replace(/\s+/g, ' ').trim();
      expect(resultWithItems).toContain('<ul>');
      expect(resultWithItems).toContain('<li>a</li>');
      expect(resultWithItems).toContain('<li>b</li>');
      expect(resultWithItems).toContain('</ul>');

      // Test without items
      const contextWithoutItems = { hasItems: false };
      const resultWithoutItems = expr.interpret(contextWithoutItems).replace(/\s+/g, ' ').trim();
      expect(resultWithoutItems).toContain('<p>No items</p>');
    });
  });
});

describe('Functional Interpreter Implementation', () => {
  describe('Expression Factory Functions', () => {
    test('createTextExpression should return a text expression object', () => {
      const text = 'Hello, World!';
      const expr = createTextExpression(text);

      expect(expr.type).toBe('text');
      expect(expr.content).toBe(text);
      expect(expr.interpret({})).toBe(text);
    });

    test('createVariableExpression should return a variable expression object', () => {
      const expr = createVariableExpression('name');
      const context = { name: 'John' };

      expect(expr.type).toBe('variable');
      expect(expr.interpret(context)).toBe('John');
    });

    test('createVariableExpression should handle nested properties', () => {
      const expr = createVariableExpression('user.name');
      const context = { user: { name: 'John' } };

      expect(expr.interpret(context)).toBe('John');
    });

    test('createVariableExpression should handle missing variables gracefully', () => {
      const expr = createVariableExpression('unknown');
      const context = {};

      expect(expr.interpret(context)).toBe('');
    });

    test('createConditionalExpression should return a conditional expression object', () => {
      const trueExpr = createTextExpression('Yes');
      const falseExpr = createTextExpression('No');
      const condition = createConditionalExpression('value', trueExpr, falseExpr);

      expect(condition.type).toBe('conditional');

      const trueContext = { value: true };
      const falseContext = { value: false };

      expect(condition.interpret(trueContext)).toBe('Yes');
      expect(condition.interpret(falseContext)).toBe('No');
    });

    test('createLoopExpression should return a loop expression object', () => {
      const loopBody = createVariableExpression('item');
      const loop = createLoopExpression('item', 'items', loopBody);

      expect(loop.type).toBe('loop');

      const context = { items: ['a', 'b', 'c'] };
      expect(loop.interpret(context)).toBe('abc');
    });
  });
});

describe('Implementation Comparisons', () => {
  test('both implementations should handle error cases gracefully', () => {
    const classEngine = new TemplateEngine();
    const funcEngine = createTemplateEngine();

    const badTemplates = [
      // Unclosed variable
      'Hello {{ name',
      // Unclosed if block
      '{% if admin %}Admin',
      // Unclosed for block
      '{% for item in items %}{{ item }}',
      // Mismatched tags
      '{% if admin %}Admin{% endif %}{% endif %}',
      // Nested blocks with errors
      '{% if admin %}{% for item in items %}{{ item }{% endfor %}{% endif %}',
    ];

    for (const template of badTemplates) {
      // Should not throw errors for malformed templates
      expect(() => classEngine.render(template, userData)).not.toThrow();
      expect(() => funcEngine.render(template, userData)).not.toThrow();
    }
  });
});
