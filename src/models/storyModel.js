import {
  openDB,
  clearStoriesFromDB as clearDB,
  loadStoriesFromDB as loadDB,
  saveStoriesToDB as saveDB,
} from '../utils/indexedDB.js';

export const storyModel = {
  clearStories: () => clearDB(),
  loadStories: () => loadDB(),
  saveStories: (stories) => saveDB(stories),
};
