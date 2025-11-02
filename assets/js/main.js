async function loadPosts() {
  try {
    const res = await fetch('assets/js/posts.json', { cache: "no-store" });
    const posts = await res.json();
    renderPosts(posts);
  } catch (err) {
    console.error('Failed to load posts', err);
    document.getElementById('postsRow').innerHTML = '<div class="col-12">Could not load posts.</div>';
  }
}

function renderPosts(posts) {
  const row = document.getElementById('postsRow');
  row.innerHTML = '';

  posts.forEach(post => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        ${post.thumbnail ? `<img src="${post.thumbnail}" class="card-img-top" alt="${escapeHtml(post.title)}">` : ''}
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(post.title)}</h5>
          <p class="card-text text-muted small mb-2">${escapeHtml(post.date)}</p>
          <p class="card-text">${escapeHtml(post.excerpt)}</p>
          <div class="mt-auto">
            <button class="btn btn-outline-primary btn-sm" data-id="${post.id}">Read</button>
          </div>
        </div>
      </div>
    `;
    row.appendChild(col);
  });

  // click handlers for "Read" buttons
  row.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const post = posts.find(p => p.id === id);
    if (post) showPostModal(post);
  });
}

// simple modal builder (bootstrap)
function showPostModal(post) {
  const html = `
    // <div class="modal fade" id="postModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${escapeHtml(post.title)}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${post.thumbnail ? `<img src="${post.thumbnail}" class="img-fluid mb-3" alt="${escapeHtml(post.title)}">` : ''}
            ${post.content}
          </div>
        </div>
      </div>
    //</div>`;
  // append and show
  const temp = document.createElement('div');
  temp.innerHTML = html;
  document.body.appendChild(temp.firstElementChild);
  const modal = new bootstrap.Modal(document.getElementById('postModal'));
  modal.show();
  // cleanup when closed
  document.getElementById('postModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('postModal').remove();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[s]);
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  // naive search: reload and filter by title/excerpt
  fetch('assets/js/posts.json').then(r => r.json()).then(posts => {
    const filtered = posts.filter(p => (p.title + ' ' + p.excerpt).toLowerCase().includes(q));
    renderPosts(filtered);
  });
});

loadPosts();
