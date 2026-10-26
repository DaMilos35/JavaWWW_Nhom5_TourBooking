const fs = require('fs');
const path = require('path');

// 1. Update src/App.jsx
const appPath = path.resolve(__dirname, '../src/App.jsx');
let appContent = fs.readFileSync(appPath, 'utf8');

if (!appContent.includes('ScrollToTop')) {
  appContent = appContent.replace(
    "import AiChatWidget from './components/common/AiChatWidget';",
    "import AiChatWidget from './components/common/AiChatWidget';\nimport ScrollToTop from './components/common/ScrollToTop';"
  );
  appContent = appContent.replace(
    "<Router>",
    "<Router>\n          <ScrollToTop />"
  );
  fs.writeFileSync(appPath, appContent, 'utf8');
  console.log('App.jsx updated with ScrollToTop.');
} else {
  console.log('App.jsx already has ScrollToTop.');
}

// 2. Update src/components/tours/TourCard.jsx
const tourCardPath = path.resolve(__dirname, '../src/components/tours/TourCard.jsx');
let tcContent = fs.readFileSync(tourCardPath, 'utf8');

// Ensure useNavigate, useLocation are imported
tcContent = tcContent.replace(
  "import { Link } from 'react-router-dom';",
  "import { Link, useNavigate, useLocation } from 'react-router-dom';"
);

// Ensure useAuth is imported
if (!tcContent.includes('useAuth')) {
  tcContent = tcContent.replace(
    "import { useCart } from '../../context/CartContext';",
    "import { useCart } from '../../context/CartContext';\nimport { useAuth } from '../../context/AuthContext';"
  );
}

// Ensure hooks are initialized
if (!tcContent.includes('const navigate = useNavigate();')) {
  tcContent = tcContent.replace(
    "const { addToCart } = useCart();",
    "const { addToCart } = useCart();\n  const { user } = useAuth();\n  const navigate = useNavigate();\n  const location = useLocation();"
  );
}

// Update handleQuickAdd
const oldQuickAdd = `  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (seats <= 0) {
      toast.warning('Tour này hiện đã hết chỗ nhận khách');
      return;
    }
    addToCart(tour, 1);
  };`;

const newQuickAdd = `  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Vui lòng đăng nhập tài khoản để đặt tour!');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (seats <= 0) {
      toast.warning('Tour này hiện đã hết chỗ nhận khách');
      return;
    }
    addToCart(tour, 1);
  };

  const handleToggleSaved = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Vui lòng đăng nhập để lưu tour vào danh sách yêu thích!');
      navigate('/login', { state: { from: location } });
      return;
    }
    toggleSaved(tour);
  };`;

tcContent = tcContent.replace(oldQuickAdd.replace(/\n/g, '\r\n'), newQuickAdd.replace(/\n/g, '\r\n'));
tcContent = tcContent.replace(oldQuickAdd, newQuickAdd);

// Replace save button onClick in TourCard.jsx
tcContent = tcContent.replace(
  `        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSaved(tour);
        }}`,
  `        onClick={handleToggleSaved}`
);
tcContent = tcContent.replace(
  `onClick={(e) => {\r\n          e.preventDefault();\r\n          e.stopPropagation();\r\n          toggleSaved(tour);\r\n        }}`,
  `onClick={handleToggleSaved}`
);

fs.writeFileSync(tourCardPath, tcContent, 'utf8');
console.log('TourCard.jsx updated with login requirement for wishlist and quick add.');

// 3. Update src/pages/TourDetailPage.jsx
const detailPath = path.resolve(__dirname, '../src/pages/TourDetailPage.jsx');
let dtContent = fs.readFileSync(detailPath, 'utf8');

// Ensure useLocation, useAuth, getTourImage are imported
dtContent = dtContent.replace(
  "import { useParams, useNavigate, Link } from 'react-router-dom';",
  "import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';"
);

if (!dtContent.includes('useAuth')) {
  dtContent = dtContent.replace(
    "import { useWishlist } from '../context/WishlistContext';",
    "import { useWishlist } from '../context/WishlistContext';\nimport { useAuth } from '../context/AuthContext';\nimport { getTourImage } from '../utils/tourImages';"
  );
}

// In component setup
dtContent = dtContent.replace(
  "const { isSaved, toggleSaved } = useWishlist();",
  "const { isSaved, toggleSaved } = useWishlist();\n  const { user } = useAuth();\n  const location = useLocation();"
);

// Add window.scrollTo in fetchTour useEffect
dtContent = dtContent.replace(
  "  useEffect(() => {\n    const fetchTour = async () => {",
  "  useEffect(() => {\n    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });\n    const fetchTour = async () => {"
);
dtContent = dtContent.replace(
  "  useEffect(() => {\r\n    const fetchTour = async () => {",
  "  useEffect(() => {\r\n    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });\r\n    const fetchTour = async () => {"
);

// Update handleAddToCart and handleBuyNow and add handleToggleSaved
const oldCartHandlers = `  const handleAddToCart = () => {
    tourApi.recordActivity(tour.id, 'ADD_TO_CART');
    addToCart(tour, quantity);
  };

  const handleBuyNow = () => {
    tourApi.recordActivity(tour.id, 'ADD_TO_CART');
    if (addToCart(tour, quantity)) {
      navigate('/checkout');
    }
  };`;

const newCartHandlers = `  const handleToggleSaved = () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để lưu tour vào danh sách yêu thích!');
      navigate('/login', { state: { from: location } });
      return;
    }
    toggleSaved(tour);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập tài khoản để đặt tour!');
      navigate('/login', { state: { from: location } });
      return;
    }
    tourApi.recordActivity(tour.id, 'ADD_TO_CART');
    addToCart(tour, quantity);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập tài khoản để tiến hành đặt tour!');
      navigate('/login', { state: { from: location } });
      return;
    }
    tourApi.recordActivity(tour.id, 'ADD_TO_CART');
    if (addToCart(tour, quantity)) {
      navigate('/checkout');
    }
  };`;

dtContent = dtContent.replace(oldCartHandlers.replace(/\n/g, '\r\n'), newCartHandlers.replace(/\n/g, '\r\n'));
dtContent = dtContent.replace(oldCartHandlers, newCartHandlers);

// Update save button onClick in TourDetailPage.jsx
dtContent = dtContent.replace(
  "onClick={() => toggleSaved(tour)}",
  "onClick={handleToggleSaved}"
);

// Use getTourImage for hero image in TourDetailPage.jsx
dtContent = dtContent.replace(
  "src={tour.imageUrl}",
  "src={getTourImage(tour)}"
);

fs.writeFileSync(detailPath, dtContent, 'utf8');
console.log('TourDetailPage.jsx updated with ScrollToTop, login checks and getTourImage.');
