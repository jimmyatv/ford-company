document.addEventListener('DOMContentLoaded', () => {
  // 1. Godina u futeru i minimalni datum zakazivanja
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  const dateInput = document.getElementById('date');
  if (dateInput) {
    const [today] = new Date().toISOString().split('T');
    dateInput.min = today;
    dateInput.value = today;
  }

  // 2. Promena boje navbara na skrol + Back to Top dugme
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('backToTopBtn');

  const handleScrollEffects = () => {
    const scrollY = window.scrollY ?? window.pageYOffset;
    header?.classList.toggle('scrolled', scrollY > 40);
    backToTopBtn?.classList.toggle('visible', scrollY > 350);
  };

  window.addEventListener('scroll', handleScrollEffects, { passive: true });
  handleScrollEffects();

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 3. Mobilni meni (Rotirajući Burger triger + padajući meni)
  const burgerBtn = document.getElementById('burgerBtn');
  const navMenu = document.getElementById('navMenu');

  if (burgerBtn && navMenu) {
    const toggleMenu = (forceState) => {
      const isOpen = navMenu.classList.toggle('open', forceState);
      burgerBtn.classList.toggle('is-active', isOpen);
      burgerBtn.setAttribute('aria-expanded', String(isOpen));
    };

    burgerBtn.addEventListener('click', () => toggleMenu());
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  // 4. Dinamičko učitavanje usluga i procena cene / trajanja
  const modelSelect = document.getElementById('model');
  const serviceSelect = document.getElementById('service');
  const estModel = document.getElementById('estModel');
  const estTime = document.getElementById('estTime');
  const estPrice = document.getElementById('estPrice');
  const estBadge = document.getElementById('estBadge');

  const populateServices = () => {
    if (!serviceSelect || typeof SERVICES_DATA === 'undefined') return;

    serviceSelect.innerHTML = '';

    SERVICES_DATA.forEach(({ value, label, time, price, badge }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      option.dataset.time = time;
      option.dataset.price = price;
      option.dataset.badge = badge;
      serviceSelect.appendChild(option);
    });
  };

  const updateEstimate = () => {
    if (!modelSelect || !serviceSelect) return;
    const { time = '~ 60 min', price = 'Po dogovoru', badge = 'Servis' } =
      serviceSelect.selectedOptions[0]?.dataset ?? {};

    estModel.textContent = modelSelect.value;
    estTime.textContent = time;
    estPrice.textContent = price;
    estBadge.textContent = badge;
  };

  if (modelSelect && serviceSelect) {
    populateServices();
    [modelSelect, serviceSelect].forEach((el) =>
      el.addEventListener('change', updateEstimate)
    );
    updateEstimate();
  }

  // 5. Galerija: Filteri po kategorijama i Lightbox pregled
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = [...document.querySelectorAll('.gallery-item')];
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentLightboxIndex = 0;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const { filter } = btn.dataset;
      galleryItems.forEach((item) => {
        const matches = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('is-hidden', !matches);
      });
    });
  });

  const getVisibleGalleryItems = () =>
    galleryItems.filter((item) => !item.classList.contains('is-hidden'));

  const openLightbox = (index) => {
    const visibleItems = getVisibleGalleryItems();
    if (!visibleItems.length || !lightboxModal) return;

    currentLightboxIndex = (index + visibleItems.length) % visibleItems.length;
    const target = visibleItems[currentLightboxIndex];
    const imgEl = target.querySelector('img');

    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt;
    lightboxTitle.textContent = target.dataset.title ?? '';
    lightboxDesc.textContent = target.dataset.desc ?? '';
    lightboxModal.classList.add('open');
    lightboxModal.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('open');
    lightboxModal.setAttribute('aria-hidden', 'true');
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const idx = getVisibleGalleryItems().indexOf(item);
      if (idx !== -1) openLightbox(idx);
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => openLightbox(currentLightboxIndex - 1));
  lightboxNext?.addEventListener('click', () => openLightbox(currentLightboxIndex + 1));

  lightboxModal?.addEventListener('click', ({ target }) => {
    if (target === lightboxModal) closeLightbox();
  });

  document.addEventListener('keydown', ({ key }) => {
    if (!lightboxModal?.classList.contains('open')) return;

    const keyActions = {
      Escape: closeLightbox,
      ArrowLeft: () => openLightbox(currentLightboxIndex - 1),
      ArrowRight: () => openLightbox(currentLightboxIndex + 1),
    };

    keyActions[key]?.();
  });

  // 6. Iskustva klijenata: Dinamičko učitavanje iz data/reviews.js i prikaz više/manje
  const testimonialsGrid = document.getElementById('testimonialsGrid');
  const toggleReviewsBtn = document.getElementById('toggleReviewsBtn');
  const INITIAL_VISIBLE_REVIEWS = 3;
  let reviewsExpanded = false;

  const renderReviews = () => {
    if (!testimonialsGrid || typeof REVIEWS_DATA === 'undefined') return;

    testimonialsGrid.innerHTML = REVIEWS_DATA.map(
      ({ name, initials, car, meta, rating = 5, quote }, index) => {
        const isHidden = index >= INITIAL_VISIBLE_REVIEWS;
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

        return `
          <article class="testimonial-card${isHidden ? ' testimonial-card--hidden' : ''}">
            <div class="testimonial-card__top">
              <span class="testimonial-card__stars">${stars}</span>
              <span class="testimonial-card__car">${car}</span>
            </div>
            <p class="testimonial-card__quote">„${quote}“</p>
            <div class="testimonial-card__author">
              <div class="avatar">${initials}</div>
              <div>
                <strong>${name}</strong>
                <span>${meta}</span>
              </div>
            </div>
          </article>
        `;
      }
    ).join('');

    if (toggleReviewsBtn) {
      toggleReviewsBtn.style.display =
        REVIEWS_DATA.length > INITIAL_VISIBLE_REVIEWS ? 'inline-flex' : 'none';
    }
  };

  renderReviews();

  toggleReviewsBtn?.addEventListener('click', () => {
    reviewsExpanded = !reviewsExpanded;
    testimonialsGrid
      ?.querySelectorAll('.testimonial-card--hidden')
      .forEach((card) => card.classList.toggle('is-visible', reviewsExpanded));

    toggleReviewsBtn.textContent = reviewsExpanded
      ? 'Prikaži manje recenzija'
      : 'Prikaži više recenzija';
  });

  // 7. Slanje zahteva na WhatsApp ili Viber
  const bookingForm = document.getElementById('bookingForm');
  const sendWhatsappBtn = document.getElementById('sendWhatsappBtn');
  const sendViberBtn = document.getElementById('sendViberBtn');
  const confirmModal = document.getElementById('confirmModal');
  const modalTitle = confirmModal?.querySelector('h3');
  const modalSummary = document.getElementById('modalSummary');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // Broj telefona servisa
  const SERVICE_PHONE = '381628684444';

  const closeConfirmModal = () => {
    confirmModal?.classList.remove('open');
    confirmModal?.setAttribute('aria-hidden', 'true');
  };

  confirmModal?.addEventListener('click', ({ target }) => {
    if (target === confirmModal) closeConfirmModal();
  });

  const buildBookingMessage = () => {
    if (!bookingForm?.reportValidity()) return null;

    const vehicle = modelSelect.value;
    const yearEngine = document.getElementById('year')?.value.trim();
    const service = serviceSelect.value;
    const chosenDate = dateInput.value;
    const clientName = document.getElementById('name')?.value.trim();
    const clientPhone = document.getElementById('phone')?.value.trim();
    const note = document.getElementById('note')?.value.trim();

    const carText = yearEngine ? `${vehicle} (${yearEngine})` : vehicle;

    const lines = [
      'Zakazivanje - FORD company',
      `Vozilo: ${carText}`,
      `Usluga: ${service}`,
      `Datum: ${chosenDate}`,
      `Ime: ${clientName}`,
      `Tel: ${clientPhone}`,
      note && `Opis: ${note}`,
    ].filter(Boolean);

    return encodeURIComponent(lines.join('\n'));
  };

  sendWhatsappBtn?.addEventListener('click', () => {
    const encodedText = buildBookingMessage();
    if (!encodedText) return;
    window.open(`https://wa.me/${SERVICE_PHONE}?text=${encodedText}`, '_blank', 'noopener');
  });

  sendViberBtn?.addEventListener('click', async () => {
    const encodedText = buildBookingMessage();
    if (!encodedText) return;

    const plainText = decodeURIComponent(encodedText);
    const viberUrl = `viber://chat?number=%2B${SERVICE_PHONE}`;

    try {
      await navigator.clipboard.writeText(plainText);
    } catch {
      // Ako pregledač blokira automatsko kopiranje, svejedno otvara čet
    }

    if (confirmModal && modalSummary && closeModalBtn) {
      if (modalTitle) modalTitle.textContent = 'Tekst zahteva je kopiran!';
      modalSummary.textContent =
        'Kliknite „U redu“ da otvorite Viber čet sa servisom, a zatim samo uradite Paste i pošaljite poruku.';
      confirmModal.classList.add('open');
      confirmModal.setAttribute('aria-hidden', 'false');

      closeModalBtn.onclick = () => {
        closeConfirmModal();
        window.location.href = viberUrl;
      };
    } else {
      window.location.href = viberUrl;
    }
  });

  // 8. Scroll Reveal animacije u viewportu + Count-Up za brojeve (Web Animations API - 0% treperenja)
  const setupScrollAnimations = () => {
    const animateCounter = (el) => {
      if (el.dataset.counted) return;
      el.dataset.counted = 'true';

      const rawText = el.textContent.trim();
      const match = rawText.match(/^([^\d.-]*)([\d.,]+)(.*)$/);
      if (!match) return;

      const [, prefix, numStr, suffix] = match;
      const target = parseFloat(numStr.replace(',', '.'));
      const decimals = (numStr.split('.')[1] || '').length;
      const duration = 1400;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = (target * eased).toFixed(decimals);
        el.textContent = `${prefix}${current}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = rawText;
        }
      };

      requestAnimationFrame(step);
    };

    const runReveal = (el) => {
      if (el.dataset.revealed) return;
      el.dataset.revealed = 'true';

      const dir = el.dataset.revealDir || 'up';
      const delay = Number(el.dataset.revealDelay || 0);
      const isMobile = window.innerWidth <= 768;

      let startTransform = 'translate3d(0, 24px, 0)';
      if (!isMobile && dir === 'left') startTransform = 'translate3d(-28px, 0, 0)';
      if (!isMobile && dir === 'right') startTransform = 'translate3d(28px, 0, 0)';

      el.animate(
        [
          { opacity: 0, transform: startTransform },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ],
        {
          duration: 600,
          delay,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards',
        }
      );

      el.style.opacity = '1';
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;

          if (target.classList.contains('count-target')) {
            animateCounter(target);
          } else {
            runReveal(target);
          }

          obs.unobserve(target);
        });
      },
      { threshold: 0.08 }
    );

    const register = (selector, dir = 'up', stagger = 0) => {
      document.querySelectorAll(selector).forEach((el, idx) => {
        el.style.opacity = '0';
        el.dataset.revealDir = dir;
        if (stagger) el.dataset.revealDelay = String((idx % 3) * stagger);
        observer.observe(el);
      });
    };

    register('.section__head', 'up', 0);
    register('.service-card', 'up', 80);
    register('.gallery-item', 'up', 80);
    register('.testimonial-card:not(.testimonial-card--hidden)', 'up', 80);
    register('.location-item', 'up', 80);

    register('.hero__content, .why-item, .booking-info, .location-info', 'left', 90);
    register('.hero__visual, .why-panel, .booking-form, .location-map', 'right', 0);

    document
      .querySelectorAll('.stat__num, .rating-summary__score')
      .forEach((el) => {
        el.classList.add('count-target');
        observer.observe(el);
      });
  };

  setupScrollAnimations();

  // 9. Uživo status radnog vremena (vremenska zona Srbija / Niš)
  const updateServiceStatus = () => {
    const statusEl = document.querySelector('.hero-card__status');
    if (!statusEl) return;

    // Uzima tačno vreme u Srbiji bez obzira gde se posetilac nalazi
    const belgradeNow = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Europe/Belgrade' })
    );

    const day = belgradeNow.getDay(); // 0 = Nedelja, 1-5 = Pon-Pet, 6 = Subota
    const totalMinutes = belgradeNow.getHours() * 60 + belgradeNow.getMinutes();

    let isOpen = false;
    let hoursLabel = 'Radno vreme 08–17h';

    if (day >= 1 && day <= 5) {
      isOpen = totalMinutes >= 8 * 60 && totalMinutes < 17 * 60;
      hoursLabel = isOpen
        ? 'Radno vreme 08–17h'
        : totalMinutes < 8 * 60
        ? 'Otvaramo danas u 08h'
        : day === 5
        ? 'Otvaramo u subotu u 08h'
        : 'Otvaramo sutra u 08h';
    } else if (day === 6) {
      isOpen = totalMinutes >= 8 * 60 && totalMinutes < 14 * 60;
      hoursLabel = isOpen
        ? 'Subotom 08–14h'
        : totalMinutes < 8 * 60
        ? 'Otvaramo danas u 08h'
        : 'Otvaramo u ponedeljak u 08h';
    } else {
      // Nedelja
      isOpen = false;
      hoursLabel = 'Otvaramo u ponedeljak u 08h';
    }

    statusEl.classList.toggle('is-closed', !isOpen);
    statusEl.textContent = isOpen
      ? `● Servis aktivan • ${hoursLabel}`
      : `● Trenutno zatvoreno • ${hoursLabel}`;
  };

  updateServiceStatus();
  setInterval(updateServiceStatus, 60000); // osvežava svakog minuta
});