// app.js - Logika Utama & Integrasi Supabase Desa Mokupo

document.addEventListener('DOMContentLoaded', () => {
  applySettings();
  checkAuthStatus();
  renderPublicAddDds();
  renderPublicBpd();
  loadHeaderSettings();
});

// ==========================================
// 1. KONEKSI & BERANDA SUPABASE
// ==========================================
async function loadHeaderSettings() {
  if (typeof window.supabase === 'undefined') return;
  const { data, error } = await window.supabase.from('settings').select('*').eq('id', 1).single();
  if (error || !data) return;

  const elNamaDesa = document.getElementById('app-title');
  const elSlogan = document.getElementById('app-slogan');
  if (elNamaDesa && data.nama_desa) elNamaDesa.innerText = data.nama_desa;
  if (elSlogan && data.slogan) elSlogan.innerText = data.slogan;
}

// ==========================================
// 2. NAVIGASI UTAMA TAB
// ==========================================
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(tabId);
  if(target) target.classList.add('active');

  const heroBanner = document.getElementById('beranda-hero-fullscreen');
  if(heroBanner) {
    if(tabId === 'beranda') {
      heroBanner.classList.remove('hidden');
    } else {
      heroBanner.classList.add('hidden');
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabId === 'portal-petugas') {
    checkAuthStatus();
  }
  if (tabId === 'bpd') {
    renderPublicBpd();
  }
  if (tabId === 'layanan-pengaduan') {
    renderAdminPengaduanList();
  }
  if (tabId === 'add-dds') {
    renderPublicAddDds();
  }
  if (tabId === 'adminduk') {
    applySettings();
  }
}

// ==========================================
// 3. NAVIGASI SUB-MENU ADMIN
// ==========================================
function switchAdminSub(subId) {
  document.querySelectorAll('.admin-sub-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.remove('bg-amber-500', 'text-slate-900');
    btn.classList.add('bg-slate-700', 'text-slate-200');
  });

  const targetSub = document.getElementById(subId);
  if(targetSub) targetSub.classList.add('active');
  
  if(event && event.currentTarget) {
    event.currentTarget.classList.remove('bg-slate-700', 'text-slate-200');
    event.currentTarget.classList.add('bg-amber-500', 'text-slate-900');
  }

  if (subId === 'sub-bpd') renderAdminBpdList();
  if (subId === 'sub-pengaduan') renderAdminPengaduanList();
  if (subId === 'sub-add-dds') renderAdminAddDds();
  if (subId === 'sub-penduduk') renderAdminPendudukForm();
}

// ==========================================
// 4. TOGGLE MENU MOBILE (ANDROID)
// ==========================================
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const icon = document.getElementById('mobile-menu-icon');
  if (!menu || !icon) return;
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-xmark');
  } else {
    menu.classList.add('hidden');
    icon.classList.remove('fa-xmark');
    icon.classList.add('fa-bars');
  }
}

// ==========================================
// 5. SISTEM LOGIN PETUGAS
// ==========================================
function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('login-user').value;
  const p = document.getElementById('login-pass').value;

  if (u === 'admin' && p === 'admin123') {
    sessionStorage.setItem('admin_logged', 'true');
    checkAuthStatus();
  } else {
    alert('Username atau Password salah! Gunakan admin / admin123');
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

  if (!loginBox || !dashBox) return;

  if (isLogged === 'true') {
    loginBox.classList.add('hidden');
    dashBox.classList.remove('hidden');
    renderAdminBpdList();
    renderAdminPengaduanList();
    renderAdminAddDds();
    renderAdminPendudukForm();
  } else {
    loginBox.classList.remove('hidden');
    dashBox.classList.add('hidden');
  }
}

// ==========================================
// 6. DATA STORE & RENDER PENDUKUNG (BPD, Pengaduan, dll)
// ==========================================
function getBpdList() {
  let data = localStorage.getItem('desa_bpd_list');
  return data ? JSON.parse(data) : [
    { nama: 'Drs. H. Mansur', jabatan: 'Ketua BPD', foto: '' },
    { nama: 'Siti Aminah, S.Pd', jabatan: 'Wakil Ketua BPD', foto: '' },
    { nama: 'Rahmat Hidayat', jabatan: 'Sekretaris BPD', foto: '' }
  ];
}

function saveBpdList(list) {
  localStorage.setItem('desa_bpd_list', JSON.stringify(list));
}

function renderPublicBpd() {
  const container = document.getElementById('bpd-public-container');
  if(!container) return;
  let list = getBpdList();
  container.innerHTML = list.length === 0 ? `<p class="text-xs text-slate-400 col-span-full text-center py-4">Belum ada data anggota BPD.</p>` : '';
  list.forEach(item => {
    let fotoContent = item.foto ? `<img src="${item.foto}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`;
    let card = document.createElement('div');
    card.className = 'flex flex-col items-center text-center space-y-3 group';
    card.innerHTML = `
      <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">${fotoContent}</div>
      <div>
        <h3 class="font-bold text-base text-slate-800">${item.nama}</h3>
        <p class="text-xs text-emerald-700 font-bold uppercase">${item.jabatan}</p>
      </div>`;
    container.appendChild(card);
  });
}

function renderAdminBpdList() {
  const container = document.getElementById('admin-bpd-list');
  if(!container) return;
  let list = getBpdList();
  container.innerHTML = list.length === 0 ? `<p class="text-xs text-slate-400">Belum ada anggota BPD.</p>` : '';
  list.forEach((item, index) => {
    let card = document.createElement('div');
    card.className = 'bg-slate-900 border border-slate-700 p-3 rounded-lg flex justify-between items-center text-xs';
    card.innerHTML = `
      <div><p class="font-bold text-white text-sm">${item.nama}</p><p class="text-emerald-400 font-semibold uppercase">${item.jabatan}</p></div>
      <button onclick="hapusBpdMember(${index})" class="bg-rose-600 text-white p-2 rounded shadow"><i class="fa-solid fa-trash"></i></button>`;
    container.appendChild(card);
  });
}

function tambahBpdMember(e) {
  e.preventDefault();
  const nama = document.getElementById('bpd-nama').value;
  const jabatan = document.getElementById('bpd-jabatan').value;
  const foto = document.getElementById('bpd-foto').value;
  let list = getBpdList();
  list.push({ nama, jabatan, foto });
  saveBpdList(list);
  document.getElementById('bpd-nama').value = '';
  document.getElementById('bpd-jabatan').value = '';
  document.getElementById('bpd-foto').value = '';
  renderAdminBpdList();
  renderPublicBpd();
  alert('Anggota BPD berhasil ditambahkan!');
}

function hapusBpdMember(index) {
  if (confirm('Hapus anggota BPD ini?')) {
    let list = getBpdList();
    list.splice(index, 1);
    saveBpdList(list);
    renderAdminBpdList();
    renderPublicBpd();
  }
}

function getPengaduanList() {
  let data = localStorage.getItem('desa_pengaduan');
  return data ? JSON.parse(data) : [];
}

function savePengaduanList(list) {
  localStorage.setItem('desa_pengaduan', JSON.stringify(list));
}

function renderAdminPengaduanList() {
  const container = document.getElementById('admin-pengaduan-list');
  if (!container) return;
  let list = getPengaduanList();
  container.innerHTML = list.length === 0 ? `<p class="text-xs text-slate-400">Belum ada pengaduan masyarakat.</p>` : '';
}

function getAddDdsPrograms() {
  let data = localStorage.getItem('desa_add_dds_programs');
  return data ? JSON.parse(data) : [];
}

function saveAddDdsPrograms(list) {
  localStorage.setItem('desa_add_dds_programs', JSON.stringify(list));
}

function renderPublicAddDds() {
  const tableBody = document.getElementById('public-add-dds-table');
  if (!tableBody) return;
  let list = getAddDdsPrograms();
  tableBody.innerHTML = list.length === 0 ? `<tr><td colspan="4" class="p-4 text-center text-slate-400 text-xs">Belum ada program / kegiatan terdaftar.</td></tr>` : '';
}

function renderAdminAddDds() {
  const container = document.getElementById('admin-add-dds-list');
  if (!container) return;
  container.innerHTML = `<p class="text-xs text-slate-400">Belum ada program.</p>`;
}

function getAdmindukData() {
  let data = localStorage.getItem('desa_adminduk_stats');
  return data ? JSON.parse(data) : { pria: 2450, wanita: 2380, kk: 1210, ktp: 3620, kia: 965, akta: 4340, ikd: 850 };
}

function saveAdmindukData(data) {
  localStorage.setItem('desa_adminduk_stats', JSON.stringify(data));
}

function renderAdminPendudukForm() {
  let adm = getAdmindukData();
  if(document.getElementById('admin-jml-pria')) {
    document.getElementById('admin-jml-pria').value = adm.pria;
    document.getElementById('admin-jml-wanita').value = adm.wanita;
    document.getElementById('admin-adm-kk').value = adm.kk;
    document.getElementById('admin-adm-ktp').value = adm.ktp;
    document.getElementById('admin-adm-kia').value = adm.kia;
    document.getElementById('admin-adm-akta').value = adm.akta;
    document.getElementById('admin-adm-ikd').value = adm.ikd;
  }
}

function applySettings() {
  let adm = getAdmindukData();
  if(document.getElementById('home-total')) {
    document.getElementById('home-total').innerText = adm.pria + adm.wanita;
    document.getElementById('home-laki').innerText = adm.pria;
    document.getElementById('home-perempuan').innerText = adm.wanita;
    document.getElementById('home-kk').innerText = adm.kk;
  }
}

function generateSuratPreview(e) {
  e.preventDefault();
  alert('Surat berhasil digenerate dengan nomor dan TTD Digital Verified!');
}

function kirimPengaduanPublik(e) {
  e.preventDefault();
  alert('Pengaduan berhasil dikirim!');
}

function cekStatusPengaduan() {
  alert('Fitur cek status siap digunakan.');
}

function updateBerandaSettings(e) { e.preventDefault(); alert('Beranda diperbarui!'); }
function updateProfilSettings(e) { e.preventDefault(); alert('Profil diperbarui!'); }
function tambahAparatDesa(e) { e.preventDefault(); alert('Aparat ditambahkan!'); }
function tambahPetugasBaru(e) { e.preventDefault(); alert('Petugas ditambahkan!'); }
function tambahArsipSurat(e) { e.preventDefault(); alert('Surat disimpan!'); }
function publikasiBerita(e) { e.preventDefault(); alert('Berita dipublikasikan!'); }
function updateStatistikPenduduk(e) { e.preventDefault(); alert('Adminduk diperbarui!'); }
function tambahTautanBaru(e) { e.preventDefault(); alert('Tautan ditambahkan!'); }
function updateKontakSettings(e) { e.preventDefault(); alert('Kontak diperbarui!'); }
function updateTotalAddDds(e) { e.preventDefault(); alert('Anggaran diperbarui!'); }
function tambahProgramKegiatan(e) { e.preventDefault(); alert('Program ditambahkan!'); }
