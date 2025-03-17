/**
 * Unit tests for the Communication Facade implementations
 * Using Vitest for testing
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  CommunicationFacade,
  NotificationService,
  LoggingService,
  UserManagementService,
  ExternalAPIService,
} from './facade.implementation.js';
import {
  createCommunicationFacade,
  createNotificationService,
  createLoggingService,
  createUserManagementService,
  createExternalAPIService,
} from './facade.functional.js';

describe('CommunicationFacade - Class Implementation', () => {
  let mockNotificationService;
  let mockLoggingService;
  let mockUserService;
  let mockApiService;
  let facade;

  beforeEach(() => {
    mockNotificationService = new NotificationService();
    mockLoggingService = new LoggingService();
    mockUserService = new UserManagementService();
    mockApiService = new ExternalAPIService();

    vi.spyOn(mockNotificationService, 'sendEmail');
    vi.spyOn(mockNotificationService, 'sendPushNotification');
    vi.spyOn(mockLoggingService, 'logAudit');
    vi.spyOn(mockLoggingService, 'logError');
    vi.spyOn(mockUserService, 'getUserProfile');
    vi.spyOn(mockUserService, 'validateUserPermissions');
    vi.spyOn(mockApiService, 'fetchData');

    facade = new CommunicationFacade();

    facade.notificationService = mockNotificationService;
    facade.loggingService = mockLoggingService;
    facade.userService = mockUserService;
    facade.apiService = mockApiService;
  });

  describe('notifyUser', () => {
    it('should send notifications on user preferred channels', async () => {
      const userId = 'test-user-1';
      const notification = {
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { test: true },
      };

      mockUserService.getUserProfile.mockReturnValue({
        id: userId,
        email: 'test@example.com',
        phone: '123-456-7890',
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
        },
      });

      mockUserService.validateUserPermissions.mockReturnValue({
        userId,
        hasPermission: true,
        missingPermissions: [],
      });

      mockNotificationService.sendEmail.mockReturnValue({
        messageId: 'email-123',
        status: 'sent',
      });

      mockNotificationService.sendPushNotification.mockReturnValue({
        notificationId: 'push-123',
        status: 'sent',
      });

      const result = await facade.notifyUser(userId, notification);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(userId);
      expect(result.notifiedOn).toContain('email');
      expect(result.notifiedOn).toContain('push');
      expect(result.notifiedOn).not.toContain('sms');
      expect(mockUserService.getUserProfile).toHaveBeenCalledWith(userId);
      expect(mockUserService.validateUserPermissions).toHaveBeenCalledWith(userId, ['notify']);
      expect(mockNotificationService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        notification.title,
        notification.body
      );
      expect(mockNotificationService.sendPushNotification).toHaveBeenCalledWith(
        userId,
        notification.title,
        notification.body,
        notification.data
      );
      expect(mockLoggingService.logAudit).toHaveBeenCalled();
    });

    it('should respect explicitly provided channels', async () => {
      const userId = 'test-user-3';
      const notification = {
        title: 'Test Notification',
        body: 'This is a test notification',
      };
      const explicitChannels = ['email'];

      mockUserService.getUserProfile.mockReturnValue({
        id: userId,
        email: 'test@example.com',
        phone: '123-456-7890',
        preferences: {
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
        },
      });

      mockUserService.validateUserPermissions.mockReturnValue({
        userId,
        hasPermission: true,
        missingPermissions: [],
      });

      const result = await facade.notifyUser(userId, notification, explicitChannels);

      expect(result.success).toBe(true);
      expect(result.notifiedOn).toContain('email');
      expect(result.notifiedOn).not.toContain('sms');
      expect(result.notifiedOn).not.toContain('push');
      expect(mockNotificationService.sendEmail).toHaveBeenCalled();
      expect(mockNotificationService.sendPushNotification).not.toHaveBeenCalled();
    });
  });

  describe('processExternalData', () => {
    it('should fetch and process external data successfully', async () => {
      const userId = 'test-user-4';
      const endpoint = '/api/test-data';
      const params = { test: true };

      mockUserService.validateUserPermissions.mockReturnValue({
        userId,
        hasPermission: true,
        missingPermissions: [],
      });

      mockApiService.fetchData.mockResolvedValue({
        data: { results: [1, 2, 3] },
        status: 200,
        timestamp: new Date(),
      });

      const result = await facade.processExternalData(userId, endpoint, params);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ results: [1, 2, 3] });
      expect(mockUserService.validateUserPermissions).toHaveBeenCalledWith(userId, ['read']);
      expect(mockApiService.fetchData).toHaveBeenCalledWith(endpoint, params);
      expect(mockLoggingService.logAudit).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const userId = 'test-user-5';
      const endpoint = '/api/error-endpoint';

      mockUserService.validateUserPermissions.mockReturnValue({
        userId,
        hasPermission: true,
        missingPermissions: [],
      });

      mockApiService.fetchData.mockRejectedValue({
        status: 500,
        message: 'Internal Server Error',
      });

      const result = await facade.processExternalData(userId, endpoint);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe(facade.errorTypes.API_ERROR);
      expect(mockLoggingService.logError).toHaveBeenCalled();
    });
  });
});

describe('CommunicationFacade - Functional Implementation', () => {
  let mockNotificationService;
  let mockLoggingService;
  let mockUserService;
  let mockApiService;
  let facade;

  beforeEach(() => {
    mockNotificationService = createNotificationService();
    mockLoggingService = createLoggingService();
    mockUserService = createUserManagementService();
    mockApiService = createExternalAPIService();

    vi.spyOn(mockNotificationService, 'sendEmail');
    vi.spyOn(mockNotificationService, 'sendPushNotification');
    vi.spyOn(mockLoggingService, 'logAudit');
    vi.spyOn(mockLoggingService, 'logError');
    vi.spyOn(mockUserService, 'getUserProfile');
    vi.spyOn(mockUserService, 'validateUserPermissions');
    vi.spyOn(mockApiService, 'fetchData');

    facade = createCommunicationFacade({
      notificationService: mockNotificationService,
      loggingService: mockLoggingService,
      userService: mockUserService,
      apiService: mockApiService,
    });
  });

  describe('notifyUser', () => {
    it('should send notifications on user preferred channels', async () => {
      const userId = 'test-user-1';
      const notification = {
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { test: true },
      };

      mockUserService.getUserProfile.mockReturnValue({
        id: userId,
        email: 'test@example.com',
        phone: '123-456-7890',
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
        },
      });

      mockUserService.validateUserPermissions.mockReturnValue({
        userId,
        hasPermission: true,
        missingPermissions: [],
      });

      mockNotificationService.sendEmail.mockReturnValue({
        messageId: 'email-123',
        status: 'sent',
      });

      mockNotificationService.sendPushNotification.mockReturnValue({
        notificationId: 'push-123',
        status: 'sent',
      });

      const result = await facade.notifyUser(userId, notification);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(userId);
      expect(result.notifiedOn).toContain('email');
      expect(result.notifiedOn).toContain('push');
      expect(result.notifiedOn).not.toContain('sms');
      expect(mockUserService.getUserProfile).toHaveBeenCalledWith(userId);
      expect(mockUserService.validateUserPermissions).toHaveBeenCalledWith(userId, ['notify']);
      expect(mockNotificationService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        notification.title,
        notification.body
      );
      expect(mockNotificationService.sendPushNotification).toHaveBeenCalledWith(
        userId,
        notification.title,
        notification.body,
        notification.data
      );
      expect(mockLoggingService.logAudit).toHaveBeenCalled();
    });
  });
});

describe('CommunicationFacade - Customization', () => {
  it('should allow customizing services through dependency injection', () => {
    const customNotificationService = {
      sendEmail: vi.fn().mockReturnValue({ messageId: 'custom-email-id' }),
      sendSMS: vi.fn(),
      sendPushNotification: vi.fn(),
      sendWebhook: vi.fn().mockReturnValue({ webhookId: 'webhook-123' }),
    };

    const customFacade = createCommunicationFacade({
      notificationService: customNotificationService,
    });

    expect(customFacade).toBeDefined();

    customFacade.notifyUser('user-123', { title: 'Test', body: 'Test' }, ['email']);

    expect(customNotificationService.sendEmail).toHaveBeenCalled();
  });
});
