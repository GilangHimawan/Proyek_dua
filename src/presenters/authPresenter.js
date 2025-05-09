export async function loginUser(email, password) {
    try {
      const res = await fetch('https://story-api.dicoding.dev/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.error) {
        localStorage.setItem('token', data.loginResult.token);
        location.hash = 'home';
      } else {
        alert('Login gagal: ' + data.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    }
}
  
export async function registerUser(name, email, password) {
    try {
      const res = await fetch('https://story-api.dicoding.dev/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!data.error) {
        alert('Registrasi berhasil! Silakan login.');
        location.hash = 'login';
      } else {
        alert('Registrasi gagal: ' + data.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    }
}
  