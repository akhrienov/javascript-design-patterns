import { Mediator, Component } from './mediator.implementation.js';

/**
 * ChatRoom - A simple chat application using the Mediator pattern
 */

// User component representing a chat participant
class User extends Component {
  constructor(name) {
    super(name);
    this.messages = [];
  }

  // Send a message to the chat room
  sendMessage(message) {
    console.log(`${this.name} sends: ${message}`);

    // Notify the mediator about the new message
    this.notify('newMessage', {
      from: this.name,
      text: message,
      timestamp: new Date(),
    });

    return this;
  }

  // Send a direct message to another user
  sendDirectMessage(to, message) {
    console.log(`${this.name} sends DM to ${to}: ${message}`);

    // Send direct message through the mediator
    this.send(to, {
      type: 'directMessage',
      from: this.name,
      text: message,
      timestamp: new Date(),
    });

    return this;
  }

  // Handle receiving a message
  receive(message) {
    this.messages.push(message);

    if (message.type === 'directMessage') {
      console.log(`[DM] ${this.name} received from ${message.from}: ${message.text}`);
    } else {
      console.log(`${this.name} received: ${JSON.stringify(message)}`);
    }

    return this;
  }
}

// ChatBot component that automatically responds to certain messages
class ChatBot extends Component {
  constructor(name) {
    super(name);
    this.commands = new Map([
      ['help', 'Available commands: help, time, weather'],
      ['time', () => `Current time is ${new Date().toLocaleTimeString()}`],
      ['weather', "It's sunny today!"],
    ]);
  }

  // Handle incoming messages
  receive(message) {
    if (message.type === 'directMessage') this.processCommand(message);
    return this;
  }

  // Process command messages
  processCommand(message) {
    const command = message.text.toLowerCase().trim();

    if (this.commands.has(command)) {
      const response = this.commands.get(command);
      const responseText = typeof response === 'function' ? response() : response;

      setTimeout(() => {
        this.send(message.from, {
          type: 'directMessage',
          from: this.name,
          text: responseText,
          timestamp: new Date(),
        });
      }, 500);
    } else {
      this.send(message.from, {
        type: 'directMessage',
        from: this.name,
        text: `Unknown command: "${message.text}". Type "help" for available commands.`,
        timestamp: new Date(),
      });
    }
  }
}

// Logger component that records all messages
class Logger extends Component {
  constructor() {
    super('Logger');
    this.messageLog = [];
  }

  start() {
    this.on('newMessage', this.logMessage.bind(this));
    console.log('Logger started');
    return this;
  }

  logMessage(data) {
    this.messageLog.push({
      ...data,
      logged: new Date(),
    });

    console.log(`[LOG] Message from ${data.from}: ${data.text}`);
    return this;
  }

  getMessageHistory() {
    return [...this.messageLog];
  }
}

// Example usage
function runChatExample() {
  const chatMediator = new Mediator();
  const alice = new User('Alice');
  const bob = new User('Bob');
  const charlie = new User('Charlie');
  const chatBot = new ChatBot('ChatBot');
  const logger = new Logger();

  // Register all components with the mediator
  chatMediator.register(alice).register(bob).register(charlie).register(chatBot).register(logger);

  // Start the logger
  logger.start();

  // Simulate chat conversation
  console.log('\n=== Starting Chat Example ===\n');

  alice.sendMessage('Hello everyone!');
  bob.sendMessage('Hi Alice!');
  charlie.sendMessage('Hey all! How are you doing?');

  // Direct messages
  alice.sendDirectMessage('Bob', "How's your project going?");
  bob.sendDirectMessage('Alice', "It's going well, thanks for asking!");

  // ChatBot interactions
  alice.sendDirectMessage('ChatBot', 'help');
  bob.sendDirectMessage('ChatBot', 'time');
  charlie.sendDirectMessage('ChatBot', 'weather');

  // Wait and print message history
  setTimeout(() => {
    console.log('\n=== Message History ===\n');
    logger.getMessageHistory().forEach((message) => {
      console.log(`${message.timestamp.toLocaleTimeString()} - ${message.from}: ${message.text}`);
    });
    console.log('\n=== End of Chat Example ===\n');
  }, 2000);
}

runChatExample();
