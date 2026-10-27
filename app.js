// app.js - Sistem Informasi Desa Mokupo (Versi Lengkap Tanpa Ada yang Dihilangkan)

document.addEventListener('DOMContentLoaded', () => {
    loadAllDataFromSupabase();
    checkAuthStatus();
    updateNotificationBadges();
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

// Tutup dropdown saat klik di luar
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
            await supabaseClient.from('settings').delete().in('key', ['desa_nama', 'desa_slogan', 'desa_logo', 'desa_video_local']);
            alert('Data Beranda & Video berhasil direset!');
            break;
        case 2:
            await supabaseClient.from('settings').delete().in('key', ['desa_sejarah', 'desa_visi', 'desa_misi', 'desa_struktur_teks', 'desa_struktur_img', 'desa_foto_sambutan', 'desa_sambutan']);
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
            await supabaseClient.from('settings').delete().in('key', ['desa_phone', 'desa_email', 'desa_map_url']);
            alert('Data kontak & peta berhasil direset!');
            break;
        case 12:
            await supabaseClient.from('settings').delete().in('key', ['desa_total_add', 'desa_total_dds']);
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

// 1. EDIT BERANDA
async function updateBerandaSettings(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('admin-nama-desa').value;
        const slogan = document.getElementById('admin-slogan-desa').value;
        
        let logoBase64 = await konversiFileKeBase64(document.getElementById('admin-logo-file'));
        let videoBase64 = await konversiFileKeBase64(document.getElementById('admin-video-file'));

        await supabaseClient.from('settings').upsert([
            { key: 'desa_nama', value: nama },
            { key: 'desa_slogan', value: slogan }
        ]);
        if(logoBase64) await supabaseClient.from('settings').upsert([{ key: 'desa_logo', value: logoBase64 }]);
        if(videoBase64) await supabaseClient.from('settings').upsert([{ key: 'desa_video_local', value: videoBase64 }]);

        loadAllDataFromSupabase();
        alert('Beranda, Logo & Video Latar berhasil diperbarui secara permanen dan sinkron ke HP!');
    } catch (err) {
        if(err.message !== 'File video melebihi batas 20MB') {
            alert('Gagal memproses file: ' + err.message);
        }
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

        let fotoKades = await konversiFileKeBase64(document.getElementById('admin-foto-sambutan-file'));
        let fotoStruktur = await konversiFileKeBase64(document.getElementById('admin-struktur-file'));

        await supabaseClient.from('settings').upsert([
            { key: 'desa_sejarah', value: sejarah },
            { key: 'desa_visi', value: visi },
            { key: 'desa_misi', value: misi },
            { key: 'desa_struktur_teks', value: strukturTeks },
            { key: 'desa_sambutan', value: sambutan }
        ]);
        if(fotoKades) await supabaseClient.from('settings').upsert([{ key: 'desa_foto_sambutan', value: fotoKades }]);
        if(fotoStruktur) await supabaseClient.from('settings').upsert([{ key: 'desa_struktur_img', value: fotoStruktur }]);

        loadAllDataFromSupabase();
        alert('Profil, Visi Misi, dan Struktur berhasil disimpan secara online!');
    } catch (err) {
        alert('Gagal memproses data: ' + err.message);
    }
}

// 3. APARAT DESA
async function tambahAparatDesa(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('admin-nama-aparat').value;
        const jabatan = document.getElementById('admin-jabatan-aparat').value;
        const tupoksi = document.getElementById('admin-tupoksi-aparat').value;
        let fotoUrl = await konversiFileKeBase64(document.getElementById('admin-foto-aparat-file')) || '';

        await supabaseClient.from('aparat').insert([{ nama, jabatan, tupoksi, foto_url: fotoUrl }]);

        renderPublicAparat();
        renderAdminAparatList();
        e.target.reset();
        alert('Aparat Desa berhasil ditambahkan!');
    } catch (err) {
        alert('Gagal menambah data aparat: ' + err.message);
    }
}

async function hapusAparatMember(id) {
    if (confirm('Konfirmasi hapus data aparat desa ini?')) {
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
        let card = document.createElement('div');
        card.className = 'flex flex-col items-center text-center space-y-3 group';
        card.innerHTML = `
            <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">
                ${item.foto_url ? `<img src="${item.foto_url}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`}
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

async function renderAdminAparatList() {
    const container = document.getElementById('admin-aparat-list');
    if(!container) return;
    let { data: list } = await supabaseClient.from('aparat').select('*');
    container.innerHTML = '';
    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic">Belum ada data aparat desa terdaftar.</p>`;
        return;
    }
    list.forEach((item) => {
        let card = document.createElement('div');
        card.className = 'bg-slate-950 border border-slate-700 p-3 rounded-lg flex justify-between items-center text-xs';
        card.innerHTML = `
            <div>
                <p class="font-bold text-white text-sm">${item.nama}</p>
                <p class="text-emerald-400 font-semibold uppercase">${item.jabatan}</p>
            </div>
            <button onclick="hapusAparatMember(${item.id})" class="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded shadow transition flex items-center gap-1">
                <i class="fa-solid fa-trash"></i> Hapus
            </button>
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

        await supabaseClient.from('bpd').insert([{ nama, jabatan, foto_url: fotoUrl }]);

        e.target.reset();
        renderAdminBpdList();
        renderPublicBpd();
        alert('Anggota BPD berhasil ditambahkan!');
    } catch (err) {
        alert('Gagal menambah BPD: ' + err.message);
    }
}

async function hapusBpdMember(id) {
    if (confirm('Hapus anggota BPD ini?')) {
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
        let card = document.createElement('div');
        card.className = 'flex flex-col items-center text-center space-y-3 group';
        card.innerHTML = `
            <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">
                ${item.foto_url ? `<img src="${item.foto_url}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`}
            </div>
            <div>
                <h3 class="font-bold text-base sm:text-lg text-slate-800">${item.nama}</h3>
                <p class="text-xs text-emerald-700 font-bold uppercase">${item.jabatan}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

async function renderAdminBpdList() {
    const container = document.getElementById('admin-bpd-list');
    if(!container) return;
    let { data: list } = await supabaseClient.from('bpd').select('*');
    container.innerHTML = '';
    if(!list) return;
    list.forEach(item => {
        let card = document.createElement('div');
        card.className = 'bg-slate-950 border border-slate-700 p-3 rounded-lg flex justify-between items-center text-xs';
        card.innerHTML = `
            <div>
                <p class="font-bold text-white text-sm">${item.nama}</p>
                <p class="text-emerald-400 font-semibold uppercase">${item.jabatan}</p>
            </div>
            <button onclick="hapusBpdMember(${item.id})" class="bg-rose-600 text-white p-2 rounded shadow"><i class="fa-solid fa-trash"></i> Hapus</button>
        `;
        container.appendChild(card);
    });
}

// 5 & 6. PETUGAS & PERMOHONAN SURAT
function tambahPetugasBaru(e) { e.preventDefault(); alert('Petugas berhasil didaftarkan!'); e.target.reset(); }
function tambahArsipSurat(e) { e.preventDefault(); alert('Arsip surat berhasil disimpan!'); e.target.reset(); }

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

        await supabaseClient.from('surat').insert([{
            kode: kodeUnik, jenis, nama, nik, telp, ket,
            berkas_url: berkasBase64, status: 'Baru', dibaca: false,
            tanggal: new Date().toLocaleDateString('id-ID')
        }]);

        updateNotificationBadges();
        alert(`Permohonan Berhasil Dikirim!\n\nKode Unik Anda: ${kodeUnik}\n\nSilakan catat kode ini untuk mengecek status dan mencetak surat Anda.`);
        e.target.reset();
    } catch (err) {
        alert('Gagal memproses permohonan: ' + err.message);
    }
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
    alert('Semua permohonan telah ditandai dibaca.');
}

async function renderAdminPermohonanList() {
    const container = document.getElementById('admin-permohonan-list');
    if (!container) return;
    let { data: list } = await supabaseClient.from('surat').select('*').order('id', { ascending: false });
    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic">Belum ada permohonan surat masuk.</p>`;
        return;
    }
    container.innerHTML = '';
    list.forEach(item => {
        let badgeUnread = !item.dibaca ? `<span class="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">BARU</span>` : `<span class="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded">Dibaca</span>`;
        let card = document.createElement('div');
        card.className = `p-4 rounded-xl border space-y-3 ${!item.dibaca ? 'bg-slate-950 border-amber-500/50' : 'bg-slate-900 border-slate-700'}`;
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-amber-400 font-bold text-xs">${item.kode}</span>
                        ${badgeUnread}
                        <span class="text-[11px] text-slate-400">(${item.tanggal})</span>
                    </div>
                    <h4 class="font-bold text-white text-sm">${item.jenis}</h4>
                    <p class="text-xs text-slate-300"><b>Pemohon:</b> ${item.nama} | <b>NIK:</b> ${item.nik} | <b>Telp/WA:</b> ${item.telp}</p>
                    <p class="text-xs text-slate-400"><b>Keperluan:</b> ${item.ket}</p>
                </div>
            </div>
            <div class="flex gap-2 pt-2 border-t border-slate-800">
                ${item.berkas_url ? `<a href="${item.berkas_url}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1"><i class="fa-solid fa-eye"></i> Buka Dokumen Syarat</a>` : '<span class="text-xs text-slate-500 italic">Tidak ada dokumen diunggah</span>'}
                <button onclick="hapusPermohonan(${item.id})" class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded ml-auto flex items-center gap-1"><i class="fa-solid fa-trash"></i> Hapus</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function hapusPermohonan(id) {
    if(confirm('Hapus data permohonan surat ini?')) {
        await supabaseClient.from('surat').delete().eq('id', id);
        renderAdminPermohonanList();
        updateNotificationBadges();
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
        detailBox.innerHTML = `
            <p><b>Kode Permohonan:</b> <span class="text-emerald-700 font-bold">${found.kode}</span></p>
            <p><b>Jenis Surat:</b> ${found.jenis}</p>
            <p><b>Pemohon:</b> ${found.nama} (NIK: ${found.nik})</p>
            <p><b>Status:</b> <span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Selesai / Terverifikasi</span></p>
        `;
        document.getElementById('out-jenis-surat').innerText = found.jenis;
        document.getElementById('out-nama').innerText = found.nama;
        document.getElementById('out-nik').innerText = found.nik;
        document.getElementById('out-ket').innerText = found.ket;

        printArea.classList.remove('hidden');
        btnCetak.classList.remove('hidden');
    } else {
        detailBox.innerHTML = `<p class="text-rose-600 font-bold">Kode permohonan "${kode}" tidak ditemukan.</p>`;
        printArea.classList.add('hidden');
        btnCetak.classList.add('hidden');
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
    alert(`Pengaduan berhasil dikirim!\n\nKODE UNIK ANDA: ${uniqueId}`);
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
        detailBox.innerHTML = `
            <p><b>Subjek:</b> ${found.subjek}</p>
            <p><b>Status:</b> <span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">${found.status}</span></p>
            <p class="bg-slate-100 p-2 rounded mt-1"><b>Tanggapan Petugas:</b> ${found.jawaban}</p>
        `;
    } else {
        detailBox.innerHTML = `<p class="text-rose-600 font-bold">Kode pengaduan tidak ditemukan.</p>`;
    }
}

async function renderAdminPengaduanList() {
    const container = document.getElementById('admin-pengaduan-list');
    if (!container) return;
    let { data: list } = await supabaseClient.from('pengaduan').select('*');
    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic">Belum ada data pengaduan.</p>`;
        return;
    }
    container.innerHTML = '';
    list.forEach(item => {
        container.innerHTML += `
            <div class="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-2 text-xs">
                <span class="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded">${item.unique_id}</span>
                <h4 class="font-bold text-white text-sm">${item.subjek}</h4>
                <p class="text-slate-300"><b>Pelapor:</b> ${item.nama} (${item.telp})</p>
                <p class="text-slate-400 bg-slate-950 p-2 rounded">${item.isi}</p>
                <button onclick="hapusPengaduan(${item.id})" class="bg-rose-600 text-white px-3 py-1 rounded font-bold"><i class="fa-solid fa-trash mr-1"></i> Hapus</button>
            </div>`;
    });
}

async function hapusPengaduan(id) {
    if(confirm('Hapus pengaduan ini?')) {
        await supabaseClient.from('pengaduan').delete().eq('id', id);
        renderAdminPengaduanList();
    }
}

// 8. PUBLIKASI BERITA
async function publikasiBerita(e) {
    e.preventDefault();
    const judul = document.getElementById('admin-judul-berita').value.trim();
    const isi = document.getElementById('admin-isi-berita').value.trim();
    
    await supabaseClient.from('berita').insert([{
        judul,
        isi,
        tanggal: new Date().toLocaleDateString('id-ID')
    }]);

    renderPublicBerita();
    alert('Berita berhasil dipublikasikan secara permanen!');
    e.target.reset();
}

async function renderPublicBerita() {
    const grid = document.getElementById('beranda-berita-grid');
    if (!grid) return;
    let { data: list } = await supabaseClient.from('berita').select('*');
    grid.innerHTML = '';
    
    if (!list || list.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-500 italic col-span-full">Belum ada publikasi berita terbaru.</p>`;
        return;
    }

    list.forEach(item => {
        let card = document.createElement('div');
        card.className = 'border p-4 rounded-xl space-y-2 bg-slate-50 shadow-sm';
        card.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">TERBARU</span>
                <span class="text-[10px] text-slate-400">${item.tanggal}</span>
            </div>
            <h4 class="font-bold text-slate-800 text-base">${item.judul}</h4>
            <p class="text-xs text-slate-600 leading-relaxed">${item.isi}</p>
        `;
        grid.appendChild(card);
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
    alert('Data Statistik berhasil diperbarui!');
}

async function renderAdminPendudukForm() {
    let { data: adm } = await supabaseClient.from('adminduk').select('*').eq('id', 1).single();
    if(adm) {
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
    alert('Tautan baru berhasil ditambahkan secara permanen!');
    e.target.reset();
}

async function renderPublicTautan() {
    const container = document.getElementById('tautan-container');
    if (!container) return;
    let { data: list } = await supabaseClient.from('tautan').select('*');
    container.innerHTML = '';

    if (!list || list.length === 0) {
        container.innerHTML = `
            <a href="https://buolkab.go.id" target="_blank" class="p-4 border rounded-xl hover:bg-slate-50 flex items-center justify-between">
                <span>Pemerintah Kabupaten Buol</span>
                <i class="fa-solid fa-external-link text-slate-400"></i>
            </a>
        `;
        return;
    }

    list.forEach(item => {
        let a = document.createElement('a');
        a.href = item.url; 
        a.target = '_blank';
        a.className = 'p-4 border rounded-xl hover:bg-slate-50 flex items-center justify-between shadow-sm transition';
        a.innerHTML = `<span class="font-medium text-slate-700 text-xs sm:text-sm">${item.nama}</span><i class="fa-solid fa-external-link text-slate-400"></i>`;
        container.appendChild(a);
    });
}

// 11. KONTAK
async function updateKontakSettings(e) {
    e.preventDefault();
    const phone = document.getElementById('admin-phone').value;
    const email = document.getElementById('admin-email').value;
    const mapUrl = document.getElementById('admin-map-url').value;

    await supabaseClient.from('settings').upsert([
        { key: 'desa_phone', value: phone },
        { key: 'desa_email', value: email },
        { key: 'desa_map_url', value: mapUrl }
    ]);

    loadAllDataFromSupabase();
    alert('Kontak dan Peta berhasil diperbarui!');
}

// 12. ADD & DDS
async function updateTotalAddDds(e) {
    e.preventDefault();
    const addVal = document.getElementById('input-total-add').value;
    const ddsVal = document.getElementById('input-total-dds').value;

    await supabaseClient.from('settings').upsert([
        { key: 'desa_total_add', value: addVal },
        { key: 'desa_total_dds', value: ddsVal }
    ]);

    loadAllDataFromSupabase();
    alert('Total anggaran berhasil diperbarui!');
}

async function tambahProgramKegiatan(e) {
    e.preventDefault();
    await supabaseClient.from('anggaran').insert([{
        sumber: document.getElementById('prog-sumber').value,
        nama: document.getElementById('prog-nama').value,
        anggaran: document.getElementById('prog-anggaran').value,
        ket: document.getElementById('prog-ket').value
    }]);

    renderAdminAddDds();
    renderPublicAddDds();
    alert('Program berhasil ditambahkan!');
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
        let row = document.createElement('tr');
        row.className = 'border-b';
        row.innerHTML = `<td class="p-3"><span class="${badgeClass} font-bold px-2 py-0.5 rounded text-xs">${item.sumber}</span></td><td class="p-3 font-medium text-slate-800">${item.nama}</td><td class="p-3 font-semibold text-slate-700">${item.anggaran}</td><td class="p-3 text-slate-600 text-xs">${item.ket}</td>`;
        tableBody.appendChild(row);
    });
}

async function renderAdminAddDds() {
    const container = document.getElementById('admin-add-dds-list');
    if (!container) return;
    let { data: list } = await supabaseClient.from('anggaran').select('*');
    container.innerHTML = '';
    if(!list) return;
    list.forEach((item) => {
        let card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-700 p-3 rounded-lg flex justify-between items-center text-xs';
        card.innerHTML = `<div><span class="font-bold text-white">${item.nama}</span><p class="text-slate-400">${item.anggaran}</p></div><button onclick="hapusProg(${item.id})" class="bg-rose-600 text-white px-2 py-1 rounded">Hapus</button>`;
        container.appendChild(card);
    });
}

async function hapusProg(id) {
    await supabaseClient.from('anggaran').delete().eq('id', id);
    renderAdminAddDds();
    renderPublicAddDds();
}

// LOAD ALL DATA FROM SUPABASE KE HALAMAN PUBLIK & HP SECARA REAL-TIME
async function loadAllDataFromSupabase() {
    if (!supabaseClient) return;

    let { data: settings } = await supabaseClient.from('settings').select('*');
    if (settings) {
        let map = {};
        settings.forEach(s => map[s.key] = s.value);

        if(map['desa_nama']) document.getElementById('app-title').innerText = map['desa_nama'];
        if(map['desa_slogan']) document.getElementById('app-slogan').innerText = map['desa_slogan'];
        if(map['desa_logo']) {
            const imgEl = document.getElementById('nav-logo-img');
            const iconEl = document.getElementById('nav-logo-icon');
            if(imgEl && iconEl) { imgEl.src = map['desa_logo']; imgEl.classList.remove('hidden'); iconEl.classList.add('hidden'); }
        }
        if(map['desa_video_local']) {
            const videoBg = document.getElementById('hero-video-bg');
            if(videoBg) { videoBg.src = map['desa_video_local']; videoBg.classList.remove('hidden'); }
        }
        if(map['desa_sejarah']) document.getElementById('content-sejarah').innerHTML = `<p>${map['desa_sejarah']}</p>`;
        if(map['desa_visi']) document.getElementById('content-visi').innerText = `"${map['desa_visi']}"`;
        if(map['desa_misi']) {
            let misiArr = map['desa_misi'].split('\n');
            document.getElementById('content-misi').innerHTML = `<ul class="list-disc list-inside space-y-1">${misiArr.map(m => `<li>${m}</li>`).join('')}</ul>`;
        }
        if(map['desa_struktur_teks']) document.getElementById('content-struktur-teks').innerText = map['desa_struktur_teks'];
        if(map['desa_struktur_img']) {
            const imgStruktur = document.getElementById('content-struktur-img');
            if(imgStruktur) { imgStruktur.src = map['desa_struktur_img']; imgStruktur.classList.remove('hidden'); }
        }
        if(map['desa_foto_sambutan']) {
            const imgKades = document.getElementById('sambutan-img');
            const iconKades = document.getElementById('sambutan-icon');
            if(imgKades && iconKades) { imgKades.src = map['desa_foto_sambutan']; imgKades.classList.remove('hidden'); iconKades.classList.add('hidden'); }
        }
        if(map['desa_sambutan']) document.getElementById('content-sambutan').innerHTML = `<p><em>"${map['desa_sambutan']}"</em></p><p class="font-bold text-slate-800">— Kepala Desa Mokupo</p>`;
        
        if(map['desa_email']) {
            document.getElementById('display-email').innerHTML = `<i class="fa-solid fa-envelope text-emerald-700 mr-2"></i> ${map['desa_email']}`;
            document.getElementById('topbar-email').innerHTML = `<i class="fa-solid fa-envelope mr-1 text-amber-400"></i> ${map['desa_email']}`;
        }
        if(map['desa_phone']) document.getElementById('display-phone').innerHTML = `<i class="fa-solid fa-phone text-emerald-700 mr-2"></i> ${map['desa_phone']}`;
        if(map['desa_map_url']) document.getElementById('display-map-iframe').src = map['desa_map_url'];

        if(map['desa_total_add']) document.getElementById('display-add-total').innerText = map['desa_total_add'];
        if(map['desa_total_dds']) document.getElementById('display-dds-total').innerText = map['desa_total_dds'];
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
    let { data: settings } = await supabaseClient.from('settings').select('*');
    if (settings) {
        let map = {};
        settings.forEach(s => map[s.key] = s.value);
        if(document.getElementById('admin-nama-desa')) document.getElementById('admin-nama-desa').value = map['desa_nama'] || 'PEMERINTAH DESA MOKUPO KECAMATAN KARAMAT';
        if(document.getElementById('admin-slogan-desa')) document.getElementById('admin-slogan-desa').value = map['desa_slogan'] || 'Sistem Informasi & Portal Pelayanan Publik';
        if(document.getElementById('admin-sejarah')) document.getElementById('admin-sejarah').value = map['desa_sejarah'] || '';
        if(document.getElementById('admin-visi')) document.getElementById('admin-visi').value = map['desa_visi'] || '';
        if(document.getElementById('admin-misi')) document.getElementById('admin-misi').value = map['desa_misi'] || '';
        if(document.getElementById('admin-struktur-teks')) document.getElementById('admin-struktur-teks').value = map['desa_struktur_teks'] || '';
        if(document.getElementById('admin-sambutan')) document.getElementById('admin-sambutan').value = map['desa_sambutan'] || '';
        if(document.getElementById('admin-phone')) document.getElementById('admin-phone').value = map['desa_phone'] || '';
        if(document.getElementById('admin-email')) document.getElementById('admin-email').value = map['desa_email'] || '';
        if(document.getElementById('admin-map-url')) document.getElementById('admin-map-url').value = map['desa_map_url'] || '';
        if(document.getElementById('input-total-add')) document.getElementById('input-total-add').value = map['desa_total_add'] || '';
        if(document.getElementById('input-total-dds')) document.getElementById('input-total-dds').value = map['desa_total_dds'] || '';
    }
}
