import { useState } from 'react';
import {
  BookOpen, Search, ChevronRight, HelpCircle, FileText,
  Video, MessageCircle, Zap, Shield, Globe
} from 'lucide-react';
import './Help.css';

const categories = [
  { id: 'getting-started', icon: Zap, title: 'Getting Started', desc: 'Quick start guide and basics', articles: 8 },
  { id: 'scanning', icon: Globe, title: 'Scanning', desc: 'How to configure and run scans', articles: 12 },
  { id: 'vulnerabilities', icon: Shield, title: 'Vulnerabilities', desc: 'Understanding findings and severity', articles: 15 },
  { id: 'reports', icon: FileText, title: 'Reports & Exports', desc: 'Generate and customize reports', articles: 6 },
  { id: 'api', icon: BookOpen, title: 'API Documentation', desc: 'REST API reference and examples', articles: 20 },
  { id: 'faq', icon: HelpCircle, title: 'FAQ', desc: 'Frequently asked questions', articles: 10 },
];

const recentArticles = [
  { title: 'How to set up your first scan', category: 'Getting Started', readTime: '3 min' },
  { title: 'Understanding CVSS scores', category: 'Vulnerabilities', readTime: '5 min' },
  { title: 'Configuring scan schedules', category: 'Scanning', readTime: '4 min' },
  { title: 'Export options and formats', category: 'Reports', readTime: '2 min' },
  { title: 'API authentication guide', category: 'API', readTime: '6 min' },
];

export default function Help() {
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const filteredCategories = categories.filter(cat =>
    cat.title.toLowerCase().includes(q) || cat.desc.toLowerCase().includes(q)
  );
  const filteredArticles = recentArticles.filter(a =>
    a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
  );
  const noResults = q && filteredCategories.length === 0 && filteredArticles.length === 0;

  return (
    <div className="help-page">
      <div className="help-hero animate-fade-up">
        <h2 className="help-hero-title">How can we help?</h2>
        <p className="help-hero-desc">Search our documentation or browse by category</p>
        <div className="help-search-bar">
          <Search size={18} className="help-search-icon" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="help-search-input"
            aria-label="Search documentation"
          />
        </div>
      </div>

      {noResults ? (
        <div className="help-no-results animate-fade-up">
          <HelpCircle size={40} />
          <p>No results for &ldquo;<strong>{search}</strong>&rdquo;. Try a different term.</p>
        </div>
      ) : (
        <>
          {filteredCategories.length > 0 && (
            <div className="help-categories">
              {filteredCategories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} className={`card help-category animate-fade-up stagger-${i + 1}`}>
                    <div className="help-cat-icon">
                      <Icon size={24} />
                    </div>
                    <div className="help-cat-info">
                      <h4 className="help-cat-title">{cat.title}</h4>
                      <p className="help-cat-desc">{cat.desc}</p>
                      <span className="help-cat-count">{cat.articles} articles</span>
                    </div>
                    <ChevronRight size={16} className="help-cat-arrow" />
                  </button>
                );
              })}
            </div>
          )}

          {filteredArticles.length > 0 && (
            <div className="help-section">
              <h3 className="section-title">Popular Articles</h3>
              <div className="help-articles">
                {filteredArticles.map((article, i) => (
                  <div key={i} className={`help-article animate-fade-up stagger-${i + 1}`}>
                    <FileText size={16} className="help-article-icon" />
                    <div className="help-article-info">
                      <div className="help-article-title">{article.title}</div>
                      <div className="help-article-meta">
                        <span>{article.category}</span>
                        <span>·</span>
                        <span>{article.readTime} read</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="help-article-arrow" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="help-contact animate-fade-up">
        <div className="card help-contact-card">
          <MessageCircle size={32} />
          <div>
            <h4>Still need help?</h4>
            <p>Contact our support team for personalized assistance.</p>
          </div>
          <button className="btn btn-primary">Contact Support</button>
        </div>
      </div>
    </div>
  );
}
