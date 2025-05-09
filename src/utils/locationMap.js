export function setupMapForLatLon() {
    const mapContainer = document.getElementById('map');
  
    // Inisialisasi peta
    const map = L.map(mapContainer).setView([-2.5, 117], 4);
  
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
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
  
        map.setView([lat, lon], 13);
  
        document.getElementById('story-lat').value = lat.toFixed(6);
        document.getElementById('story-lon').value = lon.toFixed(6);
  
        marker = L.marker([lat, lon]).addTo(map).bindPopup('Lokasi Anda').openPopup();
      }, () => {
        alert('Tidak bisa mendapatkan lokasi.');
      });
    }
  
    map.on('click', function (e) {
      const { lat, lng } = e.latlng;
  
      document.getElementById('story-lat').value = lat.toFixed(6);
      document.getElementById('story-lon').value = lng.toFixed(6);
  
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
  
      marker.bindPopup(`Lokasi dipilih:<br>${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();
    });
}
  