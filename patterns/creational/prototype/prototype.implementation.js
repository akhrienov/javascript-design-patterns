/**
 * Deep clones an object including nested properties
 * @template T
 * @param {T} obj - The object to clone
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }

  const clonedObj = {};
  Object.keys(obj).forEach((key) => {
    clonedObj[key] = deepClone(obj[key]);
  });

  return clonedObj;
}

/**
 * Class-based implementation of the Document Template prototype
 */
export class DocumentPrototype {
  /**
   * @param template - The template object
   */
  constructor(template) {
    this.template = template;
  }

  /**
   * Creates a clone of the template
   */
  clone() {
    return deepClone(this.template);
  }

  /**
   * Creates a customized clone of the template
   * @param options - Custom options to override template values
   */
  customize(options) {
    const cloned = this.clone();
    return { ...cloned, ...options };
  }
}

/**
 * Function-based implementation of the Document Template prototype
 */
export function createDocumentPrototype(defaultTemplate) {
  return {
    /**
     * Creates a clone of the template
     */
    clone() {
      return deepClone(defaultTemplate);
    },

    /**
     * Creates a customized clone of the template
     * @param options - Custom options to override template values
     */
    customize(options) {
      return { ...this.clone(), ...options };
    },
  };
}

/**
 * Registry for managing multiple templates
 */
export class TemplateRegistry {
  constructor() {
    this.templates = new Map();
  }

  /**
   * Registers a new template
   * @param name - Template name
   * @param template - Template instance
   */
  register(name, template) {
    this.templates.set(name, template);
  }

  /**
   * Removes a template from the registry
   * @param name - Template name
   */
  unregister(name) {
    this.templates.delete(name);
  }

  /**
   * Retrieves a template from the registry
   * @param name - Template name
   */
  getTemplate(name) {
    const template = this.templates.get(name);

    if (!template) {
      throw new Error(`Template "${name}" not found!`);
    }

    return template;
  }

  /**
   * Creates a new document from a registered template
   * @param name - Template name
   * @param options - Custom options
   */
  createFromTemplate(name, options) {
    const template = this.getTemplate(name);
    return template.customize(options);
  }
}
