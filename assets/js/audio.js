// Simple responsive visualizer - no IIFEs, just clean functions
let visualizerBars = [];
let isAnimationRunning = false;
let currentSettings = null;

// Our responsive settings for different screen sizes
const responsiveSettings = {
  xsmallMobile: {
    barCount: 14,
    heightMultiplier: 70,
    barWidth: '6%',
    deviceType: 'xsmallMobile',
  },
  smallMobile: {
    barCount: 16,
    heightMultiplier: 90,
    barWidth: '7%',
    deviceType: 'smallMobile',
  },
  mobile: {
    barCount: 16,
    heightMultiplier: 130,
    barWidth: '6.5%',
    deviceType: 'mobile',
  },
  tablet: {
    barCount: 16,
    heightMultiplier: 152,
    barWidth: '7.4%',
    deviceType: 'tablet',
  },
  desktop: {
    barCount: 16,
    heightMultiplier: 210,
    barWidth: '8.4%',
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
  const xsmallMobile = window.matchMedia('(max.width: 390px)');
  const smallMobile = window.matchMedia('(max-width: 514px)');
  const mobileQuery = window.matchMedia(
    '(min-width: 515px) and (max-width: 800px)'
  );
  const tabletQuery = window.matchMedia(
    '(min-width: 801px) and (max-width: 1120px)'
  );
  const desktopQuery = window.matchMedia('(min-width: 1121px)');

  // Function to update settings when screen size changes
  function updateSettings() {
    let newSettings;

    if (mobileQuery.matches) {
      newSettings = responsiveSettings.mobile;
    } else if (smallMobile.matches) {
      newSettings = responsiveSettings.smallMobile;
    } else if (xsmallMobile.matches) {
      newSettings = responsiveSettings.xsmallMobile;
    } else if (tabletQuery.matches) {
      newSettings = responsiveSettings.tablet;
    } else if (desktopQuery.matches) {
      newSettings = responsiveSettings.desktop;
    }

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
  mobileQuery.addEventListener('change', updateSettings);
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

  // Use current responsive settings
  const settings = currentSettings;
  const spacing =
    (100 - settings.barCount * parseFloat(settings.barWidth)) /
    (settings.barCount + 1);

  // Create each visualization element
  for (let i = 0; i < settings.barCount; i++) {
    // Create container for each visualization element
    const barContainer = document.createElement('div');
    const position = spacing + i * (parseFloat(settings.barWidth) + spacing);

    // Style the container
    barContainer.style.position = 'absolute';
    barContainer.style.width = settings.barWidth;
    barContainer.style.left = position + '%';
    barContainer.style.bottom = '0';
    barContainer.style.height = '0'; // Initial height
    barContainer.style.overflow = 'visible'; // Allow overflow to show the leaf/stem at all times

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.position = 'absolute';
    svg.style.bottom = '0px';

    // The key part - create a group for our elements
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    //group.setAttribute('transform', 'translate(0,543) scale(0.1,-0.1)');
    let color =
      settings.deviceType === 'mobile' || settings.deviceType === 'smallMobile'
        ? '#EF5757'
        : '#F38585';
    group.setAttribute('fill', color);
    group.setAttribute('stroke', 'none');

    // Then, create the leaf shape at the top of the stem
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      `M495 4957 c-51 -40 -180 -169 -225 -224 -37 -45 -140 -236 -140 -259
0 -8 -4 -14 -10 -14 -5 0 -10 -8 -10 -19 0 -10 -7 -41 -15 -67 -30 -96 -42
-270 -28 -406 6 -68 16 -136 22 -153 5 -16 12 -45 16 -64 9 -41 114 -250 152
-300 24 -32 55 -67 128 -145 11 -12 36 -33 55 -48 l35 -27 0 -1403 c0 -772 3
-1416 7 -1433 4 -16 9 -100 13 -185 3 -85 10 -159 16 -165 5 -5 9 -17 9 -27 0
-10 7 -18 15 -18 8 0 15 6 15 13 0 6 6 55 14 107 8 52 19 149 26 215 6 66 15
145 20 176 6 33 10 579 10 1382 l0 1328 90 89 c89 90 183 220 227 316 29 64
70 199 84 279 6 33 13 73 16 88 10 54 -62 93 -115 62 -26 -16 -29 -25 -39 -99
-15 -114 -28 -157 -79 -265 -44 -92 -83 -154 -134 -213 -53 -61 -52 -68 -49
443 l4 471 -24 19 c-28 23 -74 25 -95 3 -14 -13 -16 -67 -18 -417 -3 -586 -1
-552 -23 -552 -19 0 -116 123 -157 200 -35 66 -78 196 -85 258 -3 32 -10 60
-14 63 -12 7 -12 231 0 238 4 3 11 31 15 63 7 62 45 183 79 248 45 89 219 295
248 295 5 0 50 -46 101 -103 96 -107 191 -253 223 -342 9 -27 21 -59 25 -70 8
-20 22 -71 42 -153 18 -79 29 -31 25 109 -6 216 -42 330 -151 489 -52 76 -242
251 -272 250 -5 -1 -27 -15 -49 -33z`
    );

    // Add elements to the group
    group.appendChild(path);

    // Add the group to the SVG
    svg.appendChild(group);

    // Add the SVG to the container
    barContainer.appendChild(svg);
    container.appendChild(barContainer);

    // Store for animation
    visualizerBars.push({
      container: barContainer,
      svg: svg,
      group: group,
    });
  }
}

// Update the animation function
function animateVisualizer() {
  if (!isAnimationRunning) {
    return;
  }

  requestAnimationFrame(animateVisualizer);
  analyzer.getByteFrequencyData(frequencyData);

  visualizerBars.forEach((bar, index) => {
    const dataIndex = Math.floor(
      (index / visualizerBars.length) * frequencyData.length
    );
    const frequencyValue = frequencyData[index];

    // Calculate height with minimum height to ensure stem is always visible
    const minHeight = 20; // Minimum stem height
    const heightPercentage = frequencyValue / 255;
    const height =
      minHeight + heightPercentage * currentSettings.heightMultiplier;

    // Update container height
    bar.container.style.height = height + 'px';

    // Update SVG viewBox to maintain proportion
    bar.svg.setAttribute('viewBox', `0 0 130 ${height}`);

    bar.group.setAttribute('transform', `translate(27,500) scale(0.1,-0.1)`);
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
