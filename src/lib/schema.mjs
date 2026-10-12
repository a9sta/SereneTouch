/**
 * 구조화 데이터. 전 페이지에 Organization + WebSite + BreadcrumbList + WebPage 를
 * 깔고, 계층별로 Service · Place · ItemList · FAQPage 를 더한다.
 *
 * ★LocalBusiness 를 쓰지 않는다. 매장 주소가 없는 방문(출장) 사업인데
 *   LocalBusiness 는 address 를 요구한다. 주소를 지어내면 그 자체가 허위 신호다.
 *   대신 Organization(주체) · Service(areaServed) · Place(지역) 로 나눈다.
 * ★aggregateRating · review 는 넣지 않는다. 받은 평점이 없으므로 숫자를 만들면
 *   거짓이 된다. 별점이 검색 결과에 붙는 이득보다 위험이 크다.
 * ★dateModified 는 '@@LM@@' 토큰으로 둔다. 빌드가 본문 해시를 보고 **실제로
 *   바뀐 쪽에만** 날짜를 끼운다(src/build.mjs).
 */
const CTX = 'https://schema.org';
const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function organization(cfg, url) {
  const o = {
    '@type': 'Organization', '@id': `${url}/#org`,
    name: cfg.brand.ko, alternateName: cfg.brand.en, url: `${url}/`,
    slogan: cfg.brand.slogan,
    description: `${cfg.coverage.sido.join('·')} 동·읍에서 받는 출장마사지·홈타이 방문 관리`,
    telephone: cfg.tel, logo: `${url}/assets/logo.svg`,
    areaServed: cfg.coverage.sido.map((s) => ({ '@type': 'AdministrativeArea', name: s })),
    contactPoint: {
      '@type': 'ContactPoint', telephone: cfg.tel, contactType: cfg.telLabel,
      availableLanguage: ['ko'], areaServed: 'KR',
      hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: WEEK, opens: '00:00', closes: '23:59' },
    },
  };
  if (cfg.business.address) o.address = { '@type': 'PostalAddress', streetAddress: cfg.business.address, addressCountry: 'KR' };
  if (cfg.business.regNo) o.identifier = { '@type': 'PropertyValue', name: '사업자등록번호', value: cfg.business.regNo };
  if (cfg.business.email) o.email = cfg.business.email;
  return o;
}

export function website(cfg, url) {
  return {
    '@type': 'WebSite', '@id': `${url}/#site`,
    url: `${url}/`, name: `${cfg.brand.ko} 출장마사지`, inLanguage: 'ko-KR',
    publisher: { '@id': `${url}/#org` },
  };
}

export function webpage({ url, siteUrl, title, desc, breadcrumbId }) {
  return {
    '@type': 'WebPage', '@id': `${url}#page`, url, name: title, description: desc,
    inLanguage: 'ko-KR', isPartOf: { '@id': `${siteUrl}/#site` },
    dateModified: '@@LM@@',
    ...(breadcrumbId ? { breadcrumb: { '@id': breadcrumbId } } : {}),
  };
}

export function breadcrumb(url, items) {
  return {
    '@type': 'BreadcrumbList', '@id': `${url}#crumb`,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

/** 지역 자체. 면적까지 적어 둔다 — 계산해서 나온 값이라 적을 수 있다. */
export function place(id, name, geo, { containedIn, area, alternateName } = {}) {
  const p = {
    '@type': 'Place', '@id': id, name,
    geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng },
  };
  if (alternateName) p.alternateName = alternateName;
  if (area) p.additionalProperty = { '@type': 'PropertyValue', name: '면적', value: area, unitCode: 'KMK' };
  if (containedIn) p.containedInPlace = containedIn;
  return p;
}

export function service({ siteUrl, url, name, desc, areaServed, courses, cfg }) {
  return {
    '@type': 'Service', '@id': `${url}#service`,
    name, description: desc, serviceType: '출장마사지·홈타이 방문 관리',
    provider: { '@id': `${siteUrl}/#org` },
    areaServed,
    termsOfService: `${siteUrl}/terms/`,
    availableChannel: {
      '@type': 'ServiceChannel', serviceUrl: url,
      servicePhone: { '@type': 'ContactPoint', telephone: cfg.tel, contactType: cfg.telLabel },
      availableLanguage: ['ko'],
    },
    ...(courses ? {
      hasOfferCatalog: {
        '@type': 'OfferCatalog', name: '코스',
        itemListElement: courses.map((c) => ({
          '@type': 'Offer', name: `${c.ko} ${c.min}분`,
          price: String(c.price), priceCurrency: 'KRW',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/course/${c.slug}/`,
          itemOffered: { '@type': 'Service', name: `${c.ko} 출장마사지`, description: c.line },
        })),
      },
    } : {}),
  };
}

export function itemList(id, name, items) {
  return {
    '@type': 'ItemList', '@id': id, name, numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
  };
}

export function faqPage(url, qa) {
  return {
    '@type': 'FAQPage', '@id': `${url}#faq`,
    mainEntity: qa.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
  };
}

export function article({ url, siteUrl, title, desc, date, cfg }) {
  return {
    '@type': 'Article', '@id': `${url}#article`,
    headline: title, description: desc, datePublished: date, dateModified: '@@LM@@',
    inLanguage: 'ko-KR', mainEntityOfPage: { '@id': `${url}#page` },
    author: { '@id': `${siteUrl}/#org` }, publisher: { '@id': `${siteUrl}/#org` },
  };
}

export function graph(nodes) {
  return JSON.stringify({ '@context': CTX, '@graph': nodes.filter(Boolean) });
}
