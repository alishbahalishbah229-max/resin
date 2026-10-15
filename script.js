
/* =========================================
   NERA — INTERACTIONS & ANIMATIONS
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  // 1. Loading screen
  const loader = $("#loader");

  const hideLoader = () => {
    if (loader) loader.classList.add("is-hidden");
  };

  window.addEventListener("load", hideLoader, { once: true });
  setTimeout(hideLoader, 1800);

  // 2. Footer year
  $("#year").textContent = new Date().getFullYear();

  // 3. Floating particles
  const particleContainer = $("#particles");

  if (particleContainer) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 32; i++) {
      const particle = document.createElement("span");
      particle.className = "particle";

      particle.style.left = `${Math.random() * 100}%`;
      particle.style.setProperty(
        "--duration",
        `${8 + Math.random() * 13}s`
      );
      particle.style.setProperty(
        "--delay",
        `${-Math.random() * 18}s`
      );
      particle.style.setProperty(
        "--drift",
        `${Math.round(Math.random() * 100 - 50)}px`
      );

      const size = 1 + Math.random() * 3;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      fragment.appendChild(particle);
    }

    particleContainer.appendChild(fragment);
  }

  // 4. Navbar scroll effect
  const navbar = $("#navbar");
  const navLinks = $$(".nav-link");
  const sections = $$("main section[id]");

  function updateNavigation() {
    const scrollY = window.scrollY;

    navbar?.classList.toggle("scrolled", scrollY > 35);

    let currentSection = "home";

    sections.forEach((section) => {
      if (scrollY >= section.offsetTop - 180) {
        currentSection = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive =
        link.getAttribute("href") === `#${currentSection}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  let scrollScheduled = false;

  window.addEventListener(
    "scroll",
    () => {
      if (scrollScheduled) return;

      scrollScheduled = true;

      requestAnimationFrame(() => {
        updateNavigation();
        scrollScheduled = false;
      });
    },
    { passive: true }
  );

  updateNavigation();

  // 5. Mobile menu
  const menuToggle = $("#menuToggle");
  const navLinksContainer = $("#navLinks");

  function closeMenu() {
    navLinksContainer?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("menu-open");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen =
      menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation" : "Close navigation"
    );

    navLinksContainer?.classList.toggle("open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  $$("#navLinks a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeLightbox();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      navLinksContainer?.classList.contains("open") &&
      !navLinksContainer.contains(event.target) &&
      !menuToggle?.contains(event.target)
    ) {
      closeMenu();
    }
  });

  // 6. Scroll reveal animations
  const revealElements = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  // 7. Collection category filters
  const filterButtons = $$(".filter-button");
  const productCards = $$(".product-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        const active = item === button;

        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      productCards.forEach((card) => {
        const matches =
          filter === "all" || card.dataset.category === filter;

        card.classList.toggle("is-filtered", !matches);

        if (matches) {
          card.classList.remove("visible");
          requestAnimationFrame(() => {
            card.classList.add("visible");
          });
        }
      });
    });

    button.setAttribute(
      "aria-pressed",
      String(button.classList.contains("active"))
    );
  });

  // 8. Gallery lightbox
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxClose = $("#lightboxClose");
  let lastFocusedElement = null;

  function openLightbox(imageUrl, altText) {
    if (!lightbox || !lightboxImage) return;

    lastFocusedElement = document.activeElement;
    lightboxImage.src = imageUrl;
    lightboxImage.alt = altText || "Artwork preview";

    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightboxClose?.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;

    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");

    if (lightboxImage) {
      lightboxImage.src = "";
    }

    lastFocusedElement?.focus();
  }

  $$(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const image = $("img", item);
      const imageUrl = item.dataset.image || image?.src;

      if (imageUrl) {
        openLightbox(imageUrl, image?.alt);
      }
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  // 9. Subtle cursor glow on desktop
  const cursorGlow = $(".cursor-glow");
  const finePointer = window.matchMedia("(pointer: fine)");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (cursorGlow && finePointer.matches && !reduceMotion.matches) {
    window.addEventListener(
      "pointermove",
      (event) => {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
      },
      { passive: true }
    );
  }

  // 10. Demo contact form
  const contactForm = $("#contactForm");
  const formStatus = $("#formStatus");

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const project = String(formData.get("project") || "");
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !project || !message) {
      formStatus.textContent = "Please complete all fields.";
      return;
    }

    // This is a front-end demo. No data is uploaded or saved.
    formStatus.textContent =
      "Beautiful! Your demo enquiry is ready. Connect a form service to receive real enquiries.";

    contactForm.reset();
  });
});
