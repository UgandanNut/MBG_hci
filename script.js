function navClick(e){
  e.preventDefault();
  document.querySelectorAll('.nav-link').forEach(el=>el.classList.remove('active'));
  e.currentTarget.classList.add('active');
}
function tabClick(el){
  document.querySelectorAll('.rp-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
}
function handleLapor(){showToast('Membuka form laporan baru...')}
function openReport(id){showToast('Membuka detail laporan #'+id)}

function showToast(msg){
  const ex=document.querySelector('.toast');if(ex)ex.remove();
  const t=document.createElement('div');
  t.className='toast';t.textContent=msg;
  Object.assign(t.style,{
    position:'fixed',bottom:'28px',left:'50%',
    transform:'translateX(-50%)',
    background:'rgba(26,44,107,.93)',color:'#fff',
    padding:'11px 26px',borderRadius:'999px',
    fontSize:'.84rem',fontWeight:'600',
    zIndex:'9999',pointerEvents:'none',
    whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.2)',
    animation:'fadeUp .2s ease'
  });
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300)},2200);
}

const s=document.createElement('style');
s.textContent=`@keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
document.head.appendChild(s);

// Char counter
function updateCount(el){
  document.getElementById('charCount').textContent = el.value.length;
  updateSteps();
}

// Kategori select
function selectKat(el){
  document.querySelectorAll('.kat-pill').forEach(p=>p.classList.remove('selected'));
  el.classList.add('selected');
  updateSteps();
}

// Upload trigger
function triggerUpload(){
  document.getElementById('fileInput').click();
}

function handleFiles(input){
  if(!input.files.length) return;
  const box = document.getElementById('uploadBox');
  // Clear existing previews
  const existing = box.querySelector('.upload-preview');
  if(existing) existing.remove();

  const prev = document.createElement('div');
  prev.className = 'upload-preview';

  Array.from(input.files).slice(0,5).forEach(file=>{
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.className = 'preview-thumb';
    img.src = url;
    prev.appendChild(img);
  });

  if(input.files.length < 5){
    const add = document.createElement('div');
    add.className = 'preview-add';
    add.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    add.onclick = triggerUpload;
    prev.appendChild(add);
  }

  // Update box appearance
  box.querySelector('.upload-icon-wrap').style.display = 'none';
  box.querySelector('.upload-main-text').style.display = 'none';
  box.querySelector('.upload-sub-text').style.display = 'none';
  box.style.padding = '16px';
  box.appendChild(prev);
  updateSteps();
}

// Use current location
function useCurrentLocation(){
  const names = ['Jl. Sudirman No. 45, Jakarta Pusat','Jl. Thamrin No. 10, Jakarta Pusat','Jl. Gatot Subroto, Jakarta Selatan'];
  document.getElementById('locName').textContent = names[Math.floor(Math.random()*names.length)];
  showToast('Lokasi berhasil dideteksi');
  updateSteps();
}

// Anonim
function toggleAnonim(el){
  showToast(el.checked ? 'Laporan akan dikirim secara anonim' : 'Laporan dikirim dengan identitas');
}

// Step indicator update (simple heuristic)
function updateSteps(){
  const hasFile = !document.querySelector('.upload-preview') === false ||
    document.getElementById('fileInput').files.length > 0;
  const hasDesc = document.getElementById('deskripsi').value.length > 0;
  const hasKat = !!document.querySelector('.kat-pill.selected');
  const steps = [1, hasFile?1:0, hasDesc?1:0, hasKat?1:0];
  const circles = document.querySelectorAll('.step-circle');
  const lines = document.querySelectorAll('.step-line');
  const names = document.querySelectorAll('.step-name');

  circles.forEach((c,i)=>{
    c.className = 'step-circle';
    names[i] && (names[i].className = 'step-name');
    if(i === 0){
      if(hasFile){ c.classList.add('done'); if(names[i]) names[i].classList.add('done'); }
      else{ c.classList.add('active'); if(names[i]) names[i].classList.add('active'); }
    } else if(i===1){
      if(hasDesc){ c.classList.add('done'); if(names[i]) names[i].classList.add('done'); }
      else if(hasFile){ c.classList.add('active'); if(names[i]) names[i].classList.add('active'); }
      else c.classList.add('pending');
    } else if(i===2){
      if(hasKat){ c.classList.add('done'); if(names[i]) names[i].classList.add('done'); }
      else if(hasDesc){ c.classList.add('active'); if(names[i]) names[i].classList.add('active'); }
      else c.classList.add('pending');
    } else {
      if(hasKat){ c.classList.add('active'); if(names[i]) names[i].classList.add('active'); }
      else c.classList.add('pending');
    }
  });
  lines.forEach((l,i)=>{
    l.className = 'step-line';
    if(i===0 && hasFile) l.classList.add('done-line');
    else if(i===1 && hasDesc) l.classList.add('done-line');
    else if(i===2 && hasKat) l.classList.add('done-line');
  });
}

// Submit
function kirimLaporan(){
  const desc = document.getElementById('deskripsi').value.trim();
  const kat = document.querySelector('.kat-pill.selected');
  if(!desc){ showToast('⚠️ Mohon isi deskripsi laporan'); return; }
  if(!kat){ showToast('⚠️ Mohon pilih kategori'); return; }

  const kategori = kat.textContent.trim();
  const lokasi = document.getElementById('locName') ? document.getElementById('locName').textContent.trim() : '';

  addLaporanNotif(kategori, desc);
  addRiwayatCard(kategori, desc, lokasi);
  bumpRiwayatStats();
  showToast('✅ Laporan berhasil dikirim!');

  setTimeout(()=>{ showPage('notifikasi'); }, 700);
}

// Build a short title from the description (first sentence / first ~50 chars)
function buatJudulLaporan(kategori, desc){
  let judul = desc.split(/[.\n]/)[0].trim();
  if(judul.length > 55) judul = judul.slice(0,55).trim()+'…';
  return judul || kategori;
}

// Insert a new "Diterima" card at the top of the Riwayat Laporan – Aktif tab
function addRiwayatCard(kategori, desc, lokasi){
  const list = document.getElementById('riwayatAktif');
  const card = document.createElement('div');
  card.className = 'riwayat-card accent-blue new-riwayat';

  const judul = buatJudulLaporan(kategori, desc);
  const ringkas = desc.length > 110 ? desc.slice(0,110).trim()+'…' : desc;
  const catLabel = lokasi ? `${kategori} • ${lokasi}` : kategori;

  card.innerHTML = `
    <div class="riwayat-card-top">
      <span class="riwayat-status st-diterima">Diterima</span>
      <span class="riwayat-date">Baru saja</span>
    </div>
    <div class="riwayat-card-title">${judul}</div>
    <div class="riwayat-card-desc">${ringkas}</div>
    <div class="riwayat-card-cat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>
      ${catLabel}
    </div>
    <div class="riwayat-steps">
      <div class="riwayat-step">
        <div class="riwayat-step-line"></div>
        <div class="riwayat-step-dot current blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9 6 9-6M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/></svg>
        </div>
        <div class="riwayat-step-label current">Diterima</div>
      </div>
      <div class="riwayat-step">
        <div class="riwayat-step-line"></div>
        <div class="riwayat-step-dot"></div>
        <div class="riwayat-step-label">Diproses</div>
      </div>
      <div class="riwayat-step">
        <div class="riwayat-step-line"></div>
        <div class="riwayat-step-dot"></div>
        <div class="riwayat-step-label">Selesai</div>
      </div>
    </div>
  `;
  card.onclick = ()=>showToast('Membuka detail laporan...');
  list.insertBefore(card, list.firstChild);
}

// Update all the counters that reflect the new active report
function bumpRiwayatStats(){
  // Riwayat page – "Laporan Aktif" stat
  const riwayatAktif = document.getElementById('riwayatStatAktif');
  if(riwayatAktif) riwayatAktif.textContent = (parseInt(riwayatAktif.textContent)||0) + 1;

  // Beranda – "Status Laporan Anda" → Baru
  const statBaru = document.getElementById('statBaru');
  if(statBaru) statBaru.textContent = (parseInt(statBaru.textContent)||0) + 1;

  // Sidebar "Laporan" total count badge
  document.querySelectorAll('.nav-link .count').forEach(c=>{
    if(c.closest('.nav-link').textContent.includes('Laporan')){
      c.textContent = (parseInt(c.textContent)||0) + 1;
    }
  });

  // Profil page – Total Laporan
  const profilTotal = document.querySelector('.profil-stat-value.navy');
  if(profilTotal){
    const num = parseInt(profilTotal.textContent) || 0;
    profilTotal.innerHTML = (num+1) + ' <span>Laporan</span>';
  }
}

// Insert a new "laporan terkirim" notification at top of Terbaru list
function addLaporanNotif(kategori, desc){
  const list = document.getElementById('notifListBaru');
  const card = document.createElement('div');
  card.className = 'notif-card new';

  const ringkas = desc.length > 80 ? desc.slice(0,80).trim()+'…' : desc;

  card.innerHTML = `
    <div class="notif-icon ic-pending">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    </div>
    <div class="notif-body">
      <div class="notif-text">Laporan Anda <b>'${kategori}'</b> berhasil dikirim dan sedang menunggu diproses petugas. — <i>"${ringkas}"</i></div>
      <div class="notif-time">Baru saja</div>
    </div>
    <span class="notif-unread-dot"></span>
  `;
  list.insertBefore(card, list.firstChild);

  bumpNotifBadges();
}

// Increase all notification badge counters (sidebar count, snav-dot, tb-icon dot)
function bumpNotifBadges(){
  document.querySelectorAll('.nav-link .count').forEach(c=>{
    if(c.closest('.nav-link').textContent.includes('Notifikasi')){
      c.textContent = (parseInt(c.textContent)||0) + 1;
    }
  });
}

// Back
function goBack(){ showToast('Kembali ke Beranda...'); }

// Toast
function showToast(msg){
  const ex = document.querySelector('.toast');
  if(ex) ex.remove();
  const t = document.createElement('div');
  t.className='toast'; t.textContent=msg;
  Object.assign(t.style,{
    position:'fixed',bottom:'28px',left:'50%',
    transform:'translateX(-50%)',
    background:'rgba(26,44,107,.94)',color:'#fff',
    padding:'11px 26px',borderRadius:'999px',
    fontSize:'.84rem',fontWeight:'600',
    zIndex:'9999',pointerEvents:'none',
    whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.2)',
    animation:'fadeUp .2s ease'
  });
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300)},2400);
}

const s2=document.createElement('style');
s2.textContent=`@keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
document.head.appendChild(s2);

// ── Page navigation ──
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  window.scrollTo(0,0);

  // Sync sidebar (Beranda) nav-link highlight with the active page
  const isLaporanGroup = (name === 'riwayat' || name === 'laporan');
  document.querySelectorAll('.nav-link').forEach(el=>{
    el.classList.remove('active');
    const label = el.textContent.trim().toLowerCase();
    if(
      (name === 'beranda' && label.startsWith('beranda')) ||
      (isLaporanGroup && label.startsWith('laporan')) ||
      (name === 'notifikasi' && label.startsWith('notifikasi')) ||
      (name === 'profil' && label.startsWith('profil'))
    ){
      el.classList.add('active');
    }
  });

  // Sync sidenav (Laporan/Notifikasi/Profil pages) icon highlight
  document.querySelectorAll('.snav-item').forEach(el=>{
    el.classList.remove('active');
    const title = (el.getAttribute('title')||'').toLowerCase();
    if(title === name || (isLaporanGroup && title === 'laporan')) el.classList.add('active');
  });

  syncBottomNav(name);
}

// ── Riwayat Laporan tab switcher ──
function riwayatTab(name, el){
  document.querySelectorAll('.riwayat-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.riwayat-pane').forEach(p=>p.classList.remove('active'));
  document.getElementById('riwayat'+name.charAt(0).toUpperCase()+name.slice(1)).classList.add('active');
}


// ── Mobile bottom navigation bar ──
// Injects a fixed bottom nav (Beranda / Laporan / Notifikasi / Profil)
// into every page's .shell. Hidden on desktop via CSS (max-width:768px).
function bottomNavHTML(){
  return `
    <nav class="bottom-nav">
      <button class="bnav-item" data-page="beranda" onclick="showPage('beranda')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        Beranda
      </button>
      <button class="bnav-item" data-page="riwayat" onclick="showPage('riwayat')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Laporan
      </button>
      <button class="bnav-item" data-page="notifikasi" onclick="showPage('notifikasi')" style="position:relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        Notifikasi
        <span class="bnav-dot"></span>
      </button>
      <button class="bnav-item" data-page="profil" onclick="showPage('profil')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Profil
      </button>
    </nav>
  `;
}

function injectBottomNav(){
  document.querySelectorAll('.shell').forEach(shell=>{
    if(!shell.querySelector('.bottom-nav')){
      shell.insertAdjacentHTML('beforeend', bottomNavHTML());
    }
  });
}

function syncBottomNav(name){
  const isLaporanGroup = (name === 'riwayat' || name === 'laporan');
  document.querySelectorAll('.bnav-item').forEach(btn=>{
    const page = btn.getAttribute('data-page');
    btn.classList.toggle('active',
      page === name || (isLaporanGroup && page === 'riwayat')
    );
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  injectBottomNav();
  // Highlight the bottom nav item for the initially active page
  const activePage = document.querySelector('.page.active');
  if(activePage) syncBottomNav(activePage.id.replace('page-',''));
});
