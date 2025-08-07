document.addEventListener('DOMContentLoaded', function () {
  // Only run on the correct collection page
  if (!window.location.pathname.includes('/collections/all')) return;

  const loadMoreBtn = document.getElementById('load-more-btn');
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  const productGrid = document.querySelector('.product-grid__item')?.closest('ul');
  const totalCount = parseInt(document.querySelector('.total-count')?.textContent || '0');

  if (!loadMoreBtn || !progressText || !progressBar || !productGrid || !totalCount) return;

  function updateProgressUI() {
    const seenCount = productGrid.querySelectorAll('.product-grid__item').length;
    const percent = Math.min((seenCount / totalCount) * 100, 100);

    document.querySelector('.seen-count').textContent = seenCount;
    progressBar.style.width = `${percent}%`;
  }

  // Initial progress bar update
  updateProgressUI();

  loadMoreBtn.addEventListener('click', function () {
    const nextUrl = loadMoreBtn.dataset.nextUrl;
    if (!nextUrl) return;

    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    fetch(nextUrl)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const newItems = doc.querySelectorAll('.product-grid__item');
        newItems.forEach(item => productGrid.appendChild(item));

        // Update progress bar
        updateProgressUI();

        // Handle next button
        const newBtn = doc.querySelector('#load-more-btn');
        if (newBtn) {
          loadMoreBtn.dataset.nextUrl = newBtn.dataset.nextUrl;
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = 'Load more';
        } else {
          loadMoreBtn.remove();
        }

        // Update URL (optional)
        const nextPage = new URL(nextUrl, window.location.origin).searchParams.get('page');
        history.replaceState(null, '', `?page=${nextPage}`);
      })
      .catch(err => {
        console.error('Load more failed:', err);
        loadMoreBtn.textContent = 'Try again';
        loadMoreBtn.disabled = false;
      });
  });
});
