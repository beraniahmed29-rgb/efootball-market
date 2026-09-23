/* api.js — backend adapter boundary (single file to swap for REST/Supabase).
   Card images: seed files live under assets/cards/<Type>/ and are served as-is.
   Admin ZIP imports are parsed client-side (JSZip), original bytes preserved
   as dataURLs in state.cardsRuntime until a real object-storage backend exists. */
window.EFM = window.EFM || {};
(function(E){
  const delay=(ms)=>new Promise(r=>setTimeout(r,ms));
  const IMG_RE=/\.(jpe?g|png|webp)$/i;

  function detectType(name, zipName){
    const h=(name+" "+(zipName||"")).toLowerCase();
    if(h.includes("show")) return "Show Time";
    if(h.includes("big")) return "Big Time";
    if(h.includes("epic")) return "Epic";
    return null;
  }
  function guessName(file){
    // "Lionel_Messi_efhub (1).png" -> "Messi" ; fallback to cleaned basename
    let b=file.split("/").pop().replace(/\.[a-z0-9]+$/i,"").replace(/_efhub.*$/i,"");
    b=b.replace(/\(\d+\)/g,"").replace(/_+/g," ").trim();
    const parts=b.split(" ").filter(Boolean);
    if(parts.length<=1) return b||"Unknown Player";
    // use last token as display surname (matches seed convention)
    let last=parts[parts.length-1].replace(/[^A-Za-zÀ-ÿ.'-]/g,"");
    const fixes={"Mbapp":"Mbappé","SuRez":"Suárez","Ibrahimovi":"Ibrahimović","Ne":"Neymar"};
    if(fixes[last]) return fixes[last];
    if(/^ronaldinho$/i.test(b)) return "Ronaldinho";
    if(/^neymar/i.test(b)) return "Neymar";
    return last||b;
  }

  E.api = {
    async listListings(){ await delay(80); return EFM_DATA.LISTINGS.map(l=>({...l})); },
    async getListing(id){ await delay(40); const l=EFM_DATA.LISTINGS.find(x=>x.id==id); return l?{...l}:null; },
    async createListing(payload){
      await delay(350);
      const id = 10300 + Math.floor(Math.random()*600);
      const rec = {id, sellerId:payload.sellerId||"u_you", createdAt:"Just now", daysAgo:0, reports:0,
        shots:(payload.screenshots||[]).length||1, verification:"Pending",
        desc:"Seller-submitted listing. Awaiting moderation.", ...payload};
      delete rec.screenshots;
      EFM_DATA.LISTINGS.unshift(rec);
      E.store.state.myListings.unshift(id);
      E.store.notify("Listing submitted for moderation","Account #"+id+" is now Pending Verification.","listing");
      E.store.save();
      return rec;
    },
    async moderateListing(id, action, note, mod){
      await delay(150);
      const l = EFM_DATA.LISTINGS.find(x=>x.id==id); if(!l) throw new Error("not found");
      l.verification = action;
      E.store.state.modActions.unshift({ts:new Date().toISOString().slice(0,16).replace("T"," "),mod:mod||"mod_you",action:action+" listing #"+id,note:note||""});
      E.store.notify("Moderation update: #"+id, "Status → "+action+(note?". Note: "+note:""), "listing");
      E.store.save();
      return l;
    },
    async updateCardValue(card_id, newValue, admin){
      await delay(150);
      const c = E.util.cardById(card_id); if(!c) throw new Error("card not found");
      const o=E.store.state.priceOverrides;
      const prev = o[card_id]!=null?o[card_id]:c.current_value;
      o[card_id]=newValue;
      E.store.state.priceHistoryLog.unshift({card:card_id,prev,next:newValue,ts:new Date().toISOString().slice(0,16).replace("T"," "),admin:admin||"admin_you"});
      E.store.notify("Card Value updated", c.player_name+" ("+c.card_type+" "+c.card_version+"): $"+prev+" → $"+newValue+".","price");
      E.store.save();
      return {prev,next:newValue};
    },
    async setCardStatus(card_id, status){
      const rt=E.store.state.cardsRuntime.find(c=>c.card_id===card_id);
      if(rt){ rt.status=status; E.store.save(); return rt; }
      // seed cards: track deactivation via overrides map
      const d=E.store.state.deactivatedSeed||(E.store.state.deactivatedSeed={});
      if(status==="inactive") d[card_id]=true; else delete d[card_id];
      E.store.save(); return {card_id,status};
    },
    async renameCard(card_id, name){
      const rt=E.store.state.cardsRuntime.find(c=>c.card_id===card_id);
      if(rt){ rt.player_name=name; E.store.save(); return rt; }
      const o=E.store.state.renamedSeed||(E.store.state.renamedSeed={});
      o[card_id]=name; E.store.save(); return {card_id,name};
    },
    async requestPurchase(listingId, buyerId){
      await delay(300);
      const l = EFM_DATA.LISTINGS.find(x=>x.id==listingId);
      const pr = {id:"PR-"+Math.floor(1000+Math.random()*9000),listingId,buyer:buyerId||"u_you",seller:l.sellerId,amount:l.price,status:"Awaiting Verification",ts:new Date().toISOString().slice(0,16).replace("T"," ")};
      E.store.state.purchases.unshift(pr);
      E.store.notify("Purchase request created","Listing #"+listingId+" · "+E.util.money(l.price)+" · Awaiting Verification.","purchase");
      E.store.save();
      return pr;
    },
    async createWanted(payload){
      await delay(250);
      const id = 3850+Math.floor(Math.random()*100);
      const rec = {id, user:E.store.state.user.username, status:"Active", createdAt:"Just now", ...payload};
      EFM_DATA.WANTED.unshift(rec); E.store.state.myWanted.unshift(id);
      E.store.notify("Wanted request published","Request #"+id+" is live. Sellers with matching accounts can find you.","match");
      E.store.save(); return rec;
    },
    async analyzeScreenshots(){ await delay(500);
      return {note:"Simulated pre-check only. Human moderator review required."}; },

    /* ---- ZIP import: parses file entries, preserves original bytes ---- */
    async importZip(file, opts, onProgress){
      opts=opts||{};
      if(typeof JSZip==="undefined") throw new Error("JSZip library not loaded. Check connection and retry.");
      const zip = await JSZip.loadAsync(file);
      const names = Object.keys(zip.files).filter(n=>!zip.files[n].dir && IMG_RE.test(n) && !n.includes("__MACOSX"));
      const total=names.length;
      const known = {};
      E.util.allCards(true).forEach(c=>{ known[(c.file_name||"").toLowerCase()+"|"+(c.image_path||"").length]=c.card_id; });
      const seenInBatch={};
      const staged=[]; let duplicates=0, failed=0;
      const perType={Epic:0,"Big Time":0,"Show Time":0};
      let done=0;
      for(const n of names){
        try{
          const base=n.split("/").pop();
          const key=base.toLowerCase();
          if(seenInBatch[key]||Object.keys(known).some(k=>k.split("|")[0]===key)){ duplicates++; }
          else{
            const blob=await zip.files[n].async("blob");
            const dataUrl=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(blob);});
            const t=detectType(n,file.name)||opts.cardType||"Big Time";
            const pname=guessName(base);
            const siblings=staged.filter(s=>s.player_name===pname&&s.card_type===t).length
              + E.util.allCards(true).filter(c=>c.player_name===pname&&c.card_type===t).length;
            const ver="#"+String(siblings+1).padStart(3,"0");
            const slug=pname.toLowerCase().replace(/[^a-z0-9]+/g,"").slice(0,14)||"card";
            const card_id="imp_"+t.toLowerCase().replace(/ /g,"")+"_"+slug+"_"+Date.now().toString(36)+"_"+staged.length;
            staged.push({card_id,player_name:pname,card_type:t,card_version:ver,
              image_path:dataUrl,file_name:base,current_value:opts.defaultValue||8,currency:"$",
              status:opts.publish?"active":"staged",demand:3,position:"—",source:"zip: "+file.name});
            seenInBatch[key]=true; perType[t]=(perType[t]||0)+1;
          }
        }catch(e){ failed++; }
        done++; if(onProgress) onProgress(Math.round(done/Math.max(1,total)*100),done,total);
      }
      if(opts.publish){ E.store.state.cardsRuntime = E.store.state.cardsRuntime.concat(staged.filter(s=>s.status==="active")); }
      E.store.state.staging = (E.store.state.staging||[]).concat(staged.filter(s=>s.status==="staged"));
      E.store.save();
      return {total,successful:staged.length,failed,duplicates,perType,staged:staged.length};
    },
    publishStaging(){
      const st=E.store.state.staging||[];
      st.forEach(s=>s.status="active");
      E.store.state.cardsRuntime=(E.store.state.cardsRuntime||[]).concat(st);
      E.store.state.staging=[];
      E.store.notify("Cards published",st.length+" imported cards are now live.","listing");
      E.store.save(); return st.length;
    },
    discardStaging(){ const n=(E.store.state.staging||[]).length; E.store.state.staging=[]; E.store.save(); return n; },

    searchAll(q){
      q=(q||"").toLowerCase().trim(); if(!q) return {cards:[],listings:[],wanted:[],sellers:[]};
      const cards=E.util.allCards().filter(c=>c.player_name.toLowerCase().includes(q)||c.card_type.toLowerCase().includes(q)).slice(0,6);
      const names=new Set(cards.map(c=>c.player_name.toLowerCase()));
      return {
        cards,
        listings:EFM_DATA.LISTINGS.filter(l=>String(l.id).includes(q)||(l.cardIds||[]).some(id=>{const c=E.util.cardById(id);return c&&(c.player_name.toLowerCase().includes(q)||names.has(c.player_name.toLowerCase()));})).slice(0,4),
        wanted:EFM_DATA.WANTED.filter(w=>w.wantNames.some(n=>n.toLowerCase().includes(q))).slice(0,3),
        sellers:EFM_DATA.SELLERS.filter(s=>s.username.toLowerCase().includes(q)).slice(0,3)
      };
    }
  };
})(window.EFM);
