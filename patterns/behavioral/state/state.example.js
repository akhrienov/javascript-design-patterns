import { MusicPlayer } from './state.implementation.js';
import { createMusicPlayer } from './state.functional.js';

// Sample playlist
const samplePlaylist = [
  { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen', duration: 354 },
  { id: 2, title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: 482 },
  { id: 3, title: 'Hotel California', artist: 'Eagles', duration: 390 },
  { id: 4, title: "Sweet Child O' Mine", artist: "Guns N' Roses", duration: 356 },
];

// ===== Class-based implementation example =====
console.log('===== Class-based Music Player =====');

const player = new MusicPlayer(samplePlaylist);
console.log(`Current state: ${player.getCurrentState()}`);
console.log(`Current track: ${player.getCurrentTrack()?.title}`);

// Play the current track
player.play();
console.log(`Current state: ${player.getCurrentState()}`);

// Skip to next track
player.next();
console.log(`Current track: ${player.getCurrentTrack()?.title}`);

// Pause the player
player.pause();
console.log(`Current state: ${player.getCurrentState()}`);

// Resume playback
player.play();
console.log(`Current state: ${player.getCurrentState()}`);

// Stop the player
player.stop();
console.log(`Current state: ${player.getCurrentState()}`);

// Print state history
console.log('State history:');
console.log(player.getStateHistory());

// ===== Functional implementation example =====
console.log('\n===== Functional Music Player =====');

const functionalPlayer = createMusicPlayer(samplePlaylist);
console.log(`Current state: ${functionalPlayer.getCurrentState()}`);
console.log(`Current track: ${functionalPlayer.getCurrentTrack()?.title}`);

// Play the current track
functionalPlayer.play();
console.log(`Current state: ${functionalPlayer.getCurrentState()}`);

// Skip to previous track
functionalPlayer.previous();
console.log(`Current track: ${functionalPlayer.getCurrentTrack()?.title}`);

// Pause the player
functionalPlayer.pause();
console.log(`Current state: ${functionalPlayer.getCurrentState()}`);

// Try to pause again (should not work)
const pauseResult = functionalPlayer.pause();
console.log(`Tried to pause again, result: ${pauseResult}`);

// Stop the player
functionalPlayer.stop();
console.log(`Current state: ${functionalPlayer.getCurrentState()}`);

// Print state history
console.log('State history:');
console.log(functionalPlayer.getStateHistory());

// ===== Real-world usage: Smart Home Music System =====
console.log('\n===== Smart Home Music System Example =====');

// Example of how this could be used in a smart home system
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

  deactivateRoom(roomName) {
    if (!this.rooms.has(roomName)) {
      console.log(`Room ${roomName} doesn't exist`);
      return false;
    }

    const room = this.rooms.get(roomName);
    room.active = false;
    console.log(`Deactivated music in ${roomName}`);

    // Check if all rooms are inactive
    const allInactive = Array.from(this.rooms.values()).every((r) => !r.active);
    if (allInactive && this.player.getCurrentState() === 'PlayingState') {
      console.log('All rooms inactive, pausing music');
      this.player.pause();
    }

    return true;
  }

  setVolume(roomName, level) {
    if (!this.rooms.has(roomName)) {
      console.log(`Room ${roomName} doesn't exist`);
      return false;
    }

    if (level < 0 || level > 100) {
      console.log('Volume must be between 0 and 100');
      return false;
    }

    const room = this.rooms.get(roomName);
    room.volume = level;
    console.log(`Set ${roomName} volume to ${level}%`);
    return true;
  }

  // Delegate to music player
  loadPlaylist(playlist) {
    playlist.forEach((track) => this.player.addTrack(track));
    console.log(`Loaded ${playlist.length} tracks`);
  }

  playMusic() {
    const activeRooms = Array.from(this.rooms.entries())
      .filter(([_, room]) => room.active)
      .map(([name, _]) => name);

    if (activeRooms.length === 0) {
      console.log('No active rooms to play music in');
      return false;
    }

    const result = this.player.play();
    if (result) {
      console.log(`Playing music in: ${activeRooms.join(', ')}`);
    }
    return result;
  }

  pauseMusic() {
    return this.player.pause();
  }

  nextTrack() {
    return this.player.next();
  }

  previousTrack() {
    return this.player.previous();
  }

  getCurrentTrack() {
    return this.player.getCurrentTrack();
  }

  getActiveRooms() {
    return Array.from(this.rooms.entries())
      .filter(([_, room]) => room.active)
      .map(([name, room]) => ({ name, volume: room.volume }));
  }
}

// Demo the smart home music system
const smartHome = new SmartHomeMusicSystem();
smartHome.loadPlaylist(samplePlaylist);

// Add rooms
smartHome.addRoom('Living Room');
smartHome.addRoom('Kitchen');
smartHome.addRoom('Bedroom');

// Activate some rooms
smartHome.activateRoom('Living Room');
smartHome.activateRoom('Kitchen');

// Set volumes
smartHome.setVolume('Living Room', 70);
smartHome.setVolume('Kitchen', 40);

// Start playback
smartHome.playMusic();
console.log(`Now playing: ${smartHome.getCurrentTrack()?.title}`);

// Show active rooms
console.log('Active rooms:', smartHome.getActiveRooms());

// Skip to next track
smartHome.nextTrack();
console.log(`Now playing: ${smartHome.getCurrentTrack()?.title}`);

// Deactivate a room
smartHome.deactivateRoom('Kitchen');
console.log('Active rooms:', smartHome.getActiveRooms());

// Pause music
smartHome.pauseMusic();

// Try playing with no active rooms
smartHome.deactivateRoom('Living Room');
const playResult = smartHome.playMusic();
console.log(`Tried to play with no active rooms, result: ${playResult}`);
