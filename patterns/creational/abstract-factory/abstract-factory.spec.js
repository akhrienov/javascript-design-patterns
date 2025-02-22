import { describe, it, expect } from 'vitest';
import {
  MaterialUIFactory,
  IOSUIFactory,
  createUIFactory,
  MaterialButton,
  MaterialInput,
  IOSButton,
  IOSInput,
} from './abstract-factory.implementation.js';

describe('Abstract Factory Pattern - Class Based Implementation', () => {
  describe('MaterialUIFactory', () => {
    const factory = new MaterialUIFactory();

    it('should create a material button', () => {
      const button = factory.createButton('Click me');
      expect(button).toBeInstanceOf(MaterialButton);

      const rendered = button.render();
      expect(rendered.type).toBe('material-button');
      expect(rendered.props.label).toBe('Click me');
      expect(rendered.props.styles.backgroundColor).toBe('#1976d2');
    });

    it('should create a material input', () => {
      const input = factory.createInput('Enter text');
      expect(input).toBeInstanceOf(MaterialInput);

      const rendered = input.render();
      expect(rendered.type).toBe('material-input');
      expect(rendered.props.placeholder).toBe('Enter text');
      expect(rendered.props.styles.border).toBe('1px solid #1976d2');
    });

    it('should handle button click events', () => {
      const button = factory.createButton();
      const event = button.onClick(() => {});
      expect(event.type).toBe('click');
      expect(event.handler).toBeInstanceOf(Function);
    });

    it('should handle input change events', () => {
      const input = factory.createInput();
      const event = input.onInput(() => {});
      expect(event.type).toBe('input');
      expect(event.handler).toBeInstanceOf(Function);
    });
  });

  describe('IOSUIFactory', () => {
    const factory = new IOSUIFactory();

    it('should create an iOS button', () => {
      const button = factory.createButton('Press me');
      expect(button).toBeInstanceOf(IOSButton);

      const rendered = button.render();
      expect(rendered.type).toBe('ios-button');
      expect(rendered.props.label).toBe('Press me');
      expect(rendered.props.styles.backgroundColor).toBe('#007AFF');
    });

    it('should create an iOS input', () => {
      const input = factory.createInput('Type here');
      expect(input).toBeInstanceOf(IOSInput);

      const rendered = input.render();
      expect(rendered.type).toBe('ios-input');
      expect(rendered.props.placeholder).toBe('Type here');
      expect(rendered.props.styles.border).toBe('1px solid #007AFF');
    });
  });
});

describe('Abstract Factory Pattern - Functional Implementation', () => {
  describe('createUIFactory', () => {
    it('should create material UI components', () => {
      const factory = createUIFactory('material');

      const button = factory.createButton('Click me');
      const buttonRendered = button.render();
      expect(buttonRendered.type).toBe('material-button');
      expect(buttonRendered.props.styles.backgroundColor).toBe('#1976d2');

      const input = factory.createInput('Enter text');
      const inputRendered = input.render();
      expect(inputRendered.type).toBe('material-input');
      expect(inputRendered.props.styles.border).toBe('1px solid #1976d2');
    });

    it('should create iOS UI components', () => {
      const factory = createUIFactory('ios');

      const button = factory.createButton('Press me');
      const buttonRendered = button.render();
      expect(buttonRendered.type).toBe('ios-button');
      expect(buttonRendered.props.styles.backgroundColor).toBe('#007AFF');

      const input = factory.createInput('Type here');
      const inputRendered = input.render();
      expect(inputRendered.type).toBe('ios-input');
      expect(inputRendered.props.styles.border).toBe('1px solid #007AFF');
    });
  });
});
