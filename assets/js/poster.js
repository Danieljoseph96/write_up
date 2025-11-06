// ===== LOADING ANIMATION =====
class LoadingAnimation {
    constructor() {
        this.loadingElement = null;
        this.progressBar = null;
        this.loadingStyle = 'style-spinner';
        this.messages = [
            "Initializing Excel Query Book...",
            "Loading posts and content...", 
            "Applying Excel theme...",
            "Almost ready...",
            "Welcome to Excel Query Book!"
        ];
        this.init();
    }

    init() {
        this.createLoadingElement();
        this.simulateProgress();
        this.handlePageLoad();
    }

    createLoadingElement() {
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = `loading-overlay ${this.loadingStyle}`;
        this.loadingElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--excel-green), var(--excel-dark-green));
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        this.loadingElement.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 2rem;">📊</div>
            <div class="loading-message" style="margin-bottom: 20px; font-size: 1.2rem; text-align: center;">${this.messages[0]}</div>
            <div class="loading-progress" style="width: 300px; height: 8px; background: rgba(255,255,255,0.3); border-radius: 4px; overflow: hidden;">
                <div class="progress-bar" style="height: 100%; background: white; width: 0%; transition: width 0.3s ease;"></div>
            </div>
        `;

        document.body.appendChild(this.loadingElement);
        this.progressBar = this.loadingElement.querySelector('.progress-bar');
    }

    simulateProgress() {
        let progress = 0;
        const messageElement = this.loadingElement.querySelector('.loading-message');
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            if (this.progressBar) {
                this.progressBar.style.width = `${progress}%`;
            }
            
            if (progress > 20 && progress < 40) {
                messageElement.textContent = this.messages[1];
            } else if (progress > 40 && progress < 60) {
                messageElement.textContent = this.messages[2];
            } else if (progress > 60 && progress < 80) {
                messageElement.textContent = this.messages[3];
            } else if (progress > 80) {
                messageElement.textContent = this.messages[4];
            }
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 200);
    }

    handlePageLoad() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onPageReady());
        } else {
            this.onPageReady();
        }

        setTimeout(() => {
            this.hide();
        }, 4000);
    }

    onPageReady() {
        setTimeout(() => {
            this.hide();
        }, 1500);
    }

    hide() {
        if (this.loadingElement) {
            this.loadingElement.style.opacity = '0';
            this.loadingElement.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                if (this.loadingElement && this.loadingElement.parentNode) {
                    this.loadingElement.parentNode.removeChild(this.loadingElement);
                }
            }, 500);
        }
    }
}

// Generic fetch helper
async function fetchJSON(url) {
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
        return await resp.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize loading animation
    new LoadingAnimation();
    
    try {
        window.samplePosts = await fetchJSON('/assets/js/posts.json');
    } catch(err) {
        console.error("Failed to load posts.json", err);
        window.samplePosts = [];
    }
    
    // Initialize main functionality
    initializeApp();
});

// ===== MAIN APP INITIALIZATION =====
function initializeApp() {
    // Load and render posts
    loadAndRenderPosts();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize filters
    initializeFilters();
    
    // Initialize theme customization
    initializeThemeCustomization();
    
    // Initialize year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
}

// Load and render posts
function loadAndRenderPosts() {
    try {
        const posts = window.samplePosts || [];
        renderPosts(posts);
        
        // Store posts globally for filtering
        window.allPosts = posts;
    } catch (error) {
        console.error('Error loading posts:', error);
        showErrorMessage('Failed to load posts. Please refresh the page.');
    }
}

// Render posts to the grid
function renderPosts(posts) {
    const postsRow = document.getElementById('postsRow');
    if (!postsRow) return;
    
    postsRow.innerHTML = '';
    
    if (posts.length === 0) {
        postsRow.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">No posts found matching your criteria.</div>
            </div>
        `;
        return;
    }
    
    posts.forEach(post => {
        const postCol = document.createElement('div');
        postCol.className = 'col-md-6 col-lg-4';
        
        const postId = post.id;
        
        postCol.innerHTML = `
            <div class="card card-excel h-100">
                <div class="card-excel-header d-flex justify-content-between align-items-center">
                    <span class="badge bg-excel">${post.type.toUpperCase()}</span>
                    <small class="text-muted">${formatDate(post.date)}</small>
                </div>
                <div class="card-excel-body">
                    <h5 class="card-title">${escapeHtml(post.title)}</h5>
                    <p class="card-text">${escapeHtml(post.excerpt)}</p>
                    <div class="mt-2">
                        ${post.tags && post.tags.length > 0 ? 
                            post.tags.map(tag => `<span class="badge bg-light text-dark me-1">${escapeHtml(tag)}</span>`).join('') 
                            : ''}
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <button class="btn btn-excel btn-sm" onclick="viewPost('${postId}')">
                        Read More
                    </button>
                </div>
            </div>
        `;
        
        postsRow.appendChild(postCol);
    });
}

// ===== SEARCH FUNCTIONALITY =====
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            filterPosts();
        }, 300));
    }
}

// ===== FILTER FUNCTIONALITY =====
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterPosts);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', filterPosts);
    }
}

// Filter and sort posts
function filterPosts() {
    if (!window.allPosts) return;
    
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const sortBy = document.getElementById('sortFilter')?.value || 'newest';
    
    let filteredPosts = window.allPosts.filter(post => {
        const matchesSearch = !searchTerm || 
            post.title.toLowerCase().includes(searchTerm) || 
            post.excerpt.toLowerCase().includes(searchTerm) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
        
        const matchesCategory = !category || post.type === category;
        
        return matchesSearch && matchesCategory;
    });
    
    // Sort posts
    filteredPosts.sort((a, b) => {
        switch(sortBy) {
            case 'newest':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });
    
    renderPosts(filteredPosts);
}

// ===== THEME CUSTOMIZATION =====
function initializeThemeCustomization() {
    const themeToggle = document.getElementById('themeToggle');
    const themePanel = document.getElementById('themePanel');
    const applyTheme = document.getElementById('applyTheme');
    const resetTheme = document.getElementById('resetTheme');
    const themePresets = document.querySelectorAll('.theme-preset');
    
    if (themeToggle && themePanel) {
        themeToggle.addEventListener('click', () => {
            themePanel.classList.toggle('open');
        });
    }
    
    if (applyTheme) {
        applyTheme.addEventListener('click', applyCustomTheme);
    }
    
    if (resetTheme) {
        resetTheme.addEventListener('click', resetToDefaultTheme);
    }
    
    themePresets.forEach(preset => {
        preset.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            applyThemePreset(theme);
        });
    });
    
    loadSavedTheme();
}

function applyThemePreset(theme) {
    const root = document.documentElement;
    
    switch(theme) {
        case 'excel':
            updateThemeColors('#217346', '#1a5c38', '#4472c4', '#f3f3f3');
            break;
        case 'blue':
            updateThemeColors('#2171b5', '#08519c', '#6baed6', '#f0f8ff');
            break;
        case 'purple':
            updateThemeColors('#6a51a3', '#54278f', '#9e9ac8', '#f8f7ff');
            break;
        case 'orange':
            updateThemeColors('#fd8d3c', '#e6550d', '#fdae6b', '#fff5eb');
            break;
    }
    
    document.querySelectorAll('.theme-preset').forEach(p => p.classList.remove('active'));
    document.querySelector(`.theme-preset[data-theme="${theme}"]`).classList.add('active');
    
    saveThemeToStorage(theme);
}

function applyCustomTheme() {
    const primaryColor = document.getElementById('primaryColor').value;
    const accentColor = document.getElementById('accentColor').value;
    const backgroundColor = document.getElementById('backgroundColor').value;
    
    updateThemeColors(primaryColor, darkenColor(primaryColor, 20), accentColor, backgroundColor);
    saveThemeToStorage('custom');
}

function resetToDefaultTheme() {
    applyThemePreset('excel');
    
    document.getElementById('primaryColor').value = '#217346';
    document.getElementById('accentColor').value = '#4472c4';
    document.getElementById('backgroundColor').value = '#f3f3f3';
}

function updateThemeColors(primary, darkPrimary, accent, background) {
    const root = document.documentElement;
    root.style.setProperty('--excel-green', primary);
    root.style.setProperty('--excel-dark-green', darkPrimary);
    root.style.setProperty('--excel-accent', accent);
    root.style.setProperty('--excel-gray', background);
    root.style.setProperty('--excel-grid', lightenColor(background, 5));
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R) * 0x10000 +
            (G > 255 ? 255 : G) * 0x100 +
            (B > 255 ? 255 : B)).toString(16).slice(1);
}

function saveThemeToStorage(theme) {
    try {
        localStorage.setItem('excelTheme', theme);
        if (theme === 'custom') {
            const themeData = {
                primary: document.getElementById('primaryColor').value,
                accent: document.getElementById('accentColor').value,
                background: document.getElementById('backgroundColor').value
            };
            localStorage.setItem('customTheme', JSON.stringify(themeData));
        }
    } catch (e) {
        console.warn('Could not save theme to localStorage:', e);
    }
}

function loadSavedTheme() {
    try {
        const savedTheme = localStorage.getItem('excelTheme');
        if (savedTheme) {
            if (savedTheme === 'custom') {
                const customTheme = JSON.parse(localStorage.getItem('customTheme'));
                if (customTheme) {
                    document.getElementById('primaryColor').value = customTheme.primary;
                    document.getElementById('accentColor').value = customTheme.accent;
                    document.getElementById('backgroundColor').value = customTheme.background;
                    applyCustomTheme();
                }
            } else {
                applyThemePreset(savedTheme);
            }
        }
    } catch (e) {
        console.warn('Could not load theme from localStorage:', e);
    }
}

// ===== POST VIEWING SYSTEM =====
function viewPost(postId) {
    const post = window.samplePosts.find(p => p.id === postId) || 
                 window.samplePosts.find(p => p.id === postId);
                 console.log("View");
    
    if (!post) {
        console.error('Post not found:', postId);
        showErrorMessage('Post not found. Please try another post.');
        return;
    }
    
    openPostModal(post);
}

function openPostModal(post) {
    const existingModals = document.querySelectorAll('.post-modal, .modal-backdrop');
    existingModals.forEach(element => element.remove());
    console.log("open")
    const modalHtml = `
        <div class="post-modal modal fade show" id="postModal" tabindex="-1" aria-labelledby="postModalLabel" aria-hidden="false" style="display: block;">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content bg-light">
                    <div class="modal-header bg-excel text-white border-0">
                        <div class="d-flex justify-content-between align-items-center w-100">
                            <div>
                                <h5 class="modal-title mb-0" id="postModalLabel">
                                    <i class="fas fa-file-excel me-2"></i>${escapeHtml(post.title)}
                                </h5>
                                <div class="mt-1">
                                    <span class="badge bg-light text-dark me-2">${post.type.toUpperCase()}</span>
                                    <small class="text-light">${formatDate(post.date)}</small>
                                </div>
                            </div>
                            <div class="d-flex align-items-center">
                                <button type="button" class="btn btn-sm btn-light me-2" onclick="printPost()" title="Print">
                                    <i class="fas fa-print"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-light me-2" onclick="toggleFullscreen()" title="Toggle Fullscreen">
                                    <i class="fas fa-expand"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-light" onclick="closePostModal()" title="Close">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body p-0">
                        <div class="container-fluid py-4">
                            <div class="row">
                                <div class="col-lg-8">
                                    <div class="post-content bg-white rounded shadow-sm p-4">
                                        ${post.content}
                                    </div>
                                    
                                    <div class="mt-4">
                                        <h6 class="text-excel mb-3">
                                            <i class="fas fa-link me-2"></i>Related Posts
                                        </h6>
                                        <div class="row g-3" id="relatedPosts">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-lg-4">
                                    <div class="card card-excel mb-4">
                                        <div class="card-excel-header">
                                            <i class="fas fa-info-circle me-2"></i>Post Information
                                        </div>
                                        <div class="card-excel-body">
                                            <div class="mb-3">
                                                <strong>Category:</strong>
                                                <span class="badge bg-excel ms-2">${post.type.toUpperCase()}</span>
                                            </div>
                                            <div class="mb-3">
                                                <strong>Published:</strong>
                                                <div class="text-muted">${formatDate(post.date)}</div>
                                            </div>
                                            <div class="mb-3">
                                                <strong>Reading Time:</strong>
                                                <div class="text-muted">${calculateReadingTime(post.content)} min read</div>
                                            </div>
                                            <div>
                                                <strong>Share:</strong>
                                                <div class="mt-2">
                                                    <button class="btn btn-sm btn-outline-excel me-1" onclick="sharePost('${post.id}', 'twitter')">
                                                        <i class="fab fa-twitter"></i>
                                                    </button>
                                                    <button class="btn btn-sm btn-outline-excel me-1" onclick="sharePost('${post.id}', 'linkedin')">
                                                        <i class="fab fa-linkedin"></i>
                                                    </button>
                                                    <button class="btn btn-sm btn-outline-excel" onclick="copyPostLink('${post.id}')">
                                                        <i class="fas fa-link"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="card card-excel">
                                        <div class="card-excel-header">
                                            <i class="fas fa-bolt me-2"></i>Quick Actions
                                        </div>
                                        <div class="card-excel-body">
                                            <div class="d-grid gap-2">
                                                <button class="btn btn-excel btn-sm" onclick="downloadPostAsPDF('${post.id}')">
                                                    <i class="fas fa-download me-2"></i>Download as PDF
                                                </button>
                                              
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-top">
                        <div class="d-flex justify-content-between w-100">
                            <div>
                                ${getPreviousNextButtons(post.id)}
                            </div>
                            <div>
                                <button type="button" class="btn btn-secondary me-2" onclick="closePostModal()">
                                    <i class="fas fa-arrow-left me-2"></i>Back to Posts
                                </button>
                                <button type="button" class="btn btn-excel" onclick="scrollToTop()">
                                    <i class="fas fa-arrow-up me-2"></i>Top
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.querySelector('.post-modal').setAttribute('data-current-post', post.id);
    document.body.style.overflow = 'hidden';
    loadRelatedPosts(post);
    document.addEventListener('keydown', handleModalKeyboard);
    initializeCodeHighlighting();
}

// ... (rest of the modal functions remain the same with window.samplePosts references)

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
        return dateString;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
    errorDiv.style.zIndex = '1060';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}
// ===== MISSING MODAL FUNCTIONS =====
function calculateReadingTime(content) {
    // Remove HTML tags and count words
    const text = content.replace(/<[^>]*>/g, ' ');
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    return Math.max(1, readingTime); // Minimum 1 minute
}

function closePostModal() {
    const modal = document.querySelector('.post-modal');
    const backdrop = document.querySelector('.modal-backdrop');
    
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    
    if (backdrop) {
        backdrop.classList.remove('show');
        setTimeout(() => {
            if (backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
        }, 300);
    }
    
    // Re-enable body scroll
    document.body.style.overflow = '';
    
    // Remove keyboard event listener
    document.removeEventListener('keydown', handleModalKeyboard);
    
    // Remove modal from DOM after animation
    setTimeout(() => {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

function handleModalKeyboard(event) {
    if (event.key === 'Escape') {
        closePostModal();
    }
    
    // Navigation with arrow keys
    if (event.key === 'ArrowLeft') {
        navigateToAdjacentPost('previous');
    } else if (event.key === 'ArrowRight') {
        navigateToAdjacentPost('next');
    }
}

function navigateToAdjacentPost(direction) {
    const currentPostId = document.querySelector('.post-modal')?.getAttribute('data-current-post');
    if (!currentPostId) return;
    
    const currentIndex = window.samplePosts.findIndex(post => post.id === currentPostId);
    if (currentIndex === -1) return;
    
    let targetIndex;
    if (direction === 'previous' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < window.samplePosts.length - 1) {
        targetIndex = currentIndex + 1;
    } else {
        return;
    }
    
    const targetPost = window.samplePosts[targetIndex];
    closePostModal();
    setTimeout(() => openPostModal(targetPost), 300);
}

function loadRelatedPosts(currentPost) {
    const relatedPostsContainer = document.getElementById('relatedPosts');
    if (!relatedPostsContainer) return;
    
    // Find related posts (same category, excluding current post)
    const relatedPosts = window.samplePosts
        .filter(post => post.type === currentPost.type && post.id !== currentPost.id)
        .slice(0, 3); // Show max 3 related posts
    
    if (relatedPosts.length === 0) {
        relatedPostsContainer.innerHTML = '<div class="col-12 text-muted text-center">No related posts found.</div>';
        return;
    }
    
    relatedPostsContainer.innerHTML = relatedPosts.map(post => `
        <div class="col-md-4">
            <div class="card card-excel h-100">
                <div class="card-excel-body">
                    <h6 class="card-title">${escapeHtml(post.title)}</h6>
                    <p class="card-text small text-muted">${escapeHtml(post.excerpt.substring(0, 80))}...</p>
                    <button class="btn btn-excel btn-sm" onclick="viewPost('${post.id}')">
                        Read More
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getPreviousNextButtons(currentPostId) {
    const currentIndex = window.samplePosts.findIndex(post => post.id === currentPostId);
    const previousPost = currentIndex > 0 ? window.samplePosts[currentIndex - 1] : null;
    const nextPost = currentIndex < window.samplePosts.length - 1 ? window.samplePosts[currentIndex + 1] : null;
    
    return `
        <div class="btn-group">
            ${previousPost ? `
                <button class="btn btn-outline-excel btn-sm" onclick="viewPost('${previousPost.id}')" title="${escapeHtml(previousPost.title)}">
                    <i class="fas fa-chevron-left me-1"></i>Previous
                </button>
            ` : '<button class="btn btn-outline-excel btn-sm" disabled><i class="fas fa-chevron-left me-1"></i>Previous</button>'}
            
            ${nextPost ? `
                <button class="btn btn-outline-excel btn-sm" onclick="viewPost('${nextPost.id}')" title="${escapeHtml(nextPost.title)}">
                    Next <i class="fas fa-chevron-right ms-1"></i>
                </button>
            ` : '<button class="btn btn-outline-excel btn-sm" disabled>Next <i class="fas fa-chevron-right ms-1"></i></button>'}
        </div>
    `;
}

function scrollToTop() {
    const modalBody = document.querySelector('.post-modal .modal-body');
    if (modalBody) {
        modalBody.scrollTop = 0;
    }
}

function toggleFullscreen() {
    const modal = document.querySelector('.post-modal');
    const fullscreenBtn = document.querySelector('[onclick="toggleFullscreen()"] i');
    
    if (!document.fullscreenElement) {
        modal.requestFullscreen?.().catch(err => {
            console.log('Fullscreen failed:', err);
        });
        if (fullscreenBtn) fullscreenBtn.className = 'fas fa-compress';
    } else {
        document.exitFullscreen?.();
        if (fullscreenBtn) fullscreenBtn.className = 'fas fa-expand';
    }
}

function printPost() {
    const printContent = document.querySelector('.post-content')?.innerHTML;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    
    printWindow.document.print(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${document.querySelector('.modal-title')?.textContent || 'Excel Post'}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { padding: 20px; }
                .code-block { background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0; }
                img { max-width: 100%; height: auto; }
            </style>
        </head>
        <body>
            <div class="container">
                ${printContent}
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

function sharePost(postId, platform) {
    const post = window.samplePosts.find(p => p.id === postId);
    if (!post) return;
    
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);
    const text = encodeURIComponent(post.excerpt);
    
    let shareUrl;
    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
        default:
            return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function copyPostLink(postId) {
    const url = window.location.href.split('?')[0] + `?post=${postId}`;
    
    navigator.clipboard.writeText(url).then(() => {
        // Show success message
        const button = document.querySelector('[onclick="copyPostLink(\'' + postId + '\')"]');
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
            button.classList.remove('btn-outline-excel');
            button.classList.add('btn-success');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-excel');
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        showErrorMessage('Failed to copy link to clipboard');
    });
}

function downloadPostAsPDF(postId) {
    // This would typically call a server-side PDF generation service
    showErrorMessage('PDF download feature would be implemented with a server-side service');
}


function initializeCodeHighlighting() {
    // Simple code highlighting for Excel formulas
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const html = block.innerHTML
            .replace(/(=)([A-Z]+)/g, '$1<span class="text-primary fw-bold">$2</span>')
            .replace(/([A-Z_]+)(\()/g, '<span class="text-success fw-bold">$1</span>$2')
            .replace(/(\[[^\]]+\])/g, '<span class="text-muted">$1</span>');
        block.innerHTML = html;
    });
}

// Add modal styles
const modalStyles = `
    .post-modal .modal-fullscreen {
        max-width: 100%;
    }
    .post-modal .post-content {
        line-height: 1.6;
    }
    .post-modal .post-content pre {
        background: var(--excel-header-bg);
        border: 1px solid var(--excel-border);
        border-radius: 4px;
        padding: 1rem;
        overflow-x: auto;
    }
    .post-modal .post-content code {
        background: var(--excel-header-bg);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
    }
    .post-modal .bg-excel {
        background: linear-gradient(135deg, var(--excel-green), var(--excel-dark-green)) !important;
    }
    .post-modal .btn-excel {
        background-color: var(--excel-green);
        border-color: var(--excel-green);
        color: white;
    }
    .post-modal .btn-excel:hover {
        background-color: var(--excel-dark-green);
        border-color: var(--excel-dark-green);
    }
    .post-modal .btn-outline-excel {
        border-color: var(--excel-green);
        color: var(--excel-green);
    }
    .post-modal .btn-outline-excel:hover {
        background-color: var(--excel-green);
        color: white;
    }
    .text-excel {
        color: var(--excel-green) !important;
    }
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

// Make all modal functions available globally
window.closePostModal = closePostModal;
window.toggleFullscreen = toggleFullscreen;
window.printPost = printPost;
window.sharePost = sharePost;
window.copyPostLink = copyPostLink;
window.downloadPostAsPDF = downloadPostAsPDF;

window.scrollToTop = scrollToTop;



// Make functions available globally
window.viewPost = viewPost;
window.applyThemePreset = applyThemePreset;
window.applyCustomTheme = applyCustomTheme;
window.resetToDefaultTheme = resetToDefaultTheme;