// supabase-config.js

// 1. Inisialisasi Supabase Client
// Ganti URL dan ANON_KEY di bawah sesuai dengan yang ada di Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = 'https:klnpdpyogtknfelfdqjm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbnBkcHlvZ3RrbmZlbGZkcWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2OTc4NTksImV4cCI6MjEwODI3Mzg1OX0.vcVJPBcwTAH0pjg1kzEBRLX3YcEb-4CGVk_YjdJr3Jg'; 

// Inisialisasi client dari library Supabase CDN
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
