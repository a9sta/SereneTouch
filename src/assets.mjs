/**
 * 화면 자산(CSS·JS·SVG)을 dist/assets 에 떨어뜨린다. 외부에서 글꼴이나 그림을
 * 불러오지 않는다 — 수집기가 볼 때 불러오는 것이 적을수록 좋고, 바깥으로 나가는
 * 요청이 없으면 이용자가 어디를 봤는지도 남지 않는다.
 *
 * ★배색과 골격을 앞서 만든 두 사이트와 겹치지 않게 짰다.
 *   루네사       : 밤남색 바탕 + 금빛 · 알약 버튼 · 둥근 점머리
 *   리바이브모션 : 뼈색 바탕 + 짙은 청록 + 녹슨 주황 · 각진 판(radius 0) · 눈금 레일
 *   세린터치     : 미색 바탕(#FAF7F1) + 따뜻한 먹(#2C2A24) + 숲 청록(#3E6F5E) ·
 *                  둥근 블록(14px) · 점선 가름 · 대괄호 머리표
 */
import fs from 'node:fs';
import path from 'node:path';

const C = {
  paper: '#FAF7F1',
  card: '#FFFFFF',
  soft: '#F2ECE2',
  ink: '#2C2A24',
  dim: '#6B6558',
  acc: '#3E6F5E',
  accDk: '#2B5244',
  accSoft: '#E4EDE8',
  line: '#DED6C7',
};

const css = `/* ${'세린터치'} — 손으로 쓴 스타일시트. 빌드 때 그대로 복사된다. */
:root{
  --paper:${C.paper}; --card:${C.card}; --soft:${C.soft};
  --ink:${C.ink}; --dim:${C.dim};
  --acc:${C.acc}; --acc-dk:${C.accDk}; --acc-soft:${C.accSoft};
  --line:${C.line};
  --r:14px; --r-s:9px;
  --w:1080px;
  --fs:16px;
  --ff:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;
  --fm:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:var(--fs)/1.75 var(--ff);
  padding-bottom:84px;word-break:keep-all;overflow-wrap:anywhere}
img,svg{max-width:100%}
a{color:var(--acc-dk);text-decoration:none}
a:hover,a:focus-visible{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
code{font-family:var(--fm);font-size:.92em;background:var(--soft);padding:.1em .35em;border-radius:4px}
.skip{position:absolute;left:-9999px}
.skip:focus{left:12px;top:12px;z-index:50;background:var(--ink);color:#fff;padding:.5rem .9rem;border-radius:var(--r-s)}

/* ── 머리띠: 두 줄 ─────────────────────────────────────── */
.tp{position:sticky;top:0;z-index:30;background:rgba(250,247,241,.94);
  backdrop-filter:saturate(140%) blur(8px);border-bottom:1px solid var(--line)}
.tp-r1{max-width:var(--w);margin:0 auto;padding:.6rem 1rem;display:flex;align-items:center;gap:1rem;justify-content:space-between}
.mark{display:inline-flex;align-items:center;gap:.5rem;color:var(--ink)}
.mark:hover{text-decoration:none}
.mk{width:24px;height:26px;stroke:var(--acc);fill:var(--acc)}
.mark-t{display:flex;flex-direction:column;line-height:1.15}
.mark-t b{font-size:1.06rem;letter-spacing:-.02em}
.mark-t i{font-style:normal;font-size:.64rem;letter-spacing:.14em;color:var(--dim);text-transform:uppercase}
.tp-r2{max-width:var(--w);margin:0 auto;padding:0 1rem .55rem;display:flex;gap:.4rem;overflow-x:auto;scrollbar-width:none}
.tp-r2::-webkit-scrollbar{display:none}
.chip{flex:0 0 auto;padding:.26rem .7rem;border:1px solid var(--line);border-radius:999px;
  font-size:.86rem;color:var(--dim);background:var(--card)}
.chip:hover{text-decoration:none;border-color:var(--acc);color:var(--acc-dk)}
.chip[aria-current]{background:var(--acc);border-color:var(--acc);color:#fff}

/* ── 예약 문의 버튼 ────────────────────────────────────── */
.rb{display:inline-flex;align-items:center;gap:.6rem;background:var(--acc);color:#fff;
  border-radius:var(--r);padding:.55rem .85rem;box-shadow:0 1px 0 rgba(0,0,0,.06)}
.rb:hover,.rb:focus-visible{text-decoration:none;background:var(--acc-dk)}
.rb-badge{display:grid;place-items:center;width:28px;height:28px;flex:0 0 28px;
  background:rgba(255,255,255,.9);border-radius:50%}
.rb-badge svg{fill:var(--acc-dk);display:block}
.rb-body{display:flex;flex-direction:column;line-height:1.2}
.rb-label{font-size:.72rem;letter-spacing:.06em;opacity:.92}
.rb-num{font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:.01em}
.rb-note{font-size:.66rem;padding:.12rem .4rem;border:1px solid rgba(255,255,255,.55);
  border-radius:999px;white-space:nowrap;opacity:.95}
.rb-s{padding:.38rem .6rem;gap:.45rem;border-radius:var(--r-s)}
.rb-s .rb-badge{width:22px;height:22px;flex-basis:22px}
.rb-s .rb-num{font-size:.9rem}
.rb-l{padding:.8rem 1.1rem;font-size:1.06rem}
.rb-l .rb-badge{width:34px;height:34px;flex-basis:34px}
.rb-b{display:flex;width:100%;justify-content:center}

/* ── 갈피 ─────────────────────────────────────────────── */
.trail{max-width:var(--w);margin:0 auto;padding:.7rem 1rem 0;font-size:.82rem;color:var(--dim)}
.trail ol{list-style:none;display:flex;flex-wrap:wrap;gap:.3rem;margin:0;padding:0}
.trail li+li::before{content:'/';margin-right:.3rem;color:var(--line)}

/* ── 본문 ─────────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:1rem 1rem 3rem}
.ph{font-size:1.6rem;line-height:1.35;letter-spacing:-.02em;margin:.8rem 0 1.2rem}
.ph-s{display:block;font-size:.88rem;font-weight:500;color:var(--dim);letter-spacing:0;margin-top:.35rem}
.open{display:grid;gap:.7rem;margin:0 0 1.6rem;font-size:1.02rem}
.open p{margin:0}

/* 섹션 = 대괄호 머리표 + 점선 가름 */
.bk{margin:2.1rem 0;padding-top:1.5rem;border-top:1px dashed var(--line)}
.bk:first-of-type{border-top:0;padding-top:0}
.bk-h{margin-bottom:1rem}
.bk-kk{margin:0 0 .3rem;font-family:var(--fm);font-size:.7rem;letter-spacing:.12em;color:var(--acc)}
.bk-kk::before{content:'[ '}
.bk-kk::after{content:' ]'}
.bk-h h2{margin:0;font-size:1.22rem;letter-spacing:-.015em;line-height:1.4}
.bk-sb{margin:.35rem 0 0;font-size:.9rem;color:var(--dim)}
.bk-tail{margin:.9rem 0 0;font-size:.9rem;color:var(--dim)}
.bk-p{margin:0 0 .7rem}

/* 예약 문의 띠 */
.ask{margin:1.8rem 0;padding:1.2rem;background:var(--acc-soft);border:1px solid #CBDED5;
  border-radius:var(--r);text-align:center}
.ask-p{margin:0 0 .8rem;font-size:1.02rem}
.ask-s{margin:.7rem 0 0;font-size:.82rem;color:var(--dim)}

/* 표 모양 정보 */
.ft-dl{margin:0;display:grid;gap:0;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:var(--card)}
.ft-r{display:grid;grid-template-columns:minmax(7.5rem,.4fr) 1fr;gap:0}
.ft-r+.ft-r{border-top:1px dashed var(--line)}
.ft-r dt{margin:0;padding:.65rem .9rem;background:var(--soft);font-size:.86rem;color:var(--dim)}
.ft-r dd{margin:0;padding:.65rem .9rem;font-size:.95rem}

/* 코스 */
.cd-ul{list-style:none;margin:0;padding:0;display:grid;gap:.7rem;grid-template-columns:repeat(auto-fill,minmax(14.5rem,1fr))}
.cd{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:.85rem}
.cd-a{display:grid;gap:.15rem;color:var(--ink)}
.cd-a:hover{text-decoration:none}
.cd-k{font-weight:700;font-size:1.04rem;color:var(--acc-dk)}
.cd-m{font-size:.9rem;font-variant-numeric:tabular-nums}
.cd-p{font-size:.78rem;color:var(--dim)}
.cd-d{margin:.55rem 0 0;font-size:.86rem;color:var(--dim);padding-top:.55rem;border-top:1px dashed var(--line)}

/* 순서 */
.sp-ol{list-style:none;margin:0;padding:0;display:grid;gap:.7rem}
.sp{display:flex;gap:.8rem;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:.85rem}
.sp-n{flex:0 0 1.8rem;height:1.8rem;display:grid;place-items:center;border-radius:50%;
  background:var(--acc);color:#fff;font-family:var(--fm);font-size:.85rem}
.sp-b{min-width:0}
.sp-t{margin:.1rem 0 .25rem;font-size:1rem}
.sp-d{margin:0;font-size:.9rem;color:var(--dim)}

/* 질문 */
.qa{padding:.9rem 0;border-bottom:1px dashed var(--line)}
.qa:last-child{border-bottom:0}
.qa-q{margin:0 0 .35rem;font-size:1rem}
.qa-q::before{content:'Q ';font-family:var(--fm);color:var(--acc);font-size:.9em}
.qa-a{margin:0;font-size:.93rem;color:#4A463C}

/* 주의 목록 */
.nx-ul{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}
.nx-ul li{padding:.7rem .9rem;background:var(--soft);border-radius:var(--r-s);font-size:.92rem}
.nx-ul b{color:var(--acc-dk)}

/* 링크 격자 */
.lk-ul{list-style:none;margin:0;padding:0;display:grid;gap:.35rem .8rem;grid-template-columns:repeat(auto-fill,minmax(13rem,1fr));font-size:.9rem}
.lk-ul li{padding:.15rem 0}

/* 가까운 거점 */
.nb-ul{list-style:none;margin:0;padding:0;display:grid;gap:.45rem;grid-template-columns:repeat(auto-fill,minmax(12rem,1fr))}
.nb-ul a{display:grid;grid-template-columns:1fr auto;align-items:baseline;gap:.2rem .5rem;
  background:var(--card);border:1px solid var(--line);border-radius:var(--r-s);padding:.55rem .7rem;color:var(--ink)}
.nb-ul a:hover{text-decoration:none;border-color:var(--acc)}
.nb-n{font-weight:600}
.nb-k{font-family:var(--fm);font-size:.82rem;color:var(--acc-dk)}
.nb-g{grid-column:1/-1;font-size:.74rem;color:var(--dim)}

/* 거점·구 목록 */
.sx-ul,.gx-ul{list-style:none;margin:0;padding:0;display:grid;gap:.4rem;grid-template-columns:repeat(auto-fill,minmax(11.5rem,1fr))}
.sx-ul a,.gx-ul a{display:grid;gap:.1rem;background:var(--card);border:1px solid var(--line);
  border-radius:var(--r-s);padding:.5rem .7rem;color:var(--ink)}
.sx-ul a:hover,.gx-ul a:hover{text-decoration:none;border-color:var(--acc)}
.sx-ul li.on a,.gx-ul li.on a{background:var(--acc-soft);border-color:var(--acc)}
.sx-n,.gx-n{font-weight:600;font-size:.95rem}
.sx-m,.gx-m{font-size:.75rem;color:var(--dim);font-variant-numeric:tabular-nums}

/* 면 목록 */
.my-ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.35rem}
.my-ul li{padding:.2rem .6rem;background:var(--soft);border-radius:999px;font-size:.84rem;color:var(--dim)}

/* 대문 */
.front{margin:.5rem 0 2rem;padding:1.5rem;background:var(--card);border:1px solid var(--line);border-radius:var(--r)}
.front-k{margin:0 0 .6rem;font-size:1.3rem;font-weight:700;letter-spacing:-.02em;color:var(--acc-dk)}
.front-l{margin:0 0 1.1rem;font-size:1.02rem}
.front-sg{list-style:none;margin:1.2rem 0 0;padding:1.1rem 0 0;border-top:1px dashed var(--line);
  display:grid;gap:.7rem;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))}
.front-sg b{display:block;font-size:1rem;color:var(--acc-dk)}
.front-sg span{font-size:.84rem;color:var(--dim)}

/* 시도 격자 */
.sg-ul{list-style:none;margin:0;padding:0;display:grid;gap:.6rem;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))}
.sg a{display:grid;gap:.2rem;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:.9rem;color:var(--ink)}
.sg a:hover{text-decoration:none;border-color:var(--acc)}
.sg-n{font-size:1.1rem;font-weight:700;color:var(--acc-dk)}
.sg-m{font-size:.82rem;font-variant-numeric:tabular-nums}
.sg-g{font-size:.76rem;color:var(--dim)}

/* 두 칸 설명 */
.two{display:grid;gap:.7rem;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))}
.two-c{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:.95rem}
.two-c h3{margin:0 0 .35rem;font-size:1rem;color:var(--acc-dk)}
.two-c p{margin:0;font-size:.91rem;color:#4A463C}

/* 글 목록 */
.pl-ul{list-style:none;margin:0;padding:0;display:grid;gap:.6rem}
.pl{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:.85rem}
.pl a{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem;color:var(--ink)}
.pl a:hover{text-decoration:none}
.pl-t{font-weight:700;color:var(--acc-dk)}
.pl time{font-family:var(--fm);font-size:.76rem;color:var(--dim)}
.pl-s{margin:.3rem 0 0;font-size:.88rem;color:var(--dim)}

/* 지역 나무 */
.tr{margin:0 0 1.3rem}
.tr-h{margin:0 0 .5rem;font-size:1.06rem}
.tr-m{font-size:.76rem;font-weight:400;color:var(--dim);font-variant-numeric:tabular-nums}
.tr-ul{list-style:none;margin:0;padding:0;display:grid;gap:.25rem .8rem;grid-template-columns:repeat(auto-fill,minmax(12rem,1fr));font-size:.9rem}
.tr-s{font-size:.74rem;color:var(--dim);font-variant-numeric:tabular-nums}

/* 표 */
.scroll{overflow-x:auto}
.tb{width:100%;border-collapse:collapse;font-size:.9rem;background:var(--card);
  border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.tb caption{caption-side:top;text-align:left;font-size:.8rem;color:var(--dim);padding:0 0 .45rem}
.tb th,.tb td{padding:.55rem .7rem;text-align:left;border-bottom:1px dashed var(--line);white-space:nowrap}
.tb thead th{background:var(--soft);font-size:.8rem;color:var(--dim)}
.tb tbody tr:last-child th,.tb tbody tr:last-child td{border-bottom:0}

/* 고르기 */
.pk-dl{margin:0;display:grid;gap:.4rem}
.pk{display:grid;grid-template-columns:1fr auto;gap:.3rem .8rem;align-items:baseline;
  padding:.6rem .8rem;background:var(--card);border:1px solid var(--line);border-radius:var(--r-s)}
.pk dt{margin:0;font-size:.92rem}
.pk dd{margin:0;font-size:.86rem;font-variant-numeric:tabular-nums}

/* 코스 비교 */
.cm-ul{list-style:none;margin:0;padding:0;display:grid;gap:.6rem;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))}
.cm{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:.8rem}
.cm a{display:grid;gap:.1rem;color:var(--ink)}
.cm a:hover{text-decoration:none}
.cm-k{font-weight:700;color:var(--acc-dk)}
.cm-m{font-size:.82rem;font-variant-numeric:tabular-nums}
.cm-d{margin:.4rem 0 0;font-size:.85rem;color:var(--dim)}

/* 조문 */
.rl-ol,.law-ol{margin:0;padding:0;list-style:none;display:grid;gap:.9rem;counter-reset:n}
.rl-ol li,.law-ol li{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:.95rem}
.rl-ol h3,.law-ol h3{margin:0 0 .3rem;font-size:1rem;color:var(--acc-dk)}
.rl-ol p,.law-ol p{margin:0;font-size:.92rem;color:#4A463C}

/* 글 */
.pm{margin:0 0 1rem;font-family:var(--fm);font-size:.78rem;color:var(--dim)}
.art{max-width:44rem}
.art h3{margin:1.8rem 0 .5rem;font-size:1.1rem;color:var(--acc-dk);padding-top:1rem;border-top:1px dashed var(--line)}
.art p{margin:0 0 .9rem}
.art ul{margin:0 0 1.1rem;padding-left:1.1rem}
.art li{margin:.3rem 0}

/* 하단 고정 바 */
.dock{position:fixed;left:0;right:0;bottom:0;z-index:40;background:rgba(250,247,241,.96);
  backdrop-filter:blur(8px);border-top:1px solid var(--line);padding:.5rem .8rem .6rem;
  display:grid;gap:.25rem;justify-items:center}
.dock-s{font-size:.72rem;color:var(--dim)}

/* 푸터 */
.bt{background:var(--soft);border-top:1px solid var(--line);margin-top:2rem}
.bt-top{max-width:var(--w);margin:0 auto;padding:2rem 1rem 1.4rem;display:grid;gap:1.6rem;
  grid-template-columns:minmax(16rem,1.4fr) repeat(auto-fit,minmax(11rem,1fr))}
.bt-h{margin:0 0 .5rem;font-size:.84rem;letter-spacing:.1em;color:var(--acc-dk);text-transform:none}
.bt-h2{margin-top:1.1rem}
.bt-p{margin:0 0 .9rem;font-size:.9rem;color:#4A463C}
.bt-run{margin:.8rem 0 0;font-size:.82rem;color:var(--dim)}
.bt-biz{margin:.5rem 0 0;font-size:.76rem;color:var(--dim)}
.bt-dim{opacity:.75}
.bt-ul{list-style:none;margin:0;padding:0;display:grid;gap:.25rem;font-size:.88rem}
.bt-grid{grid-template-columns:repeat(auto-fill,minmax(5rem,1fr))}
.bt-post li{display:grid}
.bt-post time{font-family:var(--fm);font-size:.7rem;color:var(--dim)}
.bt-feed{display:flex;gap:.7rem;margin-top:.6rem;font-size:.8rem}
.bt-sm{margin:.6rem 0 0;font-size:.76rem;color:var(--dim)}
.bt-end{border-top:1px dashed var(--line)}
.bt-end>p{max-width:var(--w);margin:0 auto;padding:.9rem 1rem;font-size:.76rem;color:var(--dim)}
.bt-ai strong{color:var(--acc-dk)}
.bt-cr{padding-top:0 !important}

@media (max-width:640px){
  .ph{font-size:1.34rem}
  .front{padding:1.1rem}
  .bk{margin:1.7rem 0;padding-top:1.2rem}
  .ft-r{grid-template-columns:1fr}
  .ft-r dd{padding-top:.2rem}
  .ft-r dt{padding-bottom:.2rem;background:transparent}
  .ft-r+.ft-r{border-top:1px solid var(--line)}
}
@media (prefers-reduced-motion:reduce){*{transition:none !important;animation:none !important}}
@media print{.tp,.dock,.ask{display:none}body{padding-bottom:0;background:#fff}}
`;

/* 자바스크립트는 거의 두지 않는다. 화면을 바꾸는 무작위 요소를 넣으면
   '같은 주소 = 같은 응답' 원칙이 흔들린다. 여기서는 푸터가 보일 때
   하단 고정 바를 내리는 일만 한다. */
const js = `(function(){
  var dock=document.querySelector('.dock'), ft=document.querySelector('.bt');
  if(!dock||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){ dock.style.transform = e.isIntersecting ? 'translateY(110%)' : 'translateY(0)'; });
  },{threshold:0.08}).observe(ft);
  dock.style.transition='transform .18s ease-out';
})();
`;

/** 문과 손잡이 — 머리띠 로고와 같은 모양 */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${C.ink}"/><rect x="8" y="6" width="16" height="20" rx="3" fill="none" stroke="${C.acc}" stroke-width="2.4"/><circle cx="20" cy="16" r="1.7" fill="${C.acc}"/></svg>`;

const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 56" role="img" aria-label="세린터치 SereneTouch"><rect width="220" height="56" fill="${C.paper}"/><rect x="12" y="10" width="26" height="36" rx="5" fill="none" stroke="${C.acc}" stroke-width="3"/><circle cx="32" cy="28" r="2.6" fill="${C.acc}"/><text x="50" y="30" font-family="sans-serif" font-size="20" font-weight="700" fill="${C.ink}">세린터치</text><text x="50" y="44" font-family="sans-serif" font-size="9" letter-spacing="2.4" fill="${C.dim}">SERENETOUCH</text></svg>`;

const og = (cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${C.paper}"/><rect x="0" y="0" width="1200" height="14" fill="${C.acc}"/><rect x="72" y="86" width="96" height="132" rx="18" fill="none" stroke="${C.acc}" stroke-width="10"/><circle cx="146" cy="152" r="9" fill="${C.acc}"/><text x="72" y="310" font-family="sans-serif" font-size="74" font-weight="700" fill="${C.ink}">${cfg.brand.ko} 출장마사지</text><text x="72" y="386" font-family="sans-serif" font-size="36" fill="${C.dim}">${cfg.coverage.sido.join(' · ')} 동·읍 방문 관리</text><text x="72" y="452" font-family="sans-serif" font-size="34" fill="${C.accDk}">${cfg.hours} · ${cfg.pay} · ${cfg.telLabel}</text><text x="72" y="556" font-family="sans-serif" font-size="26" letter-spacing="4" fill="${C.dim}">SERENETOUCH — ${cfg.brand.slogan}</text></svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'serene.css'), css);
  fs.writeFileSync(path.join(dir, 'serene.js'), js);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), favicon);
  fs.writeFileSync(path.join(dir, 'logo.svg'), logo);
  fs.writeFileSync(path.join(dir, 'og.svg'), og(cfg));
}
export const THEME = C;
