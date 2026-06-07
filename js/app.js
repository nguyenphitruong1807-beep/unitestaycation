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
    onerror="this.closest('.image-wrap, .gallery-item, .hero-photo, .reel-card, .about-media, .detail-cover')?.classList.add('image-missing'); this.style.display='none';"
  />
`;

const tagsHTML = (tags) => tags.map(tag => `<span class="tag">${tag}</span>`).join("");

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
  const items = $$(".reveal-up, .room-card, .policy-grid article, .rules-item, .price-row");
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
      <div class="layout-meta">
        <span>Từ <strong>${getPrice(room, "3 tiếng")}</strong></span>
        <span>${room.priceTier}</span>
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

  let raf;
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let isHovered = false;
  let moved = false;

  const loopScroll = () => {
    const oneSetWidth = track.scrollWidth / 4;
    if (oneSetWidth > 0) {
      if (windowEl.scrollLeft >= oneSetWidth * 2.5) windowEl.scrollLeft -= oneSetWidth;
      if (windowEl.scrollLeft <= 0) windowEl.scrollLeft += oneSetWidth;
    }

    if (!isDown && !isHovered) windowEl.scrollLeft += window.innerWidth < 760 ? 0.35 : 0.65;
    raf = requestAnimationFrame(loopScroll);
  };

  setTimeout(() => {
    windowEl.scrollLeft = track.scrollWidth / 4;
    loopScroll();
  }, 180);

  const start = (clientX) => {
    isDown = true;
    moved = false;
    startX = clientX;
    scrollLeft = windowEl.scrollLeft;
    windowEl.classList.add("cursor-grabbing");
  };

  const move = (clientX, event) => {
    if (!isDown) return;
    const diff = clientX - startX;
    if (Math.abs(diff) > 5) moved = true;
    windowEl.scrollLeft = scrollLeft - diff * 1.18;
    if (event?.cancelable) event.preventDefault();
  };

  const end = () => {
    isDown = false;
    windowEl.classList.remove("cursor-grabbing");
  };

  windowEl.addEventListener("mouseenter", () => isHovered = true);
  windowEl.addEventListener("mouseleave", () => { isHovered = false; end(); });

  windowEl.addEventListener("mousedown", e => start(e.pageX));
  window.addEventListener("mousemove", e => move(e.pageX, e));
  window.addEventListener("mouseup", end);

  windowEl.addEventListener("touchstart", e => start(e.touches[0].pageX), { passive: true });
  windowEl.addEventListener("touchmove", e => move(e.touches[0].pageX, e), { passive: false });
  window.addEventListener("touchend", end);

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
    isHovered = true;
    windowEl.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    window.setTimeout(() => { isHovered = false; }, 900);
  });

  $("#reelNext")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    isHovered = true;
    windowEl.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    window.setTimeout(() => { isHovered = false; }, 900);
  });

  window.addEventListener("beforeunload", () => cancelAnimationFrame(raf));
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

  container.innerHTML = `
    <section class="detail-top">
      <div class="detail-cover reveal-up">
        ${imgTag(getMainImage(room), room.name)}
        <span class="room-id large">${room.id}</span>
      </div>

      <div class="detail-info reveal-up">
        <p class="eyebrow">${room.chapter} · ${room.type} · ${room.location}</p>
        <h1>${room.name}</h1>
        <p class="detail-desc">${room.description}</p>
        <div class="tag-list">${tagsHTML(room.tags)}</div>

        <div class="detail-price-compact">
          ${compactPricesHTML(room)}
        </div>

        <div class="address-box">
          <span>Địa chỉ</span>
          <strong>${room.address}</strong>
        </div>

        <div class="detail-actions">
          <a class="btn primary magnetic" href="#galleryPanel">Xem hình phòng</a>
          <a class="btn ghost magnetic" href="index.html#priceList">So sánh giá</a>
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

    <div class="floating-book">
      <span>${room.name}</span>
      <a class="btn primary small" href="#galleryPanel">Xem hình</a>
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
  initReveal();
  initMagneticButtons();

  const page = document.body.dataset.page;

  if (page === "home") {
    renderHeroStack();
    renderReel();
    renderHomeRooms();
    renderPriceCompare(rooms);
    renderRules();
    bindFilters();
    initReveal();
  }

  if (page === "room") {
    renderRoomDetail();
  }
};

document.addEventListener("DOMContentLoaded", init);
