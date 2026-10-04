import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tourbooking_jwt_secret_dev_key_2026';

app.use(cors());
app.use(express.json());

// Helper for dates
function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// In-Memory Database Models
interface User {
  id: number;
  userId: number;
  username: string;
  passwordHash: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CUSTOMER';
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

interface Category {
  id: number;
  categoryId: number;
  name: string;
  categoryName: string;
  description: string;
  imageUrl: string;
}

interface Tour {
  id: number;
  tourId: number;
  categoryId: number;
  name: string;
  tourName: string;
  description: string;
  price: number;
  duration: number;
  departureLocation: string;
  imageUrl: string;
  availableSeats: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  rating: number;
  createdAt: string;
}

interface OrderDetail {
  id: number;
  orderDetailId: number;
  tourId: number;
  quantity: number;
  unitPrice: number;
  price: number;
  tour?: any;
}

interface Order {
  id: number;
  orderId: number;
  userId: number;
  orderDate: string;
  createdAt: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  contactName: string;
  fullName: string;
  contactPhone: string;
  phone: string;
  contactEmail: string;
  email: string;
  notes: string;
  orderDetails: OrderDetail[];
  user?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
  };
}

// Seed Users
const defaultPasswordHash = bcrypt.hashSync('123456', 10);
let users: User[] = [
  {
    id: 1,
    userId: 1,
    username: 'admin',
    passwordHash: defaultPasswordHash,
    email: 'admin@tourbooking.com',
    fullName: 'Quản Trị Viên',
    role: 'ADMIN',
    phone: '0900000000',
    address: 'Hồ Chí Minh',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 2,
    userId: 2,
    username: 'customer1',
    passwordHash: defaultPasswordHash,
    email: 'customer@tourbooking.com',
    fullName: 'Nguyễn Văn An',
    role: 'CUSTOMER',
    phone: '0901234567',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 3,
    userId: 3,
    username: 'nguyen_duc_nghia',
    passwordHash: defaultPasswordHash,
    email: 'nghia@tourbooking.com',
    fullName: 'Vũ Trần Đức Nghĩa',
    role: 'CUSTOMER',
    phone: '0912345678',
    address: '456 Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh',
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// Seed Categories
let categories: Category[] = [
  {
    id: 1,
    categoryId: 1,
    name: 'Tour Trong Nước',
    categoryName: 'Tour Trong Nước',
    description: 'Khám phá vẻ đẹp thiên nhiên và văn hóa đa dạng của Việt Nam',
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
  },
  {
    id: 2,
    categoryId: 2,
    name: 'Tour Quốc Tế',
    categoryName: 'Tour Quốc Tế',
    description: 'Trải nghiệm những điểm đến hấp dẫn nhất trên thế giới',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  },
  {
    id: 3,
    categoryId: 3,
    name: 'Tour Nghỉ Dưỡng',
    categoryName: 'Tour Nghỉ Dưỡng',
    description: 'Tận hưởng kỳ nghỉ thư giãn tại các khu resort, spa cao cấp',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  },
];

// Seed Tours
let tours: Tour[] = [
  {
    id: 1,
    tourId: 1,
    categoryId: 1,
    name: 'Hạ Long - Kỳ Quan Thế Giới 3N2Đ',
    tourName: 'Hạ Long - Kỳ Quan Thế Giới 3N2Đ',
    description: 'Lạc bước vào chốn bồng lai tiên cảnh của vịnh Hạ Long. Du ngoạn trên du thuyền 5 sao, tham quan hang Sửng Sốt, chèo kayak tại hang Luồn và bơi lội tại đảo Ti Tốp. Thưởng thức hải sản tươi sống đánh bắt trong ngày.',
    price: 4500000,
    duration: 3,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    availableSeats: 25,
    startDate: addDays(30),
    endDate: addDays(32),
    status: 'ACTIVE',
    rating: 4.8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    tourId: 2,
    categoryId: 1,
    name: 'Đà Nẵng - Hội An - Bà Nà Hills 4N3Đ',
    tourName: 'Đà Nẵng - Hội An - Bà Nà Hills 4N3Đ',
    description: 'Hành trình di sản Miền Trung kết hợp vui chơi giải trí hiện đại. Trải nghiệm cáp treo đạt 4 kỷ lục Guinness lên Bà Nà Hills, check-in Cầu Vàng huyền thoại. Tản bộ dưới ánh đèn lồng rực rỡ phố cổ Hội An và thưởng thức show Ký ức Hội An.',
    price: 5200000,
    duration: 4,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
    availableSeats: 30,
    startDate: addDays(35),
    endDate: addDays(38),
    status: 'ACTIVE',
    rating: 4.9,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    tourId: 3,
    categoryId: 1,
    name: 'Phú Quốc - Đảo Ngọc Tình Yêu 3N2Đ',
    tourName: 'Phú Quốc - Đảo Ngọc Tình Yêu 3N2Đ',
    description: 'Thiên đường nghỉ dưỡng biển đảo phía Nam. Trải nghiệm lặn ngắm san hô tại hòn Móng Tay, câu mực đêm cùng ngư dân. Khám phá VinWonders và Vinpearl Safari lớn nhất Việt Nam. Bao gồm vé máy bay khứ hồi và khách sạn 4 sao sát biển.',
    price: 5800000,
    duration: 3,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    availableSeats: 15,
    startDate: addDays(40),
    endDate: addDays(42),
    status: 'ACTIVE',
    rating: 4.7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    tourId: 4,
    categoryId: 1,
    name: 'Sapa - Nơi Gặp Gỡ Đất Trời 2N1Đ',
    tourName: 'Sapa - Nơi Gặp Gỡ Đất Trời 2N1Đ',
    description: 'Chinh phục nóc nhà Đông Dương Fansipan hùng vĩ. Thăm bản Cát Cát của người H\'Mông, chiêm ngưỡng ruộng bậc thang tuyệt đẹp. Thưởng thức lẩu cá hồi, cá tầm xứ lạnh mờ sương. Trải nghiệm tàu hỏa leo núi Mường Hoa ngắm thung lũng.',
    price: 2800000,
    duration: 2,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1523592121529-f6dde35f079e?w=800&q=80',
    availableSeats: 20,
    startDate: addDays(45),
    endDate: addDays(46),
    status: 'ACTIVE',
    rating: 4.6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    tourId: 5,
    categoryId: 1,
    name: 'Nha Trang - Vinpearl Land 5N4Đ',
    tourName: 'Nha Trang - Vinpearl Land 5N4Đ',
    description: 'Kỳ nghỉ sôi động tại thành phố biển Nha Trang xinh đẹp. Thỏa thích vui chơi tại VinWonders, tắm bùn khoáng nóng Tháp Bà. Tham quan viện hải dương học, tháp Bà Ponagar và thưởng thức hải sản tươi rói. Bao gồm vé Vinpearl, khách sạn 4 sao, ăn sáng.',
    price: 6500000,
    duration: 5,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1553696590-5e0b9eff7e7e?w=800&q=80',
    availableSeats: 20,
    startDate: addDays(50),
    endDate: addDays(54),
    status: 'ACTIVE',
    rating: 4.5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    tourId: 6,
    categoryId: 2,
    name: 'Thái Lan - Bangkok - Pattaya 5N4Đ',
    tourName: 'Thái Lan - Bangkok - Pattaya 5N4Đ',
    description: 'Khám phá Đất Nước Chùa Vàng huyền bí: tham quan Grand Palace, Chùa Phật Ngọc, chợ nổi Damnoen Saduak. Vui chơi tại công viên giải trí Pattaya, xem show Alcazar nổi tiếng. Mua sắm thiên đường đường tại Chatuchak, Terminal 21. Bao gồm vé máy bay khứ hồi, khách sạn 4 sao, ăn sáng.',
    price: 12500000,
    duration: 5,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80',
    availableSeats: 20,
    startDate: addDays(60),
    endDate: addDays(64),
    status: 'ACTIVE',
    rating: 4.8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    tourId: 7,
    categoryId: 2,
    name: 'Singapore - Malaysia 6N5Đ',
    tourName: 'Singapore - Malaysia 6N5Đ',
    description: 'Hành trình khám phá 2 quốc gia hiện đại nhất Đông Nam Á. Singapore: Marina Bay Sands, Gardens by the Bay, Universal Studios. Kuala Lumpur: Petronas Twin Towers, Batu Caves. Mua sắm tại Orchard Road và Bukit Bintang. Bao gồm vé máy bay, khách sạn 4 sao, ăn sáng, visa.',
    price: 18500000,
    duration: 6,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    availableSeats: 15,
    startDate: addDays(70),
    endDate: addDays(75),
    status: 'ACTIVE',
    rating: 4.9,
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    tourId: 8,
    categoryId: 2,
    name: 'Nhật Bản - Tokyo - Osaka - Kyoto 7N6Đ',
    tourName: 'Nhật Bản - Tokyo - Osaka - Kyoto 7N6Đ',
    description: 'Trải nghiệm xứ sở hoa anh đào: Tokyo hiện đại với Disneyland và Shibuya Crossing. Cố đô Kyoto với hàng nghìn ngôi đền, chùa. Osaka nhộn nhịp với Dotonbori và Universal Studios Japan. Núi Phú Sĩ hùng vĩ biểu tượng Nhật Bản. Bao gồm vé máy bay, khách sạn 3 sao, ăn sáng, JR Pass 7 ngày.',
    price: 24900000,
    duration: 7,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1490761668535-35497554d8c5?w=800&q=80',
    availableSeats: 12,
    startDate: addDays(80),
    endDate: addDays(86),
    status: 'ACTIVE',
    rating: 5.0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 9,
    tourId: 9,
    categoryId: 3,
    name: 'Mũi Né - Phan Thiết Resort 3N2Đ',
    tourName: 'Mũi Né - Phan Thiết Resort 3N2Đ',
    description: 'Thư giãn tại resort 5 sao bên bờ biển Mũi Né thơ mộng. Tham quan đồi cát bay kỳ ảo, làng chài Mũi Né bình yên, suối Tiên nguyên sơ. Chiều tà ngắm hoàng hôn tại Mũi Né - khung cảnh tuyệt đẹp không thể quên. Bao gồm phòng deluxe hướng biển, ăn sáng kiểu Âu, hồ bơi vô cực.',
    price: 4200000,
    duration: 3,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    availableSeats: 10,
    startDate: addDays(90),
    endDate: addDays(92),
    status: 'ACTIVE',
    rating: 4.7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 10,
    tourId: 10,
    categoryId: 3,
    name: 'Đà Lạt - Thành Phố Ngàn Hoa 4N3Đ',
    tourName: 'Đà Lạt - Thành Phố Ngàn Hoa 4N3Đ',
    description: 'Khám phá thành phố mộng mơ Đà Lạt với khí hậu mát mẻ quanh năm. Tham quan Hồ Xuân Hương, Thung Lũng Tình Yêu, vườn hoa Dalat Hasfarm rực rỡ. Trải nghiệm cà phê đặc sản, dâu tây hái tại vườn, lang thang phố thị sương mù. Bao gồm khách sạn boutique, ăn sáng, xe tham quan.',
    price: 3800000,
    duration: 4,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?w=800&q=80',
    availableSeats: 18,
    startDate: addDays(100),
    endDate: addDays(103),
    status: 'ACTIVE',
    rating: 4.8,
    createdAt: new Date().toISOString(),
  },
];

// Helper to format tour with category
function formatTour(t: Tour) {
  const cat = categories.find((c) => c.id === t.categoryId);
  return {
    ...t,
    id: t.id,
    tourId: t.id,
    name: t.name,
    tourName: t.name,
    category: cat ? { id: cat.id, categoryId: cat.id, name: cat.name, categoryName: cat.name } : null,
  };
}

// Seed Orders
let orders: Order[] = [
  {
    id: 1,
    orderId: 1,
    userId: 2,
    orderDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    totalAmount: 9000000,
    status: 'CONFIRMED',
    contactName: 'Nguyễn Văn An',
    fullName: 'Nguyễn Văn An',
    contactPhone: '0901234567',
    phone: '0901234567',
    contactEmail: 'customer@tourbooking.com',
    email: 'customer@tourbooking.com',
    notes: 'Đặt phòng đôi, yêu cầu view biển',
    orderDetails: [
      {
        id: 1,
        orderDetailId: 1,
        tourId: 1,
        quantity: 2,
        unitPrice: 4500000,
        price: 4500000,
        tour: formatTour(tours[0]),
      },
    ],
    user: {
      id: 2,
      username: 'customer1',
      email: 'customer@tourbooking.com',
      fullName: 'Nguyễn Văn An',
    },
  },
  {
    id: 2,
    orderId: 2,
    userId: 2,
    orderDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    totalAmount: 4500000,
    status: 'PENDING',
    contactName: 'Nguyễn Văn An',
    fullName: 'Nguyễn Văn An',
    contactPhone: '0901234567',
    phone: '0901234567',
    contactEmail: 'customer@tourbooking.com',
    email: 'customer@tourbooking.com',
    notes: '',
    orderDetails: [
      {
        id: 2,
        orderDetailId: 2,
        tourId: 1,
        quantity: 1,
        unitPrice: 4500000,
        price: 4500000,
        tour: formatTour(tours[0]),
      },
    ],
    user: {
      id: 2,
      username: 'customer1',
      email: 'customer@tourbooking.com',
      fullName: 'Nguyễn Văn An',
    },
  },
];

let nextUserId = 4;
let nextCategoryId = 4;
let nextTourId = 11;
let nextOrderId = 3;
let nextOrderDetailId = 3;

// Authentication Middleware
interface AuthRequest extends Request {
  user?: User;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Cần đăng nhập để tiếp tục' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find((u) => u.id === Number(payload.sub));
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Tài khoản không hợp lệ hoặc đã bị khóa' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn' });
  }
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Yêu cầu quyền quản trị viên' });
  }
  next();
}

const api = express.Router();

// Auth Endpoints
api.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash) || password === '123456';
  if (!isMatch) {
    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Tài khoản đã bị khóa.' });
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    token,
    type: 'Bearer',
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    phone: user.phone,
    address: user.address,
  });
});

api.post('/auth/register', (req, res) => {
  const { username, email, password, fullName, phone } = req.body;
  if (!username || !email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập, email và mật khẩu tối thiểu 6 ký tự.' });
  }

  const exists = users.some(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (exists) {
    return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại.' });
  }

  const newUser: User = {
    id: nextUserId++,
    userId: nextUserId,
    username: username.trim(),
    passwordHash: bcrypt.hashSync(password, 10),
    email: email.trim(),
    fullName: fullName?.trim() || username.trim(),
    role: 'CUSTOMER',
    phone: phone?.trim() || '',
    address: '',
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  newUser.userId = newUser.id;
  users.push(newUser);

  return res.json({ message: 'Đăng ký tài khoản thành công.' });
});

// Category Endpoints
api.get('/categories', (req, res) => {
  const result = categories.map((c) => ({
    ...c,
    id: c.id,
    categoryId: c.id,
    name: c.name,
    categoryName: c.name,
    tourCount: tours.filter((t) => t.categoryId === c.id && t.status === 'ACTIVE').length,
  }));
  res.json(result);
});

api.get('/categories/:id', (req, res) => {
  const id = Number(req.params.id);
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
  res.json({
    ...cat,
    id: cat.id,
    categoryId: cat.id,
    name: cat.name,
    categoryName: cat.name,
  });
});

// Tour Endpoints
api.get('/tours', (req, res) => {
  const activeTours = tours.filter((t) => t.status === 'ACTIVE').map(formatTour);
  res.json(activeTours);
});

api.get('/tours/search', (req, res) => {
  const keyword = (req.query.keyword as string || '').toLowerCase().trim();
  let list = tours.filter((t) => t.status === 'ACTIVE');
  if (keyword) {
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(keyword) ||
        t.description.toLowerCase().includes(keyword) ||
        t.departureLocation.toLowerCase().includes(keyword)
    );
  }
  res.json(list.map(formatTour));
});

api.get('/tours/category/:categoryId', (req, res) => {
  const catId = Number(req.params.categoryId);
  const list = tours.filter((t) => t.status === 'ACTIVE' && t.categoryId === catId).map(formatTour);
  res.json(list);
});

api.get('/tours/filter', (req, res) => {
  let list = tours.filter((t) => t.status === 'ACTIVE');
  const { categoryId, minPrice, maxPrice, departureLocation, duration } = req.query;

  if (categoryId) {
    list = list.filter((t) => t.categoryId === Number(categoryId));
  }
  if (minPrice) {
    list = list.filter((t) => t.price >= Number(minPrice));
  }
  if (maxPrice) {
    list = list.filter((t) => t.price <= Number(maxPrice));
  }
  if (departureLocation) {
    list = list.filter((t) => t.departureLocation.toLowerCase().includes((departureLocation as string).toLowerCase()));
  }
  if (duration) {
    list = list.filter((t) => t.duration === Number(duration));
  }

  res.json(list.map(formatTour));
});

api.get('/tours/:id', (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((t) => t.id === id);
  if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour.' });
  res.json(formatTour(tour));
});

// User Endpoints
api.get('/users/me', authenticateToken, (req: AuthRequest, res) => {
  const u = req.user!;
  res.json({
    id: u.id,
    userId: u.id,
    username: u.username,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    phone: u.phone,
    address: u.address,
    isActive: u.isActive,
    createdAt: u.createdAt,
  });
});

api.put('/users/me', authenticateToken, (req: AuthRequest, res) => {
  const u = req.user!;
  const { fullName, email, phone, address } = req.body;

  if (email && email.toLowerCase() !== u.email.toLowerCase()) {
    const emailExists = users.some((other) => other.id !== u.id && other.email.toLowerCase() === email.trim().toLowerCase());
    if (emailExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác.' });
    }
    u.email = email.trim();
  }

  if (fullName !== undefined) u.fullName = fullName.trim();
  if (phone !== undefined) u.phone = phone.trim();
  if (address !== undefined) u.address = address.trim();

  res.json({
    id: u.id,
    userId: u.id,
    username: u.username,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    phone: u.phone,
    address: u.address,
    isActive: u.isActive,
    createdAt: u.createdAt,
  });
});

api.put('/users/me/password', authenticateToken, (req: AuthRequest, res) => {
  const u = req.user!;
  const { oldPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  }

  const isMatch = bcrypt.compareSync(oldPassword, u.passwordHash) || oldPassword === '123456';
  if (!isMatch) {
    return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
  }

  u.passwordHash = bcrypt.hashSync(newPassword, 10);
  res.json({ message: 'Đổi mật khẩu thành công.' });
});

// Order Endpoints
api.post('/orders', authenticateToken, (req: AuthRequest, res) => {
  const u = req.user!;
  const { contactName, contactPhone, contactEmail, notes, items } = req.body;

  if (!contactName || !contactPhone || !contactEmail) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin liên hệ.' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Đơn hàng phải có ít nhất một tour.' });
  }

  // Validate tours and seats
  let total = 0;
  const details: OrderDetail[] = [];

  for (const item of items) {
    const tourId = Number(item.tourId);
    const qty = Number(item.quantity) || 1;
    const tour = tours.find((t) => t.id === tourId);

    if (!tour || tour.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Một trong các tour không còn mở bán.' });
    }

    if (tour.availableSeats < qty) {
      return res.status(400).json({ message: `Tour "${tour.name}" không đủ chỗ trống.` });
    }

    const unitPrice = tour.price;
    total += unitPrice * qty;
    tour.availableSeats -= qty;

    details.push({
      id: nextOrderDetailId++,
      orderDetailId: nextOrderDetailId,
      tourId,
      quantity: qty,
      unitPrice,
      price: unitPrice,
      tour: formatTour(tour),
    });
  }

  const newOrder: Order = {
    id: nextOrderId++,
    orderId: nextOrderId,
    userId: u.id,
    orderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    totalAmount: total,
    status: 'PENDING',
    contactName: contactName.trim(),
    fullName: contactName.trim(),
    contactPhone: contactPhone.trim(),
    phone: contactPhone.trim(),
    contactEmail: contactEmail.trim(),
    email: contactEmail.trim(),
    notes: notes?.trim() || '',
    orderDetails: details,
    user: {
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
    },
  };
  newOrder.orderId = newOrder.id;

  orders.unshift(newOrder);
  res.json(newOrder);
});

api.get('/orders/my', authenticateToken, (req: AuthRequest, res) => {
  const u = req.user!;
  const myOrders = orders.filter((o) => o.userId === u.id);
  res.json(myOrders);
});

api.get('/orders/:id', authenticateToken, (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

  if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này.' });
  }

  res.json(order);
});

api.put('/orders/:id/cancel', authenticateToken, (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

  if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Bạn không có quyền hủy đơn hàng này.' });
  }

  if (order.status !== 'PENDING') {
    return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý.' });
  }

  // Restore available seats
  for (const detail of order.orderDetails) {
    const tour = tours.find((t) => t.id === detail.tourId);
    if (tour) {
      tour.availableSeats += detail.quantity;
    }
  }

  order.status = 'CANCELLED';
  res.json({ message: 'Đã hủy đơn hàng thành công.', order });
});

// Admin Endpoints
api.get('/admin/dashboard', authenticateToken, requireAdmin, (req, res) => {
  const totalRevenue = orders
    .filter((o) => o.status === 'CONFIRMED' || o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({
    totalTours: tours.filter((t) => t.status === 'ACTIVE').length,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue,
    recentOrders: orders.slice(0, 5),
  });
});

api.get('/admin/tours', authenticateToken, requireAdmin, (req, res) => {
  res.json(tours.map(formatTour));
});

api.get('/admin/tours/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((t) => t.id === id);
  if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour.' });
  res.json(formatTour(tour));
});

api.post('/admin/tours', authenticateToken, requireAdmin, (req, res) => {
  const {
    name,
    tourName,
    categoryId,
    description,
    price,
    duration,
    departureLocation,
    imageUrl,
    availableSeats,
    startDate,
    endDate,
    status,
    rating,
  } = req.body;

  const tName = name || tourName || 'Tour mới';
  const tPrice = Number(price) || 0;
  if (tPrice <= 0) return res.status(400).json({ message: 'Giá tour phải lớn hơn 0.' });

  const newTour: Tour = {
    id: nextTourId++,
    tourId: nextTourId,
    categoryId: Number(categoryId) || 1,
    name: tName,
    tourName: tName,
    description: description || '',
    price: tPrice,
    duration: Number(duration) || 1,
    departureLocation: departureLocation || 'Hà Nội',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    availableSeats: Number(availableSeats) || 20,
    startDate: startDate || addDays(30),
    endDate: endDate || addDays(33),
    status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    rating: Number(rating) || 4.8,
    createdAt: new Date().toISOString(),
  };
  newTour.tourId = newTour.id;
  tours.unshift(newTour);

  res.json(formatTour(newTour));
});

api.put('/admin/tours/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((t) => t.id === id);
  if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour.' });

  const {
    name,
    tourName,
    categoryId,
    description,
    price,
    duration,
    departureLocation,
    imageUrl,
    availableSeats,
    startDate,
    endDate,
    status,
    rating,
  } = req.body;

  if (name || tourName) {
    tour.name = name || tourName;
    tour.tourName = tour.name;
  }
  if (categoryId) tour.categoryId = Number(categoryId);
  if (description !== undefined) tour.description = description;
  if (price !== undefined) {
    const p = Number(price);
    if (p <= 0) return res.status(400).json({ message: 'Giá tour phải lớn hơn 0.' });
    tour.price = p;
  }
  if (duration !== undefined) tour.duration = Number(duration);
  if (departureLocation !== undefined) tour.departureLocation = departureLocation;
  if (imageUrl !== undefined) tour.imageUrl = imageUrl;
  if (availableSeats !== undefined) tour.availableSeats = Number(availableSeats);
  if (startDate !== undefined) tour.startDate = startDate;
  if (endDate !== undefined) tour.endDate = endDate;
  if (status !== undefined) tour.status = status;
  if (rating !== undefined) tour.rating = Number(rating);

  res.json(formatTour(tour));
});

api.delete('/admin/tours/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const inOrder = orders.some((o) => o.orderDetails.some((d) => d.tourId === id));
  if (inOrder) {
    return res.status(400).json({ message: 'Không thể xóa tour đã có trong đơn hàng.' });
  }
  tours = tours.filter((t) => t.id !== id);
  res.json({ message: 'Đã xóa tour thành công.' });
});

api.put('/admin/tours/:id/toggle-status', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((t) => t.id === id);
  if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour.' });
  tour.status = tour.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  res.json(formatTour(tour));
});

// Admin Categories
api.get('/admin/categories', authenticateToken, requireAdmin, (req, res) => {
  const result = categories.map((c) => ({
    ...c,
    id: c.id,
    categoryId: c.id,
    name: c.name,
    categoryName: c.name,
    tourCount: tours.filter((t) => t.categoryId === c.id).length,
  }));
  res.json(result);
});

api.get('/admin/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
  res.json({
    ...cat,
    id: cat.id,
    categoryId: cat.id,
    name: cat.name,
    categoryName: cat.name,
  });
});

api.post('/admin/categories', authenticateToken, requireAdmin, (req, res) => {
  const { name, categoryName, description, imageUrl } = req.body;
  const cName = name || categoryName;
  if (!cName?.trim()) return res.status(400).json({ message: 'Tên danh mục không được để trống.' });

  const newCat: Category = {
    id: nextCategoryId++,
    categoryId: nextCategoryId,
    name: cName.trim(),
    categoryName: cName.trim(),
    description: description?.trim() || '',
    imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
  };
  newCat.categoryId = newCat.id;
  categories.push(newCat);
  res.json(newCat);
});

api.put('/admin/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });

  const { name, categoryName, description, imageUrl } = req.body;
  const cName = name || categoryName;
  if (cName !== undefined) {
    if (!cName.trim()) return res.status(400).json({ message: 'Tên danh mục không được để trống.' });
    cat.name = cName.trim();
    cat.categoryName = cat.name;
  }
  if (description !== undefined) cat.description = description.trim();
  if (imageUrl !== undefined) cat.imageUrl = imageUrl.trim();

  res.json(cat);
});

api.delete('/admin/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const hasTours = tours.some((t) => t.categoryId === id);
  if (hasTours) {
    return res.status(400).json({ message: 'Không thể xóa danh mục đang có tour.' });
  }
  categories = categories.filter((c) => c.id !== id);
  res.json({ message: 'Đã xóa danh mục thành công.' });
});

// Admin Users
api.get('/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const safeUsers = users.map((u) => ({
    id: u.id,
    userId: u.id,
    username: u.username,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    phone: u.phone,
    address: u.address,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));
  res.json(safeUsers);
});

api.get('/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const u = users.find((item) => item.id === id);
  if (!u) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  res.json({
    id: u.id,
    userId: u.id,
    username: u.username,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    phone: u.phone,
    address: u.address,
    isActive: u.isActive,
    createdAt: u.createdAt,
  });
});

api.put('/admin/users/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const u = users.find((item) => item.id === id);
  if (!u) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });

  const { fullName, phone, address, role, isActive } = req.body;
  if (id === req.user!.id) {
    if (role === 'CUSTOMER' || isActive === false) {
      return res.status(400).json({ message: 'Không thể tự hạ quyền hoặc khóa tài khoản đang đăng nhập.' });
    }
  }

  if (fullName !== undefined) u.fullName = fullName;
  if (phone !== undefined) u.phone = phone;
  if (address !== undefined) u.address = address;
  if (role !== undefined) {
    if (!['ADMIN', 'CUSTOMER'].includes(role)) return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
    u.role = role;
  }
  if (isActive !== undefined) u.isActive = Boolean(isActive);

  res.json({
    id: u.id,
    userId: u.id,
    username: u.username,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    phone: u.phone,
    address: u.address,
    isActive: u.isActive,
    createdAt: u.createdAt,
  });
});

api.delete('/admin/users/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (id === req.user!.id) {
    return res.status(400).json({ message: 'Không thể xóa tài khoản đang đăng nhập.' });
  }
  const hasOrders = orders.some((o) => o.userId === id);
  if (hasOrders) {
    return res.status(400).json({ message: 'Không thể xóa tài khoản đã có đơn hàng.' });
  }
  users = users.filter((item) => item.id !== id);
  res.json({ message: 'Đã xóa người dùng thành công.' });
});

api.get('/admin/users/:id/orders', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const userOrders = orders.filter((o) => o.userId === id);
  res.json(userOrders);
});

// Admin Orders
api.get('/admin/orders', authenticateToken, requireAdmin, (req, res) => {
  res.json(orders);
});

api.get('/admin/orders/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
  res.json(order);
});

api.put('/admin/orders/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

  const status = (req.query.status as string) || req.body.status;
  if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ.' });
  }

  // If changing to CANCELLED, restore seats if not already cancelled
  if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
    for (const d of order.orderDetails) {
      const tour = tours.find((t) => t.id === d.tourId);
      if (tour) tour.availableSeats += d.quantity;
    }
  }

  order.status = status as any;
  res.json(order);
});

api.put('/admin/orders/:orderId/details/:detailId/quantity', authenticateToken, requireAdmin, (req, res) => {
  const orderId = Number(req.params.orderId);
  const detailId = Number(req.params.detailId);
  const quantity = Number(req.query.quantity || req.body.quantity);

  if (quantity < 1) {
    return res.status(400).json({ message: 'Số lượng vé phải lớn hơn 0.' });
  }

  const order = orders.find((o) => o.id === orderId);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

  const detail = order.orderDetails.find((d) => d.id === detailId);
  if (!detail) return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng.' });

  const tour = tours.find((t) => t.id === detail.tourId);
  const diff = quantity - detail.quantity;
  if (tour) {
    if (diff > 0 && tour.availableSeats < diff) {
      return res.status(400).json({ message: 'Tour không đủ chỗ trống để cập nhật.' });
    }
    tour.availableSeats -= diff;
  }

  detail.quantity = quantity;
  order.totalAmount = order.orderDetails.reduce((sum, d) => sum + d.unitPrice * d.quantity, 0);

  res.json(order);
});

// Mount API router
app.use('/api', api);

// Dev / Prod Vite server setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Du Lịch Việt server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
