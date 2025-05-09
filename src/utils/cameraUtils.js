export function startCamera() {
    const video = document.getElementById('video');
    const container = document.getElementById('camera-container');
    container.style.display = 'block';
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.play();
      })
      .catch(err => alert('Tidak bisa mengakses kamera: ' + err));
}
  
export function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const base64Input = document.getElementById('story-photo-base64');
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    base64Input.value = dataURL;
  
    const imgPreview = document.createElement('img');
    imgPreview.src = dataURL;
    imgPreview.style.maxWidth = '200px';
    document.getElementById('camera-container').appendChild(imgPreview);
  
    const stream = video.srcObject;
    stream.getTracks().forEach(track => track.stop());
    video.style.display = 'none';
  }
  
  export function triggerFileInput() {
    document.getElementById('story-photo').click();
}
  