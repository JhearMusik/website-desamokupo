// app.js - Logika Lengkap Sistem Desa Mokupo

document.addEventListener('DOMContentLoaded', () => {
    applySettings();
    checkAuthStatus();
    renderPublicAddDds();
    renderPublicBpd();
});

// TOGGLE MENU MOBILE (ANDROID)
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
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

// DATA STORE BPD
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

// DATA STORE PENGADUAN
function getPengaduanList() {
    let data = localStorage.getItem('desa_pengaduan');
    return data ? JSON.parse(data) : [
        { id: 'ADU-101', nama: 'Budi', telp: '082112345678', subjek: 'Jalan Rusak Dusun 1', isi: 'Lubang besar di dekat jembatan.', bukti: '', status: 'Dalam Proses', jawaban: 'Petugas sedang meninjau lokasi.' }
    ];
}

function savePengaduanList(list) {
    localStorage.setItem('desa_pengaduan', JSON.stringify(list));
}

// DATA STORE ADD & DDS PROGRAM
function getAddDdsPrograms() {
    let data = localStorage.getItem('desa_add_dds_programs');
    return data ? JSON.parse(data) : [
        { sumber: 'ADD', nama: 'Penghasilan Tetap & Tunjangan Kepala Desa dan Perangkat', anggaran: 'Rp 450.000.000', ket: 'Rutin Bulanan' },
        { sumber: 'DDS', nama: 'Pembangunan Jalan Usaha Tani Dusun II', anggaran: 'Rp 350.000.000', ket: 'Fisik / Infrastruktur' }
    ];
}

function saveAddDdsPrograms(list) {
    localStorage.setItem('desa_add_dds_programs', JSON.stringify(list));
}

// DATA STORE ADMINDUK & PENDUDUK
function getAdmindukData() {
    let data = localStorage.getItem('desa_adminduk_stats');
    return data ? JSON.parse(data) : {
        pria: 2450,
        wanita: 2380,
        kk: 1210,
        ktp: 3620,
        kia: 965,
        akta: 4340,
        ikd: 850
    };
}

function saveAdmindukData(data) {
    localStorage.setItem('desa_adminduk_stats', JSON.stringify(data));
}

// NAVIGASI UTAMA TAB
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

    if (tabId === 'portal-petugas') checkAuthStatus();
    if (tabId === 'bpd') renderPublicBpd();
    if (tabId === 'layanan-pengaduan') renderAdminPengaduanList();
    if (tabId === 'add-dds') renderPublicAddDds();
    if (tabId === 'adminduk') applySettings();
}

// NAVIGASI SUB-MENU DALAM PORTAL PETUGAS
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

// SISTEM LOGIN PETUGAS
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

// KELOLA BPD
function renderPublicBpd() {
    const container = document.getElementById('bpd-public-container');
    if(!container) return;

    let list = getBpdList();
    container.innerHTML = '';
    if(list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 col-span-full text-center py-4">Belum ada data anggota BPD.</p>`;
        return;
    }

    list.forEach(item => {
        let fotoContent = item.foto 
            ? `<img src="${item.foto}" alt="${item.nama}" class="w-full h-full object-cover">`
            : `<i class="fa-solid fa-user-tie"></i>`;

        let card = document.createElement('div');
        card.className = 'flex flex-col items-center text-center space-y-3 group';
        card.innerHTML = `
            <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md transition-transform duration-300 group-hover:-translate-y-1 bg-slate-100">
                ${fotoContent}
            </div>
            <div>
                <h3 class="font-bold text-base sm:text-lg text-slate-800 tracking-tight">${item.nama}</h3>
                <p class="text-xs text-emerald-700 font-bold uppercase tracking-wider">${item.jabatan}</p>
            </div>
        `;
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

function renderAdminBpdList() {
    const container = document.getElementById('admin-bpd-list');
    if(!container) return;

    let list = getBpdList();
    container.innerHTML = '';
    if(list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400">Belum ada anggota BPD.</p>`;
        return;
    }

    list.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-700 p-3 rounded-lg flex justify-between items-center text-xs';
        card.innerHTML = `
            <div class="space-y-1">
                <p class="font-bold text-white text-sm">${item.nama}</p>
                <p class="text-emerald-400 font-semibold uppercase">${item.jabatan}</p>
            </div>
            <button onclick="hapusBpdMember(${index})" class="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded shadow"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(card);
    });
}

// PENGADUAN
function kirimPengaduanPublik(e) {
    e.preventDefault();
    const nama = document.getElementById('adu-nama').value;
    const telp = document.getElementById('adu-telp').value;
    const subjek = document.getElementById('adu-subjek').value;
    const isi = document.getElementById('adu-isi').value;
    const bukti = document.getElementById('adu-lampiran').value;

    const uniqueId = 'ADU-' + Math.floor(1000 + Math.random() * 9000);

    let list = getPengaduanList();
    list.unshift({
        id: uniqueId,
        nama: nama,
        telp: telp,
        subjek: subjek,
        isi: isi,
        bukti: bukti,
        status: 'Pending',
        jawaban: 'Belum ditanggapi petugas.'
    });
    savePengaduanList(list);

    alert(`Pengaduan berhasil dikirim!\n\nKODE UNIK PENGADUAN ANDA: ${uniqueId}\n\nSimpan kode ini untuk mengecek status pengaduan.`);
    document.getElementById('adu-nama').value = '';
    document.getElementById('adu-telp').value = '';
    document.getElementById('adu-subjek').value = '';
    document.getElementById('adu-isi').value = '';
    document.getElementById('adu-lampiran').value = '';
}

function cekStatusPengaduan() {
    const kode = document.getElementById('cek-kode').value.trim().toUpperCase();
    const box = document.getElementById('hasil-cek-status');
    const detailBox = document.getElementById('detail-status-box');

    if (!kode) {
        alert('Masukkan kode pengaduan terlebih dahulu!');
        return;
    }

    let list = getPengaduanList();
    let found = list.find(item => item.id === kode);

    box.classList.remove('hidden');
    if (found) {
        let badgeColor = found.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : (found.status === 'Dalam Proses' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800');
        detailBox.innerHTML = `
            <p><b>Kode:</b> ${found.id}</p>
            <p><b>Pelapor:</b> ${found.nama}</p>
            <p><b>Subjek:</b> ${found.subjek}</p>
            <p><b>Isi:</b> ${found.isi}</p>
            ${found.bukti ? `<p><b>Bukti:</b> <a href="${found.bukti}" target="_blank" class="text-blue-600 underline">Lihat Gambar</a></p>` : ''}
            <p><b>Status:</b> <span class="px-2 py-0.5 rounded font-bold ${badgeColor}">${found.status}</span></p>
            <p class="bg-white p-3 rounded border mt-2"><b>Tanggapan Petugas:</b><br>${found.jawaban}</p>
        `;
    } else {
        detailBox.innerHTML = `<p class="text-rose-600">Pengaduan dengan kode <b>${kode}</b> tidak ditemukan.</p>`;
    }
}

function renderAdminPengaduanList() {
    const container = document.getElementById('admin-pengaduan-list');
    if (!container) return;

    let list = getPengaduanList();
    if (list.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400">Belum ada pengaduan masyarakat.</p>`;
        return;
    }

    container.innerHTML = '';
    list.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-3';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <span class="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">${item.id}</span>
                    <h4 class="font-bold text-white text-sm mt-1">${item.subjek}</h4>
                    <p class="text-xs text-slate-300">Pelapor: ${item.nama} (${item.telp})</p>
                </div>
                <select onchange="updateStatusPengaduan(${index}, this.value)" class="bg-slate-800 text-white text-xs p-1.5 rounded border border-slate-700">
                    <option value="Pending" ${item.status==='Pending'?'selected':''}>Pending</option>
                    <option value="Dalam Proses" ${item.status==='Dalam Proses'?'selected':''}>Dalam Proses</option>
                    <option value="Selesai" ${item.status==='Selesai'?'selected':''}>Selesai</option>
                </select>
            </div>
            <p class="text-xs text-slate-400 bg-slate-950 p-2.5 rounded">${item.isi}</p>
            ${item.bukti ? `<p class="text-xs"><a href="${item.bukti}" target="_blank" class="text-blue-400 underline"><i class="fa-solid fa-image mr-1"></i> Lihat Bukti Gambar</a></p>` : ''}
            
            <div class="space-y-2 pt-2 border-t border-slate-800">
                <label class="block text-[11px] font-semibold text-slate-300">Tulis Jawaban / Solusi:</label>
                <textarea id="jawab-${index}" rows="2" class="w-full p-2 bg-slate-950 border border-slate-700 text-white rounded text-xs">${item.jawaban || ''}</textarea>
                
                <div class="flex flex-wrap gap-2 pt-1">
                    <button onclick="simpanJawaban(${index})" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow"><i class="fa-solid fa-floppy-disk mr-1"></i> Simpan Tanggapan</button>
                    <button onclick="kirimWhatsAppPelapor('${item.telp}', '${item.id}', '${item.subjek}')" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded text-xs font-bold shadow"><i class="fa-brands fa-whatsapp mr-1"></i> Kirim WA</button>
                    <button onclick="bukaSuratMediasi('${item.subjek}', '${item.nama}')" class="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded text-xs font-bold shadow"><i class="fa-solid fa-print mr-1"></i> Cetak Mediasi</button>
                    <button onclick="hapusPengaduan(${index})" class="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow ml-auto"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateStatusPengaduan(index, status) {
    let list = getPengaduanList();
    list[index].status = status;
    savePengaduanList(list);
}

function simpanJawaban(index) {
    let jawab = document.getElementById(`jawab-${index}`).value;
    let list = getPengaduanList();
    list[index].jawaban = jawab;
    savePengaduanList(list);
    alert('Tanggapan berhasil disimpan!');
    renderAdminPengaduanList();
}

function kirimWhatsAppPelapor(noTelp, kodeId, subjek) {
    let cleanNo = noTelp.replace(/^0/, '62');
    let text = `Halo, pengaduan Anda dengan Kode ${kodeId} (${subjek}) di Sistem Desa Mokupo telah ditanggapi.`;
    window.open(`https://wa.me/${cleanNo}?text=${encodeURIComponent(text)}`, '_blank');
}

function bukaSuratMediasi(permasalahan, terlapor) {
    document.getElementById('med-permasalahan').innerText = permasalahan;
    document.getElementById('med-terlapor').innerText = terlapor;
    document.getElementById('modal-mediation').classList.remove('hidden');
}

function hapusPengaduan(index) {
    if (confirm('Hapus pengaduan ini?')) {
        let list = getPengaduanList();
        list.splice(index, 1);
        savePengaduanList(list);
        renderAdminPengaduanList();
    }
}

// ADD & DDS
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
    document.getElementById('prog-nama').value = '';
    document.getElementById('prog-anggaran').value = '';
    document.getElementById('prog-ket').value = '';
    renderAdminAddDds();
    renderPublicAddDds();
    alert('Program berhasil ditambahkan!');
}

function hapusProgramAddDds(index) {
    if (confirm('Hapus program ini?')) {
        let list = getAddDdsPrograms();
        list.splice(index, 1);
        saveAddDdsPrograms(list);
        renderAdminAddDds();
        renderPublicAddDds();
    }
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
        row.innerHTML = `
            <td class="p-3"><span class="${badgeClass} font-bold px-2 py-0.5 rounded text-xs">${item.sumber}</span></td>
            <td class="p-3 font-medium text-slate-800">${item.nama}</td>
            <td class="p-3 font-semibold text-slate-700">${item.anggaran}</td>
            <td class="p-3 text-slate-600 text-xs">${item.ket}</td>
        `;
        tableBody.appendChild(row);
    });
}

function renderAdminAddDds() {
    const container = document.getElementById('admin-add-dds-list');
    if (!container) return;
    let list = getAddDdsPrograms();
    container.innerHTML = '';
    list.forEach((item, index) => {
        let badgeClass = item.sumber === 'ADD' ? 'bg-emerald-900 text-emerald-300' : 'bg-blue-900 text-blue-300';
        let card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-700 p-3 rounded-lg flex justify-between items-center text-xs';
        card.innerHTML = `
            <div class="space-y-1">
                <span class="${badgeClass} font-bold px-2 py-0.5 rounded text-[10px]">${item.sumber}</span>
                <p class="font-bold text-white">${item.nama}</p>
                <p class="text-slate-400">${item.anggaran} | ${item.ket}</p>
            </div>
            <button onclick="hapusProgramAddDds(${index})" class="bg-rose-600 text-white p-2 rounded shadow"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(card);
    });
}

function renderAdminPendudukForm() {
    let adm = getAdmindukData();
    document.getElementById('admin-jml-pria').value = adm.pria;
    document.getElementById('admin-jml-wanita').value = adm.wanita;
    document.getElementById('admin-adm-kk').value = adm.kk;
    document.getElementById('admin-adm-ktp').value = adm.ktp;
    document.getElementById('admin-adm-kia').value = adm.kia;
    document.getElementById('admin-adm-akta').value = adm.akta;
    document.getElementById('admin-adm-ikd').value = adm.ikd;
}

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

function updateBerandaSettings(e) {
    e.preventDefault();
    localStorage.setItem('desa_nama', document.getElementById('admin-nama-desa').value);
    localStorage.setItem('desa_slogan', document.getElementById('admin-slogan-desa').value);
    localStorage.setItem('desa_logo', document.getElementById('admin-logo-url').value);
    localStorage.setItem('desa_video', document.getElementById('admin-video-url').value);
    applySettings();
    alert('Beranda berhasil diperbarui!');
}

function updateProfilSettings(e) {
    e.preventDefault();
    const sejarah = document.getElementById('admin-sejarah').value;
    const sambutan = document.getElementById('admin-sambutan').value;
    const foto = document.getElementById('admin-foto-sambutan').value;

    document.getElementById('content-sejarah').innerHTML = `<p>${sejarah}</p>`;
    document.getElementById('content-sambutan').innerHTML = `<p><em>"${sambutan}"</em></p><p class="font-bold text-slate-800">— Kepala Desa Mokupo</p>`;
    if(foto) {
        localStorage.setItem('desa_foto_sambutan', foto);
        applySambutanFoto(foto);
    }
    alert('Profil berhasil diperbarui!');
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

function tambahAparatDesa(e) {
    e.preventDefault();
    const nama = document.getElementById('admin-nama-aparat').value;
    const jabatan = document.getElementById('admin-jabatan-aparat').value;
    const tupoksi = document.getElementById('admin-tupoksi-aparat').value;
    const foto = document.getElementById('admin-foto-aparat').value;

    const container = document.getElementById('aparat-container');
    const card = document.createElement('div');
    card.className = 'flex flex-col items-center text-center space-y-3 group relative';
    card.innerHTML = `
        <button onclick="this.parentElement.remove()" class="absolute -top-2 -right-2 z-10 text-rose-500 bg-white p-1.5 rounded-full shadow text-xs"><i class="fa-solid fa-trash"></i></button>
        <div class="w-36 sm:w-40 aspect-[4/6] rounded-xl flex items-center justify-center text-slate-300 text-4xl overflow-hidden shadow-md bg-slate-100">
            ${foto ? `<img src="${foto}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-tie"></i>`}
        </div>
        <div>
            <h3 class="font-bold text-base sm:text-lg text-slate-800">${nama}</h3>
            <p class="text-xs text-emerald-700 font-bold uppercase">${jabatan}</p>
            <p class="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-xs">Tugas Pokok: ${tupoksi}</p>
        </div>
    `;
    container.appendChild(card);
    alert('Aparat berhasil ditambahkan!');
}

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

function applySettings() {
    const nama = localStorage.getItem('desa_nama');
    const slogan = localStorage.getItem('desa_slogan');
    const logo = localStorage.getItem('desa_logo');
    const videoUrl = localStorage.getItem('desa_video');
    const fotoSambutan = localStorage.getItem('desa_foto_sambutan');
    const mapUrl = localStorage.getItem('desa_map_url');
    const totalAdd = localStorage.getItem('desa_total_add');
    const totalDds = localStorage.getItem('desa_total_dds');

    if(nama) document.getElementById('app-title').innerText = nama;
    if(slogan) document.getElementById('app-slogan').innerText = slogan;
    if(logo) {
        const imgEl = document.getElementById('nav-logo-img');
        const iconEl = document.getElementById('nav-logo-icon');
        if(imgEl && iconEl) {
            imgEl.src = logo;
            imgEl.classList.remove('hidden');
            iconEl.classList.add('hidden');
        }
    }
    if(videoUrl) {
        const videoBg = document.getElementById('hero-video-bg');
        if(videoBg) videoBg.src = videoUrl;
    }
    if(fotoSambutan) applySambutanFoto(fotoSambutan);
    if(mapUrl) {
        document.getElementById('display-map-iframe').src = mapUrl;
        const adminMap = document.getElementById('admin-map-url');
        if(adminMap) adminMap.value = mapUrl;
    }
    if(totalAdd) {
        document.getElementById('display-add-total').innerText = totalAdd;
        const inputAdd = document.getElementById('input-total-add');
        if(inputAdd) inputAdd.value = totalAdd;
    }
    if(totalDds) {
        document.getElementById('display-dds-total').innerText = totalDds;
        const inputDds = document.getElementById('input-total-dds');
        if(inputDds) inputDds.value = totalDds;
    }

    let adm = getAdmindukData();
    document.getElementById('home-total').innerText = adm.pria + adm.wanita;
    document.getElementById('home-laki').innerText = adm.pria;
    document.getElementById('home-perempuan').innerText = adm.wanita;
    document.getElementById('home-kk').innerText = adm.kk;

    document.getElementById('adm-kk').innerText = adm.kk;
    document.getElementById('adm-ktp').innerText = adm.ktp;
    document.getElementById('adm-kia').innerText = adm.kia;
    document.getElementById('adm-akta').innerText = adm.akta;
    document.getElementById('adm-ikd').innerText = adm.ikd;
}

function generateSuratPreview(e) {
    e.preventDefault();
    const jenis = document.getElementById('s-jenis').value;
    const nama = document.getElementById('s-nama').value;
    const nik = document.getElementById('s-nik').value;
    const ket = document.getElementById('s-ket').value;

    document.getElementById('preview-judul-surat').innerText = jenis;
    document.getElementById('preview-no-surat').innerText = `503 / ${Math.floor(100 + Math.random() * 900)} / DS-MKP / X / 2026`;
    document.getElementById('preview-indeks').innerText = `503-Usaha/MKP`;
    document.getElementById('out-nama').innerText = nama;
    document.getElementById('out-nik').innerText = nik;
    document.getElementById('out-ket').innerText = ket;

    alert('Surat berhasil digenerate dengan nomor dan TTD Digital Verified!');
}
