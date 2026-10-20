(function(){
  var base=document.body.getAttribute('data-base')||'/';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}

  // floating glyphs
  var gl = $('.glyphs'), syms = ['{ }','=>','fn','0x','&&','[ ]','::','#','//'];
  for (var i=0;i<16;i++){var e=document.createElement('i');e.textContent=syms[i%syms.length];
    e.style.left=(Math.random()*96)+'%';e.style.top=(40+Math.random()*60)+'%';
    e.style.animationDuration=(10+Math.random()*10)+'s';e.style.animationDelay=(-Math.random()*12)+'s';gl.appendChild(e)}

  // icons
  var IC = {
    cpu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
    web:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>',
    cube:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>',
    bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    chip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/></svg>',
    srv:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/></svg>'
  };

  // marquee
  var mq = [['cpu','Native binaries'],['web','Browser WASM'],['cube','WASI containers'],['bolt','AWS Lambda'],['chip','ESP32'],['srv','Web server'],['cpu','Cranelift JIT'],['bolt','Fibers'],['cube','Docker'],['cpu','Native Fusion']];
  var mr = $('#marq'); var mh='';
  for (var k=0;k<2;k++) mq.forEach(function(m){mh+='<span>'+IC[m[0]]+m[1]+'</span>'});
  mr.innerHTML = mh;

  // hero terminal
  var targets = [
    {n:'Native', w:'a native binary', cmd:'matchbox --target native hello.bxs', out:['<span class="ok">&#10003;</span> compiled to bytecode','<span class="ok">&#10003;</span> appended to runner stub','<span class="ok">&#10003;</span> wrote ./hello (no JVM needed)'], size:8, lbl:'runner stub (~4.7 MB) + bytecode'},
    {n:'Browser', w:'the browser', cmd:'matchbox --target js hello.bxs', out:['<span class="ok">&#10003;</span> compiled to bytecode','<span class="ok">&#10003;</span> wrote hello.js + hello.wasm','<span class="c">// import it in any page</span>'], size:6, lbl:'WASM module'},
    {n:'Lambda', w:'AWS Lambda', cmd:'matchbox lambda deploy Lambda.bx', out:['<span class="ok">&#10003;</span> compiled to bytecode','<span class="ok">&#10003;</span> packaged as a custom runtime','<span class="c">// preview: prints the Function URL</span>'], size:9, lbl:'Lambda bootstrap + bytecode'},
    {n:'ESP32', w:'an ESP32', cmd:'matchbox blink.bxs --target esp32 --chip esp32s3 --flash', out:['<span class="ok">&#10003;</span> compiled to bytecode','<span class="ok">&#10003;</span> stored in the storage partition','<span class="c">// flash and run on the board</span>'], size:4, lbl:'bytecode on a 1 MB partition'}
  ];
  var tabs = $('#ttabs'), tout = $('#tout'), fill = $('#sizefill'), lbl = $('#sizelbl');
  var cur = 0, timer = null, typing = 0;
  targets.forEach(function(t,i){var b=document.createElement('button');b.className='tab';b.type='button';b.setAttribute('role','tab');b.textContent=t.n;b.addEventListener('click',function(){stop();show(i)});tabs.appendChild(b)});
  function stop(){clearInterval(timer);timer=null;typing++}
  function show(i){
    cur=i; var t=targets[i]; var my=++typing;
    setWord(t.w);
    $$('.tab').forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false')});
    var head='<span class="c"># hello.bxs</span>\nprintln(<span class="s">"Hello, world!"</span>);\n\n<span class="ok">$</span> ';
    fill.style.width='0%'; lbl.textContent=t.lbl;
    if(reduce){tout.innerHTML=head+t.cmd+'\n'+t.out.join('\n');fill.style.width=t.size+'%';return}
    var n=0; tout.innerHTML=head+'<span class="cur"></span>';
    (function step(){ if(my!==typing)return; n++;
      tout.innerHTML=head+t.cmd.slice(0,n)+'<span class="cur"></span>';
      if(n<t.cmd.length){setTimeout(step,24);return}
      var j=0; (function line(){ if(my!==typing)return;
        if(j<t.out.length){tout.innerHTML=head+t.cmd+'\n'+t.out.slice(0,j+1).join('\n');j++;setTimeout(line,330)}
        else{fill.style.width=t.size+'%'}
      })();
    })();
  }
  var swapEl=$('#swap'), swapT=null;
  function setWord(w){if(swapEl.textContent===w)return;if(reduce){swapEl.textContent=w;return}
    swapEl.classList.add('out');clearTimeout(swapT);swapT=setTimeout(function(){swapEl.textContent=w;swapEl.classList.remove('out')},350)}
  show(0);
  timer=setInterval(function(){show((cur+1)%targets.length)},7200);

  // copy buttons
  $$('button[data-copy]').forEach(function(b){b.addEventListener('click',function(){
    var t=b.getAttribute('data-copy'), old=b.textContent;
    function done(){b.textContent='Copied';setTimeout(function(){b.textContent=old},1400)}
    try{navigator.clipboard.writeText(t).then(done,done)}catch(e){done()}
  })});

  // reveal + counters
  var io = new IntersectionObserver(function(es){es.forEach(function(en){
    if(!en.isIntersecting)return; var el=en.target; el.classList.add('in'); io.unobserve(el);
    var c=$('[data-count]',el)||(el.hasAttribute&&el.hasAttribute('data-count')?el:null);
    if(c)count(c);
  })},{threshold:.18});
  $$('.rv').forEach(function(e){io.observe(e)});
  function count(c){var to=+c.getAttribute('data-count'),plus=c.getAttribute('data-plus');
    if(reduce){c.textContent=to+(plus?'+':'');return}
    var t0=null;(function f(ts){t0=t0||ts;var p=Math.min(1,(ts-t0)/1100),e=1-Math.pow(1-p,3);
      c.textContent=Math.round(to*e)+(p===1&&plus?'+':'');if(p<1)requestAnimationFrame(f)})(performance.now())}

  // jit tiers
  var tiers = [
    {t:'Empty loop elimination', d:'An empty for loop after 10,000 iterations collapses to one instruction.', code:'<span class="k">for</span> (i = 1; i &lt;= 5000000; i++) {}\n<span class="c">// counter jumps to its final value</span>', i:92, j:6},
    {t:'Numeric loop body', d:'Numeric loops become native code with variables kept in registers.', code:'sum = 0;\n<span class="k">for</span> (i = 1; i &lt;= 5000000; i++) {\n  sum += i * 2;\n}', i:88, j:14},
    {t:'Array iteration', d:'A for-in over a float array runs on the raw pointer, skipping the iterator.', code:'total = 0;\n<span class="k">for</span> (v <span class="k">in</span> readings) {\n  total += v;\n}', i:80, j:18},
    {t:'Hot function compilation', d:'A function called 100 times is compiled whole, with direct native calls.', code:'<span class="k">function</span> score(a, b) {\n  <span class="k">return</span> (a * b) % 97;\n}', i:76, j:22}
  ];
  var tw=$('#tiers'), jt=$('#tiers'), tcur=0, tt=null;
  tiers.forEach(function(t,i){var b=document.createElement('button');b.type='button';b.className='tier';b.setAttribute('role','tab');
    b.innerHTML='<span class="n">'+(i+1)+'</span><div><b>'+t.t+'</b><span>'+t.d+'</span></div>';b.addEventListener('click',function(){clearInterval(tt);tier(i)});tw.appendChild(b)});
  function tier(i){tcur=i;var t=tiers[i];
    $$('.tier').forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false')});
    $('#jcode').innerHTML=t.code;
    var pi=$('#pi'),pj=$('#pj');pi.style.transition=pj.style.transition='none';pi.style.width=pj.style.width='0%';
    void pi.offsetWidth;pi.style.transition='width 1.6s cubic-bezier(.2,.8,.2,1)';pj.style.transition='width 1.6s cubic-bezier(.2,.8,.2,1)';
    pi.style.width=t.i+'%';pj.style.width=t.j+'%';
    $('#pit').textContent='slow';$('#pjt').textContent='fast';
  }
  var started=false;
  new IntersectionObserver(function(es,o){if(es[0].isIntersecting&&!started){started=true;tier(0);tt=setInterval(function(){tier((tcur+1)%tiers.length)},4200)}},{threshold:.3}).observe($('.jit'));
  tier(0);

  // pack
  var pk=$('#pack'); new IntersectionObserver(function(es,o){if(es[0].isIntersecting){pk.classList.add('in');o.disconnect()}},{threshold:.4}).observe(pk);


  // scroll progress + spotlight
  var prog=$('#prog'), spot=$('#spot');
  addEventListener('scroll',function(){var h=document.documentElement;prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'},{passive:true});
  $('.hero').addEventListener('mousemove',function(e){var r=this.getBoundingClientRect();spot.style.setProperty('--sx',(e.clientX-r.left)+'px');spot.style.setProperty('--sy',(e.clientY-r.top)+'px')});

  // vm pipeline
  var stages=[
    {n:'Source',s:'.bxs / .bxm',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13l-2 2 2 2M15 13l2 2-2 2"/></svg>',lbl:'You write BoxLang',code:'<span class="k">function</span> score(a, b) {\n  <span class="k">return</span> (a * b) % 97;\n}'},
    {n:'Compiler',s:'matchbox --build',ic:IC.cpu,lbl:'The compiler turns it into bytecode',code:'<span class="c">$</span> matchbox --build app.bxs\n<span class="ok">&#10003;</span> parsed, checked, compiled'},
    {n:'Bytecode',s:'.bxb',ic:IC.cube,lbl:'Portable bytecode, ready for any compatible runner',code:'<span class="c">; score(a, b)</span>\nGET_LOCAL a\nGET_LOCAL b\nMUL\nCONST 97\nMOD\nRETURN'},
    {n:'VM + fibers',s:'Rust, stack based',ic:IC.srv,lbl:'A Rust VM runs it and schedules fibers',code:'<span class="c">// cooperative scheduler</span>\nrunAsync(() =&gt; fetch(url));\nsleep(100);  <span class="c">// others keep running</span>'},
    {n:'Cranelift JIT',s:'native CLI',ic:IC.bolt,lbl:'Hot code becomes machine code',code:'<span class="c">// after 100 calls</span>\n<span class="ok">&#10003;</span> score() compiled to native\n<span class="c">// loops compile after 10,000 iterations</span>'}
  ];
  var sl=$('#vmstages'), si=0, st=null;
  stages.forEach(function(g,i){var li=document.createElement('li');li.innerHTML='<div class="n">'+g.ic+'</div><b>'+g.n+'</b><small>'+g.s+'</small>';li.addEventListener('click',function(){clearInterval(st);stage(i)});sl.appendChild(li)});
  function stage(i){si=i;$$('#vmstages li').forEach(function(l,j){l.classList.toggle('on',j===i)});
    $('#vmdot').style.left=(i/(stages.length-1)*100)+'%';$('#vmlbl').textContent=stages[i].lbl;$('#vmcode').innerHTML=stages[i].code}
  stage(0);
  new IntersectionObserver(function(es,o){if(es[0].isIntersecting){st=setInterval(function(){stage((si+1)%stages.length)},2600);o.disconnect()}},{threshold:.3}).observe($('#vmpipe'));

  // fusion loop
  var lt=[
    {t:'BoxLang \u2192 Rust',p:'pA',a:'tA',bar:'native/math.rs  and  app.bxs',note:'Native builds. Rust is statically linked into your binary.',
     code:'<span class="c">// native/math.rs</span>\n<span class="k">use</span> matchbox_vm::matchbox_fn;\n\n<span class="c">#[matchbox_fn]</span>\n<span class="k">pub fn</span> add(a: f64, b: f64) -&gt; f64 { a + b }\n\n<span class="c">// app.bxs</span>\nprintln(add(<span class="s">10</span>, <span class="s">20</span>))   <span class="c">// 30</span>'},
    {t:'Rust \u2192 BoxLang',p:'pB',a:'tB',bar:'native/ticks.rs  and  app.bxs',note:'<b>Illustrative.</b> Uses the same VM calls the built-in BIFs use. A tested example is on the to-do list.',
     code:'<span class="c">// native/ticks.rs</span>\n<span class="k">pub fn</span> each_twice(vm: &amp;<span class="k">mut dyn</span> BxVM, args: &amp;[BxValue])\n  -&gt; Result&lt;BxValue, String&gt; {\n  <span class="k">let</span> chunk = vm.current_chunk().ok_or(<span class="s">"no chunk"</span>)?;\n  <span class="k">for</span> n <span class="k">in</span> 1..=2 {\n    vm.call_function_by_value(&amp;args[0],\n      <span class="k">vec!</span>[BxValue::new_number(n <span class="k">as</span> f64)], chunk.clone())?;\n  }\n  Ok(BxValue::new_null())\n}\n\n<span class="c">// app.bxs</span>\neach_twice((n) =&gt; println(<span class="s">"tick "</span> &amp; n))'},
    {t:'BoxLang \u2192 Java',p:'pC',a:'tC',bar:'app.bxs',note:'<b>Experimental.</b> Native builds only. Needs a JDK on the host at runtime. No generics or annotations.',
     code:'import java:java.util.ArrayList as List;\n\nlist = <span class="k">new</span> List()\nlist.add(<span class="s">"BoxLang"</span>)\nlist.add(<span class="s">"MatchBox"</span>)\nprintln(list.size())   <span class="c">// 2</span>'}
  ];
  var tb=$('#ltabs'), lcur=0, lt_timer=null;
  lt.forEach(function(x,i){var b=document.createElement('button');b.type='button';b.className='lt';b.setAttribute('role','tab');b.textContent=x.t;b.addEventListener('click',function(){clearInterval(lt_timer);loopTab(i)});tb.appendChild(b)});
  function loopTab(i){lcur=i;var x=lt[i];
    $$('.lt').forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false')});
    ['pA','pB','pC'].forEach(function(id){$('#'+id).classList.toggle('on',id===x.p)});
    ['tA','tB','tC'].forEach(function(id){$('#'+id).classList.toggle('on',id===x.a)});
    $('#lbar').textContent=x.bar;$('#lpre').innerHTML=x.code;$('#lnote').innerHTML=x.note}
  [['pA',0],['pB',1],['pC',2]].forEach(function(q){$('#'+q[0]).addEventListener('click',function(){clearInterval(lt_timer);loopTab(q[1])})});
  loopTab(0);
  new IntersectionObserver(function(es,o){if(es[0].isIntersecting){lt_timer=setInterval(function(){loopTab((lcur+1)%lt.length)},5200);o.disconnect()}},{threshold:.35}).observe($('.loop'));

  // fibers
  var F={m:[[0,10],[22,6],[50,9],[80,8]],a:[[10,12],[34,16],[62,10]],b:[[18,8],[28,6],[56,6],[70,10],[90,6]]};
  var col={m:'#7ee8ff',a:'#00ff78',b:'#ffd47a'};var fibEl=$('#fib'), all=[];
  Object.keys(F).forEach(function(k){var lane=$('.ft[data-f="'+k+'"]');F[k].forEach(function(r){var e=document.createElement('b');
    e.style.left=r[0]+'%';e.style.width=r[1]+'%';e.style.background=col[k];e.style.color=col[k];lane.appendChild(e);all.push({k:k,from:r[0],to:r[0]+r[1],e:e})})});
  // one thread lane: the same blocks, laid out one after another
  var one=$('.ft[data-f="t"]'), seq=[];
  all.slice().sort(function(a,b){return a.from-b.from}).forEach(function(x){var e=document.createElement('b');e.style.background=col[x.k];e.style.color=col[x.k];one.appendChild(e);seq.push({src:x,e:e})});
  (function layout(){var pos=0,tot=0;seq.forEach(function(q){tot+=q.src.to-q.src.from});seq.forEach(function(q){var w=(q.src.to-q.src.from)/tot*100;q.e.style.left=pos+'%';q.e.style.width=w+'%';q.pos=pos;q.w=w;pos+=w})})();
  var play=$('#fplay');
  if(!reduce){var t0=null;(function tick(ts){t0=t0||ts;var pct=((ts-t0)/9000)%1*100;
    var lane=$('.ft[data-f="m"]').getBoundingClientRect(),box=fibEl.getBoundingClientRect();
    play.style.left=(lane.left-box.left+lane.width*pct/100)+'px';
    all.forEach(function(x){x.e.classList.toggle('on',pct>=x.from&&pct<x.to)});
    seq.forEach(function(q){q.e.classList.toggle('on',pct>=q.src.from&&pct<q.src.to)});
    requestAnimationFrame(tick)})(performance.now())}


  // capability matrix
  var rows=[
    ['No JVM for the core runtime','','y','y','y'],
    ['Cranelift JIT','Native CLI builds','y','n','n'],
    ['Native Fusion (Rust)','','y','n','n'],
    ['Java interop','Experimental JNI, needs a JDK','p','n','n'],
    ['Web server','Server build, or embedded scope','y','n','p'],
    ['Browser js.* bridge','','n','y','n']
  ];
  var mxEl=$('#mx'),mh='';
  rows.forEach(function(r){mh+='<div class="rl"><span>'+r[0]+(r[1]?'<small>'+r[1]+'</small>':'')+'</span></div>';
    [2,3,4].forEach(function(k){var v=r[k];mh+='<div><i class="dt '+v+'"></i><span>'+({y:'Yes',p:'Partial',n:'No'})[v]+'</span></div>'})});
  mxEl.insertAdjacentHTML('beforeend',mh);
  new IntersectionObserver(function(es,o){if(es[0].isIntersecting){mxEl.classList.add('in');o.disconnect()}},{threshold:.2}).observe(mxEl);



  // ai native
  var chatLines=[
    ['u','Build a blink app for my ESP32-S3 and flash it.'],
    ['a','<span class="sk">boxlang-runtime-esp32</span><br>Compiling the BoxLang script and flashing it:<br><code>matchbox blink.bxs --target esp32 --chip esp32s3 --flash</code>'],
    ['u','Can this also run in the browser?'],
    ['a','<span class="sk">boxlang-runtime-wasm-in-the-browser</span><br>Yes, with the JS target:<br><code>matchbox --target js blink.bxs</code><br>Native Fusion and the JIT are native only, so I kept the logic portable.']
  ];
  var cb=$('#cbody'),crun=0;
  function chatPlay(){var my=++crun;cb.innerHTML='';var els=chatLines.map(function(l){var d=document.createElement('div');d.className='msg '+l[0];d.innerHTML=l[1];cb.appendChild(d);return d});
    if(reduce){els.forEach(function(e){e.classList.add('in')});return}
    var i=0;(function nxt(){if(my!==crun)return;if(i>=els.length){setTimeout(chatPlay,6500);return}els[i].classList.add('in');i++;setTimeout(nxt,i%2?900:1900)})()}
  var skills=[['boxlang-runtime-matchbox','Install, targets, limits'],['boxlang-runtime-compiled-native-binaries','Native builds and Native Fusion'],['boxlang-runtime-wasm-in-the-browser','JS and WASM for browsers'],['boxlang-runtime-wasm-container','WASI and containers'],['boxlang-runtime-esp32','Microcontrollers'],['build, flash, debug ESP32','Skills shipped in the MatchBox repo']];
  var skEl=$('#sks');skills.forEach(function(k){var d=document.createElement('div');d.innerHTML='<b>'+k[0]+'</b><span>'+k[1]+'</span>';skEl.appendChild(d)});
  Array.prototype.forEach.call(skEl.children,function(d,i){d.style.transitionDelay=(i*.08)+'s'});
  new IntersectionObserver(function(es,o){if(es[0].isIntersecting){skEl.classList.add('in');chatPlay();var c=$('.skm b[data-count]');if(c)count(c);o.disconnect()}},{threshold:.3}).observe($('.aig'));

  // target cards
  var cards=[
    ['cpu','Native executable','Bundle the runner stub with your bytecode. No JVM and no separate MatchBox install on the destination.','--target native','building-and-deploying/native-builds/'],
    ['web','Browser and JavaScript','An AOT JS module, a raw WASM binary, or the browser runtime for dynamic BoxLang.','--target js','building-and-deploying/javascript-and-wasm/'],
    ['cube','WASI and containers','Isolated WASM workloads in Wasmtime or WasmEdge, with host capabilities controlling access.','--target wasm','building-and-deploying/wasm-container/'],
    ['bolt','AWS Lambda (preview)','A Lambda runner and a deploy command for single file serverless BoxLang, with a step by step setup guide.','matchbox lambda deploy','building-and-deploying/aws-lambda-aws-cli-setup/'],
    ['chip','ESP32 devices','Cross compile the embedded runner for supported Xtensa and RISC-V boards, with USB HID and a web UI.','--target esp32 --chip','building-and-deploying/esp32/'],
    ['srv','Web server','A built-in server for .bxm pages and a routed app server with middleware and ColdBox-style handlers.','--serve','examples/web_server/']
  ];
  var ch=$('#cards');
  cards.forEach(function(c,i){var a=document.createElement('a');a.href=base+c[4];a.className='card rv';a.style.setProperty('--d',(i*.06)+'s');
    a.innerHTML='<div class="ic">'+IC[c[0]]+'</div><h3>'+c[1]+'</h3><p>'+c[2]+'</p><span class="tag">'+c[3]+'</span>';
    a.addEventListener('mousemove',function(e){var r=a.getBoundingClientRect();a.style.setProperty('--mx',(e.clientX-r.left)+'px');a.style.setProperty('--my',(e.clientY-r.top)+'px')});
    ch.appendChild(a);io.observe(a)});

})();
