import { describe, it, expect, beforeEach } from 'vitest';

import { Component, Leaf, Composite } from './composite.implementation.js';
import { createComponent, createLeaf, createComposite } from './composite.functional.js';
import {
  ContentType,
  Document,
  MediaFile,
  Folder,
  ComponentType,
  createContainer,
  createButton,
  createInput,
  renderToHTML,
} from './composite.example.js';

// ---------------------------------------------------------------
// Test class-based implementation
// ---------------------------------------------------------------

describe('Class-based Composite Pattern Implementation', () => {
  // Test basic component functionality
  describe('Component Class', () => {
    it('should have basic properties and methods', () => {
      const component = new Component('TestComponent');

      expect(component.name).toBe('TestComponent');
      expect(component.getName()).toBe('TestComponent');
      expect(component.isComposite()).toBe(false);
      expect(component.count()).toBe(1);
    });

    it('should throw errors for composite operations on base component', () => {
      const component = new Component('TestComponent');

      expect(() => component.add({})).toThrow();
      expect(() => component.remove({})).toThrow();
      expect(() => component.getChild(0)).toThrow();
      expect(() => component.getChildren()).toThrow();
    });
  });

  // Test Leaf class
  describe('Leaf Class', () => {
    it('should have proper properties and methods', () => {
      const metadata = { key: 'value', number: 42 };
      const leaf = new Leaf('TestLeaf', metadata);

      expect(leaf.name).toBe('TestLeaf');
      expect(leaf.getMetadata()).toEqual(metadata);
      expect(leaf.isComposite()).toBe(false);
      expect(leaf.count()).toBe(1);
    });

    it('should not allow adding children', () => {
      const leaf = new Leaf('TestLeaf');

      expect(() => leaf.add({})).toThrow();
    });
  });

  // Test Composite class
  describe('Composite Class', () => {
    let composite;
    let leaf1;
    let leaf2;

    beforeEach(() => {
      composite = new Composite('TestComposite');
      leaf1 = new Leaf('Leaf1');
      leaf2 = new Leaf('Leaf2');
    });

    it('should have proper properties and methods', () => {
      expect(composite.name).toBe('TestComposite');
      expect(composite.isComposite()).toBe(true);
      expect(composite.count()).toBe(1); // Just itself, no children yet
    });

    it('should correctly add and remove children', () => {
      composite.add(leaf1);
      composite.add(leaf2);

      expect(composite.getChildren().length).toBe(2);
      expect(composite.getChild(0)).toBe(leaf1);
      expect(composite.getChild(1)).toBe(leaf2);

      composite.remove(leaf1);

      expect(composite.getChildren().length).toBe(1);
      expect(composite.getChild(0)).toBe(leaf2);
    });

    it('should correctly count all nodes', () => {
      // Add children to the composite
      composite.add(leaf1);
      composite.add(leaf2);

      // Create a nested composite
      const nestedComposite = new Composite('NestedComposite');
      nestedComposite.add(new Leaf('NestedLeaf1'));
      nestedComposite.add(new Leaf('NestedLeaf2'));

      // Add the nested composite to the main composite
      composite.add(nestedComposite);

      // Count should include all nodes (1 main + 2 leaves + 1 nested + 2 nested leaves)
      expect(composite.count()).toBe(6);
    });

    it('should be able to find components by name', () => {
      // Add children to the composite
      composite.add(leaf1);
      composite.add(leaf2);

      // Create a nested composite
      const nestedComposite = new Composite('NestedComposite');
      const targetLeaf = new Leaf('TargetLeaf');
      nestedComposite.add(targetLeaf);

      // Add the nested composite to the main composite
      composite.add(nestedComposite);

      // Find the target leaf
      expect(composite.find('TargetLeaf')).toBe(targetLeaf);

      // Find the nested composite
      expect(composite.find('NestedComposite')).toBe(nestedComposite);

      // Find a non-existent component
      expect(composite.find('NonExistent')).toBeNull();
    });

    it('should implement the iterator protocol', () => {
      // Add children to the composite
      composite.add(leaf1);
      composite.add(leaf2);

      // Create and add a nested composite
      const nestedComposite = new Composite('NestedComposite');
      nestedComposite.add(new Leaf('NestedLeaf'));
      composite.add(nestedComposite);

      // Convert iterator to array
      const components = [...composite];

      // Should include all components in depth-first order
      expect(components.length).toBe(5);
      expect(components[0].name).toBe('TestComposite');
      expect(components[1].name).toBe('Leaf1');
      expect(components[2].name).toBe('Leaf2');
      expect(components[3].name).toBe('NestedComposite');
      expect(components[4].name).toBe('NestedLeaf');
    });

    it('should be able to filter components', () => {
      // Add children to the composite
      composite.add(leaf1);
      composite.add(leaf2);

      // Create and add a nested composite
      const nestedComposite = new Composite('NestedComposite');
      nestedComposite.add(new Leaf('NestedLeaf1'));
      nestedComposite.add(new Leaf('NestedLeaf2'));
      composite.add(nestedComposite);

      // Filter only leaf nodes
      const leafNodes = composite.filter((component) => !component.isComposite());

      expect(leafNodes.length).toBe(4); // Leaf1, Leaf2, NestedLeaf1, NestedLeaf2
    });
  });
});

// ---------------------------------------------------------------
// Test functional implementation
// ---------------------------------------------------------------

describe('Functional Composite Pattern Implementation', () => {
  describe('Component Factory', () => {
    it('should create components with basic properties and methods', () => {
      const component = createComponent('TestComponent');

      expect(component.name).toBe('TestComponent');
      expect(component.getName()).toBe('TestComponent');
      expect(component.isComposite()).toBe(false);
      expect(component.count()).toBe(1);
    });
  });

  describe('Leaf Factory', () => {
    it('should create leaf components with metadata', () => {
      const metadata = { key: 'value', number: 42 };
      const leaf = createLeaf('TestLeaf', metadata);

      expect(leaf.name).toBe('TestLeaf');
      expect(leaf.getMetadata()).toEqual(metadata);
      expect(leaf.isComposite()).toBe(false);
    });
  });

  describe('Composite Factory', () => {
    let composite;
    let leaf1;
    let leaf2;

    beforeEach(() => {
      composite = createComposite('TestComposite');
      leaf1 = createLeaf('Leaf1');
      leaf2 = createLeaf('Leaf2');
    });

    it('should create composites with proper properties', () => {
      expect(composite.name).toBe('TestComposite');
      expect(composite.isComposite()).toBe(true);
      expect(composite.getChildren()).toEqual([]);
    });

    it('should correctly manage children', () => {
      // Add children
      composite.add(leaf1);
      composite.add(leaf2);

      expect(composite.getChildren().length).toBe(2);
      expect(composite.getChild(0)).toBe(leaf1);

      // Remove a child
      composite.remove(leaf1);
      expect(composite.getChildren().length).toBe(1);
      expect(composite.getChild(0)).toBe(leaf2);
    });

    it('should implement the iterator protocol', () => {
      // Add leaf nodes
      composite.add(leaf1);
      composite.add(leaf2);

      // Add a nested composite
      const nestedComposite = createComposite('NestedComposite');
      nestedComposite.add(createLeaf('NestedLeaf'));
      composite.add(nestedComposite);

      // Check if iterator works
      const result = [];
      for (const component of composite) {
        result.push(component.name);
      }

      // TestComposite, Leaf1, Leaf2, NestedComposite
      expect(result.length).toBe(4);
      expect(result[0]).toBe('TestComposite');
    });

    it('should support recursive operations', () => {
      // Create a nested structure
      composite.add(leaf1);

      const nestedComposite = createComposite('NestedComposite');
      nestedComposite.add(createLeaf('NestedLeaf1'));
      nestedComposite.add(createLeaf('NestedLeaf2'));

      composite.add(nestedComposite);
      composite.add(leaf2);

      // Count all nodes
      expect(composite.count()).toBe(6);

      // Find by name
      expect(composite.find('NestedLeaf1').name).toBe('NestedLeaf1');
    });
  });
});

// ---------------------------------------------------------------
// Test real-world examples
// ---------------------------------------------------------------

describe('Real-world Composite Pattern Examples', () => {
  // Test CMS example (class-based)
  describe('Content Management System Example', () => {
    let projectRoot;
    let docsFolder;
    let mediaFolder;

    beforeEach(() => {
      // Create a simpler structure for testing
      projectRoot = new Folder('ProjectRoot');
      docsFolder = new Folder('Documents');
      mediaFolder = new Folder('Media');

      // Add some documents
      docsFolder.add(
        new Document('Doc1.txt', {
          contentType: ContentType.DOCUMENT,
          author: 'User1',
          content: 'Content of Doc1',
        })
      );

      // Add some media
      mediaFolder.add(
        new MediaFile('Image1.jpg', {
          contentType: ContentType.IMAGE,
          size: 1024,
          dimensions: { width: 800, height: 600 },
        })
      );

      // Compose the structure
      projectRoot.add(docsFolder);
      projectRoot.add(mediaFolder);
    });

    it('should create valid CMS structure', () => {
      expect(projectRoot.count()).toBe(5); // Root + 2 folders + 1 doc + 1 media
      expect(projectRoot.getChildren().length).toBe(2);
      expect(docsFolder.getChildren().length).toBe(1);
      expect(mediaFolder.getChildren().length).toBe(1);
    });

    it('should find documents correctly', () => {
      const documents = projectRoot.findAllDocuments();
      expect(documents.length).toBe(1);
      expect(documents[0].name).toBe('Doc1.txt');
    });

    it('should calculate total size correctly', () => {
      const totalSize = projectRoot.getTotalSize();
      expect(totalSize).toBe(1024); // Size of the one media file
    });
  });

  // Test UI Component example (functional)
  describe('UI Component Tree Example', () => {
    it('should create UI components correctly', () => {
      const button = createButton('TestButton', { text: 'Click Me' });
      expect(button.name).toBe('TestButton');
      expect(button.getMetadata().text).toBe('Click Me');
      expect(button.getMetadata().type).toBe(ComponentType.BUTTON);
    });

    it('should compose UI components into a tree', () => {
      // Create a form container
      const form = createContainer('Form');

      // Add some inputs
      form.add(createInput('UsernameInput', { placeholder: 'Username' }));
      form.add(createButton('SubmitButton', { text: 'Submit' }));

      expect(form.count()).toBe(3); // Container + input + button
      expect(form.getChildren().length).toBe(2);
    });

    it('should render UI components to HTML', () => {
      const button = createButton('TestButton', {
        id: 'test-btn',
        className: 'btn primary',
        text: 'Test Button',
        styles: { padding: '10px' },
      });

      const html = renderToHTML(button);

      expect(html).toContain('<button id="test-btn"');
      expect(html).toContain('class="btn primary"');
      expect(html).toContain('Test Button');
      expect(html).toContain('style="padding: 10px');
    });
  });
});
