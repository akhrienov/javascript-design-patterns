// Apply decorators using a helper function
export function applyDecorators(target, methodName, decorators) {
  const originalMethod = target[methodName];
  const descriptor = {
    value: originalMethod,
    writable: true,
    configurable: true,
  };

  // Apply each decorator in sequence
  const enhancedDescriptor = decorators.reduce(
    (desc, decorator) => decorator(target, methodName, desc),
    descriptor
  );

  // Apply the final descriptor
  Object.defineProperty(target, methodName, enhancedDescriptor);
}
