// ============================================
// TechFlow SaaS — Frontend JavaScript
// ============================================

const API_BASE = '/api';

// ===== API Utility =====
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('techflow_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, ...data };
  }

  return data;
}

// ============================================
// AUTH MODULE
// ============================================
const Auth = {
  token: localStorage.getItem('techflow_token'),
  user: JSON.parse(localStorage.getItem('techflow_user') || 'null'),

  isLoggedIn() {
    return !!this.token;
  },

  save(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('techflow_token', token);
    localStorage.setItem('techflow_user', JSON.stringify(user));
  },

  clear() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('techflow_token');
    localStorage.removeItem('techflow_user');
  },

  async register(name, email, password) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.save(data.token, data.user);
    return data;
  },

  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.save(data.token, data.user);
    return data;
  },

  logout() {
    this.clear();
    updateNavbar();
    showNotification('Logged out successfully!');
  },

  async checkAuth() {
    if (!this.token) return false;
    try {
      const data = await apiFetch('/auth/me');
      this.user = data.user;
      localStorage.setItem('techflow_user', JSON.stringify(data.user));
      return true;
    } catch {
      this.clear();
      return false;
    }
  },
};

// ============================================
// NAVBAR STATE
// ============================================
function updateNavbar() {
  const authButtons = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');

  if (Auth.isLoggedIn()) {
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
  } else {
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
  }
}

// ============================================
// AUTH MODAL
// ============================================
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const modalClose = document.getElementById('modalClose');

function openModal(formType) {
  if (!authModal) return;
  if (formType === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
  authModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!authModal) return;
  authModal.classList.remove('active');
  document.body.style.overflow = '';
  // Clear form errors
  document.querySelectorAll('.form-error').forEach((el) => {
    el.classList.remove('visible');
  });
}

// Modal event listeners
if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}
if (authModal) {
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
  });
}

// Switch between login/signup
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
if (switchToSignup) {
  switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('signup');
  });
}
if (switchToLogin) {
  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('login');
  });
}

// Nav auth buttons
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');

if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal('login');
  });
}
if (signupBtn) {
  signupBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal('signup');
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    Auth.logout();
  });
}

// Show form error helper
function showFormError(formEl, message) {
  let errorDiv = formEl.querySelector('.form-error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    formEl.insertBefore(errorDiv, formEl.firstChild);
  }
  errorDiv.textContent = message;
  errorDiv.classList.add('visible');
}

// ===== Login Form Submit =====
const loginFormEl = document.getElementById('loginFormEl');
if (loginFormEl) {
  loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginSubmit');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Logging in...';

    try {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      await Auth.login(email, password);
      closeModal();
      updateNavbar();
      showNotification(`Welcome back, ${Auth.user.name}!`);
      loginFormEl.reset();
    } catch (err) {
      showFormError(loginFormEl, err.message || 'Login failed. Please try again.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

// ===== Signup Form Submit =====
const signupFormEl = document.getElementById('signupFormEl');
if (signupFormEl) {
  signupFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('signupSubmit');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Creating account...';

    try {
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      await Auth.register(name, email, password);
      closeModal();
      updateNavbar();
      showNotification(`Welcome to TechFlow, ${Auth.user.name}!`);
      signupFormEl.reset();
    } catch (err) {
      const msg =
        err.errors && err.errors.length > 0
          ? err.errors[0].msg
          : err.message || 'Signup failed. Please try again.';
      showFormError(signupFormEl, msg);
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

// ============================================
// RAZORPAY CHECKOUT
// ============================================
function handlePlanSelect(button) {
  const plan = button.dataset.plan;

  // Enterprise → contact sales
  if (plan === 'enterprise') {
    showNotification('Connecting you with our sales team...');
    return;
  }

  // Must be logged in to purchase
  if (!Auth.isLoggedIn()) {
    openModal('signup');
    showNotification('Please create an account first to subscribe.');
    return;
  }

  // Determine billing cycle
  const billingToggle = document.getElementById('billingToggle');
  const billingCycle = billingToggle && billingToggle.checked ? 'yearly' : 'monthly';

  initiatePayment(plan, billingCycle);
}

async function initiatePayment(plan, billingCycle) {
  try {
    showNotification('Creating payment order...');

    const data = await apiFetch('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan, billingCycle }),
    });

    const options = {
      key: data.key,
      amount: data.order.amount,
      currency: data.order.currency,
      name: 'TechFlow',
      description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — ${billingCycle}`,
      order_id: data.order.id,
      handler: async function (response) {
        try {
          const verifyData = await apiFetch('/payments/verify', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          showNotification(verifyData.message || 'Payment successful! Plan upgraded.');
          // Update local user data
          Auth.user.plan = plan;
          localStorage.setItem('techflow_user', JSON.stringify(Auth.user));
        } catch (err) {
          showNotification('Payment verification failed. Contact support.');
        }
      },
      prefill: {
        name: Auth.user?.name || '',
        email: Auth.user?.email || '',
      },
      theme: {
        color: '#635BFF',
      },
      modal: {
        ondismiss: function () {
          showNotification('Payment cancelled.');
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      showNotification('Payment failed: ' + response.error.description);
    });
    rzp.open();
  } catch (err) {
    showNotification(err.message || 'Failed to create payment order.');
  }
}

// Make handlePlanSelect globally accessible (used in onclick)
window.handlePlanSelect = handlePlanSelect;

// ============================================
// DARK MODE TOGGLE
// ============================================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

const currentTheme = localStorage.getItem('theme') || 'light-mode';
htmlElement.classList.add(currentTheme);

if (themeToggle) {
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
}

// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});

// ============================================
// DYNAMIC PRICING TOGGLE
// ============================================
const billingToggle = document.getElementById('billingToggle');
const priceAmounts = document.querySelectorAll('.amount');

if (billingToggle) {
  billingToggle.addEventListener('change', () => {
    priceAmounts.forEach((amount) => {
      if (billingToggle.checked) {
        const yearly = parseInt(amount.dataset.yearly);
        amount.textContent = yearly;
      } else {
        const monthly = parseInt(amount.dataset.monthly);
        amount.textContent = monthly;
      }
    });
  });
}

// ============================================
// INTERACTIVE DEMO TABS
// ============================================
const demoBtns = document.querySelectorAll('.demo-btn');
const demoPanels = document.querySelectorAll('.demo-panel');

demoBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const demoType = btn.dataset.demo;
    demoBtns.forEach((b) => b.classList.remove('active'));
    demoPanels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(demoType).classList.add('active');
  });
});

// ============================================
// COPY TO CLIPBOARD
// ============================================
const copyBtns = document.querySelectorAll('.copy-btn');

copyBtns.forEach((btn) => {
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

// ============================================
// GSAP SCROLL ANIMATIONS
// ============================================
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    gsap.fromTo(
      '.product-preview',
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top center',
          end: 'bottom center',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  const bentoItems = document.querySelectorAll('.bento-item');
  bentoItems.forEach((item, index) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  const pricingCards = document.querySelectorAll('.pricing-card');
  pricingCards.forEach((card, index) => {
    gsap.fromTo(
      card,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: index * 0.15,
        ease: 'back.out',
        scrollTrigger: {
          trigger: '.pricing',
          start: 'top center',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  const testimonialCards = document.querySelectorAll('.testimonial-card');
  testimonialCards.forEach((card, index) => {
    gsap.fromTo(
      card,
      { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  const trustItems = document.querySelectorAll('.trust-item');
  trustItems.forEach((item, index) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: index * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.trust-signals',
          start: 'top center',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  gsap.fromTo(
    '.final-cta',
    { opacity: 0, scale: 0.95 },
    {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.final-cta',
        start: 'top center',
        toggleActions: 'play none none none',
      },
    }
  );
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColor =
    type === 'error'
      ? 'linear-gradient(135deg, #DC2626, #F43F5E)'
      : type === 'success'
        ? 'linear-gradient(135deg, #059669, #10B981)'
        : 'linear-gradient(135deg, #4F46E5, #EC4899)';

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
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

// ============================================
// NOTIFICATION KEYFRAMES
// ============================================
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

// ============================================
// NAVIGATION ACTIVE STATE ON SCROLL
// ============================================
window.addEventListener('scroll', () => {
  let current = '';
  const sections = document.querySelectorAll('section[id]');
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('active');
    }
  });
});

// ============================================
// CTA BUTTON HANDLERS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Handle hero & CTA button clicks (non-pricing)
  const heroBtns = document.querySelectorAll('.hero-buttons .btn, .cta-buttons .btn');
  heroBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const btnText = btn.textContent.toLowerCase();

      if (btnText.includes('trial')) {
        if (Auth.isLoggedIn()) {
          window.location.href = '/dashboard';
        } else {
          openModal('signup');
        }
      } else if (btnText.includes('demo')) {
        showNotification('Scheduling a demo with our team...');
      }
    });
  });
});

// ============================================
// LAZY LOADING
// ============================================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 's') {
    document.querySelector('.hero')?.focus();
  }
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
  if (e.key === 'Escape') {
    closeModal();
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

const keyboardStyle = document.createElement('style');
keyboardStyle.textContent = `
  body.keyboard-nav button:focus,
  body.keyboard-nav a:focus {
    outline: 2px solid #4F46E5;
    outline-offset: 2px;
  }
`;
document.head.appendChild(keyboardStyle);

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('TechFlow SaaS website loaded successfully');

  // Check auth state and update navbar
  updateNavbar();
  if (Auth.isLoggedIn()) {
    await Auth.checkAuth();
    updateNavbar();
  }
});
