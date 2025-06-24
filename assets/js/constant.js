export const INITIAL_LANGUAGE = 'ru';

export const footerRuTranslateImgs = [
  './assets/navbook/main_ru.webp',
  './assets/navbook/milestones_ru.webp',
  './assets/navbook/stories_ru.webp',
  './assets/navbook/gallery_ru.webp',
  './assets/navbook/my_granny_ru.webp',
  './assets/navbook/remember_ru.webp',
  './assets/navbook/map_ru.webp',
];

export const footerEnTranslateImgs = [
  './assets/navbook/main_en.webp',
  './assets/navbook/milestones_en.webp',
  './assets/navbook/stories_en.webp',
  './assets/navbook/gallery_en.webp',
  './assets/navbook/my_granny_en.webp',
  './assets/navbook/remember_en.webp',
  './assets/navbook/map_en.webp',
];

export const originalRuImages = ['./assets/klubok_en.png'];

export const originalEnImages = ['./assets/klubok_ru.png'];

export const VISUAL_STATES = {
  PLAYING: [
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
  ],
  STOPPED: [
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
  ],
};
