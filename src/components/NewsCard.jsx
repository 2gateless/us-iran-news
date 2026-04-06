import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Globe } from 'lucide-react';

const NewsCard = ({ news }) => {
  const badgeClass = `badge badge-${news.category || 'neutral'}`;
  
  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-header">
        <span className={badgeClass}>
          {news.category === 'pro-iran' ? '친이란' : 
           news.category === 'anti-iran' ? '이란 적대' :
           news.category === 'west' ? '서방' : '중립'}
        </span>
        <span className="source-name">
          <Globe size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {news.source}
        </span>
      </div>
      
      <h3 className="news-title">
        {news.translatedTitle || news.title}
      </h3>
      
      <div className="news-summary">
        {news.summary}
      </div>
      
      <div className="news-footer">
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {new Date(news.pubDate).toLocaleTimeString()}
        </span>
        <a 
          href={news.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-ghost"
        >
          원문 보기 <ExternalLink size={14} />
        </a>
      </div>
    </motion.div>
  );
};

export default NewsCard;
