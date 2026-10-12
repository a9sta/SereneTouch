import { esc, hash, shuffle, km, km2, won, dirWord } from './util.mjs';
import { block, telBtn } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function telCta(cfg, place, seedKey) {
  const h = hash(seedKey, 'cta');
  const lines = [
    `${place} 쪽 시간표에 지금 비는 칸이 있는지 통화에서 바로 봐 드립니다.`,
    `${place} 주소를 말씀하시면 초인종을 누르는 시각까지 숫자로 드립니다.`,
    `${place}에서 받으시려면 코스·시각·동 이름 세 칸만 채우면 됩니다.`,
    `${place} 요청은 이 창구 하나로만 들어옵니다. 관리사 쪽 번호가 따로 돌지 않습니다.`,
  ];
  return `<section class="ask" aria-label="${esc(place)} 예약 문의">
  <p class="ask-p">${esc(at(h, lines))}</p>
  ${telBtn(cfg, { size: 'l' })}
  <p class="ask-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 ─────────────────────────────────────────────────────── */
export function courseGrid(courses, seedKey, place, num = '01') {
  const h = hash(seedKey, 'cg');
  // 아홉 개 설명을 다 달면 어느 쪽이든 같은 아홉 문장이 깔린다. 셋만 시드로 골라 단다.
  const withText = new Set(shuffle(courses.map((c) => c.slug), h).slice(0, 3));
  const list = courses.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li class="cd">
    <a class="cd-a" href="/course/${c.slug}/">
      <span class="cd-k">${esc(c.ko)}</span>
      <span class="cd-m">${c.min}분 · ${won(c.price)}원</span>
      <span class="cd-p">세기 ${esc(c.pressure)}${c.oil ? ' · 오일' : ' · 오일 없음'}</span>
    </a>
    ${withText.has(c.slug) ? `<p class="cd-d">${esc(line)}</p>` : ''}
  </li>`;
  }).join('');
  return block('course', '코스', `${esc(place)}에서 고를 수 있는 코스`,
    `<ul class="cd-ul">${list}</ul>
     <p class="bk-tail">${esc(at(h, SEC.courseTail, 2))} <a href="/course/">코스별 차이</a>와 <a href="/price/">금액표</a>를 따로 두었습니다.</p>`,
    at(h, SEC.courseSub, 1), num);
}

/* ── 접수 흐름 ────────────────────────────────────────────────── */
export function stepList(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return block('step', '순서', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="sp-ol">${steps.map((s, i) => `<li class="sp"><span class="sp-n">${i + 1}</span><div class="sp-b"><h3 class="sp-t">${esc(s.t)}</h3><p class="sp-d">${esc(s.d)}</p></div></li>`).join('')}</ol>`,
    at(h, SEC.stepSub, 2), num);
}

/* ── 빠른 정보 표 ─────────────────────────────────────────────── */
export function factTable(rows) {
  return `<dl class="ft-dl">${rows.map((r) => `<div class="ft-r"><dt>${esc(r[0])}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>`;
}

/* ── FAQ ─────────────────────────────────────────────────────── */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'faq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = block('faq', '질문', esc(at(h, SEC.faqTitle, 3)),
    qa.map((x) => `<div class="qa"><h3 class="qa-q">${esc(x.q)}</h3><p class="qa-a">${esc(x.a)}</p></div>`).join(''),
    at(h, SEC.faqSub, 4), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return block('notice', '주의', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="nx-ul">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`, null, num);
}

/* ── 롱테일 링크 격자 ─────────────────────────────────────────── */
export function longtail(pool, seedKey, n, kicker, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const frame = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(frame(p.label))}</a></li>`;
  }).join('');
  return block('longtail', kicker, heading, `<ul class="lk-ul">${items}</ul>`, sub || at(h, SEC.ltSub, 6), num);
}

/* ── 가까운 거점 ─────────────────────────────────────────────── */
export function nearSpot(s, seedKey, num, far = false) {
  const items = s.near.map((n) => `<li>
    <a href="/${n.sidoSlug}/${n.guSlug}/${n.slug}/">
      <span class="nb-n">${esc(n.name)}</span>
      <span class="nb-g">${n.sameGu ? '같은 구' : esc(n.gu)}</span>
      <span class="nb-k">${km(n.km)}</span>
    </a></li>`).join('');
  return block('near', '거리', far ? `${esc(s.name)}에서 가장 가까운 다른 거점` : `${esc(s.name)}과 가까운 동·읍`,
    `<ul class="nb-ul">${items}</ul>`,
    at(hash(seedKey, 'nb'), far ? SEC.nearSubFar : SEC.nearSub), num);
}

/* ── 구 안의 거점 목록 ──────────────────────────────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const items = g.spots.map((s) => `<li${s.slug === currentSlug ? ' class="on"' : ''}>
    <a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}>
      <span class="sx-n">${esc(s.name)}</span>
      <span class="sx-m">${km2(s.area)} · ${esc(dirWord(s.dir))}</span>
    </a></li>`).join('');
  return block('spotidx', '동·읍', `${esc(g.name)}에서 쪽을 둔 자리 ${g.spotCount}곳`,
    `<ul class="sx-ul">${items}</ul>`,
    at(hash(seedKey, 'sx'), SEC.spotIdxSub), num);
}

/* ── 구 안의 면 목록 ─────────────────────────────────────────────
   면은 쪽을 내지 않는다(마을이 흩어져 있어 쪽을 채울 고유 사실이 안 나온다).
   받지 않는다는 뜻이 아니므로 이름을 그대로 적어 둔다. */
export function myeonList(g, seedKey, num) {
  if (!g.myeonCount) return '';
  return block('myeon', '면', `${esc(g.name)} 면 ${g.myeonCount}곳`,
    `<ul class="my-ul">${g.myeon.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`,
    at(hash(seedKey, 'my'), SEC.myeonSub), num);
}

/* ── 시도 안의 구 목록 ────────────────────────────────────────── */
export function guIndex(sd, seedKey, currentSlug, num) {
  const items = sd.gu.map((g) => `<li${g.slug === currentSlug ? ' class="on"' : ''}>
    <a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}>
      <span class="gx-n">${esc(g.name)}</span>
      <span class="gx-m">동읍 ${g.spotCount} · ${km2(g.area)}</span>
    </a></li>`).join('');
  return block('guidx', '시군구', `${esc(sd.name)} 시군구 ${sd.gu.length}곳`,
    `<ul class="gx-ul">${items}</ul>`,
    at(hash(seedKey, 'gi'), SEC.guIdxSub), num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 쪽용) ─────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return block('also', '이어서', '이어서 볼 곳',
    `<ul class="lk-ul">
      <li><a href="/area/">전체 지역</a></li>
      <li><a href="/guide/">이용안내</a></li>
      <li><a href="/price/">금액표</a></li>
      <li><a href="/course/">코스 안내</a></li>
      <li><a href="/magazine/">안내 글</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('')}
    </ul>`,
    '지역은 시도 → 시군구 → 동·읍 세 단계입니다. 면은 시군구 쪽 안에 이름으로 적어 두었습니다.');
}
