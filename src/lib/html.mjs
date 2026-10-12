import { esc } from './util.mjs';
import * as S from './schema.mjs';

export const ASSET_V = '1';

/**
 * 공통 레이아웃.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   푸터  — 네이버 C랭크 4신호(출처·최신성·수집 경로·정보량) + AI 활용 고지
 *
 * ★전화번호는 **telBtn() 으로만** 찍는다. 번호만 덩그러니 적힌 자리가 생기면 안 된다
 *   (지시: 안심번호 옆에 '예약 문의'를 늘 적고 버튼으로 만든다). 번호를 직접 문자열로
 *   쓰는 곳이 없어야 하고, 검사도구가 그걸 본다(scripts/check.mjs '맨 번호' 항목).
 *
 * ★골격은 앞서 만든 두 사이트와 겹치지 않게 짰다.
 *   루네사      : 둥근 점머리 · 알약 버튼 · 4열 푸터
 *   리바이브모션: 왼쪽 눈금 레일 + 모노 순번 · 각진 판(radius 0) · 4열 푸터
 *   세린터치    : 대괄호 머리표 `[ 01 · 코스 ]` · 점선 가름 · 둥근 블록(14px) ·
 *                 머리띠 두 줄(위 상호+버튼 / 아래 칩 메뉴) · 3열 푸터
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, bodyClass = '', pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/serene.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body class="${bodyClass}" data-kind="${pageKind}">
<a class="skip" href="#main">본문으로 건너뛰기</a>
${header(ctx, path)}
${crumbs.length > 1 ? crumbHtml(crumbs) : ''}
<main id="main">
<h1 class="ph">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${callbar(cfg)}
<script src="/assets/serene.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── 예약 문의 버튼 ────────────────────────────────────────────────
   안심번호 옆에 '예약 문의'가 **늘 붙어 있어야 한다**. 모양은 버튼이지만
   `<a href="tel:">` 로 둔다 — <button> 이면 자바스크립트 없이는 아무 일도
   일어나지 않고, 눌렀을 때 바로 통화로 넘어가야 하기 때문이다.
   size: s(머리띠) · m(본문) · l(대문) */
export function telBtn(cfg, { size = 'm', note = true, block = false } = {}) {
  return `<a class="rb rb-${size}${block ? ' rb-b' : ''}" href="tel:${cfg.telRaw}">
  <span class="rb-badge" aria-hidden="true">${phoneMark()}</span>
  <span class="rb-body"><span class="rb-label">${esc(cfg.telLabel)}</span><span class="rb-num">${esc(cfg.tel)}</span></span>
  ${note ? `<span class="rb-note">${esc(cfg.telNote)}</span>` : ''}
</a>`;
}

/** 머리띠 — 위 줄 상호+버튼, 아래 줄 칩 메뉴(가로 스크롤) */
function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  return `<header class="tp">
  <div class="tp-r1">
    <a class="mark" href="/" aria-label="${esc(cfg.brand.ko)} 처음으로">
      ${doorMark()}<span class="mark-t"><b>${esc(cfg.brand.ko)}</b><i>${esc(cfg.brand.en)}</i></span>
    </a>
    ${telBtn(cfg, { size: 's', note: false })}
  </div>
  <nav class="tp-r2" aria-label="주요 메뉴">
    <a class="chip" href="/area/"${on('/area/')}>지역</a>
    <a class="chip" href="/course/"${on('/course/')}>코스</a>
    <a class="chip" href="/price/"${on('/price/')}>금액</a>
    <a class="chip" href="/guide/"${on('/guide/')}>이용안내</a>
    <a class="chip" href="/magazine/"${on('/magazine/')}>안내 글</a>
    <a class="chip" href="/company/"${on('/company/')}>소개</a>
  </nav>
</header>`;
}

function crumbHtml(crumbs) {
  return `<nav class="trail" aria-label="현재 위치"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 푸터 = 네이버 C랭크 4신호 + AI 고지. 3열 + 아래 넓은 띠. */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business;
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 책임자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');

  return `<footer class="bt">
  <div class="bt-top">
    <div class="bt-say">
      <p class="bt-h">${esc(cfg.brand.ko)}</p>
      <p class="bt-p">매장을 두지 않습니다. 관리사가 이용자 주소로 가며, 시도 ${counts.sido}곳 · 시군구 ${counts.gu}곳 · 동읍 ${counts.spot}곳에 쪽을 두었습니다. 받는 번호는 아래 하나뿐입니다.</p>
      ${telBtn(cfg, { size: 'm' })}
      <p class="bt-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 선입금 없음</p>
      ${biz ? `<p class="bt-biz">${biz}</p>` : '<p class="bt-biz bt-dim">사업자 정보는 확인되는 대로 이 자리에 적습니다.</p>'}
    </div>
    <nav class="bt-col" aria-label="지역 바로가기">
      <p class="bt-h">지역</p>
      <ul class="bt-ul bt-grid">${regions.map((r) => `<li><a href="/${r.slug}/">${r.name}</a></li>`).join('')}</ul>
      <p class="bt-sm"><a href="/area/">시군구 ${counts.gu}곳 전체</a> · 동읍 ${counts.spot}곳 · 면 ${counts.myeon}곳</p>
    </nav>
    <nav class="bt-col" aria-label="안내 문서와 수집 경로">
      <p class="bt-h">안내</p>
      <ul class="bt-ul">
        <li><a href="/guide/">이용안내</a></li>
        <li><a href="/price/">금액표</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/company/">소개</a></li>
        <li><a href="/terms/">이용약관</a></li>
        <li><a href="/privacy/">개인정보처리방침</a></li>
      </ul>
      <p class="bt-h bt-h2">최근 글</p>
      <ul class="bt-ul bt-post">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      <ul class="bt-ul bt-feed">
        <li><a href="/rss.xml">RSS</a></li>
        <li><a href="/sitemap.xml">사이트맵</a></li>
        <li><a href="/llms.txt">llms.txt</a></li>
      </ul>
      <p class="bt-sm">마지막 갱신 <time datetime="@@LM@@">@@LM@@</time></p>
    </nav>
  </div>
  <div class="bt-end">
    <p class="bt-ai">이 사이트의 지역 문장은 공개 행정동 경계 자료(중심점 좌표·면적·거점 사이 실거리)를 계산해 <strong>AI 도구의 도움을 받아 쓰고</strong> 사람이 다시 읽어 고쳤습니다. 후기·체험담·평점은 싣지 않고 사람 사진도 쓰지 않습니다. 경계 자료 출처: ${esc(data.source)}</p>
    <p class="bt-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 질병을 치료하는 의료 행위가 아니며, 성적 서비스를 제공하지 않습니다.</p>
  </div>
</footer>`;
}

/** 모바일 하단 고정 바 — 여기도 '예약 문의'가 번호 옆에 붙는다. */
function callbar(cfg) {
  return `<div class="dock">
  ${telBtn(cfg, { size: 'l', note: true, block: true })}
  <span class="dock-s">${esc(cfg.hours)} · ${esc(cfg.pay)}</span>
</div>`;
}

/** 로고 — 닫힌 문과 손잡이. 달(루네사)·움직임 호(리바이브모션)와 겹치지 않는 모양. */
export function doorMark() {
  return `<svg class="mk" viewBox="0 0 24 26" aria-hidden="true" focusable="false"><rect x="3.2" y="2.2" width="17.6" height="21.6" rx="3.2" fill="none" stroke-width="2"/><circle cx="16.4" cy="13" r="1.5"/><path d="M7.2 7.6h5.6M7.2 18.4h5.6" fill="none" stroke-width="1.4" stroke-linecap="round" opacity=".5"/></svg>`;
}
function phoneMark() {
  return `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4.2 1.6 6 1.2l1.5 3.3-1.6 1.2c.6 1.7 2 3.1 3.7 3.7l1.2-1.6 3.3 1.5-.4 1.8c-.2.8-.9 1.3-1.7 1.2C7.6 11.8 4.1 8.3 3 3.3c-.1-.8.4-1.5 1.2-1.7Z"/></svg>`;
}

/**
 * 섹션 틀 — 대괄호 머리표가 이 사이트의 표시다.
 *   [ 01 · 코스 ]
 *   큰 제목
 *   작은 부제
 */
export function block(id, kicker, h2, inner, sub, n) {
  return `<section class="bk" id="${id}" aria-labelledby="${id}-h">
  <header class="bk-h">
    <p class="bk-kk" aria-hidden="true">${n ? `${n} · ` : ''}${esc(kicker)}</p>
    <h2 id="${id}-h">${h2}</h2>
    ${sub ? `<p class="bk-sb">${sub}</p>` : ''}
  </header>
  ${inner}
</section>`;
}
