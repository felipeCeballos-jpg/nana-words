// State Machine for audio player
export const STATES = {
  INIT: 'init',
  LOADING: 'loading',
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  ERROR: 'error',
};

export const playerState = {
  loaded: false,
  playing: false,
  mode: STATES.INIT,
  currentState: STATES.INIT,
};

export const stateMachine = {
  setState(newState) {
    if (this.isValidTransition(playerState.currentState, newState)) {
      const oldState = playerState.currentState;
      playerState.currentState = newState;
      playerState.mode = newState;
      console.log(`State transition: ${oldState} -> ${newState}`);
    } else {
      console.warn(
        `Invalid state transition: ${playerState.currentState} -> ${newState}`
      );
    }
  },

  isValidTransition(from, to) {
    const validTransitions = {
      [STATES.INIT]: [STATES.LOADING, STATES.ERROR],
      [STATES.LOADING]: [STATES.READY, STATES.ERROR],
      [STATES.READY]: [STATES.PLAYING, STATES.ERROR],
      [STATES.PLAYING]: [STATES.PAUSED, STATES.STOPPED, STATES.ERROR],
      [STATES.PAUSED]: [STATES.PLAYING, STATES.STOPPED, STATES.ERROR],
      [STATES.STOPPED]: [STATES.PLAYING, STATES.ERROR],
      [STATES.ERROR]: [STATES.INIT, STATES.LOADING],
    };

    return validTransitions[from]?.includes(to) || false;
  },
};
