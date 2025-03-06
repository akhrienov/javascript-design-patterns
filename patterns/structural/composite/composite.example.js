/**
 * Composite Pattern Real-world Example: Document Object Model
 *
 * This example demonstrates how to use the Composite Pattern to build
 * a simplified document structure similar to a content management system.
 * It shows both class-based and functional implementations working together.
 */

import { Leaf, Composite } from './composite.implementation.js';
import { createLeaf, createComposite } from './composite.functional.js';

// ---------------------------------------------------------------
// Class-based implementation example: Content Management System
// ---------------------------------------------------------------

// Content types for our CMS
const ContentType = {
  FOLDER: 'folder',
  DOCUMENT: 'document',
  IMAGE: 'image',
  VIDEO: 'video',
};

// Extension of Leaf specifically for documents
class Document extends Leaf {
  constructor(
    name,
    { contentType = ContentType.DOCUMENT, author = '', created = new Date(), content = '' }
  ) {
    super(name, { contentType, author, created });
    this.content = content;
  }

  getContent() {
    return this.content;
  }

  setContent(newContent) {
    this.content = newContent;
    return this;
  }

  // Override display to show document-specific info
  display(indent = 0) {
    const metadata = this.getMetadata();
    console.log(
      ' '.repeat(indent) +
        `- 📄 ${this.name} (Author: ${metadata.author}, Created: ${metadata.created.toLocaleDateString()})`
    );
  }
}

// Extension of Leaf for media files
class MediaFile extends Leaf {
  constructor(
    name,
    { contentType, author = '', created = new Date(), size = 0, dimensions = null }
  ) {
    super(name, { contentType, author, created, size, dimensions });
  }

  // Override display to show media-specific info
  display(indent = 0) {
    const metadata = this.getMetadata();
    const icon = metadata.contentType === ContentType.IMAGE ? '🖼️' : '🎬';
    const dimensionInfo = metadata.dimensions
      ? `, ${metadata.dimensions.width}x${metadata.dimensions.height}`
      : '';

    console.log(
      ' '.repeat(indent) +
        `- ${icon} ${this.name} (${(metadata.size / 1024).toFixed(2)} KB${dimensionInfo})`
    );
  }
}

// Extension of Composite for folders
class Folder extends Composite {
  constructor(name, { author = '', created = new Date() } = {}) {
    super(name, { contentType: ContentType.FOLDER, author, created });
  }

  // Override display to show folder-specific info
  display(indent = 0) {
    console.log(' '.repeat(indent) + `+ 📁 ${this.name} (Items: ${this.children.length})`);

    this.children.forEach((child) => {
      child.display(indent + 2);
    });
  }

  // Find all documents (recursive)
  findAllDocuments() {
    return this.filter(
      (component) =>
        component.getMetadata && component.getMetadata().contentType === ContentType.DOCUMENT
    );
  }

  // Find all media (recursive)
  findAllMedia() {
    return this.filter((component) => {
      const metadata = component.getMetadata && component.getMetadata();
      return (
        metadata &&
        (metadata.contentType === ContentType.IMAGE || metadata.contentType === ContentType.VIDEO)
      );
    });
  }

  // Get total size of all files
  getTotalSize() {
    let totalSize = 0;

    this.forEach((component) => {
      const metadata = component.getMetadata && component.getMetadata();
      if (metadata && metadata.size) {
        totalSize += metadata.size;
      }
    });

    return totalSize;
  }
}

// ---------------------------------------------------------------
// Usage example: Building a CMS structure
// ---------------------------------------------------------------

// Create the root folder
const projectRoot = new Folder('Project X', { author: 'Admin', created: new Date('2023-01-01') });

// Add content folders
const docsFolder = new Folder('Documents', { author: 'Admin', created: new Date('2023-01-02') });
const mediaFolder = new Folder('Media', { author: 'Admin', created: new Date('2023-01-02') });

// Add documents
docsFolder.add(
  new Document('Requirements.doc', {
    author: 'John Doe',
    created: new Date('2023-01-15'),
    content: 'Project requirements and specifications...',
  })
);

docsFolder.add(
  new Document('Architecture.doc', {
    author: 'Jane Smith',
    created: new Date('2023-01-20'),
    content: 'System architecture documentation...',
  })
);

// Add media files
mediaFolder.add(
  new MediaFile('logo.png', {
    contentType: ContentType.IMAGE,
    author: 'Design Team',
    created: new Date('2023-01-25'),
    size: 245760, // 240 KB
    dimensions: { width: 1200, height: 800 },
  })
);

mediaFolder.add(
  new MediaFile('intro.mp4', {
    contentType: ContentType.VIDEO,
    author: 'Marketing Team',
    created: new Date('2023-02-10'),
    size: 15728640, // 15 MB
  })
);

// Add a nested folder structure
const draftsFolder = new Folder('Drafts', { author: 'Team', created: new Date('2023-02-15') });
draftsFolder.add(
  new Document('Draft1.doc', {
    author: 'John Doe',
    created: new Date('2023-02-16'),
    content: 'First draft of the proposal...',
  })
);

// Compose the full structure
docsFolder.add(draftsFolder);
projectRoot.add(docsFolder);
projectRoot.add(mediaFolder);

// ---------------------------------------------------------------
// Function to demonstrate the CMS capabilities
// ---------------------------------------------------------------

/**
 * Demonstrates the CMS capabilities using the class-based implementation
 * @returns {Folder} The root folder of the CMS
 */
export function demonstrateCMS() {
  console.log('\n=== CLASS-BASED CMS EXAMPLE ===\n');

  // Display the full project structure
  console.log('Project Structure:');
  projectRoot.display();
  console.log('\n');

  // Count all items
  console.log(`Total items: ${projectRoot.count()}`);

  // Find all documents
  const allDocuments = projectRoot.findAllDocuments();
  console.log(`\nAll documents (${allDocuments.length}):`);
  allDocuments.forEach((doc) => console.log(`- ${doc.name} by ${doc.getMetadata().author}`));

  // Calculate total media size
  const totalSize = projectRoot.getTotalSize();
  console.log(`\nTotal media size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

  return projectRoot; // Return for testing purposes
}

// ---------------------------------------------------------------
// Functional implementation example: UI Component Tree
// ---------------------------------------------------------------

// UI component types
const ComponentType = {
  CONTAINER: 'container',
  BUTTON: 'button',
  INPUT: 'input',
  TEXT: 'text',
  IMAGE: 'image',
};

// Helper to create specific UI components using the functional implementation

// Create a UI container (composite)
const createContainer = (name, { id = '', className = '', styles = {} } = {}) => {
  return createComposite(name, {
    type: ComponentType.CONTAINER,
    id,
    className,
    styles,
  });
};

// Create a UI button (leaf)
const createButton = (
  name,
  { id = '', className = '', text = '', onClick = null, styles = {} } = {}
) => {
  return createLeaf(name, {
    type: ComponentType.BUTTON,
    id,
    className,
    text,
    onClick,
    styles,
  });
};

// Create a UI input (leaf)
const createInput = (
  name,
  { id = '', className = '', placeholder = '', value = '', onChange = null, styles = {} } = {}
) => {
  return createLeaf(name, {
    type: ComponentType.INPUT,
    id,
    className,
    placeholder,
    value,
    onChange,
    styles,
  });
};

// Create a UI text element (leaf)
const createText = (name, { id = '', className = '', content = '', styles = {} } = {}) => {
  return createLeaf(name, {
    type: ComponentType.TEXT,
    id,
    className,
    content,
    styles,
  });
};

// ---------------------------------------------------------------
// Usage example: Building a UI Component Tree
// ---------------------------------------------------------------

// Create a UI structure for a login form
const createLoginForm = () => {
  // Create the main form container
  const loginForm = createContainer('LoginForm', {
    id: 'login-form',
    className: 'form-container',
    styles: { padding: '20px', border: '1px solid #ccc' },
  });

  // Add a header
  loginForm.add(
    createText('FormHeader', {
      className: 'form-header',
      content: 'User Login',
      styles: { fontSize: '20px', marginBottom: '15px' },
    })
  );

  // Create input fields container
  const inputsContainer = createContainer('InputsContainer', {
    className: 'inputs-container',
    styles: { marginBottom: '15px' },
  });

  // Add username input
  inputsContainer.add(
    createInput('UsernameInput', {
      id: 'username',
      className: 'form-input',
      placeholder: 'Enter username',
      styles: { padding: '8px', marginBottom: '10px', width: '100%' },
    })
  );

  // Add password input
  inputsContainer.add(
    createInput('PasswordInput', {
      id: 'password',
      className: 'form-input',
      placeholder: 'Enter password',
      styles: { padding: '8px', marginBottom: '10px', width: '100%' },
    })
  );

  // Add the inputs container to the form
  loginForm.add(inputsContainer);

  // Create buttons container
  const buttonsContainer = createContainer('ButtonsContainer', {
    className: 'buttons-container',
    styles: { display: 'flex', justifyContent: 'space-between' },
  });

  // Add login button
  buttonsContainer.add(
    createButton('LoginButton', {
      id: 'login-btn',
      className: 'btn btn-primary',
      text: 'Login',
      styles: { padding: '8px 16px', backgroundColor: '#0066cc', color: 'white' },
    })
  );

  // Add reset button
  buttonsContainer.add(
    createButton('ResetButton', {
      id: 'reset-btn',
      className: 'btn btn-secondary',
      text: 'Reset',
      styles: { padding: '8px 16px', backgroundColor: '#cccccc' },
    })
  );

  // Add the buttons container to the form
  loginForm.add(buttonsContainer);

  return loginForm;
};

// ---------------------------------------------------------------
// Function to render the UI component tree (simplified)
// ---------------------------------------------------------------

// Simple function to render the component as HTML (simplified)
const renderToHTML = (component) => {
  const metadata = component.getMetadata();

  // Handle different component types
  switch (metadata.type) {
    case ComponentType.CONTAINER:
      // Get styles as string
      const styleStr = Object.entries(metadata.styles || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');

      // Start container tag
      let html = `<div id="${metadata.id}" class="${metadata.className}" style="${styleStr}">`;

      // Add children if it's a composite
      if (component.isComposite()) {
        const children = component.getChildren();
        children.forEach((child) => {
          html += renderToHTML(child);
        });
      }

      // Close container tag
      html += '</div>';
      return html;

    case ComponentType.BUTTON:
      return `<button id="${metadata.id}" class="${metadata.className}" 
        style="${Object.entries(metadata.styles || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ')}">
        ${metadata.text}
      </button>`;

    case ComponentType.INPUT:
      return `<input id="${metadata.id}" class="${metadata.className}" 
        placeholder="${metadata.placeholder}" value="${metadata.value}"
        style="${Object.entries(metadata.styles || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ')}" />`;

    case ComponentType.TEXT:
      return `<p id="${metadata.id}" class="${metadata.className}" 
        style="${Object.entries(metadata.styles || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ')}">
        ${metadata.content}
      </p>`;

    default:
      return '';
  }
};

// ---------------------------------------------------------------
// Function to demonstrate the UI component tree
// ---------------------------------------------------------------

/**
 * Demonstrates the UI component capabilities using the functional implementation
 * @returns {Object} The root login form component
 */
export function demonstrateUIComponents() {
  console.log('\n=== FUNCTIONAL UI COMPONENT EXAMPLE ===\n');

  // Create the login form
  const loginForm = createLoginForm();

  // Display the component structure
  console.log('UI Component Structure:');
  loginForm.display();
  console.log('\n');

  // Count UI components
  console.log(`Total UI components: ${loginForm.count()}`);

  // Generate HTML (simplified version)
  console.log('\nGenerated HTML structure:');
  const html = renderToHTML(loginForm);
  console.log(html);

  return loginForm; // Return for testing purposes
}

// ---------------------------------------------------------------
// Exports
// ---------------------------------------------------------------

export {
  // Class-based exports
  ContentType,
  Document,
  MediaFile,
  Folder,
  // Functional exports
  ComponentType,
  createContainer,
  createButton,
  createInput,
  createText,
  // Utility
  renderToHTML,
};
