// Factory function to create the player (context)
const createMusicPlayer = (initialPlaylist = []) => {
  // Private state
  const playerData = {
    playlist: [...initialPlaylist],
    currentTrackIndex: 0,
    currentPosition: 0,
    stateHistory: [],
  };

  // State management
  let currentState = null;

  const setState = (state) => {
    currentState = state;

    // Log state transition
    playerData.stateHistory.push({
      state: state.name,
      track: getCurrentTrack()?.title || 'No track',
      timestamp: new Date().toISOString(),
    });

    return state.name;
  };

  // Helper functions
  const getCurrentTrack = () => {
    if (playerData.playlist.length === 0) {
      return null;
    }
    return playerData.playlist[playerData.currentTrackIndex];
  };

  // Public API
  const player = {
    // Action methods delegate to current state
    play: () => currentState.play(),
    pause: () => currentState.pause(),
    stop: () => currentState.stop(),
    next: () => currentState.next(),
    previous: () => currentState.previous(),

    // Player management methods
    addTrack: (track) => {
      playerData.playlist.push(track);
      return playerData.playlist.length;
    },
    getCurrentTrack,
    getStateHistory: () => [...playerData.stateHistory],
    getCurrentState: () => currentState.name,

    // Internal methods for state objects to use
    _setState: setState,
    _getPlayerData: () => playerData, // Allows states to access player data
  };

  // Initialize with stopped state
  setState(createStoppedState(player));

  return player;
};

// State factory functions
const createStoppedState = (player) => ({
  name: 'StoppedState',

  play: () => {
    player._setState(createPlayingState(player));
    return true;
  },

  pause: () => {
    return false;
  },

  stop: () => {
    return false;
  },

  next: () => {
    const data = player._getPlayerData();
    data.currentTrackIndex = (data.currentTrackIndex + 1) % data.playlist.length;
    return true;
  },

  previous: () => {
    const data = player._getPlayerData();
    data.currentTrackIndex =
      (data.currentTrackIndex - 1 + data.playlist.length) % data.playlist.length;
    return true;
  },
});

const createPlayingState = (player) => ({
  name: 'PlayingState',

  play: () => {
    return false;
  },

  pause: () => {
    player._setState(createPausedState(player));
    return true;
  },

  stop: () => {
    const data = player._getPlayerData();
    data.currentPosition = 0;
    player._setState(createStoppedState(player));
    return true;
  },

  next: () => {
    const data = player._getPlayerData();
    data.currentTrackIndex = (data.currentTrackIndex + 1) % data.playlist.length;
    return true;
  },

  previous: () => {
    const data = player._getPlayerData();
    data.currentTrackIndex =
      (data.currentTrackIndex - 1 + data.playlist.length) % data.playlist.length;
    return true;
  },
});

const createPausedState = (player) => ({
  name: 'PausedState',

  play: () => {
    player._setState(createPlayingState(player));
    return true;
  },

  pause: () => {
    return false;
  },

  stop: () => {
    const data = player._getPlayerData();
    data.currentPosition = 0;
    player._setState(createStoppedState(player));
    return true;
  },

  next: () => {
    const data = player._getPlayerData();
    data.currentTrackIndex = (data.currentTrackIndex + 1) % data.playlist.length;
    return true;
  },

  previous: () => {
    const data = player._getPlayerData();
    data.currentTrackIndex =
      (data.currentTrackIndex - 1 + data.playlist.length) % data.playlist.length;
    return true;
  },
});

export { createMusicPlayer, createStoppedState, createPlayingState, createPausedState };
