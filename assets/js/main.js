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
            // クリック対象をヘッダー全体にする
            const expandButton = updateHistory.querySelector('.update-header');
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
        const bannerCards = document.querySelectorAll('.banner-card');
        
        if (novelCards.length === 0 && bannerCards.length === 0) return;

        const apiKey = window.GHOST_API_KEY;
        const apiURL = window.location.origin;

        // 連載中の小説データ取得
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

        // 完結作品のデータ取得
        bannerCards.forEach(card => {
            const metaEl = card.querySelector('.banner-card-meta');
            if (!metaEl) return;

            // data-tagsから全タグを取得し、complete以外の最初のタグを見つける
            const tagsData = metaEl.dataset.tags;
            if (!tagsData || !apiKey) return;
            
            const tags = tagsData.split(',');
            const uniqueTag = tags.find(tag => tag !== 'complete');
            
            if (!uniqueTag) return;

            const url = `${apiURL}/ghost/api/content/posts/?key=${apiKey}&filter=tag:${uniqueTag}&limit=1&order=published_at%20desc&fields=published_at`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    const totalPosts = data.meta.pagination.total;
                    let completedDateText = '完結';
                    
                    if (data.posts.length > 0) {
                        const lastPostDate = new Date(data.posts[0].published_at);
                        completedDateText = `${lastPostDate.getFullYear()}年${lastPostDate.getMonth() + 1}月完結`;
                    }
                    
                    metaEl.innerHTML = `全${totalPosts}話 / ${completedDateText}`;
                })
                .catch(error => {
                    console.error('Error fetching completed novel data:', error);
                    metaEl.innerHTML = '情報取得エラー';
                });
        });
    };

    /**
     * アートギャラリーのフィルタリング機能 (ライブラリ不要版)
     */
    const initArtGallery = () => {
        const filterButtonGroup = document.querySelector('.filter-button-group');
        const galleryItems = document.querySelectorAll('.gallery-item');

        // 要素がページに存在しない場合は何もしない
        if (!filterButtonGroup || galleryItems.length === 0) {
            return;
        }

        filterButtonGroup.addEventListener('click', (event) => {
            // クリックされたのがボタンでなければ処理を中断
            if (!event.target.matches('button.filter-button')) {
                return;
            }

            const clickedButton = event.target;
            const filterValue = clickedButton.getAttribute('data-filter');

            // 1. ボタンのアクティブ状態を切り替え
            // 既存のアクティブなボタンから 'is-checked' クラスを削除
            const currentCheckedButton = filterButtonGroup.querySelector('.is-checked');
            if (currentCheckedButton) {
                currentCheckedButton.classList.remove('is-checked');
            }
            // クリックされたボタンに 'is-checked' クラスを追加
            clickedButton.classList.add('is-checked');


            // 2. ギャラリーアイテムの表示・非表示を切り替え
            galleryItems.forEach(item => {
                // "すべて"が選択された場合、またはアイテムがフィルター条件に一致する場合
                if (filterValue === '*' || item.classList.contains(filterValue.substring(1))) {
                    item.classList.remove('hidden'); // 表示する
                } else {
                    item.classList.add('hidden');    // 非表示にする
                }
            });
        });
    };


   /**
     * ランダム記事セクションの機能（ミニマルデザイン版）
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

        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}.${month}.${day}`;
        };

        const renderPosts = () => {
            // ローディングメッセージをクリア
            listContainer.innerHTML = '';
            
            // ランダムに5つの記事を選択
            const random5Posts = shuffleArray([...allPosts]).slice(0, 5);

            random5Posts.forEach((post, index) => {
                const formattedDate = formatDate(post.published_at);
                
                // タグのHTML生成（最大2つまで表示、シンプルに）
                let tagsHTML = '';
                if (post.tags && post.tags.length > 0) {
                    const displayTags = post.tags.slice(0, 2);
                    tagsHTML = displayTags
                        .map(tag => `<span class="random-post-tag">${tag.name}</span>`)
                        .join('');
                }

                // 番号は01, 02形式で表示
                const numberDisplay = String(index + 1).padStart(2, '0');

                // シンプルなHTML構造
                const itemHTML = `
                    <a href="${post.url}" class="random-post-item">
                        <span class="random-post-number">${numberDisplay}</span>
                        <div class="random-post-content">
                            <h4 class="random-post-title">${post.title}</h4>
                            <div class="random-post-meta">
                                ${tagsHTML ? `<div class="random-post-tags">${tagsHTML}</div>` : ''}
                                ${tagsHTML ? '<span class="meta-separator">·</span>' : ''}
                                <time class="random-post-date">${formattedDate}</time>
                            </div>
                        </div>
                    </a>`;
                
                listContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        };

        const fetchAllPosts = () => {
            refreshButton.classList.add('is-loading');
            
            // ローディング中のメッセージ
            listContainer.innerHTML = '<p class="loading-message">記事を読み込んでいます...</p>';
            
            const url = `${apiURL}/ghost/api/content/posts/?key=${apiKey}&limit=all&include=tags`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.posts && data.posts.length > 0) {
                        allPosts = data.posts;
                        renderPosts();
                    } else {
                        listContainer.innerHTML = '<p class="loading-message">記事が見つかりませんでした。</p>';
                    }
                })
                .catch(error => {
                    console.error('Error fetching random posts:', error);
                    listContainer.innerHTML = '<p class="loading-message">記事の読み込みに失敗しました。</p>';
                })
                .finally(() => {
                    setTimeout(() => {
                        refreshButton.classList.remove('is-loading');
                    }, 300);
                });
        };

        // リフレッシュボタンのイベント
        refreshButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (!refreshButton.classList.contains('is-loading')) {
                // 既存の記事をフェードアウト
                const items = listContainer.querySelectorAll('.random-post-item');
                items.forEach((item, index) => {
                    item.style.transition = 'opacity 0.2s ease';
                    item.style.opacity = '0';
                });
                
                // 少し待ってから新しい記事を表示
                setTimeout(() => {
                    renderPosts();
                }, 200);
            }
        });

        // 初期読み込み
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