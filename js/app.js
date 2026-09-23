/* app.js — hash router + global wiring */
(function(){
  const E=window.EFM, u=E.util;
  const app=document.getElementById("app");

  function setNav(route){
    const key=route===""||route==="/"?"home":route;
    document.querySelectorAll("[data-nav]").forEach(a=>{
      const n=a.dataset.nav;
      const on=(key===""&&n==="home")||key===n||(key==="account"&&n==="explore")||(key==="card"&&n==="prices")||(key==="player"&&n==="prices");
      a.classList.toggle("active",!!on);
    });
  }
  function parseHash(){
    const h=location.hash||"#/";
    const pathQ=h.slice(1);
    const qi=pathQ.indexOf("?");
    const path=qi>=0?pathQ.slice(0,qi):pathQ;
    const params={};
    if(qi>=0) pathQ.slice(qi+1).split("&").forEach(kv=>{const i=kv.indexOf("=");const k=kv.slice(0,i);params[decodeURIComponent(k)]=decodeURIComponent(kv.slice(i+1)||"");});
    return {path,params};
  }
  function render(){
    const {path,params}=parseHash();
    const seg=path.split("/").filter(Boolean);
    window.scrollTo({top:0});
    E.store.updateDots();
    const P=E.pages;
    if(seg.length===0){ app.innerHTML=P.home(); P.bindHome(); setNav("home"); }
    else if(seg[0]==="explore"){ app.innerHTML=P.explore(params); P.bindExplore(); setNav("explore"); }
    else if(seg[0]==="prices"){ app.innerHTML=P.prices(params); P.bindPrices(); setNav("prices"); }
    else if(seg[0]==="card"){ const id=decodeURIComponent(seg.slice(1).join("/")||""); app.innerHTML=P.cardDetail(id); P.bindCardDetail(id); setNav("card"); }
    else if(seg[0]==="player"){ const nm=decodeURIComponent(seg.slice(1).join("/")||""); app.innerHTML=P.playerDetail(nm); P.bindPlayerDetail(nm); setNav("player"); }
    else if(seg[0]==="account"){ app.innerHTML=P.accountDetail(+seg[1]); P.bindAccountDetail(+seg[1]); setNav("explore"); }
    else if(seg[0]==="sell"){ app.innerHTML=P.sell(); P.bindSell(); setNav("sell"); }
    else if(seg[0]==="wanted"){ app.innerHTML=P.wanted(); P.bindWanted(); setNav("wanted"); }
    else if(seg[0]==="wanted-match"){ app.innerHTML=P.wantedMatch(+seg[1]); setNav("wanted"); }
    else if(seg[0]==="notifications"){ app.innerHTML=P.notifications(); P.bindNotifications(); setNav(""); }
    else if(seg[0]==="profile"){ app.innerHTML=P.profile(); P.bindProfile(); setNav("profile"); }
    else if(seg[0]==="admin"){ app.innerHTML=P.admin(); P.bindAdmin(); setNav(""); }
    else if(seg[0]==="how"){ app.innerHTML=P.how(); setNav("how"); }
    else if(seg[0]==="search"){ app.innerHTML=P.searchPage(params.q||""); setNav(""); }
    else { app.innerHTML=E.c.emptyState("⚠","Page not found.","","#/","Go home"); }
    bindCards();
  }
  function bindCards(){
    app.querySelectorAll("[data-go]").forEach(el=>{
      if(el.dataset.bound) return; el.dataset.bound="1";
      el.addEventListener("click",()=>{ location.hash=el.dataset.go; });
      el.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();location.hash=el.dataset.go;} });
    });
  }
  E.bindCards = bindCards;

  // ---- global search ----
  const btn=document.getElementById("global-search-btn"), bar=document.getElementById("global-search-bar"),
        inp=document.getElementById("global-search-input"), res=document.getElementById("global-search-results");
  if(btn) btn.onclick=()=>{ bar.classList.toggle("hidden"); if(!bar.classList.contains("hidden")) inp.focus(); };
  if(inp) inp.addEventListener("input", u.debounce(()=>{
    const q=inp.value.trim(); if(!q){res.innerHTML="";return;}
    const r=E.api.searchAll(q);
    let h="";
    if(r.cards.length){h+='<div class="gsr-cat">CARDS</div>'+r.cards.map(x=>'<div class="gsr-item" data-sgo="#/card/'+encodeURIComponent(x.card_id)+'"><img src="'+u.imgSrc(x.image_path)+'" loading="lazy" onerror="this.style.display=\'none\'"/><b>'+u.esc(x.player_name)+'</b><span class="sr">'+u.esc(x.card_type)+' '+u.esc(x.card_version)+' · $'+u.liveVal(x)+'</span></div>').join('');}
    if(r.listings.length){h+='<div class="gsr-cat">ACCOUNTS</div>'+r.listings.map(l=>'<div class="gsr-item" data-sgo="#/account/'+l.id+'"><b>ACC-'+l.id+'</b><span class="sr">$'+l.price+' · '+u.esc(l.platform)+'</span></div>').join('');}
    if(r.sellers.length){h+='<div class="gsr-cat">SELLERS</div>'+r.sellers.map(s=>'<div class="gsr-item"><b>'+u.esc(s.username)+'</b><span class="sr">★ '+s.rating+'</span></div>').join('');}
    h+='<div class="gsr-item" data-sgo="#/search?q='+encodeURIComponent(q)+'"><span style="color:var(--acc);font-weight:800">See all results →</span></div>';
    res.innerHTML=h||'<div class="gsr-item">No matches</div>';
    res.querySelectorAll("[data-sgo]").forEach(el=>el.onclick=()=>{location.hash=el.dataset.sgo;res.innerHTML="";bar.classList.add("hidden");inp.value="";});
  },200));
  if(inp) inp.addEventListener("keydown",e=>{ if(e.key==="Enter"&&inp.value.trim()){location.hash="#/search?q="+encodeURIComponent(inp.value.trim());res.innerHTML="";bar.classList.add("hidden");} });

  window.addEventListener("hashchange",render);
  document.getElementById("avatar-mini").textContent=(E.store.state.user.username||"G")[0].toUpperCase();
  document.getElementById("avatar-mini-m").textContent=(E.store.state.user.username||"G")[0].toUpperCase();
  render();
})();
