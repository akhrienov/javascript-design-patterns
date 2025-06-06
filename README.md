# JavaScript Design Patterns Repository

This project demonstrates implementations of the 23 **Gang of Four (GoF)** design patterns using **JavaScript**, specifically optimized for **JavaScript applications**. Developers can enhance their code quality, promote reusability, and build robust applications by understanding and applying these patterns.

**Design patterns** are time-tested solutions to recurring problems in software development. The **Gang of Four (GoF)**, consisting of **Erich Gamma**, **Richard Helm**, **Ralph Johnson**, and **John Vlissides**, introduced **23 fundamental design patterns** in their renowned book *"Design Patterns: Elements of Reusable Object-Oriented Software"*.

This repository provides **JavaScript examples** of these patterns, serving as a practical reference for developers.

## Design Pattern Categories

### Creational Design Patterns

Creational patterns focus on **object creation mechanisms**, enhancing flexibility and reuse in the instantiation process.

| Pattern Name                                                                                    | Description                                                                                                      |
|-------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| **[Singleton](./patterns/creational/singleton/singleton.implementation.js)**                    | Ensures a class has only one instance and provides a global access point.                                         |
| **[Factory Method](./patterns/creational/factory-method/factory-method.implementation.js)**     | Defines an interface for creating an object, but lets subclasses alter the type of object that will be created.  |
| **[Abstract Factory](./patterns/creational/abstract-factory/abstract-factory.implementation.js)** | Provides an interface for creating families of related or dependent objects without specifying their concrete classes. |
| **[Builder](./patterns/creational/builder/builder.implementation.js)**                                                                                     | Separates the construction of a complex object from its representation.                                           |
| **[Prototype](./patterns/creational/prototype/prototype.implementation.js)**                                                                                   | Creates new objects by copying an existing object (prototype).                                                   |

### Structural Design Patterns

Structural patterns **simplify the design** by identifying simple ways to **realize relationships between entities**.

| Pattern Name                                                                 | Description                                                                                                           |
|------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **[Adapter](./patterns/structural/adapter/adapter.implementation.js)**       | Allows objects with incompatible interfaces to collaborate.                                                           |
| **[Composite](./patterns/structural/composite/composite.implementation.js)** | Composes objects into tree structures to represent part-whole hierarchies.                                             |
| **[Proxy](./patterns/structural/proxy/proxy.implementation.js)**             | Provides a surrogate or placeholder for another object to control access to it.                                       |
| **[Flyweight](./patterns/structural/flyweight/flyweight.implementation.js)** | Minimizes memory usage by sharing common data across multiple objects.                                                 |
| **[Facade](./patterns/structural/facade/facade.implementation.js)**          | Provides a simplified interface to a larger and more complex body of code.                                             |
| **[Bridge](./patterns/structural/bridge/bridge.implementation.js)**          | Separates abstraction from implementation, allowing both to evolve independently.                                      |
| **[Decorator](./patterns/structural/decorator/decorator.implementation.js)**    | Dynamically adds behavior or responsibilities to an object without modifying its structure.                           |

### Behavioral Design Patterns

Behavioral patterns focus on **communication between objects**, promoting **loose coupling** and **flexibility**.

| Pattern Name                                                                                                           | Description                                                                                                 |
|------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| **[Template Method](./patterns/behavioral/template-method/template-method.implementation.js)**                         | Defines the program skeleton in a method, deferring some steps to subclasses.                                |
| **[Mediator](./patterns/behavioral/mediator/mediator.implementation.js)**                                              | Defines an object that centralizes communication between components.                                         |
| **[Chain of Responsibility](./patterns/behavioral/chain-of-responsibility/chain-of-responsibility.implementation.js)** | Passes a request along a chain of handlers until one handles it.                                             |
| **[Observer](./patterns/behavioral/observer/observer.implementation.js)**                                              | Defines a dependency between objects so that when one changes state, all dependents are notified.            |
| **[Strategy](./patterns/behavioral/strategy/strategy.implementation.js)**                                              | Defines a family of algorithms and lets the client choose which one to use at runtime.                      |
| **[Command](./patterns/behavioral/command/command.implementation.js)**                                                                                                            | Encapsulates a request as an object, allowing parameterization and queuing of requests.                     |
| **[State](./patterns/behavioral/state/state.implementation.js)**                                                                                                              | Allows an object to change its behavior when its internal state changes.                                     |
| **[Visitor](./patterns/behavioral/visitor/visitor.implementation.js)**                                                                                                            | Separates an algorithm from the objects it operates on.                                                     |
| **[Interpreter](./patterns/behavioral/interpreter/interpreter.implementation.js)**                                                                                                        | Defines a grammar and an interpreter to process that grammar.                                                |
| **[Iterator](./patterns/behavioral/iterator/iterator.implementation.js)**                                                                                                           | Provides a way to access elements of a collection sequentially without exposing the underlying representation.|
| **[Memento](./patterns/behavioral/memento/memento.implementation.js)**                                                                                                            | Captures an object’s state so it can be restored later without violating encapsulation.                    |

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/akhrienov/nodejs-design-patterns.git
   cd javascript-design-patterns
   ```

2. **Install Dependencies:**

   Ensure **Node.js** and **pnpm** is installed. This repository mainly uses vanilla JavaScript, so no additional packages are necessary.

   ```bash
   pnpm i
   ```

3. **Explore Patterns:**

   Each pattern is in a separate folder under `patterns/`.

   Example:

   ```bash
   cd patterns/creational/singleton
   node singleton.example.js
   ```

## License

This repository is licensed under the **MIT License**. See [LICENSE](LICENSE) for more details.

---

By mastering these patterns, you can **write clean, scalable, and maintainable JavaScript applications**. Happy coding!

