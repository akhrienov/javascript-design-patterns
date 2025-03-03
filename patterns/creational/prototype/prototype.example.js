import {
  DocumentPrototype,
  createDocumentPrototype,
  TemplateRegistry,
} from './prototype.implementation.js';

// Example using class-based implementation
const blogPostTemplate = new DocumentPrototype({
  title: '',
  content: '',
  metadata: {
    author: '',
    createdAt: new Date(),
    tags: [],
  },
});

const newBlogPost = blogPostTemplate.customize({
  title: 'Understanding JavaScript Prototypes',
  content: 'JavaScript prototypes are powerful...',
  metadata: {
    author: 'Jane Developer',
    tags: ['javascript', 'programming'],
  },
});

console.log('Class-based example:', newBlogPost);

// Example using functional implementation
const emailTemplate = createDocumentPrototype({
  title: '',
  content: '',
  metadata: {
    author: 'System',
    createdAt: new Date(),
    tags: ['email'],
  },
});

const welcomeEmail = emailTemplate.customize({
  title: 'Welcome to Our Platform!',
  content: "We're excited to have you on board...",
  metadata: {
    author: 'Support Team',
  },
});

console.log('Functional example:', welcomeEmail);

// Example using template registry
const registry = new TemplateRegistry();

// Register both templates
registry.register('blogPost', blogPostTemplate);
registry.register('email', emailTemplate);

// Create documents from registry
const registryBlogPost = registry.createFromTemplate('blogPost', {
  title: 'Using Template Registry',
  content: 'Template registry makes it easy...',
  metadata: {
    author: 'John Developer',
    tags: ['patterns', 'javascript'],
  },
});

console.log('Registry example:', registryBlogPost);
