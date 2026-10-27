// supabase-config.js - Konfigurasi Utama Supabase SDK
const SUPABASE_URL = 'https://klnpdpyogknfelfdqjm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbnBkcHlvZ3RrbmZlbGZkcWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2OTc4NTksImV4cCI6MjEwODI3Mzg1OX0.vcVJPBcwTAH0pjg1kzEBRLX3YcEb-4CGVk_YjdJr3Jg';

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error("Library Supabase SDK belum dimuat!");
}
