import { setupMapForLatLon } from '../utils/locationMap.js';
import { startCamera, triggerFileInput, capturePhoto } from '../utils/cameraUtils.js';
import { dataURLToBlob } from '../utils/dataURLToBlop.js';
import { saveDraftToDB } from '../utils/dafrtDB.js';
import { checkLoginStatus } from '../utils/auth.js';

export function addNewStory() {
  const root = document.getElementById('main-content');
  checkLoginStatus();
  if (!root) {
    console.error('Element with ID "main-content" not found');
    return;
  }

  root.innerHTML = `
    <h2>Add Story</h2>
    <form id="story-form">
      <label>Description:</label>
      <textarea id="story-description" required></textarea>

      <label>Photo:</label>
      <button type="button" id="choose-photo">Choose from Device</button>
      <button type="button" id="open-camera">Take from Camera</button>

      <div id="camera-container" style="display:none;">
        <video id="video" width="320" height="240" autoplay></video>
        <button type="button" id="capture-btn">Capture Photo</button>
        <canvas id="canvas" style="display:none;"></canvas>
      </div>

      <input type="file" id="story-photo" accept="image/*" style="display:none;" />
      <input type="hidden" id="story-photo-base64" />
      <input type="hidden" id="story-lat" />
      <input type="hidden" id="story-lon" />
      <div id="map" style="height:300px;margin-top:10px;"></div>

      <button type="submit">Submit Story</button>
      <button type="button" id="save-draft-btn">Save as Draft</button>
    </form>
  `;

  let restoredLat = null;
  let restoredLon = null;

  const restoreDraftRaw = localStorage.getItem('restore-draft');
  if (restoreDraftRaw) {
    const restoreDraft = JSON.parse(restoreDraftRaw);
    document.getElementById('story-description').value = restoreDraft.description || '';

    if (restoreDraft.base64) {
      const base64Input = document.getElementById('story-photo-base64');
      base64Input.value = restoreDraft.base64;

      const imgPreview = document.createElement('img');
      imgPreview.src = restoreDraft.base64;
      imgPreview.style.maxWidth = '200px';
      document.getElementById('camera-container').appendChild(imgPreview);
    }

    if (restoreDraft.lat && restoreDraft.lon) {
      document.getElementById('story-lat').value = restoreDraft.lat;
      document.getElementById('story-lon').value = restoreDraft.lon;
      restoredLat = restoreDraft.lat;
      restoredLon = restoreDraft.lon;
    }

    localStorage.removeItem('restore-draft');
  }

  setupMapForLatLon(restoredLat, restoredLon);

  document.getElementById('choose-photo').addEventListener('click', triggerFileInput);
  document.getElementById('open-camera').addEventListener('click', startCamera);
  document.getElementById('capture-btn').addEventListener('click', capturePhoto);

  document.getElementById('story-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired, please log in again.');
      location.hash = '#login';
      return;
    }

    const description = document.getElementById('story-description').value;
    const photoFile = document.getElementById('story-photo').files[0];
    const base64 = document.getElementById('story-photo-base64').value;
    const lat = document.getElementById('story-lat').value;
    const lon = document.getElementById('story-lon').value;

    const formData = new FormData();
    formData.append('description', description);

    if (photoFile) {
      formData.append('photo', photoFile);
    } else if (base64) {
      const blob = dataURLToBlob(base64);
      formData.append('photo', blob, 'camera-photo.png');
    } else {
      alert('Please choose or take a photo.');
      return;
    }

    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    try {
      const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!data.error) {
        alert('Story successfully submitted!');
        location.hash = '#home';
      } else {
        alert(data.message || 'Failed to submit!');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  document.getElementById('story-photo').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('story-photo-base64').value = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('save-draft-btn').addEventListener('click', async () => {
    const description = document.getElementById('story-description').value;
    const base64 = document.getElementById('story-photo-base64').value;
    const lat = document.getElementById('story-lat').value;
    const lon = document.getElementById('story-lon').value;

    if (!description) {
      return alert('Description must be filled out.');
    }

    await saveDraftToDB({
      description,
      base64,
      lat,
      lon,
      createdAt: new Date().toISOString(),
    });

    alert('Saved as draft!');
    location.hash = '#home';
  });
}
