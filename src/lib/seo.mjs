/**
 * 타이틀·디스크립션 정본.
 *
 * ★앞서 만든 두 사이트와 **토막 모양 자체를 갈라 둔다.** 같은 뼈대에 단어만 바꾸면
 *   그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *   가운데 이음은 `·`, 브랜드 앞만 `|` 로 둔다. 셋이 서로 다른 구두점 모양이 된다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 *
 * 디스크립션은 **가운데 문장을 그 자리의 실측값으로 채운다.** 경쟁사 설명이
 * 둘째·셋째 문장을 글자까지 돌려 쓰는 약점을 피하려는 것이다.
 */
import { hash, km, km2, dirWord, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '세린터치';
const KEY = '출장마사지·홈타이 방문 관리';

/** 제목 가운데 끼우는 코스어 — 실제로 받는 아홉 가지에서만 돌린다. */
const COURSE_WORD = ['스웨디시', '아로마', '타이', '딥티슈', '스포츠', '림프', '건식', '두피', '발마사지'];
/** 제목 꼬리 행동어 */
const ACT = ['야간 접수', '시간표 확인', '바로 접수', '방문 안내', '새벽 접수'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} 출장마사지 홈타이 · 대구·광주·대전·울산·경북·경남 동읍 방문 관리 24시`,
  areaHub: (c) => `동·읍 ${c.spot}곳 출장마사지 지역 목록 · 시군구 ${c.gu}곳 홈타이 방문 | ${BRAND}`,
  sido: (sd) => `${sd.name} 출장마사지 홈타이 · ${sd.name} 동읍 ${sd.spotCount}곳 방문 접수 | ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    return `${g.name} 출장마사지 홈타이 · ${sd.name} ${g.name} 동읍 ${g.spotCount}곳 방문 ${at(h, ACT, 0)} | ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} 출장마사지 홈타이 ${at(h, COURSE_WORD, 0)} · ${g.name} ${s.name} 방문 ${at(h, ACT, 1)} | ${BRAND}`;
  },
  course: (c) => `${c.ko} 출장마사지 홈타이 · ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 세기 ${c.pressure} | ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} 출장마사지 · ${sd.name} 홈타이 방문 ${at(hash(sd.name, c.slug), ACT)} | ${BRAND}`,
  page: (t) => `${t} · ${BRAND} 출장마사지 홈타이`,
  post: (p) => `${p.title} · ${BRAND} 방문 안내`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 거점 설명 가운데 문장 — 그 동·읍에서만 나오는 숫자로 짠다. */
function spotMiddle(sd, g, s, h) {
  const n0 = s.near[0], n1 = s.near[1];
  const frames = [
    () => `${km2(s.area)} 자리로 ${g.name} 중심에서 ${km(s.kmFromGu)} ${dirWord(s.dir)}`,
    () => `${n0.name}까지 ${km(n0.km)}, ${n1.name}까지 ${km(n1.km)}인 자리`,
    () => `${g.name} 거점 ${g.spotCount}곳 가운데 ${s.areaRank}번째로 넓은 ${km2(s.area)}`,
    () => `${g.name} ${dirWord(s.dir)}이라 ${n0.name} 쪽에서 들어갑니다`,
    () => `${s.kind === '읍' ? `${g.name}의 중심 읍이고 둘레는 면 ${g.myeonCount}곳` : `${km2(s.area)}에 ${n0.name}과 ${km(n0.km)} 거리`}`,
    () => `${g.name} 중심에서 ${km(s.kmFromGu)}, 가까운 ${n0.name}까지 ${km(n0.km)}`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '예약 문의 버튼으로 접수하고 마친 뒤 계산합니다',
  '안심번호 한 통으로 칸을 잡고 선입금 없이 받습니다',
  '24시간 사람이 받고 심야 할증을 두지 않습니다',
  '이동비를 따로 붙이지 않고 후불로 받습니다',
  '밤낮 없이 접수하며 금액은 어느 자리든 같습니다',
];

export const desc = {
  home: () =>
    '대구·광주·대전·울산·경북·경남 동·읍 626곳 출장마사지·홈타이 방문 관리. 사시는 동이나 읍을 눌러 넓이와 가까운 거점까지의 거리를 먼저 확인하고, 안심번호로 칸을 잡아 마친 뒤 계산하십시오.',
  areaHub: (c) =>
    `출장마사지·홈타이를 받는 동·읍 ${c.spot}곳을 시도와 시군구별로 펼쳐 두었습니다. 자리마다 넓이와 방위, 가까운 거점까지의 거리를 적어 시각이 왜 다른지 알 수 있게 했습니다.`,
  sido: (sd) =>
    `${sd.name} ${KEY} 안내. 시군구 ${sd.gu.length}곳·동읍 ${sd.spotCount}곳에 쪽을 두고 면 ${sd.myeonCount}곳도 같은 번호로 받습니다. 후불이고 24시간 사람이 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const n0 = g.near[0];
    const mid = [
      `동·읍 ${g.spotCount}곳에 쪽을 두었고 넓이는 ${km2(g.area)}`,
      `${g.dir === '중앙' ? `${sd.name} 가운데` : `${sd.name} ${dirWord(g.dir)}`}이고 끝과 끝이 ${km(g.spanKm)}`,
      `행정동 ${g.dongCount}곳 가운데 ${g.spotCount}곳에 쪽을 두고 ${n0.gu}까지 ${km(n0.km)}`,
      `${km2(g.area)}에 거점 ${g.spotCount}곳, ${sd.name} 중심에서 ${km(g.kmFromCenter)}`,
    ][parseInt(h.substr(3, 3), 16) % 4];
    return `${sd.name} ${g.name} ${KEY}. ${mid}. ${TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length]}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY}. ${spotMiddle(sd, g, s, h)}. ${TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length]}.`;
  },
  course: (c) =>
    `${c.ko} 출장마사지 방문 안내. ${c.focus}에 시간을 쓰고 세기는 ${c.pressure}, 속도는 ${c.tempo}${josa(c.tempo, '으로/로')} 둡니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원이며 어느 동·읍에서도 같은 값입니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY}. ${c.for} 고르는 코스로 ${c.focus}${josa(c.focus, '을/를')} 봅니다. ${sd.name} 동·읍 ${sd.spotCount}곳 전부 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원입니다.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘기면 문장 단위로 자른다. */
export function clampDesc(s, limit = 155) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
