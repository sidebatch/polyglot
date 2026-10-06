(function(){
  var ACCENT={ja:"#b3402e",en:"#274b73",fr:"#3a5fb0"};
  var tabs=document.querySelectorAll("nav.tabs button");
  var panes={ja:document.getElementById("pane-ja"),en:document.getElementById("pane-en"),fr:document.getElementById("pane-fr")};
  function activate(lang){
    tabs.forEach(function(b){b.classList.toggle("active",b.dataset.lang===lang);});
    Object.keys(panes).forEach(function(k){
      panes[k].classList.toggle("active",k===lang);
      panes[k].querySelectorAll(".entry-detail").forEach(function(d){d.hidden=true;});
      panes[k].querySelectorAll(".entry-card").forEach(function(c){c.classList.remove("open");c.setAttribute("aria-expanded","false");});
    });
    document.documentElement.style.setProperty("--accent",ACCENT[lang]);
    window.scrollTo({top:0,behavior:"smooth"});
  }
  tabs.forEach(function(b){b.addEventListener("click",function(){activate(b.dataset.lang);});});
  var topbtn=document.getElementById("topbtn");
  window.addEventListener("scroll",function(){topbtn.style.display=window.scrollY>400?"block":"none";},{passive:true});
  topbtn.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});
  document.querySelectorAll(".entry-card").forEach(function(card){
    card.addEventListener("click",function(){
      var detail=document.getElementById(card.dataset.entry);
      var open=detail.hidden;
      detail.hidden=!open;
      card.classList.toggle("open",open);
      card.setAttribute("aria-expanded",open?"true":"false");
      if(open){detail.scrollIntoView({behavior:"smooth",block:"start"});}
    });
  });
})();
