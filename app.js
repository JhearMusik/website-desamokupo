// app.js - Versi Stabil & Aman untuk 12 Menu Desa Mokupo

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.supabase !== 'undefined') {
    loadHeaderSettings();
    loadBeritaList();
    loadTautanList();
    loadAparatList();
    loadBpdList();
    loadAddDds();
  } else {
    console.error("Supabase belum terinisialisasi dengan benar!");
  }
});

// ==========================================
// 1. BERANDA, LOGO & VIDEO
// ==========================================
async function updateHeaderSettings(event) {
  event.preventDefault();
  const nama_desa = document.getElementById('admin-nama-desa')?.value || '';
  const slogan = document.getElementById('admin-slogan-desa')?.value || '';
  const logo_url = document.getElementById('admin-logo-url')?.value || '';
  const video_url = document.getElementById('admin-video-url')?.value || '';

  const { error } = await window.supabase.from('settings').upsert([
    { id: 1, nama_desa, slogan, logo_url, video_url }
  ]);

  if (error) {
    alert('Gagal menyimpan Data Beranda: ' + error.message);
  } else {
    alert('Data Beranda berhasil disimpan secara permanen!');
    loadHeaderSettings();
  }
}

async function loadHeaderSettings() {
  const { data, error } = await window.supabase.from('settings').select('*').eq('id', 1).single();
  if (error || !data) return;

  const elNamaDesa = document.getElementById('site-nama-desa');
  const elSlogan = document.getElementById('site-slogan');
  const elLogo = document.getElementById('site-logo');

  if (elNamaDesa) elNamaDesa.innerText = data.nama_desa;
  if (elSlogan) elSlogan.innerText = data.slogan;
  if (elLogo && data.logo_url) elLogo.src = data.logo_url;
}

// ==========================================
// 2. PROFIL
// ==========================================
async function updateProfileSettings(event) {
  event.preventDefault();
  const foto_kades = document.getElementById('admin-foto-kapala')?.value || '';
  const sejarah = document.getElementById('admin-sejarah')?.value || '';
  const sambutan = document.getElementById('admin-sambutan')?.value || '';

  const { error } = await window.supabase.from('profil').upsert([
    { id: 1, foto_kades, sejarah, sambutan }
  ]);

  if (error) alert('Gagal: ' + error.message);
  else alert('Profil berhasil disimpan!');
}

// ==========================================
// 3. APARAT DESA
// ==========================================
async function tambahAparatBaru(event) {
  event.preventDefault();
  const nama = document.getElementById('admin-nama-aparat')?.value || '';
  const jabatan = document.getElementById('admin-jabatan-aparat')?.value || '';
  const foto = document.getElementById('admin-foto-aparat')?.value || '';

  const { error } = await window.supabase.from('aparat').insert([{ nama, jabatan, foto }]);
  if (error) alert('Gagal: ' + error.message);
  else {
    alert('Aparat ditambahkan!');
    event.target.reset();
    loadAparatList();
  }
}

async function loadAparatList() {
  const container = document.getElementById('admin-aparat-list');
  if (!container) return;
  const { data } = await window.supabase.from('aparat').select('*');
  if (!data) return;
  container.innerHTML = data.map(item => `
    <div class="p-3 bg-slate-800 rounded border border-slate-700 text-white flex items-center gap-3 mb-2">
      <img src="${item.foto || ''}" class="w-12 h-12 rounded-full object-cover" />
      <div><h5 class="font-bold">${item.nama}</h5><p class="text-xs text-slate-300">${item.jabatan}</p></div>
    </div>
  `).join('');
}

// ==========================================
// 4. BPD
// ==========================================
async function tambahBpdMember(event) {
  event.preventDefault();
  const nama = document.getElementById('bpd-nama')?.value || '';
  const jabatan = document.getElementById('bpd-jabatan')?.value || '';
  const foto = document.getElementById('bpd-foto')?.value || '';

  const { error } = await window.supabase.from('bpd').insert([{ nama, jabatan, foto }]);
  if (error) alert('Gagal: ' + error.message);
  else {
    alert('BPD ditambahkan!');
    event.target.reset();
    loadBpdList();
  }
}

async function loadBpdList() {
  const container = document.getElementById('admin-bpd-list');
  if (!container) return;
  const { data } = await window.supabase.from('bpd').select('*');
  if (!data) return;
  container.innerHTML = data.map(item => `
    <div class="p-3 bg-slate-800 rounded border border-slate-700 text-white flex items-center gap-3 mb-2">
      <img src="${item.foto || ''}" class="w-12 h-12 rounded-full object-cover" />
      <div><h5 class="font-bold">${item.nama}</h5><p class="text-xs text-slate-300">${item.jabatan}</p></div>
    </div>
  `).join('');
}

// ==========================================
// 5. PETUGAS & 6. SURAT & 8. BERITA & 10. TAUTAN & 12. ADD & DDS
// ==========================================
async function loadBeritaList() {
  const container = document.getElementById('admin-berita-list');
  if (!container) return;
  const { data } = await window.supabase.from('berita').select('*');
  if (!data) return;
  container.innerHTML = data.map(item => `<div class="p-2 text-white border-b border-slate-700">${item.judul}</div>`).join('');
}

async function loadTautanList() {
  const container = document.getElementById('tautan-portal-container');
  if (!container) return;
  const { data } = await window.supabase.from('tautan').select('*');
  if (!data) return;
  container.innerHTML = data.map(item => `<a href="${item.url}" target="_blank" class="block p-2 text-blue-400">${item.nama}</a>`).join('');
}

async function loadAddDds() {
  const container = document.getElementById('admin-add-dox-list');
  if (!container) return;
  const { data } = await window.supabase.from('kegiatan').select('*');
  if (!data) return;
  container.innerHTML = data.map(item => `<div class="p-2 text-white">${item.nama} - ${item.anggaran}</div>`).join('');
}

// Fungsi dummy switchTab jika terpanggil tombol navigasi
function switchTab(tabId) {
  console.log("Switching tab to:", tabId);
}
