export function showLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'block';
}

export function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
}
