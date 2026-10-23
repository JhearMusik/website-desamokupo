// supabase-config.js - Versi Bersih & Aman Tanpa Konflik
const SUPABASE_URL = 'https://klnpdpyogknfelfdqjm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInI1cCI6IkpXVCJ9.eyJpcGM3MiOiJzdDXBhYmFmZzZSIsInJlZmlwbGVzaNImtsnBkN-1ImtsnBkN2tuMVsZmRxam0iLCJyb2xlIjoiaW5vY2IsImlhdCI6MTcNzM5NDM2MSwZXhwIjoyMDczMzMzYXfQ.eyJz...';

// Inisialisasi global aman ke window
if (typeof supabase !== 'undefined') {
    window.supabase = window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error("Library Supabase JS SDK belum dimuat di HTML!");
}
