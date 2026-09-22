(function(){
  // Год в футере
  var yr = document.getElementById('yr');
  if(yr) yr.textContent = new Date().getFullYear();

  // Scroll к секции внутри .page-wrap
  function navTo(id){
    var el   = document.getElementById(id);
    var wrap = document.querySelector('.page-wrap');
    if(!el || !wrap) return;
    var hdrH = 64;
    var abs = 0, node = el;
    while(node && node !== wrap){ abs += node.offsetTop; node = node.offsetParent; }
    wrap.scrollTo({ top: abs - hdrH, behavior:'smooth' });
    var nav2   = document.getElementById('main-nav');
    var burger = document.getElementById('burger');
    if(nav2)   nav2.classList.remove('open');
    if(burger) burger.setAttribute('aria-expanded','false');
  }
  window.navTo = navTo;

  // Email: собираем из частей, обходя обфускацию хостинга
  document.querySelectorAll('.email-reveal').forEach(function(el){
    var email = el.dataset.u + '\u0040' + el.dataset.d;
    var a = document.createElement('a');
    a.href = 'mai'+'lto:'+email;
    a.textContent = email;
    if(el.dataset.color) a.style.color = el.dataset.color;
    el.parentNode.replaceChild(a, el);
  });

  // Бургер
  var burger = document.getElementById('burger');
  var navEl  = document.getElementById('main-nav');
  if(burger && navEl){
    burger.addEventListener('click', function(){
      var open = navEl.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
  }

  // Клавиатурная поддержка span[role="button"]
  document.querySelectorAll('span[role="button"]').forEach(function(el){
    el.addEventListener('keydown', function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); el.click(); }
    });
  });

  // FAQ аккордеон
  document.querySelectorAll('.faq-item').forEach(function(item){
    var btn = item.querySelector('.faq-q');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });
    btn.addEventListener('keydown', function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); btn.click(); }
    });
  });
})();
