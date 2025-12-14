const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHtApB8b710FFQnie95hXkRJl7uW2_lFfHXdopi7AUa3jOk2egbkhs5pds7jmpOmjLOA/exec';

function openTab(evt, tabName) {
    let tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) tabcontent[i].classList.add("hidden");
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) tablinks[i].className = tablinks[i].className.replace(" active","");
    document.getElementById(tabName).classList.remove("hidden");
    evt.currentTarget.className += " active";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('agreementDate').textContent = new Date().toLocaleDateString('hi-IN');
    document.getElementById('closeDate').value = new Date().toLocaleDateString('hi-IN');
    document.querySelector(".tablinks").click();
    setupSignaturePad('signatureCanvas');
    setupSignaturePad('returnSignatureCanvas');
});

function setupSignaturePad(canvasId){
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    let isDrawing=false; ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.lineCap='round';
    function getCoords(e){ const rect=canvas.getBoundingClientRect(); const x=e.touches?e.touches[0].clientX:e.clientX; const y=e.touches?e.touches[0].clientY:e.clientY; return {x:x-rect.left, y:y-rect.top};}
    function start(e){ e.preventDefault(); isDrawing=true; const c=getCoords(e); ctx.beginPath(); ctx.moveTo(c.x,c.y);}
    function draw(e){ e.preventDefault(); if(!isDrawing) return; const c=getCoords(e); ctx.lineTo(c.x,c.y); ctx.stroke();}
    function stop(e){ e.preventDefault(); isDrawing=false; ctx.closePath();}
    canvas.addEventListener('mousedown',start); canvas.addEventListener('mousemove',draw);
    canvas.addEventListener('mouseup',stop); canvas.addEventListener('mouseout',stop);
    canvas.addEventListener('touchstart',start); canvas.addEventListener('touchmove',draw); canvas.addEventListener('touchend',stop);
}

window.clearSignature=function(canvasId){ const canvas=document.getElementById(canvasId); const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height);}

document.getElementById('loanIssuanceForm').addEventListener('submit', function(e){
    e.preventDefault();
    const submitButton=e.submitter; submitButton.disabled=true;
    const formData=new FormData(e.target);
    formData.append('sheet','Issuance_Data');
    formData.append('signatureData',document.getElementById('signatureCanvas').toDataURL('image/png'));
    fetch(APPS_SCRIPT_URL,{method:'POST',body:formData})
    .then(res=>res.text()).then(text=>{
        let result;
        try{result=JSON.parse(text);}catch(err){result={success:false,error:'Non-JSON response'};}
        if(result.success){alert('✅ रिकॉर्ड सेव हो गया'); e.target.reset(); clearSignature('signatureCanvas');}
        else{alert('❌ डेटा सेव में error: '+(result.error||'अज्ञात त्रुटि')); console.error(result.error);}
    }).catch(err=>{alert('❌ नेटवर्क त्रुटि'); console.error(err);}).finally(()=>{submitButton.disabled=false;});
});

document.getElementById('loanClosureForm').addEventListener('submit', function(e){
    e.preventDefault();
    const submitButton=e.submitter; submitButton.disabled=true;
    const formData=new FormData(e.target);
    formData.append('sheet','Return_Data');
    formData.append('searchId',document.getElementById('searchId').value);
    formData.append('returnSignatureData',document.getElementById('returnSignatureCanvas').toDataURL('image/png'));
    fetch(APPS_SCRIPT_URL,{method:'POST',body:formData})
    .then(res=>res.text()).then(text=>{
        let result;
        try{result=JSON.parse(text);}catch(err){result={success:false,error:'Non-JSON response'};}
        if(result.success){alert('✅ ऋण बंद हो गया'); document.getElementById('loanDetailsDisplay').classList.add('hidden'); e.target.reset(); clearSignature('returnSignatureCanvas');}
        else{alert('❌ डेटा सेव में error: '+(result.error||'अज्ञात त्रुटि')); console.error(result.error);}
    }).catch(err=>{alert('❌ नेटवर्क त्रुटि'); console.error(err);}).finally(()=>{submitButton.disabled=false;});
});

window.searchLoanRecord=function(){
    const searchId=document.getElementById('searchId').value;
    if(searchId){
        document.getElementById('customerNameDisplay').textContent="रमेश कुमार";
        document.getElementById('loanIDDisplay').textContent=searchId;
        document.getElementById('loanAmountDisplay').textContent=50000;
        document.getElementById('jewelryDescDisplay_Return').textContent="1 सोने की चेन, 20 ग्राम";
        document.getElementById('loanDetailsDisplay').classList.remove('hidden');
    } else {
        alert('कृपया मोबाइल नंबर दर्ज करें');
        document.getElementById('loanDetailsDisplay').classList.add('hidden');
    }
}
