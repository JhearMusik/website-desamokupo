// supabase-config.js - Menggunakan nama unik untuk menghindari bentrok deklarasi
const DB_URL = 'https://klnpdpyogknfelfdqjm.supabase.co';
const DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbnBkcHlvZ2tuZmVsZmRxam0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1NzM5NDM2MSwiZXhwIjoyMDczOTcwMzYxfQ.eyJz...'; // Masukkan key lengkap Anda

// Inisialisasi ke variabel global window agar aman
window.supabase = window.supabase.createClient(DB_URL, DB_KEY);
