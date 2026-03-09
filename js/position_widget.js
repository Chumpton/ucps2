function initPositionWidget() {
    const calcBtn = document.getElementById('calculate-pos-btn');
    const recalcBtn = document.getElementById('recalc-btn');

    const inputName = document.getElementById('input-name');
    const inputDob = document.getElementById('input-dob');
    const inputTob = document.getElementById('input-tob');
    const inputPlace = document.getElementById('input-place');
    const inputEmail = document.getElementById('input-email');
    const inputPhoto = document.getElementById('input-photo');

    const resName = document.getElementById('res-name');
    const resEmail = document.getElementById('res-email');
    const resDob = document.getElementById('res-dob');
    const resOrigin = document.getElementById('res-origin');
    const resPosition = document.getElementById('res-position');

    const resAvatarImg = document.getElementById('res-avatar-img');
    const resAvatarGlyph = document.getElementById('res-avatar-glyph');
    const resSign = document.getElementById('res-sign');
    const resSignGlyph = document.getElementById('res-sign-glyph');
    const lifePathBadge = document.getElementById('life-path-badge');
    const memberSince = document.getElementById('member-since');
    const membershipId = document.getElementById('membership-id');
    const loreEl = document.getElementById('card-lore');

    const loadingOverlay = document.getElementById('card-loading');
    const shareBtn = document.getElementById('share-btn');
    const saveImageBtn = document.getElementById('save-image-btn');
    const captureCard = document.getElementById('cosmic-card-capture');

    const cityList = document.getElementById('city-list');
    if (cityList && typeof COSMIC_CITIES !== 'undefined') {
        COSMIC_CITIES.forEach((city) => {
            const option = document.createElement('option');
            option.value = city.name;
            cityList.appendChild(option);
        });
    }

    if (!calcBtn) return;

    let profileImageDataUrl = '';

    const updatePreviewName = () => {
        if (!resName || !inputName) return;
        resName.innerText = inputName.value.trim() || 'Traveler...';
    };

    [inputName].forEach((el) => {
        if (el) el.addEventListener('input', updatePreviewName);
    });

    if (inputPhoto) {
        inputPhoto.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                profileImageDataUrl = reader.result;
                if (resAvatarImg && resAvatarGlyph) {
                    resAvatarImg.src = profileImageDataUrl;
                    resAvatarImg.style.display = 'block';
                    resAvatarGlyph.style.display = 'none';
                }
            };
            reader.readAsDataURL(file);
        });
    }

    calcBtn.addEventListener('click', () => {
        if (loadingOverlay) loadingOverlay.style.display = 'grid';

        setTimeout(() => {
            const name = (inputName && inputName.value.trim()) || 'Traveler';
            const dobVal = inputDob && inputDob.value;
            const placeName = (inputPlace && inputPlace.value.trim()) || 'Unknown Origin';
            const email = (inputEmail && inputEmail.value.trim()) || '';

            const sign = getZodiacSign(dobVal);
            const signGlyph = signToGlyph(sign);
            const lifePath = getLifePathNumber(dobVal);
            const since = getMemberSince(dobVal);
            const memberId = buildMemberId(name, dobVal, email);

            if (resName) resName.innerText = name;
            if (resSign) resSign.innerText = sign;
            if (resSignGlyph) resSignGlyph.innerText = signGlyph;
            if (resEmail) resEmail.innerText = email;
            if (resDob) resDob.innerText = dobVal || '';
            if (resOrigin) resOrigin.innerText = placeName;
            if (resPosition) resPosition.innerText = 'ULC0.PO.Terra.Z3';
            if (lifePathBadge) lifePathBadge.innerText = `${lifePath}`;
            if (memberSince) memberSince.innerText = String(since);
            if (membershipId) membershipId.innerText = memberId;

            if (resAvatarGlyph && (!profileImageDataUrl || (resAvatarImg && resAvatarImg.style.display === 'none'))) {
                resAvatarGlyph.innerText = signGlyph;
            }

            const loreText = `${sign} signature with a Life Path ${lifePath} trajectory. ` +
                `You are positioned for intuitive pattern recognition, idea synthesis, and meaningful contribution across systems.`;
            typeLore(loreText);

            if (loadingOverlay) loadingOverlay.style.display = 'none';
        }, 850);
    });

    if (recalcBtn) {
        recalcBtn.addEventListener('click', () => {
            if (loreEl) loreEl.innerText = 'Generate your card to reveal your cosmic lore.';
            if (resName) resName.innerText = 'Traveler...';
            if (resSign) resSign.innerText = 'Unknown';
            if (resSignGlyph) resSignGlyph.innerText = '✦';
            if (lifePathBadge) lifePathBadge.innerText = '--';
            if (memberSince) memberSince.innerText = String(new Date().getFullYear());
            if (membershipId) membershipId.innerText = '00057';
        });
    }

    function typeLore(text) {
        if (!loreEl) return;
        loreEl.innerText = '';
        let i = 0;
        const timer = setInterval(() => {
            loreEl.innerText = text.slice(0, i);
            i += 1;
            if (i > text.length) clearInterval(timer);
        }, 14);
    }

    function getMemberSince(dob) {
        if (!dob) return new Date().getFullYear();
        const year = parseInt(dob.split('-')[0], 10);
        if (!Number.isFinite(year)) return new Date().getFullYear();
        return Math.max(2000, Math.min(new Date().getFullYear(), year));
    }

    function getLifePathNumber(dob) {
        if (!dob) return 0;
        const digits = dob.replace(/-/g, '').split('').map(Number);
        let sum = digits.reduce((a, b) => a + b, 0);
        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
            sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
        }
        return sum;
    }

    function getZodiacSign(dob) {
        if (!dob) return 'Unknown';
        const parts = dob.split('-').map(Number);
        if (parts.length !== 3) return 'Unknown';
        const month = parts[1];
        const day = parts[2];

        if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
        if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
        if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
        if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
        if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
        if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
        if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
        if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
        if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
        if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
        return 'Capricorn';
    }

    function signToGlyph(sign) {
        const map = {
            Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
            Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
        };
        return map[sign] || '✦';
    }

    function buildMemberId(name, dob, email) {
        const raw = `${name || ''}|${dob || ''}|${email || ''}`;
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
            hash = ((hash << 5) - hash) + raw.charCodeAt(i);
            hash |= 0;
        }
        const normalized = Math.abs(hash % 100000);
        return normalized.toString().padStart(5, '0');
    }

    async function captureCardImage() {
        if (!captureCard || !window.html2canvas) return null;
        return await window.html2canvas(captureCard, {
            backgroundColor: null,
            scale: 2
        });
    }

    if (saveImageBtn) {
        saveImageBtn.addEventListener('click', async () => {
            const canvas = await captureCardImage();
            if (!canvas) return;
            const link = document.createElement('a');
            link.download = 'cosmic-compass-card.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const canvas = await captureCardImage();
            if (!canvas) return;
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], 'cosmic-compass-card.png', { type: 'image/png' });
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'My Cosmic Card',
                        text: 'Generated with The Cosmic Compass.'
                    });
                } else {
                    const link = document.createElement('a');
                    link.download = 'cosmic-compass-card.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            }, 'image/png');
        });
    }

    if (window.DeviceOrientationEvent && captureCard) {
        const onTilt = (e) => {
            const beta = Math.max(-15, Math.min(15, e.beta || 0));
            const gamma = Math.max(-15, Math.min(15, e.gamma || 0));
            captureCard.style.setProperty('--tilt-x', `${(beta / 60).toFixed(3)}deg`);
            captureCard.style.setProperty('--tilt-y', `${(-gamma / 60).toFixed(3)}deg`);
        };

        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            window.addEventListener('click', () => {
                DeviceOrientationEvent.requestPermission().then((state) => {
                    if (state === 'granted') window.addEventListener('deviceorientation', onTilt, true);
                }).catch(() => { });
            }, { once: true });
        } else {
            window.addEventListener('deviceorientation', onTilt, true);
        }
    }
}

document.addEventListener('DOMContentLoaded', initPositionWidget);
