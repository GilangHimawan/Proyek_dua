export function displayStories(stories) {
  const container = document.getElementById('stories-list');
  if (!container) return;

  container.innerHTML = stories.map(story => `
    <div style="padding: 10px; margin-bottom: 10px; background: #f9f9f9; border-radius: 8px;">
      <h3 style="margin: 0 0 5px;">${story.name}</h3>
      <p style="margin: 0 0 10px;">${story.description}</p>
      <img src="${story.photoUrl}" alt="story image" style="max-width: 100%; height: auto; border-radius: 4px; margin-bottom: 10px;" />
      <p style="font-size: 0.9em; color: #555;">Lat: ${story.lat ?? '-'}, Lon: ${story.lon ?? '-'}</p>
    </div>
  `).join('');
}