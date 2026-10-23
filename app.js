// app.js - Desa Mokupo Stabil
document.addEventListener('DOMContentLoaded', () => {
  console.log("Website Desa Mokupo Siap!");
  if (typeof window.supabase !== 'undefined') {
    loadHeaderSettings();
  }
});

async function loadHeaderSettings() {
  const { data } = await window.supabase.from('settings').select('*').eq('id', 1).single();
  if (!data) return;
  
  const elNamaDesa = document.getElementById('site-nama-desa');
  const elSlogan = document.getElementById('site-slogan');
  if (elNamaDesa) elNamaDesa.innerText = data.nama_desa;
  if (elSlogan) elSlogan.innerText = data.slogan;
}
