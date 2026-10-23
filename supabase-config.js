// supabase-config.js - Konfigurasi Utama Supabase
const SUPABASE_URL = 'https://klnpdpyogknfelfdqjm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInI1cCI6IkpXVCJ9.eyJpcGM3MiOiJzdDxBhYmFmZzZSIsInJlZmlwbGVzaNImtsnBkN-1ImtsnBkN2tuMVsZmRxam0iLCJyb2xlIjoiaW5vY2IsImlhdCI6MTcNzM5NDM2MSwZXhwIjoyMDczMzMzYXfQ.eyJz...'; // Ganti dengan key lengkap Anda jika perlu

// Inisialisasi global aman
if (typeof supabase !== 'undefined') {
    window.supabase = window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error("Library Supabase SDK belum dimuat di HTML!");
}
