const KEY="masroofi.transactions.v1";
const CATS={
 expense:["أكل وشرب","مواصلات وبنزين","ملابس","منزل وفواتير","صحة وأدوية","ترفيه وطلعات","مشتريات","أخرى"],
 income:["راتب","دخل إضافي","استرداد مبلغ","هدية","أخرى"],
 transfer:["مساعدة عائلية","تحويل","أخرى"],
 debt:["سلفة أعطيتها","دين استرددته","دين عليّ","أخرى"]
};
const ICONS={"أكل وشرب":"🍔","مواصلات وبنزين":"🛵","ملابس":"👕","منزل وفواتير":"🏠","صحة وأدوية":"💊","ترفيه وطلعات":"🎮","مشتريات":"🛍️","راتب":"💰","دخل إضافي":"💵","استرداد مبلغ":"↩️","هدية":"🎁","مساعدة عائلية":"🤝","تحويل":"🔁","سلفة أعطيتها":"🤲","دين استرددته":"💸","دين عليّ":"📌","أخرى":"•"};
let txs=load(), drafts=[];
const $=id=>document.getElementById(id);
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []}}
function save(){localStorage.setItem(KEY,JSON.stringify(txs));render()}
function money(n){return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:2}).format(n)}
function today(){return new Date().toISOString().slice(0,10)}
function monthNow(){return today().slice(0,7)}
function toast(s){$("toast").textContent=s;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2600)}
function norm(s){return (s||"").toLowerCase().replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[إأآ]/g,"ا").replace(/ة/g,"ه").replace(/[ًٌٍَُِّْـ]/g,"").replace(/[،؛]/g," ").replace(/\s+/g," ").trim()}
const units={"صفر":0,"واحد":1,"واحده":1,"واحدة":1,"واحده":1,"واحدا":1,"اثنين":2,"اثنان":2,"اتنين":2,"تنين":2,"ثلاثه":3,"ثلاثة":3,"تلاته":3,"اربعه":4,"أربعة":4,"خمسه":5,"خمسة":5,"سته":6,"ستة":6,"سبعه":7,"سبعة":7,"تمانيه":8,"ثمانيه":8,"ثمانية":8,"تسعه":9,"تسعة":9,"عشره":10,"عشرة":10,"احدعش":11,"حدعش":11,"اثنعش":12,"تنعش":12,"تلتعش":13,"اربعتعش":14,"خمستعش":15,"ستعش":16,"سبعتعش":17,"تمنتعش":18,"تسعتعش":19};
const tens={"عشرين":20,"عشرون":20,"ثلاثين":30,"ثلاثون":30,"تلاتين":30,"اربعين":40,"أربعين":40,"خمسين":50,"ستين":60,"سبعين":70,"تمانين":80,"ثمانين":80,"تسعين":90};
const hundreds={"ميه":100,"مية":100,"مئه":100,"مئة":100,"ميتين":200,"مئتين":200,"ثلاثمية":300,"تلتميه":300,"اربعمية":400,"خمسمية":500,"ستمئة":600,"سبعمية":700,"ثمانمية":800,"تسعمية":900};
function wordNumber(text){
 let t=norm(text).replace(/و(?=[\u0600-\u06FF])/g," ").split(" ").filter(Boolean);
 let total=0, group=0, found=false;
 for(let w of t){
  if(w==="ليره"||w==="ليرات"||w==="تركي"||w==="تركيه"||w==="تركية"||w==="دولار"||w==="دولارات"||w==="على"||w==="من"||w==="ب")continue;
  if(units[w]!==undefined){group+=units[w];found=true;continue}
  if(tens[w]!==undefined){group+=tens[w];found=true;continue}
  if(hundreds[w]!==undefined){group+=hundreds[w];found=true;continue}
  if(["الف","آلاف","الاف","ألف","الفين","ألفين"].includes(w)){total+=(group||1)*((w==="الفين"||w==="ألفين")?2000:1000);group=0;found=true;continue}
  if(["مليون","مليونين"].includes(w)){total+=(group||1)*(w==="مليونين"?2000000:1000000);group=0;found=true;continue}
 }
 return found?total+group:null;
}
function amountFrom(s){
 const m=norm(s).match(/(?:^|\s)(\d+(?:[.,]\d+)?)(?:\s*(الف|الاف|آلاف|ألف|ألفين|الفين|مليون))?/);
 if(m){let n=Number(m[1].replace(",","."));if(m[2])n*=/مليون/.test(m[2])?1000000:/ألفين|الفين/.test(m[2])?2000:1000;return n}
 return wordNumber(s);
}
function categoryFor(s,type){
 const x=norm(s);
 if(/اكل|غدا|عشا|فطور|مطعم|قهوه|كافيه|بقاله|سوبرماركت/.test(x))return "أكل وشرب";
 if(/بنزين|مواصلات|تاكسي|مترو|باص|موتور|سياره/.test(x))return "مواصلات وبنزين";
 if(/تياب|ملابس|قميص|بنطلون|حذاء/.test(x))return "ملابس";
 if(/ايجار|كهربا|مي|ماء|غاز|فاتوره|بيت/.test(x))return "منزل وفواتير";
 if(/دواء|دكتور|مستشفى|صيدليه|طبيب/.test(x))return "صحة وأدوية";
 if(/لعبه|العاب|طلعه|سينما|ترفيه/.test(x))return "ترفيه وطلعات";
 if(/راتب|معاش|قبض/.test(x))return "راتب";
 if(/شغل|دخل اضافي|مبيعات/.test(x))return "دخل إضافي";
 if(/اختي|اخي|امي|ابي|اهلي|عيله|عائله/.test(x))return "مساعدة عائلية";
 if(type==="debt")return "سلفة أعطيتها";
 return type==="income"?"أخرى":"مشتريات";
}
function inferType(s){
 const x=norm(s);
 if(/رجعلي|رجع لي|استرديت|سددلي|ردلي|رد لي/.test(x))return "income";
 if(/راتب|قبضت|استلمت|دخلني|ربحت|اجاني مبلغ|وصلني مبلغ/.test(x))return "income";
 if(/سلفت|سلف|دين|استلفت/.test(x))return "debt";
 if(/عطيت|اعطيت|حولت|بعتله|ساعدت/.test(x))return "transfer";
 return "expense";
}
function splitUtterance(s){
 // Split only at clear new transaction verbs; keep "و" inside spoken number phrases.
 return norm(s).replace(/([،؛.!؟])/g," | ").replace(/\s+(?=و?(?:قبضت|استلمت|صرفت|اشتريت|دفعت|عطيت|اعطيت|ساعدت|سلفت|حولت|رجعلي|رجع\sلي|دفعتله|وصلني)\b)/g," | ").split("|").map(x=>x.trim().replace(/^و(?=[؀-ۿ])/ , "")).filter(Boolean);
}
function parseVoice(s){
 const chunks=splitUtterance(s), out=[];
 for(const part of chunks){
  const amount=amountFrom(part);
  if(!amount||amount<=0)continue;
  const type=inferType(part);
  const category=categoryFor(part,type);
  const note=part.replace(/[0-9٠-٩۰-۹]+/g," ").replace(/ليرات?|تركيه|تركي/g," ").trim();
  out.push({id:crypto.randomUUID(),date:today(),type,amount,category,note,account:"كاش",person:"",raw:part});
 }
 return out;
}
function render(){
 const month=$("monthPicker").value||monthNow();
 const mi=txs.filter(t=>t.date?.startsWith(month));
 const income=mi.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);
 const expense=mi.filter(t=>["expense","transfer","debt"].includes(t.type)).reduce((a,t)=>a+t.amount,0);
 const allIn=txs.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);
 const allOut=txs.filter(t=>["expense","transfer","debt"].includes(t.type)).reduce((a,t)=>a+t.amount,0);
 $("balance").textContent=money(allIn-allOut);$("income").textContent=money(allIn);$("expense").textContent=money(allOut);
 $("monthIncome").textContent=money(income);$("monthExpense").textContent=money(expense);$("monthNet").textContent=money(income-expense);
 const by={};mi.filter(t=>["expense","transfer","debt"].includes(t.type)).forEach(t=>by[t.category]=(by[t.category]||0)+t.amount);
 const max=Math.max(1,...Object.values(by));
 $("categories").innerHTML=Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<div class="category-row"><div class="category-meta"><span>${ICONS[c]||"•"} ${esc(c)}</span><span>${money(v)}</span></div><div class="bar"><i style="width:${v/max*100}%"></i></div></div>`).join("")||'<div class="empty">لا توجد مصروفات في هذا الشهر</div>';
 $("transactions").innerHTML=txs.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.created||0)-(a.created||0)).slice(0,60).map(t=>`<div class="tx"><div class="tx-icon">${ICONS[t.category]||"•"}</div><div class="tx-main"><div class="tx-title">${esc(t.category)} · ${esc(t.note||"بدون وصف")}</div><div class="tx-sub">${esc(t.date||"")} · ${typeName(t.type)}</div></div><div class="tx-amount ${t.type==="income"?"positive":"negative"}">${t.type==="income"?"+":"−"}${money(t.amount)}</div><div class="tx-tools"><button data-edit="${t.id}" title="تعديل">✎</button><button data-del="${t.id}" title="حذف">×</button></div></div>`).join("")||'<div class="empty">لم تسجل أي عملية بعد</div>';
}
function typeName(t){return ({income:"دخل",expense:"مصروف",transfer:"تحويل / مساعدة",debt:"سلفة / دين"})[t]||t}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function showDrafts(items){
 drafts=items;$("draftSection").classList.remove("hidden");$("draftCount").textContent=items.length+" عملية";
 $("drafts").innerHTML=items.map((t,i)=>`<div class="draft"><strong>عملية ${i+1} · ${esc(t.raw||"")}</strong><div class="draft-grid">
 <label>النوع<select data-k="type" data-i="${i}">${["expense","income","transfer","debt"].map(x=>`<option value="${x}" ${t.type===x?"selected":""}>${typeName(x)}</option>`).join("")}</select></label>
 <label>المبلغ<input data-k="amount" data-i="${i}" type="number" min="0" step=".01" value="${t.amount}"></label>
 <label>التصنيف<select data-k="category" data-i="${i}">${CATS[t.type].map(x=>`<option ${x===t.category?"selected":""}>${x}</option>`).join("")}</select></label>
 <label>الوصف<input data-k="note" data-i="${i}" value="${esc(t.note)}"></label>
 </div></div>`).join("");
}
$("parseBtn").onclick=()=>{const s=$("voiceText").value.trim();if(!s)return toast("اكتب أو أمْلِ العملية أولاً");const p=parseVoice(s);if(!p.length)return toast("لم أستطع تحديد المبلغ. جرّب قول الرقم بوضوح مثل: ١٢٠ ليرة.");showDrafts(p)};
$("voiceBtn").onclick=()=>{toast("استخدم اختصار الآيفون «مصروفي صوتياً» للإملاء العربي، ثم أرسل النص هنا.");$("voiceText").focus()};
$("drafts").addEventListener("change",e=>{const el=e.target,i=Number(el.dataset.i),k=el.dataset.k;if(!k||!drafts[i])return;drafts[i][k]=k==="amount"?Number(el.value):el.value;if(k==="type"){drafts[i].category=CATS[el.value][0];showDrafts(drafts)}});
$("saveDrafts").onclick=()=>{if(drafts.some(t=>!t.amount||t.amount<=0))return toast("تأكد من المبالغ قبل الحفظ");txs.push(...drafts.map(t=>({...t,created:Date.now()})));save();drafts=[];$("draftSection").classList.add("hidden");$("voiceText").value="";toast("تم حفظ العمليات")};
$("discardDrafts").onclick=()=>{$("draftSection").classList.add("hidden");drafts=[]};
function manualOpen(){$("manualPanel").classList.remove("hidden");$("mDate").value=today();fillCats()}
function fillCats(){const type=$("mType").value;$("mCategory").innerHTML=CATS[type].map(x=>`<option>${x}</option>`).join("")}
$("mType").onchange=fillCats;$("addManual").onclick=manualOpen;$("navAdd").onclick=manualOpen;$("closeManual").onclick=()=>$("manualPanel").classList.add("hidden");
$("saveManual").onclick=()=>{const amount=Number($("mAmount").value);if(!amount||amount<=0)return toast("أدخل مبلغاً صحيحاً");txs.push({id:crypto.randomUUID(),created:Date.now(),date:$("mDate").value||today(),type:$("mType").value,amount,category:$("mCategory").value,note:$("mNote").value,account:"كاش"});save();$("manualPanel").classList.add("hidden");$("mAmount").value="";$("mNote").value="";toast("تمت إضافة العملية")};
$("transactions").addEventListener("click",e=>{const del=e.target.dataset.del,edit=e.target.dataset.edit;if(del){if(confirm("هل تريد حذف هذه العملية؟")){txs=txs.filter(t=>t.id!==del);save();toast("تم الحذف")}}if(edit){const t=txs.find(x=>x.id===edit);if(!t)return;$("mType").value=t.type;fillCats();$("mAmount").value=t.amount;$("mCategory").value=t.category;$("mNote").value=t.note;$("mDate").value=t.date;manualOpen();$("mType").value=t.type;fillCats();$("mAmount").value=t.amount;$("mCategory").value=t.category;$("mNote").value=t.note;$("mDate").value=t.date;txs=txs.filter(x=>x.id!==edit);save()}});
$("monthPicker").value=monthNow();$("monthPicker").onchange=render;
function download(name,data,type){const a=document.createElement("a"),u=URL.createObjectURL(new Blob([data],{type}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)}
function backup(){download("masroofi-backup-"+today()+".json",JSON.stringify({version:1,currency:"TRY",transactions:txs},null,2),"application/json")}
$("exportBtn").onclick=backup;$("navBackup").onclick=backup;
$("exportBtn").addEventListener("contextmenu",e=>e.preventDefault());
function ingestQuery(){
 const q=new URLSearchParams(location.search),v=q.get("voice");if(!v)return;
 $("voiceText").value=v;const p=parseVoice(v);if(p.length)showDrafts(p);else toast("وصل الكلام، لكن لم أفهم المبلغ. راجعه وأعد التحليل.");
 history.replaceState({},document.title,location.pathname);
}
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();ingestQuery();
