// supabase-config.js - Versi Bersih & Aman Tanpa Konflik
const SUPABAS_URL = 'https://klnpdpyogknfelfdqjm.supabase.co';
const SUPABAS_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbnBkcHlvZ2tuZmVsZmRxam0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1NzM5NDM2MSwiZXhwIjoyMDczOTcwMzYxfQ.eyJz...'; // Pastikan key lengkap Anda

// Inisialisasi global aman ke window agar bisa diakses app.js tanpa deklarasi ulang
if (!window.supabase) {
  window.supabase = window.supabaseClient = window.supabase.createClient(SUPABAS_URL, SUPABAS_KEY);
}
