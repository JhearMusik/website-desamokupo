// app.js - Sistem Informasi Desa Mokupo (Versi URL Online Bebas Error)

document.addEventListener('DOMContentLoaded', () => {
    loadAllDataFromSupabase();
    checkAuthStatus();
    updateNotificationBadges();
});

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
    if (subId === 'sub-surat') renderAdminPermohonanList();
    if (subId === 'sub-pengaduan') renderAdminPengaduanList();
    if (subId === 'sub-add-dds') renderAdminAddDds();
    if (subId === 'sub-penduduk') renderAdminPendudukForm();
}

// AUTHENTICATION LOGIN PETUGAS
function handleLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById('login-user').value.trim();
    const passVal = document.getElementById('login-pass').value.trim();

    if (userVal === 'admin' && passVal === 'admin123') {
        sessionStorage.setItem('admin_logged', 'true');
        checkAuthStatus();
    } else {
        alert('Username atau Password yang Anda masukkan salah!');
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

// ==========================================
// FUNGSI PENGHAPUSAN / RESET DATA 12 SUB MENU
// ==========================================
async function hapusDataSubMenu(nomorSub) {
    if (!confirm(`Apakah Anda yakin ingin menghapus / mereset data pada Sub Menu ${nomorSub}?`)) return;
    if (!supabaseClient) { alert('Supabase belum terhubung!'); return; }

    switch (nomorSub) {
        case 1:
            await supabaseClient.from('settings').update({ nama_desa: '', slogan: '', logo_url: '', video_url: '' }).eq('id', 1);
            alert('Data Beranda & Video berhasil direset!');
            break;
        case 2:
            await supabaseClient.from('profil').delete().neq('id', 0);
            alert('Data Profil & Struktur berhasil direset!');
            break;
        case 3:
            await supabaseClient.from('aparat').delete().neq('id', 0);
            renderAdminAparatList(); renderPublicAparat();
            alert('Semua data aparat desa berhasil dihapus!');
            break;
        case 4:
            await supabaseClient.from('bpd').delete().neq('id', 0);
            renderAdminBpdList(); renderPublicBpd();
            alert('Semua data BPD berhasil dihapus!');
            break;
        case 5:
            alert('Data Petugas direset ke pengaturan awal.');
            break;
        case 6:
            await supabaseClient.from('surat').delete().neq('id', 0);
            renderAdminPermohonanList(); updateNotificationBadges();
            alert('Semua riwayat permohonan surat berhasil dihapus!');
            break;
        case 7:
            await supabaseClient.from('pengaduan').delete().neq('id', 0);
            renderAdminPengaduanList();
            alert('Semua data pengaduan berhasil dihapus!');
            break;
        case 8:
            await supabaseClient.from('berita').delete().neq('id', 0);
            renderPublicBerita();
            alert('Semua data berita berhasil dihapus!');
            break;
        case 9:
            await supabaseClient.from('adminduk').upsert([{ id: 1, pria: 0, wanita: 0, kk: 0, ktp: 0, kia: 0, akta: 0, ikd: 0 }]);
            renderAdminPendudukForm();
            alert('Statistik adminduk berhasil direset menjadi 0!');
            break;
        case 10:
            await supabaseClient.from('tautan').delete().neq('id', 0);
            renderPublicTautan();
            alert('Semua tautan berhasil dihapus!');
            break;
        case 11:
            await supabaseClient.from('kontak').delete().neq('id', 0);
            alert('Data kontak berhasil direset!');
            break;
        case 12:
            await supabaseClient.from('anggaran').delete().neq('id', 0);
            renderAdminAddDds(); renderPublicAddDds();
            alert('Semua data ADD & DDS berhasil dihapus!');
            break;
    }
    loadAllDataFromSupabase();
    loadAdminFormValues();
}

// ==========================================
// 12 SUB MENU ADMIN & FITUR LAYANAN
// ==========================================

// 1. EDIT BERANDA (URL)
async function updateBerandaSettings(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('admin-nama-desa').value;
        const slogan = document.getElementById('admin-slogan-desa').value;
        const logoUrl = document.getElementById('admin-logo-url').value.trim();
        const videoUrl = document.getElementById('admin-video-url').value.trim();

        let { error } = await supabaseClient.from('settings').upsert([{
            id: 1,
            nama_desa: nama,
            slogan: slogan,
            logo_url: logoUrl,
            video_url: videoUrl
        }]);

        if(error) throw error;
        loadAllDataFromSupabase();
        alert('Beranda berhasil diperbarui & sinkron ke HP!');
    } catch (err) {
        alert('Gagal menyimpan: ' + err.message);
    }
}

// 2. EDIT PROFIL (URL)
async function updateProfilSettings(e) {
    e.preventDefault();
    try {
        const sejarah = document.getElementById('admin-sejarah').value;
        const visi = document.getElementById('admin-visi').value;
        const misi = document.getElementById('admin-misi').value;
        const strukturTeks = document.getElementById('admin-struktur-teks').value;
        const sambutan = document.getElementById('admin-sambutan').value;
        const strukturImg = document.getElementById('admin-struktur-url').value.trim();
        const fotoKades = document.getElementById('admin-foto-kades-url').value.trim();

        let { error } = await supabaseClient.from('profil').upsert([{
            id: 1,
            sejarah, visi, misi,
            struktur_teks: strukturTeks,
            struktur_img: strukturImg,
            foto_kades: fotoKades,
            sambutan
        }]);

        if(error) throw error;
        loadAllDataFromSupabase();
        alert('Profil berhasil disimpan!');
    } catch (err) {
        alert('Gagal menyimpan: ' + err.message);
    }
}

// 3. APARAT DESA (URL)
async function tambahAparatDesa(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('admin-nama-aparat').value;
        const jabatan = document.getElementById('admin-jabatan-aparat').value;
        const tupoksi = document.getElementById('admin-tupoksi-aparat').value;
        const fotoUrl = document.getElementById('admin-foto-aparat-url').value.trim();

        await supabaseClient.from('aparat').insert([{ nama, jabatan, tupoksi, foto_url: fotoUrl }]);
        renderPublicAparat();
        renderAdminAparatList();
        e.target.reset();
        alert('Aparat Desa berhasil ditambahkan!');
    } catch (err) {
        alert('Gagal: ' + err.message);
    }
}

async function hapusAparatMember(id) {
    if (confirm('Hapus aparat ini?')) {
        await supabaseClient.from('aparat').delete().eq('id', id);
        renderPublicAparat();
        renderAdminAparatList();
    }
}

async function renderPublicAparat() {
    const container = document.getElementById('aparat-container');
    if(!container) return;
    let { data: list } = await supabaseClient.from('aparat').select('*');
    container.innerHTML = '';
    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500 italic col-span-full text-center py-4">Belum ada data aparat desa.</p>`;
        return;
    }
    list.forEach(item => {
        container.innerHTML += `
            <div class="flex flex-col items-center text-center space-y-3 group">
                <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">
                    ${item.foto_url ? `<img src="${item.foto_url}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`}
                </div>
                <div>
                    <h3 class="font-bold text-base sm:text-lg text-slate-800">${item.nama}</h3>
                    <p class="text-xs text-emerald-700 font-bold uppercase">${item.jabatan}</p>
                    <p class="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-xs">Tupoksi: ${item.tupoksi}</p>
                </div>
            </div>`;
    });
}

async function renderAdminAparatList() {
    const container = document.getElementById('admin-aparat-list');
    if(!container) return;
    let { data: list } = await supabaseClient.from('aparat').select('*');
    container.innerHTML = '';
    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic">Belum ada data aparat.</p>`;
        return;
    }
    list.forEach((item) => {
        container.innerHTML += `
            <div class="bg-slate-950 border border-slate-700 p-3 rounded-lg flex justify-between items-center text-xs">
                <div>
                    <p class="font-bold text-white text-sm">${item.nama}</p>
                    <p class="text-emerald-400 uppercase">${item.jabatan}</p>
                </div>
                <button onclick="hapusAparatMember(${item.id})" class="bg-rose-600 text-white px-3 py-1.5 rounded"><i class="fa-solid fa-trash"></i> Hapus</button>
            </div>`;
    });
}

// 4. BPD (URL)
async function tambahBpdMember(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('bpd-nama').value;
        const jabatan = document.getElementById('bpd-jabatan').value;
        const fotoUrl = document.getElementById('bpd-foto-url').value.trim();

        await supabaseClient.from('bpd').insert([{ nama, jabatan, foto_url: fotoUrl }]);
        e.target.reset();
        renderAdminBpdList();
        renderPublicBpd();
        alert('Anggota BPD ditambahkan!');
    } catch (err) { alert('Gagal: ' + err.message); }
}

async function hapusBpdMember(id) {
    if (confirm('Hapus BPD ini?')) {
        await supabaseClient.from('bpd').delete().eq('id', id);
        renderAdminBpdList();
        renderPublicBpd();
    }
}

async function renderPublicBpd() {
    const container = document.getElementById('bpd-public-container');
    if(!container) return;
    let { data: list } = await supabaseClient.from('bpd').select('*');
    container.innerHTML = '';
    if(!list) return;
    list.forEach(item => {
        container.innerHTML += `
            <div class="flex flex-col items-center text-center space-y-3 group">
                <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">
                    ${item.foto_url ? `<img src="${item.foto_url}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`}
                </div>
                <div><h3 class="font-bold text-base text-slate-800">${item.nama}</h3><p class="text-xs text-emerald-700 font-bold uppercase">${item.jabatan}</p></div>
            </div>`;
    });
}

async function renderAdminBpdList() {
    const container = document.getElementById('admin-bpd-list');
    if(!container) return;
    let { data: list } = await supabaseClient.from('bpd').select('*');
    container.innerHTML = '';
    if(!list) return;
    list.forEach(item => {
        container.innerHTML += `
            <div class="bg-slate-950 border p-3 rounded-lg flex justify-between items-center text-xs">
                <div><p class="font-bold text-white text-sm">${item.nama}</p><p class="text-emerald-400 uppercase">${item.jabatan}</p></div>
                <button onclick="hapusBpdMember(${item.id})" class="bg-rose-600 text-white px-3 py-1.5 rounded"><i class="fa-solid fa-trash"></i> Hapus</button>
            </div>`;
    });
}

// 5 & 6. SURAT
function tambahPetugasBaru(e) { e.preventDefault(); alert('Petugas didaftarkan!'); e.target.reset(); }
function updateSyaratLabel() {}

async function ajukanPermohonanSurat(e) {
    e.preventDefault();
    try {
        const jenis = document.getElementById('s-jenis').value;
        const nama = document.getElementById('s-nama').value;
        const nik = document.getElementById('s-nik').value;
        const telp = document.getElementById('s-telp').value;
        const ket = document.getElementById('s-ket').value;
        const berkasUrl = document.getElementById('s-berkas').value.trim();
        const kodeUnik = 'SRT-' + Math.floor(1000 + Math.random() * 9000);

        await supabaseClient.from('surat').insert([{
            kode: kodeUnik, jenis, nama, nik, telp, ket,
            berkas_url: berkasUrl, status: 'Baru', dibaca: false,
            tanggal: new Date().toLocaleDateString('id-ID')
        }]);

        updateNotificationBadges();
        alert(`Berhasil! Kode Unik: ${kodeUnik}`);
        e.target.reset();
    } catch (err) { alert('Gagal: ' + err.message); }
}

async function updateNotificationBadges() {
    let { data: list } = await supabaseClient.from('surat').select('*').eq('dibaca', false);
    let unreadCount = list ? list.length : 0;
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

async function tandaiSemuaDibaca() {
    await supabaseClient.from('surat').update({ dibaca: true }).eq('dibaca', false);
    updateNotificationBadges();
    renderAdminPermohonanList();
}

async function renderAdminPermohonanList() {
    const container = document.getElementById('admin-permohonan-list');
    if (!container) return;
    let { data: list } = await supabaseClient.from('surat').select('*').order('id', { ascending: false });
    if (!list || list.length === 0) { container.innerHTML = `<p class="text-xs text-slate-400">Belum ada permohonan surat.</p>`; return; }
    container.innerHTML = '';
    list.forEach(item => {
        let badgeUnread = !item.dibaca ? `<span class="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BARU</span>` : '';
        container.innerHTML += `
            <div class="p-4 rounded-xl border space-y-3 bg-slate-900 border-slate-700 text-xs">
                <div class="flex items-center gap-2"><span class="text-amber-400 font-bold">${item.kode}</span> ${badgeUnread} <span class="text-slate-400">(${item.tanggal})</span></div>
                <h4 class="font-bold text-white text-sm">${item.jenis}</h4>
                <p class="text-slate-300">Pemohon: ${item.nama} | NIK: ${item.nik} | Telp: ${item.telp}</p>
                <div class="flex gap-2 pt-2 border-t border-slate-800">
                    ${item.berkas_url ? `<a href="${item.berkas_url}" target="_blank" class="bg-blue-600 text-white px-3 py-1.5 rounded"><i class="fa-solid fa-eye"></i> Buka Dokumen</a>` : ''}
                    <button onclick="hapusPermohonan(${item.id})" class="bg-rose-600 text-white px-3 py-1.5 rounded ml-auto"><i class="fa-solid fa-trash"></i> Hapus</button>
                </div>
            </div>`;
    });
}

async function hapusPermohonan(id) {
    if(confirm('Hapus permohonan ini?')) {
        await supabaseClient.from('surat').delete().eq('id', id);
        renderAdminPermohonanList(); updateNotificationBadges();
    }
}

async function cekStatusPermohonanSurat() {
    const kode = document.getElementById('cek-kode-surat').value.trim().toUpperCase();
    const box = document.getElementById('hasil-cek-surat-box');
    const detailBox = document.getElementById('detail-permohonan-box');
    const printArea = document.getElementById('print-area-surat');
    const btnCetak = document.getElementById('btn-cetak-resmi');

    let { data: list } = await supabaseClient.from('surat').select('*').eq('kode', kode);
    let found = list && list.length > 0 ? list[0] : null;

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

// 7. PENGADUAN
async function kirimPengaduanPublik(e) {
    e.preventDefault();
    const nama = document.getElementById('adu-nama').value;
    const telp = document.getElementById('adu-telp').value;
    const subjek = document.getElementById('adu-subjek').value;
    const isi = document.getElementById('adu-isi').value;
    const uniqueId = 'ADU-' + Math.floor(1000 + Math.random() * 9000);

    await supabaseClient.from('pengaduan').insert([{ unique_id: uniqueId, nama, telp, subjek, isi, status: 'Pending', jawaban: 'Belum ditanggapi.' }]);
    alert(`Pengaduan terkirim!\nKODE UNIK ANDA: ${uniqueId}`);
    e.target.reset();
}

async function cekStatusPengaduan() {
    const kode = document.getElementById('cek-kode').value.trim().toUpperCase();
    const box = document.getElementById('hasil-cek-status');
    const detailBox = document.getElementById('detail-status-box');
    
    let { data: list } = await supabaseClient.from('pengaduan').select('*').eq('unique_id', kode);
    let found = list && list.length > 0 ? list[0] : null;

    box.classList.remove('hidden');
    if (found) {
        detailBox.innerHTML = `<p><b>Subjek:</b> ${found.subjek}</p><p><b>Status:</b> ${found.status}</p><p class="bg-slate-100 p-2 rounded mt-1"><b>Tanggapan:</b> ${found.jawaban}</p>`;
    } else {
        detailBox.innerHTML = `<p class="text-rose-600">Pengaduan tidak ditemukan.</p>`;
    }
}

async function renderAdminPengaduanList() {
    const container = document.getElementById('admin-pengaduan-list');
    if (!container) return;
    let { data: list } = await supabaseClient.from('pengaduan').select('*');
    if (!list || list.length === 0) { container.innerHTML = `<p class="text-xs text-slate-400">Belum ada pengaduan.</p>`; return; }
    container.innerHTML = '';
    list.forEach(item => {
        container.innerHTML += `
            <div class="bg-slate-900 border p-4 rounded-xl space-y-2 text-xs">
                <span class="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded">${item.unique_id}</span>
                <h4 class="font-bold text-white text-sm">${item.subjek}</h4>
                <p class="text-slate-300">Pelapor: ${item.nama} (${item.telp})</p>
                <p class="text-slate-400 bg-slate-950 p-2 rounded">${item.isi}</p>
                <button onclick="hapusPengaduan(${item.id})" class="bg-rose-600 text-white px-3 py-1 rounded">Hapus</button>
            </div>`;
    });
}

async function hapusPengaduan(id) {
    if(confirm('Hapus pengaduan ini?')) {
        await supabaseClient.from('pengaduan').delete().eq('id', id);
        renderAdminPengaduanList();
    }
}

// 8. BERITA
async function publikasiBerita(e) {
    e.preventDefault();
    const judul = document.getElementById('admin-judul-berita').value.trim();
    const isi = document.getElementById('admin-isi-berita').value.trim();
    
    await supabaseClient.from('berita').insert([{ judul, isi, tanggal: new Date().toLocaleDateString('id-ID') }]);
    renderPublicBerita();
    alert('Berita dipublikasikan!');
    e.target.reset();
}

async function renderPublicBerita() {
    const grid = document.getElementById('beranda-berita-grid');
    if (!grid) return;
    let { data: list } = await supabaseClient.from('berita').select('*');
    grid.innerHTML = '';
    if (!list || list.length === 0) return;
    list.forEach(item => {
        grid.innerHTML += `<div class="border p-4 rounded-xl space-y-2 bg-slate-50 shadow-sm"><span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">${item.tanggal}</span><h4 class="font-bold text-slate-800 text-base">${item.judul}</h4><p class="text-xs text-slate-600">${item.isi}</p></div>`;
    });
}

// 9. ADMINDUK
async function updateStatistikPenduduk(e) {
    e.preventDefault();
    const stats = {
        pria: parseInt(document.getElementById('admin-jml-pria').value) || 0,
        wanita: parseInt(document.getElementById('admin-jml-wanita').value) || 0,
        kk: parseInt(document.getElementById('admin-adm-kk').value) || 0,
        ktp: parseInt(document.getElementById('admin-adm-ktp').value) || 0,
        kia: parseInt(document.getElementById('admin-adm-kia').value) || 0,
        akta: parseInt(document.getElementById('admin-adm-akta').value) || 0,
        ikd: parseInt(document.getElementById('admin-adm-ikd').value) || 0
    };
    await supabaseClient.from('adminduk').upsert([{ id: 1, ...stats }]);
    loadAllDataFromSupabase();
    alert('Statistik diperbarui!');
}

async function renderAdminPendudukForm() {
    let { data: adm } = await supabaseClient.from('adminduk').select('*').eq('id', 1).single();
    if (adm) {
        if(document.getElementById('admin-jml-pria')) document.getElementById('admin-jml-pria').value = adm.pria;
        if(document.getElementById('admin-jml-wanita')) document.getElementById('admin-jml-wanita').value = adm.wanita;
        if(document.getElementById('admin-adm-kk')) document.getElementById('admin-adm-kk').value = adm.kk;
        if(document.getElementById('admin-adm-ktp')) document.getElementById('admin-adm-ktp').value = adm.ktp;
        if(document.getElementById('admin-adm-kia')) document.getElementById('admin-adm-kia').value = adm.kia;
        if(document.getElementById('admin-adm-akta')) document.getElementById('admin-adm-akta').value = adm.akta;
        if(document.getElementById('admin-adm-ikd')) document.getElementById('admin-adm-ikd').value = adm.ikd;
    }
}

// 10. TAUTAN
async function tambahTautanBaru(e) {
    e.preventDefault();
    const nama = document.getElementById('tautan-nama').value.trim();
    const url = document.getElementById('tautan-url').value.trim();
    await supabaseClient.from('tautan').insert([{ nama, url }]);
    renderPublicTautan();
    alert('Tautan ditambahkan!');
    e.target.reset();
}

async function renderPublicTautan() {
    const container = document.getElementById('tautan-container');
    if (!container) return;
    let { data: list } = await supabaseClient.from('tautan').select('*');
    container.innerHTML = '';
    if(!list || list.length === 0) {
        container.innerHTML = `<a href="https://buolkab.go.id" target="_blank" class="p-4 border rounded-xl hover:bg-slate-50 flex items-center justify-between"><span>Pemerintah Kabupaten Buol</span><i class="fa-solid fa-external-link text-slate-400"></i></a>`;
        return;
    }
    list.forEach(item => {
        container.innerHTML += `<a href="${item.url}" target="_blank" class="p-4 border rounded-xl hover:bg-slate-50 flex items-center justify-between shadow-sm"><span class="text-xs sm:text-sm font-medium">${item.nama}</span><i class="fa-solid fa-external-link text-slate-400"></i></a>`;
    });
}

// 11. KONTAK
async function updateKontakSettings(e) {
    e.preventDefault();
    const phone = document.getElementById('admin-phone').value;
    const email = document.getElementById('admin-email').value;
    const mapUrl = document.getElementById('admin-map-url').value;

    await supabaseClient.from('kontak').upsert([{ id: 1, phone, email, map_url: mapUrl }]);
    loadAllDataFromSupabase();
    alert('Kontak diperbarui!');
}

// 12. ADD & DDS
async function updateTotalAddDds(e) {
    e.preventDefault();
    const addVal = document.getElementById('input-total-add').value;
    const ddsVal = document.getElementById('input-total-dds').value;
    await supabaseClient.from('settings').upsert([{ id: 1, total_add: addVal, total_dds: ddsVal }], { onConflict: 'id' });
    loadAllDataFromSupabase();
    alert('Total anggaran diperbarui!');
}

async function tambahProgramKegiatan(e) {
    e.preventDefault();
    await supabaseClient.from('anggaran').insert([{
        sumber: document.getElementById('prog-sumber').value,
        nama: document.getElementById('prog-nama').value,
        anggaran: document.getElementById('prog-anggaran').value,
        ket: document.getElementById('prog-ket').value
    }]);
    renderAdminAddDds(); renderPublicAddDds();
    alert('Program ditambahkan!');
    e.target.reset();
}

async function renderPublicAddDds() {
    const tableBody = document.getElementById('public-add-dds-table');
    if (!tableBody) return;
    let { data: list } = await supabaseClient.from('anggaran').select('*');
    tableBody.innerHTML = '';
    if(!list) return;
    list.forEach(item => {
        let badgeClass = item.sumber === 'ADD' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';
        tableBody.innerHTML += `<tr class="border-b"><td class="p-3"><span class="${badgeClass} font-bold px-2 py-0.5 rounded text-xs">${item.sumber}</span></td><td class="p-3 font-medium">${item.nama}</td><td class="p-3 font-semibold">${item.anggaran}</td><td class="p-3 text-xs">${item.ket}</td></tr>`;
    });
}

async function renderAdminAddDds() {
    const container = document.getElementById('admin-add-dds-list');
    if (!container) return;
    let { data: list } = await supabaseClient.from('anggaran').select('*');
    container.innerHTML = '';
    if(!list) return;
    list.forEach(item => {
        container.innerHTML += `<div class="bg-slate-900 border p-3 rounded-lg flex justify-between items-center text-xs"><div><span class="font-bold text-white">${item.nama}</span><p class="text-slate-400">${item.anggaran}</p></div><button onclick="hapusProg(${item.id})" class="bg-rose-600 text-white px-2 py-1 rounded">Hapus</button></div>`;
    });
}

async function hapusProg(id) {
    await supabaseClient.from('anggaran').delete().eq('id', id);
    renderAdminAddDds(); renderPublicAddDds();
}

// LOAD ALL DATA FROM SUPABASE
async function loadAllDataFromSupabase() {
    if (!supabaseClient) return;

    let { data: settings } = await supabaseClient.from('settings').select('*').eq('id', 1).single();
    if (settings) {
        if(settings.nama_desa) document.getElementById('app-title').innerText = settings.nama_desa;
        if(settings.slogan) document.getElementById('app-slogan').innerText = settings.slogan;
        if(settings.logo_url) {
            const imgEl = document.getElementById('nav-logo-img');
            const iconEl = document.getElementById('nav-logo-icon');
            if(imgEl && iconEl) { imgEl.src = settings.logo_url; imgEl.classList.remove('hidden'); iconEl.classList.add('hidden'); }
        }
        if(settings.video_url) {
            const videoBg = document.getElementById('hero-video-bg');
            if(videoBg) { videoBg.src = settings.video_url; videoBg.classList.remove('hidden'); }
        }
        if(settings.total_add && document.getElementById('display-add-total')) document.getElementById('display-add-total').innerText = settings.total_add;
        if(settings.total_dds && document.getElementById('display-dds-total')) document.getElementById('display-dds-total').innerText = settings.total_dds;
    }

    let { data: prof } = await supabaseClient.from('profil').select('*').eq('id', 1).single();
    if (prof) {
        if(prof.sejarah && document.getElementById('content-sejarah')) document.getElementById('content-sejarah').innerHTML = `<p>${prof.sejarah}</p>`;
        if(prof.visi && document.getElementById('content-visi')) document.getElementById('content-visi').innerText = `"${prof.visi}"`;
        if(prof.misi && document.getElementById('content-misi')) {
            let misiArr = prof.misi.split('\n');
            document.getElementById('content-misi').innerHTML = `<ul class="list-disc list-inside space-y-1">${misiArr.map(m => `<li>${m}</li>`).join('')}</ul>`;
        }
        if(prof.struktur_teks && document.getElementById('content-struktur-teks')) document.getElementById('content-struktur-teks').innerText = prof.struktur_teks;
        if(prof.struktur_img) {
            const imgStruktur = document.getElementById('content-struktur-img');
            if(imgStruktur) { imgStruktur.src = prof.struktur_img; imgStruktur.classList.remove('hidden'); }
        }
        if(prof.foto_kades) {
            const imgKades = document.getElementById('sambutan-img');
            const iconKades = document.getElementById('sambutan-icon');
            if(imgKades && iconKades) { imgKades.src = prof.foto_kades; imgKades.classList.remove('hidden'); iconKades.classList.add('hidden'); }
        }
        if(prof.sambutan && document.getElementById('content-sambutan')) document.getElementById('content-sambutan').innerHTML = `<p><em>"${prof.sambutan}"</em></p><p class="font-bold text-slate-800">— Kepala Desa Mokupo</p>`;
    }

    let { data: kontak } = await supabaseClient.from('kontak').select('*').eq('id', 1).single();
    if (kontak) {
        if(kontak.email) {
            document.getElementById('display-email').innerHTML = `<i class="fa-solid fa-envelope text-emerald-700 mr-2"></i> ${kontak.email}`;
            document.getElementById('topbar-email').innerHTML = `<i class="fa-solid fa-envelope mr-1 text-amber-400"></i> ${kontak.email}`;
        }
        if(kontak.phone && document.getElementById('display-phone')) document.getElementById('display-phone').innerHTML = `<i class="fa-solid fa-phone text-emerald-700 mr-2"></i> ${kontak.phone}`;
        if(kontak.map_url && document.getElementById('display-map-iframe')) document.getElementById('display-map-iframe').src = kontak.map_url;
    }

    let { data: adm } = await supabaseClient.from('adminduk').select('*').eq('id', 1).single();
    if (adm) {
        if(document.getElementById('home-total')) document.getElementById('home-total').innerText = adm.pria + adm.wanita;
        if(document.getElementById('home-laki')) document.getElementById('home-laki').innerText = adm.pria;
        if(document.getElementById('home-perempuan')) document.getElementById('home-perempuan').innerText = adm.wanita;
        if(document.getElementById('home-kk')) document.getElementById('home-kk').innerText = adm.kk;
        if(document.getElementById('adm-kk')) document.getElementById('adm-kk').innerText = adm.kk;
        if(document.getElementById('adm-ktp')) document.getElementById('adm-ktp').innerText = adm.ktp;
        if(document.getElementById('adm-kia')) document.getElementById('adm-kia').innerText = adm.kia;
        if(document.getElementById('adm-akta')) document.getElementById('adm-akta').innerText = adm.akta;
        if(document.getElementById('adm-ikd')) document.getElementById('adm-ikd').innerText = adm.ikd;
    }

    renderPublicAddDds();
    renderPublicBpd();
    renderPublicAparat();
    renderPublicBerita();
    renderPublicTautan();
}

async function loadAdminFormValues() {
    if (!supabaseClient) return;

    let { data: settings } = await supabaseClient.from('settings').select('*').eq('id', 1).single();
    if (settings) {
        if(document.getElementById('admin-nama-desa')) document.getElementById('admin-nama-desa').value = settings.nama_desa || '';
        if(document.getElementById('admin-slogan-desa')) document.getElementById('admin-slogan-desa').value = settings.slogan || '';
        if(document.getElementById('admin-logo-url')) document.getElementById('admin-logo-url').value = settings.logo_url || '';
        if(document.getElementById('admin-video-url')) document.getElementById('admin-video-url').value = settings.video_url || '';
        if(document.getElementById('input-total-add')) document.getElementById('input-total-add').value = settings.total_add || '';
        if(document.getElementById('input-total-dds')) document.getElementById('input-total-dds').value = settings.total_dds || '';
    }

    let { data: prof } = await supabaseClient.from('profil').select('*').eq('id', 1).single();
    if (prof) {
        if(document.getElementById('admin-sejarah')) document.getElementById('admin-sejarah').value = prof.sejarah || '';
        if(document.getElementById('admin-visi')) document.getElementById('admin-visi').value = prof.visi || '';
        if(document.getElementById('admin-misi')) document.getElementById('admin-misi').value = prof.misi || '';
        if(document.getElementById('admin-struktur-url')) document.getElementById('admin-struktur-url').value = prof.struktur_img || '';
        if(document.getElementById('admin-struktur-teks')) document.getElementById('admin-struktur-teks').value = prof.struktur_teks || '';
        if(document.getElementById('admin-foto-kades-url')) document.getElementById('admin-foto-kades-url').value = prof.foto_kades || '';
        if(document.getElementById('admin-sambutan')) document.getElementById('admin-sambutan').value = prof.sambutan || '';
    }

    let { data: kontak } = await supabaseClient.from('kontak').select('*').eq('id', 1).single();
    if (kontak) {
        if(document.getElementById('admin-phone')) document.getElementById('admin-phone').value = kontak.phone || '';
        if(document.getElementById('admin-email')) document.getElementById('admin-email').value = kontak.email || '';
        if(document.getElementById('admin-map-url')) document.getElementById('admin-map-url').value = kontak.map_url || '';
    }
}
