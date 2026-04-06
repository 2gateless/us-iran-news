const RSSParser = require('rss-parser');
const parser = new RSSParser();

async function analyzeFeeds() {
  const feeds = [
    { name: 'China Daily', url: 'http://www.chinadaily.com.cn/rss/world.xml' },
    { name: 'TASS', url: 'https://tass.com/rss/v2.xml' },
    { name: 'RT News', url: 'https://www.rt.com/rss/news/' }
  ];

  for (const f of feeds) {
    try {
      console.log(`--- Analyzing ${f.name} ---`);
      const feed = await parser.parseURL(f.url);
      const item = feed.items[0];
      console.log(JSON.stringify({
        title: item.title,
        link: item.link,
        guid: item.guid,
        content: item.content ? item.content.substring(0, 100) : 'N/A',
        snippet: item.contentSnippet ? item.contentSnippet.substring(0, 100) : 'N/A'
      }, null, 2));
    } catch (e) {
      console.error(`Error ${f.name}: ${e.message}`);
    }
  }
}

analyzeFeeds();
