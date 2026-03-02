/**
 * Star Wars Crawl Controller
 * Handles the cinematic text crawl overlay with scroll-based motion
 */

let crawlActive = false;
let crawlAnimationId = null;

function launchCrawl() {
    const overlay = document.getElementById('crawl-overlay');
    const content = document.getElementById('crawl-content');
    const readMode = document.getElementById('crawl-read-mode');

    if (!overlay || !content) return;

    // Reset state
    readMode.classList.remove('active');
    content.style.animation = 'none';
    content.offsetHeight; // Force reflow
    content.style.animation = '';

    // Show overlay
    overlay.classList.add('active');
    crawlActive = true;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Start the crawl animation
    content.classList.add('crawling');

    // Generate star particles for the starfield
    generateStarfield();
}

function exitCrawl() {
    const overlay = document.getElementById('crawl-overlay');
    const readMode = document.getElementById('crawl-read-mode');
    const content = document.getElementById('crawl-content');

    if (!overlay) return;

    // Stop crawl animation
    content.classList.remove('crawling');

    // Show read mode
    readMode.classList.add('active');
}

function exitReadMode() {
    const overlay = document.getElementById('crawl-overlay');
    const readMode = document.getElementById('crawl-read-mode');
    const content = document.getElementById('crawl-content');

    if (!overlay) return;

    // Hide everything
    readMode.classList.remove('active');
    overlay.classList.remove('active');
    content.classList.remove('crawling');
    crawlActive = false;

    // Restore body scroll
    document.body.style.overflow = '';
}

function generateStarfield() {
    const starfield = document.querySelector('.crawl-starfield');
    if (!starfield || starfield.childElementCount > 0) return;

    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'crawl-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        const size = Math.random() * 2.5 + 0.5;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        starfield.appendChild(star);
    }
}

// Close on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && crawlActive) {
        const readMode = document.getElementById('crawl-read-mode');
        if (readMode && readMode.classList.contains('active')) {
            exitReadMode();
        } else {
            exitCrawl();
        }
    }
});
