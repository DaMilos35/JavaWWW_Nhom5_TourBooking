import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop tự động cuộn trang lên đầu mỗi khi chuyển URL/route trong SPA
 * Đảm bảo khi người dùng bấm vào xem chi tiết tour hay bất kỳ trang nào,
 * màn hình luôn luôn bắt đầu từ đỉnh trang thay vì bị lưu vị trí scroll cũ.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
