import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeadset, FaPaperPlane, FaTimes, FaStar, FaCompass } from 'react-icons/fa';
import { aiApi } from '../../api/axiosConfig';
import { realTourApi, removeVietnameseTones } from '../../api/realTourDataApi';
import { context7Engine } from '../../utils/context7Engine';
import { travelReachEngine } from '../../utils/travelReachEngine';
import FallbackImage from './FallbackImage';
import './AiChatWidget.css';

const DEFAULT_PROMPTS = [
  '🌐 Thủ tục Visa & Hộ chiếu tour Quốc tế',
  '⚖️ So sánh Tour Trong Nước vs Quốc Tế',
  '🛡️ Chính sách bảo lãnh hoàn 100% cọc khi trượt Visa',
  '✈️ Quy định hành lý, chất lỏng & Ga T1/T2',
  '🏖️ Gợi ý tour biển đảo & nghỉ dưỡng',
  '🌲 Tour Đà Lạt & Vùng cao săn mây'
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
      text: 'Kính chào quý khách! Em là Trợ lý Lữ Hành Thông Minh của Du Lịch Việt. Em luôn sẵn sàng hỗ trợ anh/chị thẩm định thời hạn Hộ chiếu, tra cứu thủ tục Visa, so sánh quyền lợi Tour Nội Địa vs Quốc Tế hoặc tùy biến lịch trình 5 sao tối ưu nhất.',
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
        text: res.data?.reply || 'Em đã chọn lọc những hành trình phù hợp nhất cho anh/chị:',
        suggestedTours: res.data?.suggestedTours || []
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      // Smart client-side fallback supporting unaccented text, Context7 policy grounding & Agent-Reach intelligence
      try {
        const searchRes = await realTourApi.search(textToSend);
        const matches = (searchRes.data || []).slice(0, 3);
        const unaccented = removeVietnameseTones(textToSend);

        // 1. Kiểm tra Context7 Grounding (Chính sách hoàn hủy, cọc 30%, B2B, trẻ em, E-ticket)
        const relevantPolicy = context7Engine.query(textToSend, 1)[0];
        
        // 2. Kiểm tra Agent-Reach Destination Ground Truth (Thời tiết, mùa đẹp, hành lý, văn hóa)
        const destinationIntel = travelReachEngine.getDestinationIntelligence(textToSend);

        let replyIntro = 'Em xin gợi ý những hành trình phù hợp nhất với mong muốn của anh/chị:';

        if (relevantPolicy) {
          replyIntro = `**[Thông Tin Chính Thống OTA - ${relevantPolicy.title}]**\n${relevantPolicy.content}\n\nDưới đây là một số hành trình nổi bật đang áp dụng chính sách này:`;
        } else if (destinationIntel) {
          replyIntro = `**[Tình Báo Điểm Đến: ${destinationIntel.name}]**\n• **Thời điểm lý tưởng:** ${destinationIntel.bestSeasons}\n• **Khí hậu & Thời tiết:** ${destinationIntel.weatherProfile}\n• **Lưu ý hành lý:** ${destinationIntel.luggageTips}\n• **Văn hóa bản địa:** ${destinationIntel.cultureTips}\n\nDu Lịch Việt trân trọng gửi đến anh/chị các tour chọn lọc đến ${destinationIntel.name}:`;
        } else if (unaccented.includes('chau au') || unaccented.includes('phap') || unaccented.includes('thuy si') || unaccented.includes('italy') || unaccented.includes('rome') || unaccented.includes('paris')) {
          if (unaccented.includes('duoi 10') || unaccented.includes('10 trieu') || unaccented.includes('gia re') || unaccented.includes('sinh vien')) {
            replyIntro = 'Dạ về kế hoạch du lịch các nước Châu Âu cho 2 người, thông thường tour Châu Âu trọn gói dao động từ 55 - 75 triệu/khách (vé máy bay khứ hồi và visa Schengen đã khoảng 25 - 35 triệu/người). Với ngân sách khoảng 10 triệu cho 2 người, em xin phép gợi ý anh/chị tham khảo các tour nghỉ dưỡng biển đảo cao cấp (Phú Quốc, Nha Trang) hoặc tour Thái Lan trọn gói (6.990.000đ/khách), đồng thời có thể tham khảo thêm hành trình Châu Âu 4 nước bên dưới để lên kế hoạch trong tương lai nhé:';
          } else {
            replyIntro = 'Khám phá Châu Âu cổ kính và hoa lệ luôn là hành trình mơ ước của mọi du khách! Du Lịch Việt trân trọng gửi đến anh/chị hành trình Châu Âu 4 Nước: Pháp - Thụy Sĩ - Ý - Vatican 10N9Đ tiêu chuẩn hàng không 5 sao:';
          }
        } else if (unaccented.includes('da lat') || unaccented.includes('san may')) {
          replyIntro = 'Đà Lạt luôn là điểm đến tuyệt vời với khí hậu se lạnh và cảnh sắc ngàn hoa mộng mơ. Dưới đây là các tour Đà Lạt - Lâm Đồng được yêu thích nhất:';
        } else if (unaccented.includes('phu quoc') || unaccented.includes('nha trang') || unaccented.includes('bien')) {
          replyIntro = 'Một chuyến nghỉ mát biển đảo với làn nước trong xanh và hải sản tươi ngon là lựa chọn tuyệt vời! Dưới đây là các tour biển đảo hấp dẫn nhất:';
        } else if (unaccented.includes('mien tay') || unaccented.includes('song nuoc')) {
          replyIntro = 'Về miền Tây sông nước hữu tình để trải nghiệm chèo xuồng, đi chợ nổi và thưởng thức ẩm thực miệt vườn. Em xin gợi ý các tour chọn lọc:';
        } else if (unaccented.includes('gia re') || unaccented.includes('tiet kiem')) {
          replyIntro = 'Dưới đây là các hành trình du lịch chất lượng cao với chi phí tiết kiệm tối ưu, trọn gói dịch vụ chu đáo:';
        }

        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `${replyIntro}\n\nAnh/chị có thể bấm trực tiếp vào thẻ tour bên dưới để xem hình ảnh và chi tiết lịch trình nhé!`,
            suggestedTours: matches
          }
        ]);
      } catch {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: 'Hiện tại hệ thống tư vấn đang bận một chút. Quý khách có thể xem nhanh các tour gợi ý bên dưới hoặc tìm kiếm theo điểm đến trên trang chủ nhé!',
            suggestedTours: []
          }
        ]);
      }
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
              <FaHeadset style={{ color: '#38bdf8', fontSize: '1.05rem' }} />
              <div>
                <span style={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>Tư Vấn Du Lịch 24/7</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>Trực tuyến • Phản hồi ngay</span>
              </div>
            </div>
            <button 
              className="ai-close-btn" 
              onClick={() => setIsOpen(false)}
              aria-label="Đóng khung tư vấn"
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

                {/* Tour cards suggested by assistant */}
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
                            {tour.duration} ngày · {tour.departureLocation} · <FaStar style={{ color: '#f59e0b', fontSize: '0.72rem', display: 'inline', verticalAlign: '-1px' }} /> {tour.rating}
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
                  <FaCompass style={{ color: '#0194F3' }} /> Gợi ý câu hỏi nhanh:
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
                placeholder="Nhập câu hỏi hoặc điểm đến bạn quan tâm..."
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
        aria-label="Tư vấn du lịch 24/7"
      >
        <FaHeadset className="ai-launcher-icon" />
        <span>Tư Vấn Chuyến Đi</span>
      </button>
    </div>
  );
};

export default AiChatWidget;
