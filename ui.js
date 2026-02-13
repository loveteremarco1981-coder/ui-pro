
const CFG = window.APP_CONFIG;
const PEOPLE = ["Marco", "Silvia", "Viola", "Samuele"];
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function toast(msg, t=2000){ const el=$('#toast'); el.textContent=msg; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'), t); }

function personCard(name){
  const div=document.createElement('div'); div.className='person';
  const img=new Image(); img.src=`icons/${name}.svg`; img.alt=name;
  const box=document.createElement('div');
  const n=document.createElement('div'); n.className='name'; n.textContent=name;
  const s=document.createElement('div'); s.className='status'; s.textContent='—';
  box.append(n,s); div.append(img,box);
  div.addEventListener('click',()=>openPanel(name));
  return div;
}

function renderPeople(){ const wrap=$('#people'); wrap.innerHTML=''; PEOPLE.forEach(p=>wrap.appendChild(personCard(p))); }

let currentPerson=null;
function openPanel(name){ currentPerson=name; const m=$('#modal'); m.querySelector('.who').textContent=name; m.classList.remove('hidden'); }

document.addEventListener('click', (e)=>{
  if(e.target.closest('.close')) return $('#modal').classList.add('hidden');
  const btn=e.target.closest('[data-action]'); if(!btn) return;
  const act=btn.dataset.action; const persona=currentPerson?.toLowerCase();
  const pin=$('#pin').value.trim(); if(pin!==CFG.pin) return toast('PIN errato');
  let payload=null;
  if(['arrivo','uscita','life'].includes(act)) payload={ event:'persona_'+(act==='arrivo'?'arriva':(act==='uscita'?'esce':'life')), persona };
  else if(act==='vacanza_on')  payload={ event:'set_vacanza',  value:true,  pin:CFG.pin };
  else if(act==='vacanza_off') payload={ event:'set_vacanza',  value:false, pin:CFG.pin };
  else if(act==='override_on') payload={ event:'set_override', value:true,  pin:CFG.pin };
  else if(act==='override_off')payload={ event:'set_override', value:false, pin:CFG.pin };
  if(!payload) return;
  fetch(CFG.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    .then(r=>r.text()).then(()=>toast('Comando inviato')).catch(()=>toast('Errore invio'));
});

let lastState=null;
function poll(){
  fetch(CFG.endpoint)
   .then(r=>r.json())
   .then(data=>{
     const state=data.state||'—';
     $('#state').textContent=state; $('#stateBadge').textContent=data.notte?'NOTTE':'GIORNO';
     $('#lastEvent').textContent=data.lastEvent||'—';
     if(typeof data.vacanza==='boolean')  $('#vacanza').checked=!!data.vacanza;
     if(typeof data.override==='boolean') $('#override').checked=!!data.override;
     if(lastState!==null && lastState!==state) toast('Stato aggiornato');
     lastState=state;
   })
   .finally(()=>setTimeout(poll,10000));
}

function fetchTrend24h(){
  fetch(CFG.endpoint+'?trend=24h')
    .then(r=>r.json())
    .then(data=> drawTrend(data.trend24h||[]))
    .catch(()=>{});
}

function drawTrend(points){
  const cvs=document.getElementById('chart24h'); if(!cvs) return; const ctx=cvs.getContext('2d');
  const W=cvs.width=cvs.clientWidth, H=cvs.height; ctx.clearRect(0,0,W,H);
  // Axes
  ctx.strokeStyle='#1c2a3f'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(30,10); ctx.lineTo(30,H-20); ctx.lineTo(W-10,H-20); ctx.stroke();
  // Data
  const n=points.length||1; const x0=30, y0=H-20, xr=(W-40)/Math.max(1,n-1), yr=(H-40);
  ctx.strokeStyle='#8fb5ff'; ctx.lineWidth=2; ctx.beginPath();
  points.forEach((p,i)=>{ const x=x0+i*xr; const y=y0-(p.present?1:0)*yr; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.stroke();
}

window.addEventListener('DOMContentLoaded', ()=>{ renderPeople(); poll(); fetchTrend24h();
  $('#vacanza').addEventListener('change', e=> sendHouse('set_vacanza', e.target.checked));
  $('#override').addEventListener('change', e=> sendHouse('set_override', e.target.checked));
});

function sendHouse(event, value){
  const pin = prompt('Inserisci PIN per confermare:'); if(pin!==CFG.pin) return toast('PIN errato');
  fetch(CFG.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event, value, pin:CFG.pin})})
    .then(r=>r.text()).then(()=>toast('Stato aggiornato')).catch(()=>toast('Errore invio'));
}
