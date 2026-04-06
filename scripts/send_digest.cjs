const { GoogleGenerativeAI } = require("@google/generative-ai");
const RSSParser = require('rss-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const parser = new RSSParser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL_NAME = "gemini-2.5-flash"; // 현재 가용한 최신 모델

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
  console.log("🚀 미국-이란 전쟁 세계 뉴스 다이제스트 생성 시작...");
  let emailContent = `
    <div style="background-color: #0f172a; color: #f1f5f9; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="margin: 0; font-size: 28px; letter-spacing: -0.5px;">US-Iran War: Global Media Pulse</h1>
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

      // API 할당량 보호: 매 호출 사이에 약 15초 대기 (무료 티어: 분당 5회 제한)
      if (i > 0) {
        console.log(`⏳ API 할당량 보호를 위해 15초 대기 중...`);
        await new Promise(resolve => setTimeout(resolve, 15000));
      }

      console.log(`🤖 Gemini AI로 번역 및 요약 생성 중 (${source.name})...`);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      const prompt = `
        다음 영문 뉴스를 한국어로 번역하고 요약하세요.
        언론사: ${source.name}
        제목: ${topNews.title}
        설명: ${topNews.contentSnippet || topNews.content || "상세 내용이 부족합니다. 제목을 바탕으로 분석하세요."}
        
        규칙:
        1. 제목을 한국어 제목으로 번역하세요.
        2. 핵심 내용을 3개의 불렛포인트로 요약하세요.
        3. 출처 정보가 부족하더라도 제목을 통해 추측할 수 있는 맥락을 보강하세요.
        4. 매체의 성향(${source.category})을 존중하되 객관적으로 전달하세요.
        
        출력 형식:
        제목: [번역된 제목]
        요약:
        - 1번 요약
        - 2번 요약
        - 3번 요약
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      const lines = aiResponse.split('\n').filter(l => l.trim() !== '');
      const cleanTitle = (lines.find(l => l.includes('제목:')) || '').replace('제목:', '').trim();
      const cleanSummaryList = lines.filter(l => l.includes('-')).map(l => `<li>${l.replace('-', '').trim()}</li>`).join('');

      emailContent += `
        <div style="margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: ${getCategoryColor(source.category)}; height: 4px;"></div>
          <div style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 700; color: #64748b; font-size: 12px; text-transform: uppercase;">${source.name}</span>
              <span style="font-size: 11px; color: #94a3b8;">${new Date(topNews.pubDate || Date.now()).toLocaleDateString()}</span>
            </div>
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #0f172a; line-height: 1.4;">${cleanTitle || topNews.title}</h2>
            <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.6;">
              ${cleanSummaryList || '<li>요약 내용을 생성하지 못했습니다.</li>'}
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
  const recipientList = (process.env.RECIPIENT_EMAILS || '2gateless@gmail.com')
    .split(',').map(e => e.trim()).filter(e => e);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '2gateless@gmail.com',
      pass: process.env.GMAIL_APP_PASS
    }
  });

  for (const recipient of recipientList) {
    console.log(`✉️ 이메일 발송 중... (수신자: ${recipient})`);
    const mailOptions = {
      from: '"미국-이란 전쟁 세계 뉴스" <2gateless@gmail.com>',
      to: recipient,
      subject: `[Daily Digest] ${new Date().toLocaleDateString()} 미국-이란 전쟁 세계 뉴스 요약`,
      html: `
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 20px auto; border-radius: 12px; overflow: hidden;">
            ${htmlBody}
            <div style="padding: 30px 20px; text-align: center; color: #94a3b8; font-size: 12px;">
              <p>© 2026 US-Iran War Global News Digest. 본 리포트는 Google Gemini AI에 의해 자동 생성되었습니다.</p>
              <p>본 메일은 수신 전용으로 회신이 불가능하며, 구독 해지를 원하시면 관리자에게 문의하세요.</p>
            </div>
          </div>
        </body>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [${recipient}] 발송 성공:`, info.response);
    } catch (error) {
      console.error(`❌ [${recipient}] 발송 실패:`, error);
    }
  }
}

generateDigest();
