# ĐẶC TẢ USE CASE - HỆ THỐNG CHỨNG CHỈ BLOCKCHAIN QNU

---

## I. ACTOR (TÁC NHÂN)

| Tác nhân | Mô tả |
|----------|-------|
| Admin (Quản trị viên) | Người quản lý hệ thống, có quyền cấp/thu hồi chứng chỉ |
| Sinh viên | Người sở hữu ví Ethereum, nhận và quản lý chứng chỉ của mình |
| Người xác thực | Bất kỳ ai muốn kiểm tra tính hợp lệ của chứng chỉ |

---

## II. USE CASE CHO ADMIN

### 1. Kết nối ví (Đăng nhập)

| | |
|---|---|
| **Tác nhân** | Admin |
| **Điều kiện trước** | Admin đã cài đặt MetaMask và có địa chỉ ví là owner của smart contract |
| **Điều kiện sau** | Admin đăng nhập thành công và được chuyển đến trang quản trị |
| **Mô tả tóm tắt** | Admin nhấn nút "Kết nối ví" trên trang chủ, MetaMask hiển thị yêu cầu kết nối, admin xác nhận để đăng nhập vào hệ thống |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Admin truy cập trang web | 2. Hiển thị trang chủ với nút "Kết nối ví" |
| 3. Admin nhấn nút "Kết nối ví" | 4. Gọi MetaMask yêu cầu kết nối |
| 5. Admin xác nhận trên MetaMask | 6. Lấy địa chỉ ví và kiểm tra với owner của contract |
| | 7. Xác định là Admin, hiển thị giao diện quản trị |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| 5a. Admin từ chối kết nối trên MetaMask → Hiển thị thông báo "Không thể kết nối ví" |
| 6a. MetaMask chưa được cài đặt → Hiển thị thông báo yêu cầu cài đặt MetaMask |

---

### 2. Cấp chứng chỉ đơn lẻ

| | |
|---|---|
| **Tác nhân** | Admin |
| **Điều kiện trước** | Admin đã đăng nhập thành công |
| **Điều kiện sau** | Chứng chỉ được tạo trên blockchain và gửi đến ví sinh viên |
| **Mô tả tóm tắt** | Admin điền thông tin chứng chỉ (địa chỉ ví sinh viên, Token ID, tên sinh viên, khóa học, xếp loại), xem trước và nhấn cấp chứng chỉ |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Admin chọn tab "Cấp chứng chỉ" | 2. Hiển thị form cấp chứng chỉ và khung xem trước |
| 3. Admin nhập địa chỉ ví sinh viên | 4. Cập nhật form |
| 5. Admin nhập Token ID | 6. Cập nhật form |
| 7. Admin nhập tên sinh viên | 8. Cập nhật khung xem trước chứng chỉ |
| 9. Admin nhập tên khóa học | 10. Cập nhật khung xem trước chứng chỉ |
| 11. Admin chọn xếp loại | 12. Cập nhật khung xem trước chứng chỉ |
| 13. Admin nhấn "Ký & Cấp chứng chỉ" | 14. Tạo chữ ký số từ dữ liệu chứng chỉ |
| | 15. Gọi MetaMask yêu cầu ký giao dịch |
| 16. Admin xác nhận giao dịch trên MetaMask | 17. Gửi giao dịch lên blockchain |
| | 18. Chờ xác nhận từ blockchain |
| | 19. Hiển thị thông báo "Cấp chứng chỉ thành công" |
| | 20. Reset form và tăng Token ID |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| 13a. Thiếu thông tin bắt buộc → Hiển thị lỗi validation |
| 16a. Admin từ chối giao dịch → Hiển thị "Cấp chứng chỉ thất bại" |
| 17a. Token ID đã tồn tại → Hiển thị lỗi "Token ID này đã tồn tại" |
| 18a. Giao dịch thất bại → Hiển thị lỗi từ blockchain |

---

### 3. Cấp chứng chỉ hàng loạt

| | |
|---|---|
| **Tác nhân** | Admin |
| **Điều kiện trước** | Admin đã đăng nhập thành công |
| **Điều kiện sau** | Nhiều chứng chỉ được tạo trên blockchain |
| **Mô tả tóm tắt** | Admin tải lên file CSV chứa danh sách sinh viên hoặc nhập thủ công nhiều dòng, sau đó cấp hàng loạt |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Admin chọn tab "Cấp hàng loạt" | 2. Hiển thị giao diện cấp hàng loạt |
| 3. Admin tải file CSV hoặc nhập thủ công | 4. Parse dữ liệu và hiển thị danh sách |
| 5. Admin kiểm tra danh sách | 6. Hiển thị preview danh sách chứng chỉ |
| 7. Admin nhấn "Cấp tất cả" | 8. Lần lượt tạo chữ ký và gửi giao dịch cho từng chứng chỉ |
| 9. Admin xác nhận từng giao dịch trên MetaMask | 10. Cập nhật trạng thái từng chứng chỉ (thành công/thất bại) |
| | 11. Hiển thị kết quả tổng hợp |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| 3a. File CSV không đúng định dạng → Hiển thị lỗi format |
| 8a. Một giao dịch thất bại → Đánh dấu lỗi và tiếp tục với các chứng chỉ còn lại |

---

### 4. Thu hồi chứng chỉ

| | |
|---|---|
| **Tác nhân** | Admin |
| **Điều kiện trước** | Admin đã đăng nhập, chứng chỉ cần thu hồi đang tồn tại |
| **Điều kiện sau** | Chứng chỉ bị xóa khỏi blockchain (burn) |
| **Mô tả tóm tắt** | Admin xem danh sách chứng chỉ đã cấp, chọn chứng chỉ cần thu hồi và xác nhận thu hồi |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Admin chọn tab "Quản lý" | 2. Tải và hiển thị danh sách chứng chỉ đã cấp |
| 3. Admin tìm chứng chỉ cần thu hồi | 4. Hiển thị danh sách với nút "Thu hồi" |
| 5. Admin nhấn nút "Thu hồi" | 6. Hiển thị hộp thoại xác nhận |
| 7. Admin xác nhận thu hồi | 8. Gọi MetaMask yêu cầu ký giao dịch burn |
| 9. Admin xác nhận trên MetaMask | 10. Gửi giao dịch burn lên blockchain |
| | 11. Chờ xác nhận và hiển thị "Thu hồi thành công" |
| | 12. Cập nhật lại danh sách |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| 7a. Admin hủy xác nhận → Quay lại danh sách |
| 9a. Admin từ chối giao dịch → Hiển thị "Thu hồi thất bại" |
| 10a. Chứng chỉ không tồn tại → Hiển thị lỗi |

---

### 5. Xem lịch sử giao dịch

| | |
|---|---|
| **Tác nhân** | Admin |
| **Điều kiện trước** | Admin đã đăng nhập thành công |
| **Điều kiện sau** | Hiển thị danh sách các giao dịch đã thực hiện |
| **Mô tả tóm tắt** | Admin chọn tab "Lịch sử" để xem tất cả các giao dịch cấp/thu hồi chứng chỉ |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Admin chọn tab "Lịch sử" | 2. Truy vấn events từ blockchain |
| | 3. Hiển thị danh sách giao dịch (loại, Token ID, thời gian, hash) |
| 4. Admin nhấn vào giao dịch | 5. Mở link Etherscan để xem chi tiết |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| 2a. Không có giao dịch nào → Hiển thị "Chưa có giao dịch" |

---

## III. USE CASE CHO SINH VIÊN

### 1. Kết nối ví (Đăng nhập)

| | |
|---|---|
| **Tác nhân** | Sinh viên |
| **Điều kiện trước** | Sinh viên đã cài đặt MetaMask và có địa chỉ ví |
| **Điều kiện sau** | Sinh viên đăng nhập thành công và xem được chứng chỉ của mình |
| **Mô tả tóm tắt** | Sinh viên nhấn "Kết nối ví", xác nhận trên MetaMask để đăng nhập |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Sinh viên truy cập trang web | 2. Hiển thị trang chủ |
| 3. Sinh viên nhấn "Kết nối ví" | 4. Gọi MetaMask yêu cầu kết nối |
| 5. Sinh viên xác nhận trên MetaMask | 6. Lấy địa chỉ ví |
| | 7. Kiểm tra không phải Admin → Chuyển đến trang "Chứng chỉ của tôi" |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| 5a. Sinh viên từ chối → Hiển thị thông báo lỗi |
| 4a. MetaMask chưa cài → Yêu cầu cài đặt |

---

### 2. Xem danh sách chứng chỉ

| | |
|---|---|
| **Tác nhân** | Sinh viên |
| **Điều kiện trước** | Sinh viên đã đăng nhập thành công |
| **Điều kiện sau** | Hiển thị tất cả chứng chỉ thuộc sở hữu của sinh viên |
| **Mô tả tóm tắt** | Sau khi đăng nhập, hệ thống tự động tải và hiển thị các chứng chỉ mà sinh viên sở hữu |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Sinh viên đăng nhập thành công | 2. Truy vấn blockchain lấy danh sách chứng chỉ theo địa chỉ ví |
| | 3. Hiển thị danh sách chứng chỉ dạng card |
| 4. Sinh viên xem danh sách | |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| 2a. Không có chứng chỉ nào → Hiển thị "Không tìm thấy chứng chỉ nào" |

---

### 3. Xem chi tiết chứng chỉ

| | |
|---|---|
| **Tác nhân** | Sinh viên |
| **Điều kiện trước** | Sinh viên đã đăng nhập và có ít nhất 1 chứng chỉ |
| **Điều kiện sau** | Hiển thị modal chi tiết chứng chỉ |
| **Mô tả tóm tắt** | Sinh viên nhấn vào card chứng chỉ để xem thông tin chi tiết |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Sinh viên nhấn vào card chứng chỉ | 2. Hiển thị modal chi tiết |
| | 3. Hiển thị: Tên sinh viên, Khóa học, Xếp loại, Ngày cấp, Chữ ký số |
| 4. Sinh viên xem thông tin | |
| 5. Sinh viên nhấn nút đóng | 6. Đóng modal |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| Không có |

---

### 4. Tải xuống chứng chỉ

| | |
|---|---|
| **Tác nhân** | Sinh viên |
| **Điều kiện trước** | Sinh viên đang xem chi tiết chứng chỉ |
| **Điều kiện sau** | File hình ảnh chứng chỉ được tải về máy |
| **Mô tả tóm tắt** | Sinh viên nhấn nút "Tải xuống" để tải chứng chỉ dạng hình ảnh PNG |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Sinh viên nhấn nút "Tải xuống" | 2. Tạo canvas vẽ chứng chỉ với đầy đủ thông tin |
| | 3. Chuyển canvas thành file PNG |
| | 4. Tự động tải file về máy |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| Không có |

---

### 5. Chia sẻ chứng chỉ

| | |
|---|---|
| **Tác nhân** | Sinh viên |
| **Điều kiện trước** | Sinh viên đang xem chi tiết chứng chỉ |
| **Điều kiện sau** | Link xác thực được chia sẻ lên mạng xã hội hoặc sao chép |
| **Mô tả tóm tắt** | Sinh viên nhấn "Chia sẻ" và chọn nền tảng (Facebook, Twitter, LinkedIn) hoặc sao chép link |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Sinh viên nhấn nút "Chia sẻ" | 2. Hiển thị menu chia sẻ |
| 3. Sinh viên chọn "Sao chép link" | 4. Sao chép link xác thực vào clipboard, thông báo "Đã sao chép" |
| HOẶC | |
| 3. Sinh viên chọn Facebook/Twitter/LinkedIn | 4. Mở tab mới với link chia sẻ lên mạng xã hội tương ứng |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| Không có |

---

### 6. Xem thông báo

| | |
|---|---|
| **Tác nhân** | Sinh viên |
| **Điều kiện trước** | Sinh viên đã đăng nhập |
| **Điều kiện sau** | Hiển thị danh sách thông báo về chứng chỉ mới |
| **Mô tả tóm tắt** | Sinh viên nhấn icon chuông để xem các thông báo về chứng chỉ được cấp |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Sinh viên nhấn icon chuông | 2. Hiển thị modal thông báo |
| | 3. Tải danh sách events liên quan đến ví sinh viên |
| | 4. Hiển thị danh sách thông báo |
| 5. Sinh viên đọc thông báo | |
| 6. Sinh viên nhấn đóng | 7. Đóng modal |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| 3a. Không có thông báo → Hiển thị "Không có thông báo mới" |

---

## IV. USE CASE CHO NGƯỜI XÁC THỰC (PUBLIC)

### 1. Xác thực chứng chỉ theo ID

| | |
|---|---|
| **Tác nhân** | Người xác thực (Nhà tuyển dụng, Tổ chức,...) |
| **Điều kiện trước** | Không cần đăng nhập |
| **Điều kiện sau** | Hiển thị kết quả xác thực (hợp lệ/không hợp lệ) |
| **Mô tả tóm tắt** | Người xác thực nhập Token ID của chứng chỉ để kiểm tra tính hợp lệ trên blockchain |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Người xác thực truy cập trang web | 2. Hiển thị trang chủ |
| 3. Người xác thực nhấn "Xác thực chứng chỉ" | 4. Hiển thị trang xác thực với tab "Tìm theo ID" |
| 5. Người xác thực nhập Token ID | 6. Cập nhật ô input |
| 7. Người xác thực nhấn "Xác thực" | 8. Gọi hàm verifyCertificate trên smart contract |
| | 9. Kiểm tra chữ ký số với owner |
| | 10a. Nếu hợp lệ → Hiển thị "Chứng chỉ hợp lệ" kèm thông tin chi tiết |
| | 10b. Nếu không hợp lệ → Hiển thị "Chứng chỉ không hợp lệ hoặc đã bị thu hồi" |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| 7a. Không nhập ID → Không thực hiện |
| 8a. Token ID không tồn tại → Hiển thị "Chứng chỉ không hợp lệ" |
| 8b. Chứng chỉ đã bị thu hồi (burn) → Hiển thị "Chứng chỉ đã bị thu hồi" |

---

### 2. Tìm kiếm chứng chỉ theo tên

| | |
|---|---|
| **Tác nhân** | Người xác thực |
| **Điều kiện trước** | Không cần đăng nhập |
| **Điều kiện sau** | Hiển thị danh sách chứng chỉ khớp với từ khóa |
| **Mô tả tóm tắt** | Người xác thực nhập tên sinh viên hoặc tên khóa học để tìm kiếm chứng chỉ |

| Hành động của tác nhân | Hành động của hệ thống |
|------------------------|------------------------|
| 1. Người xác thực chọn tab "Tìm theo tên" | 2. Hiển thị ô tìm kiếm theo tên |
| 3. Người xác thực nhập tên sinh viên/khóa học | 4. Cập nhật ô input |
| 5. Người xác thực nhấn "Tìm kiếm" | 6. Truy vấn tất cả chứng chỉ từ blockchain |
| | 7. Lọc theo từ khóa (tên sinh viên hoặc khóa học) |
| | 8a. Có kết quả → Hiển thị danh sách chứng chỉ khớp |
| | 8b. Không có kết quả → Hiển thị "Không tìm thấy kết quả" |
| 9. Người xác thực nhấn vào 1 chứng chỉ | 10. Gọi xác thực và hiển thị chi tiết chứng chỉ |

| **Các sự kiện ngoại lệ** |
|--------------------------|
| 5a. Không nhập từ khóa → Không thực hiện |
| 6a. Lỗi kết nối blockchain → Hiển thị lỗi |

---

## V. SƠ ĐỒ USE CASE

```
                    +------------------+
                    |   Hệ thống       |
                    |   Chứng chỉ      |
                    |   Blockchain     |
                    +------------------+
                           |
        +------------------+------------------+
        |                  |                  |
   +----+----+       +-----+-----+      +-----+-----+
   |  Admin  |       | Sinh viên |      |  Người    |
   +---------+       +-----------+      | xác thực  |
        |                  |            +-----------+
        |                  |                  |
   - Kết nối ví       - Kết nối ví      - Xác thực theo ID
   - Cấp chứng chỉ    - Xem danh sách   - Tìm theo tên
   - Cấp hàng loạt    - Xem chi tiết
   - Thu hồi          - Tải xuống
   - Xem lịch sử      - Chia sẻ
                      - Xem thông báo
```

---

## VI. BẢNG TÓM TẮT USE CASE

| STT | Use Case | Tác nhân | Mô tả ngắn |
|-----|----------|----------|------------|
| 1 | Kết nối ví | Admin, Sinh viên | Đăng nhập bằng MetaMask |
| 2 | Cấp chứng chỉ đơn lẻ | Admin | Cấp 1 chứng chỉ cho sinh viên |
| 3 | Cấp chứng chỉ hàng loạt | Admin | Cấp nhiều chứng chỉ từ file CSV |
| 4 | Thu hồi chứng chỉ | Admin | Burn chứng chỉ khỏi blockchain |
| 5 | Xem lịch sử giao dịch | Admin | Xem các giao dịch đã thực hiện |
| 6 | Xem danh sách chứng chỉ | Sinh viên | Xem các chứng chỉ mình sở hữu |
| 7 | Xem chi tiết chứng chỉ | Sinh viên | Xem thông tin chi tiết 1 chứng chỉ |
| 8 | Tải xuống chứng chỉ | Sinh viên | Tải chứng chỉ dạng hình PNG |
| 9 | Chia sẻ chứng chỉ | Sinh viên | Chia sẻ lên mạng xã hội |
| 10 | Xem thông báo | Sinh viên | Xem thông báo chứng chỉ mới |
| 11 | Xác thực theo ID | Người xác thực | Kiểm tra chứng chỉ bằng Token ID |
| 12 | Tìm theo tên | Người xác thực | Tìm chứng chỉ theo tên SV/khóa học |
