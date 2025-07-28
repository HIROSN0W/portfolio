// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70,  // ヘッダーの高さを考慮
                behavior: 'smooth'
            });
        }
    });
});

// ヘッダーのスクロールアニメーション
const header = document.querySelector('header');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
    
    lastScrollY = currentScrollY;
});

// フォームのバリデーションとサブミット
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 簡易的なバリデーション
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        let isValid = true;
        
        if (!name.value.trim()) {
            alert('お名前を入力してください');
            isValid = false;
        }
        
        if (!email.value.trim() || !isValidEmail(email.value)) {
            alert('有効なメールアドレスを入力してください');
            isValid = false;
        }
        
        if (!message.value.trim()) {
            alert('メッセージを入力してください');
            isValid = false;
        }
        
        if (isValid) {
            // 本番環境では実際のフォーム送信処理をここに実装
            alert('メッセージが送信されました！（デモのため、実際には送信されていません）');
            contactForm.reset();
        }
    });
}

// メールアドレスの簡易検証
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// アニメーション効果
document.addEventListener('DOMContentLoaded', () => {
    // スキルバーのアニメーション
    const skillLevels = document.querySelectorAll('.skill-level');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 要素が表示されたらアニメーションのクラスを追加
                entry.target.style.width = entry.target.style.width;
                observer.unobserve(entry.target);
            }
        });
    });
    
    skillLevels.forEach(level => {
        // 初期状態では幅を0に設定
        const width = level.style.width;
        level.style.width = '0';
        
        // 少し遅延させてから元の幅に戻す（アニメーション効果）
        setTimeout(() => {
            level.style.transition = 'width 1s ease';
            level.style.width = width;
        }, 300);
        
        observer.observe(level);
    });
});
