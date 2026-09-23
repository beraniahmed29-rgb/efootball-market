/* pages — minimal premium UX. All features kept. Real card images everywhere. */
window.EFM = window.EFM || {};
EFM.ui = EFM.ui || {
  explore:{q:"",chip:"All",sort:"newest",wantNames:[],mode:"all"},
  prices:{q:"",type:"All",sort:"value-desc"},
  sell:{step:1,platform:"Android",linkage:"Google linked",selected:["bt_messi_001","bt_ronaldo_001"],images:[],price:40},
  wantedForm:{selected:["Messi","Cristiano Ronaldo"],budgetMin:30,budgetMax:50,platform:"Android",minRares:2},
  profileTab:"listings", adminTab:"cards", adminQ:"", adminType:"All", diag:null, importRes:null
};
(function(E){
const u=E.util, c=E.c, ui=E.ui;

/* ---------- shared ---------- */
function matchCountFor(w){
  const req={wantNames:w.wantNames,budgetMin:0,budgetMax:99999,platform:null,minRares:0,mode:"all"};
  return EFM_DATA.LISTINGS.filter(l=>l.verification!=="Rejected"&&u.matchScore(l,req).pct>=60).length;
}
function activeListings(){ return EFM_DATA.LISTINGS.filter(l=>l.verification!=="Rejected"); }

/* ================= HOME ================= */
function home(){
  const cards=u.allCards();
  const popular=[...cards].sort((a,b)=>b.demand-a.demand||u.liveVal(b)-u.liveVal(a)).slice(0,8);
  const byType=t=>cards.filter(x=>x.card_type===t);
  function catSection(type){
    const list=byType(type);
    if(!list.length)
      return '<div class="sec-head"><h2>'+type+'</h2><span class="count">0 cards</span></div>'
        +c.emptyState("◌","No cards imported yet.","Import a card ZIP to fill this shelf.","#/admin","Import Card ZIP");
    return '<div class="sec-head"><h2>'+type+'</h2><span class="count">'+list.length+' cards</span><a href="#/prices?type='+encodeURIComponent(type)+'">View all →</a></div>'
      +'<div class="hscroll">'+list.map(x=>c.cardTile(x)).join('')+'</div>';
  }
  return '<div class="page"><section class="hero"><div class="hero-hi">eFootball Market · Independent community</div>'
  +'<h1>Find the squad you want.</h1><p>Real cards. Transparent value. Verified accounts.</p>'
  +'<div class="big-search"><input id="home-q" type="search" placeholder="Search player, card or account..." /><button data-act="home-search">Search</button></div>'
  +'<div class="hero-ctas"><a class="btn btn-primary" href="#/explore">Explore Accounts</a><a class="btn btn-ghost" href="#/sell">Sell Account</a></div></section>'
  +'<div class="notice info">Card Value is a reference index, not an official price. Never share passwords or 2FA codes.</div>'
  +'<div class="sec-head"><h2>Popular Cards</h2><a href="#/prices">All prices →</a></div>'
  +(popular.length?'<div class="hscroll">'+popular.map(x=>c.cardTile(x)).join('')+'</div>'
    :c.emptyState("◌","No cards imported yet.","Import a card ZIP to get started.","#/admin","Import Card ZIP"))
  +catSection("Big Time")+catSection("Epic")+catSection("Show Time")
  +'</div>';
}
function bindHome(){
  const go=()=>{const q=((document.getElementById("home-q")||{}).value||"").trim(); location.hash=q?"#/search?q="+encodeURIComponent(q):"#/explore";};
  const b=document.querySelector('[data-act="home-search"]'); if(b) b.onclick=go;
  const i=document.getElementById("home-q"); if(i) i.addEventListener("keydown",e=>{if(e.key==="Enter")go();});
}

/* ================= EXPLORE ================= */
function explore(params){
  if(params.q!=null) ui.explore.q=params.q;
  const ex=ui.explore;
  const players=[...new Set(u.allCards().map(c=>c.player_name))].sort();
  return '<div class="page center-col"><h1>Explore</h1><p class="sub">Accounts with real cards.'+(ex.wantNames.length?(" Required: "+ex.wantNames.join(" + ")):"")+'</p>'
  +'<div class="big-search" style="margin-top:12px"><input id="ex-q" type="search" placeholder="Search accounts..." value="'+u.esc(ex.q)+'"/><button data-act="ex-go">Search</button></div>'
  +'<div class="tabs">'
  +["All","Android","iOS","Verified"].map(x=>'<button data-chip="'+x+'" class="'+(ex.chip===x?'on':'')+'">'+x+'</button>').join('')
  +'<span style="flex:1"></span><select id="ex-sort" class="field" style="width:auto">'
  +[["newest","Newest"],["lowest","Lowest Price"],["highest-cv","Highest Card Value"]].map(([v,l])=>'<option value="'+v+'" '+(ex.sort===v?"selected":"")+'>'+l+'</option>').join('')+'</select></div>'
  +'<details class="filter-more"'+(ex.wantNames.length?" open":"")+'><summary>Filter by cards'+(ex.wantNames.length?" ("+ex.wantNames.length+")":"")+'</summary>'
  +'<input id="ex-ps" class="field" type="search" placeholder="Type a player name..." style="margin-top:8px"/>'
  +'<div id="ex-req" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">'
  +players.map(n=>{const th=u.thumbForPlayer(n);return '<button class="chip'+(ex.wantNames.includes(n)?' on':'')+'" data-req="'+u.esc(n)+'">'+(th?c.miniThumb(th):"")+u.esc(n)+'</button>';}).join('')
  +'</div><div style="margin-top:10px"><span class="sr">Match </span><span class="seg"><button data-mode="any" class="'+(ex.mode==="any"?'on':'')+'">Any</button><button data-mode="all" class="'+(ex.mode==="all"?'on':'')+'">All</button></span></div></details>'
  +'<div id="ex-count" class="sr" style="margin:8px 2px"></div><div id="ex-list" class="grid-accounts"></div></div>';
}
function filteredExplore(){
  const ex=ui.explore; let list=activeListings().slice();
  const q=(ex.q||"").toLowerCase().trim();
  if(q) list=list.filter(l=>String(l.id).includes(q)||(l.cardIds||[]).some(id=>{const cc=u.cardById(id);return cc&&cc.player_name.toLowerCase().includes(q);}));
  if(ex.chip==="Android"||ex.chip==="iOS") list=list.filter(l=>l.platform===ex.chip);
  if(ex.chip==="Verified") list=list.filter(l=>l.verification==="Verified");
  if(ex.wantNames.length) list=list.filter(l=>ex.mode==="all"?ex.wantNames.every(n=>u.listingHasPlayer(l,n)):ex.wantNames.some(n=>u.listingHasPlayer(l,n)));
  if(ex.sort==="lowest") list.sort((a,b)=>a.price-b.price);
  else if(ex.sort==="highest-cv") list.sort((a,b)=>u.cardValue(b.cardIds)-u.cardValue(a.cardIds));
  else list.sort((a,b)=>a.daysAgo-b.daysAgo);
  return list;
}
function renderExploreList(){
  const list=filteredExplore();
  const box=document.getElementById("ex-list"), cnt=document.getElementById("ex-count");
  if(cnt) cnt.textContent=list.length?list.length+" account"+(list.length>1?"s":""):"";
  if(box) box.innerHTML=list.length?list.map(l=>c.accountCard(l)).join(""):c.emptyState("◌","No matching accounts found.","Try fewer cards or tell sellers what you want.","#/wanted","Create Wanted Request");
}
function bindExplore(){
  renderExploreList();
  const rer=()=>renderExploreList();
  const q=document.getElementById("ex-q"); if(q){q.addEventListener("input",u.debounce(()=>{ui.explore.q=q.value;rer();},250));}
  const g=document.querySelector('[data-act="ex-go"]'); if(g) g.onclick=rer;
  document.querySelectorAll("[data-chip]").forEach(b=>b.onclick=()=>{ui.explore.chip=b.dataset.chip;document.querySelectorAll("[data-chip]").forEach(x=>x.classList.toggle("on",x===b));rer();});
  const s=document.getElementById("ex-sort"); if(s) s.onchange=()=>{ui.explore.sort=s.value;rer();};
  const ps=document.getElementById("ex-ps");
  if(ps) ps.addEventListener("input",()=>{const t=ps.value.toLowerCase();document.querySelectorAll("#ex-req .chip").forEach(x=>x.style.display=x.textContent.toLowerCase().includes(t)?"":"none");});
  document.querySelectorAll("#ex-req .chip").forEach(x=>x.onclick=()=>{const n=x.dataset.req;const i=ui.explore.wantNames.indexOf(n);if(i>=0)ui.explore.wantNames.splice(i,1);else ui.explore.wantNames.push(n);x.classList.toggle("on");rer();});
  document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{ui.explore.mode=b.dataset.mode;document.querySelectorAll("[data-mode]").forEach(x=>x.classList.toggle("on",x===b));rer();});
}

/* ================= CARD PRICES ================= */
function prices(params){
  if(params.type) ui.prices.type=params.type;
  const f=ui.prices;
  return '<div class="page"><h1>Card Prices</h1><p class="sub">Admin-set reference values. Not official prices.</p>'
  +'<div class="big-search" style="margin-top:12px"><input id="pr-q" type="search" placeholder="Search cards..." value="'+u.esc(f.q)+'"/><button data-act="pr-go">Search</button></div>'
  +'<div class="tabs"><select id="pr-type" class="field" style="width:auto"><option>All</option>'+["Epic","Big Time","Show Time"].map(t=>'<option '+(f.type===t?"selected":"")+'>'+t+'</option>').join('')+'</select>'
  +'<select id="pr-sort" class="field" style="width:auto"><option value="value-desc">Highest value</option><option value="value-asc" '+(f.sort==="value-asc"?"selected":"")+'>Lowest value</option><option value="demand" '+(f.sort==="demand"?"selected":"")+'>Top demand</option><option value="name" '+(f.sort==="name"?"selected":"")+'>Name A–Z</option></select></div>'
  +'<div id="pr-list" class="cards-grid"></div></div>';
}
function renderPriceList(){
  const f=ui.prices; let list=u.allCards();
  if(f.q) list=list.filter(x=>(x.player_name+" "+x.card_type).toLowerCase().includes(f.q.toLowerCase()));
  if(f.type!=="All") list=list.filter(x=>x.card_type===f.type);
  if(f.sort==="value-asc") list.sort((a,b)=>u.liveVal(a)-u.liveVal(b));
  else if(f.sort==="demand") list.sort((a,b)=>b.demand-a.demand);
  else if(f.sort==="name") list.sort((a,b)=>a.player_name.localeCompare(b.player_name));
  else list.sort((a,b)=>u.liveVal(b)-u.liveVal(a));
  const box=document.getElementById("pr-list"); if(!box) return;
  box.innerHTML=list.length?list.map(x=>c.cardTile(x)).join("")
    :(u.allCards(true).length?c.emptyState("◌","No matching cards.","Try another search or type.","#/explore","Explore accounts")
      :c.emptyState("◌","No cards imported yet.","Import a card ZIP to fill the price index.","#/admin","Import Card ZIP"));
}
function bindPrices(){
  renderPriceList();
  const r=()=>renderPriceList();
  const q=document.getElementById("pr-q"); if(q) q.addEventListener("input",u.debounce(()=>{ui.prices.q=q.value;r();},250));
  const g=document.querySelector('[data-act="pr-go"]'); if(g) g.onclick=r;
  const t=document.getElementById("pr-type"); if(t) t.onchange=()=>{ui.prices.type=t.value;r();};
  const s=document.getElementById("pr-sort"); if(s) s.onchange=()=>{ui.prices.sort=s.value;r();};
}

/* ================= CARD DETAIL ================= */
function cardDetail(card_id){
  const x=u.cardById(card_id);
  if(!x) return c.emptyState("⚠","Card not found.","It may be deactivated.","#/prices","Back to prices");
  const v=u.liveVal(x);
  const samePlayer=u.cardsByPlayer(x.player_name).filter(y=>y.card_id!==x.card_id);
  const withCard=EFM_DATA.LISTINGS.filter(l=>l.verification!=="Rejected"&&(l.cardIds||[]).includes(card_id));
  const withPlayer=EFM_DATA.LISTINGS.filter(l=>l.verification!=="Rejected"&&!(l.cardIds||[]).includes(card_id)&&u.listingHasPlayer(l,x.player_name));
  const wantedN=EFM_DATA.WANTED.filter(w=>w.wantNames.some(n=>n.toLowerCase()===x.player_name.toLowerCase())).length;
  const hist=(EFM_DATA.VALUE_HISTORY[card_id]||[v,v,v,v,v,v,v]);
  const mx=Math.max(...hist,1);
  return '<div class="page"><a href="#/prices" class="sr">← Prices</a><div class="two-col" style="margin-top:10px">'
  +'<div class="'+u.rarityClass(x.card_type)+'" style="max-width:340px"><div class="card-art">'+c.cardImgTag(x)+'<span class="rar-tag">'+u.esc(x.card_type)+'</span><span class="ver-tag">'+u.esc(x.card_version)+'</span></div></div>'
  +'<div><h1>'+u.esc(x.player_name)+'</h1><p class="sub">'+u.esc(x.card_type)+' '+u.esc(x.card_version)+' · '+u.esc(x.card_id)+'</p>'
  +'<div class="sr" style="margin-top:8px">Card Value</div><div style="font-family:var(--font-d);font-size:34px;font-weight:700">$'+v+'</div>'
  +'<div class="kv"><span>Demand</span><b>'+u.demandLabel(x.demand)+' · <span class="stars">'+u.demandStars(x.demand)+'</span></b></div>'
  +'<div class="kv"><span>Wanted requests</span><b>'+wantedN+'</b></div>'
  +'<div class="kv"><span>Listings with this card</span><b>'+withCard.length+'</b></div>'
  +'<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" data-act="find">Find accounts</button><button class="btn btn-ghost btn-sm" data-act="track">+ Wanted</button></div></div></div>'
  +(samePlayer.length?'<div class="sec-head"><h2>Other '+u.esc(x.player_name)+' versions</h2></div><div class="hscroll">'+samePlayer.map(y=>c.cardTile(y)).join('')+'</div>':'')
  +'<div class="sec-head"><h2>Accounts with this card ('+withCard.length+')</h2></div>'
  +'<div class="grid-accounts">'+(withCard.length?withCard.map(l=>c.accountCard(l)).join(""):c.emptyState("◌","No accounts with this exact card yet.",withPlayer.length?withPlayer.length+" account(s) have another "+u.esc(x.player_name)+" version.":"Be the first to list it.","#/sell","Sell Account"))+'</div>'
  +(withPlayer.length&&withCard.length?'<div class="sec-head"><h2>Other '+u.esc(x.player_name)+' versions in accounts</h2></div><div class="grid-accounts">'+withPlayer.map(l=>c.accountCard(l)).join('')+'</div>':'')
  +'</div>';
}
function bindCardDetail(card_id){
  const x=u.cardById(card_id);
  const f=document.querySelector('[data-act="find"]');
  if(f) f.onclick=()=>{ui.explore.wantNames=x?[x.player_name]:[];ui.explore.mode="all";location.hash="#/explore";};
  const t=document.querySelector('[data-act="track"]');
  if(t) t.onclick=()=>{if(x&&!ui.wantedForm.selected.includes(x.player_name))ui.wantedForm.selected.push(x.player_name);location.hash="#/wanted";c.toast("Player added to Wanted builder");};
}

/* ================= ACCOUNT DETAIL ================= */
function accountDetail(id){
  const l=EFM_DATA.LISTINGS.find(x=>x.id==id);
  if(!l) return c.emptyState("⚠","Account not found.","It may have been removed.","#/explore","Back to Explore");
  const cards=(l.cardIds||[]).map(x=>u.cardById(x)).filter(Boolean);
  const cv=u.cardValue(l.cardIds);
  const seller=u.sellerById(l.sellerId);
  const saved=E.store.state.saved.includes(l.id);
  const diff=l.price-cv;
  return '<div class="page"><a href="#/explore" class="sr">← Explore</a>'
  +'<div style="margin-top:10px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><h1>ACC-'+l.id+'</h1>'+u.badgeFor(l.verification)+'<span class="badge b-mute">'+u.esc(l.platform)+'</span></div>'
  +'<div style="font-family:var(--font-d);font-size:30px;font-weight:700;margin-top:4px">$'+l.price+'</div></div>'
  +'<div class="sec-head"><h2>Key Cards</h2><span class="count">'+cards.length+' rare cards</span></div>'
  +'<div class="key-grid">'+cards.map(x=>c.cardTile(x)).join('')+'</div>'
  +'<div class="two-col" style="margin-top:14px"><div class="panel"><div class="kv"><span>CARD VALUE TOTAL</span><b style="font-size:20px;font-family:var(--font-d)">$'+cv+'</b></div>'
  +'<div class="kv"><span>ASKING PRICE</span><b style="font-size:20px;font-family:var(--font-d)">$'+l.price+'</b></div>'
  +'<div class="kv"><span>Difference</span><b>'+(diff<=0?'<span class="diff-below">−$'+Math.abs(diff)+' ('+Math.abs(u.diffPct(cv,l.price))+'% BELOW CARD VALUE)</span>':'<span class="diff-above">+$'+diff+' ('+u.diffPct(cv,l.price)+'% above)</span>')+'</b></div>'
  +'<div style="display:flex;gap:8px;margin-top:12px;flex-direction:column"><button class="btn btn-primary btn-block" data-act="buy">Request Purchase · $'+l.price+'</button>'
  +'<button class="btn btn-ghost btn-block" data-act="save">'+(saved?"Saved — tap to unsave":"Save Account")+'</button></div></div>'
  +'<div><div class="panel"><h3>Seller</h3><div class="seller-line"><div class="avatar-lg">'+u.esc(seller.username[0].toUpperCase())+'</div><div><b>'+u.esc(seller.username)+'</b><div class="sr">★ '+seller.rating+' · '+seller.transactions+' completed</div><div style="margin-top:4px">'+u.sellerBadge(seller.badge)+'</div></div></div></div>'
  +'<div class="panel" style="margin-top:12px"><h3>Details</h3>'
  +'<div class="kv"><span>Platform</span><b>'+u.esc(l.platform)+' · seller provided</b></div>'
  +'<div class="kv"><span>Linkage</span><b>'+u.esc(l.linkage)+' · seller provided</b></div>'
  +'<div class="kv"><span>Verified</span><b>'+u.badgeFor(l.verification)+'</b></div>'
  +'<div class="notice danger">🔒 Never share passwords or 2FA codes. Verification uses screenshots only.</div>'
  +'<p class="disclaimer">'+u.esc(l.desc)+'</p>'
  +'<button class="btn btn-ghost btn-sm" data-act="report" style="margin-top:8px">Report listing</button></div></div></div></div>';
}
function bindAccountDetail(id){
  const l=EFM_DATA.LISTINGS.find(x=>x.id==id); if(!l) return;
  const buy=document.querySelector('[data-act="buy"]');
  if(buy) buy.onclick=()=>{
    const cv=u.cardValue(l.cardIds);
    c.modal('<h3>Request Purchase</h3><p class="sub">ACC-'+l.id+' · '+u.esc(u.sellerById(l.sellerId).username)+'</p>'
    +'<div class="kv"><span>Card Value</span><b>$'+cv+'</b></div><div class="kv"><span>You pay</span><b>$'+l.price+'</b></div>'
    +'<div class="notice warn">Prototype only — no real payment. Escrow integrates later. Verification first.</div>'
    +'<div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-ghost" data-m="cancel" style="flex:1">Cancel</button><button class="btn btn-primary" data-m="ok" style="flex:2">Confirm</button></div>');
    document.querySelector('[data-m="cancel"]').onclick=()=>c.closeModal();
    document.querySelector('[data-m="ok"]').onclick=async()=>{
      document.querySelector('[data-m="ok"]').disabled=true;
      const pr=await E.api.requestPurchase(l.id);
      c.closeModal();
      c.modal('<h3>Request created ✓</h3><div class="kv"><span>Reference</span><b>'+pr.id+'</b></div><div class="kv"><span>Status</span><b><span class="badge b-pending">Awaiting Verification</span></b></div><button class="btn btn-primary btn-block" data-m="done" style="margin-top:10px">Done</button>');
      document.querySelector('[data-m="done"]').onclick=()=>{c.closeModal();location.hash="#/profile";};
    };
  };
  const sv=document.querySelector('[data-act="save"]');
  if(sv) sv.onclick=()=>{const on=E.store.toggleSaved(l.id);sv.textContent=on?"Saved — tap to unsave":"Save Account";c.toast(on?"Account saved":"Removed from saved");};
  const rp=document.querySelector('[data-act="report"]');
  if(rp) rp.onclick=()=>{l.reports=(l.reports||0)+1;E.store.notify("Report received","ACC-"+l.id+" reported. Moderators will review.","report");E.store.save();c.toast("Listing reported.");};
}

/* ================= SELL (4 steps) ================= */
const SELL_STEPS=["Account Basics","Rare Cards","Proof","Review"];
function sell(){
  const s=ui.sell;
  const cv=u.cardValue(s.selected);
  let body="";
  if(s.step===1) body='<h3>Account Basics</h3><label class="lbl">Platform</label><div class="opt-grid">'
    +["Android","iOS"].map(p=>'<div class="opt'+(s.platform===p?' on':'')+'" data-p="'+p+'">'+p+'</div>').join('')+'</div>'
    +'<label class="lbl">Linkage status (declared, verified from screenshots)</label><div class="opt-grid">'
    +["No linked account disclosed","Google linked","KONAMI ID linked","Both","Other / unknown"].map(o=>'<div class="opt'+(s.linkage===o?' on':'')+'" data-l="'+o+'" style="font-size:13px">'+o+'</div>').join('')+'</div>';
  if(s.step===2) body='<h3>Rare Cards</h3><p class="sub">Tap the exact card version you own. Values load automatically.</p><div style="margin-top:10px">'+c.cardPicker(s.selected,"sell-ps","sell-grid")+'</div>'
    +'<div class="panel" style="margin-top:12px"><b>Selected Cards</b><div class="a-thumbs" style="margin:8px 0">'
    +(s.selected.length?s.selected.map(id=>{const cc=u.cardById(id);return cc?'<span class="th">'+c.miniThumb(cc)+'<br/>'+u.esc(cc.player_name.split(" ").pop())+'</span>':"";}).join(''):'<span class="sr">None yet</span>')+'</div>'
    +'<div class="kv"><span>Card Value Total</span><b style="font-size:20px;font-family:var(--font-d)">$'+cv+'</b></div><div class="sr">Auto-calculated from the admin card database. You cannot edit it.</div></div>';
  if(s.step===3) body='<h3>Proof</h3><p class="sub">Squad screenshots only. JPG / PNG / WEBP.</p>'
    +'<label class="uploader" style="margin-top:10px">📤 Tap to upload<input id="sell-files" type="file" accept=".jpg,.jpeg,.png,.webp" multiple /></label>'
    +'<div id="sell-prev" class="preview-grid">'+s.images.map(x=>'<img src="'+x+'" loading="lazy"/>').join('')+'</div><div id="ai-check"></div>'
    +'<div class="notice danger">🔒 Never submit passwords, verification codes, or recovery codes.</div>';
  if(s.step===4){
    const tmp={id:"new",cardIds:s.selected,price:s.price,platform:s.platform,verification:"Pending",sellerId:"u_you"};
    body='<h3>Review</h3><div style="margin:10px 0">'+c.accountCard(tmp).replace('ACC-new','New listing').replace('data-go="#/account/new"',"")+'</div>'
    +'<label class="lbl">Your asking price ($)</label><input id="sell-price" class="field" type="number" min="1" value="'+s.price+'" style="font-size:18px"/>'
    +'<div class="kv"><span>Card Value (fixed)</span><b>$'+cv+'</b></div><div class="kv"><span>Difference</span><b id="sell-diff"></b></div><div id="sell-err"></div>';
  }
  return '<div class="page center-col"><h1>Sell Account</h1><p class="sub">Step '+s.step+' of 4 — '+SELL_STEPS[s.step-1]+'</p>'
  +'<div class="progress">'+SELL_STEPS.map((_,i)=>'<i class="'+(i<s.step?'done':'')+'"></i>').join('')+'</div>'
  +'<div class="panel">'+body+'</div>'
  +'<div class="wizard-nav">'+(s.step>1?'<button class="btn btn-ghost" data-w="back">Back</button>':'')
  +(s.step<4?'<button class="btn btn-primary" data-w="next">Continue</button>':'<button class="btn btn-primary" data-w="submit">Submit for moderation</button>')+'</div></div>';
}
function bindSell(){
  const s=ui.sell;
  const refresh=()=>{document.getElementById("app").innerHTML=sell();bindSell();E.bindCards();};
  document.querySelectorAll("[data-p]").forEach(el=>el.onclick=()=>{s.platform=el.dataset.p;document.querySelectorAll("[data-p]").forEach(x=>x.classList.toggle("on",x===el));});
  document.querySelectorAll("[data-l]").forEach(el=>el.onclick=()=>{s.linkage=el.dataset.l;document.querySelectorAll("[data-l]").forEach(x=>x.classList.toggle("on",x===el));});
  const grid=document.getElementById("sell-grid");
  if(grid){
    grid.querySelectorAll("[data-pick]").forEach(row=>row.onclick=()=>{
      const id=row.dataset.pick;const i=s.selected.indexOf(id);
      if(i>=0)s.selected.splice(i,1);else{if(s.selected.length>=8){c.toast("Max 8 rare cards",true);return;}s.selected.push(id);}
      row.classList.toggle("sel");c.toast(s.selected.length+" selected · $"+u.cardValue(s.selected));
    });
    const ps=document.getElementById("sell-ps");
    if(ps) ps.addEventListener("input",()=>{const t=ps.value.toLowerCase();grid.querySelectorAll("[data-pick]").forEach(r=>r.style.display=r.textContent.toLowerCase().includes(t)?"":"none");});
  }
  const fi=document.getElementById("sell-files");
  if(fi) fi.onchange=async()=>{
    for(const f of [...fi.files].slice(0,6)){
      if(!/\.(jpe?g|png|webp)$/i.test(f.name)){c.toast("Invalid format: "+f.name,true);continue;}
      const du=await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(f);});
      s.images.push(du);
    }
    const pv=document.getElementById("sell-prev");if(pv)pv.innerHTML=s.images.map(x=>'<img src="'+x+'"/>').join('');
    const ai=document.getElementById("ai-check");
    if(ai&&s.images.length){ai.innerHTML='<div class="notice info">Pre-check running...</div>';await E.api.analyzeScreenshots();ai.innerHTML='<div class="notice ok">Pre-check done (simulated). Human review still required.</div>';}
  };
  const pin=document.getElementById("sell-price");
  const paint=()=>{const cv=u.cardValue(s.selected);const d=document.getElementById("sell-diff");if(d&&pin){const v=+pin.value||0;const p=u.diffPct(cv,v);d.innerHTML=v<cv?'<span class="diff-below">−$'+(cv-v)+' ('+Math.abs(p)+'% below)</span>':'<span class="diff-above">+$'+(v-cv)+' (+'+p+'% above)</span>';}};
  if(pin){pin.oninput=()=>{s.price=+pin.value;paint();};paint();}
  const back=document.querySelector('[data-w="back"]');if(back)back.onclick=()=>{s.step--;refresh();};
  const next=document.querySelector('[data-w="next"]');if(next)next.onclick=()=>{
    if(s.step===2&&!s.selected.length){c.toast("Select at least 1 card",true);return;}
    if(s.step===3&&!s.images.length){c.toast("Upload at least 1 screenshot",true);return;}
    s.step++;refresh();window.scrollTo({top:0,behavior:"smooth"});
  };
  const sub=document.querySelector('[data-w="submit"]');if(sub)sub.onclick=async()=>{
    const v=+(document.getElementById("sell-price")||{}).value;
    if(!(v>0)){document.getElementById("sell-err").innerHTML='<div class="notice danger">Price must be above $0.</div>';return;}
    s.price=v;sub.disabled=true;sub.textContent="Submitting...";
    await E.api.createListing({platform:s.platform,linkage:s.linkage,cardIds:[...s.selected],price:s.price,screenshots:s.images});
    Object.assign(s,{step:1,selected:["bt_messi_001","bt_ronaldo_001"],images:[],price:40});
    c.toast("Submitted — Pending Verification");location.hash="#/profile";
  };
}

/* ================= WANTED ================= */
function wanted(){
  const f=ui.wantedForm;
  const players=[...new Set(u.allCards().map(x=>x.player_name))].sort();
  const mine=EFM_DATA.WANTED.filter(w=>E.store.state.myWanted.includes(w.id));
  const others=EFM_DATA.WANTED.filter(w=>!E.store.state.myWanted.includes(w.id));
  return '<div class="page center-col"><h1>Wanted</h1><p class="sub">What players are you looking for?</p>'
  +'<div class="panel" style="margin-top:12px"><input id="w-ps" class="field" type="search" placeholder="Search player..."/>'
  +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">'
  +players.map(n=>{const th=u.thumbForPlayer(n);return '<button class="chip'+(f.selected.includes(n)?' on':'')+'" data-wp="'+u.esc(n)+'">'+(th?c.miniThumb(th):"")+u.esc(n)+'</button>';}).join('')+'</div>'
  +'<div class="row2"><div><label class="lbl">Min $</label><input id="w-min" class="field" type="number" value="'+f.budgetMin+'"/></div>'
  +'<div><label class="lbl">Max $</label><input id="w-max" class="field" type="number" value="'+f.budgetMax+'"/></div></div>'
  +'<div class="row2"><div><label class="lbl">Platform</label><select id="w-plat" class="field"><option '+(f.platform==="Android"?"selected":"")+'>Android</option><option '+(f.platform==="iOS"?"selected":"")+'>iOS</option><option '+(f.platform==="Any"?"selected":"")+'>Any</option></select></div>'
  +'<div><label class="lbl">Min rare cards</label><select id="w-minr" class="field"><option>2</option><option '+(f.minRares===3?"selected":"")+'>3</option><option '+(f.minRares===4?"selected":"")+'>4</option></select></div></div>'
  +'<button class="btn btn-primary btn-block" data-act="w-create" style="margin-top:14px">Create Wanted Request</button></div>'
  +'<div class="sec-head"><h2>My requests</h2></div><div class="grid-accounts">'
  +(mine.length?mine.map(w=>c.wantedCard(w,matchCountFor(w))).join(""):c.emptyState("♡","No wanted requests yet.","Describe the squad you want.","#/explore","Explore"))
  +'</div><div class="sec-head"><h2>Community</h2></div><div class="grid-accounts">'+others.map(w=>c.wantedCard(w,matchCountFor(w))).join('')+'</div></div>';
}
function bindWanted(){
  const f=ui.wantedForm;
  const ps=document.getElementById("w-ps");
  if(ps) ps.addEventListener("input",()=>{const t=ps.value.toLowerCase();document.querySelectorAll("[data-wp]").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(t)?"":"none");});
  document.querySelectorAll("[data-wp]").forEach(b=>b.onclick=()=>{
    const n=b.dataset.wp;const i=f.selected.indexOf(n);
    if(i>=0)f.selected.splice(i,1);else{if(f.selected.length>=5){c.toast("Max 5 players",true);return;}f.selected.push(n);}
    b.classList.toggle("on");
  });
  const cr=document.querySelector('[data-act="w-create"]');
  if(cr) cr.onclick=async()=>{
    if(!f.selected.length){c.toast("Select at least 1 player",true);return;}
    f.budgetMin=+document.getElementById("w-min").value||0;f.budgetMax=+document.getElementById("w-max").value||0;
    f.platform=document.getElementById("w-plat").value;f.minRares=+document.getElementById("w-minr").value;
    if(f.budgetMax<f.budgetMin){c.toast("Max must be ≥ min",true);return;}
    cr.disabled=true;
    const rec=await E.api.createWanted({wantNames:[...f.selected],budgetMin:f.budgetMin,budgetMax:f.budgetMax,platform:f.platform,minRares:f.minRares});
    c.toast("Wanted #"+rec.id+" published");location.hash="#/wanted-match/"+rec.id;
  };
}
function wantedMatch(id){
  const w=EFM_DATA.WANTED.find(x=>x.id==id);
  if(!w) return c.emptyState("⚠","Request not found.","","#/wanted","Back");
  const req={wantNames:w.wantNames,budgetMin:w.budgetMin,budgetMax:w.budgetMax,platform:w.platform==="Any"?null:w.platform,minRares:w.minRares,mode:"all"};
  const scored=activeListings().map(l=>({l,s:u.matchScore(l,req)})).sort((a,b)=>b.s.pct-a.s.pct);
  const top=scored[0];
  return '<div class="page center-col"><a href="#/wanted" class="sr">← Wanted</a>'
  +'<div style="display:flex;gap:12px;align-items:center;margin:10px 0"><div class="match-ring" style="--p:'+(top?top.s.pct:0)+'%"><b>'+(top?top.s.pct:0)+'%</b></div>'
  +'<div><h1 style="font-size:22px">Wanted #'+w.id+'</h1><p class="sub">'+u.esc(w.wantNames.join(" + "))+' · $'+w.budgetMin+'–$'+w.budgetMax+'</p></div></div>'
  +'<div class="panel">'+(top?top.s.rows.map(r=>'<div class="kv"><span>'+u.esc(r.k)+'</span><b class="'+(r.ok?'tick':'cross')+'">'+u.esc(r.t)+'</b></div>').join(''):'')+'</div>'
  +'<div class="sec-head"><h2>Matches</h2></div><div class="grid-accounts">'
  +(scored.length?scored.map(({l,s})=>'<div style="position:relative"><div class="chip'+(s.pct>=70?' on':'')+'" style="position:absolute;top:52px;right:10px;z-index:2;cursor:default">'+s.pct+'% MATCH</div>'+c.accountCard(l)+'</div>').join(""):c.emptyState("◌","No matching accounts found.","#/sell","Sell Account"))
  +'</div></div>';
}

/* ================= NOTIFICATIONS / PROFILE ================= */
function notifications(){
  const ns=E.store.state.notifs;
  return '<div class="page center-col"><h1>Notifications</h1><p class="sub">'+ns.filter(n=>!n.read).length+' unread</p>'
  +'<div style="display:grid;gap:10px;margin-top:12px">'
  +(ns.length?ns.map(n=>'<div class="panel" style="'+(n.read?'opacity:.65':'')+'"><b>'+u.esc(n.title)+'</b><p class="sub">'+u.esc(n.body)+'</p><span class="sr">'+u.esc(n.time)+'</span></div>').join(""):c.emptyState("🔔","You're all caught up.","","#/explore","Explore"))
  +'</div></div>';
}
function bindNotifications(){ E.store.state.notifs.forEach(n=>n.read=true); E.store.save(); }
function profile(){
  const t=ui.profileTab, me=u.sellerById("u_you");
  const myL=EFM_DATA.LISTINGS.filter(l=>E.store.state.myListings.includes(l.id));
  const myW=EFM_DATA.WANTED.filter(w=>E.store.state.myWanted.includes(w.id));
  const saved=EFM_DATA.LISTINGS.filter(l=>E.store.state.saved.includes(l.id));
  const purch=E.store.state.purchases;
  let body="";
  if(t==="listings") body='<div class="grid-accounts">'+(myL.length?myL.map(l=>c.accountCard(l)).join(""):c.emptyState("📋","No listings yet.","","#/sell","Sell Account"))+'</div>';
  if(t==="wanted") body='<div class="grid-accounts">'+(myW.length?myW.map(w=>c.wantedCard(w,matchCountFor(w))).join(""):c.emptyState("♡","No wanted requests.","","#/wanted","Create"))+'</div>';
  if(t==="saved") body='<div class="grid-accounts">'+(saved.length?saved.map(l=>c.accountCard(l)).join(""):c.emptyState("♡","Nothing saved.","","#/explore","Explore"))+'</div>';
  if(t==="tx") body=purch.length?purch.map(p=>'<div class="panel"><div style="display:flex;justify-content:space-between"><b>'+p.id+'</b><span class="badge b-pending">'+u.esc(p.status)+'</span></div><div class="kv"><span>Listing</span><b>ACC-'+p.listingId+'</b></div><div class="kv"><span>Amount</span><b>$'+p.amount+'</b></div></div>').join(""):c.emptyState("💳","No transactions.","","#/explore","Explore");
  if(t==="settings") body='<div class="panel"><label class="lbl">Display name</label><input id="set-name" class="field" value="'+u.esc(E.store.state.user.username)+'"/><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-primary" data-act="save-set">Save</button><button class="btn btn-danger btn-sm" data-act="reset">Reset demo</button></div><div class="notice info">Auth + escrow connect here in production.</div></div>';
  return '<div class="page center-col"><div class="panel"><div class="seller-line"><div class="avatar-lg">'+u.esc(E.store.state.user.username[0].toUpperCase())+'</div>'
  +'<div style="flex:1"><b style="font-size:18px">'+u.esc(E.store.state.user.username)+'</b><div class="sr">★ '+me.rating+' · '+me.transactions+' transactions</div><div style="margin-top:4px">'+u.sellerBadge(me.badge)+'</div></div>'
  +'<a class="btn btn-ghost btn-sm" href="#/admin">Admin</a></div></div>'
  +'<div class="tabs">'+[["listings","Listings"],["wanted","Wanted"],["saved","Saved"],["tx","Transactions"],["settings","Settings"]].map(([k,l])=>'<button data-tab="'+k+'" class="'+(t===k?'on':'')+'">'+l+'</button>').join('')+'</div>'+body+'</div>';
}
function bindProfile(){
  document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{ui.profileTab=b.dataset.tab;rerender();});
  const sv=document.querySelector('[data-act="save-set"]');
  if(sv) sv.onclick=()=>{E.store.state.user.username=document.getElementById("set-name").value||"Guest_Fan";E.store.save();c.toast("Saved");rerender();};
  const rs=document.querySelector('[data-act="reset"]'); if(rs) rs.onclick=()=>E.store.reset();
  function rerender(){document.getElementById("app").innerHTML=profile();bindProfile();E.bindCards();}
}

/* ================= SEARCH ================= */
function searchPage(q){
  const r=E.api.searchAll(q);
  return '<div class="page"><h1>"'+u.esc(q)+'"</h1>'
  +'<div class="sec-head"><h2>Cards ('+r.cards.length+')</h2></div>'+(r.cards.length?'<div class="hscroll">'+r.cards.map(x=>c.cardTile(x)).join('')+'</div>':'<p class="sub">No cards.</p>')
  +'<div class="sec-head"><h2>Accounts ('+r.listings.length+')</h2></div><div class="grid-accounts">'+(r.listings.length?r.listings.map(l=>c.accountCard(l)).join(""):c.emptyState("◌","No matching accounts found.","","#/explore","Explore"))+'</div></div>';
}

/* ================= HOW ================= */
function how(){
  return '<div class="page center-col"><h1>How it works</h1><p class="sub">Discover. Compare. Verify.</p>'
  +'<div class="how-steps" style="margin-top:14px">'
  +'<div class="how-card"><div class="n">1</div><b>Real cards</b><p class="sub">Admin imports card images. Each card keeps its own Card ID — Messi Epic #001 and Big Time #001 stay separate.</p></div>'
  +'<div class="how-card"><div class="n">2</div><b>Card Value</b><p class="sub">Admin sets each value. Sellers can never edit it. Buyers always see index vs asking.</p></div>'
  +'<div class="how-card"><div class="n">3</div><b>Verify</b><p class="sub">Screenshots + human moderation. Credentials are never requested.</p></div></div>'
  +'<div class="panel" style="margin-top:14px"><h3>Card record</h3><p class="sub">card_id · player_name · card_type · card_version · image_path · current_value · currency · status — images served as-is from /assets/cards/&lt;Type&gt;/</p>'
  +'<h3 style="margin-top:10px">Backend-ready</h3><p class="sub">One-file swap in js/api.js → REST/Supabase. Tables: users, cards, listings, wanted, screenshots, verification cases, moderation actions, notifications, purchases.</p></div>'
  +'<div class="notice warn">Independent community marketplace. Not affiliated with KONAMI. Transfers may be restricted by the game\'s Terms of Use.</div></div>';
}

/* ================= ADMIN ================= */
function adminTabs(){
  const pend=EFM_DATA.LISTINGS.filter(l=>l.verification==="Pending"||l.verification==="Needs Evidence").length;
  return [["cards","Card Database"],["status","Image Status"],["import","Import ZIP"],["pending","Pending ("+pend+")"],["reported","Reported"],["users","Users"],["tx","Transactions"],["log","Audit Log"]];
}
function admin(){
  const t=ui.adminTab;
  return '<div class="page"><h1>Admin</h1><p class="sub">Internal tools. Only admins modify Card Value.</p>'
  +'<div class="admin-grid" style="margin-top:12px"><div class="admin-side">'
  +adminTabs().map(([k,l])=>'<button data-atab="'+k+'" class="'+(t===k?'on':'')+'">'+l+'</button>').join('')
  +'</div><div id="admin-main" style="display:grid;gap:10px;min-width:0">'+adminMain()+'</div></div></div>';
}
function adminMain(){
  const t=ui.adminTab;
  if(t==="cards") return adminCards();
  if(t==="status") return adminStatus();
  if(t==="import") return adminImport();
  if(t==="pending") return adminQueue(false);
  if(t==="reported") return adminQueue(true);
  if(t==="users") return '<div class="table-wrap"><table class="tbl"><tr><th>Seller</th><th>Rating</th><th>Tx</th><th>Badge</th></tr>'+EFM_DATA.SELLERS.map(s=>'<tr><td><b>'+u.esc(s.username)+'</b></td><td>★ '+s.rating+'</td><td>'+s.transactions+'</td><td>'+u.sellerBadge(s.badge)+'</td></tr>').join('')+'</table></div>';
  if(t==="tx") return E.store.state.purchases.length?E.store.state.purchases.map(p=>'<div class="panel"><b>'+p.id+'</b> <span class="badge b-pending">'+u.esc(p.status)+'</span><div class="kv"><span>Listing</span><b>ACC-'+p.listingId+'</b></div><div class="kv"><span>Amount</span><b>$'+p.amount+'</b></div></div>').join(""):'<div class="panel"><p class="sub">No purchase requests yet.</p></div>';
  if(t==="log") return '<div class="panel">'+E.store.state.modActions.map(m=>'<div class="kv"><span>'+u.esc(m.ts)+' · '+u.esc(m.mod)+'</span><b>'+u.esc(m.action)+'</b></div>').join('')+'</div>'
    +'<div class="panel"><h3>Price history</h3>'+(E.store.state.priceHistoryLog.slice(0,20).map(h=>{const cc=u.cardById(h.card);return '<div class="kv"><span>'+u.esc(h.ts)+' · '+u.esc(h.admin)+'</span><b>'+u.esc(cc?cc.player_name:h.card)+': $'+h.prev+' → $'+h.next+'</b></div>';}).join('')||'<p class="sub">No changes yet.</p>')+'</div>';
  return "";
}
function isSeedInactive(id){ return E.store.state.deactivatedSeed&&E.store.state.deactivatedSeed[id]; }
function displayName(cc){ const r=E.store.state.renamedSeed||{}; return r[cc.card_id]||cc.player_name; }
function adminCards(){
  const q=(ui.adminQ||"").toLowerCase(), ty=ui.adminType;
  const seen={}; u.allCards(true).forEach(x=>{seen[x.file_name]=seen[x.file_name]||[];seen[x.file_name].push(x.card_id);});
  let list=u.allCards(true).map(x=>({...x,player_name:displayName(x),inactive:isSeedInactive(x.card_id)&&!E.store.state.cardsRuntime.find(r=>r.card_id===x.card_id)?true:(x.status!=="active")}));
  if(q) list=list.filter(x=>(x.player_name+" "+x.card_id+" "+x.card_type).toLowerCase().includes(q));
  if(ty!=="All") list=list.filter(x=>x.card_type===ty);
  const errs=E.store.state.imageErrors||{};
  return '<div class="panel"><div class="row2"><div><input id="ad-q" class="field" type="search" placeholder="Search cards..." value="'+u.esc(ui.adminQ)+'"/></div>'
  +'<div><select id="ad-type" class="field"><option>All</option>'+["Epic","Big Time","Show Time"].map(t=>'<option '+(ty===t?"selected":"")+'>'+t+'</option>').join('')+'</select></div></div>'
  +'<div class="sr" style="margin-top:6px">'+list.length+' cards · values editable by admin only</div></div>'
  +'<div class="table-wrap"><table class="tbl"><tr><th></th><th>Card</th><th>Value $</th><th>Status</th><th></th></tr>'
  +list.map(x=>{
    const dup=(seen[x.file_name]||[]).length>1;
    const broken=errs[x.card_id]!=null;
    return '<tr'+(broken?' style="background:rgba(248,113,113,.06)"':'')+'><td><img class="cell" src="'+u.imgSrc(x.image_path)+'" loading="lazy" onerror="this.style.opacity=.2"/></td>'
    +'<td><b>'+u.esc(x.player_name)+'</b><br/><span class="sr">'+u.esc(x.card_id)+' · '+u.esc(x.card_type)+' '+u.esc(x.card_version)+'</span><br/>'
    +(dup?'<span class="badge b-warn">duplicate</span> ':'')+(broken?'<span class="badge b-bad">broken image</span> ':'')+(x.inactive?'<span class="badge b-mute">inactive</span>':'<span class="badge b-verified">active</span>')+'</td>'
    +'<td><input class="num" data-vin="'+x.card_id+'" type="number" value="'+u.liveVal({...x,player_name:x.player_name})+'"/></td>'
    +'<td><button class="btn btn-ghost btn-sm" data-toggle="'+x.card_id+'">'+(x.inactive?"Activate":"Deactivate")+'</button></td>'
    +'<td style="white-space:nowrap"><button class="btn btn-primary btn-sm" data-val="'+x.card_id+'">Save</button> <button class="btn btn-ghost btn-sm" data-rename="'+x.card_id+'">Rename</button></td></tr>';
  }).join('')+'</table></div>';
}
function adminStatus(){
  const all=u.allCards(true);
  const errs=E.store.state.imageErrors||{};
  const seen={}; all.forEach(x=>{seen[x.file_name]=(seen[x.file_name]||0)+1;});
  const dups=Object.keys(seen).filter(k=>seen[k]>1).length;
  const failedIds=Object.keys(errs);
  const d=ui.diag;
  return '<div class="panel"><h3>Card Image Status</h3><p class="sub">Probes every image_path. Failures never render fake art.</p>'
  +'<button class="btn btn-primary btn-sm" data-act="run-diag" style="margin-top:8px">Run check</button>'
  +(d?'<div class="diag"><div><b>'+d.total+'</b><span>Total cards</span></div><div><b style="color:var(--green)">'+d.loaded+'</b><span>Images loaded</span></div><div><b style="color:var(--red)">'+d.failed+'</b><span>Images failed</span></div><div><b>'+d.missing+'</b><span>Missing</span></div><div><b>'+dups+'</b><span>Duplicates</span></div></div>'
    +(d.failedList.length?'<div class="table-wrap"><table class="tbl"><tr><th>Card ID</th><th>Player</th><th>Type</th><th>Path</th><th>Error</th></tr>'+d.failedList.map(f=>'<tr><td><b>'+u.esc(f.card_id)+'</b></td><td>'+u.esc(f.player)+'</td><td>'+u.esc(f.type)+'</td><td class="sr">'+u.esc(f.path)+'</td><td><span class="badge b-bad">'+u.esc(f.err)+'</span></td></tr>').join('')+'</table></div>':'<div class="notice ok">All images loaded ✓</div>')
    :'<div class="diag"><div><b>'+all.length+'</b><span>Total cards</span></div><div><b>'+dups+'</b><span>Duplicates</span></div><div><b>'+failedIds.length+'</b><span>Logged failures</span></div></div>')
  +(failedIds.length&&!d?'<div class="table-wrap"><table class="tbl"><tr><th>Card ID</th><th>Error</th><th>Path</th></tr>'+failedIds.map(id=>{const cc=u.cardById(id);return '<tr><td><b>'+u.esc(id)+'</b></td><td><span class="badge b-bad">'+u.esc(errs[id].err)+'</span></td><td class="sr">'+u.esc(cc?cc.image_path:errs[id].src)+'</td></tr>';}).join('')+'</table></div>':'')
  +'</div>';
}
function adminImport(){
  const r=ui.importRes;
  const staging=E.store.state.staging||[];
  return '<div class="panel"><h3>Import card ZIP</h3><p class="sub">JPG / JPEG / PNG / WEBP. Originals preserved. Duplicates skipped.</p>'
  +'<div class="row2"><div><label class="lbl">Card type (if undetectable)</label><select id="imp-type" class="field"><option>Big Time</option><option>Epic</option><option>Show Time</option></select></div>'
  +'<div><label class="lbl">Mode</label><select id="imp-mode" class="field"><option value="review">Review before publish</option><option value="publish">Publish immediately</option></select></div></div>'
  +'<label class="lbl">Default value for new cards ($)</label><input id="imp-val" class="field" type="number" value="8" style="max-width:140px"/>'
  +'<label class="uploader" style="margin-top:12px">📦 Tap to choose ZIP<input id="imp-file" type="file" accept=".zip"/></label>'
  +'<div id="imp-prog"></div>'
  +(r?'<div class="notice ok"><b>Import Complete</b><div class="kv"><span>Epic / Big Time / Show Time</span><b>'+(r.perType.Epic||0)+' / '+(r.perType["Big Time"]||0)+' / '+(r.perType["Show Time"]||0)+'</b></div><div class="kv"><span>Successful</span><b>'+r.successful+'</b></div><div class="kv"><span>Failed</span><b>'+r.failed+'</b></div><div class="kv"><span>Duplicates</span><b>'+r.duplicates+'</b></div></div>'
    +'<div style="display:flex;gap:8px"><button class="btn btn-primary btn-sm" data-act="to-staging">Review Cards</button><button class="btn btn-ghost btn-sm" data-act="to-cards">Publish Cards</button></div>':'')
  +'</div>'
  +(staging.length?'<div class="panel"><h3>Staged for review ('+staging.length+')</h3><div class="hscroll">'+staging.map(x=>c.cardTile(x)).join('')+'</div>'
    +'<div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-primary btn-sm" data-act="publish">Publish Cards</button><button class="btn btn-danger btn-sm" data-act="discard">Discard</button></div></div>':'');
}
function adminQueue(reported){
  const list=EFM_DATA.LISTINGS.filter(l=>reported?(l.reports||0)>0:(l.verification==="Pending"||l.verification==="Needs Evidence"));
  if(!list.length) return c.emptyState("✓",reported?"No reported listings.":"All caught up.","","#/explore","Marketplace");
  return list.map(l=>{
    const cards=(l.cardIds||[]).map(id=>u.cardById(id)).filter(Boolean);
    return '<div class="panel"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>ACC-'+l.id+'</b>'+u.badgeFor(l.verification)+'<span class="sr">'+u.esc(l.platform)+' · '+u.esc(l.linkage)+' · $'+l.price+'</span></div>'
    +'<div class="a-thumbs" style="margin:8px 0">'+cards.map(x=>'<span class="th">'+c.miniThumb(x)+'<br/>'+u.esc(x.player_name.split(" ").pop())+'</span>').join('')+'</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" data-mod="Verified" data-id="'+l.id+'">Approve</button><button class="btn btn-ghost btn-sm" data-mod="Needs Evidence" data-id="'+l.id+'">Request evidence</button><button class="btn btn-danger btn-sm" data-mod="Rejected" data-id="'+l.id+'">Reject</button><a class="btn btn-ghost btn-sm" href="#/account/'+l.id+'">Open</a></div></div>';
  }).join('');
}
function bindAdmin(){
  const rer=()=>{document.getElementById("app").innerHTML=admin();bindAdmin();bindCards();};
  document.querySelectorAll("[data-atab]").forEach(b=>b.onclick=()=>{ui.adminTab=b.dataset.atab;ui.diag=null;rer();});
  const q=document.getElementById("ad-q"); if(q) q.addEventListener("input",u.debounce(()=>{ui.adminQ=q.value;rer();const nq=document.getElementById("ad-q");if(nq){nq.focus();nq.setSelectionRange(nq.value.length,nq.value.length);}},400));
  const ty=document.getElementById("ad-type"); if(ty) ty.onchange=()=>{ui.adminType=ty.value;rer();};
  document.querySelectorAll("[data-val]").forEach(b=>b.onclick=async()=>{
    const id=b.dataset.val,inp=document.querySelector('[data-vin="'+id+'"]'),v=+inp.value;
    if(!(v>0&&v<500)){c.toast("Value must be $1–$500",true);return;}
    await E.api.updateCardValue(id,v,"admin_you");c.toast("Saved + logged");rer();
  });
  document.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=async()=>{
    const id=b.dataset.toggle;
    const rt=E.store.state.cardsRuntime.find(x=>x.card_id===id);
    const cur=rt?rt.status:(isSeedInactive(id)?"inactive":"active");
    await E.api.setCardStatus(id,cur==="active"?"inactive":"active");c.toast("Status updated");rer();
  });
  document.querySelectorAll("[data-rename]").forEach(b=>b.onclick=async()=>{
    const id=b.dataset.rename,cc=u.cardById(id);
    const name=prompt("Player name for "+id+":",cc?cc.player_name:"");
    if(name&&name.trim()){await E.api.renameCard(id,name.trim());c.toast("Renamed");rer();}
  });
  document.querySelectorAll("[data-mod]").forEach(b=>b.onclick=async()=>{
    const id=+b.dataset.id,action=b.dataset.mod;
    b.disabled=true;
    await E.api.moderateListing(id,action,action==="Verified"?"Screenshots consistent":"See note","mod_you");
    c.toast("ACC-"+id+" → "+action);rer();
  });
  const diag=document.querySelector('[data-act="run-diag"]');
  if(diag) diag.onclick=()=>{
    const all=u.allCards(true);
    let loaded=0;const failedList=[];let pending=all.length;
    diag.disabled=true;diag.textContent="Checking...";
    if(!pending){ui.diag={total:0,loaded:0,failed:0,missing:0,failedList};rer();return;}
    all.forEach(x=>{
      if(!x.image_path){failedList.push({card_id:x.card_id,player:x.player_name,type:x.card_type,path:"—",err:"missing image"});check();return;}
      const im=new Image();
      im.onload=()=>{loaded++;check();};
      im.onerror=()=>{failedList.push({card_id:x.card_id,player:x.player_name,type:x.card_type,path:x.image_path,err:"failed to load"});u.imgFail(x.card_id,x.image_path);check();};
      im.src=x.image_path;
    });
    function check(){
      pending--;
      diag.textContent="Checking... "+(all.length-pending)+"/"+all.length;
      if(pending===0){ui.diag={total:all.length,loaded,failed:failedList.length,missing:failedList.filter(f=>f.err==="missing image").length,failedList};rer();}
    }
  };
  const fi=document.getElementById("imp-file");
  if(fi) fi.onchange=async()=>{
    const f=fi.files[0];if(!f)return;
    const prog=document.getElementById("imp-prog");
    prog.innerHTML='<div class="sr">Importing cards...</div><div class="progressbar"><i style="width:0%"></i></div>';
    const bar=prog.querySelector("i");
    try{
      const res=await E.api.importZip(f,{
        cardType:document.getElementById("imp-type").value,
        publish:document.getElementById("imp-mode").value==="publish",
        defaultValue:+document.getElementById("imp-val").value||8
      },(p)=>{bar.style.width=p+"%";});
      ui.importRes=res;ui.adminTab="import";rer();c.toast("Import complete: "+res.successful+" ok, "+res.duplicates+" dupes");
    }catch(e){prog.innerHTML='<div class="notice danger">'+u.esc(e.message)+'</div>';}
  };
  const pub=document.querySelector('[data-act="publish"]');
  if(pub) pub.onclick=()=>{const n=E.api.publishStaging();c.toast(n+" cards published");rer();};
  const dis=document.querySelector('[data-act="discard"]');
  if(dis) dis.onclick=()=>{E.api.discardStaging();c.toast("Staging discarded");rer();};
  const ts=document.querySelector('[data-act="to-staging"]'); if(ts) ts.onclick=()=>{ui.adminTab="import";rer();};
  const tc=document.querySelector('[data-act="to-cards"]'); if(tc) tc.onclick=()=>{ui.adminTab="cards";rer();};
}

E.pages={home,bindHome,explore,bindExplore,prices,bindPrices,cardDetail,bindCardDetail,
  accountDetail,bindAccountDetail,sell,bindSell,wanted,bindWanted,wantedMatch,
  notifications,bindNotifications,profile,bindProfile,admin,bindAdmin,searchPage,how,
  // legacy alias: #/player/<name> -> first real card of that player
  playerDetail(name){ const list=u.cardsByPlayer(decodeURIComponent(name||"")); return list.length?cardDetail(list[0].card_id):c.emptyState("◌","No cards imported for this player.","#/admin","Import Card ZIP"); },
  bindPlayerDetail(name){ const list=u.cardsByPlayer(decodeURIComponent(name||"")); if(list.length) bindCardDetail(list[0].card_id); }
};
})(window.EFM);
