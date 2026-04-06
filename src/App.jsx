import React, { useState, useEffect } from 'react';
import { Mail, Send, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NewsCard from './components/NewsCard';
import { fetchAllNews, processNewsItem } from './utils/rssFetcher';

function App() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState('');
  const userEmail = '2gateless@gmail.com';

  const loadNews = async () => {
    setLoading(true);
    try {
      const allRawNews = await fetchAllNews();
      const processedNews = await Promise.all(
        allRawNews.map(item => processNewsItem(item))
      );
      setNewsList(processedNews);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleSendEmail = () => {
    setEmailStatus('sending');
    // 실제 메일 발송 로직(Nodemailer/EmailJS)이 들어갈 자리
    setTimeout(() => {
      setEmailStatus('success');
      setTimeout(() => setEmailStatus(''), 3000);
    }, 2000);
  };

  return (
    <div className="container">
      <header>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1>미국-이란 전쟁 : 세계 뉴스 모음</h1>
          <p className="subtitle">주요 10개 글로벌 언론사의 실시간 보도 번역 및 요약 리포트</p>
        </motion.div>
        
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={loadNews} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
            뉴스 새로고침
          </button>
        </div>
      </header>

      <main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ display: 'inline-block' }}
            >
              <RefreshCw size={48} color="#6366f1" />
            </motion.div>
            <p style={{ marginTop: '1rem', color: '#94a3b8' }}>글로벌 뉴스 피드를 동기화 중입니다...</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            <AnimatePresence>
              {newsList.map((news, idx) => (
                <NewsCard key={news.id || idx} news={news} />
              ))}
            </AnimatePresence>
          </div>
        )}

        <section className="email-section">
          <Mail size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>데일리 뉴스레터 리포트</h2>
          <p style={{ marginBottom: '2rem', color: '#94a3b8' }}>
            현재 수집된 모든 전문 뉴스를 번역 및 요약하여 이메일로 받아보세요.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              className="email-input" 
              defaultValue={userEmail} 
              readOnly 
            />
            <button 
              className={`btn btn-primary ${emailStatus === 'success' ? 'success' : ''}`}
              onClick={handleSendEmail}
              disabled={emailStatus === 'sending'}
              style={{ minWidth: '160px' }}
            >
              {emailStatus === 'sending' ? (
                <>메일 전송 중...</>
              ) : emailStatus === 'success' ? (
                <>전송 완료!</>
              ) : (
                <><Send size={18} /> 지금 바로 받기</>
              )}
            </button>
          </div>
          
          {emailStatus === 'success' && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              style={{ color: '#10b981', marginTop: '1rem', fontWeight: 600 }}
            >
              성공적으로 {userEmail} 주소로 발송되었습니다.
            </motion.p>
          )}
        </section>
      </main>

      <footer className="footer-info">
        <p>© 2026 US-Iran War Global News Digest. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem' }}>언론사 고유의 성향과 관점이 포함되어 있으며, AI 번역 결과이므로 원문과 차이가 있을 수 있습니다.</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .btn.success { background: #10b981; }
      `}} />
    </div>
  );
}

export default App;
