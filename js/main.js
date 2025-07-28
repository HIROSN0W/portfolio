// ダークモード切り替え機能
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        this.setTheme(this.theme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateToggleIcon();
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateToggleIcon() {
        const icon = this.themeToggle.querySelector('i');
        icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// プリローダー
class PreloaderManager {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.preloader.classList.add('hidden');
                setTimeout(() => {
                    this.preloader.style.display = 'none';
                }, 300);
            }, 500);
        });
    }
}

// スムーズスクロール
class SmoothScrollManager {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ヘッダーアニメーション
class HeaderManager {
    constructor() {
        this.header = document.querySelector('header');
        this.lastScrollY = 0;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleScroll() {
        const currentScrollY = window.scrollY;
        
        // ヘッダーの背景透明度とシャドウ
        if (currentScrollY > 50) {
            this.header.style.background = 'var(--header-bg)';
            this.header.style.backdropFilter = 'var(--header-backdrop)';
            this.header.style.boxShadow = 'var(--card-shadow)';
        } else {
            this.header.style.background = 'var(--header-bg)';
            this.header.style.backdropFilter = 'var(--header-backdrop)';
            this.header.style.boxShadow = 'none';
        }

        // アクティブセクションのハイライト
        this.updateActiveSection();
        
        this.lastScrollY = currentScrollY;
    }

    updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
}

// スキルバーアニメーション
class SkillAnimationManager {
    constructor() {
        this.skillLevels = document.querySelectorAll('.skill-level');
        this.animated = new Set(); // 既にアニメーションしたスキルを追跡
        this.init();
    }

    init() {
        console.log('スキルバー要素数:', this.skillLevels.length);
        
        // 初期状態でスキルバーの幅を0に設定
        this.skillLevels.forEach((level, index) => {
            level.style.width = '0%';
            level.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            console.log(`スキル ${index}: data-width=${level.getAttribute('data-width')}`);
        });

        // より低いthresholdで確実に発火させる
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated.has(entry.target)) {
                    console.log('スキルバーアニメーション開始:', entry.target);
                    this.animateSkillBar(entry.target);
                    this.animated.add(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -10px 0px'
        });

        this.skillLevels.forEach(level => {
            observer.observe(level);
        });

        // フォールバック: 3秒後に強制的にアニメーション実行
        setTimeout(() => {
            this.skillLevels.forEach(level => {
                if (!this.animated.has(level)) {
                    console.log('フォールバックアニメーション実行:', level);
                    this.animateSkillBar(level);
                    this.animated.add(level);
                }
            });
        }, 3000);
    }

    animateSkillBar(element) {
        const targetWidth = element.getAttribute('data-width');
        console.log('アニメーション実行:', element, 'target:', targetWidth);
        
        if (targetWidth) {
            setTimeout(() => {
                element.style.width = targetWidth + '%';
                console.log('幅設定完了:', element.style.width);
            }, 300);
        }
    }
}

// 要素のフェードインアニメーション
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // アニメーション対象の要素を選択
        const animateElements = document.querySelectorAll('.section-title, .project-card, .skill-category, .about-text');
        animateElements.forEach(el => observer.observe(el));
    }
}

// モバイルメニュー管理
class MobileMenuManager {
    constructor() {
        this.menuToggle = document.getElementById('mobileMenuToggle');
        this.nav = document.querySelector('nav');
        this.navLinks = document.querySelectorAll('nav ul li a');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMenu());
            
            // メニューリンクをクリックしたらメニューを閉じる
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
            
            // 画面サイズが変更されたらメニューを閉じる
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.closeMenu();
                }
            });
        }
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.updateMenu();
    }

    closeMenu() {
        this.isOpen = false;
        this.updateMenu();
    }

    updateMenu() {
        if (this.isOpen) {
            this.menuToggle.classList.add('open');
            this.nav.classList.add('open');
            document.body.style.overflow = 'hidden'; // スクロールを無効化
        } else {
            this.menuToggle.classList.remove('open');
            this.nav.classList.remove('open');
            document.body.style.overflow = ''; // スクロールを有効化
        }
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new PreloaderManager();
    new SmoothScrollManager();
    new HeaderManager();
    new SkillAnimationManager();
    new AnimationManager();
    new MobileMenuManager();
    
    // デバッグ用: スキルバーを手動でテストする関数をグローバルに追加
    window.testSkillBars = () => {
        document.querySelectorAll('.skill-level').forEach(level => {
            const targetWidth = level.getAttribute('data-width');
            if (targetWidth) {
                level.style.width = targetWidth + '%';
                console.log('手動テスト:', level, targetWidth + '%');
            }
        });
    };
    
    console.log('ポートフォリオサイト初期化完了');
    console.log('デバッグ用: コンソールで testSkillBars() を実行してスキルバーをテストできます');
});
