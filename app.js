// app.js

// ==========================================
// 1. KELOLA BERITA (SUB-8)
// ==========================================

// Fungsi Menyimpan Berita Baru ke Supabase
async function publikasiBerita(event) {
  // WAJIB: Cegah form melakukan auto-refresh halaman
  event.preventDefault();

  const judulInput = document.getElementById('admin-judul-berita').value;
  const isiInput = document.getElementById('admin-isi-berita').value;

  if (!judulInput || !isiInput) {
    alert('Mohon isi Judul dan Isi Berita!');
    return;
  }

  // Kirim data ke tabel 'berita' di Supabase
  const { data, error } = await supabase
    .from('berita')
    .insert([
      { 
        judul: judulInput, 
        isi: isiInput, 
        tanggal: new Date().toISOString().split('T')[0] 
      }
    ]);

  if (error) {
    console.error('Error simpan berita:', error);
    alert('Gagal menyimpan ke Supabase: ' + error.message);
  } else {
    alert('Berita berhasil disimpan secara permanen!');
    event.target.reset(); // Kosongkan form
    loadBeritaList();    // Tampilkan ulang daftar berita terbaru
  }
}

// Fungsi Memuat/Menampilkan Daftar Berita dari Supabase ke Website
async function loadBeritaList() {
  const container = document.getElementById('admin-berita-list');
  if (!container) return;

  const { data: berita, error } = await supabase
    .from('berita')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Gagal mengambil data berita:', error);
    return;
  }

  // Tampilkan data ke elemen HTML
  if (berita.length === 0) {
    container.innerHTML = '<p class="text-slate-400">Belum ada berita tersimpan.</p>';
    return;
  }

  container.innerHTML = berita.map(item => `
    <div class="p-3 bg-slate-800 border border-slate-700 rounded mb-2">
      <h4 class="font-bold text-white">${item.judul}</h4>
      <p class="text-sm text-slate-300">${item.isi}</p>
      <span class="text-xs text-amber-400">${item.tanggal || ''}</span>
    </div>
  `).join('');
}


// ==========================================
// 2. KELOLA TAUTAN PORTAL TERKAIT (SUB-10)
// ==========================================

async function tambahTautanIklan(event) {
  event.preventDefault();

  const namaInput = document.getElementById('tautan-nama').value;
  const urlInput = document.getElementById('tautan-url').value;

  const { data, error } = await supabase
    .from('tautan')
    .insert([
      { 
        nama: namaInput, 
        url: urlInput 
      }
    ]);

  if (error) {
    console.error('Error simpan tautan:', error);
    alert('Gagal menyimpan tautan: ' + error.message);
  } else {
    alert('Tautan berhasil disimpan secara permanen!');
    event.target.reset();
    loadTautanList();
  }
}

async function loadTautanList() {
  const container = document.getElementById('tautan-portal-container');
  if (!container) return;

  const { data: tautan, error } = await supabase
    .from('tautan')
    .select('*');

  if (error) return;

  container.innerHTML = tautan.map(item => `
    <a href="${item.url}" target="_blank" class="p-4 bg-white rounded border border-slate-200 flex justify-between items-center hover:shadow">
      <span class="font-semibold text-slate-800">${item.nama}</span>
      <i class="fa-solid fa-arrow-up-right-from-square text-slate-400"></i>
    </a>
  `).join('');
}


// ==========================================
// 3. JALANKAN SAAT HALAMAN SELESAI DIMUAT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadBeritaList();
  loadTautanList();
});
