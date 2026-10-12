import { layout, block, telBtn, doorMark } from '../lib/html.mjs';
import { esc, hash, shuffle, won, km, km2 } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock,
  longtail, siteLinks, telCta,
} from '../lib/blocks.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

function faqCtx(ctx, place, unit) {
  const { cfg, courses } = ctx;
  return {
    place, unit,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel, telNote: cfg.telNote,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
    nearList: '옆 동·읍',
  };
}

/** 모든 거점을 한 줄로 펴 둔 롱테일 풀 */
function allSpots(regions) {
  const out = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) {
    out.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  }
  return out;
}
function allGu(regions) {
  const out = [];
  for (const r of regions) for (const g of r.gu) out.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  return out;
}

/* ── 홈 ───────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, regions, counts, courses, latestPosts } = ctx;
  const path = '/';
  const url = `${siteUrl}/`;
  const seed = 'home';
  const minP = Math.min(...courses.map((c) => c.price));

  const front = `<section class="front" aria-label="${esc(cfg.brand.ko)} 접수 안내">
  <p class="front-k">${esc(cfg.brand.slogan)}</p>
  <p class="front-l">오실 매장이 없습니다. 전화를 받은 뒤 ${esc(cfg.arrive)} 안에 관리사가 적어 주신 주소로 갑니다. 시도 ${counts.sido}곳 · 시군구 ${counts.gu}곳 · 동읍 ${counts.spot}곳에 쪽을 두고, 면 ${counts.myeon}곳도 같은 창구로 받습니다.</p>
  ${telBtn(cfg, { size: 'l' })}
  <ul class="front-sg">
    <li><b>${esc(cfg.hours)}</b><span>밤낮 없이 창구가 열려 있습니다</span></li>
    <li><b>${esc(cfg.pay)}</b><span>일을 마친 그 방에서 치릅니다</span></li>
    <li><b>${won(minP)}원부터</b><span>새벽 할증도 이동비도 없습니다</span></li>
  </ul>
</section>`;

  const sidoGrid = block('sido', '지역', '사시는 지역을 고르십시오',
    `<ul class="sg-ul">${regions.map((r) => `<li class="sg">
      <a href="/${r.slug}/">
        <span class="sg-n">${esc(r.name)}</span>
        <span class="sg-m">시군구 ${r.gu.length} · 동읍 ${r.spotCount}</span>
        <span class="sg-g">${r.gu.slice(0, 4).map((g) => esc(g.name)).join(' · ')}${r.gu.length > 4 ? ` 외 ${r.gu.length - 4}` : ''}</span>
      </a></li>`).join('')}</ul>
     <p class="bk-tail">시도 → 시군구 → 동·읍 세 단계입니다. <a href="/area/">전체 목록</a>에서 한 번에 보실 수도 있습니다.</p>`,
    '구를 고르면 그 안에서 쪽을 둔 동·읍이 모두 나옵니다.', '01');

  const why = block('why', '방식', '이 사이트가 지역을 쪼개 둔 방식',
    `<div class="two">
      <div class="two-c"><h3>동·읍까지 내려갑니다</h3><p>시군구까지만 적어 두면 구 안의 거리 차이가 숨습니다. 가장 먼 두 거점 사이가 20km를 넘는 구도 있습니다. 그래서 동과 읍마다 쪽을 따로 두고 넓이·방위·가까운 거점까지의 거리를 적었습니다.</p></div>
      <div class="two-c"><h3>면은 이름으로 둡니다</h3><p>면은 마을이 흩어져 있어 쪽을 채울 고유한 사실이 나오지 않습니다. 대신 시군구 쪽 안에 이름을 모두 적었습니다. 접수는 똑같이 받고, 마을 이름을 들은 뒤 거리를 봅니다.</p></div>
      <div class="two-c"><h3>숫자는 계산해서 적었습니다</h3><p>공개된 행정동 경계 자료에서 면적과 무게중심을 계산하고, 거리는 구면 거리 공식으로 구했습니다. 손으로 적어 넣은 값이 아닙니다.</p></div>
      <div class="two-c"><h3>후기는 싣지 않습니다</h3><p>받은 적 없는 평점과 체험담을 적으면 거짓이 됩니다. 별점·평균 점수·사람 사진을 쓰지 않고, 확인할 수 있는 사실만 둡니다.</p></div>
    </div>`,
    null, '02');

  const nums = block('num', '요약', '한눈에',
    factTable([
      ['받는 시도', `${counts.sido}곳 — ${cfg.coverage.sido.join(' · ')}`],
      ['시군구', `${counts.gu}곳`],
      ['쪽을 둔 동·읍', `${counts.spot}곳 (동 ${counts.dong} · 읍 ${counts.eup})`],
      ['이름으로 적은 면', `${counts.myeon}곳`],
      ['코스', `${courses.length}가지 · ${won(minP)}원부터`],
      ['운영', `${esc(cfg.hours)} 열려 있음 · 값은 ${esc(cfg.pay)} · 문 앞까지 ${esc(cfg.arrive)}`],
      ['접수', '예약 문의 버튼(안심번호) 한 곳으로만 받습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, '전 지역', '지역'), 6, '06');

  const posts = block('post', '안내 글', '받기 전에 읽어 두면 좋은 글',
    `<ul class="pl-ul">${POSTS.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((p) => `<li class="pl">
      <a href="/magazine/${p.slug}/"><span class="pl-t">${esc(p.title)}</span><time datetime="${p.date}">${p.date}</time></a>
      <p class="pl-s">${esc(p.summary)}</p></li>`).join('')}</ul>`,
    '후기나 체험담이 아니라 설명입니다.', '07');

  const body = [
    front,
    sidoGrid,
    why,
    nums,
    courseGrid(courses, seed, '전 지역', '04'),
    stepList(seed, '05'),
    telCta(cfg, '사시는 동·읍', seed),
    faqHtml,
    posts,
    longtail(allSpots(regions), seed, 30, '자리', '동·읍별 안내', null, '08'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.home(),
      desc: clampDesc(desc.home(), 165),
      h1: `${esc(cfg.brand.ko)} <span class="ph-s">출장마사지·홈타이 ${cfg.coverage.sido.join('·')} 동·읍 ${counts.spot}곳</span>`,
      body,
      pageKind: 'home',
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${cfg.brand.ko} 출장마사지·홈타이 방문 관리`,
          desc: clampDesc(desc.home(), 165),
          areaServed: cfg.coverage.sido.map((s) => ({ '@type': 'AdministrativeArea', name: s })),
          courses,
        }),
        S.itemList(`${url}#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const path = '/area/';
  const url = `${siteUrl}${path}`;
  const seed = 'area';

  const lead = `<div class="open">
  <p>받는 자리를 전부 펴 두었습니다. 시도 ${counts.sido}곳, 시군구 ${counts.gu}곳, 쪽을 둔 동·읍 ${counts.spot}곳입니다.</p>
  <p>구 이름 아래에 그 구의 동·읍 개수와 넓이를 적었습니다. 이름을 누르면 그 자리의 중심점 좌표로 계산한 거리와 가까운 거점이 나옵니다.</p>
</div>`;

  const tree = regions.map((r) => `<section class="tr" aria-labelledby="tr-${r.slug}">
    <h2 class="tr-h" id="tr-${r.slug}"><a href="/${r.slug}/">${esc(r.name)}</a> <span class="tr-m">시군구 ${r.gu.length} · 동읍 ${r.spotCount} · 면 ${r.myeonCount}</span></h2>
    <ul class="tr-ul">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/">${esc(g.name)}</a> <span class="tr-s">${g.spotCount}곳 · ${km2(g.area)}</span></li>`).join('')}</ul>
  </section>`).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, '전 지역', '지역'), 4, '03');

  const body = [
    lead,
    block('tree', '전체', '시도별 시군구', tree, '구를 누르면 그 안에서 쪽을 둔 동·읍이 나옵니다.', '01'),
    telCta(cfg, '사시는 자리', seed),
    courseGrid(courses, seed, '전 지역', '02'),
    faqHtml,
    longtail(allSpots(regions), seed, 40, '자리', '동·읍 바로가기', null, '04'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `받는 지역 <span class="ph-s">시군구 ${counts.gu}곳 · 동읍 ${counts.spot}곳</span>`,
      body,
      pageKind: 'area',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '지역', url }],
      jsonld: [
        S.itemList(`${url}#list`, '받는 시군구', allGu(regions).map((x) => ({ name: x.label, url: `${siteUrl}${x.href}` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions, counts } = ctx;
  const path = '/course/';
  const url = `${siteUrl}${path}`;
  const seed = 'coursehub';
  const oil = courses.filter((c) => c.oil), dry = courses.filter((c) => !c.oil);

  const lead = `<div class="open">
  <p>코스는 ${courses.length}가지입니다. 고를 때 먼저 갈리는 것은 세기가 아니라 오일입니다 — 오일을 쓰면 마치고 씻어야 하고, 안 쓰면 옷을 그대로 입고 일어서면 됩니다.</p>
  <p>오일을 쓰는 쪽이 ${oil.length}가지(${oil.map((c) => esc(c.ko)).join(' · ')}), 쓰지 않는 쪽이 ${dry.length}가지(${dry.map((c) => esc(c.ko)).join(' · ')})입니다.</p>
  <p>어느 코스든 금액은 지역에 따라 달라지지 않습니다. 통화에서 불편한 자리만 말씀하셔도 맞춰 드립니다.</p>
</div>`;

  const table = block('tbl', '표', '아홉 가지를 한 표로',
    `<div class="scroll"><table class="tb">
      <caption>세기·시간·금액 비교</caption>
      <thead><tr><th scope="col">코스</th><th scope="col">시간</th><th scope="col">금액</th><th scope="col">세기</th><th scope="col">오일</th><th scope="col">손이 가는 자리</th></tr></thead>
      <tbody>${courses.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td><td>${esc(c.focus)}</td></tr>`).join('')}</tbody>
    </table></div>`,
    '사시는 자리로 시간이나 값이 달라지지 않습니다.', '01');

  const pickGuide = block('pick', '고르기', '이렇게 정하면 쉽습니다',
    `<dl class="pk-dl">
      ${[
        ['어디가 아픈지 집을 데가 없고 그냥 가라앉지 않는다', 'swedish'],
        ['한 자리가 또렷하게 집히고 몇 주째 그대로다', 'deep'],
        ['다리를 접고 펴는 폭이 좁아졌다', 'thai'],
        ['머리가 안 꺼져서 잠이 늦게 온다', 'aroma'],
        ['운동한 다음 날이고 다리가 무겁다', 'sports'],
        ['저녁이면 발목이 굵어지고 양말 자국이 남는다', 'lymph'],
        ['짧게 어깨만 풀고 바로 나가야 한다', 'dry'],
        ['화면을 오래 봐서 뒷머리가 당긴다', 'scalp'],
        ['서서 일하고 종아리가 단단하다', 'foot'],
      ].map(([q, slug]) => {
        const c = courses.find((x) => x.slug === slug);
        return `<div class="pk"><dt>${esc(q)}</dt><dd><a href="/course/${c.slug}/">${esc(c.ko)}</a> ${c.min}분 ${won(c.price)}원</dd></div>`;
      }).join('')}
    </dl>`,
    '아래 문장 가운데 가장 가까운 것을 고르십시오.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, '코스', '코스'), 5, '04');

  const body = [
    lead, table, pickGuide,
    telCta(cfg, '고르신 코스', seed),
    courseGrid(courses, seed, '전 지역', '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    longtail(allGu(regions), seed, 24, '지역', '지역별 안내', null, '06'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page(`코스 ${courses.length}가지 비교`),
      desc: clampDesc(`출장마사지 코스 ${courses.length}가지를 세기·시간·금액·오일 여부로 갈라 적었습니다. 시군구 ${counts.gu}곳 어디서든 같은 값이며, 무엇을 고를지 모르겠으면 통화에서 불편한 자리만 말씀하셔도 됩니다.`),
      h1: `코스 ${courses.length}가지 <span class="ph-s">세기 · 시간 · 금액 비교</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url }],
      jsonld: [
        S.itemList(`${url}#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 금액표 ───────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts } = ctx;
  const path = '/price/';
  const url = `${siteUrl}${path}`;
  const seed = 'price';
  const minP = Math.min(...courses.map((c) => c.price));
  const maxP = Math.max(...courses.map((c) => c.price));

  const lead = `<div class="open">
  <p>금액은 코스와 시간으로만 정해집니다. 지역·시간대·요일로 달라지지 않습니다. 가장 낮은 쪽이 ${won(minP)}원, 가장 높은 쪽이 ${won(maxP)}원입니다.</p>
  <p>계산은 마친 뒤에 합니다. 예약금·보증금·이동비를 미리 보내 달라고 하는 일이 없습니다.</p>
</div>`;

  const table = block('tbl', '표', '코스별 금액',
    `<div class="scroll"><table class="tb">
      <caption>기본 시간과 금액 (전 지역 같음)</caption>
      <thead><tr><th scope="col">코스</th><th scope="col">기본 시간</th><th scope="col">금액</th><th scope="col">10분 추가</th><th scope="col">세기</th></tr></thead>
      <tbody>${courses.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${won(Math.round(c.price / c.min * 10 / 1000) * 1000)}원</td><td>${esc(c.pressure)}</td></tr>`).join('')}</tbody>
    </table></div>`,
    '10분 추가는 기본 시간의 분당 값을 천 원 단위로 맞춘 금액입니다.', '01');

  const notAdd = block('notadd', '붙지 않는 것', '여기에 더 붙는 것이 없습니다',
    `<ul class="nx-ul">
      <li><b>심야 할증</b> — 새벽에 받으셔도 표에 적힌 금액 그대로입니다.</li>
      <li><b>이동비·출장비</b> — 시군구 끝이든 읍이든 같습니다. 거리로 더 받지 않습니다.</li>
      <li><b>주말·공휴일 할증</b> — 요일로 금액이 달라지지 않습니다.</li>
      <li><b>예약금·보증금</b> — 받지 않습니다. 먼저 입금해 달라는 연락이 온다면 저희 쪽 연락이 아닙니다.</li>
      <li><b>취소 위약금</b> — 두지 않았습니다. 출발 전에 알려 주시면 그걸로 끝입니다.</li>
      <li><b>재료비</b> — 오일·수건·매트는 관리사가 들고 갑니다.</li>
    </ul>`,
    null, '02');

  const how = block('how', '계산', '어떻게 계산합니까',
    factTable([
      ['때', '마친 뒤 그 자리에서'],
      ['방법', '현금 또는 계좌 이체'],
      ['시간을 늘린 경우', '늘어난 분량만 10분 단위로 더합니다'],
      ['두 사람이 함께', '사람 수만큼입니다. 묶음 할인을 따로 두지 않았습니다'],
      ['영수', '필요하다고 말씀하시면 드립니다'],
      ['지역차', '없습니다. 시군구 ' + counts.gu + '곳 모두 같은 표를 씁니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, '금액', '지역'), 5, '04');

  const body = [
    lead, table, notAdd, how,
    telCta(cfg, '금액 확인', seed),
    faqHtml,
    noticeBlock(seed, '05'),
    longtail(allGu(regions), seed, 24, '지역', '지역별 안내', null, '06'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('금액표'),
      desc: clampDesc(`출장마사지 코스별 금액표. ${won(minP)}원부터 ${won(maxP)}원까지이며 심야 할증·이동비·예약금·위약금이 없습니다. 계산은 마친 뒤에 하고 시군구 ${counts.gu}곳 모두 같은 표를 씁니다.`),
      h1: `금액표 <span class="ph-s">${won(minP)}원부터 · 후불 · 할증 없음</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '금액표', url }],
      jsonld: [
        S.service({
          siteUrl, url, cfg, name: '출장마사지·홈타이 코스 금액',
          desc: '코스별 기본 시간과 금액. 지역·시간대·요일로 달라지지 않는다.',
          areaServed: cfg.coverage.sido.map((s) => ({ '@type': 'AdministrativeArea', name: s })),
          courses,
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 이용안내 ─────────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const path = '/guide/';
  const url = `${siteUrl}${path}`;
  const seed = 'guide';

  const lead = `<div class="open">
  <p>접수에서 계산까지 어떤 순서로 되는지, 무엇을 준비하면 되는지, 어떤 경우에 접수를 돌려 드리는지를 모아 두었습니다.</p>
  <p>통화에서 정하는 것과 문 앞에서 맞추는 것을 갈라 적었습니다. 미리 읽어 두시면 통화가 1분이면 끝납니다.</p>
</div>`;

  const prep = block('prep', '준비', '미리 비워 두실 것',
    `<div class="two">
      <div class="two-c"><h3>자리 하나</h3><p>매트 한 장 펼 공간이면 됩니다. 침구를 따로 깔아 두실 필요가 없고, 좁은 방이어도 진행합니다. 바닥이 차면 그 말씀만 해 주십시오.</p></div>
      <div class="two-c"><h3>수건 한 장</h3><p>오일을 쓰는 코스라면 큰 것 하나를 꺼내 두시면 좋습니다. 깔개와 오일은 관리사 가방에 들어 있습니다.</p></div>
      <div class="two-c"><h3>들어가는 방법</h3><p>공동현관 번호나 지하 주차장 경로가 있으면 통화할 때 알려 주십시오. 문 앞에서 멈추는 시간이 사라집니다.</p></div>
      <div class="two-c"><h3>샤워</h3><p>오일을 쓰는 코스는 먼저 씻어 두시는 편이 낫습니다. 오일이 겉에 덜 뜨고 손이 고르게 지나갑니다.</p></div>
    </div>`,
    null, '01');

  const refuse = block('refuse', '돌려 드리는 경우', '접수를 받지 않는 경우',
    `<ul class="nx-ul">
      <li>술을 드신 상태일 때. 혈압이 오르고 본인 상태를 가늠하기 어려워집니다.</li>
      <li>열이 나거나 부딪힌 자리의 부기가 아직 남아 있을 때.</li>
      <li>임신 중일 때, 급성 염증이 있을 때.</li>
      <li>코스에 없는 요구를 하실 때. 그런 말이 나오면 관리사가 곧 정리하고 나옵니다.</li>
      <li>주소를 끝까지 말씀하지 않으실 때. 어디로 가는지 모르면 출발할 수 없습니다.</li>
      <li>관리사의 개인 연락처를 요구하실 때. 창구를 하나로 둔 뜻이 사라집니다.</li>
    </ul>`,
    '돌려 드릴 때도 왜 그런지 말씀드립니다.', '02');

  const atDoor = block('door', '문 앞', '문 앞에서 하는 것',
    `<ol class="sp-ol">
      <li class="sp"><span class="sp-n">1</span><div class="sp-b"><h3 class="sp-t">나설 때 연락</h3><p class="sp-d">출발하면 한 번 알려 드립니다. 그때부터 도착까지가 안내한 시각입니다.</p></div></li>
      <li class="sp"><span class="sp-n">2</span><div class="sp-b"><h3 class="sp-t">초인종 한 번</h3><p class="sp-d">두 번 누르지 않습니다. 안 열리면 전화를 걸지 않고 문 앞에서 기다립니다.</p></div></li>
      <li class="sp"><span class="sp-n">3</span><div class="sp-b"><h3 class="sp-t">방 안에서 펼치기</h3><p class="sp-d">짐은 복도에서 꺼내지 않습니다. 들어가 창을 닫고 불을 낮춘 뒤 자리를 잡습니다.</p></div></li>
      <li class="sp"><span class="sp-n">4</span><div class="sp-b"><h3 class="sp-t">세기와 순서 정하기</h3><p class="sp-d">어디부터 볼지와 세기를 먼저 맞춥니다. 시작하고 몇 분 뒤 한 번 더 여쭙습니다.</p></div></li>
      <li class="sp"><span class="sp-n">5</span><div class="sp-b"><h3 class="sp-t">마치고 계산</h3><p class="sp-d">정한 시간만큼 하고 그 자리에서 냅니다. 짐을 미리 챙겨 한 번에 나갑니다.</p></div></li>
    </ol>`,
    null, '03');

  const info = block('info', '요약', '운영 요약',
    factTable([
      ['받는 시간', esc(cfg.hours)],
      ['도착까지', `${esc(cfg.arrive)} (주소를 들은 뒤 다시 말씀드립니다)`],
      ['계산', `${esc(cfg.pay)} · 선입금 없음`],
      ['접수 창구', telBtn(cfg, { size: 'm' })],
      ['받는 자리', `시군구 ${counts.gu}곳 · 동읍 ${counts.spot}곳 · 면 ${counts.myeon}곳`],
      ['코스', `${courses.length}가지 · 자세한 것은 <a href="/course/">코스 안내</a>`],
      ['취소·변경', '위약금 없음. 출발 전이면 칸을 다시 잡습니다'],
    ]), null, '04');

  const { html: faqHtml, qa } = faqBlock(seed, faqCtx(ctx, '이용', '지역'), 6, '05');

  const body = [
    lead, prep, refuse, atDoor, info,
    telCta(cfg, '접수', seed),
    faqHtml,
    noticeBlock(seed, '06'),
    longtail(allGu(regions), seed, 24, '지역', '지역별 안내', null, '07'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('이용안내'),
      desc: clampDesc('접수에서 계산까지의 순서, 미리 비워 두실 것, 문 앞에서 하는 것, 접수를 돌려 드리는 경우를 모아 두었습니다. 통화에서 정하는 것과 현장에서 맞추는 것을 갈라 적었습니다.'),
      h1: `이용안내 <span class="ph-s">접수 · 도착 · 계산 · 변경</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용안내', url }],
      jsonld: [S.faqPage(url, qa)],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data, regions } = ctx;
  const path = '/company/';
  const url = `${siteUrl}${path}`;
  const seed = 'company';

  const lead = `<div class="open">
  <p>${esc(cfg.brand.ko)}는 매장을 두지 않고 관리사가 이용자 주소로 가는 방문 관리를 합니다. ${cfg.coverage.sido.join(' · ')}에서 접수하며, 받는 번호는 화면에 있는 하나뿐입니다.</p>
  <p>지키기로 정해 둔 선과, 화면에 적힌 숫자가 어디서 왔는지를 적어 둡니다.</p>
</div>`;

  const lines = block('line', '선', '지키기로 정해 둔 것',
    `<ol class="rl-ol">
      <li><h3>번호는 하나입니다</h3><p>안심번호 한 곳으로만 접수합니다. 관리사의 개인 번호를 주고받지 않으므로 끝난 뒤 사적인 연락이 갈 길이 없습니다. 다른 번호에서 걸려 왔다면 저희 쪽이 아닙니다.</p></li>
      <li><h3>코스에 적힌 것만 합니다</h3><p>성적 서비스를 제공하지 않습니다. 그런 요구가 나오면 관리사가 그 자리에서 정리하고 나옵니다. 돌아간 뒤 금액을 청구하지 않습니다.</p></li>
      <li><h3>의료 행위가 아닙니다</h3><p>질병을 고치거나 진단하지 않습니다. 아픈 데가 있으면 병원을 먼저 보셔야 하고, 치료 중인 부위가 있으면 그 자리를 빼고 구성합니다.</p></li>
      <li><h3>없는 평가를 적지 않습니다</h3><p>후기·체험담·별점·평균 점수를 싣지 않습니다. 사람 사진도 쓰지 않습니다 — 올려 둔 사람과 실제로 오는 사람이 다르면 그것도 거짓입니다.</p></li>
      <li><h3>금액을 숨기지 않습니다</h3><p>표에 적힌 금액 밖에 붙는 것이 없습니다. 심야·거리·요일로 올려 받지 않고, 선입금을 받지 않습니다.</p></li>
      <li><h3>소리를 줄입니다</h3><p>복도에서 짐을 꺼내지 않고 초인종을 한 번만 누릅니다. 가방에 상호를 적지 않습니다.</p></li>
    </ol>`,
    null, '01');

  const where = block('where', '출처', '화면의 숫자는 어디서 왔습니까',
    factTable([
      ['지역 이름·경계', esc(data.source)],
      ['자료 판', esc(data.version)],
      ['뽑은 범위', esc(data.coverageFrom)],
      ['면적·중심점', '경계 도형에서 계산(평면 근사 후 면적가중 무게중심)'],
      ['거점 사이 거리', '중심점 좌표로 구면 거리를 계산'],
      ['쪽을 둔 단위', `동 ${counts.dong} · 읍 ${counts.eup} = ${counts.spot}곳. 면 ${counts.myeon}곳은 이름만 적음`],
      ['갱신 표시', '쪽마다 글이 실제로 바뀐 날만 올라갑니다'],
    ]),
    '숫자를 손으로 적어 넣지 않았습니다. 자료가 바뀌면 다시 계산해 함께 바뀝니다.', '02');

  const ai = block('ai', '고지', 'AI 도구를 어떻게 썼습니까',
    `<p class="bk-p">지역 문장은 위 자료에서 계산해 나온 값을 틀에 넣어 만들고, 그 틀과 설명 글은 AI 도구의 도움을 받아 쓴 뒤 사람이 다시 읽어 고쳤습니다. 사람이나 공간을 지어낸 그림은 쓰지 않습니다. 화면에 있는 것은 글자와 도형뿐입니다.</p>
     <p class="bk-p">이 고지는 모든 쪽 아래에도 적어 두었습니다. 글에서 사실과 다른 것을 보시면 예약 문의 통화에서 말씀해 주십시오 — 고치고 그 쪽의 갱신 날짜를 올립니다.</p>`,
    null, '03');

  const body = [
    lead, lines, where, ai,
    telCta(cfg, '문의', seed),
    siteLinks(ctx, seed),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('소개'),
      desc: clampDesc(`${cfg.brand.ko}가 지키기로 정해 둔 선과, 화면에 적힌 지역 숫자가 어디서 왔는지를 적어 두었습니다. 후기·평점·사람 사진을 쓰지 않는 이유도 함께 밝힙니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="ph-s">지키는 선과 자료 출처</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const path = '/terms/';
  const url = `${siteUrl}${path}`;
  const A = [
    ['제1조 (무엇을 정한 글인가)', `이 약관은 ${cfg.brand.ko}(이하 "회사")가 제공하는 방문 관리 서비스를 이용할 때 회사와 이용자가 서로 무엇을 지키는지를 정한 것입니다. 전화로 접수하신 시점에 이 약관을 보신 것으로 봅니다.`],
    ['제2조 (말뜻)', '"방문 관리"는 관리사가 이용자가 알려 준 주소로 가서 정해진 코스를 진행하는 것을 말합니다. "접수"는 화면에 적힌 안심번호로 통화해 코스·시각·주소를 정하는 것을 말합니다. "거점"은 이 사이트가 쪽을 따로 둔 동 또는 읍을 말합니다.'],
    ['제3조 (접수 방법)', '접수는 화면의 예약 문의 버튼으로 이어지는 통화로만 받습니다. 문자·메신저·댓글·다른 번호로는 접수하지 않습니다. 통화에서 코스, 시각, 방문할 주소 세 가지를 정하면 접수가 된 것으로 봅니다.'],
    ['제4조 (시각 안내와 변경)', '회사는 통화에서 도착 시각을 숫자로 알려 드립니다. 길 사정으로 늦어지면 가는 중에 한 번 더 알려 드립니다. 이용자가 시각을 바꾸고자 하실 때 관리사가 출발하기 전이면 다시 잡아 드리고, 이미 출발했으면 어디쯤 왔는지 알려 드린 뒤 상의해서 정합니다.'],
    ['제5조 (취소)', '취소 위약금을 두지 않습니다. 출발 전에 알려 주시면 그것으로 끝이며 어떤 금액도 청구하지 않습니다. 다만 관리사가 문 앞에 닿은 뒤 아무도 없거나 연락이 닿지 않으면 그 요청은 끝난 것으로 봅니다.'],
    ['제6조 (금액과 계산)', '금액은 코스와 시간으로만 정해지며 금액표에 적힌 것이 전부입니다. 심야·거리·요일로 올려 받지 않습니다. 계산은 마친 뒤 현장에서 하고, 회사는 예약금·보증금·이동비를 미리 받지 않습니다. 선입금을 요구하는 연락은 회사의 것이 아닙니다.'],
    ['제7조 (회사가 하지 않는 것)', '회사는 성적 서비스를 제공하지 않습니다. 또한 질병을 진단하거나 치료하는 의료 행위를 하지 않습니다. 코스에 적히지 않은 요구를 받으면 관리사는 그 자리에서 진행을 멈추고 나올 수 있으며, 이 경우 회사는 해당 요청에 대한 금액을 청구하지 않습니다.'],
    ['제8조 (받지 않는 경우)', '음주 상태, 발열, 다친 자리의 부기가 남아 있는 상태, 임신 중, 급성 염증이 있는 상태에서는 접수를 받지 않거나 진행을 미룹니다. 주소를 끝까지 알려 주지 않으시는 경우, 관리사의 개인 연락처를 요구하시는 경우에도 접수를 받지 않습니다.'],
    ['제9조 (이용자가 알려 주실 것)', '수술받은 자리, 치료 중인 부위, 특정 성분에 대한 반응이 있으면 접수할 때 알려 주셔야 합니다. 알려 주시지 않아 생긴 일에 대해 회사는 책임지기 어렵습니다. 세기가 맞지 않으면 참지 말고 바로 말씀해 주십시오.'],
    ['제10조 (관리사 보호)', '관리사의 사진을 찍거나 개인 연락처를 묻는 일은 할 수 없습니다. 접수 창구를 안심번호 하나로 둔 것도 같은 이유입니다. 신체 접촉이나 말로 관리사를 위협하는 경우 진행을 즉시 멈추고 이후 접수를 받지 않을 수 있습니다.'],
    ['제11조 (책임의 한계)', '회사는 코스에 적힌 범위에서 성실히 진행합니다. 다만 이용자의 체질이나 알려 주지 않은 건강 상태에서 비롯한 결과, 천재지변·교통 통제처럼 회사가 어찌할 수 없는 사정으로 늦어진 것에 대해서는 책임이 제한됩니다. 회사의 잘못으로 진행이 되지 않았다면 금액을 받지 않습니다.'],
    ['제12조 (약관이 바뀔 때)', '약관을 고치면 이 쪽에 바뀐 내용과 날짜를 적습니다. 바뀐 뒤에 접수하신 분께는 바뀐 약관이 적용되고, 이미 잡아 둔 요청에는 접수하신 때의 약관이 적용됩니다.'],
    ['제13조 (분쟁)', '회사와 이용자 사이에 다툼이 생기면 먼저 안심번호 통화로 사실을 맞춰 보는 것을 원칙으로 합니다. 그래도 풀리지 않으면 대한민국 법을 따르고, 관할은 민사소송법이 정한 법원으로 합니다.'],
  ];
  const body = `<div class="open"><p>접수하시기 전에 한 번 읽어 보시기를 권합니다. 어려운 말을 줄이고 실제로 일어나는 순서대로 적었습니다.</p></div>
${block('terms', '약관', '이용약관', `<ol class="law-ol">${A.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>`, `${A.length}개 조문입니다. 마지막으로 고친 날은 쪽 아래에 적혀 있습니다.`, '01')}
${siteLinks(ctx, 'terms')}`;

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 방문 관리 서비스 이용약관 ${A.length}개 조문. 접수 방법, 시각 변경, 취소, 금액과 계산, 회사가 하지 않는 것, 받지 않는 경우를 적었습니다.`),
      h1: `이용약관 <span class="ph-s">${A.length}개 조문</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const path = '/privacy/';
  const url = `${siteUrl}${path}`;
  const b = cfg.business;
  const A = [
    ['1. 받는 것', '접수 통화에서 받는 것은 셋입니다 — 연락받을 번호, 방문할 주소, 정하신 코스와 시각입니다. 이 밖에 주민등록번호·계좌·직장 같은 것은 받지 않습니다. 회원가입을 두지 않았으므로 아이디나 비밀번호도 없습니다.'],
    ['2. 왜 받는가', '주소는 어디로 갈지 정하기 위해, 번호는 출발과 도착을 알리고 시각이 어긋났을 때 연락하기 위해, 코스와 시각은 그 요청을 준비하기 위해 받습니다. 그 밖의 목적으로 쓰지 않습니다.'],
    ['3. 얼마나 두는가', '요청이 끝나고 다툼이 생길 수 있는 기간이 지나면 지웁니다. 같은 분이 다시 부르실 때 조건을 맞추기 위해 번호와 지난 코스만 남겨 두며, 이 또한 그만 두기를 원하신다고 말씀하시면 지웁니다.'],
    ['4. 번호가 어떻게 다루어지는가', '화면에 적힌 번호는 안심번호입니다. 통화는 중간에서 한 번 돌려 주는 방식이라 양쪽 실제 번호가 서로에게 남지 않습니다. 관리사에게는 그날 가야 할 주소와 시각만 전달하고, 이용자의 번호를 넘기지 않습니다.'],
    ['5. 누구에게도 팔지 않습니다', '받은 것을 다른 곳에 팔거나 넘기지 않습니다. 법이 정한 절차에 따라 수사기관이 요구하는 경우에만 그 범위에서 제공하며, 그때도 요구받은 것 이상은 내놓지 않습니다.'],
    ['6. 이용자가 할 수 있는 것', '무엇이 남아 있는지 묻고, 틀린 것을 고치고, 지워 달라고 하실 수 있습니다. 화면의 예약 문의 통화로 말씀하시면 처리하고 결과를 알려 드립니다. 대리인을 통해서도 하실 수 있습니다.'],
    ['7. 쿠키와 추적', '이 사이트는 로그인·장바구니·댓글을 두지 않아 쿠키를 쓰지 않습니다. 광고 추적 코드와 외부 분석 스크립트를 넣지 않았으며, 바깥에서 불러오는 글꼴이나 이미지도 없습니다. 눌러 보신 쪽이 어디인지 저희가 알 수 없습니다.'],
    ['8. 어린이', '만 14세 미만인 분의 접수는 받지 않습니다. 보호자 동의를 확인할 방법을 두지 않았기 때문입니다.'],
    ['9. 지키는 방법', '종이에 적어 둔 기록은 잠그는 곳에 두고, 전자 기록은 접근할 수 있는 사람을 접수 담당자로 제한합니다. 사이트는 전부 암호화된 연결로만 제공되며, 글을 올리거나 보내는 입력 칸을 두지 않았습니다.'],
    ['10. 바뀔 때와 책임자', `방침을 고치면 이 쪽에 바뀐 내용과 날짜를 적습니다. ${b.privacyOfficer ? `개인정보 책임자는 ${b.privacyOfficer}입니다.` : '개인정보 책임자는 확정되는 대로 이 자리에 적습니다.'} 지금은 예약 문의 통화가 유일한 창구이며, 그 통화로 말씀하시면 책임자에게 전달됩니다.`],
  ];
  const body = `<div class="open"><p>받는 것이 적습니다. 회원가입·게시판·결제 창구를 두지 않았기 때문에, 남는 것은 접수 통화에서 들은 세 가지뿐입니다.</p></div>
${block('pp', '방침', '개인정보처리방침', `<ol class="law-ol">${A.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>`, `${A.length}개 항목입니다. 마지막으로 고친 날은 쪽 아래에 적혀 있습니다.`, '01')}
${siteLinks(ctx, 'privacy')}`;

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 받는 것은 연락받을 번호와 방문할 주소, 정하신 코스와 시각뿐입니다. 쿠키와 외부 추적 코드를 쓰지 않고, 받은 것을 팔거나 넘기지 않습니다.'),
      h1: `개인정보처리방침 <span class="ph-s">받는 것 · 두는 기간 · 지우는 방법</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url }],
    }),
  };
}

/* ── 안내 글 목록 ─────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const path = '/magazine/';
  const url = `${siteUrl}${path}`;
  const seed = 'magazine';
  const sorted = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));

  const lead = `<div class="open">
  <p>읽어 두면 통화가 짧아지는 설명만 모아 둡니다. 후기·체험담·평점은 올리지 않습니다 — 받은 적 없는 평가를 적는 것은 거짓이기 때문입니다.</p>
  <p>글은 ${POSTS.length}편이고, <a href="/rss.xml">RSS</a>로도 받아 보실 수 있습니다.</p>
</div>`;

  const list = block('list', '목록', `안내 글 ${POSTS.length}편`,
    `<ul class="pl-ul">${sorted.map((p) => `<li class="pl">
      <a href="/magazine/${p.slug}/"><span class="pl-t">${esc(p.title)}</span><time datetime="${p.date}">${p.date}</time></a>
      <p class="pl-s">${esc(p.summary)}</p></li>`).join('')}</ul>`,
    '새 글은 위에 붙습니다.', '01');

  const body = [lead, list, telCta(cfg, '접수', seed), longtail(allGu(regions), seed, 20, '지역', '지역별 안내', null, '02')].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page(`안내 글 ${POSTS.length}편`),
      desc: clampDesc(`${cfg.brand.ko}가 적어 두는 방문 관리 안내 글 ${POSTS.length}편. 심야 접수, 소리를 줄이는 방문, 동·읍 단위로 쪼개 둔 까닭, 오일을 쓰는 코스와 안 쓰는 코스를 다룹니다.`),
      h1: `안내 글 <span class="ph-s">${POSTS.length}편 · 후기 아님</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '안내 글', url }],
      jsonld: [S.itemList(`${url}#list`, '안내 글', sorted.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` })))],
    }),
  };
}

/* ── 글 한 편 ─────────────────────────────────────────────────── */
export function postPage(ctx, p) {
  const { cfg, siteUrl, regions } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `post/${p.slug}`;
  const sorted = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const others = sorted.filter((x) => x.slug !== p.slug).slice(0, 4);

  const article = p.body.map((n) => {
    if (typeof n === 'string') return `<p>${esc(n)}</p>`;
    if (n[0] === 'h3') return `<h3>${esc(n[1])}</h3>`;
    if (n[0] === 'ul') return `<ul>${n[1].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    return '';
  }).join('\n');

  const body = [
    `<p class="pm"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 안내 글</p>`,
    `<article class="art">${article}</article>`,
    telCta(cfg, '접수', seed),
    block('more', '다른 글', '다른 안내 글',
      `<ul class="pl-ul">${others.map((x) => `<li class="pl"><a href="/magazine/${x.slug}/"><span class="pl-t">${esc(x.title)}</span><time datetime="${x.date}">${x.date}</time></a><p class="pl-s">${esc(x.summary)}</p></li>`).join('')}</ul>`,
      null, '01'),
    longtail(allGu(regions), seed, 20, '지역', '지역별 안내', null, '02'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(p.summary),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '안내 글', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions, counts } = ctx;
  const path = '/404.html';
  return {
    path,
    html: layout(ctx, {
      path,
      title: title.page('없는 쪽입니다'),
      desc: '주소가 바뀌었거나 없는 쪽입니다. 아래에서 지역이나 코스를 골라 주십시오.',
      h1: `없는 쪽입니다 <span class="ph-s">주소를 다시 확인해 주십시오</span>`,
      noindex: true,
      body: [
        `<div class="open"><p>찾으시는 쪽이 없습니다. 지역 쪽은 <code>/시도/시군구/동읍/</code> 꼴이고, 코스 쪽은 <code>/course/코스/</code> 꼴입니다.</p></div>`,
        block('go', '바로가기', '여기서 고르십시오',
          `<ul class="lk-ul">
            <li><a href="/">처음으로</a></li>
            <li><a href="/area/">전체 지역 (시군구 ${counts.gu}곳)</a></li>
            <li><a href="/course/">코스</a></li>
            <li><a href="/price/">금액표</a></li>
            <li><a href="/guide/">이용안내</a></li>
            ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}
          </ul>`, null, '01'),
        telCta(cfg, '접수', '404'),
      ].join('\n'),
      pageKind: '404',
    }),
  };
}
