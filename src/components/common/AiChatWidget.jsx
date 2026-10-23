import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaPaperPlane, FaTimes, FaMagic, FaExternalLinkAlt } from 'react-icons/fa';
import { aiApi } from '../../api/axiosConfig';
import FallbackImage from './FallbackImage';
import './AiChatWidget.css';

const DEFAULT_PROMPTS = [
  'Gợi ý tour nghỉ mát biển đảo',
  'Tour săn mây vùng cao mát mẻ',
  'Khám phá miền Tây sông nước ẩm thực',
  'Tour du lịch giá rẻ dưới 5 triệu'
];

const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ Lý Du Lịch AI của Du Lịch Việt. Tôi có thể giúp bạn tìm tour du lịch phù hợp nhất theo sở thích (nghỉ mát biển, săn mây vùng cao, miền Tây...) hoặc theo ngân sách.',
      suggestedTours: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat({
        message: textToSend,
        prompt: textToSend,
        history: messages.slice(-4).map(m => ({ sender: m.sender, text: m.text }))
      });

      const botMsg = {
        sender: 'bot',
        text: res.data?.reply || 'Tôi đã tìm thấy một số gợi ý phù hợp cho bạn.',
        suggestedTours: res.data?.suggestedTours || []
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Rất tiếc, hiện tại hệ thống AI đang bận xử lý. Bạn có thể thử tìm kiếm theo từ khóa hoặc xem các tour nổi bật trên trang chủ nhé!',
          suggestedTours: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTourClick = (tourId) => {
    setIsOpen(false);
    navigate(`/tours/${tourId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="ai-widget-container">
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-title">
              <span className="ai-status-indicator"></span>
              <FaRobot style={{ color: '#38bdf8' }} />
              <span>Trợ Lý Du Lịch AI</span>
            </div>
            <button 
              className="ai-close-btn" 
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chat"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="ai-chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.sender}`}>
                <div className="ai-bubble">
                  {renderFormattedText(msg.text)}
                </div>

                {/* Tour cards if suggested by AI */}
                {msg.suggestedTours && msg.suggestedTours.length > 0 && (
                  <div className="ai-tours-wrapper">
                    {msg.suggestedTours.map(tour => (
                      <div 
                        key={tour.id} 
                        className="ai-tour-mini-card"
                        onClick={() => handleTourClick(tour.id)}
                        title="Bấm để xem chi tiết tour này"
                      >
                        <FallbackImage 
                          src={tour.imageUrl} 
                          alt={tour.name} 
                          className="ai-tour-mini-img" 
                        />
                        <div className="ai-tour-mini-info">
                          <div className="ai-tour-mini-name">{tour.name}</div>
                          <div className="ai-tour-mini-price">{formatPrice(tour.price)}</div>
                          <div className="ai-tour-mini-meta">
                            {tour.duration} ngày · {tour.departureLocation} · {tour.rating}★
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Quick Prompts below the first message */}
            {messages.length === 1 && (
              <div className="ai-quick-prompts">
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaMagic style={{ color: '#f59e0b' }} /> Gợi ý câu hỏi nhanh:
                </span>
                {DEFAULT_PROMPTS.map((prompt, idx) => (
                  <button 
                    key={idx} 
                    className="ai-prompt-pill"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="ai-message bot">
                <div className="ai-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="ai-chat-footer">
            <form 
              className="ai-input-form" 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
              <input
                type="text"
                className="ai-input"
                placeholder="Hỏi AI về chuyến đi hoặc ngân sách..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="ai-send-btn" 
                disabled={!input.trim() || loading}
                aria-label="Gửi tin nhắn"
              >
                <FaPaperPlane size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button 
        className="ai-launcher-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Trợ lý Du lịch AI"
      >
        <FaRobot className="ai-launcher-icon" />
        <span>Trợ Lý Du Lịch AI</span>
      </button>
    </div>
  );
};

export default AiChatWidget;
