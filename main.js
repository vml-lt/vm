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

  // ── Калькулятор налогов ──────────────────────────────────────────────────
  var calcBtn = document.getElementById('calc-btn');
  if(calcBtn){
    calcBtn.addEventListener('click', function(){
      var income   = parseFloat(document.getElementById('calc-income').value)   || 0;
      var expenses = parseFloat(document.getElementById('calc-expenses').value) || 0;
      if(income <= 0){ alert('Įveskite pajamų sumą.'); return; }
      var base   = Math.max(0, income - expenses);
      var gpm    = base * 0.15;
      var vsd    = base * 0.1252;
      var psd    = base * 0.09;
      var total  = gpm + vsd + psd;
      var net    = income - total;
      var fmt = function(n){ return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',') + ' €'; };
      var rows = [
        ['Metinės pajamos',            fmt(income),   ''],
        ['Leidžiami atskaitymai',      '− ' + fmt(expenses), ''],
        ['Apmokestinamoji bazė',       fmt(base),     ''],
        ['GPM (15 %)',                 '− ' + fmt(gpm),  ''],
        ['VSD (12,52 %)',              '− ' + fmt(vsd),  ''],
        ['PSD (9 %)',                  '− ' + fmt(psd),  ''],
        ['Iš viso mokesčiai',          '− ' + fmt(total),''],
        ['✅ Grynasis pelnas (apytiksl.)','≈ ' + fmt(net), 'cr-total'],
      ];
      var html2 = '';
      rows.forEach(function(r){
        html2 += '<div class="calc-row ' + r[2] + '"><span class="cr-label">' + r[0] + '</span><span class="cr-val">' + r[1] + '</span></div>';
      });
      document.getElementById('calc-rows').innerHTML = html2;
      var res = document.getElementById('calc-result');
      res.classList.add('visible');
      res.scrollIntoView({behavior:'smooth', block:'nearest'});
    });
  }

  // ── Виджет ближайшего срока ───────────────────────────────────────────────
  (function(){
    var dw = document.getElementById('dw-content');
    if(!dw) return;
    var now   = new Date();
    var year  = now.getFullYear();
    var month = now.getMonth(); // 0-based
    var day   = now.getDate();

    // Список сроков (month 0-based, dom = день месяца)
    // Повторяющиеся ежемесячные — добавляем для текущего и следующего месяца
    var deadlines = [];

    // Ежемесячный PVM до 25-го
    for(var m = 0; m < 12; m++){
      deadlines.push({ date: new Date(year, m, 25), name: 'PVM deklaracija (FR0600) – mėnesinė', who: 'PVM mokėtojai' });
    }
    // GPM iki gegužės 1
    deadlines.push({ date: new Date(year, 4, 1),  name: 'Metinė GPM deklaracija (GPM311)', who: 'Fiziniai asmenys, IV' });
    deadlines.push({ date: new Date(year+1, 4, 1),name: 'Metinė GPM deklaracija (GPM311)', who: 'Fiziniai asmenys, IV' });
    // Pelno mokestis birželio 15
    deadlines.push({ date: new Date(year, 5, 15), name: 'Pelno mokesčio deklaracija (PLN204)', who: 'Juridiniai asmenys' });
    deadlines.push({ date: new Date(year+1, 5, 15),name:'Pelno mokesčio deklaracija (PLN204)', who: 'Juridiniai asmenys' });
    // NT vasario 1
    deadlines.push({ date: new Date(year, 1, 1),  name: 'NT mokesčio deklaracija', who: 'Juridiniai asmenys, IV' });
    deadlines.push({ date: new Date(year+1, 1, 1),name: 'NT mokesčio deklaracija', who: 'Juridiniai asmenys, IV' });
    // Avansai spalio 1
    deadlines.push({ date: new Date(year, 9, 1),  name: 'Pelno mokesčio avansas', who: 'Juridiniai asmenys' });
    deadlines.push({ date: new Date(year+1, 9, 1),name: 'Pelno mokesčio avansas', who: 'Juridiniai asmenys' });
    // Дарба iki 15
    for(var m2 = 0; m2 < 12; m2++){
      deadlines.push({ date: new Date(year, m2, 15), name: 'Darbdavio pranešimas (SAV)', who: 'Darbdaviai' });
    }

    var today = new Date(year, month, day);
    // Найти ближайший будущий срок (включая сегодня)
    var upcoming = deadlines.filter(function(d){ return d.date >= today; });
    upcoming.sort(function(a,b){ return a.date - b.date; });

    if(!upcoming.length){ dw.innerHTML = 'Artimiausi terminai nerasti.'; return; }

    var next  = upcoming[0];
    var diff  = Math.round((next.date - today) / 86400000);
    var months = ['sausio','vasario','kovo','balandžio','gegužės','birželio','liepos','rugpjūčio','rugsėjo','spalio','lapkričio','gruodžio'];
    var dateStr = next.date.getDate() + ' ' + months[next.date.getMonth()] + ' ' + next.date.getFullYear() + ' d.';

    var urgency = diff === 0 ? '🔴 Šiandien!' : diff <= 5 ? '🟠 Liko ' + diff + ' d.' : '🟢 Liko ' + diff + ' d.';
    dw.innerHTML =
      '<span class="dw-name">' + next.name + '</span>' +
      '<span class="dw-days">📅 ' + dateStr + ' &nbsp;|&nbsp; ' + urgency + ' &nbsp;|&nbsp; ' + next.who + '</span>';
  })();

})();
