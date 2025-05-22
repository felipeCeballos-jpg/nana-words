// Simple responsive visualizer - no IIFEs, just clean functions
let visualizerBars = [];
let isAnimationRunning = false;
let currentSettings = null;

// Our responsive settings for different screen sizes
const responsiveSettings = {
  xsmallMobile: {
    barCount: 15,
    heightMultiplier: 70,
    barWidth: '4vmin',
    deviceType: 'xsmallMobile',
  },
  xsmallMobileLandScape: {
    barCount: 15,
    heightMultiplier: 60,
    barWidth: '1.5vmax',
    deviceType: 'xsmallMobile',
  },
  smallMobile: {
    barCount: 15,
    heightMultiplier: 80,
    barWidth: '4vmin',
    deviceType: 'smallMobile',
  },
  smallMobileLandScape: {
    barCount: 15,
    heightMultiplier: 80,
    barWidth: '5vmax',
    deviceType: 'smallMobileLandScape',
  },
  mobileLandScape: {
    barCount: 15,
    heightMultiplier: 150,
    barWidth: '4.5vmax',
    deviceType: 'mobileLandScape',
  },
  mobile: {
    barCount: 15,
    heightMultiplier: 110,
    barWidth: '4vmin',
    deviceType: 'mobile',
  },
  tablet: {
    barCount: 16,
    heightMultiplier: 110,
    barWidth: '6%',
    deviceType: 'tablet',
  },
  desktop: {
    barCount: 16,
    heightMultiplier: 150,
    barWidth: '6%',
    deviceType: 'desktop',
  },
};

const FREQUENCY_COUNT = 256;
export const playerState = {
  loaded: false,
  playing: false,
};
let audioContext = null;
let analyzer = null;
let frequencyData = null;
let source = null;

const playButton = document.querySelector('.play-button');
const stopButton = document.querySelector('.stop-button');
const pauseButton = document.querySelector('.pause-button');
const equalizerImg = document.querySelector('.equalizer-img');
const playIcon = document.querySelector('.play-icon');
export const player = new Audio();

export function initAudio() {
  // Initialize the responsive system when the page loads
  // This sets up our media queries and initial settings
  setupResponsiveQueries();
  loadSong();
}

function loadSong() {
  player.crossOrigin = 'anonymous';
  player.currentTime = 0; // Reset to start

  const songUrl =
    'https://raw.githubusercontent.com/1yumag/job-demo/main/f_75363e65a4009cb8.mp3';
  const songURL = "./assets/Nana's Words delok patefon FINAL.mp3";

  // Set source for audio element
  player.src = songURL;
  player.addEventListener('loadedmetadata', () => {
    console.log('Song loaded and ready to play');

    playerState.loaded = true;
    // Initialize Audio Context and Analyzer
    setupAudioContext();
  });
}

function setupAudioContext() {
  if (audioContext) return; // Already set up

  // Create Audio Context with cross-browser support
  if (typeof window.AudioContext !== 'undefined') {
    audioContext = new AudioContext();
  } else if (typeof webkitAudioContext !== 'undefined') {
    audioContext = new webkitAudioContext();
  } else {
    alert('Your browser does not support the Web Audio API');
    return;
  }

  // Create analyzer node
  analyzer = audioContext.createAnalyser();
  analyzer.fftSize = FREQUENCY_COUNT;
  frequencyData = new Uint8Array(analyzer.frequencyBinCount);

  // Create source from audio element
  source = audioContext.createMediaElementSource(player);

  // Connect the audio nodes
  source.connect(analyzer);
  analyzer.connect(audioContext.destination);

  // Set up visualization elements
}

// Set up our media queries using matchMedia
function setupResponsiveQueries() {
  const xsmallMobile = window.matchMedia('(max-width: 408px)');
  const smallMobile = window.matchMedia('(max-width: 514px)');
  const smallMobileLandScape = window.matchMedia(
    '(orientation: landscape) and (max-width: 514px)'
  );
  const mobileQuery = window.matchMedia(
    '(min-width: 515px) and (max-width: 800px)'
  );
  const mobileLandScape = window.matchMedia(
    '(orientation: landscape) and (min-width: 515px) and (max-width: 800px)'
  );
  const tabletQuery = window.matchMedia(
    '(min-width: 801px) and (max-width: 1120px)'
  );
  const desktopQuery = window.matchMedia('(min-width: 1121px)');

  // Function to update settings when screen size changes
  function updateSettings() {
    let newSettings;

    if (mobileQuery.matches) {
      if (mobileLandScape.matches) {
        newSettings = responsiveSettings.mobileLandScape;
      } else {
        newSettings = responsiveSettings.mobile;
      }
    } else if (xsmallMobile.matches) {
      newSettings = responsiveSettings.xsmallMobile;
    } else if (smallMobile.matches) {
      if (smallMobileLandScape.matches) {
        newSettings = responsiveSettings.smallMobileLandScape;
      } else {
        newSettings = responsiveSettings.smallMobile;
      }
    } else if (tabletQuery.matches) {
      newSettings = responsiveSettings.tablet;
    } else if (desktopQuery.matches) {
      newSettings = responsiveSettings.desktop;
    }

    console.log('xSmallMobile: ', newSettings);

    // Put the equalizer images here because it got more complicated if I create another logic for it
    if (mobileQuery.matches || smallMobile.matches || xsmallMobile.matches) {
      equalizerImg.src = './assets/eq_m.webp';
    } else {
      equalizerImg.src = './assets/eq.webp';
    }

    // Only rebuild if settings actually changed
    if (
      !currentSettings ||
      currentSettings.barCount !== newSettings.barCount ||
      currentSettings.barWidth !== newSettings.barWidth
    ) {
      currentSettings = newSettings;

      // Rebuild bars if the visualizer is active
      if (visualizerBars.length > 0) {
        createVisualizerBars();
      }
    } else {
      // If only height multiplier changed, just update that
      currentSettings = newSettings;
    }
  }

  // Set initial settings
  updateSettings();

  // Listen for changes to each media query
  // This is the key advantage of matchMedia - precise boundary detection
  smallMobile.addEventListener('change', updateSettings);
  smallMobileLandScape.addEventListener('change', updateSettings);
  mobileQuery.addEventListener('change', updateSettings);
  mobileLandScape.addEventListener('change', updateSettings);
  tabletQuery.addEventListener('change', updateSettings);
  desktopQuery.addEventListener('change', updateSettings);
}

// Create the visual bars based on current responsive settings
function createVisualizerBars() {
  const container = document.querySelector('#visualisation');

  if (!container) {
    console.error('Visualization container not found');
    return;
  }

  // Clear existing bars
  container.innerHTML = '';
  visualizerBars = [];

  // Use current responsive settings to determine bar configuration
  const settings = currentSettings;

  const spacing =
    (100 - settings.barCount * parseFloat(settings.barWidth)) /
    (settings.barCount + 1);
  // Create each bar with proper positioning
  for (let i = 0; i < settings.barCount; i++) {
    const bar = document.createElement('div');

    // Calculate position - evenly distribute across container
    const position = spacing + i * (parseFloat(settings.barWidth) + spacing);

    // Apply styles for this bar
    bar.style.width = settings.barWidth;
    bar.style.left = position + '%';
    bar.style.height = '0px';
    bar.style.background = 'url(./assets/x.webp) no-repeat';
    bar.style.backgroundSize = 'cover';

    container.appendChild(bar);
    visualizerBars.push(bar);
  }
}

// The animation loop - this is where the magic happens
function animateVisualizer() {
  if (!isAnimationRunning) {
    return; // Stop the animation if flag is set to false
  }

  // Schedule the next animation frame before doing the work
  // This ensures smooth animation even if our update takes time
  requestAnimationFrame(animateVisualizer);

  // Get fresh frequency data from the Web Audio API
  analyzer.getByteFrequencyData(frequencyData);
  // Update each bar based on the frequency data
  visualizerBars.forEach((bar, index) => {
    // Map bar index to frequency data index
    // We might have fewer bars than frequency data points
    const dataIndex = Math.floor(
      (index / visualizerBars.length) * frequencyData.length
    );
    const frequencyValue = frequencyData[index];

    // Convert frequency value (0-255) to pixel height
    const height = (currentSettings.heightMultiplier * frequencyValue) / 255;

    // Apply the height to the bar
    /* bar.style.height =
      currentSettings.heightMultiplier === 13 ? height + 'vmax' : height + 'px'; */
    bar.style.height = height + 'px';
  });
}

// Start the visualizer
export function startVisualizer() {
  // Make sure we have current responsive settings
  if (!currentSettings) {
    setupResponsiveQueries();
  }

  // Create bars if they don't exist
  if (visualizerBars.length === 0) {
    createVisualizerBars();
  }

  // Start the animation
  isAnimationRunning = true;
  animateVisualizer();

  console.log('Visualizer started');
}

// Stop the visualizer
export function stopVisualizer() {
  isAnimationRunning = false;
  console.log('Visualizer stopped');
}

// Reset the visualizer completely
export function resetVisualizer() {
  stopVisualizer();

  const container = document.querySelector('#visualisation');
  if (container) {
    container.innerHTML = '';
  }

  visualizerBars = [];
  console.log('Visualizer reset');
}

window.addEventListener('DOMContentLoaded', () => {
  initAudio();

  playButton.disabled = false;
  pauseButton.disabled = true;
  stopButton.disabled = true;
});

// Updated button handlers using the simplified approach
playButton.addEventListener('click', () => {
  // Resume audio context if suspended (browser security requirement)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }

  player
    .play()
    .then(() => {})
    .catch((error) => {
      console.error('Failed to play audio:', error);
      playerState.playing = false;
    });
});

stopButton.addEventListener('click', () => {
  player.pause();

  playButton.disabled = false;
  pauseButton.disabled = true;
  stopButton.disabled = true;

  player.currentTime = 0; // Reset to beginning
  playerState.playing = false;

  changeVisual([
    {
      selector: '.playing-img',
      animationClass: 'animation-playing-desactive',
      newAnimationClass: 'animation-playing-active',
    },
    {
      selector: '.playing-video',
      animationClass: 'animation-playing-active',
      newAnimationClass: 'animation-playing-desactive',
    },
    {
      selector: '.equalizer-img',
      animationClass: 'animation-playing-desactive',
      newAnimationClass: 'animation-playing-active',
    },
    {
      selector: '#visualisation',
      animationClass: 'animation-playing-active',
      newAnimationClass: 'animation-playing-desactive',
    },
  ]);

  playIcon.classList.remove('animation-active');

  // Reset the visualizer
  resetVisualizer();
});

pauseButton.addEventListener('click', () => {
  if (playerState.playing && playerState.loaded) {
    // Currently playing - pause everything
    player.pause();
  } else if (!playerState.playing && playerState.loaded) {
    // Currently paused - resume everything
    player.play();
  }
});

player.onplay = function () {
  if (!playerState.playing && playerState.loaded) {
    playerState.playing = true;

    // Start the visualizer with our simple function
    startVisualizer();

    changeVisual([
      {
        selector: '.playing-img',
        animationClass: 'animation-playing-active',
        newAnimationClass: 'animation-playing-desactive',
      },
      {
        selector: '.playing-video',
        animationClass: 'animation-playing-desactive',
        newAnimationClass: 'animation-playing-active',
      },
      {
        selector: '.equalizer-img',
        animationClass: 'animation-playing-active',
        newAnimationClass: 'animation-playing-desactive',
      },
      {
        selector: '#visualisation',
        animationClass: 'animation-playing-desactive',
        newAnimationClass: 'animation-playing-active',
      },
    ]);

    playIcon.classList.add('animation-active');

    playButton.disabled = true;
    pauseButton.disabled = false;
    stopButton.disabled = false;
  }
};

player.onpause = function () {
  if (playerState.playing && playerState.loaded) {
    playerState.playing = false;
    stopVisualizer();
  }

  changeVisual([
    {
      selector: '.playing-img',
      animationClass: 'animation-playing-desactive',
      newAnimationClass: 'animation-playing-active',
    },
    {
      selector: '.playing-video',
      animationClass: 'animation-playing-active',
      newAnimationClass: 'animation-playing-desactive',
    },
    {
      selector: '.equalizer-img',
      animationClass: 'animation-playing-desactive',
      newAnimationClass: 'animation-playing-active',
    },
    {
      selector: '#visualisation',
      animationClass: 'animation-playing-active',
      newAnimationClass: 'animation-playing-desactive',
    },
  ]);

  playIcon.classList.remove('animation-active');
  playButton.disabled = false;
  pauseButton.disabled = false;
  stopButton.disabled = false;
};

function changeVisual(elements) {
  if (elements.length === 0) return;
  elements.forEach(({ selector, animationClass, newAnimationClass }) => {
    const element = document.querySelector(selector);
    if (element.classList.contains(animationClass)) {
      element.classList.remove(animationClass);
      element.classList.add(newAnimationClass);
    }
  });
}
