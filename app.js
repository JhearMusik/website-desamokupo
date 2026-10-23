// app.js - Integrasi Supabase Lengkap untuk 12 Menu Desa Mokupo

document.addEventListener('DOMContentLoaded', () => {
  loadBeritaList();
  loadTautanList();
  loadAparatList();
  loadBpdList();
  loadAddDds();
});

// ==========================================
// 1. BERANDA, LOGO & VIDEO
// ==========================================
async function updateHeaderSettings(event) {
  event.preventDefault();
  const nama_desa = document.getElementById('admin-nama-desa').value;
  const slogan = document.getElementById('admin-slogan-desa').value;
  const logo_url = document.getElementById('admin-logo-url').value;
  const video_url = document.getElementById('admin-video-url').value;

  const { error } = await supabase.from('settings').upsert([
    { id: 1, nama_desa, slogan, logo_url, video_url }
  ]);

  if (error) alert('Gagal menyimpan Data Beranda: ' + error.message);
  else alert('Data Beranda berhasil disimpan secara permanen!');
}


// ==========================================
// 2. PROFIL (Sejarah, Visi Misi, Struktur, Sambutan)
// ==========================================
async function updateProfileSettings(event) {
  event.preventDefault();
  const foto_kades = document.getElementById('admin-foto-kapala').value;
  const sejarah = document.getElementById('admin-sejarah').value;
  const sambutan = document.getElementById('admin-sambutan').value;

  const { error } = await supabase.from('profil').upsert([
    { id: 1, foto_kades, sejarah, sambutan }
  ]);

  if (error) alert('Gagal menyimpan Profil: ' + error.message);
  else alert('Profil berhasil disimpan secara permanen!');
}


// ==========================================
// 3. APARAT DESA
// ==========================================
async function tambahAparatBaru(event) {
  event.preventDefault();
  const nama = document.getElementById('admin-nama-aparat').value;
  const jabatan = document.getElementById('admin-jabatan-aparat').value;
  const foto = document.getElementById('admin-foto-aparat').value;

  const { error } = await supabase.from('aparat').insert([{ nama, jabatan, foto }]);
  if (error) alert('Gagal: ' + error.message);
  else {
    alert('Aparat berhasil ditambahkan!');
    event.target.reset();
    loadAparatList();
  }
}

async function loadAparatList() {
  const container = document.getElementById('admin-aparat-list');
  if (!container) return;
  const { data } = await supabase.from('aparat').select('*');
  if (!data) return;
  container.innerHTML = data.map(item => `
    <div class="p-3 bg-slate-800 rounded border border-slate-700 text-white flex items-center gap-3 mb-2">
      <img src="${item.foto || ''}" class="w-12 h-12 rounded-full object-cover" />
      <div><h5 class="font-bold">${item.nama}</h5><p class="text-xs text-slate-300">${item.jabatan}</p></div>
    </div>
  `).join('');
}


// ==========================================
// 4. BPD (Badan Permusyawaratan Desa)
// ==========================================
async function tambahBpsMember(event) { // Sesuai id form HTML: tambahBpsMember atau tambahBpdMember
  event.preventDefault();
  const nama = document.getElementById('bpd-nama').value;
  const jabatan = document.getElementById('bpd-jabatan').value;
  const foto = document.getElementById('bpd-foto').value;

  const { error } = await supabase.from('bpd').insert([{ nama, jabatan, foto }]);
  if (error) alert('Gagal: ' + error.message);
  else {
    alert('Anggota BPD ditambahkan!');
    event.target.reset();
    loadBpdList();
  }
}

async function loadBpdList() {
  const container = document.getElementById('admin-bpd-list');
  if (!container) return;
  const { data } = await supabase.from('bpd').select('*');
  if (!data) return;
  container.innerHTML = data.map(item => `
    <div class="p-3 bg-slate-800 rounded border border-slate-700 text-white flex items-center gap-3 mb-2">
      <img src="${item.foto || ''}" class="w-12 h-12 rounded-full object-cover" />
      <div><h5 class="font-bold">${item.nama}</h5><p class="text-xs text-slate-300">${item.jabatan}</p></div>
    </div>
  `).join('');
}


// ==========================================
// 5. PETUGAS (Pendaftaran Akun Petugas)
// ==========================================
async function tambahPetugasBaru(event) {
  event.preventDefault();
  const nama = document.getElementById('petugas-nama').value;
  const username = document.getElementById('petugas-user').value;
  const password = document.getElementById('petugas-pass').value;

  const { error } = await supabase.from('petugas').insert([{ nama, username, password }]);
  if (error) alert('Gagal: ' + error.message);
  else {
    alert('Petugas baru berhasil didaftarkan!');
    event.target.reset();
  }
}


// ==========================================
// 6. SURAT (Arsip Surat Masuk & Keluar)
// ==========================================
async function tambahArsipSurat(event) {
  event.preventDefault();
  const kategori = document.getElementById('arsip-kategori').value;
  const nomor = document.getElementById('arsip-nomor').value;
  const perihal = document.getElementById('arsip-perihal').value;
  const pihak = document.getElementById('arsip-pihak').value;

  const { error } = await supabase.from('surat').insert([{ kategori, nomor, perihal, pihak }]);
  if (error) alert('Gagal: ' + error.message);
  else {
    alert('Arsip surat berhasil disimpan!');
    event.target.reset();
  }
}


// ==========================================
// 7. PENGADUAN MASYARAKAT
// ==========================================
// (Biasanya bersifat publik dari halaman utama, ditampilkan di admin)


// ==========================================
// 8. BERITA
// ==========================================
async function publikasiBerita(event) {
  event.preventDefault();
  const judul = document.getElementById('admin-judul-berita').value;
  const isi = document.getElementById('admin-isi-berita').value;

  const { error } = await supabase.from('berita').insert([{ judul, isi, tanggal: new Date().toISOString().split('T')[0] }]);
  if (error) alert('Gagal: ' + error.message);
  else {
    alert('Berita berhasil dipublikasikan!');
    event.target.reset();
    loadBeritaList();
  }
}

async function loadBeritaList() {
  const container = document.getElementById('admin-berita-list');
  if (!container) return;
  const { data } = await supabase.from('berita').select('*').order('id', { ascending: false });
  if (!data) return;
  container.innerHTML = data.map(item => `
    <div class="p-3 bg-slate-800 border border-slate-700 rounded mb-2 text-white">
      <h4 class="font-bold">${item.judul}</h4>
      <p class="text-sm text-slate-300">${item.isi}</p>
      <span class="text-xs text-amber-400">${item.tanggal || ''}</span>
    </div>
  `).join('');
}


// ==========================================
// 9. ADMINDUK (Statistik Kependudukan)
// ==========================================
async function updateStatistikPenduduk(event) {
  event.preventDefault();
  const pria = document.getElementById('admir-jel-pria').value;
  const wanita = document.getElementById('admir-jel-wanita').value;
  const kk = document.getElementById('admir-ade-kk').value;
  const ktp = document.getElementById('admir-ade-ktp').value;
  const kia = document.getElementById('admir-ade-kia').value;
  const akta = document.getElementById('admir-ade-akta').value;
  const ikd = document.getElementById('admir-ade-ikd').value;

  const { error } = await supabase.from('adminduk').upsert([
    { id: 1, pria, wanita, kk, ktp, kia, akta, ikd }
  ]);
  if (error) alert('Gagal: ' + error.message);
  else alert('Data Adminduk berhasil diperbarui!');
}


// ==========================================
// 10. TAUTAN PORTAL TERKAIT
// ==========================================
async function tambahTautanIklan(event) {
  event.preventDefault();
  const nama = document.getElementById('tautan-nama').value;
  const url = document.getElementById('tautan-url').value;

  const { error } = await supabase.from('tautan').insert([{ nama, url }]);
  if (error) alert('Gagal: ' + error.message);
  else {
    alert('Tautan berhasil disimpan!');
    event.target.reset();
    loadTautanList();
  }
}

async function loadTautanList() {
  const container = document.getElementById('tautan-portal-container');
  if (!container) return;
  const { data } = await supabase.from('tautan').select('*');
  if (!data) return;
  container.innerHTML = data.map(item => `
    <a href="${item.url}" target="_blank" class="p-4 bg-white rounded border border-slate-200 flex justify-between items-center hover:shadow">
      <span class="font-semibold text-slate-800">${item.nama}</span>
      <i class="fa-solid fa-arrow-up-right-from-square text-slate-400"></i>
    </a>
  `).join('');
}


// ==========================================
// 11. KONTAK & PETA (Maps)
// ==========================================
async function updateWebSettings(event) {
  event.preventDefault();
  const telepon = document.getElementById('admin-phone').value;
  const email = document.getElementById('admin-email').value;
  const map_url = document.getElementById('admin-map-url').value;

  const { error } = await supabase.from('kontak').upsert([
    { id: 1, telepon, email, map_url }
  ]);
  if (error) alert('Gagal: ' + error.message);
  else alert('Kontak & Peta berhasil disimpan!');
}


// ==========================================
// 12. ADD & DDS (Anggaran & Program)
// ==========================================
async function updateTotalAddox(event) {
  event.preventDefault();
  const total_add = document.getElementById('input-total-add').value;
  const total_dds = document.getElementById('input-total-dds').value;

  const { error } = await supabase.from('anggaran').upsert([
    { id: 1, total_add, total_dds }
  ]);
  if (error) alert('Gagal: ' + error.message);
  else alert('Total Anggaran berhasil diperbarui!');
}

async function tambahProgramKegiatan(event) {
  event.preventDefault();
  const sumber = document.getElementById('prog-sumber').value;
  const nama = document.getElementById('prog-nama').value;
  const anggaran = document.getElementById('prog-anggaran').value;
  const keterangan = document.getElementById('prog-ket').value;

  const { error } = await supabase.from('kegiatan').insert([{ sumber, nama, anggaran, keterangan }]);
  if (error) alert('Gagal: ' + error.message);
  else {
    alert('Program berhasil ditambahkan!');
    event.target.reset();
    loadAddDds();
  }
}

async function loadAddDds() {
  const container = document.getElementById('admin-add-dox-list');
  if (!container) return;
  const { data } = await supabase.from('kegiatan').select('*');
  if (!data) return;
  container.innerHTML = data.map(item => `
    <div class="p-3 bg-slate-800 rounded border border-slate-700 text-white mb-2">
      <span class="text-xs px-2 py-0.5 bg-amber-500 rounded font-bold">${item.sumber}</span>
      <h5 class="font-bold mt-1">${item.nama}</h5>
      <p class="text-sm text-slate-300">Anggaran: ${item.anggaran}</p>
      <p class="text-xs text-slate-400">Ket: ${item.keterangan}</p>
    </div>
  `).join('');
}
