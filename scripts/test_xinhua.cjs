const RSSParser = require('rss-parser');
const parser = new RSSParser();

async function testXinhua() {
  try {
    const feed = await parser.parseURL('http://www.news.cn/english/rss/worldrss.xml');
    console.log("Xinhua Top Item:");
    const item = feed.items[0];
    console.log(JSON.stringify(item, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}

testXinhua();
