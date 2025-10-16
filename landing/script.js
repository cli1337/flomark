// Helper function for counter animation
const animateCounter = (element, target, duration = 2000) => {
    let current = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.ceil(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // ======================
    // MOBILE MENU
    // ======================
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navActions.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // ======================
    // SMOOTH SCROLL
    // ======================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#demo') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    // Close mobile menu if open
                    if (navLinks) navLinks.classList.remove('active');
                    if (navActions) navActions.classList.remove('active');
                    if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
                    
                    // Smooth scroll to target
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ======================
    // NAVBAR SCROLL EFFECT
    // ======================
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    const navWrapper = document.querySelector('.nav-wrapper');

    if (navWrapper) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                navWrapper.style.background = 'rgba(255, 255, 255, 0.08)';
                navWrapper.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            } else {
                navWrapper.style.background = 'rgba(255, 255, 255, 0.05)';
                navWrapper.style.boxShadow = 'none';
            }
            
            lastScroll = currentScroll;
        });
    }

    // ======================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // ======================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .benefit-item, .tech-category, .stats-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ======================
    // STATS COUNTER ANIMATION
    // ======================
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const valueElement = entry.target.querySelector('.stats-value');
                if (valueElement && !isNaN(parseInt(valueElement.textContent))) {
                    const target = parseInt(valueElement.textContent);
                    valueElement.textContent = '0';
                    setTimeout(() => animateCounter(valueElement, target), 200);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stats-item').forEach(stat => {
        statsObserver.observe(stat);
    });

    // ======================
    // PROGRESS BAR ANIMATION
    // ======================
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const fill = entry.target.querySelector('.progress-fill');
                if (fill) {
                    const width = fill.style.width;
                    fill.style.width = '0';
                    setTimeout(() => {
                        fill.style.width = width;
                    }, 200);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.progress-bar').forEach(bar => {
        progressObserver.observe(bar);
    });

    // ======================
    // GRADIENT ORBS MOUSE EFFECT
    // ======================
    window.addEventListener('mousemove', (e) => {
        const orbs = document.querySelectorAll('.gradient-orb');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    // ======================
    // BROWSER MOCKUP HOVER
    // ======================
    const browserMockup = document.querySelector('.browser-mockup');
    if (browserMockup) {
        browserMockup.addEventListener('mouseenter', () => {
            browserMockup.style.transform = 'translateY(-4px)';
        });
        
        browserMockup.addEventListener('mouseleave', () => {
            browserMockup.style.transform = 'translateY(0)';
        });
    }

    // ======================
    // KANBAN CARDS ANIMATION
    // ======================
    const kanbanCards = document.querySelectorAll('.kanban-card');
    kanbanCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // ======================
    // INSTALLATION TABS
    // ======================
    const installTabs = document.querySelectorAll('.install-tab');
    const installContents = document.querySelectorAll('.install-content');

    installTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active from all tabs and contents
            installTabs.forEach(t => t.classList.remove('active'));
            installContents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-install`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // ======================
    // WEB SERVER TABS (MANUAL INSTALLATION)
    // ======================
    const serverTabs = document.querySelectorAll('.server-tab');
    const serverConfigs = document.querySelectorAll('.server-config');

    serverTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetServer = tab.dataset.server;
            
            // Remove active from all tabs and configs
            serverTabs.forEach(t => t.classList.remove('active'));
            serverConfigs.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked tab and corresponding config
            tab.classList.add('active');
            const targetConfig = document.getElementById(targetServer);
            if (targetConfig) {
                targetConfig.classList.add('active');
            }
        });
    });

    // ======================
    // COPY TO CLIPBOARD
    // ======================
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.dataset.copy.replace(/&#10;/g, '\n');
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                
                // Visual feedback
                const originalHTML = btn.innerHTML;
                btn.classList.add('copied');
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l4 4L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Copied!
                `;
                
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = originalHTML;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });

    // ======================
    // PAGE FADE IN
    // ======================
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // ======================
    // CONSOLE MESSAGES
    // ======================
    console.log('%c🚀 Flomark Landing Page', 'font-size: 20px; font-weight: bold; color: #6366f1;');
    console.log('%cBuilt with ❤️ by Nick', 'font-size: 14px; color: #9ca3af;');
});

// ======================
// KONAMI CODE EASTER EGG
// ======================
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Add rainbow animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ======================
// PAGE LOAD COMPLETE
// ======================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
