/* utils: card-centric helpers, matching, formatting. Backend-agnostic. */
window.EFM = window.EFM || {};
(function(E){
  const $ = (s,r)=> (r||document).querySelector(s);
  const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
  const esc = (s)=> String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money = (n)=> "$"+Number(n||0);

  // ---- card registry: seed manifest + admin runtime imports ----
  function runtimeCards(){ return (E.store && E.store.state.cardsRuntime) || []; }
  function allCards(includeInactive){
    const seed = (window.EFM_CARDS ? EFM_CARDS.SEED : []).map(c=>({...c}));
    const rt = runtimeCards().map(c=>({...c}));
    const all = seed.concat(rt);
    return includeInactive ? all : all.filter(c=>c.status==="active");
  }
  function cardById(id){
    return allCards(true).find(c=>c.card_id===id) || null;
  }
  function cardsByPlayer(name){
    const n=(name||"").toLowerCase();
    return allCards().filter(c=>c.player_name.toLowerCase()===n)
      .sort((a,b)=> (a.card_version||"").localeCompare(b.card_version||""));
  }
  function thumbForPlayer(name){
    const list = cardsByPlayer(name);
    return list.length ? list[0] : null;
  }
  function liveVal(card){
    if(!card) return 0;
    const o = E.store && E.store.state.priceOverrides;
    if(o && o[card.card_id]!=null) return o[card.card_id];
    return card.current_value;
  }
  function cardValue(cardIds){
    return (cardIds||[]).reduce((a,id)=>{ const c=cardById(id); return a+(c?liveVal(c):0); },0);
  }
  function sellerById(id){ return (EFM_DATA.SELLERS.find(s=>s.id===id)||EFM_DATA.SELLERS[5]); }
  function diffPct(cv,price){ if(!cv) return 0; return Math.round(((price-cv)/cv)*100); }
  function demandLabel(d){ return d>=5?"Very High":d===4?"High":d===3?"Medium":d===2?"Low":"Very Low"; }
  function demandStars(d){ return "★★★★★".slice(0,d)+"☆☆☆☆☆".slice(0,5-d); }
  function rarityClass(t){ return t==="Epic"?"rar-epic":t==="Show Time"?"rar-show":"rar-big"; }
  function badgeFor(v){
    if(v==="Verified") return '<span class="badge b-verified">Verified</span>';
    if(v==="Pending") return '<span class="badge b-pending">Pending</span>';
    if(v==="Needs Evidence") return '<span class="badge b-warn">Needs evidence</span>';
    if(v==="Rejected") return '<span class="badge b-bad">Rejected</span>';
    return '<span class="badge b-mute">'+esc(v)+'</span>';
  }
  function sellerBadge(b){
    const m={"Top Seller":"b-gold","Trusted Seller":"b-verified","Verified Seller":"b-info","New Seller":"b-mute"};
    return '<span class="badge '+(m[b]||"b-mute")+'">'+esc(b)+'</span>';
  }
  // player names present in a listing (via its cards)
  function listingPlayers(listing){
    const seen=[]; const out=[];
    (listing.cardIds||[]).forEach(id=>{ const c=cardById(id); if(c && !seen.includes(c.player_name)){seen.push(c.player_name);out.push(c);} });
    return out;
  }
  function listingHasPlayer(listing, name){
    const n=(name||"").toLowerCase();
    return (listing.cardIds||[]).some(id=>{ const c=cardById(id); return c && c.player_name.toLowerCase()===n; });
  }
  // Matching: required player names + budget + platform + minRares
  function matchScore(listing, req){
    let pts=0; const max=100; const rows=[];
    const names=req.wantNames||req.playerIds||[];
    const hits=names.filter(n=>listingHasPlayer(listing,n));
    if(!names.length){pts+=55;rows.push({k:"Cards",ok:true,t:"No specific cards required"});}
    else if(req.mode==="any"){
      if(hits.length>0){pts+=55;rows.push({k:"Cards",ok:true,t:hits.length+" of selected present ✓"});}
      else rows.push({k:"Cards",ok:false,t:"None of selected present"});
    }else{
      if(hits.length===names.length){pts+=55;rows.push({k:"Cards",ok:true,t:hits.length+"/"+names.length+" required ✓"});}
      else{pts+=Math.round(55*hits.length/names.length);rows.push({k:"Cards",ok:false,t:hits.length+"/"+names.length+" required"});}
    }
    if(req.budgetMax==null && req.budgetMin==null){pts+=20;rows.push({k:"Budget",ok:true,t:"No budget set"});}
    else if(listing.price>=(req.budgetMin||0) && listing.price<=(req.budgetMax||99999)){pts+=20;rows.push({k:"Budget",ok:true,t:money(listing.price)+" in range ✓"});}
    else rows.push({k:"Budget",ok:false,t:money(listing.price)+" out of range"});
    const pf=req.platform;
    if(!pf||pf==="Any"||listing.platform===pf){pts+=15;rows.push({k:"Platform",ok:true,t:listing.platform+" ✓"});}
    else rows.push({k:"Platform",ok:false,t:listing.platform+" ≠ "+pf});
    const nR=(listing.cardIds||[]).length;
    if(nR>=(req.minRares||0)){pts+=10;rows.push({k:"Rare cards",ok:true,t:nR+" ≥ "+(req.minRares||0)+" ✓"});}
    else rows.push({k:"Rare cards",ok:false,t:nR+" < "+req.minRares});
    return {pct:Math.round(pts/max*100),rows};
  }
  // image failure tracking (feeds Admin > Image Status)
  // file/relative paths may contain spaces/parens -> encode; dataURLs stay raw
  function imgSrc(path){ path=path||""; return path.indexOf("data:")===0 ? path : encodeURI(path); }
  function imgFail(card_id, src){
    try{
      const st=E.store.state.imageErrors||(E.store.state.imageErrors={});
      st[card_id]={src:src||"",err:"failed to load",ts:new Date().toISOString().slice(0,16).replace("T"," ")};
      E.store.save(true);
    }catch(e){}
  }
  const debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};};
  const uid=(p)=> (p||"id_")+Math.random().toString(36).slice(2,7);
  E.util = {$,$$,esc,money,allCards,runtimeCards,cardById,cardsByPlayer,thumbForPlayer,liveVal,cardValue,
    sellerById,diffPct,demandLabel,demandStars,rarityClass,badgeFor,sellerBadge,
    listingPlayers,listingHasPlayer,matchScore,imgSrc,imgFail,debounce,uid};
})(window.EFM);
