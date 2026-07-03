// UNITESTAYCATION/js/app.js

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const getMainImage = (room) => room.images?.[0] || "";
const getPrice = (room, label) => room.prices.find(item => item.label === label)?.value || "-";

const imgTag = (src, alt, className = "") => `
  <img
    class="${className}"
    src="${src}"
    alt="${alt}"
    loading="lazy"
    decoding="async"
    onerror="this.closest('.image-wrap, .gallery-item, .hero-photo, .reel-card, .about-media, .detail-cover, .related-card, .result-photo')?.classList.add('image-missing'); this.style.display='none';"
  />
`;

const tagsHTML = (tags) => tags.map(tag => `<span class="tag">${tag}</span>`).join("");

const formatStayDate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

const ADMIN_STORAGE_KEY = "unite-staycation-admin-overrides-v1";
const SMART_BOOKING_STORAGE_KEY = "unite-staycation-smart-booking-v1";

const toDateInputValue = (date = new Date()) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const year = copy.getFullYear();
  const month = String(copy.getMonth() + 1).padStart(2, "0");
  const day = String(copy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const readStoredSmartBooking = () => {
  try {
    return JSON.parse(localStorage.getItem(SMART_BOOKING_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeStoredSmartBooking = (state) => {
  try {
    localStorage.setItem(SMART_BOOKING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The dock still works without persistence.
  }
};

const amenityCatalog = {
  wifi: { label: "Wi-Fi", short: "WF", icon: "wifi" },
  aircon: { label: "Máy lạnh", short: "AC", icon: "snow" },
  bathtub: { label: "Bồn tắm", short: "BT", icon: "bath" },
  tv: { label: "TV / giải trí", short: "TV", icon: "tv" },
  "self-checkin": { label: "Check-in tự túc", short: "IN", icon: "key" },
  support: { label: "Hỗ trợ nhanh", short: "SP", icon: "chat" },
  "photo-corner": { label: "Góc chụp đẹp", short: "PH", icon: "spark" },
  parking: { label: "Gửi xe", short: "PK", icon: "car" },
  kitchen: { label: "Bếp nhỏ", short: "KT", icon: "kitchen" },
  laundry: { label: "Giặt ủi", short: "LD", icon: "wash" }
};

const statusLabels = {
  available: "Đang mở",
  low: "Sắp kín",
  maintenance: "Tạm khóa"
};

const readAdminOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeAdminOverrides = (data) => {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Static fallback: keep the visible admin controls usable even if storage is blocked.
  }
};

const defaultRoomAdmin = (room) => ({
  inventory: Number(room.inventory || 1),
  status: room.status || "available",
  category: room.category || room.type || "Studio",
  amenities: [...(room.amenities || [])]
});

const getRoomAdmin = (room) => {
  const override = readAdminOverrides()[room.id] || {};
  const defaults = defaultRoomAdmin(room);
  return {
    ...defaults,
    ...override,
    inventory: Math.max(0, Number(override.inventory ?? defaults.inventory ?? 1)),
    amenities: Array.isArray(override.amenities) ? override.amenities : defaults.amenities
  };
};

const amenityIcon = (name) => {
  const paths = {
    wifi: `<path d="M4 10c4.7-4 11.3-4 16 0"/><path d="M7 13c3-2.5 7-2.5 10 0"/><path d="M10 16c1.2-.8 2.8-.8 4 0"/><circle cx="12" cy="19" r="1"/>`,
    snow: `<path d="M12 3v18"/><path d="M5 7l14 10"/><path d="M19 7L5 17"/><path d="M8 5l4 3 4-3"/><path d="M8 19l4-3 4 3"/>`,
    bath: `<path d="M5 11h14v3a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-3Z"/><path d="M7 11V6a2 2 0 0 1 2-2h1"/><path d="M4 21h16"/><path d="M9 7h4"/>`,
    tv: `<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/>`,
    key: `<circle cx="8" cy="12" r="3"/><path d="M11 12h9"/><path d="M16 12v3"/><path d="M19 12v2"/>`,
    chat: `<path d="M5 5h14v10H8l-3 4V5Z"/><path d="M8 9h8"/><path d="M8 12h5"/>`,
    spark: `<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3Z"/>`,
    car: `<path d="M5 13l2-5h10l2 5"/><rect x="4" y="13" width="16" height="5" rx="2"/><circle cx="7" cy="18" r="1"/><circle cx="17" cy="18" r="1"/>`,
    kitchen: `<path d="M7 3v18"/><path d="M4 3v6a3 3 0 0 0 6 0V3"/><path d="M15 3h3v18h-3z"/>`,
    wash: `<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="14" r="4"/><path d="M8 7h2"/><path d="M14 7h2"/>`
  };

  return `
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      ${paths[name] || paths.spark}
    </svg>
  `;
};

const getRoomAmenities = (room) => {
  const admin = getRoomAdmin(room);
  return admin.amenities
    .map(key => ({ key, ...(amenityCatalog[key] || { label: key, short: key.slice(0, 2).toUpperCase(), icon: "spark" }) }));
};

const amenityBadgesHTML = (room, limit = 4) => {
  const items = getRoomAmenities(room).slice(0, limit);
  return `
    <div class="amenity-mini-list">
      ${items.map(item => `
        <span title="${item.label}">
          ${amenityIcon(item.icon)}
          <small>${item.label}</small>
        </span>
      `).join("")}
    </div>
  `;
};

const numericPrice = (room, label) => {
  const raw = getPrice(room, label);
  const match = String(raw).match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
};

const roomDetailContent = (room) => {
  const hasBathtub = room.filters.includes("bathtub");
  const isSignature = room.filters.includes("signature");
  const isBudget = room.filters.includes("budget");
  const isNhieuTu = room.location.includes("Nhiêu Tứ");
  const admin = getRoomAdmin(room);

  const locationPicks = isNhieuTu
    ? [
        { name: "Phan Xích Long", desc: "Nhiều quán ăn, cafe và tiện mua đồ trước khi check-in." },
        { name: "Sân bay Tân Sơn Nhất", desc: "Di chuyển thuận tiện cho khách cần nghỉ ngắn trước hoặc sau chuyến bay." },
        { name: "Trung tâm Quận 1", desc: "Phù hợp ghé chơi, chụp hình hoặc ăn tối rồi quay về nghỉ riêng tư." }
      ]
    : [
        { name: "Khu Phan Tây Hồ", desc: "Hẻm yên tĩnh, dễ đặt xe và nhiều lựa chọn ăn uống gần phòng." },
        { name: "Phan Xích Long", desc: "Gần cafe, nhà hàng, cửa hàng tiện lợi và các điểm hẹn nhẹ nhàng." },
        { name: "Trục Hoàng Văn Thụ", desc: "Thuận tiện đi sân bay, Quận 1, Bình Thạnh hoặc Gò Vấp." }
      ];

  return {
    score: isSignature ? "4.9" : isBudget ? "4.7" : "4.8",
    reviews: isSignature ? "86 đánh giá" : isBudget ? "41 đánh giá" : "68 đánh giá",
    verdict: isSignature ? "Rất được yêu thích" : isBudget ? "Gọn sạch, dễ đặt" : "Rất tốt",
    intro: [
      `${room.name} là lựa chọn ${isSignature ? "signature" : isBudget ? "gọn gàng, dễ tiếp cận" : "premium riêng tư"} dành cho những buổi staycation cần không gian đẹp, sạch và có cảm giác tách khỏi nhịp vội bên ngoài.`,
      hasBathtub
        ? "Điểm nhấn bồn tắm giúp căn phòng hợp với dịp kỷ niệm, nghỉ ngơi sau một ngày dài hoặc một buổi chụp lifestyle nhẹ nhàng."
        : "Không gian được giữ tối giản, riêng tư và dễ dùng để khách có thể nghỉ, xem phim, làm việc nhẹ hoặc tận hưởng vài giờ yên tĩnh.",
      "Trước khi nhận phòng, admin sẽ xác nhận lại khung giờ, số khách, tình trạng phòng và gửi hướng dẫn check-in rõ ràng để khách không phải hỏi nhiều."
    ],
    amenities: [
      { label: "Wi-Fi ổn định", desc: "Phù hợp xem phim, nghe nhạc, gọi video hoặc làm việc nhẹ." },
      { label: "Máy lạnh riêng", desc: "Không gian riêng tư, dễ chỉnh nhiệt theo nhu cầu." },
      { label: hasBathtub ? "Bồn tắm thư giãn" : "Phòng tắm riêng", desc: hasBathtub ? "Chuẩn bị tốt cho stay couple, sinh nhật hoặc nghỉ ngắn." : "Sạch gọn, riêng tư, đủ tiện nghi cơ bản." },
      { label: "TV / giải trí", desc: "Phù hợp một buổi xem phim, nghỉ ngơi hoặc chill nhẹ." },
      { label: "Check-in tự túc", desc: "Hướng dẫn được gửi trước giờ nhận phòng để khách chủ động." },
      { label: "Hỗ trợ nhanh", desc: "Admin xác nhận lịch, giá và lưu ý trước khi khách đến." }
    ],
    goodFor: [
      "Couple staycation",
      "Nghỉ vài giờ",
      isSignature ? "Chụp lifestyle" : "Xem phim riêng tư",
      isBudget ? "Giá dễ tiếp cận" : "Dịp đặc biệt"
    ],
    facts: [
      { label: "Sức chứa", value: "Tối đa 2 khách" },
      { label: "Số lượng", value: `${admin.inventory} phòng` },
      { label: "Trạng thái", value: statusLabels[admin.status] || "Đang mở" },
      { label: "Khung giờ", value: "3h / 4h / 8h / Ngày" },
      { label: "Check-in", value: "Theo lịch đã đặt" },
      { label: "Phụ thu trễ", value: "Từ 10 phút" }
    ],
    steps: [
      { title: "Chọn gói", desc: "Chọn 3h, 4h, 8h hoặc ngày theo lịch cần nghỉ." },
      { title: "Nhắn mã phòng", desc: `Gửi mã ${room.id} để admin kiểm tra tình trạng phòng.` },
      { title: "Xác nhận", desc: "Admin gửi giá cuối, giờ nhận phòng và lưu ý thanh toán." },
      { title: "Nhận hướng dẫn", desc: "Khách nhận địa chỉ, cách vào phòng và nội quy cần biết." }
    ],
    faqs: [
      { q: "Phòng có phù hợp cho 2 người không?", a: "Có. Các phòng được thiết kế cho tối đa 2 khách để giữ sự riêng tư và thoải mái." },
      { q: "Có thể đặt theo giờ không?", a: "Có. Unite có các gói 3h, 4h, 8h và ngày; giá có thể thay đổi theo lịch thực tế." },
      { q: "Làm sao biết còn phòng?", a: "Khách gửi mã phòng và khung giờ mong muốn, admin sẽ xác nhận tình trạng trước khi chốt." },
      { q: "Có cần đọc nội quy trước không?", a: "Nên đọc trước phần nội quy để tránh phụ thu trễ giờ, vượt số khách hoặc phát sinh ngoài ý muốn." }
    ],
    nearby: locationPicks
  };
};

const compactPricesHTML = (room) => `
  <div class="compact-price-line">
    <span><small>3h</small>${getPrice(room, "3 tiếng")}</span>
    <span><small>4h</small>${getPrice(room, "4 tiếng")}</span>
    <span><small>8h</small>${getPrice(room, "8 tiếng")}</span>
    <span><small>Ngày</small>${getPrice(room, "Ngày")}</span>
  </div>
`;

const priceHTML = (prices) => prices.map(item => `
  <div class="price-item">
    <span>${item.label}</span>
    <strong>${item.value}</strong>
  </div>
`).join("");

const initLoader = () => {
  const loader = $("#pageLoader");
  if (!loader) return;
  window.setTimeout(() => loader.classList.add("hide"), 520);
};

const initHeader = () => {
  const header = $("#siteHeader");
  const progress = $("#pageProgress");

  const update = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 24);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? y / max : 0;
      progress.style.transform = `scaleX(${ratio})`;
    }
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
};

const initReveal = () => {
  const items = $$(".reveal-up, .room-card, .policy-grid article, .rules-item, .price-row, .flow-card, .admin-card");
  if (!("IntersectionObserver" in window)) {
    items.forEach(item => item.classList.add("active"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(item => observer.observe(item));
};

const initMagneticButtons = () => {
  if (window.matchMedia("(hover: none)").matches) return;

  $$(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (event) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.06}px, ${y * 0.12}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
};

const renderHeroStack = () => {
  const stack = $("#heroStack");
  if (!stack) return;

  const selected = [rooms[0], rooms[2], rooms[4]].filter(Boolean);

  stack.innerHTML = `
    <div class="hero-orbit" aria-hidden="true"></div>
    <div class="hero-ambient ambient-one" aria-hidden="true"></div>
    <div class="hero-ambient ambient-two" aria-hidden="true"></div>

    ${selected.map((room, index) => `
      <a class="hero-photo hero-photo-${index + 1}" href="room.html?id=${room.id}" style="--i:${index}">
        ${imgTag(getMainImage(room), room.name)}
        <div class="hero-photo-sheen" aria-hidden="true"></div>
        <div class="hero-photo-caption">
          <span>${room.id}</span>
          <strong>${room.name}</strong>
          <small>${room.location}</small>
        </div>
      </a>
    `).join("")}

    <div class="hero-mood-note">
      <span>Selected stays</span>
      <strong>Private · Soft · Curated</strong>
    </div>
  `;
};

const roomPreviewHTML = (room, index = 0) => `
  <a class="layout-tile reveal-up" href="room.html?id=${room.id}" style="--delay:${index * 45}ms" aria-label="Xem chi tiết ${room.name}">
    <div class="layout-thumb">
      ${imgTag(getMainImage(room), room.name)}
      <span>${room.chapter}</span>
    </div>

    <div class="layout-info">
      <div>
        <p>${room.id} · ${room.type}</p>
        <h3>${room.name}</h3>
      </div>
      <small>${room.vibe}</small>
      ${amenityBadgesHTML(room, 4)}
      <div class="layout-meta">
        <span>Từ <strong>${getPrice(room, "3 tiếng")}</strong></span>
        <span>${getRoomAdmin(room).inventory} phòng · ${statusLabels[getRoomAdmin(room).status] || "Đang mở"}</span>
      </div>
    </div>
  </a>
`;

const renderHomeRooms = () => {
  const nhieuTu = $("#homeNhieuTu");
  const phanTayHo = $("#homePhanTayHo");

  if (nhieuTu) {
    const data = rooms.filter(room => room.location === "29 Nhiêu Tứ");
    nhieuTu.innerHTML = data.map((room, index) => roomPreviewHTML(room, index)).join("");
  }

  if (phanTayHo) {
    const data = rooms.filter(room => room.location === "76/39 Phan Tây Hồ");
    phanTayHo.innerHTML = data.map((room, index) => roomPreviewHTML(room, index)).join("");
  }

  bindCopyButtons();
  initReveal();
};

const priceCompareHTML = (room, index = 0) => `
  <article class="price-row reveal-up" style="--delay:${index * 45}ms">
    <a class="price-room" href="room.html?id=${room.id}">
      <img src="${getMainImage(room)}" alt="${room.name}" loading="lazy" />
      <span>
        <strong>${room.name}</strong>
        <small>${room.id} · ${room.location}</small>
        ${amenityBadgesHTML(room, 3)}
      </span>
    </a>

    <div class="price-values">
      <span><small>3 tiếng</small><strong>${getPrice(room, "3 tiếng")}</strong></span>
      <span><small>4 tiếng</small><strong>${getPrice(room, "4 tiếng")}</strong></span>
      <span><small>8 tiếng</small><strong>${getPrice(room, "8 tiếng")}</strong></span>
      <span><small>Ngày</small><strong>${getPrice(room, "Ngày")}</strong></span>
    </div>

    <a class="btn soft small" href="room.html?id=${room.id}">Xem</a>
  </article>
`;

const renderPriceCompare = (list) => {
  const grid = $("#priceCompare");
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>Chưa có phòng phù hợp</h3>
        <p>Hạnh kiểm tra lại bộ lọc hoặc dữ liệu trong rooms.js nha.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map((room, index) => priceCompareHTML(room, index)).join("");
  initReveal();
};

const initLanguageSwitcher = () => {
  const switcher = $("#languageSwitcher");
  const toggle = $("#languageToggle");
  const menu = $("#languageMenu");
  if (!switcher || !toggle || !menu) return;

  const current = $("strong", toggle);
  const close = () => {
    switcher.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = !switcher.classList.contains("open");
    switcher.classList.toggle("open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
  });

  $$("[data-lang]", menu).forEach(button => {
    button.addEventListener("click", () => {
      const lang = button.dataset.lang;
      $$("[data-lang]", menu).forEach(item => item.classList.toggle("active", item === button));
      if (current) current.textContent = lang;
      document.documentElement.lang = lang === "VIE" ? "vi" : lang === "ENG" ? "en" : "zh";

      const note = $("#bookingResultNote");
      if (note) {
        note.textContent = lang === "VIE"
          ? "Đã chọn tiếng Việt. Bạn có thể tiếp tục tìm phòng theo địa điểm, ngày và gói lưu trú."
          : `Đã chọn ${lang}. Bản nội dung đầy đủ có thể bổ sung sau, thanh tìm phòng vẫn dùng bình thường.`;
      }

      close();
    });
  });

  document.addEventListener("click", (event) => {
    if (!switcher.contains(event.target)) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
};

const initHeaderQuickContact = () => {
  const button = $(".tool-icon");
  if (!button) return;

  button.addEventListener("click", () => {
    $("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    const note = $("#bookingResultNote");
    if (note) {
      note.textContent = "Cần hỏi nhanh? Kéo xuống phần liên hệ để nhắn Unite xác nhận lịch, giá và hướng dẫn check-in.";
    }
  });
};

const bookingWidgetHTML = ({ className = "", buttonText = "Tìm phòng", note = "", room = null } = {}) => `
  <section
    class="home-booking-bar ${className}"
    id="homeBookingBar"
    aria-label="${room ? `Đặt phòng ${room.name}` : "Tìm phòng nhanh"}"
    ${room ? `data-booking-context="room" data-room-id="${room.id}" data-default-destination="${room.location}"` : ""}
  >
    <div class="booking-field" data-panel="destination">
      <button type="button" class="booking-trigger" aria-expanded="false">
        <span>Địa điểm</span>
        <strong id="bookingDestinationText">${room ? room.location : "Tất cả địa điểm"}</strong>
        <small>${room ? `${room.id} · ${room.name}` : "Chọn khu stay bạn muốn xem."}</small>
      </button>
      <div class="booking-popover destination-popover" data-booking-panel="destination">
        <button type="button" data-destination="all">Tất cả địa điểm <small>5 layout đang mở</small></button>
        <button type="button" data-destination="29 Nhiêu Tứ">29 Nhiêu Tứ <small>Gần Phan Xích Long</small></button>
        <button type="button" data-destination="76/39 Phan Tây Hồ">76/39 Phan Tây Hồ <small>Yên tĩnh, riêng tư</small></button>
      </div>
    </div>

    <div class="booking-field" data-panel="dates">
      <button type="button" class="booking-trigger" aria-expanded="false">
        <span>Nhận phòng</span>
        <strong id="bookingDateText">Hôm nay</strong>
        <small id="bookingCheckoutText">Trả phòng theo gói đã chọn.</small>
      </button>
      <div class="booking-popover date-popover" data-booking-panel="dates">
        <div class="calendar-toolbar">
          <button type="button" id="calendarPrev" aria-label="Tháng trước">‹</button>
          <strong>Lịch lưu trú</strong>
          <button type="button" id="calendarNext" aria-label="Tháng sau">›</button>
        </div>
        <div class="calendar-months" id="bookingCalendar"></div>
      </div>
    </div>

    <div class="booking-field" data-panel="duration">
      <button type="button" class="booking-trigger" aria-expanded="false">
        <span>Thời lượng</span>
        <strong id="bookingDurationText">3 giờ</strong>
        <small>Linh hoạt cho nghỉ nhanh hoặc stay dài hơn.</small>
      </button>
      <div class="booking-popover duration-popover" data-booking-panel="duration">
        <button type="button" data-duration="3 tiếng" class="active">3 giờ <small>Nghỉ nhanh, xem phim</small></button>
        <button type="button" data-duration="4 tiếng">4 giờ <small>Thoải mái hơn một chút</small></button>
        <button type="button" data-duration="8 tiếng">8 giờ <small>Nửa ngày riêng tư</small></button>
        <button type="button" data-duration="Ngày">Theo ngày <small>Ở lâu, check-in rõ lịch</small></button>
      </div>
    </div>

    <div class="booking-field" data-panel="guests">
      <button type="button" class="booking-trigger" aria-expanded="false">
        <span>Khách</span>
        <strong id="bookingGuestText">2 người lớn</strong>
        <small>Tối đa 2 khách theo nội quy.</small>
      </button>
      <div class="booking-popover guest-popover" data-booking-panel="guests">
        <div class="guest-row">
          <span><strong>Người lớn</strong><small>Từ 13 tuổi trở lên</small></span>
          <div class="counter-control">
            <button type="button" data-counter="adults" data-step="-1">−</button>
            <strong id="adultCount">2</strong>
            <button type="button" data-counter="adults" data-step="1">+</button>
          </div>
        </div>
        <div class="guest-row">
          <span><strong>Trẻ em</strong><small>Dưới 13 tuổi</small></span>
          <div class="counter-control">
            <button type="button" data-counter="children" data-step="-1">−</button>
            <strong id="childCount">0</strong>
            <button type="button" data-counter="children" data-step="1">+</button>
          </div>
        </div>
        <p>Unite ưu tiên tối đa 2 khách/phòng. Nếu có nhu cầu khác, admin sẽ xác nhận riêng.</p>
      </div>
    </div>

    <button class="btn primary booking-search-btn" type="button" id="bookingSearchBtn">${buttonText}</button>
  </section>
  ${note ? `<div class="booking-result-note detail-booking-note" id="bookingResultNote" aria-live="polite">${note}</div>` : ""}
`;

const initHomeBookingWidget = () => {
  const bar = $("#homeBookingBar");
  const calendar = $("#bookingCalendar");
  if (!bar || !calendar) return;

  const maxGuests = 2;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const urlParams = new URLSearchParams(window.location.search);

  const parseDateKey = (key) => {
    if (!key) return new Date(today);
    const [year, month, day] = key.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) || parsed < today ? new Date(today) : parsed;
  };

  const state = {
    destination: urlParams.get("destination") || bar.dataset.defaultDestination || "all",
    destinationLabel: "Tất cả địa điểm",
    duration: urlParams.get("duration") || bar.dataset.defaultDuration || "3 tiếng",
    durationLabel: "3 giờ",
    adults: Math.min(maxGuests, Math.max(1, Number(urlParams.get("adults") || 2))),
    children: Math.min(maxGuests - 1, Math.max(0, Number(urlParams.get("children") || 0))),
    selectedDate: parseDateKey(urlParams.get("date")),
    calendarMonth: new Date(parseDateKey(urlParams.get("date")).getFullYear(), parseDateKey(urlParams.get("date")).getMonth(), 1)
  };
  if (state.adults + state.children > maxGuests) {
    state.children = Math.max(0, maxGuests - state.adults);
  }

  const monthNames = [
    "Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu",
    "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"
  ];

  const durationLabels = {
    "3 tiếng": "3 giờ",
    "4 tiếng": "4 giờ",
    "8 tiếng": "8 giờ",
    "Ngày": "Theo ngày"
  };
  state.durationLabel = durationLabels[state.duration] || state.duration;

  const formatDate = (date) => new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(date);

  const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fromDateKey = (key) => {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  const syncActiveOptions = () => {
    const destinationButton = $$("[data-destination]", bar).find(button => button.dataset.destination === state.destination);
    if (destinationButton) {
      state.destinationLabel = destinationButton.childNodes[0]?.textContent.trim() || destinationButton.textContent.trim();
      $$("[data-destination]", bar).forEach(item => item.classList.toggle("active", item === destinationButton));
    }

    const durationButton = $$("[data-duration]", bar).find(button => button.dataset.duration === state.duration);
    if (durationButton) {
      $$("[data-duration]", bar).forEach(item => item.classList.toggle("active", item === durationButton));
    }
  };

  const searchUrl = () => {
    const params = new URLSearchParams();
    params.set("destination", state.destination);
    params.set("date", toDateKey(state.selectedDate));
    params.set("duration", state.duration);
    params.set("adults", String(state.adults));
    params.set("children", String(state.children));
    if (bar.dataset.roomId) params.set("room", bar.dataset.roomId);
    return `rooms.html?${params.toString()}`;
  };

  const closePanels = () => {
    $$(".booking-field", bar).forEach(field => {
      field.classList.remove("open");
      $(".booking-trigger", field)?.setAttribute("aria-expanded", "false");
    });
  };

  const openPanel = (field) => {
    closePanels();
    field.classList.add("open");
    $(".booking-trigger", field)?.setAttribute("aria-expanded", "true");
  };

  const guestText = () => {
    const parts = [`${state.adults} người lớn`];
    if (state.children > 0) parts.push(`${state.children} trẻ em`);
    return parts.join(", ");
  };

  const updateGuestControls = () => {
    const total = state.adults + state.children;
    $("#adultCount") && ($("#adultCount").textContent = state.adults);
    $("#childCount") && ($("#childCount").textContent = state.children);
    $("#bookingGuestText") && ($("#bookingGuestText").textContent = guestText());

    $$("[data-counter]", bar).forEach(button => {
      const counter = button.dataset.counter;
      const step = Number(button.dataset.step || 0);
      const isMinus = step < 0;
      const isPlus = step > 0;
      const atMin = counter === "adults" ? state.adults <= 1 : state.children <= 0;
      const atMax = total >= maxGuests;
      button.disabled = (isMinus && atMin) || (isPlus && atMax);
    });
  };

  const updateSummary = () => {
    $("#bookingDestinationText") && ($("#bookingDestinationText").textContent = state.destinationLabel);
    $("#bookingDurationText") && ($("#bookingDurationText").textContent = state.durationLabel);
    $("#bookingDateText") && ($("#bookingDateText").textContent = formatDate(state.selectedDate));

    const checkoutText = $("#bookingCheckoutText");
    if (checkoutText) {
      checkoutText.textContent = state.duration === "Ngày"
        ? `Trả phòng dự kiến ${formatDate(addDays(state.selectedDate, 1))}.`
        : `Trả phòng sau gói ${state.durationLabel.toLowerCase()}.`;
    }

    updateGuestControls();
  };

  const renderCalendar = () => {
    const selectedKey = toDateKey(state.selectedDate);
    const todayKey = toDateKey(today);

    calendar.innerHTML = [0, 1].map(offset => {
      const monthDate = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + offset, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const leadingBlanks = (monthDate.getDay() + 6) % 7;

      const blanks = Array.from({ length: leadingBlanks }, () => `<span class="calendar-day is-blank"></span>`);
      const days = Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const date = new Date(year, month, day);
        const key = toDateKey(date);
        const isPast = date < today;
        const classes = [
          "calendar-day",
          key === todayKey ? "is-today" : "",
          key === selectedKey ? "is-selected" : "",
          isPast ? "is-disabled" : ""
        ].filter(Boolean).join(" ");

        return `<button class="${classes}" type="button" data-date="${key}" ${isPast ? "disabled" : ""}>${String(day).padStart(2, "0")}</button>`;
      });

      return `
        <section class="calendar-month" aria-label="${monthNames[month]} ${year}">
          <h4>${monthNames[month]} ${year}</h4>
          <div class="calendar-weekdays" aria-hidden="true">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>
          <div class="calendar-grid">${[...blanks, ...days].join("")}</div>
        </section>
      `;
    }).join("");

    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const prev = $("#calendarPrev");
    if (prev) prev.disabled = state.calendarMonth <= minMonth;
  };

  $$(".booking-field", bar).forEach(field => {
    const trigger = $(".booking-trigger", field);
    if (!trigger) return;

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      field.classList.contains("open") ? closePanels() : openPanel(field);
    });
  });

  $$("[data-destination]", bar).forEach(button => {
    button.addEventListener("click", () => {
      const value = button.dataset.destination;
      state.destination = value;
      state.destinationLabel = button.childNodes[0]?.textContent.trim() || button.textContent.trim();
      $$("[data-destination]", bar).forEach(item => item.classList.toggle("active", item === button));
      updateSummary();
      closePanels();
    });
  });

  $$("[data-duration]", bar).forEach(button => {
    button.addEventListener("click", () => {
      state.duration = button.dataset.duration;
      state.durationLabel = durationLabels[state.duration] || state.duration;
      $$("[data-duration]", bar).forEach(item => item.classList.toggle("active", item === button));
      updateSummary();
      closePanels();
    });
  });

  $$("[data-counter]", bar).forEach(button => {
    button.addEventListener("click", () => {
      const counter = button.dataset.counter;
      const step = Number(button.dataset.step || 0);
      const total = state.adults + state.children;

      if (step > 0 && total >= maxGuests) {
        const note = $("#bookingResultNote");
        if (note) note.textContent = "Unite đang giới hạn tối đa 2 khách/phòng. Nếu cần trường hợp đặc biệt, admin sẽ xác nhận riêng.";
        return;
      }

      if (counter === "adults") {
        state.adults = Math.min(maxGuests, Math.max(1, state.adults + step));
      } else {
        state.children = Math.min(maxGuests - state.adults, Math.max(0, state.children + step));
      }

      updateGuestControls();
    });
  });

  calendar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-date]");
    if (!button || button.disabled) return;
    state.selectedDate = fromDateKey(button.dataset.date);
    updateSummary();
    renderCalendar();
    closePanels();
  });

  $("#calendarPrev")?.addEventListener("click", () => {
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const previous = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() - 1, 1);
    if (previous < minMonth) return;
    state.calendarMonth = previous;
    renderCalendar();
  });

  $("#calendarNext")?.addEventListener("click", () => {
    state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  $("#bookingSearchBtn")?.addEventListener("click", () => {
    const note = $("#bookingResultNote");
    if (note) {
      const place = state.destination === "all" ? "tất cả địa điểm" : state.destinationLabel;
      note.textContent = `Đang mở danh sách phòng phù hợp cho ${place}, nhận ${formatDate(state.selectedDate)}, gói ${state.durationLabel.toLowerCase()}, ${guestText().toLowerCase()}.`;
    }

    closePanels();
    window.location.href = searchUrl();
  });

  document.addEventListener("click", (event) => {
    if (!bar.contains(event.target)) closePanels();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanels();
  });

  syncActiveOptions();
  updateSummary();
  renderCalendar();
};

const initSmartBookingDock = () => {
  document.body.classList.add("has-smart-booking");
  if ($("#smartBookingDock")) return;

  const params = new URLSearchParams(window.location.search);
  const stored = readStoredSmartBooking();
  const todayKey = toDateInputValue();
  const currentRoom = params.get("id")
    ? rooms.find(room => room.id === params.get("id"))
    : null;

  const destinationOptions = [
    { value: "all", label: "Tất cả địa điểm" },
    ...[...new Set(rooms.map(room => room.location))].map(location => ({ value: location, label: location }))
  ];

  const initial = {
    destination: params.get("destination") || currentRoom?.location || stored.destination || "all",
    date: params.get("date") || stored.date || todayKey,
    duration: params.get("duration") || stored.duration || "3 tiếng",
    adults: Math.min(2, Math.max(1, Number(params.get("adults") || stored.adults || 2))),
    children: Math.min(1, Math.max(0, Number(params.get("children") || stored.children || 0))),
    room: params.get("room") || currentRoom?.id || ""
  };

  if (initial.adults + initial.children > 2) {
    initial.children = Math.max(0, 2 - initial.adults);
  }

  document.body.insertAdjacentHTML("beforeend", `
    <div class="smart-booking-backdrop" id="smartBookingBackdrop" aria-hidden="true"></div>
    <aside class="smart-booking-dock" id="smartBookingDock" aria-label="Đặt phòng nhanh">
      <button class="smart-booking-pill" type="button" id="smartBookingToggle" aria-expanded="false">
        <span>
          <small>Đặt phòng nhanh</small>
          <strong id="smartBookingSummary">Chọn lịch stay</strong>
        </span>
        <b>Mở</b>
      </button>

      <form class="smart-booking-sheet" id="smartBookingSheet" aria-hidden="true">
        <div class="smart-sheet-handle" aria-hidden="true"></div>
        <div class="smart-sheet-head">
          <div>
            <span>Unite Staycation</span>
            <strong>Chọn nhanh lịch và xem phòng phù hợp</strong>
          </div>
          <button type="button" id="smartBookingClose" aria-label="Thu gọn đặt phòng">×</button>
        </div>

        <div class="smart-booking-grid">
          <label>
            <span>Địa điểm</span>
            <select id="smartDestination">
              ${destinationOptions.map(option => `<option value="${option.value}">${option.label}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>Ngày nhận</span>
            <input id="smartDate" type="date" min="${todayKey}">
          </label>
          <label>
            <span>Thời lượng</span>
            <select id="smartDuration">
              <option value="3 tiếng">3 giờ</option>
              <option value="4 tiếng">4 giờ</option>
              <option value="8 tiếng">8 giờ</option>
              <option value="Ngày">Theo ngày</option>
            </select>
          </label>
          <label>
            <span>Người lớn</span>
            <select id="smartAdults">
              <option value="1">1 người lớn</option>
              <option value="2">2 người lớn</option>
            </select>
          </label>
          <label>
            <span>Trẻ em</span>
            <select id="smartChildren">
              <option value="0">Không có</option>
              <option value="1">1 trẻ em</option>
            </select>
          </label>
        </div>

        <p id="smartBookingHint">Tối đa 2 khách/phòng. Admin sẽ xác nhận lại lịch trống và giá cuối.</p>
        <button class="btn primary smart-booking-submit" type="submit">Xem phòng phù hợp</button>
      </form>
    </aside>
  `);

  const dock = $("#smartBookingDock");
  const backdrop = $("#smartBookingBackdrop");
  const toggle = $("#smartBookingToggle");
  const sheet = $("#smartBookingSheet");
  const closeButton = $("#smartBookingClose");
  const summary = $("#smartBookingSummary");
  const destination = $("#smartDestination");
  const date = $("#smartDate");
  const duration = $("#smartDuration");
  const adults = $("#smartAdults");
  const children = $("#smartChildren");

  const durationLabel = (value) => ({
    "3 tiếng": "3 giờ",
    "4 tiếng": "4 giờ",
    "8 tiếng": "8 giờ",
    "Ngày": "Theo ngày"
  })[value] || value;

  const formatShortDate = (key) => {
    const [year, month, day] = key.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) return "Hôm nay";
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(parsed);
  };

  const positionSheet = () => {
    const rect = dock.getBoundingClientRect();
    sheet.style.position = "fixed";
    sheet.style.left = `${Math.round(rect.left)}px`;
    sheet.style.right = "auto";
    sheet.style.width = `${Math.round(rect.width)}px`;
    sheet.style.bottom = "calc(12px + env(safe-area-inset-bottom))";
  };

  const resetSheetPosition = () => {
    sheet.style.removeProperty("position");
    sheet.style.removeProperty("left");
    sheet.style.removeProperty("right");
    sheet.style.removeProperty("width");
    sheet.style.removeProperty("bottom");
  };

  const setOpen = (open) => {
    dock.classList.toggle("open", open);
    sheet.classList.toggle("is-open", open);
    if (open) {
      positionSheet();
      sheet.style.setProperty("opacity", "1", "important");
      sheet.style.setProperty("transform", "translateY(0)", "important");
    } else {
      resetSheetPosition();
      sheet.style.setProperty("opacity", "0", "important");
      sheet.style.setProperty("transform", "translateY(calc(100% + 18px))", "important");
    }
    backdrop.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    sheet.setAttribute("aria-hidden", String(!open));
  };

  const getState = () => {
    const state = {
      destination: destination.value,
      date: date.value || todayKey,
      duration: duration.value,
      adults: Number(adults.value || 1),
      children: Number(children.value || 0),
      room: initial.room
    };

    if (state.adults + state.children > 2) {
      state.children = Math.max(0, 2 - state.adults);
      children.value = String(state.children);
    }

    return state;
  };

  const sync = () => {
    const state = getState();
    const childText = state.children > 0 ? `, ${state.children} trẻ em` : "";
    const place = state.destination === "all" ? "Tất cả địa điểm" : state.destination.replace("76/39 ", "").replace("29 ", "");
    summary.textContent = `${place} · ${formatShortDate(state.date)} · ${durationLabel(state.duration)} · ${state.adults} NL${childText}`;
    children.disabled = state.adults >= 2;
    writeStoredSmartBooking(state);
  };

  destination.value = destinationOptions.some(option => option.value === initial.destination) ? initial.destination : "all";
  date.value = initial.date < todayKey ? todayKey : initial.date;
  duration.value = initial.duration;
  adults.value = String(initial.adults);
  children.value = String(initial.children);
  sync();

  [destination, date, duration, adults, children].forEach(control => {
    control.addEventListener("change", sync);
    control.addEventListener("input", sync);
  });

  toggle.addEventListener("click", () => setOpen(!dock.classList.contains("open")));
  closeButton.addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (dock.classList.contains("open")) positionSheet();
  });

  sheet.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = getState();
    writeStoredSmartBooking(state);
    const search = new URLSearchParams();
    search.set("destination", state.destination);
    search.set("date", state.date);
    search.set("duration", state.duration);
    search.set("adults", String(state.adults));
    search.set("children", String(state.children));
    if (state.room) search.set("room", state.room);
    window.location.href = `rooms.html?${search.toString()}`;
  });
};

const getRoomsSearchState = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    destination: params.get("destination") || "all",
    date: params.get("date") || "",
    duration: params.get("duration") || "3 tiếng",
    adults: Number(params.get("adults") || 2),
    children: Number(params.get("children") || 0),
    room: params.get("room") || "",
    sort: $("#roomsSort")?.value || "recommended",
    filters: $$("[data-result-filter]:checked").map(input => input.dataset.resultFilter)
  };
};

const formatSearchDate = (key) => {
  if (!key) return "hôm nay";
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return "hôm nay";
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

const roomResultCardHTML = (room, state, index = 0) => {
  const admin = getRoomAdmin(room);
  const price = getPrice(room, state.duration);
  const isFocused = state.room === room.id;
  const status = statusLabels[admin.status] || "Đang mở";

  return `
    <article class="room-result-card reveal-up ${isFocused ? "is-focused" : ""}" style="--delay:${index * 35}ms">
      <a class="result-photo" href="room.html?id=${room.id}">
        ${imgTag(getMainImage(room), room.name)}
        <span>${isFocused ? "Bạn vừa chọn" : room.priceTier}</span>
      </a>

      <div class="result-copy">
        <span class="result-brand">Unite Staycation</span>
        <h2>${room.name}</h2>
        <p>${room.description}</p>
        <div class="result-address">
          <span>⌖</span>
          <small>${room.address}</small>
        </div>
        ${amenityBadgesHTML(room, 5)}
        <div class="result-tags">
          ${room.tags.slice(0, 4).map(tag => `<span>${tag}</span>`).join("")}
          <span>${admin.category}</span>
          <span>${admin.inventory} phòng · ${status}</span>
        </div>
      </div>

      <aside class="result-price">
        <small>Chỉ từ</small>
        <strong>${price}</strong>
        <span>/ ${state.duration}</span>
        <em>Giá tham khảo, admin xác nhận lại theo lịch trống.</em>
        <a class="btn primary small" href="room.html?id=${room.id}">Chọn phòng</a>
      </aside>
    </article>
  `;
};

const renderRoomsResults = () => {
  const list = $("#roomsResultList");
  if (!list) return;

  const state = getRoomsSearchState();
  const note = $("#bookingResultNote");
  const queryText = $("#roomsResultQuery");
  const countText = $("#roomsResultCount");
  const amenitySummary = $("#resultsAmenitySummary");

  let result = rooms.filter(room => {
    const admin = getRoomAdmin(room);
    if (admin.status === "maintenance") return false;
    if (state.destination !== "all" && room.location !== state.destination && !room.filters.includes(state.destination)) return false;
    if (state.filters.includes("bathtub") && !room.filters.includes("bathtub")) return false;
    if (state.filters.includes("signature") && !room.filters.includes("signature")) return false;
    if (state.filters.includes("budget") && !room.filters.includes("budget")) return false;
    if (state.filters.includes("available") && admin.status !== "available") return false;
    return true;
  });

  result.sort((a, b) => {
    if (state.room) {
      if (a.id === state.room) return -1;
      if (b.id === state.room) return 1;
    }
    if (state.sort === "price-asc") return numericPrice(a, state.duration) - numericPrice(b, state.duration);
    if (state.sort === "price-desc") return numericPrice(b, state.duration) - numericPrice(a, state.duration);
    return 0;
  });

  const place = state.destination === "all" ? "tất cả địa điểm" : state.destination;
  const guestCount = state.children > 0
    ? `${state.adults} người lớn, ${state.children} trẻ em`
    : `${state.adults} người lớn`;
  const summary = `${result.length} layout phù hợp cho ${place}, nhận ${formatSearchDate(state.date)}, gói ${state.duration}, ${guestCount}.`;

  if (queryText) queryText.textContent = state.room ? `${summary} Phòng bạn vừa chọn được ưu tiên hiển thị đầu danh sách.` : summary;
  if (countText) countText.textContent = `${result.length} lựa chọn`;
  if (note) note.textContent = summary;

  if (amenitySummary) {
    const keys = [...new Set(result.flatMap(room => getRoomAmenities(room).map(item => item.key)))].slice(0, 8);
    amenitySummary.innerHTML = keys.map(key => {
      const item = amenityCatalog[key] || { label: key, icon: "spark" };
      return `<span>${amenityIcon(item.icon)} ${item.label}</span>`;
    }).join("");
  }

  list.innerHTML = result.length
    ? result.map((room, index) => roomResultCardHTML(room, state, index)).join("")
    : `
      <div class="empty-state">
        <h3>Chưa có phòng phù hợp</h3>
        <p>Thử đổi địa điểm, bỏ bớt tiện ích hoặc chọn gói lưu trú khác để xem thêm lựa chọn.</p>
      </div>
    `;

  initReveal();
};

const initRoomsResultsPage = () => {
  if (!$("#roomsResultList")) return;
  renderRoomsResults();
  $("#roomsSort")?.addEventListener("change", renderRoomsResults);
  $$("[data-result-filter]").forEach(input => input.addEventListener("change", renderRoomsResults));
};

const adminRoomRowHTML = (room) => {
  const admin = getRoomAdmin(room);
  const amenities = Object.entries(amenityCatalog).map(([key, item]) => `
    <label class="admin-amenity-toggle">
      <input type="checkbox" data-room-id="${room.id}" data-admin-field="amenity" data-amenity="${key}" ${admin.amenities.includes(key) ? "checked" : ""}>
      <span>${amenityIcon(item.icon)} ${item.label}</span>
    </label>
  `).join("");

  return `
    <article class="admin-room-row" data-room-id="${room.id}">
      <img src="${getMainImage(room)}" alt="${room.name}" loading="lazy">
      <div class="admin-room-main">
        <span>${room.id} · ${room.location}</span>
        <h3>${room.name}</h3>
        <div class="admin-room-controls">
          <label>Số lượng
            <input type="number" min="0" max="12" value="${admin.inventory}" data-room-id="${room.id}" data-admin-field="inventory">
          </label>
          <label>Trạng thái
            <select data-room-id="${room.id}" data-admin-field="status">
              ${Object.entries(statusLabels).map(([key, label]) => `<option value="${key}" ${admin.status === key ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
          <label>Dạng phòng
            <input type="text" value="${admin.category}" data-room-id="${room.id}" data-admin-field="category">
          </label>
        </div>
        <div class="admin-amenity-list">${amenities}</div>
      </div>
    </article>
  `;
};

const renderAdminTools = () => {
  const manager = $("#adminRoomManager");
  if (!manager) return;

  const metrics = $("#adminMetrics");
  const totalInventory = rooms.reduce((sum, room) => sum + getRoomAdmin(room).inventory, 0);
  const activeRooms = rooms.filter(room => getRoomAdmin(room).status !== "maintenance").length;
  const lockedRooms = rooms.length - activeRooms;
  const locationCount = new Set(rooms.map(room => room.location)).size;

  if (metrics) {
    metrics.innerHTML = `
      <div><strong>${rooms.length}</strong><span>layout</span></div>
      <div><strong>${totalInventory}</strong><span>phòng đang quản lý</span></div>
      <div><strong>${activeRooms}</strong><span>layout đang mở</span></div>
      <div><strong>${locationCount}</strong><span>địa điểm</span></div>
      <div><strong>${lockedRooms}</strong><span>layout tạm khóa</span></div>
    `;
  }

  manager.innerHTML = rooms.map(adminRoomRowHTML).join("");

  const catalog = $("#adminAmenityCatalog");
  if (catalog) {
    catalog.innerHTML = Object.values(amenityCatalog).map(item => `
      <span>${amenityIcon(item.icon)} ${item.label}</span>
    `).join("");
  }
};

const initAdminTools = () => {
  const manager = $("#adminRoomManager");
  if (!manager || typeof rooms === "undefined") return;

  const bookingMount = $("#adminBookingMount");
  if (bookingMount && !$("#homeBookingBar")) {
    bookingMount.innerHTML = bookingWidgetHTML({
      className: "admin-booking-bar reveal-up",
      buttonText: "Tìm phòng",
      note: "Preview nhanh luồng khách: chọn tiêu chí rồi mở trang lựa phòng."
    });
    initHomeBookingWidget();
  }

  renderAdminTools();

  const saveAdminControl = (event) => {
    const control = event.target.closest("[data-room-id][data-admin-field]");
    if (!control) return;

    const room = rooms.find(item => item.id === control.dataset.roomId);
    if (!room) return;

    const data = readAdminOverrides();
    const current = { ...getRoomAdmin(room) };
    const field = control.dataset.adminField;
    if (event.type === "input" && field !== "inventory") return;

    if (field === "inventory") current.inventory = Math.max(0, Number(control.value || 0));
    if (field === "status") current.status = control.value;
    if (field === "category") current.category = control.value.trim() || defaultRoomAdmin(room).category;
    if (field === "amenity") {
      const key = control.dataset.amenity;
      current.amenities = control.checked
        ? [...new Set([...current.amenities, key])]
        : current.amenities.filter(item => item !== key);
    }

    data[room.id] = current;
    writeAdminOverrides(data);
    renderAdminTools();

    const saved = $("#adminSaveState");
    if (saved) {
      saved.textContent = `Đã lưu thay đổi cho ${room.id}. Trang chính, chọn phòng và chi tiết sẽ đọc dữ liệu này.`;
    }
  };

  manager.addEventListener("input", saveAdminControl);
  manager.addEventListener("change", saveAdminControl);

  $("#adminResetOverrides")?.addEventListener("click", () => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch {
      // Nothing else to reset when browser storage is blocked.
    }
    renderAdminTools();
    const saved = $("#adminSaveState");
    if (saved) saved.textContent = "Đã đưa dữ liệu quản trị về mặc định trong rooms.js.";
  });
};

const bindFilters = () => {
  const buttons = $$(".filter-btn");
  if (!buttons.length) return;

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(item => item.classList.remove("active"));
      button.classList.add("active");

      const filter = button.dataset.filter;
      const filteredRooms = filter === "all"
        ? rooms
        : rooms.filter(room => room.filters.includes(filter));

      renderPriceCompare(filteredRooms);
    });
  });
};

const bindCopyButtons = () => {
  $$("[data-copy]").forEach(button => {
    button.addEventListener("click", async () => {
      const id = button.dataset.copy;
      try {
        await navigator.clipboard.writeText(id);
        const oldText = button.textContent;
        button.textContent = "Đã copy";
        setTimeout(() => button.textContent = oldText, 1200);
      } catch {
        alert(`Mã phòng: ${id}`);
      }
    });
  });
};

const renderReel = () => {
  const track = $("#reelTrack");
  const windowEl = $("#reelWindow");
  if (!track || !windowEl) return;

  const itemHTML = (room) => `
    <a class="reel-card" href="room.html?id=${room.id}" data-room="${room.id}">
      ${imgTag(getMainImage(room), room.name)}
      <div class="reel-overlay"></div>
      <div class="reel-content">
        <span>${room.chapter} · ${room.location}</span>
        <h3>${room.name}</h3>
        <p>${room.shortLine}</p>
        <strong>${getPrice(room, "3 tiếng")} / 3 tiếng</strong>
      </div>
    </a>
  `;

  const loop = [...rooms, ...rooms, ...rooms, ...rooms];
  track.innerHTML = loop.map(itemHTML).join("");

  let raf = null;
  let isDown = false;
  let startX = 0;
  let startY = 0;
  let scrollLeft = 0;
  let isHovered = false;
  let moved = false;
  let gestureMode = null; // null | "horizontal" | "vertical"
  let lastTime = performance.now();
  let resumeTimer = null;

  const getOneSetWidth = () => track.scrollWidth / 4;

  const normalizeScroll = () => {
    const oneSetWidth = getOneSetWidth();
    if (oneSetWidth <= 0) return;
    if (windowEl.scrollLeft >= oneSetWidth * 2.5) windowEl.scrollLeft -= oneSetWidth;
    if (windowEl.scrollLeft <= oneSetWidth * 0.25) windowEl.scrollLeft += oneSetWidth;
  };

  const temporarilyPause = (ms = 900) => {
    isHovered = true;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => { isHovered = false; }, ms);
  };

  const loopScroll = (now = performance.now()) => {
    const dt = Math.min(40, now - lastTime);
    lastTime = now;
    normalizeScroll();

    const speed = window.innerWidth < 760 ? 34 : 42;
    if (!isDown && !isHovered && document.visibilityState === "visible") {
      windowEl.scrollLeft += (speed * dt) / 1000;
    }

    raf = requestAnimationFrame(loopScroll);
  };

  const initPosition = () => {
    const oneSetWidth = getOneSetWidth();
    if (oneSetWidth > 0) windowEl.scrollLeft = oneSetWidth;
    lastTime = performance.now();
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loopScroll);
  };

  requestAnimationFrame(() => setTimeout(initPosition, 220));
  window.addEventListener("resize", () => setTimeout(initPosition, 180));

  const startDrag = (clientX, clientY = 0) => {
    isDown = true;
    moved = false;
    gestureMode = null;
    startX = clientX;
    startY = clientY;
    scrollLeft = windowEl.scrollLeft;
    windowEl.classList.add("cursor-grabbing");
  };

  const moveDrag = (clientX, clientY = 0, event) => {
    if (!isDown) return;

    const dx = clientX - startX;
    const dy = clientY - startY;

    if (event?.type === "touchmove" && gestureMode === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      gestureMode = Math.abs(dx) > Math.abs(dy) * 1.18 ? "horizontal" : "vertical";
      if (gestureMode === "vertical") {
        isDown = false;
        windowEl.classList.remove("cursor-grabbing");
        return;
      }
    }

    if (event?.type === "touchmove" && gestureMode !== "horizontal") return;

    if (Math.abs(dx) > 5) moved = true;
    windowEl.scrollLeft = scrollLeft - dx * 1.12;
    normalizeScroll();
    if (event?.cancelable) event.preventDefault();
  };

  const endDrag = () => {
    if (isDown || gestureMode === "horizontal") temporarilyPause(650);
    isDown = false;
    gestureMode = null;
    windowEl.classList.remove("cursor-grabbing");
  };

  if (window.matchMedia("(hover: hover)").matches) {
    windowEl.addEventListener("mouseenter", () => isHovered = true);
    windowEl.addEventListener("mouseleave", () => { isHovered = false; endDrag(); });
  }

  windowEl.addEventListener("mousedown", e => startDrag(e.pageX, e.pageY));
  window.addEventListener("mousemove", e => moveDrag(e.pageX, e.pageY, e));
  window.addEventListener("mouseup", endDrag);

  windowEl.addEventListener("touchstart", e => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  }, { passive: true });

  windowEl.addEventListener("touchmove", e => {
    const touch = e.touches[0];
    moveDrag(touch.clientX, touch.clientY, e);
  }, { passive: false });

  window.addEventListener("touchend", endDrag, { passive: true });
  window.addEventListener("touchcancel", endDrag, { passive: true });

  windowEl.addEventListener("click", e => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  const scrollAmount = () => {
    const firstCard = $(".reel-card", track);
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : Math.min(520, window.innerWidth * 0.82);
    return Math.round(cardWidth + 28);
  };

  $("#reelPrev")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    temporarilyPause(900);
    windowEl.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
  });

  $("#reelNext")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    temporarilyPause(900);
    windowEl.scrollBy({ left: scrollAmount(), behavior: "smooth" });
  });

  window.addEventListener("beforeunload", () => {
    if (raf) cancelAnimationFrame(raf);
    window.clearTimeout(resumeTimer);
  });
};

const renderRules = () => {
  const list = $("#rulesList");
  if (!list) return;

  list.innerHTML = houseRules.map((rule, index) => `
    <article class="rules-item" style="--delay:${index * 45}ms">
      <div class="rules-number">${String(index + 1).padStart(2, "0")}</div>
      <div class="rules-icon">${rule.icon}</div>
      <p>${rule.text}</p>
    </article>
  `).join("");
};

const renderRoomDetail = () => {
  const container = $("#roomDetail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || rooms[0]?.id;
  const room = rooms.find(item => item.id === id);

  if (!room) {
    container.innerHTML = `
      <section class="detail-shell not-found">
        <h1>Không tìm thấy phòng</h1>
        <p>Mã phòng chưa có trong rooms.js.</p>
        <a class="btn primary" href="index.html">Quay về trang chính</a>
      </section>
    `;
    return;
  }

  document.title = `${room.name} | Unite Staycation`;
  const detail = roomDetailContent(room);
  const relatedRooms = rooms.filter(item => item.id !== room.id).slice(0, 3);

  container.innerHTML = `
    <nav class="detail-subnav" aria-label="Điều hướng chi tiết phòng">
      <a href="#overviewPanel">Tổng quan</a>
      <a href="#bookingPanel">Gói lưu trú</a>
      <a href="#galleryPanel">Hình ảnh</a>
      <a href="#guidePanel">Hướng dẫn</a>
      <a href="#faqPanel">FAQ</a>
    </nav>

    <section class="detail-top">
      <div class="detail-cover reveal-up">
        ${imgTag(getMainImage(room), room.name)}
        <span class="room-id large">${room.id}</span>
      </div>

      <div id="overviewPanel" class="detail-info reveal-up">
        <p class="eyebrow">${room.chapter} · ${room.type} · ${room.location}</p>
        <h1>${room.name}</h1>
        <div class="review-strip" aria-label="Đánh giá phòng">
          <span class="review-source">UNITE PICK</span>
          <strong>${detail.score}<small>/5</small></strong>
          <span>${detail.verdict}</span>
          <a href="#reviewPanel">${detail.reviews}</a>
        </div>
        <p class="detail-desc">${room.description}</p>
        <div class="tag-list">${tagsHTML(room.tags)}</div>

        <div class="detail-price-compact">
          ${compactPricesHTML(room)}
        </div>

        <div class="detail-facts">
          ${detail.facts.map(item => `
            <span><small>${item.label}</small><strong>${item.value}</strong></span>
          `).join("")}
        </div>

        <div class="address-box">
          <span>Địa chỉ</span>
          <strong>${room.address}</strong>
          <small>Admin sẽ gửi hướng dẫn check-in chi tiết sau khi xác nhận lịch.</small>
        </div>

        <div class="detail-actions">
          <a class="btn primary magnetic" href="#bookingPanel">Chọn gói lưu trú</a>
          <a class="btn ghost magnetic" href="#galleryPanel">Xem hình phòng</a>
        </div>
      </div>
    </section>

    <section id="galleryPanel" class="detail-body">
      <div class="gallery-panel reveal-up">
        <div class="gallery-heading">
          <div>
            <p class="section-kicker">Gallery</p>
            <h2>Room mood</h2>
          </div>
          <span>${room.images.length} images</span>
        </div>

        <div class="gallery-grid">
          ${room.images.map((src, index) => `
            <button class="gallery-item" type="button" data-preview="${src}">
              ${imgTag(src, `${room.name} ${index + 1}`)}
            </button>
          `).join("")}
        </div>
      </div>

      <aside class="detail-note reveal-up">
        <p class="section-kicker">Stay note</p>
        <h2>${room.vibe}</h2>
        <p>${room.description}</p>
        <p class="price-note">Có các gói linh hoạt theo từng khung giờ. Vui lòng xác nhận tình trạng phòng trước khi đặt.</p>
      </aside>
    </section>

    ${bookingWidgetHTML({
      className: "detail-booking-bar reveal-up",
      buttonText: "Đặt phòng",
      note: `Đang xem ${room.id}. Chọn ngày, gói và khách để mở danh sách phòng phù hợp.`,
      room
    })}

    <section class="detail-story-grid">
      <article class="detail-story reveal-up">
        <p class="section-kicker">Stay story</p>
        <h2>Khách cần biết gì trước khi đặt?</h2>
        ${detail.intro.map(text => `<p>${text}</p>`).join("")}
      </article>

      <aside class="fit-panel reveal-up">
        <p class="section-kicker">Phù hợp cho</p>
        <div class="fit-list">
          ${detail.goodFor.map(item => `<span>${item}</span>`).join("")}
        </div>
      </aside>
    </section>

    <section class="amenity-section reveal-up">
      <div class="section-line-heading">
        <p class="section-kicker">Tiện nghi chính</p>
        <h2>Những thứ khách thường hỏi trước khi đến.</h2>
      </div>
      <div class="amenity-grid">
        ${getRoomAmenities(room).map(item => `
          <article class="amenity-card">
            <span>${amenityIcon(item.icon)}</span>
            <h3>${item.label}</h3>
            <p>${detail.amenities.find(base => base.label.includes(item.label) || item.label.includes(base.label))?.desc || "Tiện ích được admin bật trong dữ liệu phòng và hiển thị đồng bộ trên các bề mặt web."}</p>
          </article>
        `).join("")}
      </div>
    </section>

    <section id="bookingPanel" class="booking-panel reveal-up">
      <div class="section-line-heading">
        <p class="section-kicker">Chọn gói của bạn</p>
        <h2>Gói linh hoạt theo lịch ở.</h2>
      </div>
      <div class="booking-package-grid">
        ${room.prices.map((item, index) => `
          <article class="package-card ${index === 0 ? "is-featured" : ""}">
            <span>${index === 0 ? "Phổ biến" : "Linh hoạt"}</span>
            <h3>${item.label}</h3>
            <strong>${item.value}</strong>
            <p>${index === 0 ? "Hợp cho một buổi nghỉ nhanh, xem phim hoặc đổi không gian." : "Phù hợp khi cần nhiều thời gian hơn để nghỉ, làm việc nhẹ hoặc chụp hình."}</p>
            <a class="btn soft small" href="index.html#contact">Nhắn đặt ${room.id}</a>
          </article>
        `).join("")}
      </div>
      <p class="booking-note">Giá hiển thị là giá tham khảo. Admin sẽ xác nhận lại theo ngày, khung giờ và tình trạng phòng thực tế.</p>
    </section>

    <section id="guidePanel" class="guide-section reveal-up">
      <div class="section-line-heading">
        <p class="section-kicker">Trước khi đến</p>
        <h2>Luồng đặt phòng rõ ràng để khách không bị lạc.</h2>
      </div>
      <div class="guide-grid">
        ${detail.steps.map((step, index) => `
          <article class="guide-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${step.title}</h3>
            <p>${step.desc}</p>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="nearby-section reveal-up">
      <div class="section-line-heading">
        <p class="section-kicker">Xung quanh stay</p>
        <h2>Gợi ý nhỏ để khách dễ hình dung vị trí.</h2>
      </div>
      <div class="nearby-grid">
        ${detail.nearby.map(item => `
          <article class="nearby-card">
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
          </article>
        `).join("")}
      </div>
    </section>

    <section id="reviewPanel" class="review-panel reveal-up">
      <div>
        <p class="section-kicker">Guest mood</p>
        <h2>${detail.score}<small>/5</small></h2>
        <strong>${detail.verdict}</strong>
      </div>
      <p>Khách thường thích sự riêng tư, ảnh phòng rõ, giá theo khung giờ dễ hiểu và admin xác nhận nhanh trước khi đến. Điểm này là nội dung mô phỏng để tăng độ dễ hiểu cho trang chi tiết.</p>
    </section>

    <section id="faqPanel" class="faq-section reveal-up">
      <div class="section-line-heading">
        <p class="section-kicker">FAQ</p>
        <h2>Câu hỏi khách hay hỏi.</h2>
      </div>
      <div class="faq-list">
        ${detail.faqs.map(item => `
          <article>
            <h3>${item.q}</h3>
            <p>${item.a}</p>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="related-section reveal-up">
      <div class="section-line-heading">
        <p class="section-kicker">Gợi ý dành cho bạn</p>
        <h2>Những layout khác nên xem thêm.</h2>
      </div>
      <div class="related-grid">
        ${relatedRooms.map(item => `
          <a class="related-card" href="room.html?id=${item.id}">
            ${imgTag(getMainImage(item), item.name)}
            <span>${item.id}</span>
            <h3>${item.name}</h3>
            <p>${item.shortLine}</p>
          </a>
        `).join("")}
      </div>
    </section>

    <div class="floating-book">
      <span>${room.name}</span>
      <a class="btn primary small" href="#bookingPanel">Đặt phòng</a>
    </div>

    <div class="lightbox" id="lightbox" aria-hidden="true">
      <button class="lightbox-close" type="button" aria-label="Đóng">×</button>
      <img src="" alt="Xem ảnh lớn" />
    </div>
  `;

  initReveal();
  initMagneticButtons();
  bindLightbox();
};

const bindLightbox = () => {
  const lightbox = $("#lightbox");
  if (!lightbox) return;

  const lightboxImg = $("img", lightbox);
  const closeBtn = $(".lightbox-close", lightbox);

  $$("[data-preview]").forEach(button => {
    button.addEventListener("click", () => {
      lightboxImg.src = button.dataset.preview;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  const close = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
  };

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
  });
};

const init = () => {
  initLoader();
  initHeader();
  initLanguageSwitcher();
  initHeaderQuickContact();
  initReveal();
  initMagneticButtons();
  initSmartBookingDock();

  const page = document.body.dataset.page;

  if (page === "home") {
    renderHeroStack();
    renderReel();
    renderHomeRooms();
    renderPriceCompare(rooms);
    renderRules();
    bindFilters();
    initHomeBookingWidget();
    initReveal();
  }

  if (page === "rooms") {
    initHomeBookingWidget();
    initRoomsResultsPage();
    initReveal();
  }

  if (page === "room") {
    renderRoomDetail();
    initHomeBookingWidget();
  }

  if (page === "admin") {
    initAdminTools();
    initReveal();
  }
};

document.addEventListener("DOMContentLoaded", init);
