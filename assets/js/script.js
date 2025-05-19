//import { initAudio } from './audio.js';
import { updateImages } from './image.js';
import {
  initLanguage,
  checkLoaded,
  getLanguage,
  setLanguage,
  resetAnimation,
} from './util.js';

const switchLanguageButton = document.getElementById('language-selector');
const html = document.querySelector('html');
/* const playButton = document.querySelector('.play-button');
const stopButton = document.querySelector('.stop-button');
const pauseButton = document.querySelector('.pause-button'); */

// Set media queries
const mqlMobile = window.matchMedia('(max-width: 800px)');
const mqlDefault = window.matchMedia('(min-width: 801px)');

// Set the loader element
const loader = document.querySelector('.loader');

// Set Language
/* html.lang = 'ru'; */
initLanguage(html);
//initAudio(stopButton, pauseButton);

function handleKeyDown(event) {
  if (event.code === 'Space') {
  }

  console.log(event.keyCode);
}

window.addEventListener('keydown', handleKeyDown);

const startLoadingTime = Date.now();
window.addEventListener('load', () => {
  checkLoaded(startLoadingTime, loader, true);
});

window.addEventListener('DOMContentLoaded', () => {
  updateDesign(mqlMobile.matches);

  booksAnimation();
});

switchLanguageButton.addEventListener('click', () => {
  loader.style.display = 'flex';

  // Change Language
  setLanguage(html);

  updateDesign(mqlMobile.matches).then((result) => {
    checkLoaded(result.timestamp, loader, true);
  });

  booksAnimation();
});

mqlMobile.addEventListener('change', (event) => {
  if (!event.matches) return;
  loader.style.display = 'flex';

  updateDesign(event.matches).then((result) => {
    checkLoaded(result.timestamp, loader);
  });

  booksAnimation();
});

mqlDefault.addEventListener('change', (event) => {
  if (!event.matches) return;
  loader.style.display = 'flex';

  updateDesign(event.matches).then((result) => {
    checkLoaded(result.timestamp, loader);
  });

  booksAnimation();
});

/* Update Design */
async function updateDesign(isMobile = false) {
  try {
    // Get current language
    const currentLanguage = getLanguage();

    const result = await updateImages(currentLanguage);

    if (!result.success) {
      console.warm(
        `Some images failed to load (${result.imagesLoaded}/${result.totalImages})`
      );
    }

    return result;
  } catch (error) {
    console.error('Failed to update images:', error);
    throw error;
  }
}

function booksAnimation() {
  resetAnimation([{ selector: '.menu', animationClass: 'menu-active' }]);

  const footer = document.querySelector('.section-navbook');
  const books = document.querySelector('.menu');
  const booksObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          books.classList.add('menu-active');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px',
      threshold: 0.6,
    }
  );

  booksObserver.observe(footer);
}
