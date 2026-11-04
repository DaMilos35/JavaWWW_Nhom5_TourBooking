import React from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    const msg = error?.message || '';
    if ((msg.includes('dynamically imported module') || msg.includes('Loading chunk')) && !sessionStorage.getItem('chunk_reload')) {
      sessionStorage.setItem('chunk_reload', '1');
      window.location.reload();
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('chunk_reload');
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    sessionStorage.removeItem('chunk_reload');
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 24px'
            }}>
              <FaExclamationTriangle />
            </div>

            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '12px'
            }}>
              Đã xảy ra sự cố không mong muốn
            </h2>

            <p style={{
              fontSize: '15px',
              color: '#64748b',
              lineHeight: '1.6',
              marginBottom: '28px'
            }}>
              Hệ thống đang gặp gián đoạn tạm thời khi hiển thị trang này. Xin lỗi vì sự bất tiện này, bạn có thể tải lại trang hoặc trở về trang chủ.
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#0071c2',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 113, 194, 0.25)'
                }}
              >
                <FaRedo /> Thử lại
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaHome /> Về trang chủ
              </button>
            </div>

            {/* Chi tiết sự cố kỹ thuật (Hỗ trợ chẩn đoán chính xác) */}
            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {this.state.showDetails ? 'Ẩn thông tin kỹ thuật' : 'Xem chi tiết sự cố kỹ thuật'}
              </button>

              {this.state.showDetails && this.state.error && (
                <div style={{
                  marginTop: '12px',
                  textAlign: 'left',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#dc2626',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
