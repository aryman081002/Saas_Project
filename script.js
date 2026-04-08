// ===== Dark Mode Toggle =====
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light-mode';
htmlElement.classList.add(currentTheme);

themeToggle.addEventListener('click', () => {
    if (htmlElement.classList.contains('dark-mode')) {
        htmlElement.classList.remove('dark-mode');
        htmlElement.classList.add('light-mode');
        localStorage.setItem('theme', 'light-mode');
    } else {
        htmlElement.classList.add('dark-mode');
        htmlElement.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark-mode');
    }
});

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Dynamic Pricing Toggle =====
const billingToggle = document.getElementById('billingToggle');
const priceAmounts = document.querySelectorAll('.amount');

billingToggle.addEventListener('change', () => {
    priceAmounts.forEach(amount => {
        if (billingToggle.checked) {
            // Yearly pricing
            const yearly = parseInt(amount.dataset.yearly);
            amount.textContent = yearly;
        } else {
            // Monthly pricing
            const monthly = parseInt(amount.dataset.monthly);
            amount.textContent = monthly;
        }
    });
});

// ===== Interactive Demo Tabs =====
const demoBtns = document.querySelectorAll('.demo-btn');
const demoPanels = document.querySelectorAll('.demo-panel');

demoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const demoType = btn.dataset.demo;

        // Remove active class from all buttons and panels
        demoBtns.forEach(b => b.classList.remove('active'));
        demoPanels.forEach(p => p.classList.remove('active'));

        // Add active class to clicked button and corresponding panel
        btn.classList.add('active');
        document.getElementById(demoType).classList.add('active');
    });
});

// ===== Copy to Clipboard Functionality =====
const copyBtns = document.querySelectorAll('.copy-btn');

copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const codeBlock = btn.closest('.code-block');
        const code = codeBlock.querySelector('code').textContent;

        navigator.clipboard.writeText(code).then(() => {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    });
});

// ===== Initialize GSAP ScrollTrigger =====
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Section Scroll Animation
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        gsap.fromTo(
            '.product-preview',
            {
                opacity: 0,
                y: 100
            },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top center',
                    end: 'bottom center',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // Bento Grid Items Animation
    const bentoItems = document.querySelectorAll('.bento-item');
    bentoItems.forEach((item, index) => {
        gsap.fromTo(
            item,
            {
                opacity: 0,
                y: 50
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Pricing Cards Animation
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach((card, index) => {
        gsap.fromTo(
            card,
            {
                opacity: 0,
                scale: 0.9
            },
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                delay: index * 0.15,
                ease: 'back.out',
                scrollTrigger: {
                    trigger: '.pricing',
                    start: 'top center',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Testimonial Cards Animation
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        gsap.fromTo(
            card,
            {
                opacity: 0,
                x: index % 2 === 0 ? -50 : 50
            },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Trust Signals Animation
    const trustItems = document.querySelectorAll('.trust-item');
    trustItems.forEach((item, index) => {
        gsap.fromTo(
            item,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
                delay: index * 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.trust-signals',
                    start: 'top center',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Final CTA Animation
    gsap.fromTo(
        '.final-cta',
        {
            opacity: 0,
            scale: 0.95
        },
        {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.final-cta',
                start: 'top center',
                toggleActions: 'play none none none'
            }
        }
    );
}

// ===== Performance Monitoring (Real-time stats) =====
function updateRealTimeStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    // Simulate real-time data updates
    setInterval(() => {
        stats.forEach((stat, index) => {
            // Don't update the displayed values, just keep them fresh
            // This is a placeholder for actual API data
        });
    }, 5000);
}

updateRealTimeStats();

// ===== Navigation Active State on Scroll =====
window.addEventListener('scroll', () => {
    let current = '';
    
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ===== Form Submission Handlers =====
document.addEventListener('DOMContentLoaded', () => {
    // Handle CTA button clicks
    const ctaBtns = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    ctaBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent default if it's a button
            if (btn.tagName === 'BUTTON') {
                e.preventDefault();
                
                const btnText = btn.textContent.toLowerCase();
                
                if (btnText.includes('trial')) {
                    showNotification('Redirecting to free trial signup...');
                    // window.location.href = '/signup';
                } else if (btnText.includes('demo')) {
                    showNotification('Scheduling a demo with our team...');
                    // window.location.href = '/schedule-demo';
                } else if (btnText.includes('started')) {
                    showNotification('Let\'s get you started!');
                    // window.location.href = '/get-started';
                } else if (btnText.includes('contact')) {
                    showNotification('Connecting you with our sales team...');
                    // window.location.href = '/contact-sales';
                }
            }
        });
    });
});

// ===== Notification System =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4F46E5, #EC4899);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== Animations for Notifications =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .nav-menu a.active {
        color: #4F46E5;
        border-bottom: 2px solid #4F46E5;
    }
`;
document.head.appendChild(style);

// ===== Lazy Loading for Images =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== Core Web Vitals Performance Monitoring =====
function monitorWebVitals() {
    if ('web-vital' in window) {
        // Largest Contentful Paint (LCP)
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log('LCP:', entry.renderTime || entry.loadTime);
            }
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log('FID:', entry.processingDuration);
            }
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
    }
}

monitorWebVitals();

// ===== Keyboard Navigation Support =====
document.addEventListener('keydown', (e) => {
    // Skip to main content (Alt + S)
    if (e.altKey && e.key === 's') {
        document.querySelector('.hero').focus();
    }

    // Tab navigation
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// ===== Add Keyboard Navigation Styles =====
const keyboardStyle = document.createElement('style');
keyboardStyle.textContent = `
    body.keyboard-nav button:focus,
    body.keyboard-nav a:focus {
        outline: 2px solid #4F46E5;
        outline-offset: 2px;
    }
`;
document.head.appendChild(keyboardStyle);

// ===== Initialize on Page Load =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('TechFlow SaaS website loaded successfully');
    console.log('Theme:', localStorage.getItem('theme') || 'light-mode');
});
