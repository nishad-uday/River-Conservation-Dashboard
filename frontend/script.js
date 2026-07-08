const API_BASE = "http://127.0.0.1:5000";

let langHindi = false;
const langToggle = document.getElementById('langToggle');
const refreshBtn = document.getElementById('refreshBtn');
const resultBox = document.getElementById('resultBox');
const alertArea = document.getElementById('alertArea');
const historyBody = document.getElementById('historyBody');

langToggle && langToggle.addEventListener('change', ()=>{ langHindi = langToggle.checked; applyLang(); });

refreshBtn && refreshBtn.addEventListener('click', ()=>{ fetchHistory(); fetchRecentAndUpdateChart(); });

// helpers
function readInputs(){
  return {
    pH: parseFloat(document.getElementById('ph').value || 0),
    EC: parseFloat(document.getElementById('ec').value || 0),
    TDS: parseFloat(document.getElementById('tds').value || 0),
    Temperature: parseFloat(document.getElementById('temp').value || 0),
    DissolvedOxygen: parseFloat(document.getElementById('do').value || 0),
    Moisture: parseFloat(document.getElementById('moisture').value || 0),
    device_id: "manual-web"
  };
}

document.getElementById('btnCheck').addEventListener('click', async ()=>{
  const payload = readInputs();
  try{
    const res = await fetch(API_BASE + "/predict", {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data.status === "error"){ resultBox.innerText = (langHindi? "त्रुटि: ":"Error: ") + data.message; return; }
    showResult(data, payload);
    fetchHistory(); fetchRecentAndUpdateChart();
  }catch(e){
    resultBox.innerText = (langHindi? "त्रुटि: ":"Error: ") + e.message;
  }
});

document.getElementById('btnIngest').addEventListener('click', async ()=>{
  const payload = readInputs();
  try{
    const res = await fetch(API_BASE + "/ingest", {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    const r = await res.json();
    if(r.status === "ok"){
      resultBox.innerText = langHindi? "रीडिंग सहेजी गयी।":"Reading saved.";
      fetchHistory(); fetchRecentAndUpdateChart();
    } else {
      resultBox.innerText = "Error: " + JSON.stringify(r);
    }
  }catch(e){
    resultBox.innerText = "Error: " + e.message;
  }
});

// CSV upload handlers
document.getElementById('uploadCSV').addEventListener('click', ()=> document.getElementById('csvFile').click());
document.getElementById('csvFile').addEventListener('change', async (ev)=>{
  const file = ev.target.files[0]; if(!file) return;
  const form = new FormData(); form.append('file', file);
  try{
    const res = await fetch(API_BASE + "/upload_csv", { method:"POST", body: form });
    const j = await res.json();
    if(j.status === "ok"){ showAlert(langHindi? "CSV अपलोड सफल":"CSV uploaded", "warn"); fetchHistory(); fetchRecentAndUpdateChart(); }
    else alert("Upload error: " + j.msg);
  }catch(e){ alert("Upload failed: " + e.message); }
});

function showResult(data, inputs){
  let quality = data.quality === 1 ? (langHindi? "सुरक्षित (GOOD)":"GOOD (सुरक्षित)") : (langHindi? "दूषित (POLLUTED)":"POLLUTED (दूषित)");
  let conf = data.probability ? ` • ${(Math.round(data.probability*100))}%` : "";
  resultBox.innerText = `${langHindi? "परिणाम":"Result"}: ${quality}${conf}\n${langHindi? "इनपुट":"Input"}: ${JSON.stringify(inputs, null, 2)}`;
  if(data.quality === 0) showAlert(langHindi? "अलर्ट: दूषित पानी मिला!":"ALERT: Polluted water detected!", "danger");
}

// Chart
let phChart = null;
async function fetchRecentAndUpdateChart(){
  try{
    const res = await fetch(API_BASE + "/recent");
    const arr = await res.json();
    if(!Array.isArray(arr)) return;
    const last = arr.slice(-120);
    const labels = last.map(i => i.timestamp ? new Date(i.timestamp).toLocaleTimeString() : "");
    const pHvals = last.map(i => parseFloat(i.pH || 0));
    if(!phChart){
      const ctx = document.getElementById('phChart').getContext('2d');
      phChart = new Chart(ctx, { type:'line', data:{ labels, datasets:[{label:'pH', data:pHvals, borderColor:'#18d3c6', tension:0.25}]}, options:{responsive:true, scales:{y:{suggestedMin:4, suggestedMax:10}}}});
    } else {
      phChart.data.labels = labels; phChart.data.datasets[0].data = pHvals; phChart.update();
    }
  }catch(e){ console.error(e); }
}

// ✅ UPDATED — History table with color highlighting
async function fetchHistory(){
  try{
    const res = await fetch(API_BASE + "/recent");
    const arr = await res.json();
    if(!Array.isArray(arr)) return;
    const items = arr.slice(-50).reverse();
    if(items.length === 0){
      historyBody.innerHTML = `<tr><td colspan="7" class="muted">${langHindi? 'कोई डेटा नहीं':'No data yet'}</td></tr>`;
      return;
    }
    historyBody.innerHTML = '';
    items.forEach(it=>{
      const time = it.timestamp || '';
      const isPolluted = it.model_result && it.model_result.quality === 0;
      const resultText = isPolluted
        ? (langHindi ? 'दूषित (Polluted)' : 'Polluted')
        : (langHindi ? 'सुरक्षित (Good)' : 'Good');
      const rowColor = isPolluted
        ? 'style="background:rgba(255,60,60,0.12)"'
        : 'style="background:rgba(60,255,100,0.08)"';
      const row = `<tr ${rowColor}>
        <td>${time}</td>
        <td>${it.pH ?? ''}</td>
        <td>${it.EC ?? ''}</td>
        <td>${it.TDS ?? ''}</td>
        <td>${it.DissolvedOxygen ?? ''}</td>
        <td>${it.Moisture ?? ''}</td>
        <td><strong>${resultText}</strong></td>
      </tr>`;
      historyBody.insertAdjacentHTML('beforeend', row);
    });
  }catch(e){ console.error(e); }
}

// Alerts
function showAlert(msg, type='warn'){
  const el = document.createElement('div'); 
  el.className = 'alert ' + (type==='danger' ? 'danger' : 'warn'); 
  el.innerText = msg;
  alertArea.prepend(el); 
  setTimeout(()=> el.remove(), 9000);
}

// Language
function applyLang(){
  document.getElementById('inputTitle').innerText = langHindi ? 'मैनुअल परीक्षण' : 'Manual Test';
  resultBox.innerText = langHindi ? 'परिणाम यहाँ आएगा' : 'Result will appear here';
}
window.addEventListener('load', ()=>{
  applyLang(); fetchHistory(); fetchRecentAndUpdateChart(); setInterval(fetchRecentAndUpdateChart, 5000);
});
