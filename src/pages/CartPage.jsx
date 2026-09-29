import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, getTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/cart' } });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-4 text-center empty-cart">
        <FaShoppingBag size={80} color="#ccc" className="mb-3" />
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Hãy tìm và chọn những tour tuyệt vời cho chuyến đi của bạn.</p>
        <Link to="/tours" className="btn btn-primary mt-3">Khám Phá Tour</Link>
      </div>
    );
  }

  return (
    <div className="cart-page bg-light py-4">
      <div className="container">
        <h2 className="mb-4">GIỎ HÀNG CỦA BẠN</h2>
        <div className="cart-layout">
          <div className="cart-main">
            <div className="table-responsive">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.tour.id}>
                      <td className="product-col">
                        <img src={item.tour.imageUrl || 'https://via.placeholder.com/100'} alt={item.tour.name} />
                        <Link to={`/tours/${item.tour.id}`} className="tour-name">{item.tour.name}</Link>
                      </td>
                      <td>{formatPrice(item.tour.price)}</td>
                      <td>
                        <div className="qty-controls cart-qty">
                          <button onClick={() => updateQuantity(item.tour.id, item.quantity - 1)}>-</button>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => updateQuantity(item.tour.id, parseInt(e.target.value) || 1)}
                            min="1"
                          />
                          <button onClick={() => updateQuantity(item.tour.id, item.quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td className="item-total">{formatPrice(item.tour.price * item.quantity)}</td>
                      <td>
                        <button className="btn-delete" onClick={() => removeFromCart(item.tour.id)}>
                          <FaTrash color="red" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="cart-sidebar">
            <div className="summary-card">
              <h3>Tóm tắt đơn hàng</h3>
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <div className="summary-row">
                <span>Giảm giá:</span>
                <span>0 ₫</span>
              </div>
              <div className="summary-row total-row">
                <span>Tổng cộng:</span>
                <span className="total-price">{formatPrice(getTotal())}</span>
              </div>
              <button className="btn btn-primary w-100 mt-3 btn-lg" onClick={handleCheckout}>
                Tiến Hành Thanh Toán
              </button>
              <Link to="/tours" className="continue-shopping mt-3 d-block text-center text-primary">
                Tiếp tục xem tour
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
