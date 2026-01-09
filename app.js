// ======= موديلات السيارات =======
const modelsData = {
  Renault:["Clio","Symbol","Logan","Megane","Kangoo"],
  Peugeot:["206","207","208","301","308"],
  Dacia:["Logan","Sandero","Duster"],
  Volkswagen:["Golf","Polo","Passat"],
  Hyundai:["i10","i20","Accent","Elantra"],
  Toyota:["Yaris","Corolla","Hilux"]
};

brand.addEventListener("change",()=>{
  model.innerHTML='<option value="">-- موديل السيارة --</option>';
  (modelsData[brand.value]||[]).forEach(m=>{
    let o=document.createElement("option");
    o.textContent=m;
    model.appendChild(o);
  });
});

// ======= قطع الغيار الفرنسية + العربية =======
const parts = {
  bougie: "Bougie (شمعة الإشعال)",
  injecteur: "Injecteur (حاقن الوقود)",
  pompe: "Pompe à carburant (مضخة الوقود)",
  capteur: "Capteur (حساس)",
  embrayage: "Embrayage (القابض)",
  radiateur: "Radiateur (المبرد)",
  alternateur: "Alternateur (المولد)",
  batterie: "Batterie (البطارية)"
};

// ======= متغيرات =======
const loader = document.getElementById("loader");
const result = document.getElementById("result");
const preview = document.getElementById("preview");
const waBtn = document.getElementById("waBtn");
let report = "";

// ======= دالة AI مع رابط Worker الخاص بك =======
async function runAI(){
  if(problem.value.trim()===""){alert("اكتب المشكل");return;}
  loader.style.display="block";
  result.innerHTML="";
  waBtn.style.display="none";

  let prompt = `
أجب بالعربية بأسلوب جزائري راقي،
اذكر القطع بالفرنسية ثم شرحها بالعربية بين قوسين،
السيارة: ${brand.value} ${model.value}
السنة: ${year.value}
المحرك: ${engine.value}
المشكل: ${problem.value}
`;

  let imageText = "";
  if(preview.src){
    imageText = "الصورة المرفوعة ستُحلل لاحقًا بواسطة Vision API.";
  }
  prompt += "\n" + imageText;

  try {
    const res = await fetch("https://tiny-bread-cdfe.imadmahmoud45.workers.dev/", { // هنا رابط Worker
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    const content = data.reply;

    report = `
السيارة: ${brand.value} ${model.value}
السنة: ${year.value}
المحرك: ${engine.value}
المشكل: ${problem.value}

${imageText}

🔍 التحليل الذكي:
${content}

📌 النصيحة:
راجع ميكانيكي ثقة للفحص النهائي.

⚠️ AutOmad يعطي توجيه مبدئي فقط.
`;
    result.innerHTML=`<div class="result-card"><h3>🔍 تشخيص ذكي</h3><p>${report.replace(/\n/g,"<br>")}</p></div>`;
    waBtn.style.display="flex";
  } catch(err){
    result.innerHTML=`<div class="result-card" style="color:red;"><h3>❌ خطأ</h3><p>${err.message}</p></div>`;
  } finally {
    loader.style.display="none";
  }
}

// ======= الكاميرا =======
camera.addEventListener("change",()=>{
  const file=camera.files[0];
  if(!file) return;
  preview.src = URL.createObjectURL(file);
  preview.style.display="block";
  runAI();
});

// ======= خرائط =======
function findParts(){
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude, longitude} = pos.coords;
    window.open(`https://www.google.com/maps/search/ميكانيكي+قطع+غيار/@${latitude},${longitude},15z`, "_blank");
  });
}

// ======= WhatsApp =======
function sendWhats(){
  const msg = encodeURIComponent("تقرير AutOmad:\n\n"+report);
  window.open(`https://wa.me/?text=${msg}`, "_blank");
}