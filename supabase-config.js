// supabase-config.js - Bersih dan Aman Tanpa Konflik
const SUPABASE_URL = 'https://klnpdpyogknfelfdqjm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbnBkcHlvZ2tuZmVsZmRxam0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1NzM5NDM2MSwiZXhwIjoyMDczOTcwMzYxfQ.eyJz...'; // Pastikan key lengkap Anda

// Inisialisasi global tunggal
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
