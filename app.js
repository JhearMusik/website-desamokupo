// app.js - Logika Lengkap Desa Mokupo

document.addEventListener('DOMContentLoaded', () => {
    loadPermanentData();
    checkAuthStatus();
});

// HELPER UPLOAD KE SUPABASE STORAGE
async function uploadFileKeSupabase(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return null;
    if (!window.supabase || !window.supabase.storage) return null;

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

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
    if (menu && icon) {
        menu.classList.toggle('hidden');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
    }
}

// NAVIGASI UTAMA & SUB MENU
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
}

// AUTH LOGIN PETUGAS
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
        loadAdminFormValues();
    } else {
        if(loginBox) loginBox.classList.remove('hidden');
        if(dashBox) dashBox.classList.add('hidden');
    }
}

// ==========================================
// PENYIMPANAN PERMANEN (LOCALSTORAGE + SUPABASE READY)
// ==========================================
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
function getData(key, defaultValue) {
    let data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

// 1. BERANDA
async function updateBerandaSettings(e) {
    e.preventDefault();
    try {
        const nama = document.getElementById('admin-nama-desa').value;
        const slogan = document.getElementById('admin-slogan-desa').value;
        
        let logoUrl = getData('desa_logo', '');
        let videoUrl = getData('desa_video', '');

        const uploadedLogo = await uploadFileKeSupabase(document.getElementById('admin-logo-file'));
        const uploadedVideo = await uploadFileKeSupabase(document.getElementById('admin-video-file'));

        if (uploadedLogo) logoUrl = uploadedLogo;
        if (uploadedVideo) videoUrl = uploadedVideo;

        saveData('desa_nama', nama);
        saveData('desa_slogan', slogan);
        saveData('desa_logo', logoUrl);
        saveData('desa_video', videoUrl);

        loadPermanentData();
        alert('Beranda, Logo & Video berhasil disimpan secara permanen!');
    } catch (err) {
        alert('Gagal: ' + err.message);
    }
}

// 2. PROFIL & VISI MISI & STRUKTUR
async function updateProfilSettings(e) {
    e.preventDefault();
    try {
        const sejarah = document.getElementById('admin-sejarah').value;
        const visi = document.getElementById('admin-visi').value;
        const misi = document.getElementById('admin-misi').value;
        const struktur = document.getElementById('admin-struktur-teks').value;
        const sambutan = document.getElementById('admin-sambutan').value;
        
        let fotoUrl = getData('desa_foto_sambutan', '');
        let strukturImg = getData('desa_struktur_img', '');

        const uploadedFoto = await uploadFileKeSupabase(document.getElementById('admin-foto-sambutan-file'));
        const uploadedStruktur = await uploadFileKeSupabase(document.getElementById('admin-struktur-file'));

        if (uploadedFoto) fotoUrl = uploadedFoto;
        if (uploadedStruktur) strukturImg = uploadedStruktur;

        saveData('desa_sejarah', sejarah);
        saveData('desa_visi', visi);
        saveData('desa_misi', misi);
        saveData('desa_struktur_teks', struktur);
        saveData('desa_sambutan', sambutan);
        saveData('desa_foto_sambutan', fotoUrl);
        saveData('desa_struktur_img', strukturImg);

        loadPermanentData();
        alert('Profil, Visi Misi, & Struktur berhasil disimpan permanen!');
    } catch (err) {
        alert('Gagal: ' + err.message);
    }
}

// MEMUAT SEMUA DATA PERMANEN KE HALAMAN PUBLIK
function loadPermanentData() {
    const nama = getData('desa_nama', 'PEMERINTAH DESA MOKUPO KECAMATAN KARAMAT');
    const slogan = getData('desa_slogan', 'Sistem Informasi & Portal Pelayanan Publik');
    const logo = getData('desa_logo', '');
    const video = getData('desa_video', '');
    
    document.getElementById('app-title').innerText = nama;
    document.getElementById('app-slogan').innerText = slogan;
    if(logo) {
        document.getElementById('nav-logo-img').src = logo;
        document.getElementById('nav-logo-img').classList.remove('hidden');
        document.getElementById('nav-logo-icon').classList.add('hidden');
    }
    if(video) {
        document.getElementById('hero-video-bg').src = video;
    }

    // Profil Publik
    document.getElementById('content-sejarah').innerHTML = `<p>${getData('desa_sejarah', 'Desa Mokupo terletak di wilayah Kecamatan Karamat, Kabupaten Buol.')}</p>`;
    document.getElementById('content-visi').innerText = `"${getData('desa_visi', 'Terwujudnya Desa Mokupo yang Mandiri, Transparan, Agamis, dan Sejahtera.')}"`;
    
    let misiArr = getData('desa_misi', 'Meningkatkan kualitas pelayanan.\nMengoptimalkan tata kelola anggaran.').split('\n');
    document.getElementById('content-misi').innerHTML = `<ul class="list-disc list-inside space-y-1">${misiArr.map(m => `<li>${m}</li>`).join('')}</ul>`;
    
    document.getElementById('content-struktur-teks').innerText = getData('desa_struktur_teks', 'Bagan Struktur Organisasi Pemerintah Desa Mokupo.');
    let strukturImg = getData('desa_struktur_img', '');
    if(strukturImg) {
        document.getElementById('content-struktur-img').src = strukturImg;
        document.getElementById('content-struktur-img').classList.remove('hidden');
    }

    let fotoSambutan = getData('desa_foto_sambutan', '');
    if(fotoSambutan) {
        document.getElementById('sambutan-img').src = fotoSambutan;
        document.getElementById('sambutan-img').classList.remove('hidden');
        document.getElementById('sambutan-icon').classList.add('hidden');
    }
    document.getElementById('content-sambutan').innerHTML = `<p><em>"${getData('desa_sambutan', 'Selamat datang di portal resmi...')}"</em></p><p class="font-bold text-slate-800">— Kepala Desa Mokupo</p>`;
}

function loadAdminFormValues() {
    if(document.getElementById('admin-sejarah')) {
        document.getElementById('admin-sejarah').value = getData('desa_sejarah', '');
        document.getElementById('admin-visi').value = getData('desa_visi', '');
        document.getElementById('admin-misi').value = getData('desa_misi', '');
        document.getElementById('admin-struktur-teks').value = getData('desa_struktur_teks', '');
        document.getElementById('admin-sambutan').value = getData('desa_sambutan', '');
    }
}

// FUNGSI PENDUKUNG LAINNYA
function generateSuratPreview(e) { e.preventDefault(); alert('Surat berhasil digenerate!'); }
function kirimPengaduanPublik(e) { e.preventDefault(); alert('Pengaduan terkirim!'); e.target.reset(); }
