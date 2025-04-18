import { describe, expect, it, beforeEach, vi } from 'vitest';

import { MusicPlayer, PlayingState, PausedState, StoppedState } from './state.implementation.js';
import { createMusicPlayer } from './state.functional.js';

// Sample playlist for testing
const testPlaylist = [
  { id: 1, title: 'Test Song 1', artist: 'Test Artist 1', duration: 180 },
  { id: 2, title: 'Test Song 2', artist: 'Test Artist 2', duration: 240 },
  { id: 3, title: 'Test Song 3', artist: 'Test Artist 3', duration: 200 },
];

describe('Class-based Music Player', () => {
  let player;

  beforeEach(() => {
    player = new MusicPlayer(testPlaylist);
  });

  it('should initialize in stopped state', () => {
    expect(player.getCurrentState()).toBe('StoppedState');
  });

  it('should transition to playing state when play is called', () => {
    player.play();
    expect(player.getCurrentState()).toBe('PlayingState');
  });

  it('should transition to paused state when pause is called after play', () => {
    player.play();
    player.pause();
    expect(player.getCurrentState()).toBe('PausedState');
  });

  it('should not transition when trying to pause in stopped state', () => {
    const result = player.pause();

    expect(result).toBe(false);
    expect(player.getCurrentState()).toBe('StoppedState');
  });

  it('should track history of state transitions', () => {
    player.play();
    player.pause();
    player.play();
    player.stop();

    const history = player.getStateHistory();

    expect(history.length).toBe(5); // Initial state + 4 transitions
    expect(history[0].state).toBe('StoppedState'); // Initial state
    expect(history[1].state).toBe('PlayingState');
    expect(history[2].state).toBe('PausedState');
    expect(history[3].state).toBe('PlayingState');
    expect(history[4].state).toBe('StoppedState');
  });
});

describe('Functional Music Player', () => {
  let player;

  beforeEach(() => {
    player = createMusicPlayer(testPlaylist);
  });

  it('should initialize in stopped state', () => {
    expect(player.getCurrentState()).toBe('StoppedState');
  });

  it('should transition to playing state when play is called', () => {
    player.play();
    expect(player.getCurrentState()).toBe('PlayingState');
  });

  it('should transition to paused state when pause is called after play', () => {
    player.play();
    player.pause();
    expect(player.getCurrentState()).toBe('PausedState');
  });

  it('should not transition when trying to pause in stopped state', () => {
    const result = player.pause();

    expect(result).toBe(false);
    expect(player.getCurrentState()).toBe('StoppedState');
  });

  it('should track history of state transitions', () => {
    player.play();
    player.pause();
    player.play();
    player.stop();

    const history = player.getStateHistory();

    expect(history.length).toBe(5); // Initial state + 4 transitions
    expect(history[0].state).toBe('StoppedState'); // Initial state
    expect(history[1].state).toBe('PlayingState');
    expect(history[2].state).toBe('PausedState');
    expect(history[3].state).toBe('PlayingState');
    expect(history[4].state).toBe('StoppedState');
  });

  it('should navigate between tracks', () => {
    expect(player.getCurrentTrack().id).toBe(1);

    player.next();
    expect(player.getCurrentTrack().id).toBe(2);

    player.next();
    expect(player.getCurrentTrack().id).toBe(3);

    player.next();
    expect(player.getCurrentTrack().id).toBe(1); // Wraps around to first track

    player.previous();
    expect(player.getCurrentTrack().id).toBe(3); // Goes back to last track
  });

  it('should add new tracks to the playlist', () => {
    const newTrack = { id: 4, title: 'New Test Song', artist: 'New Artist', duration: 300 };
    const newLength = player.addTrack(newTrack);

    expect(newLength).toBe(4);

    // Navigate to the new track
    player.next();
    player.next();
    player.next();
    expect(player.getCurrentTrack().id).toBe(4);
  });
});
