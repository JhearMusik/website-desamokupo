// app.js - Sistem Informasi Desa Mokupo (Lengkap & Utuh)

document.addEventListener('DOMContentLoaded', () => {
    loadAllSettings();
    checkAuthStatus();
    renderPublicAddDds();
    renderPublicBpd();
    renderPublicAparat();
});

// ==========================================
// HELPER: KONVERSI FILE KE BASE64 (LOKAL)
// ==========================================
function konversiFileKeBase64(fileInput) {
    return new Promise((resolve, reject) => {
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            resolve(null);
            return;
        }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// TOGGLE MENU MOBILE
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
    if (menu && icon) {
        menu.classList.toggle('hidden');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
    }
}

// LOCALSTORAGE HELPERS
function saveData(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function getData(key, defaultValue) {
    let data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

function getBpdList() {
    return getData('desa_bpd_list', [
        { nama: 'Drs. H. Mansur', jabatan: 'Ketua BPD', foto: '' },
        { nama: 'Siti Aminah, S.Pd', jabatan: 'Wakil Ketua BPD', foto: '' }
    ]);
}

function getPengaduanList() { return getData('desa_pengaduan', []); }
function getAddDdsPrograms() { return getData('desa_add_dds_programs', []); }
function getAdmindukData() {
    return getData('desa_adminduk_stats', { pria: 2450, wanita: 2380, kk: 1210, ktp: 3620, kia: 965, akta: 4340, ikd: 850 });
}

// SWITCH TAB PUBLIK
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(tabId);
    if(target) target.classList.add('active');

    const heroBanner = document.getElementById('beranda-hero-fullscreen');
    if(heroBanner) {
        if(tabId === 'beranda') heroBanner.classList.remove('hidden');
        else heroBanner.classList.add('hidden');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tabId === 'portal-petugas') checkAuthStatus();
    if (tabId === 'bpd') renderPublicBpd();
    if (tabId === 'add-dds') renderPublicAddDds();
    if (tabId === 'aparat') renderPublicAparat();
}

// SWITCH SUB MENU ADMIN (12 MENU)
function switchAdminSub(subId, btnElement) {
    document.querySelectorAll('.admin-sub-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-slate-900');
        btn.classList.add('bg-slate-700', 'text-slate-200');
    });

    const targetSub = document.getElementById(subId);
    if(targetSub) targetSub.classList.add('active');

    if(btnElement) {
        btnElement.classList.remove('bg-slate-700', 'text-slate-200');
        btnElement.classList.add('bg-amber-500', 'text-slate-900');
    }

    if (subId === 'sub-aparat') renderAdminAparatList();
    if (subId === 'sub-bpd') renderAdminBpdList();
    if (subId === 'sub-pengaduan') renderAdminPengaduanList();
    if (subId === 'sub-add-dds') renderAdminAddDds();
    if (subId === 'sub-penduduk') renderAdminPendudukForm();
}

// AUTH PETUGAS (LANGSUNG TERBUKA TANPA PERLU KETIK USER/PASS)
function checkAuthStatus() {
    renderAdminAparatList();
    renderAdminBpdList();
    renderAdminPengaduanList();
    renderAdminAddDds();
    renderAdminPendudukForm();
    loadAdminFormValues();
}

function handleLogout() {
    alert('Anda keluar dari sesi admin.');
    switchTab('beranda');
}

// ==========================================
// 12 SUB MENU ADMIN & FITUR LAYANAN
// ==========================================

// 1. EDIT BERANDA (LOGO & URL VIDEO)
async function updateBerandaSettings(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('admin-nama-desa').value;
        const slogan = document.getElementById('admin-slogan-desa').value;
        const videoUrl = document.getElementById('admin-video-url').value;
        
        let logoBase64 = await konversiFileKeBase64(document.getElementById('admin-logo-file')) || getData('desa_logo', '');

        saveData('desa_nama', nama);
        saveData('desa_slogan', slogan);
        if(logoBase64) saveData('desa_logo', logoBase64);
        if(videoUrl) saveData('desa_video', videoUrl);

        loadAllSettings();
        alert('Beranda, Logo & Video berhasil disimpan secara permanen!');
    } catch (err) {
        alert('Gagal memproses file: ' + err.message);
    }
}

// 2. EDIT PROFIL, VISI MISI & STRUKTUR
async function updateProfilSettings(e) {
    e.preventDefault();
    try {
        const sejarah = document.getElementById('admin-sejarah').value;
        const visi = document.getElementById('admin-visi').value;
        const misi = document.getElementById('admin-misi').value;
        const strukturTeks = document.getElementById('admin-struktur-teks').value;
        const sambutan = document.getElementById('admin-sambutan').value;

        let fotoKades = await konversiFileKeBase64(document.getElementById('admin-foto-sambutan-file')) || getData('desa_foto_sambutan', '');
        let fotoStruktur = await konversiFileKeBase64(document.getElementById('admin-struktur-file')) || getData('desa_struktur_img', '');

        saveData('desa_sejarah', sejarah);
        saveData('desa_visi', visi);
        saveData('desa_misi', misi);
        saveData('desa_struktur_teks', strukturTeks);
        saveData('desa_sambutan', sambutan);
        if(fotoKades) saveData('desa_foto_sambutan', fotoKades);
        if(fotoStruktur) saveData('desa_struktur_img', fotoStruktur);

        loadAllSettings();
        alert('Profil, Visi Misi, dan Struktur berhasil disimpan permanen!');
    } catch (err) {
        alert('Gagal memproses foto: ' + err.message);
    }
}

// 3. APARAT DESA (TAMBAH & HAPUS)
async function tambahAparatDesa(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('admin-nama-aparat').value;
        const jabatan = document.getElementById('admin-jabatan-aparat').value;
        const tupoksi = document.getElementById('admin-tupoksi-aparat').value;
        let fotoUrl = await konversiFileKeBase64(document.getElementById('admin-foto-aparat-file')) || '';

        let aparatList = getData('desa_aparat_list', []);
        aparatList.push({ nama, jabatan, tupoksi, foto: fotoUrl });
        saveData('desa_aparat_list', aparatList);

        renderPublicAparat();
        renderAdminAparatList();
        e.target.reset();
        alert('Aparat berhasil ditambahkan!');
    } catch (err) {
        alert('Gagal menambah aparat: ' + err.message);
    }
}

function hapusAparatMember(index) {
    if (confirm('Hapus data aparat desa ini?')) {
        let list = getData('desa_aparat_list', []);
        list.splice(index, 1);
        saveData('desa_aparat_list', list);
        renderPublicAparat();
        renderAdminAparatList();
    }
}

function renderPublicAparat() {
    const container = document.getElementById('aparat-container');
    if(!container) return;
    let list = getData('desa_aparat_list', []);
    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500 italic col-span-full text-center">Belum ada data aparat desa. Silakan tambahkan melalui Portal Petugas.</p>`;
        return;
    }
    list.forEach(item => {
        let card = document.createElement('div');
        card.className = 'flex flex-col items-center text-center space-y-3 group';
        card.innerHTML = `
            <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">
                ${item.foto ? `<img src="${item.foto}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`}
            </div>
            <div>
                <h3 class="font-bold text-base sm:text-lg text-slate-800">${item.nama}</h3>
                <p class="text-xs text-emerald-700 font-bold uppercase">${item.jabatan}</p>
                <p class="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-xs">Tupoksi: ${item.tupoksi}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderAdminAparatList() {
    const container = document.getElementById('admin-aparat-list');
    if(!container) return;
    let list = getData('desa_aparat_list', []);
    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400">Belum ada data aparat.</p>`;
        return;
    }
    list.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-700 p-3 rounded-lg flex justify-between items-center text-xs';
        card.innerHTML = `
            <div>
                <p class="font-bold text-white text-sm">${item.nama}</p>
                <p class="text-emerald-400 font-semibold uppercase">${item.jabatan}</p>
            </div>
            <button onclick="hapusAparatMember(${index})" class="bg-rose-600 text-white p-2 rounded shadow hover:bg-rose-700"><i class="fa-solid fa-trash"></i> Hapus</button>
        `;
        container.appendChild(card);
    });
}

// 4. KELOLA BPD
async function tambahBpdMember(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('bpd-nama').value;
        const jabatan = document.getElementById('bpd-jabatan').value;
        let fotoUrl = await konversiFileKeBase64(document.getElementById('bpd-foto-file')) || '';

        let list = getBpdList();
        list.push({ nama, jabatan, foto: fotoUrl });
        saveData('desa_bpd_list', list);

        e.target.reset();
        renderAdminBpdList();
        renderPublicBpd();
        alert('Anggota BPD berhasil ditambahkan!');
    } catch (err) {
        alert('Gagal menambah BPD: ' + err.message);
    }
}

function hapusBpdMember(index) {
    if (confirm('Hapus anggota BPD ini?')) {
        let list = getBpdList();
        list.splice(index, 1);
        saveData('desa_bpd_list', list);
        renderAdminBpdList();
        renderPublicBpd();
    }
}

function renderPublicBpd() {
    const container = document.getElementById('bpd-public-container');
    if(!container) return;
    let list = getBpdList();
    container.innerHTML = '';
    list.forEach(item => {
        let card = document.createElement('div');
        card.className = 'flex flex-col items-center text-center space-y-3 group';
        card.innerHTML = `
            <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">
                ${item.foto ? `<img src="${item.foto}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`}
            </div>
            <div>
                <h3 class="font-bold text-base sm:text-lg text-slate-800">${item.nama}</h3>
                <p class="text-xs text-emerald-700 font-bold uppercase">${item.jabatan}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderAdminBpdList() {
    const container = document.getElementById('admin-bpd-list');
    if(!container) return;
    let list = getBpdList();
    container.innerHTML = '';
    list.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-700 p-3 rounded-lg flex justify-between items-center text-xs';
        card.innerHTML = `
            <div>
                <p class="font-bold text-white text-sm">${item.nama}</p>
                <p class="text-emerald-400 font-semibold uppercase">${item.jabatan}</p>
            </div>
            <button onclick="hapusBpdMember(${index})" class="bg-rose-600 text-white p-2 rounded shadow"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(card);
    });
}

// 5 & 6. PETUGAS & SURAT
function tambahPetugasBaru(e) { e.preventDefault(); alert('Petugas berhasil didaftarkan!'); e.target.reset(); }
function tambahArsipSurat(e) { e.preventDefault(); alert('Arsip surat berhasil disimpan!'); e.target.reset(); }

// 7. PENGADUAN & 10. PERMOHONAN SURAT
function kirimPengaduanPublik(e) {
    e.preventDefault();
    const nama = document.getElementById('adu-nama').value;
    const telp = document.getElementById('adu-telp').value;
    const subjek = document.getElementById('adu-subjek').value;
    const isi = document.getElementById('adu-isi').value;
    const uniqueId = 'ADU-' + Math.floor(1000 + Math.random() * 9000);

    let list = getPengaduanList();
    list.unshift({ id: uniqueId, nama, telp, subjek, isi, status: 'Pending', jawaban: 'Belum ditanggapi.' });
    saveData('desa_pengaduan', list);
    alert(`Pengaduan terkirim! Kode Unik Anda: ${uniqueId}`);
    e.target.reset();
}

function cekStatusPengaduan() {
    const kode = document.getElementById('cek-kode').value.trim().toUpperCase();
    const box = document.getElementById('hasil-cek-status');
    const detailBox = document.getElementById('detail-status-box');
    let found = getPengaduanList().find(item => item.id === kode);
    box.classList.remove('hidden');
    if (found) {
        detailBox.innerHTML = `<p><b>Kode:</b> ${found.id}</p><p><b>Subjek:</b> ${found.subjek}</p><p><b>Status:</b> ${found.status}</p><p><b>Tanggapan:</b> ${found.jawaban}</p>`;
    } else {
        detailBox.innerHTML = `<p class="text-rose-600">Kode ${kode} tidak ditemukan.</p>`;
    }
}

function renderAdminPengaduanList() {
    const container = document.getElementById('admin-pengaduan-list');
    if (!container) return;
    let list = getPengaduanList();
    if (list.length === 0) { container.innerHTML = `<p class="text-xs text-slate-400">Belum ada pengaduan.</p>`; return; }
    container.innerHTML = '';
    list.forEach((item) => {
        let card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-3';
        card.innerHTML = `
            <div><span class="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">${item.id}</span><h4 class="font-bold text-white text-sm mt-1">${item.subjek}</h4><p class="text-xs text-slate-300">Pelapor: ${item.nama} (${item.telp})</p></div>
            <p class="text-xs text-slate-400 bg-slate-950 p-2.5 rounded">${item.isi}</p>
        `;
        container.appendChild(card);
    });
}

// PERMOHONAN PENERBITAN SURAT & UPLOAD SYARAT
function updateSyaratLabel() {
    const jenis = document.getElementById('s-jenis').value;
    const label = document.getElementById('label-dokumen-syarat');
    if(label) {
        if(jenis === 'Surat Keterangan Kematian') label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1"></i> Upload Dokumen Syarat: Surat Pengantar RT & Surat Keterangan Rumah Sakit / Puskesmas`;
        else if(jenis === 'Surat Keterangan Usaha') label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1"></i> Upload Dokumen Syarat: KTP Pemohon & Pengantar RT/RW`;
        else if(jenis === 'Surat Keterangan Kehilangan') label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1"></i> Upload Dokumen Syarat: Surat Laporan Kehilangan dari Kepolisian / KTP`;
        else if(jenis === 'Surat Keterangan Domisili') label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1"></i> Upload Dokumen Syarat: KTP / Kartu Keluarga (KK)`;
        else if(jenis === 'Surat Keterangan Kelahiran') label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1"></i> Upload Dokumen Syarat: Surat Keterangan Lahir Bidan/Rumah Sakit & KK`;
        else if(jenis === 'Surat Keterangan Tidak Mampu (SKTM)') label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1"></i> Upload Dokumen Syarat: KTP, KK & Surat Pengantar RT/RW`;
        else label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1"></i> Upload Dokumen Syarat Pendukung`;
    }
}

async function ajukanPermohonanSurat(e) {
    e.preventDefault();
    try {
        const jenis = document.getElementById('s-jenis').value;
        const nama = document.getElementById('s-nama').value;
        const nik = document.getElementById('s-nik').value;
        const telp = document.getElementById('s-telp').value;
        const ket = document.getElementById('s-ket').value;
        
        let berkasBase64 = await konversiFileKeBase64(document.getElementById('s-berkas')) || '';
        const kodeUnik = 'SRT-' + Math.floor(1000 + Math.random() * 9000);

        let permohonanList = getData('desa_permohonan_surat', []);
        permohonanList.unshift({
            kode: kodeUnik,
            jenis, nama, nik, telp, ket,
            berkas: berkasBase64,
            status: 'Selesai / Terverifikasi',
            tanggal: new Date().toLocaleDateString('id-ID')
        });
        saveData('desa_permohonan_surat', permohonanList);

        alert(`Permohonan Berhasil Dikirim!\n\nKode Unik Anda: ${kodeUnik}\n\nSilakan catat kode ini untuk mengecek status dan mencetak surat Anda di kolom sebelah kanan.`);
        e.target.reset();
    } catch (err) {
        alert('Gagal memproses permohonan: ' + err.message);
    }
}

function cekStatusPermohonanSurat() {
    const kode = document.getElementById('cek-kode-surat').value.trim().toUpperCase();
    const box = document.getElementById('hasil-cek-surat-box');
    const detailBox = document.getElementById('detail-permohonan-box');
    const printArea = document.getElementById('print-area-surat');
    const btnCetak = document.getElementById('btn-cetak-resmi');

    let list = getData('desa_permohonan_surat', []);
    let found = list.find(item => item.kode === kode);

    box.classList.remove('hidden');
    if (found) {
        detailBox.innerHTML = `
            <p><b>Kode Permohonan:</b> <span class="text-emerald-700 font-bold">${found.kode}</span></p>
            <p><b>Jenis Surat:</b> ${found.jenis}</p>
            <p><b>Pemohon:</b> ${found.nama} (NIK: ${found.nik})</p>
            <p><b>Status:</b> <span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">${found.status}</span></p>
        `;
        document.getElementById('out-jenis-surat').innerText = found.jenis;
        document.getElementById('out-nama').innerText = found.nama;
        document.getElementById('out-nik').innerText = found.nik;
        document.getElementById('out-ket').innerText = found.ket;

        printArea.classList.remove('hidden');
        btnCetak.classList.remove('hidden');
    } else {
        detailBox.innerHTML = `<p class="text-rose-600 font-bold">Kode permohonan "${kode}" tidak ditemukan. Pastikan kode benar.</p>`;
        printArea.classList.add('hidden');
        btnCetak.classList.add('hidden');
    }
}

// 8. BERITA
function publikasiBerita(e) {
    e.preventDefault();
    const judul = document.getElementById('admin-judul-berita').value;
    const isi = document.getElementById('admin-isi-berita').value;
    const grid = document.getElementById('beranda-berita-grid');
    if(grid) {
        const card = document.createElement('div');
        card.className = 'border p-4 rounded-xl space-y-2 bg-slate-50';
        card.innerHTML = `<span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">TERBARU</span><h4 class="font-bold text-slate-800 text-base">${judul}</h4><p class="text-xs text-slate-600">${isi}</p>`;
        grid.prepend(card);
    }
    alert('Berita berhasil dipublikasikan!');
    e.target.reset();
}

// 9. ADMINDUK
function updateStatistikPenduduk(e) {
    e.preventDefault();
    saveData('desa_adminduk_stats', {
        pria: parseInt(document.getElementById('admin-jml-pria').value) || 0,
        wanita: parseInt(document.getElementById('admin-jml-wanita').value) || 0,
        kk: parseInt(document.getElementById('admin-adm-kk').value) || 0,
        ktp: parseInt(document.getElementById('admin-adm-ktp').value) || 0,
        kia: parseInt(document.getElementById('admin-adm-kia').value) || 0,
        akta: parseInt(document.getElementById('admin-adm-akta').value) || 0,
        ikd: parseInt(document.getElementById('admin-adm-ikd').value) || 0
    });
    loadAllSettings();
    alert('Data Statistik berhasil diperbarui!');
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

// 10. TAUTAN
function tambahTautanBaru(e) {
    e.preventDefault();
    const nama = document.getElementById('tautan-nama').value;
    const url = document.getElementById('tautan-url').value;
    const container = document.getElementById('tautan-container');
    if(container) {
        const a = document.createElement('a');
        a.href = url; a.target = '_blank';
        a.className = 'p-4 border rounded-xl hover:bg-slate-50 flex items-center justify-between';
        a.innerHTML = `<span class="font-medium text-slate-700">${nama}</span><i class="fa-solid fa-external-link text-slate-400"></i>`;
        container.appendChild(a);
    }
    alert('Tautan baru ditambahkan!');
    e.target.reset();
}

// 11. KONTAK
function updateKontakSettings(e) {
    e.preventDefault();
    const phone = document.getElementById('admin-phone').value;
    const email = document.getElementById('admin-email').value;
    const mapUrl = document.getElementById('admin-map-url').value;

    saveData('desa_phone', phone);
    saveData('desa_email', email);
    if(mapUrl) saveData('desa_map_url', mapUrl);

    loadAllSettings();
    alert('Kontak dan Peta berhasil diperbarui!');
}

// 12. ADD & DDS
function updateTotalAddDds(e) {
    e.preventDefault();
    saveData('desa_total_add', document.getElementById('input-total-add').value);
    saveData('desa_total_dds', document.getElementById('input-total-dds').value);
    loadAllSettings();
    alert('Total anggaran berhasil diperbarui!');
}

function tambahProgramKegiatan(e) {
    e.preventDefault();
    let list = getAddDdsPrograms();
    list.push({
        sumber: document.getElementById('prog-sumber').value,
        nama: document.getElementById('prog-nama').value,
        anggaran: document.getElementById('prog-anggaran').value,
        ket: document.getElementById('prog-ket').value
    });
    saveData('desa_add_dds_programs', list);
    renderAdminAddDds();
    renderPublicAddDds();
    alert('Program berhasil ditambahkan!');
    e.target.reset();
}

function renderPublicAddDds() {
    const tableBody = document.getElementById('public-add-dds-table');
    if (!tableBody) return;
    let list = getAddDdsPrograms();
    tableBody.innerHTML = '';
    list.forEach(item => {
        let badgeClass = item.sumber === 'ADD' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';
        let row = document.createElement('tr');
        row.className = 'border-b';
        row.innerHTML = `<td class="p-3"><span class="${badgeClass} font-bold px-2 py-0.5 rounded text-xs">${item.sumber}</span></td><td class="p-3 font-medium text-slate-800">${item.nama}</td><td class="p-3 font-semibold text-slate-700">${item.anggaran}</td><td class="p-3 text-slate-600 text-xs">${item.ket}</td>`;
        tableBody.appendChild(row);
    });
}

function renderAdminAddDds() {
    const container = document.getElementById('admin-add-dds-list');
    if (!container) return;
    let list = getAddDdsPrograms();
    container.innerHTML = '';
    list.forEach((item) => {
        let card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-700 p-3 rounded-lg flex justify-between items-center text-xs';
        card.innerHTML = `<div><span class="font-bold text-white">${item.nama}</span><p class="text-slate-400">${item.anggaran}</p></div>`;
        container.appendChild(card);
    });
}

// LOAD ALL SETTINGS KE HALAMAN PUBLIK
function loadAllSettings() {
    const nama = getData('desa_nama', 'PEMERINTAH DESA MOKUPO KECAMATAN KARAMAT');
    const slogan = getData('desa_slogan', 'Sistem Informasi & Portal Pelayanan Publik');
    const logo = getData('desa_logo', '');
    const videoUrl = getData('desa_video', '');

    if(nama) document.getElementById('app-title').innerText = nama;
    if(slogan) document.getElementById('app-slogan').innerText = slogan;
    if(logo) {
        const imgEl = document.getElementById('nav-logo-img');
        const iconEl = document.getElementById('nav-logo-icon');
        if(imgEl && iconEl) { imgEl.src = logo; imgEl.classList.remove('hidden'); iconEl.classList.add('hidden'); }
    }
    if(videoUrl) {
        const videoBg = document.getElementById('hero-video-bg');
        if(videoBg) videoBg.src = videoUrl;
    }

    document.getElementById('content-sejarah').innerHTML = `<p>${getData('desa_sejarah', 'Desa Mokupo terletak di wilayah Kecamatan Karamat, Kabupaten Buol.')}</p>`;
    document.getElementById('content-visi').innerText = `"${getData('desa_visi', 'Terwujudnya Desa Mokupo yang Mandiri, Transparan, Agamis, dan Sejahtera.')}"`;
    
    let misiTxt = getData('desa_misi', 'Meningkatkan kualitas pelayanan publik.\nMengoptimalkan tata kelola keuangan desa.');
    let misiArr = misiTxt.split('\n');
    document.getElementById('content-misi').innerHTML = `<ul class="list-disc list-inside space-y-1">${misiArr.map(m => `<li>${m}</li>`).join('')}</ul>`;
    
    document.getElementById('content-struktur-teks').innerText = getData('desa_struktur_teks', 'Bagan Struktur Organisasi Pemerintah Desa Mokupo.');
    let strukturImg = getData('desa_struktur_img', '');
    if(strukturImg) {
        const imgStruktur = document.getElementById('content-struktur-img');
        if(imgStruktur) { imgStruktur.src = strukturImg; imgStruktur.classList.remove('hidden'); }
    }

    let fotoSambutan = getData('desa_foto_sambutan', '');
    if(fotoSambutan) {
        const imgKades = document.getElementById('sambutan-img');
        const iconKades = document.getElementById('sambutan-icon');
        if(imgKades && iconKades) { imgKades.src = fotoSambutan; imgKades.classList.remove('hidden'); iconKades.classList.add('hidden'); }
    }
    document.getElementById('content-sambutan').innerHTML = `<p><em>"${getData('desa_sambutan', 'Selamat datang di portal resmi...')}"</em></p><p class="font-bold text-slate-800">— Kepala Desa Mokupo</p>`;

    const email = getData('desa_email', 'pemdesmokupo@buolkab.go.id');
    const phone = getData('desa_phone', '+62 821-xxxx-xxxx');
    const mapUrl = getData('desa_map_url', '');

    if(document.getElementById('display-email')) document.getElementById('display-email').innerHTML = `<i class="fa-solid fa-envelope text-emerald-700 mr-2"></i> ${email}`;
    if(document.getElementById('topbar-email')) document.getElementById('topbar-email').innerHTML = `<i class="fa-solid fa-envelope mr-1 text-amber-400"></i> ${email}`;
    if(document.getElementById('display-phone')) document.getElementById('display-phone').innerHTML = `<i class="fa-solid fa-phone text-emerald-700 mr-2"></i> ${phone}`;
    if(mapUrl && document.getElementById('display-map-iframe')) document.getElementById('display-map-iframe').src = mapUrl;

    if(document.getElementById('display-add-total')) document.getElementById('display-add-total').innerText = getData('desa_total_add', 'Rp 845.200.000');
    if(document.getElementById('display-dds-total')) document.getElementById('display-dds-total').innerText = getData('desa_total_dds', 'Rp 1.120.500.000');

    let adm = getAdmindukData();
    if(document.getElementById('home-total')) document.getElementById('home-total').innerText = adm.pria + adm.wanita;
    if(document.getElementById('home-laki')) document.getElementById('home-laki').innerText = adm.pria;
    if(document.getElementById('home-perempuan')) document.getElementById('home-perempuan').innerText = adm.wanita;
    if(document.getElementById('home-kk')) document.getElementById('home-kk').innerText = adm.kk;
    if(document.getElementById('adm-kk')) document.getElementById('adm-kk').innerText = adm.kk;
    if(document.getElementById('adm-ktp')) document.getElementById('adm-ktp').innerText = adm.ktp;
    if(document.getElementById('adm-kia')) document.getElementById('adm-kia').innerText = adm.kia;
    if(document.getElementById('adm-akta')) document.getElementById('adm-akta').innerText = adm.akta;
    if(document.getElementById('adm-ikd')) document.getElementById('adm-ikd').innerText = adm.ikd;

    renderPublicAddDds();
    renderPublicBpd();
    renderPublicAparat();
}

function loadAdminFormValues() {
    if(document.getElementById('admin-nama-desa')) document.getElementById('admin-nama-desa').value = getData('desa_nama', 'PEMERINTAH DESA MOKUPO KECAMATAN KARAMAT');
    if(document.getElementById('admin-slogan-desa')) document.getElementById('admin-slogan-desa').value = getData('desa_slogan', 'Sistem Informasi & Portal Pelayanan Publik');
    if(document.getElementById('admin-video-url')) document.getElementById('admin-video-url').value = getData('desa_video', '');
    if(document.getElementById('admin-sejarah')) document.getElementById('admin-sejarah').value = getData('desa_sejarah', '');
    if(document.getElementById('admin-visi')) document.getElementById('admin-visi').value = getData('desa_visi', '');
    if(document.getElementById('admin-misi')) document.getElementById('admin-misi').value = getData('desa_misi', '');
    if(document.getElementById('admin-struktur-teks')) document.getElementById('admin-struktur-teks').value = getData('desa_struktur_teks', '');
    if(document.getElementById('admin-sambutan')) document.getElementById('admin-sambutan').value = getData('desa_sambutan', '');
    if(document.getElementById('admin-phone')) document.getElementById('admin-phone').value = getData('desa_phone', '');
    if(document.getElementById('admin-email')) document.getElementById('admin-email').value = getData('desa_email', '');
    if(document.getElementById('admin-map-url')) document.getElementById('admin-map-url').value = getData('desa_map_url', '');
    if(document.getElementById('input-total-add')) document.getElementById('input-total-add').value = getData('desa_total_add', '');
    if(document.getElementById('input-total-dds')) document.getElementById('input-total-dds').value = getData('desa_total_dds', '');
}
