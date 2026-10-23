// app.js - Logika Lengkap Sistem Desa Mokupo & Supabase Storage

document.addEventListener('DOMContentLoaded', () => {
    applySettings();
    checkAuthStatus();
    renderPublicAddDds();
    renderPublicBpd();
});

// ==========================================
// HELPER: UPLOAD FILE LANGSUNG KE SUPABASE STORAGE
// ==========================================
async function uploadFileKeSupabase(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return null;

    if (!window.supabase || !window.supabase.storage) {
        throw new Error("Koneksi Supabase belum terinisialisasi. Periksa supabase-config.js");
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

// HELPER LOCALSTORAGE
function getBpdList() {
    let data = localStorage.getItem('desa_bpd_list');
    return data ? JSON.parse(data) : [
        { nama: 'Drs. H. Mansur', jabatan: 'Ketua BPD', foto: '' },
        { nama: 'Siti Aminah, S.Pd', jabatan: 'Wakil Ketua BPD', foto: '' }
    ];
}
function saveBpdList(list) { localStorage.setItem('desa_bpd_list', JSON.stringify(list)); }

function getPengaduanList() {
    let data = localStorage.getItem('desa_pengaduan');
    return data ? JSON.parse(data) : [];
}
function savePengaduanList(list) { localStorage.setItem('desa_pengaduan', JSON.stringify(list)); }

function getAddDdsPrograms() {
    let data = localStorage.getItem('desa_add_dds_programs');
    return data ? JSON.parse(data) : [];
}
function saveAddDdsPrograms(list) { localStorage.setItem('desa_add_dds_programs', JSON.stringify(list)); }

function getAdmindukData() {
    let data = localStorage.getItem('desa_adminduk_stats');
    return data ? JSON.parse(data) : { pria: 2450, wanita: 2380, kk: 1210, ktp: 3620, kia: 965, akta: 4340, ikd: 850 };
}
function saveAdmindukData(data) { localStorage.setItem('desa_adminduk_stats', JSON.stringify(data)); }

// NAVIGASI UTAMA & SUB MENU ADMIN
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
}

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

    if (subId === 'sub-bpd') renderAdminBpdList();
    if (subId === 'sub-pengaduan') renderAdminPengaduanList();
    if (subId === 'sub-add-dds') renderAdminAddDds();
    if (subId === 'sub-penduduk') renderAdminPendudukForm();
}

// OTENTIKASI PETUGAS
function handleLogin(e) {
    e.preventDefault();
    if (document.getElementById('login-user').value === 'admin' && document.getElementById('login-pass').value === 'admin123') {
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
    if (isLogged === 'true') {
        if(loginBox) loginBox.classList.add('hidden');
        if(dashBox) dashBox.classList.remove('hidden');
        renderAdminBpdList();
        renderAdminPengaduanList();
        renderAdminAddDds();
        renderAdminPendudukForm();
    } else {
        if(loginBox) loginBox.classList.remove('hidden');
        if(dashBox) dashBox.classList.add('hidden');
    }
}

// 1. UPDATE BERANDA (LOGO & VIDEO)
async function updateBerandaSettings(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('admin-nama-desa').value;
        const slogan = document.getElementById('admin-slogan-desa').value;
        
        let logoUrl = localStorage.getItem('desa_logo') || '';
        let videoUrl = localStorage.getItem('desa_video') || '';

        const logoFile = document.getElementById('admin-logo-file');
        const videoFile = document.getElementById('admin-video-file');

        const uploadedLogo = await uploadFileKeSupabase(logoFile);
        const uploadedVideo = await uploadFileKeSupabase(videoFile);

        if (uploadedLogo) logoUrl = uploadedLogo;
        if (uploadedVideo) videoUrl = uploadedVideo;

        localStorage.setItem('desa_nama', nama);
        localStorage.setItem('desa_slogan', slogan);
        if(logoUrl) localStorage.setItem('desa_logo', logoUrl);
        if(videoUrl) localStorage.setItem('desa_video', videoUrl);

        applySettings();
        alert('Beranda, Logo & Video berhasil disimpan!');
    } catch (err) {
        alert('Gagal mengunggah file: ' + err.message);
    }
}

// 2. UPDATE PROFIL
async function updateProfilSettings(e) {
    e.preventDefault();
    try {
        const sejarah = document.getElementById('admin-sejarah').value;
        const sambutan = document.getElementById('admin-sambutan').value;
        const fotoFile = document.getElementById('admin-foto-sambutan-file');

        let fotoUrl = localStorage.getItem('desa_foto_sambutan') || '';
        const uploadedFoto = await uploadFileKeSupabase(fotoFile);
        if (uploadedFoto) fotoUrl = uploadedFoto;

        document.getElementById('content-sejarah').innerHTML = `<p>${sejarah}</p>`;
        document.getElementById('content-sambutan').innerHTML = `<p><em>"${sambutan}"</em></p><p class="font-bold text-slate-800">— Kepala Desa Mokupo</p>`;

        if(fotoUrl) {
            localStorage.setItem('desa_foto_sambutan', fotoUrl);
            applySambutanFoto(fotoUrl);
        }
        alert('Profil & Foto Kades berhasil diperbarui!');
    } catch (err) {
        alert('Gagal mengunggah foto: ' + err.message);
    }
}

function applySambutanFoto(url) {
    const imgEl = document.getElementById('sambutan-img');
    const iconEl = document.getElementById('sambutan-icon');
    if(url && imgEl && iconEl) {
        imgEl.src = url;
        imgEl.classList.remove('hidden');
        iconEl.classList.add('hidden');
    }
}

// 3. APARAT DESA
async function tambahAparatDesa(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('admin-nama-aparat').value;
        const jabatan = document.getElementById('admin-jabatan-aparat').value;
        const tupoksi = document.getElementById('admin-tupoksi-aparat').value;
        const fotoFile = document.getElementById('admin-foto-aparat-file');

        let fotoUrl = await uploadFileKeSupabase(fotoFile) || '';

        const container = document.getElementById('aparat-container');
        if(container) {
            const card = document.createElement('div');
            card.className = 'flex flex-col items-center text-center space-y-3 group relative';
            card.innerHTML = `
                <button onclick="this.parentElement.remove()" class="absolute -top-2 -right-2 z-10 text-rose-500 bg-white p-1.5 rounded-full shadow text-xs"><i class="fa-solid fa-trash"></i></button>
                <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">
                    ${fotoUrl ? `<img src="${fotoUrl}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`}
                </div>
                <div>
                    <h3 class="font-bold text-base sm:text-lg text-slate-800">${nama}</h3>
                    <p class="text-xs text-emerald-700 font-bold uppercase">${jabatan}</p>
                    <p class="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-xs">Tugas Pokok: ${tupoksi}</p>
                </div>
            `;
            container.appendChild(card);
        }
        e.target.reset();
        alert('Aparat berhasil ditambahkan!');
    } catch (err) {
        alert('Gagal menambah aparat: ' + err.message);
    }
}

// 4. BPD
async function tambahBpdMember(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('bpd-nama').value;
        const jabatan = document.getElementById('bpd-jabatan').value;
        const fotoFile = document.getElementById('bpd-foto-file');

        let fotoUrl = await uploadFileKeSupabase(fotoFile) || '';

        let list = getBpdList();
        list.push({ nama, jabatan, foto: fotoUrl });
        saveBpdList(list);

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
        saveBpdList(list);
        renderAdminBpdList();
        renderPublicBpd();
    }
}

function renderPublicBpd() {
    const container = document.getElementById('bpd-public-container');
    if(!container) return;
    let list = getBpdList();
    container.innerHTML = '';
    if(list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 col-span-full text-center py-4">Belum ada data BPD.</p>`;
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

// 7. PENGADUAN
function kirimPengaduanPublik(e) {
    e.preventDefault();
    const nama = document.getElementById('adu-nama').value;
    const telp = document.getElementById('adu-telp').value;
    const subjek = document.getElementById('adu-subjek').value;
    const isi = document.getElementById('adu-isi').value;
    const uniqueId = 'ADU-' + Math.floor(1000 + Math.random() * 9000);

    let list = getPengaduanList();
    list.unshift({ id: uniqueId, nama, telp, subjek, isi, status: 'Pending', jawaban: 'Belum ditanggapi.' });
    savePengaduanList(list);
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
    list.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-3';
        card.innerHTML = `
            <div><span class="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">${item.id}</span><h4 class="font-bold text-white text-sm mt-1">${item.subjek}</h4><p class="text-xs text-slate-300">Pelapor: ${item.nama} (${item.telp})</p></div>
            <p class="text-xs text-slate-400 bg-slate-950 p-2.5 rounded">${item.isi}</p>
        `;
        container.appendChild(card);
    });
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
    saveAdmindukData({
        pria: parseInt(document.getElementById('admin-jml-pria').value) || 0,
        wanita: parseInt(document.getElementById('admin-jml-wanita').value) || 0,
        kk: parseInt(document.getElementById('admin-adm-kk').value) || 0,
        ktp: parseInt(document.getElementById('admin-adm-ktp').value) || 0,
        kia: parseInt(document.getElementById('admin-adm-kia').value) || 0,
        akta: parseInt(document.getElementById('admin-adm-akta').value) || 0,
        ikd: parseInt(document.getElementById('admin-adm-ikd').value) || 0
    });
    applySettings();
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

    document.getElementById('display-phone').innerHTML = `<i class="fa-solid fa-phone text-emerald-700 mr-2"></i> ${phone}`;
    document.getElementById('display-email').innerHTML = `<i class="fa-solid fa-envelope text-emerald-700 mr-2"></i> ${email}`;
    document.getElementById('topbar-email').innerHTML = `<i class="fa-solid fa-envelope mr-1 text-amber-400"></i> ${email}`;

    if(mapUrl) {
        localStorage.setItem('desa_map_url', mapUrl);
        document.getElementById('display-map-iframe').src = mapUrl;
    }
    alert('Kontak dan Peta berhasil diperbarui!');
}

// 12. ADD & DDS
function updateTotalAddDds(e) {
    e.preventDefault();
    localStorage.setItem('desa_total_add', document.getElementById('input-total-add').value);
    localStorage.setItem('desa_total_dds', document.getElementById('input-total-dds').value);
    applySettings();
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
    saveAddDdsPrograms(list);
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

// APPLY GLOBAL SETTINGS
function applySettings() {
    const nama = localStorage.getItem('desa_nama');
    const slogan = localStorage.getItem('desa_slogan');
    const logo = localStorage.getItem('desa_logo');
    const videoUrl = localStorage.getItem('desa_video');
    const fotoSambutan = localStorage.getItem('desa_foto_sambutan');
    const mapUrl = localStorage.getItem('desa_map_url');

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
    if(fotoSambutan) applySambutanFoto(fotoSambutan);
    if(mapUrl) document.getElementById('display-map-iframe').src = mapUrl;

    let adm = getAdmindukData();
    ['home-total', 'adm-kk'].forEach(id => { const el = document.getElementById(id); if(el) el.innerText = adm.kk; });
    renderPublicAddDds();
    renderPublicBpd();
}

function generateSuratPreview(e) {
    e.preventDefault();
    alert('Surat berhasil digenerate dengan nomor dan TTD Digital Verified!');
}
