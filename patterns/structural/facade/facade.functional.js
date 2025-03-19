/**
 * MultiService Communication Facade - Functional Implementation
 *
 * This implementation provides the same functionality as the class-based version
 * but uses a functional approach with closures and function composition.
 */

const createNotificationService = () => {
  return {
    sendEmail: (recipient, subject, body) => {
      return {
        messageId: `email_${Date.now()}`,
        timestamp: new Date(),
        status: 'sent',
      };
    },

    sendSMS: (phoneNumber, message) => {
      return {
        messageId: `sms_${Date.now()}`,
        timestamp: new Date(),
        status: 'sent',
      };
    },

    sendPushNotification: (userId, title, body, data = {}) => {
      return {
        notificationId: `push_${Date.now()}`,
        timestamp: new Date(),
        status: 'sent',
      };
    },
  };
};

const createLoggingService = () => {
  return {
    logInfo: (module, message, metadata = {}) => {
      return {
        logId: `log_${Date.now()}`,
        level: 'info',
        timestamp: new Date(),
      };
    },

    logError: (module, error, metadata = {}) => {
      return {
        logId: `log_${Date.now()}`,
        level: 'error',
        timestamp: new Date(),
      };
    },

    logWarning: (module, message, metadata = {}) => {
      return {
        logId: `log_${Date.now()}`,
        level: 'warning',
        timestamp: new Date(),
      };
    },

    logAudit: (action, userId, details) => {
      return {
        auditId: `audit_${Date.now()}`,
        timestamp: new Date(),
      };
    },
  };
};

const createUserManagementService = () => {
  return {
    getUserProfile: (userId) => {
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
    },

    updateUserPreferences: (userId, preferences) => {
      return {
        id: userId,
        preferences,
        updated: true,
        timestamp: new Date(),
      };
    },

    validateUserPermissions: (userId, requiredPermissions) => {
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
    },
  };
};

const createExternalAPIService = () => {
  return {
    fetchData: async (endpoint, params = {}) => {
      // Simulating API call
      return {
        data: { success: true, results: [] },
        status: 200,
        timestamp: new Date(),
      };
    },

    postData: async (endpoint, data = {}) => {
      // Simulating API call
      return {
        data: { success: true, id: `res_${Date.now()}` },
        status: 201,
        timestamp: new Date(),
      };
    },

    handleAPIError: async (error) => {
      return {
        handled: true,
        retryable: error.status === 429 || error.status === 503,
        originalError: error,
      };
    },
  };
};

/**
 * Creates a Communication Facade - Functional Implementation
 * Provides a simplified interface to the complex subsystems
 */
const createCommunicationFacade = (options = {}) => {
  // Initialize services - allowing dependency injection
  const notificationService = options.notificationService || createNotificationService();
  const loggingService = options.loggingService || createLoggingService();
  const userService = options.userService || createUserManagementService();
  const apiService = options.apiService || createExternalAPIService();

  // Error type mapping
  const errorTypes = {
    NOTIFICATION_ERROR: 'notification_error',
    PERMISSION_ERROR: 'permission_error',
    API_ERROR: 'api_error',
    SYSTEM_ERROR: 'system_error',
    VALIDATION_ERROR: 'validation_error',
  };

  // Helper to map technical errors to user-friendly ones
  const mapError = (error, context = {}) => {
    loggingService.logError('CommunicationFacade', error, context);

    if (error.message?.includes('notification')) {
      return {
        type: errorTypes.NOTIFICATION_ERROR,
        message: 'Failed to send notification. Please try again later.',
        retryable: true,
        originalError: error,
      };
    } else if (error.message?.includes('permission') || error.code === 'PERMISSION_DENIED') {
      return {
        type: errorTypes.PERMISSION_ERROR,
        message: 'You do not have permission to perform this action.',
        retryable: false,
        originalError: error,
      };
    } else if (error.status >= 400 || error.message?.includes('api')) {
      return {
        type: errorTypes.API_ERROR,
        message: 'An error occurred while communicating with external service.',
        retryable: error.status === 429 || error.status === 503,
        originalError: error,
      };
    }

    return {
      type: errorTypes.SYSTEM_ERROR,
      message: 'An unexpected error occurred. Our team has been notified.',
      retryable: false,
      originalError: error,
    };
  };

  // Helper method to process API data
  const processApiData = (data) => {
    // In a real implementation, this would transform the data
    // For simplicity, we're just returning it as is
    return data;
  };

  // Helper to validate data before submission
  const validateData = (data) => {
    // Simple validation - in real implementation this would be more robust
    if (!data || Object.keys(data).length === 0) {
      throw {
        type: errorTypes.VALIDATION_ERROR,
        message: 'Data is required for submission',
      };
    }

    return true;
  };

  // Return the facade's public API
  return {
    /**
     * Notifies a user about an event via their preferred channels
     */
    notifyUser: async (userId, notification, channels = null) => {
      try {
        const userProfile = userService.getUserProfile(userId);
        const permissionCheck = userService.validateUserPermissions(userId, ['notify']);

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
              results.email = notificationService.sendEmail(
                userProfile.email,
                notification.title,
                notification.body
              );
              break;

            case 'sms':
              results.sms = notificationService.sendSMS(userProfile.phone, notification.body);
              break;

            case 'push':
              results.push = notificationService.sendPushNotification(
                userId,
                notification.title,
                notification.body,
                notification.data
              );
              break;
          }
        }

        loggingService.logAudit('notification_sent', userId, {
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
        const mappedError = mapError(error, { userId, notification });
        return {
          success: false,
          error: mappedError,
        };
      }
    },

    /**
     * Fetches data from external API and processes it for the user
     */
    processExternalData: async (userId, endpoint, params = {}) => {
      try {
        const permissionCheck = userService.validateUserPermissions(userId, ['read']);

        if (!permissionCheck.hasPermission) {
          throw {
            code: 'PERMISSION_DENIED',
            message: `Missing permissions: ${permissionCheck.missingPermissions.join(', ')}`,
          };
        }

        loggingService.logInfo(
          'ExternalDataRequest',
          `User ${userId} requesting data from ${endpoint}`,
          { params }
        );

        const apiResponse = await apiService.fetchData(endpoint, params);
        const processedData = processApiData(apiResponse.data);

        loggingService.logAudit('external_data_accessed', userId, {
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
        if (error.status >= 400) {
          await apiService.handleAPIError(error);
        }

        const mappedError = mapError(error, { userId, endpoint, params });

        return {
          success: false,
          error: mappedError,
        };
      }
    },

    /**
     * Submits data to an external API on behalf of a user
     */
    submitUserData: async (userId, endpoint, data = {}) => {
      try {
        const permissionCheck = userService.validateUserPermissions(userId, ['write']);

        if (!permissionCheck.hasPermission) {
          throw {
            code: 'PERMISSION_DENIED',
            message: `Missing permissions: ${permissionCheck.missingPermissions.join(', ')}`,
          };
        }

        validateData(data);

        const userProfile = userService.getUserProfile(userId);
        const enrichedData = {
          ...data,
          metadata: {
            submittedBy: userId,
            submitterName: userProfile.name,
            timestamp: new Date(),
          },
        };

        loggingService.logInfo(
          'ExternalDataSubmission',
          `User ${userId} submitting data to ${endpoint}`,
          { dataSize: JSON.stringify(enrichedData).length }
        );

        const apiResponse = await apiService.postData(endpoint, enrichedData);

        loggingService.logAudit('data_submitted', userId, {
          endpoint,
          status: apiResponse.status,
          resultId: apiResponse.data.id,
          timestamp: apiResponse.timestamp,
        });

        notificationService.sendEmail(
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
        if (error.status >= 400) {
          await apiService.handleAPIError(error);
        }

        const mappedError = mapError(error, {
          userId,
          endpoint,
          dataSize: JSON.stringify(data).length,
        });

        return {
          success: false,
          error: mappedError,
        };
      }
    },

    /**
     * Updates user notification preferences and notifies them of the change
     */
    updateNotificationPreferences: async (userId, preferences) => {
      try {
        const permissionCheck = userService.validateUserPermissions(userId, ['write']);

        if (!permissionCheck.hasPermission) {
          throw {
            code: 'PERMISSION_DENIED',
            message: `Missing permissions: ${permissionCheck.missingPermissions.join(', ')}`,
          };
        }

        const updateResult = userService.updateUserPreferences(userId, preferences);

        loggingService.logAudit('preferences_updated', userId, {
          newPreferences: preferences,
          timestamp: updateResult.timestamp,
        });

        const userProfile = userService.getUserProfile(userId);

        notificationService.sendEmail(
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
        const mappedError = mapError(error, { userId, preferences });
        return {
          success: false,
          error: mappedError,
        };
      }
    },
  };
};

export {
  createCommunicationFacade,
  createNotificationService,
  createLoggingService,
  createUserManagementService,
  createExternalAPIService,
};
