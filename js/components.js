/* Reusable UI — every visual loads the REAL imported card image.
   RULE: never render initials or invented artwork. On failure show
   "Image unavailable" and log to Admin > Image Status. */
window.EFM = window.EFM || {};
(function(E){
  const u = E.util;

  // Global fallback for broken <img> (wired via inline onerror)
  E.imgFallback = function(el, card_id){
    if(!el || el.dataset.dead) return;
    el.dataset.dead="1";
    u.imgFail(card_id, el.getAttribute("src")||"");
    const d=document.createElement("div");
    d.className="img-unavailable"+(el.classList.contains("mini")?" small":"");
    d.textContent="Image unavailable";
    el.replaceWith(d);
  };

  function cardImgTag(card, cls){
    return '<img class="'+(cls||"")+'" src="'+u.imgSrc(card.image_path)+'" alt="'+u.esc(card.player_name+" "+card.card_type)+'" loading="lazy" decoding="async" onerror="EFM.imgFallback(this,\''+card.card_id+'\')" />';
  }

  function cardTile(card){
    const v = u.liveVal(card);
    return '<div class="card-tile '+u.rarityClass(card.card_type)+'" data-go="#/card/'+card.card_id+'" role="button" tabindex="0">'
      +'<div class="card-art">'+cardImgTag(card)+'<span class="rar-tag">'+u.esc(card.card_type)+'</span><span class="ver-tag">'+u.esc(card.card_version)+'</span></div>'
      +'<div class="card-meta"><b>'+u.esc(card.player_name)+'</b><span class="t">'+u.esc(card.card_type)+'</span><div class="v">$'+v+'</div></div></div>';
  }

  function miniThumb(card){
    return cardImgTag(card,"mini");
  }

  function diffLine(cv, price){
    const pct = u.diffPct(cv,price);
    if(price<cv) return '<span class="diff-below">'+Math.abs(pct)+'% below Card Value</span>';
    if(price>cv) return '<span class="diff-above">'+pct+'% above Card Value</span>';
    return '<span class="diff-below">At Card Value</span>';
  }

  // Clean account card: status row, ID, names, REAL mini thumbnails, CV vs asking, seller, CTA
  function accountCard(l){
    const cv = u.cardValue(l.cardIds);
    const cards=(l.cardIds||[]).map(id=>u.cardById(id)).filter(Boolean);
    const names=[...new Set(cards.map(c=>c.player_name))];
    const seller = u.sellerById(l.sellerId);
    return '<article class="acard" data-go="#/account/'+l.id+'">'
      +'<div class="a-top"><span>'+u.badgeFor(l.verification)+'</span><span class="badge b-mute">'+u.esc(l.platform)+'</span></div>'
      +'<div class="a-id">ACC-'+l.id+' <span class="badge b-demo">demo</span></div>'
      +'<div class="a-names">'+u.esc(names.join(" + "))+'</div>'
      +'<div class="a-thumbs">'+cards.slice(0,5).map(c=>'<span class="th">'+miniThumb(c)+'<br/>'+u.esc(c.player_name.split(" ").pop())+'</span>').join('')+'</div>'
      +'<div class="a-prices"><div><small>Card Value</small><div class="cv">$'+cv.toFixed(2).replace(/\.00$/,"")+'</div></div>'
      +'<div style="text-align:right"><small>Asking Price</small><div class="lp">$'+l.price+'</div>'+diffLine(cv,l.price)+'</div></div>'
      +'<div class="a-foot"><span>Seller ★ '+seller.rating+'</span><span style="flex:1"></span><span style="color:var(--acc);font-weight:700">View Account →</span></div>'
      +'</article>';
  }

  // Compact wanted card with REAL thumbnails + match count
  function wantedCard(w, matchCount){
    const thumbs=(w.wantNames||[]).map(n=>{
      const c=u.thumbForPlayer(n);
      return '<span>'+(c?miniThumb(c):"")+u.esc(n)+'</span>';
    }).join('');
    return '<div class="wcard"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center">'
      +'<b>'+u.esc(w.user)+'</b><span class="badge b-mute">'+u.esc(w.platform)+'</span></div>'
      +'<div class="sr" style="margin-top:4px">Looking for:</div>'
      +'<div class="w-thumbs">'+thumbs+'</div>'
      +'<div class="kv"><span>Budget</span><b>$'+w.budgetMin+'–$'+w.budgetMax+'</b></div>'
      +(matchCount!=null?'<div class="kv"><span>Matches</span><b>'+matchCount+' matching accounts</b></div>':'')
      +'<a class="btn btn-ghost btn-sm btn-block" style="margin-top:10px" href="#/wanted-match/'+w.id+'">View Matches</a></div>';
  }

  function emptyState(icon,title,body,ctaHref,ctaLabel){
    return '<div class="empty"><div class="e-ico">'+icon+'</div><h3>'+title+'</h3><p>'+body+'</p>'
      +(ctaHref?'<a class="btn btn-primary btn-sm" href="'+ctaHref+'">'+ctaLabel+'</a>':'')+'</div>';
  }

  function modal(html){
    const r=document.getElementById("modal-root");
    r.innerHTML='<div class="modal-bg" id="modal-bg"><div class="modal" role="dialog" aria-modal="true">'+html+'</div></div>';
    document.getElementById("modal-bg").addEventListener("click",e=>{ if(e.target.id==="modal-bg") closeModal(); });
    document.addEventListener("keydown",escClose);
  }
  function escClose(e){ if(e.key==="Escape") closeModal(); }
  function closeModal(){ document.getElementById("modal-root").innerHTML=""; document.removeEventListener("keydown",escClose); }
  function toast(msg, isErr){
    const t=document.createElement("div"); t.className="toast"+(isErr?" err":""); t.textContent=msg;
    document.getElementById("toast-root").appendChild(t);
    setTimeout(()=>{t.style.opacity="0";t.style.transition=".3s";setTimeout(()=>t.remove(),300);},3200);
  }

  // Sell Step 2 / Wanted: searchable rows with REAL image per card version
  function cardPicker(selectedIds, searchId, gridId){
    const all = u.allCards();
    return '<input id="'+searchId+'" class="field" type="search" placeholder="Search player... (e.g. Messi)" />'
      +'<div id="'+gridId+'" style="margin-top:10px">'
      + all.map(c=>'<div class="pick-row'+(selectedIds.includes(c.card_id)?' sel':'')+'" data-pick="'+c.card_id+'">'
        +cardImgTag(c)
        +'<div><b>'+u.esc(c.player_name)+'</b><div class="sr">'+u.esc(c.card_type)+' '+u.esc(c.card_version)+'</div>'
        +'<div style="font-weight:700;font-size:13.5px">Card Value: $'+u.liveVal(c)+'</div></div>'
        +'<span class="tick">✓</span></div>').join('')
      +'</div>';
  }

  E.c = {cardImgTag,cardTile,miniThumb,diffLine,accountCard,wantedCard,emptyState,modal,closeModal,toast,cardPicker};
})(window.EFM);
