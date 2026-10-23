// supabase-config.js - Aman dari deklarasi ganda
window.SUPABASE_URL = 'https://klnpdpyogknfelfdqjm.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbnBkcHlvZ2tuZmVsZmRxam0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1NzM5NDM2MSwiZXhwIjoyMDczOTcwMzYxfQ.eyJz...'; // Gunakan key anon lengkap Anda

// Inisialisasi global aman
if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

// Alias agar kompatibel dengan app.js lama
const supabase = window.supabaseClient;
