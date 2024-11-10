document.addEventListener("DOMContentLoaded",(()=>{let e=0;window.addNewRow=()=>{const t=document.getElementById("rows");e++;const n=document.createElement("div");n.className="row",n.innerHTML=`\n            <textarea id="text_${e}" placeholder="Enter your poem here..."></textarea>\n            <input type="file" id="bgImage_${e}" accept="image/*" />\n            <button onclick="splitText(${e})">Split in Two</button>\n        `,t.appendChild(n)},window.splitText=t=>{const n=document.getElementById(`text_${t}`),a=n.value;if(a.length>0){const t=Math.floor(a.length/2);n.value=a.substring(0,t),addNewRow(),document.getElementById(`text_${e}`).value=a.substring(t)}},window.generatePDF=()=>{const e=new jsPDF,n=document.getElementById("coverImage").files[0];if(n){const a=new FileReader;a.onload=function(n){e.addImage(n.target.result,"JPEG",15,40,180,160),t(e)},a.readAsDataURL(n)}else t(e)};const t=e=>{let t=1;document.querySelectorAll(".row").forEach((n=>{t>1&&e.addPage();const a=n.querySelector("textarea"),o=n.querySelector('input[type="file"]').files[0];if(o){const t=new FileReader;t.onload=function(t){e.addImage(t.target.result,"JPEG",0,0,210,297),e.text(a.value,15,150)},t.readAsDataURL(o)}else e.text(a.value,15,150);t++})),e.save("Magazine.pdf")}}));