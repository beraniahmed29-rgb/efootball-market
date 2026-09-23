/* eFootball Market — REAL card database (card_id is the primary identifier).
   Every entry maps 1:1 to an imported image file. Originals are NEVER modified.
   Structure: /assets/cards/<Card_Type>/<original_filename>
   Admin-imported cards (ZIP upload) are appended at runtime and persisted in
   localStorage (efm_cards_v1); seed manifest below is read-only.

   Schema: card_id, player_name, card_type, card_version, image_path,
           current_value, currency, status, demand(1-5), position
*/
window.EFM_CARDS = (function(){
  const T = "Big Time";
  function c(card_id, player_name, card_version, file, current_value, demand, position){
    return {card_id, player_name, card_type:T, card_version,
      image_path:"assets/cards/Big_Time/"+file,
      file_name:file, current_value, currency:"$", status:"active",
      demand, position:position||"—", source:"seed: BIG TIME.zip"};
  }
  const SEED = [
    c("bt_messi_001","Messi","#001","Lionel_Messi_efhub.png",18,5,"SS"),
    c("bt_messi_002","Messi","#002","Lionel_Messi_efhub (1).png",17,5,"CF"),
    c("bt_messi_003","Messi","#003","Lionel_Messi_efhub (3).png",16,4,"RWF"),
    c("bt_ronaldo_001","Cristiano Ronaldo","#001","Cristiano_Ronaldo_efhub.png",16,5,"CF"),
    c("bt_mbappe_001","Mbappé","#001","Kylian_Mbapp__efhub (1).png",15,5,"CF"),
    c("bt_ronaldinho_001","Ronaldinho","#001","Ronaldinho_Ga_cho_efhub.png",14,5,"AMF"),
    c("bt_neymar_001","Neymar","#001","Neymar_Jr_efhub.png",12,4,"LWF"),
    c("bt_yamal_001","Yamal","#001","Lamine_Yamal_efhub (1).png",11,5,"RWF"),
    c("bt_haaland_001","Haaland","#001","Erling_Haaland_efhub.png",11,4,"CF"),
    c("bt_bellingham_001","Bellingham","#001","Jude_Bellingham_efhub.png",10,4,"AMF"),
    c("bt_delpiero_001","Del Piero","#001","Alessandro_Del_Piero_efhub.png",10,3,"SS"),
    c("bt_iniesta_001","Iniesta","#001","Andr_s_Iniesta_efhub.png",9,3,"CMF"),
    c("bt_rodri_001","Rodri","#001","Rodri_efhub.png",9,4,"DMF"),
    c("bt_hazard_001","Hazard","#001","Eden_Hazard_efhub.png",9,3,"LWF"),
    c("bt_ibrahimovic_001","Ibrahimović","#001","Zlatan_Ibrahimovi__efhub.png",9,3,"CF"),
    c("bt_fernandes_001","B. Fernandes","#001","Bruno_Fernandes_efhub.png",8,3,"AMF"),
    c("bt_suarez_001","Suárez","#001","Luis_Su_rez_efhub.png",8,3,"CF"),
    c("bt_best_001","Best","#001","George_Best_efhub.png",8,3,"RWF"),
    c("bt_bale_001","Bale","#001","Gareth_Bale_efhub.png",8,3,"RWF"),
    c("bt_desailly_001","Desailly","#001","Marcel_Desailly_efhub.png",8,3,"CB"),
    c("bt_buffon_001","Buffon","#001","Gianluigi_Buffon_efhub.png",7,2,"GK"),
    c("bt_lahm_001","Lahm","#001","Philipp_Lahm_efhub.png",7,2,"RB"),
    c("bt_kvaratskhelia_001","Kvaratskhelia","#001","K__Kvaratskhelia_efhub.png",8,3,"LWF")
  ];
  return {SEED, CARD_TYPES:["Epic","Big Time","Show Time"]};
})();
