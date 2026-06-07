# Unite Staycation Web V2.3 Cinematic Business Refined

Bản này giữ lại nền V2 Cinematic mà Hạnh thích nhưng chỉnh theo feedback mới:

1. Room Reel đã được đẩy lên trên Homes & Layouts.
2. Website không còn chỉ là bảng giá, mà là website giới thiệu hệ thống Unite Staycation:
   - Hero thương hiệu
   - Room Reel
   - Về Unite
   - Homes & Layouts
   - Bảng giá so sánh gọn
   - Nội quy lưu trú
   - Contact
3. Bảng giá ở trang chủ đã chuyển thành dạng compact comparison, dễ nhìn và dễ so sánh hơn.
4. Chi tiết phòng đã làm lại:
   - Không còn cột bảng giá quá to
   - Giá nằm dạng chip gọn trong phần thông tin
   - Gallery rộng hơn, bố cục nhẹ hơn
   - Có sticky note trên desktop và floating CTA trên mobile
5. Fix lỗi hover/tap bị hiện góc nhọn:
   - -webkit-tap-highlight-color: transparent
   - clip-path inset round cho hero-photo, reel-card, room-card, gallery-item
   - contain: paint, isolation, mask-image để Safari/iPhone giữ bo góc tốt hơn
6. Tối ưu mobile iPhone/Android:
   - viewport-fit=cover
   - safe-area-inset
   - Room Reel kéo ngang nhẹ hơn
   - filter bar sticky mobile
   - gallery 1 cột trên mobile
   - CTA nổi ở trang chi tiết

Cách dùng:
- Copy nguyên bộ index.html, room.html, css, js vào thư mục UNITESTAYCATION.
- Giữ nguyên thư mục img.
- Mở index.html bằng Live Server.
- Nếu trình duyệt vẫn hiện bản cũ: Ctrl + F5 hoặc xoá cache.


V2.4 update:
- Dùng logo chính thức từ: https://techbytruong.wordpress.com/wp-content/uploads/2026/06/logo-staycation.png
- Homes & Layouts đổi sang layout tile gọn hơn để xem toàn diện nhiều phòng.
- Chi tiết phòng giảm chiều cao khối đầu, gallery chia 4 cột desktop / 2 cột mobile.
- Tối ưu thêm iPhone/Android và fix mạnh lỗi hover/tap lộ góc nhọn.


V2.5 update:
- Dọn lại toàn bộ câu chữ mang tính nội bộ/kỹ thuật, chuyển sang wording công khai hơn.
- Bỏ các câu như “gọn để khách dễ chọn”, “bảng giá gọn để so sánh nhanh”.
- Hero 3 ảnh được làm sống động hơn: ambient glow, orbit frame, sheen ánh sáng, caption sâu hơn, note nổi.
- Mobile giữ hiệu ứng nhưng giảm rối, bỏ sheen trên màn nhỏ.


V2.6 update:
- Tối giản headline hero: bỏ 3 dòng chữ quá lớn, chuyển thành Private / Staycation + 3 chip Riêng tư - Thoải mái - Dễ chịu.
- Tăng hiệu ứng ánh sáng quét qua 3 khung ảnh hero.
- Sửa nút điều hướng Room Reel: click ổn định hơn, tự dừng auto-scroll ngắn khi nhấn.
- Ẩn nút reel trên màn cảm ứng để tránh rối; mobile ưu tiên kéo ngang.


V2.6.1 update:
- Đã bỏ hiệu ứng lóe sáng / ánh sáng quét qua trên 3 khung ảnh hero.
- Giữ nguyên bố cục cinematic, ảnh chồng, Room Reel, mobile polish và các chỉnh sửa V2.6.
