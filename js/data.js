/* eFootball Market — marketplace dataset.
   Listings reference REAL card_ids from js/cards.js (+ admin imports).
   Wanted requests reference player names; thumbnails resolve to real cards.
   Sellers/notifications are fictional demo marketplace info (labeled DEMO in UI).
*/
window.EFM_DATA = (function(){
  const SELLERS = [
    {id:"u_khalil",username:"Khalil_TR",rating:4.9,verifiedSeller:true,transactions:27,cancelled:1,reports:0,joined:"Jan 2024",badge:"Top Seller"},
    {id:"u_squadx",username:"SquadX_MA",rating:4.7,verifiedSeller:true,transactions:14,cancelled:0,reports:1,joined:"Jun 2024",badge:"Trusted Seller"},
    {id:"u_guest",username:"Guest_4412",rating:4.9,verifiedSeller:false,transactions:31,cancelled:2,reports:0,joined:"Mar 2023",badge:"Top Seller"},
    {id:"u_epicdealer",username:"EpicDealer",rating:4.2,verifiedSeller:true,transactions:8,cancelled:1,reports:2,joined:"Nov 2024",badge:"Verified Seller"},
    {id:"u_newbie",username:"CasablancaBoost",rating:4.5,verifiedSeller:false,transactions:3,cancelled:0,reports:0,joined:"Aug 2026",badge:"New Seller"},
    {id:"u_you",username:"Guest_Fan",rating:5.0,verifiedSeller:false,transactions:0,cancelled:0,reports:0,joined:"Sep 2026",badge:"New Seller"}
  ];

  const LISTINGS = [
    {id:10284,sellerId:"u_khalil",platform:"Android",linkage:"Google linked",cardIds:["bt_messi_001","bt_ronaldo_001","bt_ronaldinho_001"],price:45,verification:"Pending",createdAt:"2h ago",daysAgo:0,reports:0,shots:3,desc:"Messi + Ronaldo + Ronaldinho Big Time core. Screenshots ready for review."},
    {id:10271,sellerId:"u_squadx",platform:"iOS",linkage:"KONAMI ID linked",cardIds:["bt_messi_002","bt_mbappe_001","bt_yamal_001","bt_bellingham_001"],price:58,verification:"Verified",createdAt:"5h ago",daysAgo:0,reports:0,shots:4,desc:"Verified pace squad with two Messi-version depth."},
    {id:10263,sellerId:"u_guest",platform:"Android",linkage:"Both",cardIds:["bt_ronaldo_001","bt_rodri_001","bt_desailly_001","bt_buffon_001"],price:36,verification:"Verified",createdAt:"1d ago",daysAgo:1,reports:0,shots:3,desc:"Balanced spine: Ronaldo up top, Rodri–Desailly–Buffon behind."},
    {id:10259,sellerId:"u_epicdealer",platform:"Android",linkage:"Not disclosed",cardIds:["bt_delpiero_001","bt_iniesta_001","bt_best_001"],price:24,verification:"Needs Evidence",createdAt:"1d ago",daysAgo:1,reports:1,shots:2,desc:"Classic playmakers. Moderators requested clearer screenshots."},
    {id:10251,sellerId:"u_newbie",platform:"iOS",linkage:"Google linked",cardIds:["bt_messi_003","bt_neymar_001"],price:25,verification:"Pending",createdAt:"2d ago",daysAgo:2,reports:0,shots:2,desc:"Budget Messi + Neymar duo. Ideal starter Big Time account."},
    {id:10244,sellerId:"u_khalil",platform:"Android",linkage:"KONAMI ID linked",cardIds:["bt_neymar_001","bt_ronaldinho_001","bt_bale_001","bt_hazard_001"],price:47,verification:"Verified",createdAt:"3d ago",daysAgo:3,reports:0,shots:5,desc:"Flair wingers collection, all Big Time."},
    {id:10239,sellerId:"u_squadx",platform:"Android",linkage:"Google linked",cardIds:["bt_mbappe_001","bt_haaland_001","bt_yamal_001","bt_bellingham_001"],price:42,verification:"Verified",createdAt:"4d ago",daysAgo:4,reports:0,shots:3,desc:"Modern meta pace squad for competitive play."},
    {id:10231,sellerId:"u_guest",platform:"iOS",linkage:"Both",cardIds:["bt_messi_001","bt_ronaldinho_001","bt_delpiero_001","bt_suarez_001","bt_ibrahimovic_001"],price:64,verification:"Verified",createdAt:"5d ago",daysAgo:5,reports:0,shots:6,desc:"Premium five-card attacking vault."},
    {id:10215,sellerId:"u_newbie",platform:"Android",linkage:"Google linked",cardIds:["bt_yamal_001","bt_bellingham_001","bt_fernandes_001","bt_kvaratskhelia_001"],price:33,verification:"Pending",createdAt:"1w ago",daysAgo:7,reports:0,shots:3,desc:"Young stars midfield engine."},
    {id:10209,sellerId:"u_khalil",platform:"iOS",linkage:"KONAMI ID linked",cardIds:["bt_ronaldo_001","bt_haaland_001","bt_suarez_001"],price:39,verification:"Verified",createdAt:"1w ago",daysAgo:8,reports:0,shots:3,desc:"Striker vault — three elite CF cards."}
  ];

  const WANTED = [
    {id:3842,user:"DreamHunter_7",wantNames:["Messi","Cristiano Ronaldo","Ronaldinho"],budgetMin:30,budgetMax:50,platform:"Android",minRares:3,status:"Active",createdAt:"3h ago"},
    {id:3839,user:"CasablancaKing",wantNames:["Messi","Mbappé"],budgetMin:40,budgetMax:70,platform:"Any",minRares:2,status:"Active",createdAt:"7h ago"},
    {id:3835,user:"EpicSniper",wantNames:["Rodri","Desailly","Buffon"],budgetMin:25,budgetMax:40,platform:"Android",minRares:3,status:"Active",createdAt:"1d ago"},
    {id:3831,user:"WingerFan",wantNames:["Yamal","Neymar"],budgetMin:20,budgetMax:40,platform:"iOS",minRares:2,status:"Active",createdAt:"1d ago"},
    {id:3827,user:"MetaGrinder",wantNames:["Ronaldinho","Iniesta"],budgetMin:15,budgetMax:30,platform:"Any",minRares:2,status:"Active",createdAt:"2d ago"},
    {id:3822,user:"BudgetBallers",wantNames:["Messi","Neymar"],budgetMin:20,budgetMax:30,platform:"Android",minRares:2,status:"Active",createdAt:"3d ago"},
    {id:3815,user:"WallBuilder",wantNames:["Desailly","Lahm"],budgetMin:10,budgetMax:20,platform:"Android",minRares:2,status:"Active",createdAt:"5d ago"},
    {id:3811,user:"Samba4Ever",wantNames:["Ronaldinho","Neymar","Bale"],budgetMin:35,budgetMax:55,platform:"Any",minRares:3,status:"Active",createdAt:"6d ago"}
  ];

  const NOTIFS = [
    {id:"n1",title:"Someone is looking for Messi + Ronaldo",body:"Wanted Request #3842 matches cards you track.",time:"20m ago",read:false,kind:"match"},
    {id:"n2",title:"Your listing is Pending Verification",body:"Account #10284 was submitted. Moderators usually review within 24h.",time:"2h ago",read:false,kind:"listing"},
    {id:"n3",title:"Big Time cards imported",body:"23 Big Time card images are live with real artwork.",time:"5h ago",read:false,kind:"price"},
    {id:"n4",title:"An account matching your Wanted request was listed",body:"Account #10251 matches Messi + Neymar within your budget.",time:"1d ago",read:true,kind:"match"}
  ];

  const VALUE_HISTORY = {
    bt_messi_001:[15,16,16,17,17,18,18],bt_ronaldo_001:[14,14,15,15,16,16,16],
    bt_mbappe_001:[13,13,14,14,15,15,15],bt_yamal_001:[8,9,9,10,10,11,11],
    bt_ronaldinho_001:[12,12,13,13,13,14,14]
  };

  return {SELLERS, LISTINGS, WANTED, NOTIFS, VALUE_HISTORY};
})();
