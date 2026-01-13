# 🎓 QNU Blockchain Certificate

Hệ thống quản lý và xác thực chứng chỉ học thuật trên nền tảng Blockchain Ethereum.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-627EEA?logo=ethereum)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss)

## ✨ Tính năng

### 👨‍💼 Quản trị viên (Admin)
- **Cấp chứng chỉ** - Tạo và ký chứng chỉ NFT cho sinh viên
- **Cấp hàng loạt** - Import danh sách từ Excel để cấp nhiều chứng chỉ cùng lúc
- **Quản lý** - Xem danh sách và thu hồi chứng chỉ khi cần
- **Lịch sử giao dịch** - Theo dõi tất cả hoạt động trên blockchain

### 👨‍🎓 Sinh viên
- **Xem chứng chỉ** - Danh sách tất cả chứng chỉ đã nhận
- **Chi tiết chứng chỉ** - Thông tin đầy đủ và chữ ký số
- **Thông báo** - Nhận thông báo khi có chứng chỉ mới

### 🔍 Công khai
- **Xác thực chứng chỉ** - Bất kỳ ai cũng có thể xác minh tính hợp lệ của chứng chỉ

## 🛠️ Công nghệ

| Frontend | Blockchain | Styling |
|----------|------------|---------|
| React 19 | Ethers.js 6 | Tailwind CSS |
| TypeScript | Solidity | CSS Modules |
| Vite | MetaMask | |

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+
- MetaMask extension
- Sepolia testnet ETH

### Bước 1: Clone và cài đặt dependencies

```bash
git clone <repo-url>
cd blockchain-certificat
npm install
```

### Bước 2: Cấu hình Smart Contract

Mở file `src/constrait.ts` và cập nhật:

```typescript
export const CONTRACT_ADDRESS = "0x..."; // Địa chỉ contract đã deploy
export const CONTRACT_ABI = [...]; // ABI của contract
```

### Bước 3: Chạy ứng dụng

```bash
npm run dev
```

Truy cập http://localhost:5173

## 📁 Cấu trúc dự án

```
src/
├── components/
│   ├── AdminDashboard.tsx   # Bảng điều khiển admin
│   ├── AdminMint.tsx        # Form cấp chứng chỉ đơn
│   ├── BatchMint.tsx        # Cấp chứng chỉ hàng loạt
│   ├── TransactionHistory.tsx # Lịch sử giao dịch
│   ├── Notifications.tsx    # Thông báo cho sinh viên
│   ├── PublicVerify.tsx     # Xác thực công khai
│   └── UserPortfolio.tsx    # Danh sách chứng chỉ sinh viên
├── service/
│   └── ethereum.ts          # Tương tác với blockchain
├── App.tsx                  # Component chính
├── types.ts                 # TypeScript interfaces
└── constrait.ts             # Cấu hình contract
```

## 📋 Hướng dẫn sử dụng

### Cấp chứng chỉ hàng loạt

1. Vào tab **"Cấp hàng loạt"**
2. Tải file mẫu Excel
3. Điền thông tin sinh viên theo mẫu:

| Địa chỉ ví | Token ID | Tên sinh viên | Khóa học | Xếp loại | URL hình ảnh |
|------------|----------|---------------|----------|----------|--------------|
| 0x1234... | 1 | Nguyễn Văn A | CNTT | Xuất sắc | https://... |

4. Upload file và nhấn **"Bắt đầu cấp"**
5. Ký từng giao dịch trên MetaMask

### Xác thực chứng chỉ

1. Truy cập trang **"Xác Thực"**
2. Nhập Token ID của chứng chỉ
3. Hệ thống sẽ kiểm tra trên blockchain và hiển thị kết quả

## 🔐 Bảo mật

- Chứng chỉ được ký số bởi admin (owner của contract)
- Dữ liệu lưu trữ vĩnh viễn trên Ethereum blockchain
- Không thể giả mạo hoặc chỉnh sửa sau khi cấp
- Chỉ admin mới có quyền cấp và thu hồi

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

Phát triển bởi **QNU** | Triển khai trên **Ethereum Sepolia Testnet**
