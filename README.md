# 세린터치 (SereneTouch)

대구·광주·대전·울산·경북·경남 **동·읍 626곳**을 대상으로 하는 출장마사지·홈타이
방문 관리 안내 사이트. 의존성 없는 Node 정적 생성기(SSG)로 만들고 Netlify 에 올린다.

- 운영 주소 `https://serenetouch-kr.netlify.app`
- 저장소 `github.com/a9sta/SereneTouch`
- 작업 폴더 `/data/wwwroot/serenetouch`

```
npm run regions   # 행정동 경계 geojson → data/regions.json (자료가 바뀔 때만)
npm run build     # dist/ 생성
npm run check     # 14종 자체 검사(실패하면 종료코드 1)
npm run simil     # 동·읍 페이지끼리 본문 겹침 비율
npm run serve     # http://127.0.0.1:8788 미리보기
```

## 쪽 구성 (781장)

| 층 | 경로 | 장수 |
|---|---|---|
| 홈 | `/` | 1 |
| 지역 허브 | `/area/` | 1 |
| 안내 문서 | `/guide/` `/price/` `/course/` `/company/` `/terms/` `/privacy/` | 6 |
| 안내 글 | `/magazine/` + 7편 | 8 |
| 코스 | `/course/{코스}/` | 9 |
| 시도 | `/{시도}/` | 6 |
| 시도 × 코스 | `/{시도}/course/{코스}/` | 54 |
| 시군구 | `/{시도}/{시군구}/` | 69 |
| **동·읍** | `/{시도}/{시군구}/{동읍}/` | **626** |
| 404 | `/404.html` | 1 |

### 만들지 않는 조합
- **동·읍 × 코스** (626 × 9 = 5,634) — 자리가 달라져도 코스 설명이 같아 전부 얇은
  조합 페이지가 된다. 시도 단위까지만 내려간다.
- **면** (383곳) — 마을이 흩어져 있어 한 쪽을 채울 고유한 사실이 나오지 않는다.
  시군구 쪽 안에 이름을 모두 적어 검색어는 받는다(접수는 똑같이 받는다).

## 지역 자료

`admdongkor` `HangJeongDong_ver20260701`(CC BY 4.0)에서 여섯 시도를 뽑아
`scripts/build-regions.mjs` 로 `data/regions.json` 을 만든다. 계산해서 뽑는 값:

- 동·읍: 면적가중 중심점 좌표 · 면적 · 시군구 안 면적 순위 · 시군구 중심에서의
  방위와 거리 · **거리순 가까운 거점 6곳**(시군구를 넘어가도 거리로 본다)
- 시군구: 중심점 · 면적 · 행정동 수 · 거점 수 · 면 목록 · 가장 먼 두 거점 사이 거리 ·
  가까운 시군구 5곳
- 시도: 중심점 · 면적 · 구별 방위·면적 순위·중심에서의 거리

실측 규모 — 시도 6 · 시군구 69 · 거점 626(동 554 + 읍 72) · 면 383 · 행정동 합 1,009.

## 지켜야 하는 규칙 (코드에 박아 둔 것)

1. **안심번호 옆에는 늘 '예약 문의'** — 번호는 `telBtn()` 한 곳에서만 찍는다.
   검사 11번이 ①버튼 밖 맨 번호 0 ②모든 `tel:` 링크에 '예약 문의' ③전 페이지에 버튼
   1개 이상을 본다. 산문에서 번호를 가리킬 때는 숫자 대신 '안심번호'라고 쓴다.
2. **같은 주소 = 같은 응답** — 출력에 `new Date()` 를 쓰지 않는다(RSS `lastBuildDate`
   조차 글 발행일에서 뽑는다). 두 번 빌드해 `dist` 해시가 같은지 본다.
3. **거짓 신선도 금지** — `data/lastmod.json` 에 쪽별 본문 해시를 남겨, 실제로 바뀐
   쪽만 날짜가 올라간다. 이 파일은 **반드시 커밋한다**.
4. **후기·체험담·평점·사람 사진 없음** — JSON-LD 에 `aggregateRating`·`review` 를
   넣지 않고 `LocalBusiness`(주소 필요)도 쓰지 않는다.
5. **푸터 AI 활용 고지** — 전 페이지 공통 푸터에 들어간다.
6. **문구 중복 0** — 루네사·리바이브모션과 문장·골격이 겹치면 안 된다.
   `netlify-dupcheck.py` / `netlify-skelcheck.py` / `phrase-check.py` 로 본다.

## 색인

- `sitemap.xml`(색인) + `sitemap-core.xml` + 시도별 6장 + `sitemap-latest.xml`
- `robots.txt` 는 **Yeti / Yeti-Mobile / \*** 세 그룹에 같은 규칙을 적는다
  (Yeti 그룹이 있으면 Yeti 는 `*` 를 통째로 무시한다). `Crawl-delay` 는 적지 않는다.
- IndexNow 키 파일 `1e40ff14d8ef22e31e5b4b5d52559b31.txt` 를 빌드가 루트에 떨어뜨린다.
  통보는 서버의 `/root/jwseo/extra_indexnow.py` 가 4시간 크론으로 돌린다.
- `llms.txt` 에 사실 요약과 자료 출처를 적어 둔다.

## 배포

`netlify.toml` 은 깃 연동 빌드에서만 읽힌다. zip 을 직접 올리는 배포에서는 빌드가
떨어뜨리는 `dist/_headers` · `dist/_redirects` 가 같은 일을 한다.
