const { GoogleGenerativeAI } = require("@google/generative-ai");
const RSSParser = require('rss-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const parser = new RSSParser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL_NAME = "gemini-2.5-flash"; // 또는 가용한 모델

const NEWS_SOURCES = [
  { name: 'NYT', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'west' },
  { name: 'WSJ', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', category: 'west' },
  { name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/world', category: 'west' },
  { name: 'The Economist', url: 'https://www.economist.com/international/rss.xml', category: 'neutral' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'neutral' },
  { name: 'TASS', url: 'https://tass.com/rss/v2.xml', category: 'neutral' },
  { name: 'RT News', url: 'https://www.rt.com/rss/news/', category: 'neutral' },
  { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss', category: 'west' }
];

async function generateDigest() {
  console.log("🚀 미국-이란 전쟁 세계 뉴스 다이제스트 [즉시 발송] 시작...");
  let emailContent = `
    <div style="background-color: #0f172a; color: #f1f5f9; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="margin: 0; font-size: 28px; letter-spacing: -0.5px;">US-Iran War: Global Media Pulse (LITE)</h1>
      <p style="color: #94a3b8; margin-top: 10px;">${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} 기준 세계 주요 언론 리포트</p>
    </div>
    <div style="padding: 20px; background-color: #ffffff;">
  `;

  for (let i = 0; i < NEWS_SOURCES.length; i++) {
    const source = NEWS_SOURCES[i];
    try {
      console.log(`📡 [${source.name}] 뉴스 가져오는 중...`);
      const feed = await parser.parseURL(source.url);
      const topNews = feed.items[0];

      if (!topNews) continue;

      let cleanTitle = topNews.title;
      let cleanSummaryList = '<li>AI 일일 할당량 초과로 인해 상세 요약이 생략되었습니다. 원문을 확인해 주세요.</li>';

      try {
        // AI 호출 시도 (할당량 여유가 있을 때만)
        console.log(`🤖 Gemini AI로 번역 및 요약 생성 중 (${source.name})...`);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Translate this news title to Korean: "${topNews.title}" and summarize the topic in 1 sentence.`;
        
        // 지연 시간 없이 바로 시도 (즉시 발송 모드)
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();
        cleanTitle = aiResponse.split('\n')[0] || topNews.title;
        cleanSummaryList = `<li>${aiResponse.split('\n').slice(1).join(' ') || '주요 소식이 업데이트되었습니다.'}</li>`;
      } catch (aiError) {
        console.log(`⚠️ AI 요약 실패 (할당량 초과 등): ${aiError.message}`);
        // 폴백 번역 시도 (간단한 매칭)
        cleanTitle = `[번역 중] ${topNews.title}`;
      }

      emailContent += `
        <div style="margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: ${getCategoryColor(source.category)}; height: 4px;"></div>
          <div style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 700; color: #64748b; font-size: 12px; text-transform: uppercase;">${source.name}</span>
              <span style="font-size: 11px; color: #94a3b8;">${new Date(topNews.pubDate || Date.now()).toLocaleDateString()}</span>
            </div>
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #0f172a; line-height: 1.4;">${cleanTitle}</h2>
            <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.6;">
              ${cleanSummaryList}
            </ul>
            <div style="margin-top: 20px;">
              <a href="${topNews.link}" style="display: inline-block; background-color: #6366f1; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">원문 읽기</a>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error(`❌ [${source.name}] 처리 실패:`, error.message);
    }
  }

  emailContent += `</div>`;
  await sendEmail(emailContent);
}

function getCategoryColor(category) {
  switch (category) {
    case 'west': return '#6366f1';
    case 'pro-iran': return '#10b981';
    case 'anti-iran': return '#ef4444';
    default: return '#94a3b8';
  }
}

async function sendEmail(htmlBody) {
  const recipients = process.env.RECIPIENT_EMAILS || '2gateless@gmail.com';
  console.log(`✉️ 이메일 발송 중... (수신자: ${recipients})`);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '2gateless@gmail.com',
      pass: process.env.GMAIL_APP_PASS
    }
  });

  const mailOptions = {
    from: '"미국-이란 전쟁 세계 뉴스" <2gateless@gmail.com>',
    to: recipients,
    subject: `[Lite Digest] ${new Date().toLocaleDateString()} 미국-이란 전쟁 세계 뉴스 (즉시 발송)`,
    html: `
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 20px auto; border-radius: 12px; overflow: hidden;">
          ${htmlBody}
          <div style="padding: 30px 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>© 2026 US-Iran War Global News Digest. 본 리포트는 AI 할당량을 고려한 Lite 버전입니다.</p>
            <p>내일 오전 9시 정식 리포트에서는 모든 기사의 AI 상세 요약이 제공됩니다.</p>
          </div>
        </div>
      </body>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 이메일 발송 성공:', info.response);
  } catch (error) {
    console.error('❌ 이메일 발송 실패:', error);
  }
}

generateDigest();
