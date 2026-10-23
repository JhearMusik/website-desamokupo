// ==========================================
// KELOLA BERANDA, LOGO & VIDEO (SUPABASE)
// ==========================================
async function updateBerandaSettings(e) {
  e.preventDefault();
  const nama_desa = document.getElementById('admin-nama-desa').value;
  const slogan = document.getElementById('admin-slogan-desa').value;
  const logo_url = document.getElementById('admin-logo-url').value;
  const video_url = document.getElementById('admin-video-url').value;

  if (typeof window.supabase === 'undefined') {
    alert('Koneksi Supabase belum siap!');
    return;
  }

  // Simpan ke tabel 'settings' di Supabase (ID = 1)
  const { error } = await window.supabase.from('settings').upsert([
    { id: 1, nama_desa, slogan, logo_url, video_url }
  ]);

  if (error) {
    alert('Gagal menyimpan ke Supabase: ' + error.message);
  } else {
    alert('Data Beranda, Logo & Video berhasil disimpan secara permanen ke database!');
    loadHeaderSettings();
  }
}

async function loadHeaderSettings() {
  if (typeof window.supabase === 'undefined') return;
  const { data, error } = await window.supabase.from('settings').select('*').eq('id', 1).single();
  if (error || !data) return;

  // 1. Terapkan Nama & Slogan
  const elAppTitle = document.getElementById('app-title');
  const elAppSlogan = document.getElementById('app-slogan');
  if (elAppTitle && data.nama_desa) elAppTitle.innerText = data.nama_desa;
  if (elAppSlogan && data.slogan) elAppSlogan.innerText = data.slogan;

  // 2. Terapkan Input di Form Admin Beranda
  const inputNama = document.getElementById('admin-nama-desa');
  const inputSlogan = document.getElementById('admin-slogan-desa');
  const inputLogo = document.getElementById('admin-logo-url');
  const inputVideo = document.getElementById('admin-video-url');

  if (inputNama) inputNama.value = data.nama_desa || '';
  if (inputSlogan) inputSlogan.value = data.slogan || '';
  if (inputLogo) inputLogo.value = data.logo_url || '';
  if (inputVideo) inputVideo.value = data.video_url || '';

  // 3. Terapkan Logo ke Navbar Publik
  if (data.logo_url) {
    const imgEl = document.getElementById('nav-logo-img');
    const iconEl = document.getElementById('nav-logo-icon');
    if (imgEl && iconEl) {
      imgEl.src = data.logo_url;
      imgEl.classList.remove('hidden');
      iconEl.classList.add('hidden');
    }
  }

  // 4. Terapkan Video Latar (Background Video) ke Beranda
  if (data.video_url) {
    const videoBg = document.getElementById('hero-video-bg');
    if (videoBg) {
      videoBg.src = data.video_url;
    }
  }
}
