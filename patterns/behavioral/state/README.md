# State Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the State Pattern in JavaScript, demonstrating both class-based and functional approaches. The implementation focuses on music player systems and smart home integration, showcasing practical applications in real-world scenarios.

## Overview

The State Pattern allows an object to alter its behavior when its internal state changes. The object will appear to change its class. This pattern encapsulates state-specific behavior into separate state classes and delegates behavior to the current state object. This implementation demonstrates how the pattern eliminates complex conditional logic and enables clean state transitions in stateful applications.

## Repository Structure

```
patterns/
└── behavioral/
    └── state/
        ├── README.md
        ├── state.implementation.js     # Class-based core implementation
        ├── state.functional.js         # Functional core implementation
        ├── state.example.js            # Usage examples and real-world application
        └── state.spec.js               # Test suite
```

## Features

- Two implementation approaches:
    - Class-based State Pattern using ES6 classes with inheritance
    - Functional approach using factory functions and closures for better encapsulation
- Music Player System:
    - Multiple state implementations (Stopped, Playing, Paused)
    - Clean state transitions with validation
    - Comprehensive state history tracking
    - Playlist management capabilities
- Smart Home Music System extension:
    - Multi-room audio control
    - State-aware room activation
    - Volume management per room
    - Intelligent auto-pause when all rooms are inactive
- Comprehensive test coverage with Vitest:
    - Core implementation testing
    - State transition validation
    - Integration testing with real-world scenarios
    - Testing both implementation approaches

## Implementation Details

### Class-based Approach

```javascript
// Abstract State class that defines the interface for all concrete states
class PlayerState {
  constructor(player) {
    this.player = player;
  }
  
  // Interface methods that concrete states must implement
  play() {
    throw new Error("Method not implemented in abstract class");
  }
  
  pause() {
    throw new Error("Method not implemented in abstract class");
  }
  
  stop() {
    throw new Error("Method not implemented in abstract class");
  }
  
  next() {
    throw new Error("Method not implemented in abstract class");
  }
  
  previous() {
    throw new Error("Method not implemented in abstract class");
  }
  
  getName() {
    return this.constructor.name;
  }
}

// Concrete States (examples)
class PlayingState extends PlayerState {
  play() {
    console.log("Already playing");
    return false;
  }
  
  pause() {
    console.log("Pausing playback");
    this.player.setState(new PausedState(this.player));
    return true;
  }
  
  // Additional methods...
}

// Context class - The Music Player
class MusicPlayer {
  constructor(playlist = []) {
    this.playlist = playlist;
    this.currentTrackIndex = 0;
    this.currentPosition = 0;
    this.stateHistory = [];
    
    // Initialize with stopped state
    this.setState(new StoppedState(this));
  }
  
  setState(state) {
    this.currentState = state;
    
    // Log state transition for history
    this.stateHistory.push({
      state: state.getName(),
      track: this.getCurrentTrack()?.title || "No track",
      timestamp: new Date().toISOString()
    });
    
    return state.getName();
  }
  
  // Delegate methods to the current state
  play() {
    return this.currentState.play();
  }
  
  // Additional methods...
}
```

### Functional Approach

```javascript
// Factory function to create the player (context)
const createMusicPlayer = (initialPlaylist = []) => {
  // Private state
  const playerData = {
    playlist: [...initialPlaylist],
    currentTrackIndex: 0,
    currentPosition: 0,
    stateHistory: []
  };
  
  // State management
  let currentState = null;
  
  const setState = (state) => {
    currentState = state;
    
    // Log state transition
    playerData.stateHistory.push({
      state: state.name,
      track: getCurrentTrack()?.title || "No track",
      timestamp: new Date().toISOString()
    });
    
    return state.name;
  };
  
  // Public API
  const player = {
    // Action methods delegate to current state
    play: () => currentState.play(),
    pause: () => currentState.pause(),
    // Additional methods...
    
    // Internal methods for state objects to use
    _setState: setState,
    _getPlayerData: () => playerData
  };
  
  // Initialize with stopped state
  setState(createStoppedState(player));
  
  return player;
};

// State factory functions
const createStoppedState = (player) => ({
  name: 'StoppedState',
  
  play: () => {
    console.log("Starting playback from the beginning");
    player._setState(createPlayingState(player));
    return true;
  },
  
  // Additional methods...
});

// Additional state factory functions...
```

## Real-World Example: Smart Home Music System

Our implementation includes a smart home music system that extends the music player to demonstrate the State Pattern in a real-world context. This system:

1. Controls music playback across multiple rooms
2. Manages room-specific volume levels
3. Automatically pauses playback when all rooms are inactive
4. Gracefully handles state transitions based on active rooms

### Smart Home Music System

```javascript
class SmartHomeMusicSystem {
  constructor() {
    this.player = new MusicPlayer();
    this.rooms = new Map(); // Map of rooms with active playback
    this.volume = 50; // Default volume (0-100)
  }
  
  addRoom(roomName) {
    this.rooms.set(roomName, { active: false, volume: this.volume });
    console.log(`Added room: ${roomName}`);
  }
  
  activateRoom(roomName) {
    if (!this.rooms.has(roomName)) {
      console.log(`Room ${roomName} doesn't exist`);
      return false;
    }
    
    const room = this.rooms.get(roomName);
    room.active = true;
    console.log(`Activated music in ${roomName}`);
    
    // Auto-play if player is in playing state
    if (this.player.getCurrentState() === 'PlayingState') {
      console.log(`Music is now playing in ${roomName}`);
    }
    
    return true;
  }
  
  // Additional methods for room management...
  
  // Delegate to music player
  playMusic() {
    const activeRooms = Array.from(this.rooms.entries())
      .filter(([_, room]) => room.active)
      .map(([name, _]) => name);
      
    if (activeRooms.length === 0) {
      console.log("No active rooms to play music in");
      return false;
    }
    
    const result = this.player.play();
    if (result) {
      console.log(`Playing music in: ${activeRooms.join(', ')}`);
    }
    return result;
  }
  
  // Additional methods...
}
```

## Usage Examples

### Class-based Approach

```javascript
// Create a music player with a playlist
const player = new MusicPlayer([
  { id: 1, title: "Bohemian Rhapsody", artist: "Queen", duration: 354 },
  { id: 2, title: "Stairway to Heaven", artist: "Led Zeppelin", duration: 482 },
  { id: 3, title: "Hotel California", artist: "Eagles", duration: 390 }
]);

// Initial state
console.log(`Current state: ${player.getCurrentState()}`); // StoppedState

// Play the current track
player.play();
console.log(`Current state: ${player.getCurrentState()}`); // PlayingState

// Skip to next track
player.next();
console.log(`Current track: ${player.getCurrentTrack().title}`); // Stairway to Heaven

// Pause the player
player.pause();
console.log(`Current state: ${player.getCurrentState()}`); // PausedState

// Check state history
console.log(player.getStateHistory());
```

### Functional Approach

```javascript
// Create a music player with a playlist
const functionalPlayer = createMusicPlayer([
  { id: 1, title: "Bohemian Rhapsody", artist: "Queen", duration: 354 },
  { id: 2, title: "Stairway to Heaven", artist: "Led Zeppelin", duration: 482 },
  { id: 3, title: "Hotel California", artist: "Eagles", duration: 390 }
]);

// Initial state
console.log(`Current state: ${functionalPlayer.getCurrentState()}`); // StoppedState

// Play the current track
functionalPlayer.play();
console.log(`Current state: ${functionalPlayer.getCurrentState()}`); // PlayingState

// Skip to previous track
functionalPlayer.previous();
console.log(`Current track: ${functionalPlayer.getCurrentTrack().title}`); // Hotel California

// Pause the player
functionalPlayer.pause();
console.log(`Current state: ${functionalPlayer.getCurrentState()}`); // PausedState
```

### Smart Home Music System

```javascript
// Create a smart home music system
const smartHome = new SmartHomeMusicSystem();

// Load a playlist
smartHome.loadPlaylist([
  { id: 1, title: "Bohemian Rhapsody", artist: "Queen", duration: 354 },
  { id: 2, title: "Stairway to Heaven", artist: "Led Zeppelin", duration: 482 },
  { id: 3, title: "Hotel California", artist: "Eagles", duration: 390 }
]);

// Set up rooms
smartHome.addRoom("Living Room");
smartHome.addRoom("Kitchen");
smartHome.addRoom("Bedroom");

// Activate some rooms
smartHome.activateRoom("Living Room");
smartHome.activateRoom("Kitchen");

// Set different volumes per room
smartHome.setVolume("Living Room", 70);
smartHome.setVolume("Kitchen", 40);

// Start playback
smartHome.playMusic();
console.log(`Now playing: ${smartHome.getCurrentTrack().title}`);

// Show active rooms
console.log("Active rooms:", smartHome.getActiveRooms());

// Deactivate all rooms (should pause playback)
smartHome.deactivateRoom("Living Room");
smartHome.deactivateRoom("Kitchen");
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
  pnpm test
```

Test suite covers:

- State initialization and transitions
- Action handling in different states
- State history tracking
- Playlist navigation functionality
- Smart home room management
- Volume control per room
- Auto-pause functionality
- Both class-based and functional implementations

## Key Considerations

1. **State Encapsulation**

    - Each state encapsulates its own behavior
    - State transitions are handled within states
    - States have access to context to trigger transitions
    - Clear interface for all states

2. **Context Management**

    - Context delegates behaviors to current state
    - Context manages state transitions
    - Context maintains history of state changes
    - Context provides public API independent of states

3. **State Transitions**

    - Validated transitions to prevent invalid state changes
    - Automatic tracking of transition history
    - Clean handoff between states
    - Return values indicating transition success

4. **Implementation Approaches**
    - Class-based for clear inheritance hierarchies
    - Functional for better encapsulation and immutability
    - Private state management techniques
    - Factory functions for cleaner creation patterns

## Practical Applications

The State Pattern is especially useful for:

- Media players (audio/video)
- Game development (character states, game states)
- User interface components with multiple states
- Workflow systems
- Document processing systems
- Network connection management
- Order processing systems
- Authentication flows

## When to Use State Pattern

The State Pattern is most beneficial when:

- An object's behavior depends on its state and must change at runtime
- Operations have large, multipart conditional statements that depend on state
- The same state transitions occur in multiple methods
- State transitions follow well-defined and limited paths
- You need to explicitly track and audit state changes

## When Not to Use State Pattern

Avoid using the State Pattern when:

- There are only a few states with minimal behavior differences
- State transitions are trivial or very limited
- The overhead of creating multiple state classes isn't justified
- Runtime state composition would be more flexible than state classes
- The object's state rarely changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the State Pattern as described in the Gang of Four's Design Patterns book
- Modernized for JavaScript using ES6+ features
- Enhanced with practical examples for music systems and smart home applications
- Built with clean architecture principles for maintainable, testable code

---

If you find this implementation helpful for understanding the State Pattern, please consider giving it a star!