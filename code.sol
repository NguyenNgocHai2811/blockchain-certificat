// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract Certificate {
    // --- 1. KHAI BÁO CƠ BẢN ---
    string public name = "VNU Certificate"; // Tên bộ sưu tập
    string public symbol = "VNUC";          // Ký hiệu
    address public owner;                   // Địa chỉ Admin (Nhà trường)

    // --- 2. STRUCT DỮ LIỆU ---
    struct CertificateInfo {
        string studentName; // Tên sinh viên
        string courseName;  // Tên khóa học
        string grade;       // Xếp loại
        string imageURL;    // Link ảnh (IPFS)
        uint256 issueDate;  // Ngày cấp (Unix timestamp)
        bytes signature;    // Chữ ký số của Admin
    }

    // --- 3. MAPPINGS LƯU TRỮ ---
    
    // a. Core ERC721
    mapping (uint256 => address) private _owners;
    mapping (address => uint256) private _balances;
    mapping (uint256 => address) private _tokenApprovals;
    mapping (address => mapping (address => bool)) private _operatorApprovals;

    // b. Dữ liệu văn bằng
    mapping (uint256 => CertificateInfo) public certificateDetails;

    // c. Liệt kê danh sách (Enumerable)
    // - Danh sách token của từng user
    mapping(address => uint256[]) private _ownedTokens;
    // - Danh sách TOÀN BỘ token hệ thống (cho Admin)
    uint256[] private _allTokens;
    mapping(uint256 => uint256) private _allTokensIndex; // Map ID -> Vị trí trong mảng

    // --- 4. EVENTS ---
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event CertificateIssued(uint256 indexed tokenId, address indexed student, string course);
    event CertificateRevoked(uint256 indexed tokenId, string reason);

    // --- 5. KHỞI TẠO ---
    constructor () {
        owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "Chi Admin moi duoc goi ham nay");
        _;
    }

    // =============================================================
    // CHỨC NĂNG 1: CẤP BẰNG (MINT) - DÀNH CHO ADMIN
    // =============================================================
    
    function safeMint(address to, uint256 tokenId, CertificateInfo memory data) public onlyOwner {
        require(to != address(0), "Khong the cap cho dia chi 0");
        require(_owners[tokenId] == address(0), "Token ID nay da ton tai");

        // 1. Lưu metadata
        certificateDetails[tokenId] = data;
        // Nếu Frontend gửi ngày = 0, tự lấy ngày hiện tại
        if (certificateDetails[tokenId].issueDate == 0) {
            certificateDetails[tokenId].issueDate = block.timestamp;
        }

        // 2. Cập nhật ERC721 state
        _balances[to] += 1;
        _owners[tokenId] = to;

        // 3. Cập nhật danh sách (Enumerable)
_ownedTokens[to].push(tokenId); // Thêm vào list User
        
        _allTokensIndex[tokenId] = _allTokens.length; // Lưu vị trí index
        _allTokens.push(tokenId); // Thêm vào list Tổng

        // 4. Emit Events
        emit Transfer(address(0), to, tokenId);
        emit CertificateIssued(tokenId, to, data.courseName);

    }

    // =============================================================
    // CHỨC NĂNG 2: THU HỒI BẰNG (BURN) - DÀNH CHO ADMIN
    // =============================================================

    function _burnCertificate(uint256 tokenId) public onlyOwner {
        require(_owners[tokenId] != address(0), "Token khong ton tai");
        address studentWallet = _owners[tokenId];

        // 1. Xóa quyền (Approval)
        _tokenApprovals[tokenId] = address(0);

        // 2. Giảm số dư
        _balances[studentWallet] -= 1;
        _owners[tokenId] = address(0);

        // 3. Xóa data
        delete certificateDetails[tokenId];

        // 4. Xóa khỏi danh sách User (Swap & Pop)
        _removeTokenFromOwnerEnumeration(studentWallet, tokenId);

        // 5. Xóa khỏi danh sách Tổng (Swap & Pop)
        _removeTokenFromAllTokensEnumeration(tokenId);

        emit Transfer(studentWallet, address(0), tokenId);
        emit CertificateRevoked(tokenId, "Admin thu hoi");
    }

    // =============================================================
    // CHỨC NĂNG 3: XEM DANH SÁCH (VIEW)
    // =============================================================

    // Cho trang "Hồ sơ của tôi" (User Portfolio)
    function getCertificatesByOwner(address _user) public view returns (CertificateInfo[] memory) {
        uint256[] memory userTokenIds = _ownedTokens[_user];
        CertificateInfo[] memory result = new CertificateInfo[](userTokenIds.length);
        
        for (uint256 i = 0; i < userTokenIds.length; i++) {
            result[i] = certificateDetails[userTokenIds[i]];
        }
        return result;
    }

    // Cho trang "Admin Dashboard" (Management)
    function getAllIssuedCertificates() public view returns (CertificateInfo[] memory) {
        CertificateInfo[] memory result = new CertificateInfo[](_allTokens.length);
        for (uint256 i = 0; i < _allTokens.length; i++) {
            result[i] = certificateDetails[_allTokens[i]];
        }
        return result;
    }

    // =============================================================
    // CHỨC NĂNG 4: XÁC THỰC (VERIFY) - PUBLIC
    // =============================================================

    function verifyCertificate(uint256 tokenId) public view returns (bool) {
        // Nếu token đã bị burn (owner == 0) -> False
        if(_owners[tokenId] == address(0)) return false;

        CertificateInfo memory cert = certificateDetails[tokenId];

        // 1. Tái tạo Hash (Phải khớp quy tắc frontend)
        // Hash gồm: TokenID, Tên SV, Tên Khóa Học
bytes32 messageHash = keccak256(abi.encodePacked(
            tokenId,
            cert.studentName,
            cert.courseName
        ));

        // 2. Chuyển sang Ethereum Signed Message
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));

        // 3. Phục hồi địa chỉ người ký
        return recoverSigner(ethSignedMessageHash, cert.signature) == owner;
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Chu ky khong hop le");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    // =============================================================
    // CHỨC NĂNG 5: CÁC HÀM CƠ BẢN ERC721 (DEMO FULL TÍNH NĂNG)
    // =============================================================

    function balanceOf(address user) public view returns (uint256) { return _balances[user]; }
    function ownerOf(uint256 tokenId) public view returns (address) { return _owners[tokenId]; }

    function approve(address to, uint256 tokenId) public {
        address holder = _owners[tokenId];
        require(msg.sender == holder || isApprovedForAll(holder, msg.sender), "Khong co quyen approve");
        _tokenApprovals[tokenId] = to;
        emit Approval(holder, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address) { return _tokenApprovals[tokenId]; }

    function setApprovalForAll(address operator, bool approved) public {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address holder, address operator) public view returns (bool) {
        return _operatorApprovals[holder][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_owners[tokenId] == from, "Token khong phai cua from");
        require(msg.sender == from || getApproved(tokenId) == msg.sender || isApprovedForAll(from, msg.sender), "Chua duoc uy quyen");
        
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        _tokenApprovals[tokenId] = address(0);

        // Cập nhật danh sách riêng lẻ
        _removeTokenFromOwnerEnumeration(from, tokenId);
        _ownedTokens[to].push(tokenId);

        emit Transfer(from, to, tokenId);
    }

    // =============================================================
    // CÁC HÀM HELPER (PRIVATE - XỬ LÝ DANH SÁCH)
   

    // Xóa khỏi danh sách User (Swap & Pop)
function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {
        uint256 lastTokenIndex = _ownedTokens[from].length - 1;
        uint256 tokenIndex = 0;
        bool found = false;
        
        for (uint256 i = 0; i < _ownedTokens[from].length; i++) {
            if (_ownedTokens[from][i] == tokenId) {
                tokenIndex = i; found = true; break;
            }
        }
        if (!found) return;

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
        }
        _ownedTokens[from].pop();
    }

    // Xóa khỏi danh sách Tổng (Swap & Pop)
    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
        uint256 lastTokenIndex = _allTokens.length - 1;
        uint256 tokenIndex = _allTokensIndex[tokenId];
        uint256 lastTokenId = _allTokens[lastTokenIndex];

        _allTokens[tokenIndex] = lastTokenId; 
        _allTokensIndex[lastTokenId] = tokenIndex; 

        delete _allTokensIndex[tokenId];
        _allTokens.pop();
    }
}