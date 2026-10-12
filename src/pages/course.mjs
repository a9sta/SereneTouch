import { layout, block } from '../lib/html.mjs';
import { esc, hash, won, km2, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { stepList, factTable, faqBlock, noticeBlock, longtail, telCta } from '../lib/blocks.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

function faqCtx(ctx, place, unit, nearList) {
  const { cfg, courses } = ctx;
  return {
    place, unit,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel, telNote: cfg.telNote,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
    nearList: nearList || '옆 동·읍',
  };
}

/* ── 코스 한 가지 ─────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions, counts } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;

  const lead = `<div class="open">
  <p>${esc(c.lines[0])}</p>
  <p>${esc(c.for)} 고르시면 맞습니다. 손이 주로 가는 자리는 ${esc(c.focus)}, 세기는 ${esc(c.pressure)}, 속도는 ${esc(c.tempo)}${josa(c.tempo, '으로/로')} 둡니다.</p>
  <p>${esc(c.lines[2])}</p>
</div>`;

  const facts = block('fact', '기본값', `${esc(c.ko)} 기본값`,
    factTable([
      ['기본 시간', `${c.min}분`],
      ['금액', `${won(c.price)}원 (전 지역 같음)`],
      ['세기', esc(c.pressure)],
      ['속도', esc(c.tempo)],
      ['손이 가는 자리', esc(c.focus)],
      ['오일', c.oil ? '씁니다 (받기 전 샤워를 권합니다)' : '쓰지 않습니다'],
      ['받는 시간', `${esc(cfg.hours)} · ${esc(cfg.pay)}`],
    ]),
    '새벽 할증과 이동비라는 항목이 없습니다. 길게 하시면 늘어난 만큼만 보탭니다.', '00');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = block('compare', '비교', '다른 코스와 무엇이 다릅니까',
    `<ul class="cm-ul">${others.map((x) => `<li class="cm">
      <a href="/course/${x.slug}/"><span class="cm-k">${esc(x.ko)}</span><span class="cm-m">${x.min}분 ${won(x.price)}원 · 세기 ${esc(x.pressure)}</span></a>
      <p class="cm-d">${esc(x.for)} 고르는 쪽입니다.</p>
    </li>`).join('')}</ul>`,
    `${esc(c.ko)}${josa(c.ko, '과/와')} 견줘 보실 수 있게 세기와 시간을 같이 적었습니다.`, '01');

  const sidoLinks = block('bysido', '시도', `시도별 ${esc(c.ko)} 안내`,
    `<ul class="lk-ul">${regions.map((r) => `<li><a href="/${r.slug}/course/${c.slug}/">${esc(r.name)} ${esc(c.ko)} 출장마사지</a></li>`).join('')}</ul>`,
    `시도 ${counts.sido}곳 어디든 ${won(c.price)}원 같은 값입니다.`, '02');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, c.ko, '코스'), 4, '04');

  const pool = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) {
    pool.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  }

  const body = [
    lead, facts,
    telCta(cfg, c.ko, seed),
    compare, sidoLinks,
    stepList(seed, '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    longtail(pool, seed, 24, '받는 곳', `${esc(c.ko)}${josa(c.ko, '을/를')} 받을 수 있는 동·읍`, null, '06'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="ph-s">출장마사지·홈타이 ${c.min}분 ${won(c.price)}원</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장마사지·홈타이`,
          desc: clampDesc(desc.course(c)),
          areaServed: cfg.coverage.sido.map((s) => ({ '@type': 'AdministrativeArea', name: s })),
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────────
   ★동·읍 × 코스는 만들지 않는다. 626 × 9 = 5,634쪽이 되는데 자리가 달라져도
     코스 설명이 같아 전부 얇은 조합 페이지가 된다(doorway-thin-combo 규칙).
     시도 단위까지만 내려가고, 거점 쪽에서는 코스 목록으로 잇는다. */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.slug}/${c.slug}`;
  const h = hash(seed);
  const byArea = sd.gu.slice().sort((a, b) => b.area - a.area);

  const opens = [
    `${sd.name}에서 ${c.ko}${josa(c.ko, '을/를')} 받으시려면 예약 문의 버튼으로 접수하시면 됩니다. 동·읍 ${sd.spotCount}곳 전부 ${c.min}분 ${won(c.price)}원 한 가지 값입니다.`,
    `${sd.name} 안 어느 자리에서든 ${c.ko}${josa(c.ko, '은/는')} 같은 값입니다. ${c.min}분 ${won(c.price)}원이고, 멀다고 이동비를 붙이지 않습니다.`,
    `${c.ko}${josa(c.ko, '은/는')} ${c.focus}에 시간을 몰아 쓰는 코스입니다. ${sd.name} 안 시군구 ${sd.gu.length}곳 어디서나 같은 짜임으로 들어갑니다.`,
  ];

  const lead = `<div class="open">
  <p>${esc(at(h, opens, 0))}</p>
  <p>${esc(c.lines[1])}</p>
  <p>세기는 ${esc(c.pressure)}, 속도는 ${esc(c.tempo)}입니다. ${esc(c.for)} 고르시면 맞고, 받는 중에 세기를 바꿔 달라고 하셔도 됩니다.</p>
</div>`;

  const facts = block('fact', '기본값', `${esc(sd.name)} ${esc(c.ko)} 기본값`,
    factTable([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a> 시군구 ${sd.gu.length}곳 · 동읍 ${sd.spotCount}곳`],
      ['코스', `<a href="/course/${c.slug}/">${esc(c.ko)}</a> ${c.min}분`],
      ['금액', `${won(c.price)}원`],
      ['세기 · 속도', `${esc(c.pressure)} · ${esc(c.tempo)}`],
      ['손이 가는 자리', esc(c.focus)],
      ['오일', c.oil ? '씁니다' : '쓰지 않습니다'],
      ['접수', `${esc(cfg.hours)} 열려 있음 · 값은 ${esc(cfg.pay)} · 문 앞까지 ${esc(cfg.arrive)}`],
    ]), null, '00');

  const guLinks = block('gulist', '시군구', `${esc(sd.name)} 시군구에서 ${esc(c.ko)}`,
    `<ul class="lk-ul">${sd.gu.map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} ${esc(c.ko)} 받는 자리</a></li>`).join('')}</ul>`,
    '구 쪽에 그 안의 동·읍 목록과 가까운 시군구까지의 거리를 적어 두었습니다.', '01');

  const otherCourse = block('oc', '다른 코스', `${esc(sd.name)}에서 고를 수 있는 다른 코스`,
    `<ul class="lk-ul">${courses.filter((x) => x.slug !== c.slug).map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)} ${x.min}분</a></li>`).join('')}</ul>`,
    null, '02');

  const { html: faqHtml, qa } = faqBlock(seed,
    faqCtx(ctx, `${sd.name} ${c.ko}`, '시도', byArea.slice(0, 3).map((g) => g.name).join('·')), 4, '04');

  // 깊은 쪽으로 바로 내려가는 길 + 다른 시도의 같은 코스
  const crossPool = [];
  for (const r of ctx.regions) {
    if (r.slug !== sd.slug) crossPool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
    for (const g of r.gu) for (const s of g.spots) crossPool.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  }

  const body = [
    lead, facts,
    telCta(cfg, `${sd.name} ${c.ko}`, seed),
    guLinks, otherCourse,
    stepList(seed, '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    longtail(crossPool, seed, 24, '이어서', `다른 곳에서 받는 ${esc(c.ko)}`, null, '06'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="ph-s">출장마사지 ${c.min}분 ${won(c.price)}원</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장마사지·홈타이`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}
