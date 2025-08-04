// ページのすべてのコンテンツが読み込まれてから一度だけ実行する
document.addEventListener('DOMContentLoaded', () => {

    /**
     * ヘッダーの機能
     * - フルスクリーンメニューの開閉
     * - テーマ（ナイトモード）の切り替え
     * - スクロール検知
     */
    const initHeader = () => {
        const menuToggleButton = document.querySelector('.menu-toggle-button');
        const fullscreenNav = document.querySelector('.fullscreen-nav-container');
        
        if (menuToggleButton && fullscreenNav) {
            menuToggleButton.addEventListener('click', () => {
                const isNavOpen = document.body.classList.toggle('nav-is-open');
                fullscreenNav.classList.toggle('is-open');
                document.body.style.overflow = isNavOpen ? 'hidden' : '';
            });
        }

        const themeToggleButton = document.querySelector('.theme-toggle-button');
        if (themeToggleButton) {
            if (localStorage.getItem('theme') === 'dark') {
                document.body.classList.add('dark-mode');
            }
            themeToggleButton.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                if (document.body.classList.contains('dark-mode')) {
                    localStorage.setItem('theme', 'dark');
                } else {
                    localStorage.removeItem('theme');
                }
            });
        }
        
        const siteHeader = document.querySelector('.site-header');
        if(siteHeader) {
            window.addEventListener('scroll', () => {
                siteHeader.classList.toggle('scrolled', window.scrollY > 100);
            });
        }
    };

    /**
     * 更新履歴のアコーディオン機能
     */
    const initUpdateHistory = () => {
        const updateHistory = document.querySelector('.update-history');
        if (updateHistory) {
            const expandButton = updateHistory.querySelector('.expand-button');
            expandButton.addEventListener('click', () => {
                updateHistory.classList.toggle('active');
            });
        }
    };

    /**
     * スクロールインジケーターのクリック機能
     */
    const initScrollIndicator = () => {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            });
        }
    };

    /**
     * ピックアップセクションのカルーセル機能
     */
    const initCarouselReimagined = () => {
        const container = document.querySelector('.carousel-container');
        if (!container) return;

        const track = container.querySelector('.carousel-track');
        const items = container.querySelectorAll('.carousel-item');
        const nextBtn = container.querySelector('#carousel-next');
        const prevBtn = container.querySelector('#carousel-prev');
        const indicatorsContainer = container.querySelector('.carousel-indicators');
        const infoDisplay = container.querySelector('.carousel-info-display');
        
        if (!track || !infoDisplay || items.length === 0) {
            const pickupSection = document.querySelector('.pickup-section');
            if (pickupSection) pickupSection.style.display = 'none';
            return;
        }
        
        const infoTitle = infoDisplay.querySelector('.info-title');
        const infoTag = infoDisplay.querySelector('.info-tag');
        const infoDate = infoDisplay.querySelector('.info-date');
        let currentIndex = 0;
        const totalItems = items.length;

        if (totalItems <= 1) {
            if(nextBtn) nextBtn.style.display = 'none';
            if(prevBtn) prevBtn.style.display = 'none';
            if(indicatorsContainer) indicatorsContainer.style.display = 'none';
        } else {
            for (let i = 0; i < totalItems; i++) {
                const bar = document.createElement('div');
                bar.classList.add('indicator-bar');
                indicatorsContainer.appendChild(bar);
                bar.addEventListener('click', () => {
                    if (i === currentIndex) return;
                    currentIndex = i;
                    updateCarousel();
                });
            }
        }
        
        const indicators = indicatorsContainer.querySelectorAll('.indicator-bar');

        const updateCarousel = (instant = false) => {
            const activeItem = items[currentIndex];
            
            if (instant) track.style.transition = 'none';
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            if (instant) track.offsetHeight;
            track.style.transition = '';

            if(indicators.length > 0) {
                indicators.forEach((bar, index) => {
                    bar.classList.toggle('active', index === currentIndex);
                });
            }

            infoDisplay.classList.add('is-updating');
            setTimeout(() => {
                const data = activeItem.dataset;
                infoTitle.textContent = data.title || '';
                infoDate.textContent = data.date || '';
                infoDate.setAttribute('datetime', data.datetime || '');
                
                if (data.tag && data.tag !== "null") {
                    infoTag.textContent = data.tag;
                    infoTag.style.display = 'inline-block';
                } else {
                    infoTag.style.display = 'none';
                }
                
                infoDisplay.href = data.url || '#';
                infoDisplay.classList.remove('is-updating');
            }, 200);
        };

        const checkImageRatios = () => {
            const SIXTEEN_NINE = 16 / 9;
            items.forEach(item => {
                const img = item.querySelector('.carousel-item__image');
                if (!img) return;
                const check = () => {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    if (ratio < SIXTEEN_NINE * 0.98) {
                        item.classList.add('is-vertical');
                    }
                };
                if (img.complete) check();
                else img.onload = check;
            });
        };
        
        if(nextBtn) nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        });

        if(prevBtn) prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            updateCarousel();
        });

        let isDragging = false, startPos = 0, currentTranslate = 0, prevTranslate = 0;
        const getPositionX = e => e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        
        const dragStart = (e) => {
            isDragging = true;
            startPos = getPositionX(e);
            prevTranslate = -currentIndex * track.offsetWidth;
            track.style.transition = 'none';
        };

        const dragMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + currentPosition - startPos;
            track.style.transform = `translateX(${currentTranslate}px)`;
        };

        const dragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            const movedBy = currentTranslate - prevTranslate;
            
            if (movedBy < -50 && currentIndex < totalItems - 1) currentIndex++;
            if (movedBy > 50 && currentIndex > 0) currentIndex--;

            updateCarousel();
        };

        track.addEventListener('mousedown', dragStart);
        track.addEventListener('touchstart', dragStart, { passive: true });
        track.addEventListener('mousemove', dragMove);
        track.addEventListener('touchmove', dragMove, { passive: true });
        document.addEventListener('mouseup', dragEnd);
        track.addEventListener('mouseleave', dragEnd);
        track.addEventListener('touchend', dragEnd);
        track.addEventListener('dragstart', e => e.preventDefault());

        window.addEventListener('resize', () => updateCarousel(true));
        
        updateCarousel();
        checkImageRatios();
    };

    /**
     * 連載小説の話数と最終更新日をAPIで取得
     */
    const fetchNovelData = () => {
        const novelCards = document.querySelectorAll('.novel-card');
        if (novelCards.length === 0) return;

        const apiKey = window.GHOST_API_KEY;
        const apiURL = window.location.origin;

        novelCards.forEach(card => {
            const lastUpdatedEl = card.querySelector('.novel-last-updated');
            const chapterCountEl = card.querySelector('.novel-chapter-count');
            
            const tagSlug = lastUpdatedEl ? lastUpdatedEl.dataset.tagSlug : null;

            if (!tagSlug || !apiKey || !chapterCountEl) return;

            const url = `${apiURL}/ghost/api/content/posts/?key=${apiKey}&filter=tag:${tagSlug}&limit=1&order=published_at%20desc&fields=published_at`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    const totalPosts = data.meta.pagination.total;
                    chapterCountEl.innerHTML = `<i class="icon-book"></i> 全${totalPosts}話`;
                    if (data.posts.length > 0) {
                        const lastPostDate = new Date(data.posts[0].published_at);
                        const formattedDate = `${lastPostDate.getFullYear()}年${lastPostDate.getMonth() + 1}月${lastPostDate.getDate()}日`;
                        lastUpdatedEl.innerHTML = `<i class="icon-clock"></i> 最終更新: ${formattedDate}`;
                    } else {
                        lastUpdatedEl.innerHTML = `<i class="icon-clock"></i> 更新情報なし`;
                    }
                })
                .catch(error => {
                    console.error('Error fetching novel data:', error);
                    if(lastUpdatedEl) lastUpdatedEl.innerHTML = `<i class="icon-clock"></i> 情報取得エラー`;
                    if(chapterCountEl) chapterCountEl.innerHTML = `<i class="icon-book"></i> 情報取得エラー`;
                });
        });
    };

    /**
     * アートギャラリーのMasonry & Isotope機能
     */
    const initArtGallery = () => {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid || typeof imagesLoaded === 'undefined' || typeof Isotope === 'undefined') return;

        imagesLoaded(galleryGrid, function() {
            const iso = new Isotope(galleryGrid, {
                itemSelector: '.gallery-item',
                layoutMode: 'masonry',
                masonry: { gutter: 15, fitWidth: true }
            });

            const filterButtonGroup = document.querySelector('.filter-button-group');
            if (filterButtonGroup) {
                filterButtonGroup.addEventListener('click', function(event) {
                    if (!event.target.matches('button')) return;
                    const filterValue = event.target.getAttribute('data-filter');
                    iso.arrange({ filter: filterValue });
                    filterButtonGroup.querySelector('.is-checked').classList.remove('is-checked');
                    event.target.classList.add('is-checked');
                });
            }
        });
    };

    /**
     * ランダム記事セクションの機能
     */
    const initRandomPosts = () => {
        const section = document.querySelector('.random-posts-section');
        if (!section) return;

        const listContainer = section.querySelector('.random-posts-list');
        const refreshButton = section.querySelector('.refresh-button');
        const apiKey = window.GHOST_API_KEY;
        const apiURL = window.location.origin;
        if (!listContainer || !refreshButton || !apiKey) return;

        let allPosts = [];

        const tagStyles = {
            'default': { icon: 'fas fa-feather-alt', color: '#8e44ad' },
            'ramble': { icon: 'fas fa-feather-alt', color: '#8e44ad' },
            'review': { icon: 'fas fa-book-open', color: '#27ae60' },
            'art': { icon: 'fas fa-palette', color: '#2980b9' },
            'movie': { icon: 'fas fa-film', color: '#f39c12' }
        };

        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const renderPosts = () => {
            listContainer.innerHTML = '';
            const random5Posts = shuffleArray([...allPosts]).slice(0, 5);

            random5Posts.forEach(post => {
                const postDate = new Date(post.published_at);
                const formattedDate = `${postDate.getFullYear()}年${postDate.getMonth() + 1}月${postDate.getDate()}日`;
                const primaryTagSlug = post.primary_tag ? post.primary_tag.slug : 'default';
                const style = tagStyles[primaryTagSlug] || tagStyles['default'];
                
                let tagsHTML = '';
                if (post.tags) {
                    post.tags.forEach(tag => {
                        const tagStyle = tagStyles[tag.slug] || tagStyles['default'];
                        tagsHTML += `<span class="random-post-tag" style="background-color: ${tagStyle.color};">${tag.name}</span>`;
                    });
                }

                const itemHTML = `
                    <a href="${post.url}" class="random-post-item">
                        <div class="random-post-icon" style="background-color: ${style.color};"><i class="${style.icon}"></i></div>
                        <div class="random-post-content">
                            <h4 class="random-post-title">${post.title}</h4>
                            <div class="random-post-tags">${tagsHTML}</div>
                        </div>
                        <time class="random-post-date">${formattedDate}</time>
                    </a>`;
                listContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        };

        const fetchAllPosts = () => {
            refreshButton.classList.add('is-loading');
            const url = `${apiURL}/ghost/api/content/posts/?key=${apiKey}&limit=all&include=tags`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    allPosts = data.posts;
                    renderPosts();
                })
                .catch(error => console.error('Error fetching random posts:', error))
                .finally(() => refreshButton.classList.remove('is-loading'));
        };

        refreshButton.addEventListener('click', renderPosts);
        fetchAllPosts();
    };

    // --- すべての初期化関数を実行 ---
    initHeader();
    initUpdateHistory();
    initScrollIndicator();
    initCarouselReimagined();
    fetchNovelData();
    initArtGallery();
    initRandomPosts();
});
