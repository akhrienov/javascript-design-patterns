import {
  createUIFactory,
  IOSUIFactory,
  MaterialUIFactory,
} from './abstract-factory.implementation.js';

// Class-based usage example
export const createClassBasedUI = (theme, config) => {
  const factory = theme === 'material' ? new MaterialUIFactory() : new IOSUIFactory();

  const button = factory.createButton(config.buttonLabel);
  const input = factory.createInput(config.inputPlaceholder);

  // Example of how to use the created components
  return {
    button: button.render(),
    buttonClick: button.onClick(() => console.log('Button clicked!')),
    input: input.render(),
    inputChange: input.onInput((value) => console.log('Input changed:', value)),
  };
};

// Functional approach usage example
export const createFunctionalUI = (theme, config) => {
  const factory = createUIFactory(theme === 'material' ? 'material' : 'ios');

  const button = factory.createButton(config.buttonLabel);
  const input = factory.createInput(config.inputPlaceholder);

  // Example of how to use the created components
  return {
    button: button.render(),
    buttonClick: button.onClick(() => console.log('Button clicked!')),
    input: input.render(),
    inputChange: input.onInput((value) => console.log('Input changed:', value)),
  };
};

// Example usage:
const config = {
  buttonLabel: 'Submit',
  inputPlaceholder: 'Enter your name',
};

// Using class-based implementation
console.log('Class-based Material UI:');
console.log(createClassBasedUI('material', config));

console.log('\nClass-based iOS UI:');
console.log(createClassBasedUI('ios', config));

// Using functional implementation
console.log('\nFunctional Material UI:');
console.log(createFunctionalUI('material', config));

console.log('\nFunctional iOS UI:');
console.log(createFunctionalUI('ios', config));
