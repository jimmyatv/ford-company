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

  // Broj telefona servisa (format 38160xxxxxxx, bez + i bez nule)
  const SERVICE_PHONE = '381601234567';

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

  sendViberBtn?.addEventListener('click', () => {
    const encodedText = buildBookingMessage();
    if (!encodedText) return;
    window.open(`viber://forward?text=${encodedText}`, '_blank');
  });
});