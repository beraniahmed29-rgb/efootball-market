/* store: client state + localStorage. Backend boundary stays in js/api.js. */
window.EFM = window.EFM || {};
(function(E){
  const KEY="efm_state_v2", OLD="efm_state_v1";
  const defaults = {saved:[10271,10231],myListings:[10284],myWanted:[3842],purchases:[],
    notifs:EFM_DATA.NOTIFS.map(n=>({...n})),priceOverrides:{},priceHistoryLog:[],
    cardsRuntime:[],staging:[],imageErrors:{},
    modActions:[{ts:"2026-09-20 14:02",mod:"mod_amine",action:"Approved listing #10271",note:"Screenshots consistent"}],
    user:{username:"Guest_Fan",id:"u_you"}};
  let state;
  try{
    state = JSON.parse(localStorage.getItem(KEY)) || null;
    if(!state){
      // migrate lightweight prefs from v1 (ids are stable across redesign)
      let old=null; try{old=JSON.parse(localStorage.getItem(OLD));}catch(e){}
      state = {...defaults};
      if(old){ ["saved","myListings","myWanted","purchases","notifs","priceOverrides","priceHistoryLog","user"].forEach(k=>{ if(old[k]!=null) state[k]=old[k]; }); }
    }
  }catch(e){ state = {...defaults}; }
  state = Object.assign({}, defaults, state);
  function save(silent){ try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){} if(!silent) updateDots(); else updateDots(); }
  function updateDots(){
    const unread = state.notifs.filter(n=>!n.read).length;
    ["notif-dot","notif-dot-m"].forEach(id=>{const el=document.getElementById(id); if(el) el.classList.toggle("hidden", unread===0);});
  }
  function notify(title,body,kind){
    state.notifs.unshift({id:"n_"+Date.now(),title,body,time:"Just now",read:false,kind:kind||"info"});
    save();
  }
  function toggleSaved(id){
    const i=state.saved.indexOf(id);
    if(i>=0) state.saved.splice(i,1); else state.saved.push(id);
    save(); return state.saved.includes(id);
  }
  E.store = {state, save, notify, toggleSaved, updateDots,
    reset(){ localStorage.removeItem(KEY); location.reload(); }
  };
})(window.EFM);
