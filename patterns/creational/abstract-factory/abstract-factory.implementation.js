/**
 * Class-based approach to implement Abstract Factory pattern
 */
export class Button {
  render() {
    throw new Error('Button must implement render method');
  }

  onClick(callback) {
    throw new Error('Button must implement onClick method');
  }
}

export class Input {
  render() {
    throw new Error('Input must implement render method');
  }

  onInput(callback) {
    throw new Error('Input must implement onInput method');
  }
}

// Material Design Products
export class MaterialButton extends Button {
  constructor(label = 'Click me') {
    super();
    this.label = label;
  }

  render() {
    return {
      type: 'material-button',
      props: {
        label: this.label,
        styles: {
          backgroundColor: '#1976d2',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
        },
      },
    };
  }

  onClick(callback) {
    return {
      type: 'click',
      handler: callback,
    };
  }
}

export class MaterialInput extends Input {
  constructor(placeholder = '') {
    super();
    this.placeholder = placeholder;
  }

  render() {
    return {
      type: 'material-input',
      props: {
        placeholder: this.placeholder,
        styles: {
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #1976d2',
          outline: 'none',
          fontSize: '16px',
        },
      },
    };
  }

  onInput(callback) {
    return {
      type: 'input',
      handler: callback,
    };
  }
}

// iOS Style Products
export class IOSButton extends Button {
  constructor(label = 'Click me') {
    super();
    this.label = label;
  }

  render() {
    return {
      type: 'ios-button',
      props: {
        label: this.label,
        styles: {
          backgroundColor: '#007AFF',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          border: 'none',
          cursor: 'pointer',
        },
      },
    };
  }

  onClick(callback) {
    return {
      type: 'click',
      handler: callback,
    };
  }
}

export class IOSInput extends Input {
  constructor(placeholder = '') {
    super();
    this.placeholder = placeholder;
  }

  render() {
    return {
      type: 'ios-input',
      props: {
        placeholder: this.placeholder,
        styles: {
          padding: '10px',
          borderRadius: '10px',
          border: '1px solid #007AFF',
          outline: 'none',
          fontSize: '16px',
        },
      },
    };
  }

  onInput(callback) {
    return {
      type: 'input',
      handler: callback,
    };
  }
}

// Abstract Factory
export class UIFactory {
  createButton(label) {
    throw new Error('UIFactory must implement createButton method');
  }

  createInput(placeholder) {
    throw new Error('UIFactory must implement createInput method');
  }
}

// Concrete Factories
export class MaterialUIFactory extends UIFactory {
  createButton(label) {
    return new MaterialButton(label);
  }

  createInput(placeholder) {
    return new MaterialInput(placeholder);
  }
}

export class IOSUIFactory extends UIFactory {
  createButton(label) {
    return new IOSButton(label);
  }

  createInput(placeholder) {
    return new IOSInput(placeholder);
  }
}

/**
 * Function-based approach to implement Abstract Factory pattern
 */
export const createButton = (style, label = 'Click me') => {
  const styles = {
    material: {
      backgroundColor: '#1976d2',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
    },
    ios: {
      backgroundColor: '#007AFF',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
    },
  };

  return {
    render: () => ({
      type: `${style}-button`,
      props: {
        label,
        styles: styles[style],
      },
    }),
    onClick: (callback) => ({
      type: 'click',
      handler: callback,
    }),
  };
};

export const createInput = (style, placeholder = '') => {
  const styles = {
    material: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #1976d2',
      outline: 'none',
      fontSize: '16px',
    },
    ios: {
      padding: '10px',
      borderRadius: '10px',
      border: '1px solid #007AFF',
      outline: 'none',
      fontSize: '16px',
    },
  };

  return {
    render: () => ({
      type: `${style}-input`,
      props: {
        placeholder,
        styles: styles[style],
      },
    }),
    onInput: (callback) => ({
      type: 'input',
      handler: callback,
    }),
  };
};

export const createUIFactory = (style) => ({
  createButton: (label) => createButton(style, label),
  createInput: (placeholder) => createInput(style, placeholder),
});
