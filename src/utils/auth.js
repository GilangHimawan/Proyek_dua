export function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const logoutButton = document.getElementById('logout-button');
    const loginLink = document.querySelector('nav a[href="#login"]');
    const registerLink = document.querySelector('nav a[href="#register"]');
  
    if (logoutButton) logoutButton.style.display = token ? 'inline-block' : 'none';
    if (loginLink) loginLink.style.display = token ? 'none' : 'inline-block';
    if (registerLink) registerLink.style.display = token ? 'none' : 'inline-block';
}
  