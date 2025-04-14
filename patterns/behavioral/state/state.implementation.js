// Abstract State class that defines the interface for all concrete states
class PlayerState {
  constructor(player) {
    this.player = player;
  }

  // Interface methods that concrete states must implement
  play() {
    throw new Error('Method not implemented in abstract class');
  }

  pause() {
    throw new Error('Method not implemented in abstract class');
  }

  stop() {
    throw new Error('Method not implemented in abstract class');
  }

  next() {
    throw new Error('Method not implemented in abstract class');
  }

  previous() {
    throw new Error('Method not implemented in abstract class');
  }

  getName() {
    return this.constructor.name;
  }
}

// Concrete States
class StoppedState extends PlayerState {
  play() {
    this.player.setState(new PlayingState(this.player));
    return true;
  }

  pause() {
    return false;
  }

  stop() {
    return false;
  }

  next() {
    this.player.currentTrackIndex =
      (this.player.currentTrackIndex + 1) % this.player.playlist.length;
    return true;
  }

  previous() {
    this.player.currentTrackIndex =
      (this.player.currentTrackIndex - 1 + this.player.playlist.length) %
      this.player.playlist.length;
    return true;
  }
}

class PlayingState extends PlayerState {
  play() {
    return false;
  }

  pause() {
    this.player.setState(new PausedState(this.player));
    return true;
  }

  stop() {
    this.player.setState(new StoppedState(this.player));
    this.player.currentPosition = 0;
    return true;
  }

  next() {
    this.player.currentTrackIndex =
      (this.player.currentTrackIndex + 1) % this.player.playlist.length;
    return true;
  }

  previous() {
    this.player.currentTrackIndex =
      (this.player.currentTrackIndex - 1 + this.player.playlist.length) %
      this.player.playlist.length;
    return true;
  }
}

class PausedState extends PlayerState {
  play() {
    this.player.setState(new PlayingState(this.player));
    return true;
  }

  pause() {
    return false;
  }

  stop() {
    this.player.setState(new StoppedState(this.player));
    this.player.currentPosition = 0;
    return true;
  }

  next() {
    this.player.currentTrackIndex =
      (this.player.currentTrackIndex + 1) % this.player.playlist.length;
    return true;
  }

  previous() {
    this.player.currentTrackIndex =
      (this.player.currentTrackIndex - 1 + this.player.playlist.length) %
      this.player.playlist.length;
    return true;
  }
}

// Context class - The Music Player
class MusicPlayer {
  constructor(playlist = []) {
    this.playlist = playlist;
    this.currentTrackIndex = 0;
    this.stateHistory = [];

    // Initialize with stopped state
    this.setState(new StoppedState(this));
  }

  setState(state) {
    this.currentState = state;

    // Log state transition for history
    this.stateHistory.push({
      state: state.getName(),
      track: this.getCurrentTrack()?.title || 'No track',
      timestamp: new Date().toISOString(),
    });

    return state.getName();
  }

  getCurrentTrack() {
    if (this.playlist.length === 0) {
      return null;
    }
    return this.playlist[this.currentTrackIndex];
  }

  addTrack(track) {
    this.playlist.push(track);
    return this.playlist.length;
  }

  // Delegate methods to the current state
  play() {
    return this.currentState.play();
  }

  pause() {
    return this.currentState.pause();
  }

  stop() {
    return this.currentState.stop();
  }

  next() {
    return this.currentState.next();
  }

  previous() {
    return this.currentState.previous();
  }

  getStateHistory() {
    return [...this.stateHistory];
  }

  getCurrentState() {
    return this.currentState.getName();
  }
}

export { MusicPlayer, PlayerState, StoppedState, PlayingState, PausedState };
