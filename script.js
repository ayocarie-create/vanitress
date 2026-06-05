// script.js
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => r.querySelectorAll(s);
  
  const header = $(".header");
  const navToggle = $(".nav-toggle");
  const nav = $(".nav");
  const navLinks = $$(".nav__link");
  const form = $("#contact-form");
  const yearEl = $("#year");
  
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Header on scroll ===== */
  const onScroll = () => header.classList.toggle("header--scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ===== Mobile nav ===== */
  const closeNav = () => {
    nav.classList.remove("nav--open");
    navToggle?.setAttribute("aria-expanded", "false");
  };
  navToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("nav--open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.forEach(l => l.addEventListener("click", closeNav));

  /* ===== Smooth anchor scroll ===== */
  const headerH = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 78;
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - headerH(), behavior: "smooth" });
    });
  });

  /* ===== Reveal on scroll ===== */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const parent = en.target.parentElement;
        const sibs = parent ? parent.querySelectorAll(".reveal") : [];
        let i = 0;
        sibs.forEach((s, j) => s === en.target && (i = j));
        en.target.style.transitionDelay = (i * 0.08) + "s";
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("is-visible"));
  }

  /* ===== Ripple on buttons ===== */
  $$(".btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const r = btn.getBoundingClientRect();
      const sz = Math.max(r.width, r.height);
      const x = (e.clientX ?? r.left + r.width / 2) - r.left - sz / 2;
      const y = (e.clientY ?? r.top + r.height / 2) - r.top - sz / 2;
      const rip = document.createElement("span");
      rip.className = "ripple";
      Object.assign(rip.style, { width: sz + "px", height: sz + "px", left: x + "px", top: y + "px" });
      btn.appendChild(rip);
      setTimeout(() => rip.remove(), 700);
    });
  });

  /* ===== Tilt / shine on glass cards ===== */
  $$(".service-card, .glass").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 100;
      const py = ((e.clientY - r.top) / r.height) * 100;
      card.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.35), transparent 40%), var(--color-surface, rgba(255,255,255,0.55))`;
    });
    card.addEventListener("mouseleave", () => (card.style.background = ""));
  });

  /* ===== Toast helper ===== */
  let toast;
  const flash = (text) => {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      const s = document.createElement("style");
      s.textContent = `.toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%) translateY(30px);padding:.875rem 1.5rem;background:rgba(26,22,20,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:14px;font-size:.875rem;z-index:200;opacity:0;transition:opacity .35s,transform .35s;box-shadow:0 12px 32px rgba(0,0,0,.3)}.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}`;
      document.head.appendChild(s);
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), 2400);
  };

  /* ===== Form submit ===== */
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = $("#name"), email = $("#email"), msg = $("#message");
      if (!name.value.trim() || !email.value.trim() || !msg.value.trim()) {
        flash("Пожалуйста, заполните все поля формы.");
        return;
      }
      if (!email.validity.valid) {
        flash("Пожалуйста, укажите корректный email.");
        return email.focus();
      }
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = "✓ Отправлено";
      btn.style.background = "linear-gradient(135deg, #7fbf8a, #4d9d62)";
      setTimeout(() => { btn.textContent = orig; btn.style.background = ""; }, 2200);
      form.reset();
    });
  }

  /* ===== Parallax hero orbs ===== */
  const orbs = $$(".hero__orb");
  orbs.length && window.addEventListener("mousemove", e => {
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    orbs.forEach((o, i) => (o.style.transform = `translate(${x * (i + 1) * 18}px, ${y * (i + 1) * 18}px)`));
  }, { passive: true });

  /* ===== Modals (Services & Portfolio) ===== */
  const serviceModal = $("#service-modal");
  const portfolioModal = $("#portfolio-modal");

  // --- Логика модального окна услуг ---
  if (serviceModal) {
    const sOverlay = serviceModal.querySelector(".modal__overlay");
    const sClose = serviceModal.querySelector(".modal__close");
    const sImage = serviceModal.querySelector(".modal__image");
    const sTitle = serviceModal.querySelector(".modal__title");
    const sText = serviceModal.querySelector(".modal__text");
    const sBookBtn = serviceModal.querySelector(".modal__book-btn");

    const openServiceModal = (card) => {
      const img = card.querySelector("img");
      const title = card.querySelector(".service-card__title")?.textContent || "";
      const text = card.querySelector(".service-card__text")?.textContent || "";
      
      sImage.src = img ? img.src : "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80";
      sImage.alt = title;
      sTitle.textContent = title;
      sText.textContent = text;
      
      serviceModal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    const closeServiceModal = () => {
      serviceModal.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    $$(".service-card").forEach(card => {
      card.addEventListener("click", () => openServiceModal(card));
    });

    sClose.addEventListener("click", closeServiceModal);
    sOverlay.addEventListener("click", closeServiceModal);

    if (sBookBtn) {
      sBookBtn.addEventListener("click", () => {
        closeServiceModal();
        const contacts = $("#contacts");
        if (contacts) {
          window.scrollTo({ top: contacts.getBoundingClientRect().top + window.pageYOffset - headerH(), behavior: "smooth" });
        }
      });
    }
  }

  // --- Логика модального окна портфолио (Lightbox) ---
  if (portfolioModal) {
    const pOverlay = portfolioModal.querySelector(".modal__overlay");
    const pClose = portfolioModal.querySelector(".modal__close");
    const pPrev = portfolioModal.querySelector(".modal__nav--prev");
    const pNext = portfolioModal.querySelector(".modal__nav--next");
    const pImage = portfolioModal.querySelector(".modal__image");
    const pCaption = portfolioModal.querySelector(".modal__caption");
    let currentIndex = 0;
    
    const portfolioData = Array.from($$(".portfolio__item")).map(item => ({
      src: item.querySelector("img")?.src || "",
      caption: item.querySelector(".portfolio__caption")?.textContent || ""
    }));

    const openPortfolioModal = (index) => {
      currentIndex = index;
      updatePortfolioModal();
      portfolioModal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    const updatePortfolioModal = () => {
      const data = portfolioData[currentIndex];
      pImage.src = data.src;
      pImage.alt = data.caption;
      pCaption.textContent = data.caption;
    };

    const closePortfolioModal = () => {
      portfolioModal.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    $$(".portfolio__item").forEach((item, index) => {
      item.addEventListener("click", () => openPortfolioModal(index));
    });

    pClose.addEventListener("click", closePortfolioModal);
    pOverlay.addEventListener("click", closePortfolioModal);

    pPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + portfolioData.length) % portfolioData.length;
      updatePortfolioModal();
    });

    pNext.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % portfolioData.length;
      updatePortfolioModal();
    });
  }

  // Закрытие любого открытого модального окна по клавише Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (serviceModal?.classList.contains("is-open")) {
        serviceModal.classList.remove("is-open");
        document.body.style.overflow = "";
      }
      if (portfolioModal?.classList.contains("is-open")) {
        portfolioModal.classList.remove("is-open");
        document.body.style.overflow = "";
      }
    }
  });
})();