# Holiday Particle Tree

Cây thông Giáng sinh tương tác 3D với hiệu ứng hạt (particle) và điều khiển bằng cử chỉ tay. Được xây dựng với Three.js và MediaPipe Hands.

## Demo

Một cây thông Noel 3D được tạo từ các hạt sáng lung linh. Người dùng có thể:
- Biến cây thông thành đám mây hạt vũ trụ
- Xoay đám mây bằng cử chỉ tay hoặc chuột
- Hiển thị ảnh kỷ niệm trong khung vàng
- Tương tác mượt mà với nhiều hiệu ứng đẹp mắt

## Yêu cầu hệ thống

- **Trình duyệt**: Chrome, Firefox, Edge, Safari (phiên bản mới)
- **Webcam** (tùy chọn): Để sử dụng tính năng điều khiển bằng cử chỉ tay
- **Node.js**: v18+ (để chạy development server)

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd merychristmas
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. (Tùy chọn) Thêm ảnh cá nhân

Tạo thư mục `media/` và thêm ảnh của bạn vào đó. Sau đó chạy lệnh generate manifest:

```bash
mkdir media
# Copy ảnh vào thư mục media/
npm run manifest
```

## Chạy ứng dụng

### Development mode (khuyến nghị)

```bash
npm run dev
```

Lệnh này sẽ:
- Tự động generate media manifest khi có thay đổi
- Khởi động local server tại `http://localhost:3000`

### Chỉ chạy server

```bash
npm run serve
```

Mở trình duyệt và truy cập: `http://localhost:3000`

## Hướng dẫn sử dụng

### Điều khiển bằng cử chỉ tay (Webcam)

| Cử chỉ | Hành động |
|--------|-----------|
| **Mở bàn tay** (5 ngón) | Biến cây thành đám mây hạt |
| **Nắm tay** | Quay lại hình cây thông |
| **Véo ngón** (pinch) | Hiển thị ảnh ngẫu nhiên |
| **Di chuyển tay** | Xoay đám mây hạt |
| **Xoay cổ tay** (khi véo) | Xoay ảnh |

### Điều khiển bằng chuột/touchpad

| Thao tác | Hành động |
|----------|-----------|
| **Click trái** | Chuyển đổi trạng thái / Hiện ảnh |
| **Click phải** | Reset về cây thông |
| **Kéo chuột** | Xoay đám mây (ở chế độ cloud) |

### Điều khiển bằng bàn phím

| Phím | Hành động |
|------|-----------|
| **Space** | Chuyển đổi Tree ↔ Cloud |
| **Escape** | Ẩn ảnh / Reset về cây |
| **P** | Hiện ảnh (ở chế độ cloud) |

### Điều khiển bằng màn hình cảm ứng

| Thao tác | Hành động |
|----------|-----------|
| **Tap** | Chuyển đổi trạng thái |
| **Vuốt ngang** | Xoay đám mây |

## Thêm ảnh cá nhân

1. Tạo thư mục `media/` trong project root
2. Copy các file ảnh (JPG, PNG, WebP) vào thư mục
3. Chạy `npm run manifest` để cập nhật danh sách ảnh
4. Reload trang web

Ảnh sẽ hiển thị ngẫu nhiên khi bạn thực hiện cử chỉ véo ngón (pinch) hoặc click ở chế độ cloud.

## Cấu trúc dự án

```
merychristmas/
├── index.html          # File HTML chính chứa toàn bộ code
├── package.json        # Cấu hình npm
├── scripts/
│   └── generate-manifest.js   # Script tạo manifest cho ảnh media
├── media/              # Thư mục chứa ảnh cá nhân (tự tạo)
│   └── manifest.json   # Danh sách ảnh (auto-generated)
└── plans/              # Tài liệu thiết kế và planning
```

## Công nghệ sử dụng

- **Three.js** (v0.158.0) - 3D rendering và hiệu ứng
- **MediaPipe Hands** (v0.10.8) - Nhận diện cử chỉ tay
- **Unreal Bloom Pass** - Hiệu ứng phát sáng (bloom)
- **Serve** - Local development server

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server + watch manifest |
| `npm run serve` | Chỉ chạy local server |
| `npm run manifest` | Generate media manifest một lần |
| `npm run manifest:watch` | Watch và auto-generate manifest |
| `npm test` | Chạy Playwright tests |
| `npm run test:ui` | Chạy tests với UI |

## Tính năng chính

- **Particle Tree**: 2800 hạt tạo hình cây thông với màu sắc Giáng sinh
- **Volumetric Cloud**: Đám mây hạt hình cầu 3D với hiệu ứng depth
- **Twinkling Stars**: Hiệu ứng lấp lánh cho từng hạt
- **Golden Frame Photos**: Ảnh hiển thị trong khung vàng sang trọng
- **Starfield Background**: Bầu trời sao làm nền
- **Hand Gesture Control**: Điều khiển bằng cử chỉ tay real-time
- **Momentum Rotation**: Xoay đám mây với quán tính vật lý
- **Responsive Design**: Hoạt động trên desktop và mobile

## Troubleshooting

### Webcam không hoạt động
- Đảm bảo đã cấp quyền camera cho trình duyệt
- Kiểm tra xem webcam có đang được sử dụng bởi ứng dụng khác không
- Thử refresh trang

### Hiệu ứng chậm/lag
- Giảm số lượng tab đang mở
- Đóng các ứng dụng nặng khác
- Thử với trình duyệt khác

### Ảnh không hiển thị
- Kiểm tra thư mục `media/` đã được tạo chưa
- Chạy lại `npm run manifest`
- Kiểm tra console log trong DevTools

## License

MIT

---

**Merry Christmas! 🎄**
