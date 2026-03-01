const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];

function init() {
    resize();
    createStars();
    animate();
    window.addEventListener('resize', resize);
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function createStars() {
    stars = [];
    const starCount = 260;

    for (let i = 0; i < starCount; i++) {
        const size = Math.random() < 0.75 ? 1 : 2;
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size,
            alpha: Math.random() * 0.6 + 0.25,
            speedY: Math.random() * 0.08 + 0.02,
            driftX: (Math.random() - 0.5) * 0.03
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw Stars
    stars.forEach(star => {
        const px = Math.floor(star.x);
        const py = Math.floor(star.y);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fillRect(px, py, star.size, star.size);

        // Slow pixel drift downward with slight horizontal movement.
        star.y += star.speedY;
        star.x += star.driftX;

        // Reset if out of bounds
        if (star.y > height) {
            star.y = -2;
            star.x = Math.random() * width;
        }
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;

        // Twinkle
        if (Math.random() > 0.997) {
            star.alpha = Math.random() * 0.6 + 0.25;
        }
    });

    requestAnimationFrame(animate);
}

// Fade In Observer for below-fold sections
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.below-fold').forEach(section => {
    observer.observe(section);
});

// Scroll arrow fade-out
const scrollArrow = document.getElementById('scroll-arrow');
if (scrollArrow) {
    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            scrollArrow.classList.add('hidden-arrow');
        } else {
            scrollArrow.classList.remove('hidden-arrow');
        }
    }, { passive: true });

    scrollArrow.addEventListener('click', function () {
        const firstSection = document.querySelector('.below-fold');
        if (firstSection) {
            firstSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Cosmic Date Simulation - NOW HANDLED BY UCPS_LOGIC.JS for the Main String
// This function now only updates the Earth-centric translation examples
function updateEarthTranslations() {
    // New Counters
    const valGregorian = document.getElementById('val-gregorian');
    const valHolocene = document.getElementById('val-holocene');
    const valChinese = document.getElementById('val-chinese');
    const valZodiac = document.getElementById('val-zodiac');
    const valCentralExample = document.getElementById('val-central-example');
    const counterPrimary = document.getElementById('true-date-counter-primary');
    const counterSecondary = document.getElementById('true-date-counter-secondary');
    const counterXYZ = document.getElementById('true-date-counter-xyz');

    const now = new Date();

    // Update Counters
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateStr = `${monthNames[now.getMonth()]} ${now.getDate()}`;
    const localTime = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    }).format(now);

    if (valGregorian) valGregorian.innerText = `${dateStr}, ${now.getFullYear()} AD`;
    if (valHolocene) valHolocene.innerText = `${dateStr}, ${now.getFullYear() + 10000} HE`;

    // Moon Phase Logic
    const valMoonText = document.getElementById('val-moon-text');
    const valMoonIcon = document.getElementById('val-moon-icon');

    if (valMoonText && valMoonIcon) {
        // Approximate Moon Phase
        const knownNewMoon = new Date('2000-01-06T18:14:00Z'); // Known new moon
        const cycleLength = 29.53058867 * 24 * 60 * 60 * 1000; // in ms
        const diff = now.getTime() - knownNewMoon.getTime();
        const phase = (diff % cycleLength) / cycleLength; // 0 to 1

        let phaseName = "";
        let phaseIcon = "";

        if (phase < 0.03 || phase > 0.97) { phaseName = "New Moon"; phaseIcon = "🌑"; }
        else if (phase < 0.25) { phaseName = "Waxing Crescent"; phaseIcon = "🌒"; }
        else if (phase < 0.28) { phaseName = "First Quarter"; phaseIcon = "🌓"; }
        else if (phase < 0.50) { phaseName = "Waxing Gibbous"; phaseIcon = "🌔"; }
        else if (phase < 0.53) { phaseName = "Full Moon"; phaseIcon = "🌕"; }
        else if (phase < 0.75) { phaseName = "Waning Gibbous"; phaseIcon = "🌖"; }
        else if (phase < 0.78) { phaseName = "Last Quarter"; phaseIcon = "🌗"; }
        else { phaseName = "Waning Crescent"; phaseIcon = "🌘"; }

        valMoonText.innerText = phaseName;
        valMoonIcon.innerText = phaseIcon;
    }

    // Simple Logic for Zodiacs
    if (valChinese) {
        const animals = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];
        valChinese.innerText = animals[now.getFullYear() % 12];
    }

    if (valZodiac) {
        // Simplified check found online or standard ranges
        const month = now.getMonth() + 1;
        const day = now.getDate();
        let sign = "Capricorn"; // Default Jan
        if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) sign = "Aquarius";
        else if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) sign = "Pisces";
        else if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) sign = "Aries";
        else if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) sign = "Taurus";
        else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) sign = "Gemini";
        else if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) sign = "Cancer";
        else if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) sign = "Leo";
        else if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) sign = "Virgo";
        else if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) sign = "Libra";
        else if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) sign = "Scorpio";
        else if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) sign = "Sagittarius";

        valZodiac.innerText = sign;
    }

    // --- New Date Logic ---

    // Mayan Long Count (Extended past 2012)
    // 13.0.0.0.0 was Dec 21, 2012
    const valMayan = document.getElementById('val-mayan');
    if (valMayan) {
        const mayanEpoch = new Date('2012-12-21T00:00:00Z').getTime();
        const diffDays = Math.floor((now.getTime() - mayanEpoch) / (1000 * 60 * 60 * 24));

        // 13.0.0.0.0 base
        let totalKin = (13 * 144000) + diffDays;

        const baktun = Math.floor(totalKin / 144000);
        let rem = totalKin % 144000;
        const katun = Math.floor(rem / 7200);
        rem = rem % 7200;
        const tun = Math.floor(rem / 360);
        rem = rem % 360;
        const uinal = Math.floor(rem / 20);
        const kin = rem % 20;

        valMayan.innerText = `${baktun}.${katun}.${tun}.${uinal}.${kin}`;
    }

    // Hebrew
    const valHebrew = document.getElementById('val-hebrew');
    if (valHebrew) {
        valHebrew.innerText = new Intl.DateTimeFormat('en-u-ca-hebrew', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(now);
    }

    // Islamic
    const valIslamic = document.getElementById('val-islamic');
    if (valIslamic) {
        valIslamic.innerText = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(now);
    }

    // Hindu
    const valHindu = document.getElementById('val-hindu');
    if (valHindu) {
        valHindu.innerText = new Intl.DateTimeFormat('en-u-ca-indian', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(now);
    }

    if (valCentralExample) {
        const centralDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Chicago',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(now);
        const centralTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Chicago',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        }).format(now);
        valCentralExample.innerText = `${centralDate} ${centralTime} | X Terra · Y D3.2 · Z SJ3`;

        if (counterPrimary) {
            counterPrimary.innerText = `${dateStr} ${now.getFullYear()} AD · ${localTime}`;
        }
        if (counterSecondary) {
            counterSecondary.innerText = `HE ${now.getFullYear() + 10000} · CENTRAL U.S. ${centralTime}`;
        }
    } else {
        if (counterPrimary) {
            counterPrimary.innerText = `${dateStr} ${now.getFullYear()} AD · ${localTime}`;
        }
        if (counterSecondary) {
            counterSecondary.innerText = `HE ${now.getFullYear() + 10000}`;
        }
    }

    if (counterXYZ) {
        counterXYZ.innerText = 'X SPACETIME · Y DIMENSION · Z SOUL STAGE';
    }


    requestAnimationFrame(updateEarthTranslations);
}

// Initialize
init();
updateEarthTranslations();

// --- Star Wars Crawl Logic ---
const starWarsBtn = document.getElementById('star-wars-btn');
const starWarsOverlay = document.getElementById('star-wars-overlay');
const starWarsClose = document.getElementById('star-wars-close');
const starWarsCrawlContent = document.getElementById('star-wars-crawl-content');

if (starWarsBtn && starWarsOverlay && starWarsClose && starWarsCrawlContent) {
    starWarsBtn.addEventListener('click', () => {
        // Build crawl content if empty
        if (starWarsCrawlContent.innerHTML.includes('<!-- Content injected via JS -->') || starWarsCrawlContent.innerHTML.trim() === '') {
            const h1 = document.querySelector('.hero h1');
            const panels = document.querySelectorAll('.hero .panel');

            let crawlHtml = '<div style="text-align: center; margin-bottom: 4rem; font-size: 2rem; color: #4deeea;">It is a period of cosmic discovery.</div>';
            if (h1) crawlHtml += `<h1 style="text-align: center; margin-bottom: 3rem; color: #ffe81f; text-shadow: none;">${h1.innerText}</h1>`;

            panels.forEach(panel => {
                crawlHtml += `<div style="margin-bottom: 3rem;">${panel.innerHTML}</div>`;
            });

            starWarsCrawlContent.innerHTML = crawlHtml;
        }

        starWarsOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Restart animation (Slower 240s duration for readability - roughly 75% slower)
        starWarsCrawlContent.style.animation = 'none';
        starWarsCrawlContent.offsetHeight; /* trigger reflow */
        starWarsCrawlContent.style.animation = 'scroll-crawl 240s linear forwards';
    });

    starWarsClose.addEventListener('click', () => {
        starWarsOverlay.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    });
}

// Nav hide on scroll down, show on scroll up
(function () {
    const nav = document.querySelector('.glass-nav');
    if (!nav) return;
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                if (currentScrollY > lastScrollY && currentScrollY > 80) {
                    nav.classList.add('nav-hidden');
                } else {
                    nav.classList.remove('nav-hidden');
                }
                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    });
})();

// Dimension Widget Overlay
let dimensionWidgetInitialized = false;
let movieModeInterval = null;

function openDimensionOverlay() {
    const overlay = document.getElementById('dimension-overlay');
    if (!overlay) return;
    overlay.style.display = 'block';
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    });
    document.body.style.overflow = 'hidden';

    // Lazy-init: The widget script auto-initializes when it finds #cnscns-widget
    // Since the overlay is now display:block, the widget container is visible
    if (!dimensionWidgetInitialized) {
        dimensionWidgetInitialized = true;
        // If widget didn't auto-init (because container was hidden), re-trigger
        if (window.CnscnsWidget && typeof window.CnscnsWidget.init === 'function') {
            window.CnscnsWidget.init();
        }
    }
}

function closeDimensionOverlay() {
    const overlay = document.getElementById('dimension-overlay');
    if (!overlay) return;
    stopMovieMode();
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 500);
    document.body.style.overflow = '';
}

function startMovieMode() {
    const btn = document.getElementById('btn-movie-mode');
    const scrollDriver = document.querySelector('#dimension-overlay .scroll-driver');

    if (movieModeInterval) {
        stopMovieMode();
        return;
    }

    if (!scrollDriver) {
        // Widget might use a different scroll container, try to find it
        const possibleDriver = document.querySelector('#cnscns-widget .scroll-driver') ||
            document.querySelector('#dimension-overlay [style*="overflow"]');
        if (!possibleDriver) return;
        startAutoScroll(possibleDriver, btn);
    } else {
        startAutoScroll(scrollDriver, btn);
    }
}

function startAutoScroll(el, btn) {
    if (btn) {
        btn.textContent = '⏸ Stop Movie';
        btn.style.borderColor = 'rgba(255,100,100,0.6)';
        btn.style.color = 'rgba(255,100,100,0.9)';
    }
    movieModeInterval = setInterval(() => {
        el.scrollTop += 1; // Slow, readable scroll speed
    }, 30);

    // Stop when reaching the end
    el.addEventListener('scroll', function checkEnd() {
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
            stopMovieMode();
            el.removeEventListener('scroll', checkEnd);
        }
    });
}

function stopMovieMode() {
    if (movieModeInterval) {
        clearInterval(movieModeInterval);
        movieModeInterval = null;
    }
    const btn = document.getElementById('btn-movie-mode');
    if (btn) {
        btn.textContent = '🎬 Movie Mode';
        btn.style.borderColor = 'rgba(255,215,0,0.4)';
        btn.style.color = 'rgba(255,215,0,0.9)';
    }
}
