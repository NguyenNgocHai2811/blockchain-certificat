# GIẢI THÍCH SMART CONTRACT CHỨNG CHỈ BLOCKCHAIN

## Tổng quan

Smart contract `Certificate` là một hợp đồng thông minh triển khai trên Ethereum, dùng để quản lý chứng chỉ số dựa trên chuẩn ERC721 (NFT). Mỗi chứng chỉ là một token duy nhất, không thể sao chép.

---

## 1. KHAI BÁO CƠ BẢN

```solidity
string public name = "VNU Certificate";
string public symbol = "VNUC";
address public owner;
```

| Biến | Kiểu | Mô tả |
|------|------|-------|
| `name` | string | Tên bộ sưu tập NFT: "VNU Certificate" |
| `symbol` | string | Ký hiệu token: "VNUC" |
| `owner` | address | Địa chỉ ví của Admin (người deploy contract) |

---

## 2. STRUCT DỮ LIỆU

```solidity
struct CertificateInfo {
    string studentName;
    string courseName;
    string grade;
    string imageURL;
    uint256 issueDate;
    bytes signature;
}
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `studentName` | string | Họ tên sinh viên |
| `courseName` | string | Tên khóa học/môn học |
| `grade` | string | Xếp loại (Xuất sắc, Giỏi, Khá, Trung bình) |
| `imageURL` | string | Link ảnh chứng chỉ (IPFS) - hiện không sử dụng |
| `issueDate` | uint256 | Ngày cấp (Unix timestamp - số giây từ 1/1/1970) |
| `signature` | bytes | Chữ ký số của Admin để xác thực |

---

## 3. MAPPINGS LƯU TRỮ

### 3.1 Core ERC721

```solidity
mapping (uint256 => address) private _owners;
mapping (address => uint256) private _balances;
mapping (uint256 => address) private _tokenApprovals;
mapping (address => mapping (address => bool)) private _operatorApprovals;
```

| Mapping | Mô tả |
|---------|-------|
| `_owners` | Token ID → Địa chỉ chủ sở hữu |
| `_balances` | Địa chỉ → Số lượng token sở hữu |
| `_tokenApprovals` | Token ID → Địa chỉ được ủy quyền |
| `_operatorApprovals` | Chủ sở hữu → (Operator → Có quyền hay không) |

### 3.2 Dữ liệu văn bằng

```solidity
mapping (uint256 => CertificateInfo) public certificateDetails;
```

| Mapping | Mô tả |
|---------|-------|
| `certificateDetails` | Token ID → Thông tin chứng chỉ (CertificateInfo) |

### 3.3 Enumerable (Liệt kê danh sách)

```solidity
mapping(address => uint256[]) private _ownedTokens;
uint256[] private _allTokens;
mapping(uint256 => uint256) private _allTokensIndex;
```

| Biến/Mapping | Mô tả |
|--------------|-------|
| `_ownedTokens` | Địa chỉ → Mảng các Token ID mà địa chỉ đó sở hữu |
| `_allTokens` | Mảng chứa TẤT CẢ Token ID trong hệ thống |
| `_allTokensIndex` | Token ID → Vị trí index trong mảng `_allTokens` |

---

## 4. EVENTS (SỰ KIỆN)

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
event CertificateIssued(uint256 indexed tokenId, address indexed student, string course);
event CertificateRevoked(uint256 indexed tokenId, string reason);
```

| Event | Khi nào phát ra | Mục đích |
|-------|-----------------|----------|
| `Transfer` | Khi token được chuyển/tạo/hủy | Theo dõi lịch sử chuyển nhượng |
| `Approval` | Khi ủy quyền 1 token | Theo dõi ủy quyền |
| `ApprovalForAll` | Khi ủy quyền tất cả token | Theo dõi ủy quyền toàn bộ |
| `CertificateIssued` | Khi cấp chứng chỉ mới | Frontend lắng nghe để thông báo |
| `CertificateRevoked` | Khi thu hồi chứng chỉ | Frontend lắng nghe để cập nhật |

---

## 5. CONSTRUCTOR & MODIFIER

### Constructor

```solidity
constructor () {
    owner = msg.sender;
}
```

**Giải thích:**
- Chạy 1 lần duy nhất khi deploy contract
- `msg.sender` = địa chỉ người deploy
- Gán người deploy làm `owner` (Admin)

### Modifier onlyOwner

```solidity
modifier onlyOwner(){
    require(msg.sender == owner, "Chi Admin moi duoc goi ham nay");
    _;
}
```

**Giải thích:**
- Kiểm tra người gọi hàm có phải Admin không
- Nếu không phải → Revert với thông báo lỗi
- `_;` = tiếp tục thực thi hàm nếu điều kiện đúng

---

## 6. CÁC HÀM CHÍNH

### 6.1 safeMint - Cấp chứng chỉ

```solidity
function safeMint(address to, uint256 tokenId, CertificateInfo memory data) public onlyOwner
```

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `to` | address | Địa chỉ ví sinh viên nhận chứng chỉ |
| `tokenId` | uint256 | ID duy nhất của chứng chỉ |
| `data` | CertificateInfo | Thông tin chứng chỉ |

**Luồng xử lý:**

```
1. Kiểm tra điều kiện
   ├── to != address(0) → Không cấp cho địa chỉ rỗng
   └── _owners[tokenId] == address(0) → Token ID chưa tồn tại

2. Lưu metadata
   ├── certificateDetails[tokenId] = data
   └── Nếu issueDate = 0 → Gán = block.timestamp (thời gian hiện tại)

3. Cập nhật ERC721 state
   ├── _balances[to] += 1 → Tăng số dư
   └── _owners[tokenId] = to → Gán chủ sở hữu

4. Cập nhật danh sách Enumerable
   ├── _ownedTokens[to].push(tokenId) → Thêm vào list của user
   ├── _allTokensIndex[tokenId] = _allTokens.length → Lưu vị trí
   └── _allTokens.push(tokenId) → Thêm vào list tổng

5. Emit Events
   ├── Transfer(address(0), to, tokenId)
   └── CertificateIssued(tokenId, to, data.courseName)
```

---

### 6.2 _burnCertificate - Thu hồi chứng chỉ

```solidity
function _burnCertificate(uint256 tokenId) public onlyOwner
```

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `tokenId` | uint256 | ID chứng chỉ cần thu hồi |

**Luồng xử lý:**

```
1. Kiểm tra token tồn tại
   └── _owners[tokenId] != address(0)

2. Lấy địa chỉ sinh viên
   └── studentWallet = _owners[tokenId]

3. Xóa quyền Approval
   └── _tokenApprovals[tokenId] = address(0)

4. Giảm số dư & xóa owner
   ├── _balances[studentWallet] -= 1
   └── _owners[tokenId] = address(0)

5. Xóa dữ liệu chứng chỉ
   └── delete certificateDetails[tokenId]

6. Xóa khỏi danh sách User
   └── _removeTokenFromOwnerEnumeration(studentWallet, tokenId)

7. Xóa khỏi danh sách Tổng
   └── _removeTokenFromAllTokensEnumeration(tokenId)

8. Emit Events
   ├── Transfer(studentWallet, address(0), tokenId)
   └── CertificateRevoked(tokenId, "Admin thu hoi")
```

---

### 6.3 getCertificatesByOwner - Lấy danh sách chứng chỉ của user

```solidity
function getCertificatesByOwner(address _user) public view returns (CertificateInfo[] memory)
```

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `_user` | address | Địa chỉ ví cần tra cứu |

**Giải thích:**
```
1. Lấy mảng Token ID của user
   └── userTokenIds = _ownedTokens[_user]

2. Tạo mảng kết quả có cùng độ dài

3. Duyệt qua từng Token ID
   └── Lấy certificateDetails[tokenId] → Thêm vào kết quả

4. Trả về mảng CertificateInfo[]
```

**Sử dụng:** Trang "Chứng chỉ của tôi" (User Portfolio)

---

### 6.4 getAllIssuedCertificates - Lấy tất cả chứng chỉ

```solidity
function getAllIssuedCertificates() public view returns (CertificateInfo[] memory)
```

**Giải thích:**
```
1. Tạo mảng kết quả có độ dài = _allTokens.length

2. Duyệt qua mảng _allTokens
   └── Lấy certificateDetails[tokenId] → Thêm vào kết quả

3. Trả về mảng CertificateInfo[]
```

**Sử dụng:** Trang Admin Dashboard

---

### 6.5 verifyCertificate - Xác thực chứng chỉ

```solidity
function verifyCertificate(uint256 tokenId) public view returns (bool)
```

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `tokenId` | uint256 | ID chứng chỉ cần xác thực |

**Luồng xử lý chi tiết:**

```
1. Kiểm tra token còn tồn tại
   └── Nếu _owners[tokenId] == address(0) → return false (đã bị burn)

2. Lấy thông tin chứng chỉ
   └── cert = certificateDetails[tokenId]

3. Tái tạo Message Hash
   └── messageHash = keccak256(abi.encodePacked(tokenId, studentName, courseName))
   
   Ví dụ: keccak256(1, "Nguyen Van A", "Blockchain") → 0xabc123...

4. Chuyển sang Ethereum Signed Message Hash
   └── ethSignedMessageHash = keccak256("\x19Ethereum Signed Message:\n32" + messageHash)
   
   Đây là chuẩn EIP-191 để tránh replay attack

5. Phục hồi địa chỉ người ký từ chữ ký
   └── recoveredAddress = recoverSigner(ethSignedMessageHash, cert.signature)

6. So sánh với owner
   └── return recoveredAddress == owner
   
   Nếu khớp → Chứng chỉ hợp lệ (do Admin ký)
   Nếu không khớp → Chứng chỉ giả mạo
```

**Sơ đồ xác thực:**

```
┌─────────────────────────────────────────────────────────────┐
│                    QUÁ TRÌNH XÁC THỰC                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Token ID + Tên SV + Khóa học]                            │
│              │                                              │
│              ▼                                              │
│     ┌────────────────┐                                      │
│     │   keccak256    │  ← Hash dữ liệu                     │
│     └────────────────┘                                      │
│              │                                              │
│              ▼                                              │
│     ┌────────────────┐                                      │
│     │ Ethereum Sign  │  ← Thêm prefix chuẩn EIP-191        │
│     │    Message     │                                      │
│     └────────────────┘                                      │
│              │                                              │
│              ▼                                              │
│     ┌────────────────┐      ┌─────────────┐                │
│     │   ecrecover    │ ←────│  Signature  │                │
│     └────────────────┘      └─────────────┘                │
│              │                                              │
│              ▼                                              │
│     ┌────────────────┐      ┌─────────────┐                │
│     │ Recovered Addr │ ══?══│   Owner     │                │
│     └────────────────┘      └─────────────┘                │
│              │                                              │
│              ▼                                              │
│     ┌────────────────┐                                      │
│     │  TRUE / FALSE  │                                      │
│     └────────────────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 6.6 recoverSigner - Phục hồi địa chỉ người ký

```solidity
function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) 
    internal pure returns (address)
```

**Giải thích:**
```
1. Tách chữ ký thành 3 phần (r, s, v)
   └── splitSignature(_signature)

2. Sử dụng ecrecover để phục hồi địa chỉ
   └── ecrecover(_ethSignedMessageHash, v, r, s)
   
   ecrecover là hàm có sẵn của Solidity, dùng thuật toán ECDSA
```

---

### 6.7 splitSignature - Tách chữ ký

```solidity
function splitSignature(bytes memory sig) internal pure 
    returns (bytes32 r, bytes32 s, uint8 v)
```

**Giải thích:**

Chữ ký ECDSA có 65 bytes, gồm 3 phần:
- `r` (32 bytes): Tọa độ x của điểm R trên đường cong elliptic
- `s` (32 bytes): Giá trị chữ ký
- `v` (1 byte): Recovery ID (27 hoặc 28)

```
Cấu trúc chữ ký 65 bytes:
┌──────────────────────────────────────────────────────────────────┐
│  r (32 bytes)  │  s (32 bytes)  │  v (1 byte)                   │
│  [0-31]        │  [32-63]       │  [64]                          │
└──────────────────────────────────────────────────────────────────┘

Assembly code:
- mload(add(sig, 32)) → Đọc 32 bytes từ vị trí 32 → r
- mload(add(sig, 64)) → Đọc 32 bytes từ vị trí 64 → s  
- byte(0, mload(add(sig, 96))) → Đọc 1 byte từ vị trí 96 → v
```

---

## 7. CÁC HÀM ERC721 CƠ BẢN

### 7.1 balanceOf

```solidity
function balanceOf(address user) public view returns (uint256)
```

**Mô tả:** Trả về số lượng token mà `user` sở hữu

---

### 7.2 ownerOf

```solidity
function ownerOf(uint256 tokenId) public view returns (address)
```

**Mô tả:** Trả về địa chỉ chủ sở hữu của `tokenId`

---

### 7.3 approve

```solidity
function approve(address to, uint256 tokenId) public
```

**Mô tả:** Ủy quyền cho địa chỉ `to` được phép chuyển `tokenId`

**Điều kiện:** Người gọi phải là chủ sở hữu hoặc được ủy quyền toàn bộ

---

### 7.4 getApproved

```solidity
function getApproved(uint256 tokenId) public view returns (address)
```

**Mô tả:** Trả về địa chỉ được ủy quyền cho `tokenId`

---

### 7.5 setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) public
```

**Mô tả:** Ủy quyền/hủy ủy quyền cho `operator` quản lý TẤT CẢ token của người gọi

---

### 7.6 isApprovedForAll

```solidity
function isApprovedForAll(address holder, address operator) public view returns (bool)
```

**Mô tả:** Kiểm tra `operator` có được `holder` ủy quyền toàn bộ không

---

### 7.7 transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) public
```

**Mô tả:** Chuyển token từ `from` sang `to`

**Luồng xử lý:**
```
1. Kiểm tra điều kiện
   ├── Token thuộc về `from`
   └── Người gọi có quyền (là chủ/được approve/được approveAll)

2. Cập nhật số dư
   ├── _balances[from] -= 1
   └── _balances[to] += 1

3. Cập nhật owner
   └── _owners[tokenId] = to

4. Xóa approval
   └── _tokenApprovals[tokenId] = address(0)

5. Cập nhật danh sách Enumerable
   ├── Xóa khỏi list của `from`
   └── Thêm vào list của `to`

6. Emit Transfer event
```

---

## 8. CÁC HÀM HELPER (PRIVATE)

### 8.1 _removeTokenFromOwnerEnumeration

```solidity
function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private
```

**Mô tả:** Xóa token khỏi danh sách của user

**Thuật toán Swap & Pop:**
```
Ví dụ: Xóa token 5 khỏi mảng [3, 5, 7, 9]

Bước 1: Tìm vị trí của 5 → index = 1
Bước 2: Lấy phần tử cuối → lastToken = 9
Bước 3: Swap: [3, 9, 7, 9]
Bước 4: Pop: [3, 9, 7]

Kết quả: Token 5 đã bị xóa, thứ tự không quan trọng
```

**Tại sao dùng Swap & Pop?**
- Xóa phần tử ở giữa mảng trong Solidity rất tốn gas
- Swap & Pop chỉ tốn O(1) gas thay vì O(n)

---

### 8.2 _removeTokenFromAllTokensEnumeration

```solidity
function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private
```

**Mô tả:** Xóa token khỏi danh sách tổng `_allTokens`

**Thuật toán:** Tương tự Swap & Pop, nhưng sử dụng `_allTokensIndex` để tìm vị trí nhanh hơn (O(1) thay vì O(n))

---

## 9. TỔNG KẾT

### Bảng tóm tắt các hàm

| Hàm | Quyền | Mô tả |
|-----|-------|-------|
| `safeMint` | Admin | Cấp chứng chỉ mới |
| `_burnCertificate` | Admin | Thu hồi chứng chỉ |
| `getCertificatesByOwner` | Public | Lấy danh sách chứng chỉ của user |
| `getAllIssuedCertificates` | Public | Lấy tất cả chứng chỉ |
| `verifyCertificate` | Public | Xác thực chứng chỉ |
| `balanceOf` | Public | Số token của user |
| `ownerOf` | Public | Chủ sở hữu token |
| `approve` | Owner/Operator | Ủy quyền 1 token |
| `setApprovalForAll` | Owner | Ủy quyền tất cả |
| `transferFrom` | Owner/Approved | Chuyển token |

### Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMART CONTRACT CERTIFICATE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    ADMIN    │    │  SINH VIÊN  │    │   PUBLIC    │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  safeMint   │    │ balanceOf   │    │   verify    │         │
│  │    burn     │    │  ownerOf    │    │ Certificate │         │
│  │  getAll...  │    │ getCerts... │    │             │         │
│  └─────────────┘    │ transfer    │    └─────────────┘         │
│                     │  approve    │                             │
│                     └─────────────┘                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    DATA STORAGE                          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  _owners          │ Token ID → Owner Address            │   │
│  │  _balances        │ Address → Token Count               │   │
│  │  certificateDetails│ Token ID → CertificateInfo        │   │
│  │  _ownedTokens     │ Address → Token ID[]                │   │
│  │  _allTokens       │ All Token IDs                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
