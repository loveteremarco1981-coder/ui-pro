
const ENDPOINT = window.APP_CONFIG.endpoint;

function fmtAgo(min){ if(min==null) return '—'; if(min<1) return 'ora'; if(min===1) return '1 min'; return min+' min'; }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 2200); }

function paintState(state){
  const el = document.getElementById('state-pill');
  el.textContent = state || '—';
  el.className = 'status-pill state--'+(state||'');
}
function renderPeople(people){
  const ul = document.getElementById('people-list');
  ul.innerHTML = '';
  (people||[]).forEach(p=>{
    const li = document.createElement('li');
    li.className='person';
    li.innerHTML = `<div>${p.name}</div><div class="badge ${p.onlineSmart?'in':'out'}">${p.onlineSmart?'IN':'OUT'}${p.lastLifeMinAgo!=null?' · '+fmtAgo(p.lastLifeMinAgo):''}</div>`;
    ul.appendChild(li);
  });
}
function renderMeta(model){
  document.getElementById('meta-time').textContent = new Date(model.meta?.nowIso||Date.now()).toLocaleString();
  const flags = [];
  if(model.vacanza) flags.push('vacanza');
  if(model.override) flags.push('override');
  const st=(model.state||'').toUpperCase();
  flags.push(st.endsWith('_NIGHT')?'notte':'giorno');
  document.getElementById('meta-flags').textContent = flags.join(' · ');
  document.getElementById('last-event').textContent = model.lastEvent||'—';
}
async function loadModel(){ try{ const m=await jsonp(ENDPOINT); paintState(m.state); renderPeople(m.people); renderMeta(m);} catch(e){ console.error(e);} }
function pin(){ return (document.getElementById('pin').value || localStorage.getItem('ADMIN_PIN') || '').trim(); }
function bind(){
  document.getElementById('save-pin').addEventListener('click', ()=>{ const v=document.getElementById('pin').value.trim(); localStorage.setItem('ADMIN_PIN', v); toast('PIN salvato'); });
  document.querySelectorAll('.seg').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const event=btn.dataset.cmd; const value=(btn.dataset.val==='true');
      const payload={ event, value, pin: pin() };
      try{
        const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        const txt=await r.text();
        if(txt.trim()==='DENIED'){ toast('PIN non valido'); return; }
        setTimeout(loadModel, 350);
      }catch(e){ console.error('cmd error',e); toast('Errore rete'); }
    });
  });
  const saved=localStorage.getItem('ADMIN_PIN'); if(saved) document.getElementById('pin').value=saved;
}
bind(); loadModel(); setInterval(loadModel, 15000);
