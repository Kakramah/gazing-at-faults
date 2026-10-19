(() => {
  'use strict';

  // 1. شريط تقدم القراءة
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progressBar = document.querySelector('.reading-progress span');
  let ticking = false;

  function updateReadingProgress() {
    if (prefersReducedMotion.matches) return;
    const docElem = document.documentElement;
    const totalHeight = docElem.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const ratio = Math.min(1, Math.max(0, window.scrollY / totalHeight));
      progressBar.style.transform = 'scaleX(' + ratio + ')';
    } else {
      progressBar.style.transform = 'scaleX(0)';
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateReadingProgress);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateReadingProgress, { passive: true });
  updateReadingProgress();

  // 2. ميزان النظر (تبديل زاوية الرؤية)
  const btnOutward = document.getElementById('btn-outward');
  const btnInward = document.getElementById('btn-inward');
  const panelOutward = document.getElementById('panel-outward');
  const panelInward = document.getElementById('panel-inward');

  function setPerspective(mode) {
    const isOutward = mode === 'outward';
    
    btnOutward.classList.toggle('is-active', isOutward);
    btnOutward.setAttribute('aria-selected', String(isOutward));
    panelOutward.hidden = !isOutward;
    panelOutward.classList.toggle('is-visible', isOutward);

    btnInward.classList.toggle('is-active', !isOutward);
    btnInward.setAttribute('aria-selected', String(!isOutward));
    panelInward.hidden = isOutward;
    panelInward.classList.toggle('is-visible', !isOutward);
  }

  if (btnOutward && btnInward) {
    btnOutward.addEventListener('click', () => setPerspective('outward'));
    btnInward.addEventListener('click', () => setPerspective('inward'));
  }

  // 3. نافذة تكبير الصور (Lightbox)
  const imageLinks = Array.from(document.querySelectorAll('.image-link[data-view]'));
  const imageDialog = document.getElementById('image-dialog');
  const enlargedImg = document.getElementById('enlarged-image');
  const dialogTitle = document.getElementById('image-title');
  const dialogDesc = document.getElementById('image-description');
  const btnCloseDialog = document.getElementById('dialog-close-btn');
  const btnNext = document.getElementById('next-image');
  const btnPrev = document.getElementById('previous-image');

  let activeIndex = 0;
  let lastActiveTrigger = null;

  function showImage(index) {
    if (index < 0) index = imageLinks.length - 1;
    if (index >= imageLinks.length) index = 0;
    activeIndex = index;

    const link = imageLinks[activeIndex];
    const img = link.querySelector('img');
    
    enlargedImg.src = link.getAttribute('href');
    enlargedImg.alt = img ? img.getAttribute('alt') : '';
    dialogTitle.textContent = link.getAttribute('data-title') || '';
    dialogDesc.textContent = link.getAttribute('data-desc') || '';
  }

  imageLinks.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      lastActiveTrigger = link;
      showImage(idx);
      if (typeof imageDialog.showModal === 'function') {
        imageDialog.showModal();
      }
    });
  });

  if (btnCloseDialog) {
    btnCloseDialog.addEventListener('click', () => {
      imageDialog.close();
      if (lastActiveTrigger) lastActiveTrigger.focus();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => showImage(activeIndex + 1));
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => showImage(activeIndex - 1));
  }

  imageDialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      showImage(activeIndex + 1);
    } else if (e.key === 'ArrowRight') {
      showImage(activeIndex - 1);
    }
  });

  imageDialog.addEventListener('click', (e) => {
    if (e.target === imageDialog) {
      imageDialog.close();
      if (lastActiveTrigger) lastActiveTrigger.focus();
    }
  });

  // 4. نافذة المشاركة
  const shareButton = document.getElementById('share-button');
  const shareDialog = document.getElementById('share-dialog');
  const shareCloseBtn = document.getElementById('share-close-btn');
  const shareUrlInput = document.getElementById('share-url');
  const copyLinkBtn = document.getElementById('copy-link-btn');
  const shareStatus = document.getElementById('share-status');

  const shareWhatsapp = document.getElementById('share-whatsapp');
  const shareTelegram = document.getElementById('share-telegram');
  const shareX = document.getElementById('share-x');
  const shareFacebook = document.getElementById('share-facebook');

  function openShareDialog() {
    const currentUrl = window.location.href;
    const pageTitle = document.title;
    shareUrlInput.value = currentUrl;
    shareStatus.textContent = '';

    const encUrl = encodeURIComponent(currentUrl);
    const encTitle = encodeURIComponent(pageTitle + ': أسهل نشاط بشري هو التحديق في أخطاء الآخرين');

    if (shareWhatsapp) shareWhatsapp.href = 'https://api.whatsapp.com/send?text=' + encTitle + '%20' + encUrl;
    if (shareTelegram) shareTelegram.href = 'https://t.me/share/url?url=' + encUrl + '&text=' + encTitle;
    if (shareX) shareX.href = 'https://twitter.com/intent/tweet?url=' + encUrl + '&text=' + encTitle;
    if (shareFacebook) shareFacebook.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encUrl;

    if (typeof shareDialog.showModal === 'function') {
      shareDialog.showModal();
    }
  }

  if (shareButton) {
    shareButton.addEventListener('click', openShareDialog);
  }

  if (shareCloseBtn) {
    shareCloseBtn.addEventListener('click', () => {
      shareDialog.close();
      if (shareButton) shareButton.focus();
    });
  }

  shareDialog.addEventListener('click', (e) => {
    if (e.target === shareDialog) {
      shareDialog.close();
      if (shareButton) shareButton.focus();
    }
  });

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      shareUrlInput.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrlInput.value).then(() => {
          shareStatus.textContent = 'تم نسخ الرابط بنجاح.';
        }).catch(() => {
          shareStatus.textContent = 'انسخ الرابط يدوياً من الحقل أعلاه.';
        });
      } else {
        try {
          document.execCommand('copy');
          shareStatus.textContent = 'تم نسخ الرابط بنجاح.';
        } catch (err) {
          shareStatus.textContent = 'انسخ الرابط يدوياً من الحقل أعلاه.';
        }
      }
    });
  }

})();
