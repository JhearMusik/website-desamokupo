// Tambahkan / perbarui fungsi permohonan surat di app.js

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
