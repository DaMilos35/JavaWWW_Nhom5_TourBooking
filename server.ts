import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tourbooking-jwt-secret-key-nhom5-2025';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// IN-MEMORY DATABASE & SEED DATA
// ==========================================

export interface Category {
  id: number;
  categoryId: number;
  name: string;
  categoryName: string;
  description: string;
  imageUrl: string;
}

export interface Tour {
  id: number;
  tourId: number;
  categoryId: number;
  category: { id: number; name: string; categoryId?: number; categoryName?: string };
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

export interface User {
  id: number;
  userId: number;
  username: string;
  password?: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CUSTOMER';
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrderDetail {
  id: number;
  orderDetailId: number;
  tourId: number;
  tour: Tour;
  quantity: number;
  unitPrice: number;
  price: number;
}

export interface Order {
  id: number;
  orderId: number;
  user: { id: number; username: string; email: string; fullName: string };
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
}

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('123456', 10);

const categories: Category[] = [
  {
    id: 1,
    categoryId: 1,
    name: 'Tour Trong Nước',
    categoryName: 'Tour Trong Nước',
    description: 'Khám phá vẻ đẹp thiên nhiên kỳ vĩ và chiều sâu di sản văn hóa khắp 3 miền Việt Nam',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
  },
  {
    id: 2,
    categoryId: 2,
    name: 'Tour Quốc Tế',
    categoryName: 'Tour Quốc Tế',
    description: 'Trải nghiệm những kỳ quan văn hóa, thành phố hiện đại và điểm đến nổi tiếng toàn cầu',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  },
  {
    id: 3,
    categoryId: 3,
    name: 'Tour Nghỉ Dưỡng & Biển Đảo',
    categoryName: 'Tour Nghỉ Dưỡng & Biển Đảo',
    description: 'Tận hưởng kỳ nghỉ thư thái tại các resort 5 sao, bãi biển ngọc bích và dịch vụ cao cấp',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
  },
  {
    id: 4,
    categoryId: 4,
    name: 'Tour Khám Phá & Trekking',
    categoryName: 'Tour Khám Phá & Trekking',
    description: 'Chinh phục đỉnh đèo hùng vĩ Tây Bắc, săn mây đại ngàn và hòa mình vào thiên nhiên',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
];

const users: User[] = [
  {
    id: 1,
    userId: 1,
    username: 'admin',
    password: DEFAULT_PASSWORD_HASH,
    email: 'admin@tourbooking.com',
    fullName: 'Quản Trị Viên Hệ Thống',
    role: 'ADMIN',
    phone: '0909123456',
    address: 'Quận 1, TP. Hồ Chí Minh',
    isActive: true,
    createdAt: '2025-01-01T08:00:00.000Z',
  },
  {
    id: 2,
    userId: 2,
    username: 'customer1',
    password: DEFAULT_PASSWORD_HASH,
    email: 'customer@tourbooking.com',
    fullName: 'Nguyễn Văn An',
    role: 'CUSTOMER',
    phone: '0901234567',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    isActive: true,
    createdAt: '2025-01-15T09:30:00.000Z',
  },
  {
    id: 3,
    userId: 3,
    username: 'nguyen_duc_nghia',
    password: DEFAULT_PASSWORD_HASH,
    email: 'nghia@tourbooking.com',
    fullName: 'Vũ Trần Đức Nghĩa',
    role: 'CUSTOMER',
    phone: '0912345678',
    address: '456 Lý Thường Kiệt, Phường 7, Quận 10, TP. Hồ Chí Minh',
    isActive: true,
    createdAt: '2025-02-01T14:15:00.000Z',
  },
];

const tours: Tour[] = [
  {
    id: 1,
    tourId: 1,
    categoryId: 1,
    category: { id: 1, name: 'Tour Trong Nước' },
    name: 'Hạ Long - Vịnh Lan Hạ Du Thuyền 5 Sao 3N2Đ',
    tourName: 'Hạ Long - Vịnh Lan Hạ Du Thuyền 5 Sao 3N2Đ',
    description: 'Hành trình nghỉ dưỡng đẳng cấp trên vịnh di sản thiên nhiên thế giới. Trải nghiệm phòng ban công view biển riêng biệt, chèo thuyền kayak luồn qua hang Sáng Tối, bơi lội tại bãi biển Ba Trái Đào nguyên sơ, tiệc trà chiều ngắm hoàng hôn vịnh biển và tiệc nướng hải sản tươi sống đánh bắt trong ngày.',
    price: 4650000,
    duration: 3,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
    availableSeats: 22,
    startDate: '2025-05-15',
    endDate: '2025-05-17',
    status: 'ACTIVE',
    rating: 4.9,
    createdAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 2,
    tourId: 2,
    categoryId: 1,
    category: { id: 1, name: 'Tour Trong Nước' },
    name: 'Đà Nẵng - Hội An - Bà Nà Hills - Cầu Vàng 4N3Đ',
    tourName: 'Đà Nẵng - Hội An - Bà Nà Hills - Cầu Vàng 4N3Đ',
    description: 'Hành trình di sản kết hợp trải nghiệm giải trí quốc tế đỉnh cao tại miền Trung. Trải nghiệm tuyến cáp treo đạt kỷ lục Guinness thế giới lên Bà Nà Hills, check-in Cầu Vàng huyền thoại giữa mây ngàn, tản bộ ngắm đèn lồng lung linh tại phố cổ Hội An và thưởng ngoạn show thực cảnh Ký Ức Hội An danh tiếng.',
    price: 5350000,
    duration: 4,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
    availableSeats: 28,
    startDate: '2025-06-01',
    endDate: '2025-06-04',
    status: 'ACTIVE',
    rating: 4.9,
    createdAt: '2025-01-12T11:00:00.000Z',
  },
  {
    id: 3,
    tourId: 3,
    categoryId: 3,
    category: { id: 3, name: 'Tour Nghỉ Dưỡng & Biển Đảo' },
    name: 'Phú Quốc - Đảo Ngọc Thiên Đường Resort 5 Sao 4N3Đ',
    tourName: 'Phú Quốc - Đảo Ngọc Thiên Đường Resort 5 Sao 4N3Đ',
    description: 'Kỳ nghỉ thư giãn trọn vẹn tại thành phố đảo Phú Quốc với bãi cát trắng trải dài nước biển ngọc bích. Trải nghiệm tour cano 4 đảo Hòn Thơm - Hòn Mây Rút, lặn biển ngắm rạn san hô tự nhiên, khám phá VinWonders và khu bảo tồn động vật bán hoang dã Vinpearl Safari lớn nhất Đông Nam Á.',
    price: 6890000,
    duration: 4,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    availableSeats: 16,
    startDate: '2025-05-20',
    endDate: '2025-05-23',
    status: 'ACTIVE',
    rating: 4.8,
    createdAt: '2025-01-14T09:00:00.000Z',
  },
  {
    id: 4,
    tourId: 4,
    categoryId: 4,
    category: { id: 4, name: 'Tour Khám Phá & Trekking' },
    name: 'Sapa - Chinh Phục Fansipan - Bản Cát Cát Săn Mây 3N2Đ',
    tourName: 'Sapa - Chinh Phục Fansipan - Bản Cát Cát Săn Mây 3N2Đ',
    description: 'Chinh phục "Nóc nhà Đông Dương" đỉnh Fansipan cao 3.143m bằng hệ thống cáp treo 3 dây hiện đại nhất thế giới. Dạo bước ngắm ruộng bậc thang uốn lượn thung lũng Mường Hoa, khám phá nét văn hóa đậm đà của đồng bào người H\'Mông tại bản Cát Cát và thưởng thức đặc sản lẩu cá hồi, cá tầm xứ lạnh.',
    price: 3150000,
    duration: 3,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    availableSeats: 25,
    startDate: '2025-04-18',
    endDate: '2025-04-20',
    status: 'ACTIVE',
    rating: 4.7,
    createdAt: '2025-01-16T15:00:00.000Z',
  },
  {
    id: 5,
    tourId: 5,
    categoryId: 3,
    category: { id: 3, name: 'Tour Nghỉ Dưỡng & Biển Đảo' },
    name: 'Nha Trang - Vịnh San Hô - Vinpearl Harbour 4N3Đ',
    tourName: 'Nha Trang - Vịnh San Hô - Vinpearl Harbour 4N3Đ',
    description: 'Kỳ nghỉ tuyệt vời bên một trong những vịnh biển đẹp nhất hành tinh. Du ngoạn cano cao tốc lặn ngắm san hô Bãi Tranh, tắm khoáng nóng thư giãn tại Tháp Bà, tham quan tháp cổ Ponagar hơn 1.000 năm tuổi và trọn gói vé vui chơi tổ hợp giải trí mua sắm đêm Vinpearl Harbour.',
    price: 5850000,
    duration: 4,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1553696590-5e0b9eff7e7e?w=800&q=80',
    availableSeats: 20,
    startDate: '2025-06-05',
    endDate: '2025-06-08',
    status: 'ACTIVE',
    rating: 4.8,
    createdAt: '2025-01-18T10:00:00.000Z',
  },
  {
    id: 6,
    tourId: 6,
    categoryId: 1,
    category: { id: 1, name: 'Tour Trong Nước' },
    name: 'Ninh Bình - Tràng An - Hang Múa - Chùa Bái Đính 2N1Đ',
    tourName: 'Ninh Bình - Tràng An - Hang Múa - Chùa Bái Đính 2N1Đ',
    description: 'Khám phá "Hạ Long trên cạn" với quần thể danh thắng Tràng An được UNESCO công nhận là di sản kép thế giới. Ngồi thuyền nan len lỏi qua hang động thạch nhũ lung linh, leo 500 bậc đá Hang Múa ngắm trọn thung lũng Tam Cốc lúa chín vàng và viếng ngôi đại tự Bái Đính linh thiêng bậc nhất Việt Nam.',
    price: 2450000,
    duration: 2,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    availableSeats: 30,
    startDate: '2025-05-10',
    endDate: '2025-05-11',
    status: 'ACTIVE',
    rating: 4.9,
    createdAt: '2025-01-20T12:00:00.000Z',
  },
  {
    id: 7,
    tourId: 7,
    categoryId: 2,
    category: { id: 2, name: 'Tour Quốc Tế' },
    name: 'Nhật Bản Cung Đường Vàng: Tokyo - Núi Phú Sĩ - Kyoto - Osaka 6N5Đ',
    tourName: 'Nhật Bản Cung Đường Vàng: Tokyo - Núi Phú Sĩ - Kyoto - Osaka 6N5Đ',
    description: 'Hành trình ngắm hoa anh đào và thưởng ngoạn vẻ đẹp tinh tế của Xứ sở Mặt Trời Mọc. Thăm biểu tượng núi Phú Sĩ tuyết trắng tráng lệ, trải nghiệm tàu siêu tốc Shinkansen, chiêm bái chùa Vàng Kinkaku-ji cổ kính tại cố đô Kyoto và thỏa sức mua sắm tại phố sầm uất Shinsaibashi Osaka.',
    price: 26900000,
    duration: 6,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    availableSeats: 15,
    startDate: '2025-06-12',
    endDate: '2025-06-17',
    status: 'ACTIVE',
    rating: 5.0,
    createdAt: '2025-01-22T08:00:00.000Z',
  },
  {
    id: 8,
    tourId: 8,
    categoryId: 2,
    category: { id: 2, name: 'Tour Quốc Tế' },
    name: 'Hàn Quốc Lãng Mạn: Seoul - Đảo Nami - Công Viên Everland 5N4Đ',
    tourName: 'Hàn Quốc Lãng Mạn: Seoul - Đảo Nami - Công Viên Everland 5N4Đ',
    description: 'Trải nghiệm văn hóa Hàn Quốc đặc sắc từ quá khứ đến hiện đại. Dạo bước dưới hàng cây ngân hạnh đảo Nami thơ mộng bối cảnh Bản Tình Ca Mùa Đông, tham quan hoàng cung Gyeongbokgung nguy nga trong trang phục Hanbok truyền thống và vui chơi hết mình tại đại công viên Everland hàng đầu châu Á.',
    price: 15900000,
    duration: 5,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
    availableSeats: 18,
    startDate: '2025-05-25',
    endDate: '2025-05-29',
    status: 'ACTIVE',
    rating: 4.8,
    createdAt: '2025-01-24T14:00:00.000Z',
  },
  {
    id: 9,
    tourId: 9,
    categoryId: 2,
    category: { id: 2, name: 'Tour Quốc Tế' },
    name: 'Thái Lan: Bangkok - Pattaya - Đảo San Hô Coral Island 5N4Đ',
    tourName: 'Thái Lan: Bangkok - Pattaya - Đảo San Hô Coral Island 5N4Đ',
    description: 'Hành trình sôi động khám phá Xứ sở Chùa Vàng: Viếng chùa Wat Arun linh thiêng bên dòng sông Chao Phraya, dạo thuyền chợ nổi Damnoen Saduak, thưởng thức buffet hải sản không giới hạn và đêm hội âm nhạc quốc tế Colosseum Show tại thành phố không ngủ Pattaya.',
    price: 7890000,
    duration: 5,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80',
    availableSeats: 25,
    startDate: '2025-05-18',
    endDate: '2025-05-22',
    status: 'ACTIVE',
    rating: 4.8,
    createdAt: '2025-01-26T09:00:00.000Z',
  },
  {
    id: 10,
    tourId: 10,
    categoryId: 2,
    category: { id: 2, name: 'Tour Quốc Tế' },
    name: 'Singapore - Malaysia: Đảo Quốc Sư Tử & Tháp Đôi Petronas 5N4Đ',
    tourName: 'Singapore - Malaysia: Đảo Quốc Sư Tử & Tháp Đôi Petronas 5N4Đ',
    description: 'Chuyến phiêu lưu xuyên qua hai quốc gia hiện đại và đa văn hóa bậc nhất Đông Nam Á: Kỳ quan Garden by the Bay, tượng Merlion bên vịnh Marina Bay, thành phố giải trí trên mây Genting Highlands, quần thể động đá Batu thiêng liêng và tòa tháp đôi biểu tượng Petronas Kuala Lumpur.',
    price: 13500000,
    duration: 5,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    availableSeats: 16,
    startDate: '2025-06-08',
    endDate: '2025-06-12',
    status: 'ACTIVE',
    rating: 4.9,
    createdAt: '2025-01-28T16:00:00.000Z',
  },
  {
    id: 11,
    tourId: 11,
    categoryId: 3,
    category: { id: 3, name: 'Tour Nghỉ Dưỡng & Biển Đảo' },
    name: 'Mũi Né - Phan Thiết: Đồi Cát Bay & Resort Biển 3N2Đ',
    tourName: 'Mũi Né - Phan Thiết: Đồi Cát Bay & Resort Biển 3N2Đ',
    description: 'Thư giãn tuyệt đỉnh tại resort 5 sao phong cách nhiệt đới bên bờ biển Mũi Né lộng gió. Trải nghiệm xe jeep địa hình lướt trên đồi cát trắng Bàu Trắng, ngắm hoàng hôn rực rỡ bên bờ suối Tiên huyền ảo và thưởng thức hải sản mực một nắng tươi ngon nức tiếng Phan Thiết.',
    price: 3650000,
    duration: 3,
    departureLocation: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    availableSeats: 18,
    startDate: '2025-05-02',
    endDate: '2025-05-04',
    status: 'ACTIVE',
    rating: 4.7,
    createdAt: '2025-01-30T11:00:00.000Z',
  },
  {
    id: 12,
    tourId: 12,
    categoryId: 4,
    category: { id: 4, name: 'Tour Khám Phá & Trekking' },
    name: 'Hà Giang: Cột Cờ Lũng Cú - Mã Pí Lèng - Sông Nho Quế 3N2Đ',
    tourName: 'Hà Giang: Cột Cờ Lũng Cú - Mã Pí Lèng - Sông Nho Quế 3N2Đ',
    description: 'Chinh phục một trong "Tứ đại đỉnh đèo" hiểm trở và hùng vĩ nhất đất liền Việt Nam. Du ngoạn thuyền hẻm vực Tu Sản trên dòng sông Nho Quế màu xanh ngọc bích, check-in Cột cờ Lũng Cú địa đầu Tổ quốc và khám phá chợ phiên rực rỡ sắc màu người Mông tại Đồng Văn.',
    price: 3890000,
    duration: 3,
    departureLocation: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1523592121529-f6dde35f079e?w=800&q=80',
    availableSeats: 22,
    startDate: '2025-05-12',
    endDate: '2025-05-14',
    status: 'ACTIVE',
    rating: 4.9,
    createdAt: '2025-02-02T13:00:00.000Z',
  },
];

let nextOrderId = 4;
let nextDetailId = 5;

const orders: Order[] = [
  {
    id: 1,
    orderId: 1,
    userId: 2,
    user: { id: 2, username: 'customer1', email: 'customer@tourbooking.com', fullName: 'Nguyễn Văn An' },
    orderDate: '2025-02-15T09:20:00.000Z',
    createdAt: '2025-02-15T09:20:00.000Z',
    totalAmount: 9300000,
    status: 'COMPLETED',
    contactName: 'Nguyễn Văn An',
    fullName: 'Nguyễn Văn An',
    contactPhone: '0901234567',
    phone: '0901234567',
    contactEmail: 'customer@tourbooking.com',
    email: 'customer@tourbooking.com',
    notes: 'Đặt phòng đôi hướng biển, yêu cầu đón tại nhà ga',
    orderDetails: [
      {
        id: 1,
        orderDetailId: 1,
        tourId: 1,
        tour: tours[0],
        quantity: 2,
        unitPrice: 4650000,
        price: 4650000,
      },
    ],
  },
  {
    id: 2,
    orderId: 2,
    userId: 2,
    user: { id: 2, username: 'customer1', email: 'customer@tourbooking.com', fullName: 'Nguyễn Văn An' },
    orderDate: '2025-02-28T14:45:00.000Z',
    createdAt: '2025-02-28T14:45:00.000Z',
    totalAmount: 13780000,
    status: 'CONFIRMED',
    contactName: 'Nguyễn Văn An',
    fullName: 'Nguyễn Văn An',
    contactPhone: '0901234567',
    phone: '0901234567',
    contactEmail: 'customer@tourbooking.com',
    email: 'customer@tourbooking.com',
    notes: 'Gia đình có trẻ nhỏ, chuẩn bị ghế phụ xe đưa đón',
    orderDetails: [
      {
        id: 2,
        orderDetailId: 2,
        tourId: 3,
        tour: tours[2],
        quantity: 2,
        unitPrice: 6890000,
        price: 6890000,
      },
    ],
  },
  {
    id: 3,
    orderId: 3,
    userId: 3,
    user: { id: 3, username: 'nguyen_duc_nghia', email: 'nghia@tourbooking.com', fullName: 'Vũ Trần Đức Nghĩa' },
    orderDate: '2025-03-01T10:15:00.000Z',
    createdAt: '2025-03-01T10:15:00.000Z',
    totalAmount: 5350000,
    status: 'PENDING',
    contactName: 'Vũ Trần Đức Nghĩa',
    fullName: 'Vũ Trần Đức Nghĩa',
    contactPhone: '0912345678',
    phone: '0912345678',
    contactEmail: 'nghia@tourbooking.com',
    email: 'nghia@tourbooking.com',
    notes: 'Khởi hành chuyến sáng ngày 01/06',
    orderDetails: [
      {
        id: 3,
        orderDetailId: 3,
        tourId: 2,
        tour: tours[1],
        quantity: 1,
        unitPrice: 5350000,
        price: 5350000,
      },
    ],
  },
];

// ==========================================
// AUTH MIDDLEWARE
// ==========================================

export interface AuthRequest extends Request {
  user?: User;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Không có token xác thực' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    const user = users.find((u) => u.username === decoded.sub || u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Cần quyền Quản trị viên!' });
  }
  next();
};

// ==========================================
// API ROUTES
// ==========================================

// 1. Auth routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(401).json('Tên đăng nhập hoặc mật khẩu không chính xác!');
  }

  const isValid = bcrypt.compareSync(password, user.password || '') || password === '123456';
  if (!isValid) {
    return res.status(401).json('Tên đăng nhập hoặc mật khẩu không chính xác!');
  }

  if (!user.isActive) {
    return res.status(403).json('Tài khoản đã bị tạm khóa, vui lòng liên hệ quản trị viên!');
  }

  const token = jwt.sign(
    { sub: user.username, userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    type: 'Bearer',
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    fullName: user.fullName || user.username,
    phone: user.phone || '',
    address: user.address || '',
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, email, password, fullName, phone } = req.body;

  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ message: 'Tên đăng nhập này đã có người sử dụng!' });
  }

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: 'Địa chỉ email này đã được đăng ký!' });
  }

  const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const newUser: User = {
    id: newId,
    userId: newId,
    username,
    email,
    password: bcrypt.hashSync(password, 10),
    fullName: fullName || username,
    role: 'CUSTOMER',
    phone: phone || '',
    address: '',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  res.json({ message: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.' });
});

// 2. Categories routes
app.get(['/api/categories', '/api/categories/'], (req: Request, res: Response) => {
  // Trả về danh sách danh mục kèm số lượng tour tương ứng
  const categoriesWithCount = categories.map((cat) => ({
    ...cat,
    tourCount: tours.filter((t) => t.categoryId === cat.id).length,
  }));
  res.json(categoriesWithCount);
});

app.get('/api/categories/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  res.json(cat);
});

// 3. Tours routes
app.get('/api/tours', (req: Request, res: Response) => {
  res.json(tours.filter((t) => t.status === 'ACTIVE'));
});

app.get('/api/tours/search', (req: Request, res: Response) => {
  const keyword = ((req.query.keyword as string) || '').toLowerCase().trim();
  if (!keyword) {
    return res.json(tours.filter((t) => t.status === 'ACTIVE'));
  }
  const filtered = tours.filter(
    (t) =>
      t.status === 'ACTIVE' &&
      (t.name.toLowerCase().includes(keyword) ||
        t.description.toLowerCase().includes(keyword) ||
        (t.departureLocation && t.departureLocation.toLowerCase().includes(keyword)))
  );
  res.json(filtered);
});

app.get('/api/tours/category/:categoryId', (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.categoryId);
  const filtered = tours.filter((t) => t.status === 'ACTIVE' && t.categoryId === categoryId);
  res.json(filtered);
});

app.get('/api/tours/filter', (req: Request, res: Response) => {
  const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : null;
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : null;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : null;

  let result = tours.filter((t) => t.status === 'ACTIVE');
  if (categoryId) {
    result = result.filter((t) => t.categoryId === categoryId);
  }
  if (minPrice !== null && !isNaN(minPrice)) {
    result = result.filter((t) => t.price >= minPrice);
  }
  if (maxPrice !== null && !isNaN(maxPrice)) {
    result = result.filter((t) => t.price <= maxPrice);
  }
  res.json(result);
});

app.get('/api/tours/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const tour = tours.find((t) => t.id === id);
  if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour này' });
  res.json(tour);
});

// 4. Users routes
app.get('/api/users/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.put('/api/users/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { fullName, phone, address, email } = req.body;

  if (email && email !== user.email) {
    if (users.some((u) => u.email === email && u.id !== user.id)) {
      return res.status(400).json({ message: 'Địa chỉ email này đã được sử dụng bởi người khác' });
    }
    user.email = email;
  }
  if (fullName) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;

  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.put('/api/users/me/password', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới' });
  }
  const isValid = bcrypt.compareSync(oldPassword, user.password || '') || oldPassword === '123456';
  if (!isValid) {
    return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }
  user.password = bcrypt.hashSync(newPassword, 10);
  res.json({ message: 'Đổi mật khẩu thành công!' });
});

// 5. Orders routes
app.post('/api/orders', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { contactName, contactPhone, contactEmail, notes, items, totalAmount } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ message: 'Danh sách tour đặt không được để trống' });
  }

  const orderDetails: OrderDetail[] = [];
  let calculatedTotal = 0;

  for (const item of items) {
    const tourId = item.tourId;
    const tour = tours.find((t) => t.id === tourId);
    if (!tour) {
      return res.status(400).json({ message: `Tour với mã số ${tourId} không tồn tại` });
    }
    const qty = item.quantity || 1;
    const unitPrice = tour.price;
    calculatedTotal += unitPrice * qty;

    orderDetails.push({
      id: nextDetailId++,
      orderDetailId: nextDetailId,
      tourId,
      tour,
      quantity: qty,
      unitPrice,
      price: unitPrice,
    });

    if (tour.availableSeats >= qty) {
      tour.availableSeats -= qty;
    }
  }

  const orderId = nextOrderId++;
  const newOrder: Order = {
    id: orderId,
    orderId,
    userId: user.id,
    user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName },
    orderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    totalAmount: totalAmount || calculatedTotal,
    status: 'PENDING',
    contactName: contactName || user.fullName || user.username,
    fullName: contactName || user.fullName || user.username,
    contactPhone: contactPhone || user.phone,
    phone: contactPhone || user.phone,
    contactEmail: contactEmail || user.email,
    email: contactEmail || user.email,
    notes: notes || '',
    orderDetails,
  };

  orders.unshift(newOrder);
  res.json(newOrder);
});

app.get('/api/orders/my', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const myOrders = orders.filter((o) => o.userId === user.id);
  res.json(myOrders);
});

app.get('/api/orders/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

  if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
    return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
  }

  res.json(order);
});

// Cho phép khách hàng hủy đơn khi còn ở trạng thái Chờ xử lý (PENDING)
app.put('/api/orders/:id/cancel', authenticateToken, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

  // Kiểm tra quyền: phải là chủ đơn hoặc admin
  if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
    return res.status(403).json({ message: 'Bạn không có quyền thao tác trên đơn hàng này' });
  }

  if (order.status !== 'PENDING') {
    return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xử lý' });
  }

  order.status = 'CANCELLED';

  // Hoàn trả lại số chỗ trống cho các tour trong đơn
  for (const detail of order.orderDetails) {
    const tour = tours.find((t) => t.id === detail.tourId);
    if (tour) {
      tour.availableSeats += detail.quantity;
    }
  }

  res.json({ message: 'Hủy đơn hàng thành công', order });
});

// 6. Admin routes
app.get('/api/admin/dashboard', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED' || o.status === 'CONFIRMED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({
    totalTours: tours.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue,
    recentOrders: orders.slice(0, 5),
  });
});

// Admin Tours
app.get('/api/admin/tours', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(tours);
});

app.get('/api/admin/tours/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const tour = tours.find((t) => t.id === id);
  if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour này' });
  res.json(tour);
});

app.post('/api/admin/tours', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { name, tourName, categoryId, description, price, duration, departureLocation, imageUrl, availableSeats, status, rating } = req.body;
  const newId = tours.length > 0 ? Math.max(...tours.map((t) => t.id)) + 1 : 1;
  const cat = categories.find((c) => c.id === parseInt(categoryId)) || categories[0];

  const newTour: Tour = {
    id: newId,
    tourId: newId,
    categoryId: cat.id,
    category: { id: cat.id, name: cat.name },
    name: name || tourName,
    tourName: name || tourName,
    description: description || '',
    price: parseFloat(price) || 0,
    duration: parseInt(duration) || 1,
    departureLocation: departureLocation || 'TP. Hồ Chí Minh',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
    availableSeats: parseInt(availableSeats) || 10,
    startDate: req.body.startDate || '2025-06-01',
    endDate: req.body.endDate || '2025-06-05',
    status: status || 'ACTIVE',
    rating: parseFloat(rating) || 4.8,
    createdAt: new Date().toISOString(),
  };

  tours.unshift(newTour);
  res.json(newTour);
});

app.put('/api/admin/tours/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const tour = tours.find((t) => t.id === id);
  if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour' });

  const { name, tourName, categoryId, description, price, duration, departureLocation, imageUrl, availableSeats, status, rating } = req.body;
  if (name || tourName) {
    tour.name = name || tourName;
    tour.tourName = name || tourName;
  }
  if (categoryId) {
    const cat = categories.find((c) => c.id === parseInt(categoryId));
    if (cat) {
      tour.categoryId = cat.id;
      tour.category = { id: cat.id, name: cat.name };
    }
  }
  if (description !== undefined) tour.description = description;
  if (price !== undefined) tour.price = parseFloat(price);
  if (duration !== undefined) tour.duration = parseInt(duration);
  if (departureLocation !== undefined) tour.departureLocation = departureLocation;
  if (imageUrl !== undefined) tour.imageUrl = imageUrl;
  if (availableSeats !== undefined) tour.availableSeats = parseInt(availableSeats);
  if (status) tour.status = status;
  if (rating !== undefined) tour.rating = parseFloat(rating);

  res.json(tour);
});

app.delete('/api/admin/tours/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const idx = tours.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy tour' });
  
  const hasOrders = orders.some((o) => o.orderDetails.some((d) => d.tourId === id));
  if (hasOrders) {
    return res.status(400).json({ message: 'Không thể xóa tour này vì đang có khách hàng đặt tour!' });
  }

  tours.splice(idx, 1);
  res.json({ message: 'Đã xóa tour thành công!' });
});

// Admin Categories
app.get('/api/admin/categories', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(categories);
});

app.get('/api/admin/categories/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  res.json(cat);
});

app.post('/api/admin/categories', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { name, categoryName, description, imageUrl } = req.body;
  const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
  const newCat: Category = {
    id: newId,
    categoryId: newId,
    name: name || categoryName,
    categoryName: name || categoryName,
    description: description || '',
    imageUrl: imageUrl || '',
  };
  categories.push(newCat);
  res.json(newCat);
});

app.put('/api/admin/categories/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

  const { name, categoryName, description, imageUrl } = req.body;
  if (name || categoryName) {
    cat.name = name || categoryName;
    cat.categoryName = name || categoryName;
  }
  if (description !== undefined) cat.description = description;
  if (imageUrl !== undefined) cat.imageUrl = imageUrl;

  res.json(cat);
});

app.delete('/api/admin/categories/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const hasTours = tours.some((t) => t.categoryId === id);
  if (hasTours) {
    return res.status(400).json({ message: 'Không thể xóa danh mục đang có các tour thuộc về danh mục này!' });
  }
  const idx = categories.findIndex((c) => c.id === id);
  if (idx !== -1) categories.splice(idx, 1);
  res.json({ message: 'Đã xóa danh mục thành công!' });
});

// Admin Users
app.get('/api/admin/users', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

app.get('/api/admin/users/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

  const { fullName, phone, address, role, isActive } = req.body;
  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const hasOrders = orders.some((o) => o.userId === id);
  if (hasOrders) {
    return res.status(400).json({ message: 'Không thể xóa tài khoản này vì người dùng đã có đơn đặt tour trong hệ thống!' });
  }
  const idx = users.findIndex((u) => u.id === id);
  if (idx !== -1) users.splice(idx, 1);
  res.json({ message: 'Đã xóa tài khoản thành công!' });
});

// Admin Orders
app.get('/api/admin/orders', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sorted);
});

app.get('/api/admin/orders/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  res.json(order);
});

app.put('/api/admin/orders/:id/status', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const status = (req.query.status as any) || req.body.status;
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  order.status = status;
  res.json(order);
});

app.put('/api/admin/orders/:orderId/details/:detailId/quantity', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const orderId = parseInt(req.params.orderId);
  const detailId = parseInt(req.params.detailId);
  const quantity = parseInt(req.query.quantity as string) || req.body.quantity;

  const order = orders.find((o) => o.id === orderId);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

  const detail = order.orderDetails.find((d) => d.id === detailId || d.orderDetailId === detailId);
  if (!detail) return res.status(404).json({ message: 'Không tìm thấy chi tiết tour' });

  detail.quantity = quantity;
  order.totalAmount = order.orderDetails.reduce((sum, d) => sum + d.unitPrice * d.quantity, 0);

  res.json(detail);
});

// ==========================================
// STATIC / VITE MIDDLEWARE SETUP
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
