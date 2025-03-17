/**
 * Examples of how to use both the class-based and functional implementations
 * of the Communication Facade
 */

// Import the class-based implementation
import { CommunicationFacade } from './facade.implementation.js';

// Import the functional implementation
import { createCommunicationFacade } from './facade.functional.js';

// Example using the class-based implementation
async function classBasedExample() {
  console.log('=========== CLASS-BASED IMPLEMENTATION EXAMPLE ===========');

  // Create a new instance of the facade
  const communicationService = new CommunicationFacade();

  // Example 1: Notify a user about a new message
  const notificationResult = await communicationService.notifyUser('user123', {
    title: 'New message received',
    body: 'You have a new message from John regarding your recent order.',
    data: {
      messageId: 'msg_12345',
      sender: 'john@example.com',
      priority: 'high',
    },
  });

  console.log('Notification Result:', notificationResult);

  // Example 2: Fetch and process external data
  const dataResult = await communicationService.processExternalData('user123', '/api/products', {
    category: 'electronics',
    limit: 10,
  });

  console.log('Data Processing Result:', dataResult);

  // Example 3: Submit user data to an external service
  const submissionResult = await communicationService.submitUserData('user123', '/api/orders', {
    items: [
      { id: 'prod_123', quantity: 2, price: 99.99 },
      { id: 'prod_456', quantity: 1, price: 49.99 },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
    },
    paymentMethod: 'credit_card',
  });

  console.log('Data Submission Result:', submissionResult);

  // Example 4: Update user notification preferences
  const preferencesResult = await communicationService.updateNotificationPreferences('user123', {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
  });

  console.log('Preferences Update Result:', preferencesResult);
}

// Example using the functional implementation
async function functionalExample() {
  console.log('\n=========== FUNCTIONAL IMPLEMENTATION EXAMPLE ===========');

  // Create a new instance of the facade
  const communicationService = createCommunicationFacade();

  // Example 1: Notify a user about a system alert
  const notificationResult = await communicationService.notifyUser(
    'user456',
    {
      title: 'System Maintenance',
      body: 'The system will be undergoing maintenance on Sunday, March 20 from 2-4 AM EST.',
      data: {
        maintenanceId: 'maint_789',
        severity: 'informational',
        affectedServices: ['messaging', 'billing'],
      },
    },
    ['email', 'push'] // Explicitly specify channels
  );

  console.log('Notification Result:', notificationResult);

  // Example 2: Fetch and process external data with potential error
  // Simulating an endpoint that might cause an error
  const dataResult = await communicationService.processExternalData(
    'user456',
    '/api/reports/sensitive',
    { timeframe: 'last_month' }
  );

  console.log('Data Processing Result:', dataResult);

  // Example 3: Submit user feedback
  const submissionResult = await communicationService.submitUserData('user456', '/api/feedback', {
    rating: 4,
    comment: 'Great service, but the interface could use some improvements.',
    categories: ['usability', 'design'],
    wouldRecommend: true,
  });

  console.log('Feedback Submission Result:', submissionResult);
}

// Example showing how to customize the functional implementation with dependency injection
async function customizedExample() {
  console.log('\n=========== CUSTOMIZED FUNCTIONAL IMPLEMENTATION ===========');

  // Create custom notification service with additional methods
  const customNotificationService = {
    sendEmail: (recipient, subject, body) => {
      console.log(`[CUSTOM] Sending enhanced email to ${recipient}`);
      return { messageId: `custom_${Date.now()}`, status: 'sent' };
    },

    sendSMS: (phoneNumber, message) => {
      console.log(`[CUSTOM] Sending enhanced SMS to ${phoneNumber}`);
      return { messageId: `custom_${Date.now()}`, status: 'sent' };
    },

    sendPushNotification: (userId, title, body, data = {}) => {
      console.log(`[CUSTOM] Sending enhanced push notification to ${userId}`);
      return { notificationId: `custom_${Date.now()}`, status: 'sent' };
    },

    // Additional custom method
    sendWebhookNotification: (webhookUrl, payload) => {
      console.log(`[CUSTOM] Sending webhook notification to ${webhookUrl}`);
      return { webhookId: `hook_${Date.now()}`, status: 'sent' };
    },
  };

  // Create the facade with the custom service
  const customFacade = createCommunicationFacade({
    notificationService: customNotificationService,
  });

  // Use the customized facade
  const notificationResult = await customFacade.notifyUser('user789', {
    title: 'Custom Notification',
    body: 'This is sent through our enhanced notification system.',
    data: { type: 'custom' },
  });

  console.log('Custom Notification Result:', notificationResult);
}

// Run all examples
async function runAllExamples() {
  try {
    await classBasedExample();
    await functionalExample();
    await customizedExample();

    console.log('\nAll examples completed successfully.');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

runAllExamples().catch(console.error);
