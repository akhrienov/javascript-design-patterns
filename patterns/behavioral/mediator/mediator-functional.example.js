import { createMediator, createComponent } from './mediator.functional.js';

/**
 * Create a notification system using the functional mediator pattern
 */

// Create a mediator
const notificationMediator = createMediator();

// Create a form component
function createFormComponent(name) {
  const component = createComponent(name);

  // Add form-specific properties and methods
  return {
    ...component,
    submitForm(data) {
      console.log(`${this.name} submitting form with data:`, data);

      // Notify about form submission
      this.notify('form.submitted', {
        form: this.name,
        data,
        timestamp: new Date(),
      });

      return this;
    },

    validate(data) {
      // Basic validation
      const errors = [];

      if (!data.email) {
        errors.push('Email is required');
      } else if (!data.email.includes('@')) {
        errors.push('Email is invalid');
      }

      if (!data.name) errors.push('Name is required');

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  };
}

// Create a notification component
function createNotificationComponent(name) {
  const component = createComponent(name);

  // Add notification-specific properties and methods
  return {
    ...component,
    notifications: [],

    showNotification(type, message) {
      const notification = {
        id: Date.now(),
        type,
        message,
        timestamp: new Date(),
      };

      this.notifications.push(notification);

      console.log(`[${type.toUpperCase()}] ${message}`);

      // Notify about new notification
      this.notify('notification.shown', notification);

      return this;
    },

    handleFormSubmission(data) {
      this.showNotification('success', `Form ${data.form} submitted successfully`);
      return this;
    },

    handleFormError(data) {
      this.showNotification('error', `Error in form ${data.form}: ${data.errors.join(', ')}`);
      return this;
    },
  };
}

// Create a validation component
function createValidationComponent(name) {
  const component = createComponent(name);

  return {
    ...component,

    receive(message) {
      if (message.type === 'validateForm') this.validateForm(message.form, message.data);
      return this;
    },

    validateForm(formName, data) {
      console.log(`${this.name} validating form data from ${formName}`);

      // Get the form component to use its validation logic
      const formComponent = this.mediator.getComponent(formName);

      if (!formComponent || typeof formComponent.validate !== 'function') {
        this.notify('validation.error', {
          form: formName,
          error: 'Form component not found or does not support validation',
        });
        return;
      }

      // Use the form's validation logic
      const result = formComponent.validate(data);

      if (result.isValid) {
        this.notify('validation.success', {
          form: formName,
          data,
        });
      } else {
        this.notify('validation.failure', {
          form: formName,
          data,
          errors: result.errors,
        });
      }
    },
  };
}

// Set up the demo
function runNotificationExample() {
  // Create components
  const contactForm = createFormComponent('contactForm');
  const signupForm = createFormComponent('signupForm');
  const validator = createValidationComponent('validator');
  const notifier = createNotificationComponent('notifier');

  // Register components with the mediator
  notificationMediator
    .register('contactForm', contactForm)
    .register('signupForm', signupForm)
    .register('validator', validator)
    .register('notifier', notifier);

  // Set up event handlers
  notificationMediator.on('form.submitted', (data) => {
    console.log('Form submission intercepted by mediator');

    // Delegate to validator
    validator.validateForm(data.form, data.data);
  });

  notificationMediator.on('validation.success', (data) => {
    console.log('Validation success:', data);
    notifier.handleFormSubmission(data);
  });

  notificationMediator.on('validation.failure', (data) => {
    console.log('Validation failure:', data);
    notifier.handleFormError(data);
  });

  // Simulate form submissions
  console.log('\n=== Starting Notification Example ===\n');

  // Valid submission
  contactForm.submitForm({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello, I have a question about your services.',
  });

  // Invalid submission
  signupForm.submitForm({
    name: '',
    email: 'invalid-email',
  });

  console.log('\n=== End of Notification Example ===\n');
}

runNotificationExample();
