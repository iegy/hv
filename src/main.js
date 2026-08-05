// main.js — initializes editor, binds controls and updates iframe preview
const sleep = (ms) => new Promise(r=>setTimeout(r,ms));

// Wait until Ace and other libs loaded
async function whenReady(){
  while(typeof ace === 'undefined' || typeof DOMPurify === 'undefined' || typeof html_beautify === 'undefined'){
    await sleep(50);
  }
}

await whenReady();

const editorEl = document.getElementById('editor');
const preview = document.getElementById('preview');

const editor = ace.edit(editorEl, {mode: 'ace/mode/html', theme: 'ace/theme/dracula', showPrintMargin:false});
editor.session.setUseWorker(false);
editor.setOptions({ fontSize: '14px', wrap: true });

// sample starter content
const starter = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Sample</title>
    <style>body{font-family:system-ui;padding:20px}</style>
  </head>
  <body>
    <h1>أهلاً — مستعرض HTML متقدّم</h1>
    <p>غيّر الكود في الجهة اليسرى لترى التحديث.</p>
  </body>
</html>`;

editor.setValue(starter, -1);

// controls
const autoUpdate = document.getElementById('autoUpdate');
const allowScripts = document.getElementById('allowScripts');
const sanitize = document.getElementById('sanitize');
const rtlToggle = document.getElementById('rtlToggle');
const device = document.getElementById('device');
const formatBtn = document.getElementById('formatBtn');
const minifyBtn = document.getElementById('minifyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

let timeout = null;

function updatePreview(){
  let html = editor.getValue();
  if(sanitize.checked){
    try{ html = DOMPurify.sanitize(html, {RETURN_TRUSTED_TYPE: false}); }catch(e){console.warn('sanitize failed',e)}
  }

  const sandboxAttrs = ['allow-forms','allow-same-origin'];
  if(allowScripts.checked){
    // when scripts allowed we must be careful: allow-scripts and allow-modals only if user explicitly enables
    sandboxAttrs.push('allow-scripts');
  }

  preview.setAttribute('sandbox', sandboxAttrs.join(' '));
  preview.srcdoc = html;
}

editor.on('change', ()=>{
  if(autoUpdate.checked){
    clearTimeout(timeout);
    timeout = setTimeout(updatePreview, 300);
  }
});

// initial render
updatePreview();

formatBtn.addEventListener('click', ()=>{
  const formatted = html_beautify(editor.getValue(), {indent_size:2,wrap_line_length:120});
  editor.setValue(formatted, -1);
  updatePreview();
});

minifyBtn.addEventListener('click', ()=>{
  const min = editor.getValue().replace(/>\s+</g,'><').trim();
  editor.setValue(min, -1);
  updatePreview();
});

downloadBtn.addEventListener('click', ()=>{
  const blob = new Blob([editor.getValue()], {type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'preview.html';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

copyBtn.addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText(editor.getValue()); alert('تم النسخ'); }catch(e){ alert('النسخ فشل'); }
});

rtlToggle.addEventListener('change', ()=>{
  document.documentElement.dir = rtlToggle.checked ? 'rtl' : 'ltr';
  updatePreview();
});

device.addEventListener('change', ()=>{
  const w = device.value;
  preview.style.width = w ? `${w}px` : '100%';
});

allowScripts.addEventListener('change', ()=>{
  // re-render with updated sandbox attrs
  updatePreview();
});

sanitize.addEventListener('change', ()=>{
  updatePreview();
});

fullscreenBtn.addEventListener('click', ()=>{
  if(document.fullscreenElement){ document.exitFullscreen(); return; }
  preview.requestFullscreen().catch(()=>{});
});

// keyboard shortcuts
window.addEventListener('keydown', (e)=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === 's'){ e.preventDefault(); formatBtn.click(); }
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === 'b'){ e.preventDefault(); updatePreview(); }
});

// quick safety: if scripts allowed, show a console message
if(allowScripts.checked){ console.warn('Scripts allowed in iframe — ensure you trust the content.'); }
