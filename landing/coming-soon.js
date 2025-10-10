window.addEventListener('DOMContentLoaded', () => {
    const updateProgressCircle = () => {
        const svg = document.querySelector('.progress-ring');
        const bgCircle = document.querySelector('.progress-ring-circle-bg');
        const progressCircle = document.querySelector('.progress-ring-circle');
        
        if (window.innerWidth <= 480) {
            const radius = 70;
            const circumference = 2 * Math.PI * radius;
            const dashOffset = circumference * 0.25;
            
            svg.setAttribute('width', '160');
            svg.setAttribute('height', '160');
            bgCircle.setAttribute('cx', '80');
            bgCircle.setAttribute('cy', '80');
            bgCircle.setAttribute('r', radius);
            progressCircle.setAttribute('cx', '80');
            progressCircle.setAttribute('cy', '80');
            progressCircle.setAttribute('r', radius);
            progressCircle.setAttribute('stroke-dasharray', circumference);
            progressCircle.setAttribute('stroke-dashoffset', dashOffset);
        } else {
            const radius = 90;
            const circumference = 2 * Math.PI * radius;
            const dashOffset = circumference * 0.25;
            
            svg.setAttribute('width', '200');
            svg.setAttribute('height', '200');
            bgCircle.setAttribute('cx', '100');
            bgCircle.setAttribute('cy', '100');
            bgCircle.setAttribute('r', radius);
            progressCircle.setAttribute('cx', '100');
            progressCircle.setAttribute('cy', '100');
            progressCircle.setAttribute('r', radius);
            progressCircle.setAttribute('stroke-dasharray', circumference);
            progressCircle.setAttribute('stroke-dashoffset', dashOffset);
        }
    };
    
    updateProgressCircle();
    window.addEventListener('resize', updateProgressCircle);
});

const notifyForm = document.getElementById('notifyForm');
if (notifyForm) {
    notifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('.email-input').value;
        
        const btn = e.target.querySelector('.notify-btn');
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = '<span>Sending...</span>';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = '<span>✓ Subscribed!</span>';
            btn.style.background = '#10b981';
            btn.style.borderColor = '#10b981';
            
            setTimeout(() => {
                e.target.reset();
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.borderColor = '';
            }, 3000);
        }, 1500);
    });
}

const animatePercentage = () => {
    const percentageEl = document.querySelector('.progress-percentage');
    if (!percentageEl) return;
    
    let current = 0;
    const target = 75;
    const duration = 2000;
    const increment = target / (duration / 16);
    
    const animate = () => {
        current += increment;
        if (current < target) {
            percentageEl.textContent = Math.round(current) + '%';
            requestAnimationFrame(animate);
        } else {
            percentageEl.textContent = target + '%';
        }
    };
    
    setTimeout(animate, 1000);
};

animatePercentage();

document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.gradient-orb');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 15;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        orb.style.transform = `translate(${x}px, ${y}px)`;
    });
});

console.log('%c🚀 Flomark - Coming Soon', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; color: transparent;');
console.log('%cBuilt with ❤️ by Nick', 'font-size: 14px; color: #9ca3af;');
