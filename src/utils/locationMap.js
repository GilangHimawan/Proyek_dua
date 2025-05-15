export function setupMapForLatLon(lat = null, lon = null) {
  const mapContainer = document.getElementById('map');

  const defaultLat = -2.5;
  const defaultLon = 117;
  const defaultZoom = 4;

  const map = L.map(mapContainer).setView([defaultLat, defaultLon], defaultZoom);

  const openStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  });

  const cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
  });

  const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
  });

  openStreet.addTo(map);

  const baseMaps = {
    "OpenStreetMap": openStreet,
    "CartoDB Positron": cartoPositron,
    "CartoDB Dark": cartoDark,
  };

  L.control.layers(baseMaps).addTo(map);

  let marker;

  function setMarker(lat, lon, popupText = 'Lokasi dipilih') {
    const position = [lat, lon];

    if (marker) {
      marker.setLatLng(position);
    } else {
      marker = L.marker(position).addTo(map);
    }

    marker.bindPopup(`${popupText}:<br>${lat.toFixed(6)}, ${lon.toFixed(6)}`).openPopup();

    document.getElementById('story-lat').value = lat.toFixed(6);
    document.getElementById('story-lon').value = lon.toFixed(6);
  }

  if (lat !== null && lon !== null) {
    map.setView([lat, lon], 13);
    setMarker(lat, lon, 'Lokasi dari Draft');
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        map.setView([userLat, userLon], 13);
        setMarker(userLat, userLon, 'Lokasi Anda');
      },
      () => {
        alert('Tidak bisa mendapatkan lokasi.');
      }
    );
  }

  map.on('click', function (e) {
    const { lat, lng } = e.latlng;
    setMarker(lat, lng, 'Lokasi dipilih');
  });
}
