export function displayStories(stories) {
    const container = document.getElementById('stories-list');
    if (!container) return;
  
    container.innerHTML = stories.map(story => `
      <div style="padding:10px; margin-bottom:10px; background:#f9f9f9;">
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <img src="${story.photoUrl}" style="max-width:200px;" alt="story">
        <p>Lat: ${story.lat ?? '-'}, Lon: ${story.lon ?? '-'}</p>
      </div>
    `).join('');
}
  