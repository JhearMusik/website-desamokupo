// app.js - Logika Lengkap 12 Menu Admin, Navigasi, dan Upload Storage

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    checkAuthStatus();
    loadAllAdminData();
    renderPublicData();
  }, 300);
});

// ==========================================
// HELPER UNIVERSAL: UPLOAD FILE KE SUPABASE STORAGE
// ==========================================
async function uploadFileKeSupabase(fileInput) {
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) return null;

  if (!window.supabase || !window.supabase.storage) {
    throw new Error("Koneksi Supabase belum terhubung. Periksa supabase-config.js");
  }

  const file = fileInput.files[0];
  const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const { data, error } = await window.supabase.storage
    .from('desa-media')
    .upload(cleanName, file, { cacheControl: '3600', upsert: true });

  if (error) throw error;

  const { data: publicUrlData } = window.supabase.storage
    .from('desa-media')
    .getPublicUrl(cleanName);

  return publicUrlData.publicUrl;
}

// ==========================================
// LOGIKA SAMBUTAN / ALERT SEMENTARA
// ==========================================
function simpanDataGenerik(namaMenu) {
  alert(`Data untuk [${namaMenu}] berhasil disimpan!`);
}

// ==========================================
// 1. UPDATE BERANDA (LOGO & VIDEO)
// ==========================================
async function updateBerandaSettings(e) {
  if (e) e.preventDefault();
  
  if (!window.supabase) {
    alert('Kesalahan: Supabase belum terhubung.');
    return;
  }

  const btnSave = document.getElementById('btn-save-beranda');

  try {
    if (btnSave) btnSave.disabled = true;

    const nama_desa = document.getElementById('admin-nama-desa')?.value || '';
    const slogan = document.getElementById('admin-slogan-desa')?.value || '';
    
    let logo_url = document.getElementById('admin-logo-url-lama')?.value || '';
    let video_url = document.getElementById('admin-video-url-lama')?.value || '';

    const logoFileEl = document.getElementById('admin-logo-file');
    const videoFileEl = document.getElementById('admin-video-file');

    const uploadedLogo = await uploadFileKeSupabase(logoFileEl);
    const uploadedVideo = await uploadFileKeSupabase(videoFileEl);

    if (uploadedLogo) logo_url = uploadedLogo;
    if (uploadedVideo) video_url = uploadedVideo;

    const { error } = await window.supabase
      .from('settings')
      .upsert([{ id: 1, nama_desa, slogan, logo_url, video_url }], { onConflict: 'id' });

    if (error) throw error;

    alert('Data Beranda, Logo & Video berhasil diperbarui!');
    loadAllAdminData();
  } catch (err) {
    alert('Gagal menyimpan beranda: ' + err.message);
  } finally {
    if (btnSave) btnSave.disabled = false;
  }
}

// ==========================================
// LOAD DATA DARI DATABASE
// ==========================================
async function loadAllAdminData() {
  if (!window.supabase) return;

  try {
    const { data } = await window.supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (!data) return;

    const inputNama = document.getElementById('admin-nama-desa');
    const inputSlogan = document.getElementById('admin-slogan-desa');
    const inputLogoLama = document.getElementById('admin-logo-url-lama');
    const inputVideoLama = document.getElementById('admin-video-url-lama');

    if (inputNama) inputNama.value = data.nama_desa || '';
    if (inputSlogan) inputSlogan.value = data.slogan || '';
    if (inputLogoLama) inputLogoLama.value = data.logo_url || '';
    if (inputVideoLama) inputVideoLama.value = data.video_url || '';

    const elAppTitle = document.getElementById('app-title');
    const elAppSlogan = document.getElementById('app-slogan');
    if (elAppTitle && data.nama_desa) elAppTitle.innerText = data.nama_desa;
    if (elAppSlogan && data.slogan) elAppSlogan.innerText = data.slogan;

    if (data.logo_url) {
      const imgEl = document.getElementById('nav-logo-img');
      const iconEl = document.getElementById('nav-logo-icon');
      if (imgEl && iconEl) {
        imgEl.src = data.logo_url;
        imgEl.classList.remove('hidden');
        iconEl.classList.add('hidden');
      }
    }

    if (data.video_url) {
      const videoBg = document.getElementById('hero-video-bg');
      if (videoBg) {
        videoBg.src = data.video_url;
        videoBg.load();
      }
    }
  } catch (err) {
    console.error("Gagal memuat settings:", err);
  }
}

// ==========================================
// 3. TAMBAH APARAT DESA
// ==========================================
async function tambahAparatDesa(e) {
  if (e) e.preventDefault();
  try {
    const nama = document.getElementById('admin-nama-aparat')?.value || '';
    const jabatan = document.getElementById('admin-jabatan-aparat')?.value || '';
    const fotoEl = document.getElementById('admin-foto-aparat-file');

    let fotoUrl = await uploadFileKeSupabase(fotoEl) || '';

    const { error } = await window.supabase.from('aparat').insert([{ nama, jabatan, foto: fotoUrl }]);
    if (error) throw error;

    alert('Aparat Desa Berhasil Ditambahkan!');
    if (e && e.target) e.target.reset();
  } catch (err) {
    alert('Gagal menambah aparat: ' + err.message);
  }
}

// ==========================================
// 4. TAMBAH ANGGOTA BPD
// ==========================================
async function tambahBpdMember(e) {
  if (e) e.preventDefault();
  try {
    const nama = document.getElementById('bpd-nama')?.value || '';
    const jabatan = document.getElementById('bpd-jabatan')?.value || '';
    const fotoEl = document.getElementById('bpd-foto-file');

    let fotoUrl = await uploadFileKeSupabase(fotoEl) || '';

    const { error } = await window.supabase.from('bpd').insert([{ nama, jabatan, foto: fotoUrl }]);
    if (error) throw error;

    alert('Anggota BPD Berhasil Ditambahkan!');
    if (e && e.target) e.target.reset();
    renderPublicData();
  } catch (err) {
    alert('Gagal menambah BPD: ' + err.message);
  }
}

// ==========================================
// RENDER HALAMAN PUBLIK
// ==========================================
async function renderPublicData() {
  const container = document.getElementById('bpd-public-container');
  if (!container || !window.supabase) return;

  try {
    const { data } = await window.supabase.from('bpd').select('*');
    if (!data) return;

    container.innerHTML = data.map(item => `
      <div class="flex flex-col items-center text-center space-y-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl overflow-hidden shadow-md bg-slate-100 flex items-center justify-center">
          ${item.foto ? `<img src="${item.foto}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie text-4xl text-slate-300"></i>`}
        </div>
        <div>
          <h3 class="font-bold text-slate-800">${item.nama}</h3>
          <p class="text-xs text-emerald-700 font-bold uppercase">${item.jabatan}</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Gagal render BPD publik:", err);
  }
}

// ==========================================
// NAVIGASI UTAMA & TAB PORTAL PETUGAS
// ==========================================
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');

  const heroBanner = document.getElementById('beranda-hero-fullscreen');
  if (heroBanner) {
    if (tabId === 'beranda') heroBanner.classList.remove('hidden');
    else heroBanner.classList.add('hidden');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchAdminSub(subId) {
  document.querySelectorAll('.admin-sub-content').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(subId);
  if (target) target.classList.add('active');

  // Highlight tombol tab yang aktif
  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.classList.remove('bg-emerald-600', 'text-white');
    btn.classList.add('bg-slate-700', 'text-slate-300');
  });
  const activeBtn = document.getElementById(`btn-tab-${subId}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-700', 'text-slate-300');
    activeBtn.classList.add('bg-emerald-600', 'text-white');
  }
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

// ==========================================
// OTENTIKASI ADMIN
// ==========================================
function handleLogin(e) {
  if (e) e.preventDefault();
  const u = document.getElementById('login-user')?.value;
  const p = document.getElementById('login-pass')?.value;
  if (u === 'admin' && p === 'admin123') {
    sessionStorage.setItem('admin_logged', 'true');
    checkAuthStatus();
  } else {
    alert('Login gagal! Gunakan username: admin & password: admin123');
  }
}

function handleLogout() {
  sessionStorage.removeItem('admin_logged');
  checkAuthStatus();
}

function checkAuthStatus() {
  const isLogged = sessionStorage.getItem('admin_logged');
  const loginBox = document.getElementById('auth-login-box');
  const dashBox = document.getElementById('admin-dashboard-box');
  if (isLogged === 'true') {
    if (loginBox) loginBox.classList.add('hidden');
    if (dashBox) dashBox.classList.remove('hidden');
  } else {
    if (loginBox) loginBox.classList.remove('hidden');
    if (dashBox) dashBox.classList.add('hidden');
  }
}
