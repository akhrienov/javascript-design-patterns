/**
 * MultiService Communication Facade
 *
 * This implementation provides a unified interface for handling communication
 * across multiple services: notification system, logging service,
 * user management, and external API integration.
 *
 * The facade simplifies complex inter-service communication by providing
 * a clean API that orchestrates all the underlying operations.
 */

class NotificationService {
  sendEmail(recipient, subject, body) {
    return {
      messageId: `email_${Date.now()}`,
      timestamp: new Date(),
      status: 'sent',
    };
  }

  sendSMS(phoneNumber, message) {
    return {
      messageId: `sms_${Date.now()}`,
      timestamp: new Date(),
      status: 'sent',
    };
  }

  sendPushNotification(userId, title, body, data = {}) {
    return {
      notificationId: `push_${Date.now()}`,
      timestamp: new Date(),
      status: 'sent',
    };
  }
}

class LoggingService {
  logInfo(module, message, metadata = {}) {
    return {
      logId: `log_${Date.now()}`,
      level: 'info',
      timestamp: new Date(),
    };
  }

  logError(module, error, metadata = {}) {
    return {
      logId: `log_${Date.now()}`,
      level: 'error',
      timestamp: new Date(),
    };
  }

  logWarning(module, message, metadata = {}) {
    return {
      logId: `log_${Date.now()}`,
      level: 'warning',
      timestamp: new Date(),
    };
  }

  logAudit(action, userId, details) {
    return {
      auditId: `audit_${Date.now()}`,
      timestamp: new Date(),
    };
  }
}

class UserManagementService {
  getUserProfile(userId) {
    // Simulating database query
    return {
      id: userId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
      },
    };
  }

  updateUserPreferences(userId, preferences) {
    return {
      id: userId,
      preferences,
      updated: true,
      timestamp: new Date(),
    };
  }

  validateUserPermissions(userId, requiredPermissions) {
    // Simulating permission check
    const userPermissions = ['read', 'write', 'notify'];

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    return {
      userId,
      hasPermission: hasAllPermissions,
      missingPermissions: hasAllPermissions
        ? []
        : requiredPermissions.filter((p) => !userPermissions.includes(p)),
    };
  }
}

class ExternalAPIService {
  async fetchData(endpoint, params = {}) {
    // Simulating API call
    return {
      data: { success: true, results: [] },
      status: 200,
      timestamp: new Date(),
    };
  }

  async postData(endpoint, data = {}) {
    // Simulating API call
    return {
      data: { success: true, id: `res_${Date.now()}` },
      status: 201,
      timestamp: new Date(),
    };
  }

  async handleAPIError(error) {
    return {
      handled: true,
      retryable: error.status === 429 || error.status === 503,
      originalError: error,
    };
  }
}

/**
 * Communication Facade - Class-based implementation
 * Provides a simplified interface to the complex subsystems
 */
class CommunicationFacade {
  constructor() {
    this.notificationService = new NotificationService();
    this.loggingService = new LoggingService();
    this.userService = new UserManagementService();
    this.apiService = new ExternalAPIService();

    // Error type mapping
    this.errorTypes = {
      NOTIFICATION_ERROR: 'notification_error',
      PERMISSION_ERROR: 'permission_error',
      API_ERROR: 'api_error',
      SYSTEM_ERROR: 'system_error',
      VALIDATION_ERROR: 'validation_error',
    };
  }

  // Helper to map technical errors to user-friendly ones
  _mapError(error, context = {}) {
    this.loggingService.logError('CommunicationFacade', error, context);

    if (error.message?.includes('notification')) {
      return {
        type: this.errorTypes.NOTIFICATION_ERROR,
        message: 'Failed to send notification. Please try again later.',
        retryable: true,
        originalError: error,
      };
    } else if (error.message?.includes('permission') || error.code === 'PERMISSION_DENIED') {
      return {
        type: this.errorTypes.PERMISSION_ERROR,
        message: 'You do not have permission to perform this action.',
        retryable: false,
        originalError: error,
      };
    } else if (error.status >= 400 || error.message?.includes('api')) {
      return {
        type: this.errorTypes.API_ERROR,
        message: 'An error occurred while communicating with external service.',
        retryable: error.status === 429 || error.status === 503,
        originalError: error,
      };
    }

    // Default case
    return {
      type: this.errorTypes.SYSTEM_ERROR,
      message: 'An unexpected error occurred. Our team has been notified.',
      retryable: false,
      originalError: error,
    };
  }

  /**
   * Notifies a user about an event via their preferred channels
   */
  async notifyUser(userId, notification, channels = null) {
    try {
      const userProfile = this.userService.getUserProfile(userId);
      const permissionCheck = this.userService.validateUserPermissions(userId, ['notify']);

      if (!permissionCheck.hasPermission)
        throw new Error('User does not have notification permission');

      const notificationChannels =
        channels ||
        Object.entries(userProfile.preferences)
          .filter(([key, enabled]) => enabled && key.endsWith('Notifications'))
          .map(([key]) => key.replace('Notifications', '').toLowerCase());

      const results = {};

      for (const channel of notificationChannels) {
        switch (channel) {
          case 'email':
            results.email = this.notificationService.sendEmail(
              userProfile.email,
              notification.title,
              notification.body
            );
            break;

          case 'sms':
            results.sms = this.notificationService.sendSMS(userProfile.phone, notification.body);
            break;

          case 'push':
            results.push = this.notificationService.sendPushNotification(
              userId,
              notification.title,
              notification.body,
              notification.data
            );
            break;
        }
      }

      this.loggingService.logAudit('notification_sent', userId, {
        channels: notificationChannels,
        notificationId:
          Object.values(results)[0]?.messageId || Object.values(results)[0]?.notificationId,
      });

      return {
        success: true,
        userId,
        notifiedOn: Object.keys(results),
        timestamp: new Date(),
      };
    } catch (error) {
      const mappedError = this._mapError(error, { userId, notification });

      return {
        success: false,
        error: mappedError,
      };
    }
  }

  /**
   * Fetches data from external API and processes it for the user
   */
  async processExternalData(userId, endpoint, params = {}) {
    try {
      const permissionCheck = this.userService.validateUserPermissions(userId, ['read']);

      if (!permissionCheck.hasPermission) {
        throw {
          code: 'PERMISSION_DENIED',
          message: `Missing permissions: ${permissionCheck.missingPermissions.join(', ')}`,
        };
      }

      this.loggingService.logInfo(
        'ExternalDataRequest',
        `User ${userId} requesting data from ${endpoint}`,
        { params }
      );

      const apiResponse = await this.apiService.fetchData(endpoint, params);
      const processedData = this._processApiData(apiResponse.data);

      this.loggingService.logAudit('external_data_accessed', userId, {
        endpoint,
        status: apiResponse.status,
        timestamp: apiResponse.timestamp,
      });

      return {
        success: true,
        data: processedData,
        timestamp: new Date(),
      };
    } catch (error) {
      if (error.status >= 400) await this.apiService.handleAPIError(error);

      const mappedError = this._mapError(error, { userId, endpoint, params });

      return {
        success: false,
        error: mappedError,
      };
    }
  }

  /**
   * Helper method to transform API data
   * @private
   */
  _processApiData(data) {
    // In a real implementation, this would transform the data
    // For simplicity, we're just returning it as is
    return data;
  }

  /**
   * Submits data to an external API on behalf of a user
   */
  async submitUserData(userId, endpoint, data = {}) {
    try {
      const permissionCheck = this.userService.validateUserPermissions(userId, ['write']);

      if (!permissionCheck.hasPermission) {
        throw {
          code: 'PERMISSION_DENIED',
          message: `Missing permissions: ${permissionCheck.missingPermissions.join(', ')}`,
        };
      }

      this._validateData(data);

      const userProfile = this.userService.getUserProfile(userId);
      const enrichedData = {
        ...data,
        metadata: {
          submittedBy: userId,
          submitterName: userProfile.name,
          timestamp: new Date(),
        },
      };

      this.loggingService.logInfo(
        'ExternalDataSubmission',
        `User ${userId} submitting data to ${endpoint}`,
        { dataSize: JSON.stringify(enrichedData).length }
      );

      const apiResponse = await this.apiService.postData(endpoint, enrichedData);

      this.loggingService.logAudit('data_submitted', userId, {
        endpoint,
        status: apiResponse.status,
        resultId: apiResponse.data.id,
        timestamp: apiResponse.timestamp,
      });

      this.notificationService.sendEmail(
        userProfile.email,
        'Data Submission Successful',
        `Your data was successfully submitted to ${endpoint}.`
      );

      return {
        success: true,
        submissionId: apiResponse.data.id,
        timestamp: new Date(),
      };
    } catch (error) {
      if (error.status >= 400) await this.apiService.handleAPIError(error);

      const mappedError = this._mapError(error, {
        userId,
        endpoint,
        dataSize: JSON.stringify(data).length,
      });

      return {
        success: false,
        error: mappedError,
      };
    }
  }

  /**
   * Validates data before submission
   * @private
   */
  _validateData(data) {
    // Simple validation - in real implementation this would be more robust
    if (!data || Object.keys(data).length === 0) {
      throw {
        type: this.errorTypes.VALIDATION_ERROR,
        message: 'Data is required for submission',
      };
    }

    return true;
  }

  /**
   * Updates user notification preferences and notifies them of the change
   */
  async updateNotificationPreferences(userId, preferences) {
    try {
      const permissionCheck = this.userService.validateUserPermissions(userId, ['write']);

      if (!permissionCheck.hasPermission) {
        throw {
          code: 'PERMISSION_DENIED',
          message: `Missing permissions: ${permissionCheck.missingPermissions.join(', ')}`,
        };
      }

      const updateResult = this.userService.updateUserPreferences(userId, preferences);

      this.loggingService.logAudit('preferences_updated', userId, {
        newPreferences: preferences,
        timestamp: updateResult.timestamp,
      });

      const userProfile = this.userService.getUserProfile(userId);

      this.notificationService.sendEmail(
        userProfile.email,
        'Notification Preferences Updated',
        'Your notification preferences have been successfully updated.'
      );

      return {
        success: true,
        userId,
        preferencesUpdated: true,
        timestamp: updateResult.timestamp,
      };
    } catch (error) {
      const mappedError = this._mapError(error, { userId, preferences });
      return {
        success: false,
        error: mappedError,
      };
    }
  }
}

export {
  CommunicationFacade,
  NotificationService,
  LoggingService,
  UserManagementService,
  ExternalAPIService,
};
