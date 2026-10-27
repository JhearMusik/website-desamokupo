// app.js - Sistem Informasi Desa Mokupo (Versi Stabil Tanpa Error Storage)

document.addEventListener('DOMContentLoaded', () => {
    loadAllSettings();
    checkAuthStatus();
    updateNotificationBadges();
    renderPublicAddDds();
    renderPublicBpd();
    renderPublicAparat();
    renderPublicBerita();
    renderPublicTautan();
});

// ==========================================
// HELPER: KONVERSI FILE KE BASE64 (LOKAL & AMAN)
// ==========================================
function konversiFileKeBase64(fileInput) {
    return new Promise((resolve, reject) => {
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            resolve(null);
            return;
        }
        const file = fileInput.files[0];
        
        if (file.type.includes('video') && file.size > 20 * 1024 * 1024) {
            alert('Ukuran video terlalu besar! Maksimal kapasitas file video adalah 20 MB.');
            reject(new Error('File video melebihi batas 20MB'));
            return;
        }

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

// TOGGLE DROPDOWN DESKTOP
window.toggleDropdown = function(event) {
    event.stopPropagation();
    const dropdownMenu = event.currentTarget.nextElementSibling;
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== dropdownMenu) menu.classList.add('hidden');
    });
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('hidden');
    }
}

document.addEventListener('click', function(event) {
    const isDropdownButton = event.target.closest('.dropdown button');
    if (!isDropdownButton) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.add('hidden'));
    }
});

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

function getAddDdsPrograms() { return getData('desa_add_dds_programs', []); }
function getBeritaList() { return getData('desa_berita_list', []); }
function getTautanList() { return getData('desa_tautan_list', [
    { nama: 'Pemerintah Kabupaten Buol', url: 'https://buolkab.go.id' }
]); }

function getAdmindukData() {
    return getData('desa_adminduk_stats', { pria: 435, wanita: 123, kk: 123, ktp: 0, kia: 0, akta: 0, ikd: 0 });
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

// SWITCH SUB MENU ADMIN
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
    if (subId === 'sub-surat') renderAdminPermohonanList();
    if (subId === 'sub-pengaduan') renderAdminPengaduanList();
    if (subId === 'sub-add-dds') renderAdminAddDds();
    if (subId === 'sub-penduduk') renderAdminPendudukForm();
}

// AUTHENTICATION
function handleLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById('login-user').value.trim();
    const passVal = document.getElementById('login-pass').value.trim();

    if (userVal === 'admin' && passVal === 'admin123') {
        sessionStorage.setItem('admin_logged', 'true');
        checkAuthStatus();
    } else {
        alert('Username atau Password salah!');
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
        renderAdminAparatList();
        renderAdminBpdList();
        renderAdminPermohonanList();
        renderAdminPengaduanList();
        renderAdminAddDds();
        renderAdminPendudukForm();
        loadAdminFormValues();
        updateNotificationBadges();
    } else {
        if(loginBox) loginBox.classList.remove('hidden');
        if(dashBox) dashBox.classList.add('hidden');
    }
}

// RESET / HAPUS DATA SUB MENU
function hapusDataSubMenu(nomorSub) {
    if (!confirm(`Reset data pada Sub Menu ${nomorSub}?`)) return;

    switch (nomorSub) {
        case 1: localStorage.removeItem('desa_nama'); localStorage.removeItem('desa_slogan'); localStorage.removeItem('desa_logo'); localStorage.removeItem('desa_video_local'); break;
        case 2: localStorage.removeItem('desa_sejarah'); localStorage.removeItem('desa_visi'); localStorage.removeItem('desa_misi'); localStorage.removeItem('desa_struktur_teks'); localStorage.removeItem('desa_struktur_img'); localStorage.removeItem('desa_foto_sambutan'); localStorage.removeItem('desa_sambutan'); break;
        case 3: localStorage.removeItem('desa_aparat_list'); renderAdminAparatList(); renderPublicAparat(); break;
        case 4: localStorage.removeItem('desa_bpd_list'); renderAdminBpdList(); renderPublicBpd(); break;
        case 6: localStorage.removeItem('desa_permohonan_surat'); renderAdminPermohonanList(); updateNotificationBadges(); break;
        case 7: localStorage.removeItem('desa_pengaduan'); renderAdminPengaduanList(); break;
        case 8: localStorage.removeItem('desa_berita_list'); renderPublicBerita(); break;
        case 9: localStorage.removeItem('desa_adminduk_stats'); renderAdminPendudukForm(); break;
        case 10: localStorage.removeItem('desa_tautan_list'); renderPublicTautan(); break;
        case 11: localStorage.removeItem('desa_phone'); localStorage.removeItem('desa_email'); localStorage.removeItem('desa_map_url'); break;
        case 12: localStorage.removeItem('desa_total_add'); localStorage.removeItem('desa_total_dds'); localStorage.removeItem('desa_add_dds_programs'); renderAdminAddDds(); renderPublicAddDds(); break;
    }
    loadAllSettings();
    loadAdminFormValues();
    alert('Data berhasil direset.');
}

// 1. EDIT BERANDA
async function updateBerandaSettings(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('admin-nama-desa').value;
        const slogan = document.getElementById('admin-slogan-desa').value;
        
        let logoBase64 = await konversiFileKeBase64(document.getElementById('admin-logo-file')) || getData('desa_logo', '');
        let videoBase64 = await konversiFileKeBase64(document.getElementById('admin-video-file')) || getData('desa_video_local', '');

        saveData('desa_nama', nama);
        saveData('desa_slogan', slogan);
        if(logoBase64) saveData('desa_logo', logoBase64);
        if(videoBase64) saveData('desa_video_local', videoBase64);

        loadAllSettings();
        alert('Beranda berhasil disimpan!');
    } catch (err) {
        if(err.message !== 'File video melebihi batas 20MB') alert('Gagal: ' + err.message);
    }
}

// 2. PROFIL
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
        alert('Profil berhasil disimpan!');
    } catch (err) { alert('Gagal: ' + err.message); }
}

// 3. APARAT
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

        renderPublicAparat(); renderAdminAparatList();
        e.target.reset();
        alert('Aparat ditambahkan!');
    } catch (err) { alert('Gagal: ' + err.message); }
}

function hapusAparatMember(index) {
    let list = getData('desa_aparat_list', []);
    list.splice(index, 1);
    saveData('desa_aparat_list', list);
    renderPublicAparat(); renderAdminAparatList();
}

function renderPublicAparat() {
    const container = document.getElementById('aparat-container');
    if(!container) return;
    let list = getData('desa_aparat_list', []);
    container.innerHTML = '';
    if (list.length === 0) { container.innerHTML = `<p class="text-xs text-slate-500 italic col-span-full text-center py-4">Belum ada data aparat.</p>`; return; }
    list.forEach(item => {
        container.innerHTML += `
            <div class="flex flex-col items-center text-center space-y-3 group">
                <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">
                    ${item.foto ? `<img src="${item.foto}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`}
                </div>
                <div><h3 class="font-bold text-base text-slate-800">${item.nama}</h3><p class="text-xs text-emerald-700 font-bold uppercase">${item.jabatan}</p><p class="text-[11px] text-slate-500 mt-1">Tupoksi: ${item.tupoksi}</p></div>
            </div>`;
    });
}

function renderAdminAparatList() {
    const container = document.getElementById('admin-aparat-list');
    if(!container) return;
    let list = getData('desa_aparat_list', []);
    container.innerHTML = '';
    if (list.length === 0) { container.innerHTML = `<p class="text-xs text-slate-400">Belum ada data.</p>`; return; }
    list.forEach((item, index) => {
        container.innerHTML += `<div class="bg-slate-950 border p-3 rounded-lg flex justify-between items-center text-xs"><div><p class="font-bold text-white text-sm">${item.nama}</p><p class="text-emerald-400 uppercase">${item.jabatan}</p></div><button onclick="hapusAparatMember(${index})" class="bg-rose-600 text-white px-3 py-1.5 rounded"><i class="fa-solid fa-trash"></i> Hapus</button></div>`;
    });
}

// 4. BPD
async function tambahBpdMember(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('bpd-nama').value;
        const jabatan = document.getElementById('bpd-jabatan').value;
        let fotoUrl = await konversiFileKeBase64(document.getElementById('bpd-foto-file')) || '';

        let list = getBpdList();
        list.push({ nama, jabatan, foto: fotoUrl });
        saveData('desa_bpd_list', list);
        e.target.reset(); renderAdminBpdList(); renderPublicBpd();
        alert('BPD ditambahkan!');
    } catch (err) { alert('Gagal: ' + err.message); }
}

function hapusBpdMember(index) {
    let list = getBpdList();
    list.splice(index, 1);
    saveData('desa_bpd_list', list);
    renderAdminBpdList(); renderPublicBpd();
}

function renderPublicBpd() {
    const container = document.getElementById('bpd-public-container');
    if(!container) return;
    let list = getBpdList();
    container.innerHTML = '';
    list.forEach(item => {
        container.innerHTML += `
            <div class="flex flex-col items-center text-center space-y-3 group">
                <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">
                    ${item.foto ? `<img src="${item.foto}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`}
                </div>
                <div><h3 class="font-bold text-base text-slate-800">${item.nama}</h3><p class="text-xs text-emerald-700 font-bold uppercase">${item.jabatan}</p></div>
            </div>`;
    });
}

function renderAdminBpdList() {
    const container = document.getElementById('admin-bpd-list');
    if(!container) return;
    let list = getBpdList();
    container.innerHTML = '';
    list.forEach((item, index) => {
        container.innerHTML += `<div class="bg-slate-950 border p-3 rounded-lg flex justify-between items-center text-xs"><div><p class="font-bold text-white text-sm">${item.nama}</p><p class="text-emerald-400 uppercase">${item.jabatan}</p></div><button onclick="hapusBpdMember(${index})" class="bg-rose-600 text-white px-3 py-1.5 rounded"><i class="fa-solid fa-trash"></i> Hapus</button></div>`;
    });
}

// 5 & 6. SURAT
function updateSyaratLabel() {
    const jenis = document.getElementById('s-jenis').value;
    const label = document.getElementById('label-dokumen-syarat');
    if(label) label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1"></i> Upload Dokumen Syarat untuk ${jenis}`;
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

        let list = getData('desa_permohonan_surat', []);
        list.unshift({ kode: kodeUnik, jenis, nama, nik, telp, ket, berkas: berkasBase64, status: 'Baru', dibaca: false, tanggal: new Date().toLocaleDateString('id-ID') });
        saveData('desa_permohonan_surat', list);
        updateNotificationBadges();
        alert(`Berhasil! Kode Unik: ${kodeUnik}`);
        e.target.reset();
    } catch (err) { alert('Gagal: ' + err.message); }
}

function updateNotificationBadges() {
    let list = getData('desa_permohonan_surat', []);
    let unreadCount = list.filter(item => !item.dibaca).length;
    const navBadge = document.getElementById('badge-notif-nav');
    const mobBadge = document.getElementById('badge-notif-mobile');
    const adminBadge = document.getElementById('badge-notif-admin');
    const subBadge = document.getElementById('sub-badge-surat');

    if (unreadCount > 0) {
        if(navBadge) { navBadge.innerText = unreadCount; navBadge.classList.remove('hidden'); }
        if(mobBadge) { mobBadge.innerText = unreadCount; mobBadge.classList.remove('hidden'); }
        if(adminBadge) { adminBadge.innerText = `${unreadCount} Permohonan Baru`; adminBadge.classList.remove('hidden'); }
        if(subBadge) { subBadge.innerText = unreadCount; subBadge.classList.remove('hidden'); }
    } else {
        if(navBadge) navBadge.classList.add('hidden');
        if(mobBadge) mobBadge.classList.add('hidden');
        if(adminBadge) adminBadge.classList.add('hidden');
        if(subBadge) subBadge.classList.add('hidden');
    }
}

function tandaiSemuaDibaca() {
    let list = getData('desa_permohonan_surat', []);
    list.forEach(item => item.dibaca = true);
    saveData('desa_permohonan_surat', list);
    updateNotificationBadges();
    renderAdminPermohonanList();
}

function renderAdminPermohonanList() {
    const container = document.getElementById('admin-permohonan-list');
    if (!container) return;
    let list = getData('desa_permohonan_surat', []);
    if (list.length === 0) { container.innerHTML = `<p class="text-xs text-slate-400">Belum ada permohonan surat.</p>`; return; }
    container.innerHTML = '';
    list.forEach((item, index) => {
        let badgeUnread = !item.dibaca ? `<span class="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BARU</span>` : '';
        container.innerHTML += `
            <div class="p-4 rounded-xl border space-y-3 bg-slate-900 border-slate-700 text-xs">
                <div class="flex items-center gap-2"><span class="text-amber-400 font-bold">${item.kode}</span> ${badgeUnread} <span class="text-slate-400">(${item.tanggal})</span></div>
                <h4 class="font-bold text-white text-sm">${item.jenis}</h4>
                <p class="text-slate-300">Pemohon: ${item.nama} | NIK: ${item.nik} | Telp: ${item.telp}</p>
                <div class="flex gap-2 pt-2 border-t border-slate-800">
                    ${item.berkas ? `<a href="${item.berkas}" target="_blank" class="bg-blue-600 text-white px-3 py-1.5 rounded"><i class="fa-solid fa-eye"></i> Buka Dokumen</a>` : ''}
                    <button onclick="hapusPermohonan(${index})" class="bg-rose-600 text-white px-3 py-1.5 rounded ml-auto"><i class="fa-solid fa-trash"></i> Hapus</button>
                </div>
            </div>`;
    });
}

function hapusPermohonan(index) {
    let list = getData('desa_permohonan_surat', []);
    list.splice(index, 1);
    saveData('desa_permohonan_surat', list);
    renderAdminPermohonanList(); updateNotificationBadges();
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
        detailBox.innerHTML = `<p><b>Kode:</b> <span class="text-emerald-700 font-bold">${found.kode}</span></p><p><b>Jenis:</b> ${found.jenis}</p><p><b>Status:</b> Selesai</p>`;
        document.getElementById('out-jenis-surat').innerText = found.jenis;
        document.getElementById('out-nama').innerText = found.nama;
        document.getElementById('out-nik').innerText = found.nik;
        document.getElementById('out-ket').innerText = found.ket;
        printArea.classList.remove('hidden'); btnCetak.classList.remove('hidden');
    } else {
        detailBox.innerHTML = `<p class="text-rose-600">Kode tidak ditemukan.</p>`;
        printArea.classList.add('hidden'); btnCetak.classList.add('hidden');
    }
}

// 8. BERITA
function publikasiBerita(e) {
    e.preventDefault();
    const judul = document.getElementById('admin-judul-berita').value.trim();
    const isi = document.getElementById('admin-isi-berita').value.trim();
    let list = getBeritaList();
    list.unshift({ judul, isi, tanggal: new Date().toLocaleDateString('id-ID') });
    saveData('desa_berita_list', list);
    renderPublicBerita();
    alert('Berita dipublikasikan!');
    e.target.reset();
}

function renderPublicBerita() {
    const grid = document.getElementById('beranda-berita-grid');
    if (!grid) return;
    let list = getBeritaList();
    grid.innerHTML = '';
    if (list.length === 0) return;
    list.forEach(item => {
        grid.innerHTML += `<div class="border p-4 rounded-xl space-y-2 bg-slate-50 shadow-sm"><span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">${item.tanggal}</span><h4 class="font-bold text-slate-800 text-base">${item.judul}</h4><p class="text-xs text-slate-600">${item.isi}</p></div>`;
    });
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
    alert('Statistik diperbarui!');
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
    const nama = document.getElementById('tautan-nama').value.trim();
    const url = document.getElementById('tautan-url').value.trim();
    let list = getTautanList();
    list.push({ nama, url });
    saveData('desa_tautan_list', list);
    renderPublicTautan();
    alert('Tautan ditambahkan!');
    e.target.reset();
}

function renderPublicTautan() {
    const container = document.getElementById('tautan-container');
    if (!container) return;
    let list = getTautanList();
    container.innerHTML = '';
    list.forEach(item => {
        container.innerHTML += `<a href="${item.url}" target="_blank" class="p-4 border rounded-xl hover:bg-slate-50 flex items-center justify-between shadow-sm"><span class="text-xs sm:text-sm font-medium">${item.nama}</span><i class="fa-solid fa-external-link text-slate-400"></i></a>`;
    });
}

// 11. KONTAK
function updateKontakSettings(e) {
    e.preventDefault();
    saveData('desa_phone', document.getElementById('admin-phone').value);
    saveData('desa_email', document.getElementById('admin-email').value);
    saveData('desa_map_url', document.getElementById('admin-map-url').value);
    loadAllSettings();
    alert('Kontak diperbarui!');
}

// 12. ADD & DDS
function updateTotalAddDds(e) {
    e.preventDefault();
    saveData('desa_total_add', document.getElementById('input-total-add').value);
    saveData('desa_total_dds', document.getElementById('input-total-dds').value);
    loadAllSettings();
    alert('Total anggaran diperbarui!');
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
    renderAdminAddDds(); renderPublicAddDds();
    alert('Program ditambahkan!');
    e.target.reset();
}

function renderPublicAddDds() {
    const tableBody = document.getElementById('public-add-dds-table');
    if (!tableBody) return;
    let list = getAddDdsPrograms();
    tableBody.innerHTML = '';
    list.forEach(item => {
        let badgeClass = item.sumber === 'ADD' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';
        tableBody.innerHTML += `<tr class="border-b"><td class="p-3"><span class="${badgeClass} font-bold px-2 py-0.5 rounded text-xs">${item.sumber}</span></td><td class="p-3 font-medium">${item.nama}</td><td class="p-3 font-semibold">${item.anggaran}</td><td class="p-3 text-xs">${item.ket}</td></tr>`;
    });
}

function renderAdminAddDds() {
    const container = document.getElementById('admin-add-dds-list');
    if (!container) return;
    let list = getAddDdsPrograms();
    container.innerHTML = '';
    list.forEach((item, index) => {
        container.innerHTML += `<div class="bg-slate-900 border p-3 rounded-lg flex justify-between items-center text-xs"><div><span class="font-bold text-white">${item.nama}</span><p class="text-slate-400">${item.anggaran}</p></div><button onclick="hapusProg(${index})" class="bg-rose-600 text-white px-2 py-1 rounded">Hapus</button></div>`;
    });
}

function hapusProg(index) {
    let list = getAddDdsPrograms();
    list.splice(index, 1);
    saveData('desa_add_dds_programs', list);
    renderAdminAddDds(); renderPublicAddDds();
}

// LOAD SETTINGS
function loadAllSettings() {
    const nama = getData('desa_nama', 'PEMERINTAH DESA MOKUPO KECAMATAN KARAMAT');
    const slogan = getData('desa_slogan', 'Sistem Informasi & Portal Pelayanan Publik');
    const logo = getData('desa_logo', '');
    const videoLocal = getData('desa_video_local', '');

    if(nama) document.getElementById('app-title').innerText = nama;
    if(slogan) document.getElementById('app-slogan').innerText = slogan;
    if(logo) {
        const imgEl = document.getElementById('nav-logo-img');
        const iconEl = document.getElementById('nav-logo-icon');
        if(imgEl && iconEl) { imgEl.src = logo; imgEl.classList.remove('hidden'); iconEl.classList.add('hidden'); }
    }

    const videoBg = document.getElementById('hero-video-bg');
    if (videoLocal && videoBg) {
        videoBg.src = videoLocal;
        videoBg.classList.remove('hidden');
    } else if(videoBg) {
        videoBg.classList.add('hidden');
    }

    document.getElementById('content-sejarah').innerHTML = `<p>${getData('desa_sejarah', 'Desa Mokupo terletak di wilayah Kecamatan Karamat, Kabupaten Buol.')}</p>`;
    document.getElementById('content-visi').innerText = `"${getData('desa_visi', 'Terwujudnya Desa Mokupo yang Mandiri, Transparan, Agamis, dan Sejahtera.')}"`;
    
    let misiTxt = getData('desa_misi', 'Meningkatkan kualitas pelayanan publik.\Mengoptimalkan tata kelola keuangan desa.');
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

    if(document.getElementById('display-add-total')) document.getElementById('display-add-total').innerText = getData('desa_total_add', 'Rp 0');
    if(document.getElementById('display-dds-total')) document.getElementById('display-dds-total').innerText = getData('desa_total_dds', 'Rp 0');

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
    renderPublicBerita();
    renderPublicTautan();
}

function loadAdminFormValues() {
    if(document.getElementById('admin-nama-desa')) document.getElementById('admin-nama-desa').value = getData('desa_nama', '');
    if(document.getElementById('admin-slogan-desa')) document.getElementById('admin-slogan-desa').value = getData('desa_slogan', '');
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
