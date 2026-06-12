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

  addLaporanNotif(kat.textContent.trim(), desc);
  showToast('✅ Laporan berhasil dikirim!');

  setTimeout(()=>{ showPage('notifikasi'); }, 700);
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
  document.querySelectorAll('.nav-link').forEach(el=>{
    el.classList.remove('active');
    const label = el.textContent.trim().toLowerCase();
    if(
      (name === 'beranda' && label.startsWith('beranda')) ||
      (name === 'laporan' && label.startsWith('laporan')) ||
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
    if(title === name) el.classList.add('active');
  });
}