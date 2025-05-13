import { renderHome, renderLogin, renderRegister } from '../view/loginHome.js';
import { addNewStory } from '../view/addStoryView.js';
import { showDraftStories } from '../view/draftStory.js';


export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange(); 
}

function handleRouteChange() {
  const route = location.hash || 'login';

  switch (route) {
    case '#login':
      renderLogin();
      break;
    case '#home':
      renderHome();
      break;
    case '#register':
      renderRegister();
      break;
    case '#add':
      addNewStory();
      break;
    case '#draft':
      showDraftStories();
      break;
    default:
      location.hash = 'login';
  }
}
