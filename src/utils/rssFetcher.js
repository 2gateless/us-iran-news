import RSSParser from 'rss-parser';

const parser = new RSSParser();
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

const NEWS_SOURCES = [
  { id: 'wp', name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/world', category: 'west' },
  { id: 'tehrantimes', name: 'Tehran Times', url: 'https://www.tehrantimes.com/rss', category: 'pro-iran' },
  { id: 'iranintl', name: 'Iran International', url: 'https://www.iranintl.com/en/rss', category: 'anti-iran' },
  { id: 'jpost', name: 'The Jerusalem Post', url: 'https://www.jpost.com/Rss/RssFeedsHeadlines.aspx', category: 'anti-iran' },
  { id: 'timesofisrael', name: 'The Times of Israel', url: 'https://www.timesofisrael.com/feed/', category: 'anti-iran' },
  { id: 'tass', name: 'TASS', url: 'https://tass.com/rss/v2.xml', category: 'neutral' },
  { id: 'lemonde', name: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml', category: 'west' }
];

export const fetchAllNews = async () => {
  const allNews = [];

  for (const source of NEWS_SOURCES) {
    try {
      // 실구현 시에는 CORS 이슈로 인해 PROXY_URL을 붙여서 호출합니다.
      // 여기서는 데모를 위해 일부 데이터를 모킹하거나 성공 시 파싱합니다.
      const feed = await parser.parseURL(PROXY_URL + encodeURIComponent(source.url));
      
      const topNews = feed.items.slice(0, 2).map(item => ({
        id: item.guid || item.link,
        source: source.name,
        category: source.category,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentSnippet || item.content,
      }));

      allNews.push(...topNews);
    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error);
      // 실패 시 더미 데이터 추가 (데모용)
      allNews.push({
        id: `mock-${source.id}`,
        source: source.name,
        category: source.category,
        title: `[Latest] ${source.name} reporting on the conflict...`,
        link: '#',
        pubDate: new Date().toISOString(),
        content: 'Loading content...',
        isMock: true
      });
    }
  }

  return allNews;
};

// 번역 및 요약 시뮬레이션 (AI API 연동 전)
export const processNewsItem = async (item) => {
  // 실제 OpenAI나 Google Translate API 호출을 대신하여
  // 간단한 번역 및 요약 템플릿을 적용합니다.
  
  const summaries = {
    'west': '미국과 동맹국들은 이란의 핵 시설 및 군사 거점에 대한 정밀 타격을 지속하고 있으며, 외교적 해결보다는 군사적 압박에 무게를 두고 있습니다.',
    'pro-iran': '이란 정부는 서방의 침략 행위에 대해 강력한 보복 의지를 피력하고 있으며, 주권 수호를 위한 모든 수단을 동원할 것이라고 밝혔습니다.',
    'anti-iran': '이란 내부에서는 전쟁 장기화에 따른 경제적 어려움과 물가 폭등으로 인한 시민들의 불만이 고조되고 있으며 반정부 기류가 감지되고 있습니다.',
    'neutral': '국제 사회는 무력 충돌의 즉각적인 중단과 대화를 통한 해결을 촉구하고 있으나, 양측의 입장이 팽팽하게 맞서며 긴장이 고조되고 있습니다.'
  };

  return {
    ...item,
    translatedTitle: await translateTitle(item.title),
    summary: summaries[item.category] || '최신 이슈가 업데이트 중입니다.',
  };
};

const translateTitle = async (title) => {
  // 간단한 제목 번역 로직 (실제로는 API 사용)
  if (title.includes('Operation')) return '전략적 군사 작전 전개 및 타격 확대';
  if (title.includes('Nuclear')) return '이란 핵 시설 관련 긴장 고조';
  if (title.includes('Threat')) return '상호 간의 위협 수위 격상 및 발언';
  if (title.includes('Oil') || title.includes('Market')) return '석유 시장 및 글로벌 경제 영향 분석';
  return title; // 기본은 제목 그대로 (데모시에는 제가 직접 번역한 것으로 대체 가능)
};
