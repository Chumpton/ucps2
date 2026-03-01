// Simple Natal Chart Generator using HTML5 Canvas
// Aesthetics designed to mimic "The Pattern" app (minimalist, connecting lines, glyphs)

class NatalChartGenerator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) / 2 - 30; // 30px padding

        this.planets = [
            { name: 'Sun', glyph: '☉', color: '#ffd700' },
            { name: 'Moon', glyph: '☽', color: '#c0c0c0' },
            { name: 'Mercury', glyph: '☿', color: '#b14bf4' },
            { name: 'Venus', glyph: '♀', color: '#00d4ff' },
            { name: 'Mars', glyph: '♂', color: '#ff4444' },
            { name: 'Jupiter', glyph: '♃', color: '#ff9933' },
            { name: 'Saturn', glyph: '♄', color: '#bfbfbf' },
            { name: 'Uranus', glyph: '♅', color: '#86ecff' },
            { name: 'Neptune', glyph: '♆', color: '#4169e1' },
            { name: 'Pluto', glyph: '♇', color: '#bb99ff' }
        ];

        this.activeFilter = 'all'; // 'all', 'harmonious', 'challenging'
        this.drawnAspects = []; // Store drawn lines for hit detection

        // Bind Generate Button
        this.generateBtn = document.getElementById('btn-generate-natal');
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => {
                if (!this.generateBtn.classList.contains('valid-pulse')) return;
                this.generateChart()
            });
        }

        // Bind Inputs for Validation Pulsing
        const inputsToValidate = ['natal-name', 'natal-month', 'natal-day', 'natal-year', 'natal-hour', 'natal-minute', 'natal-location', 'natal-email'];
        inputsToValidate.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.validateForm());
                el.addEventListener('change', () => this.validateForm());
            }
        });

        // Bind Location Input for Autocomplete GPS lookup
        const locInput = document.getElementById('natal-location');
        const autocompleteList = document.getElementById('city-autocomplete-list');
        if (locInput && autocompleteList) {
            let timeout = null;
            locInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                const query = e.target.value;
                if (query.trim().length < 2) {
                    autocompleteList.style.display = 'none';
                    return;
                }
                timeout = setTimeout(() => this.fetchCities(query), 500);
                this.validateForm();
            });

            // Close list when clicking outside
            document.addEventListener('click', (e) => {
                if (e.target !== locInput && e.target !== autocompleteList) {
                    autocompleteList.style.display = 'none';
                }
            });
        }

        // Bind Filter Buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.activeFilter = e.target.dataset.filter;
                if (this.lastNodes) {
                    this.clearCanvas();
                    this.drawWheelStructure();
                    this.drawAspectLines(this.lastNodes);
                    this.drawPlanetaryNodes(this.lastNodes);
                }
            });
        });

        // Bind Canvas Hover for Tooltips
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        this.tooltip = document.getElementById('natal-tooltip');

        // Draw initial empty state
        this.drawEmptyState();

        // Initialize Dropdowns
        this.initDropdowns();
    }

    initDropdowns() {
        const monthSel = document.getElementById('natal-month');
        if (monthSel) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            months.forEach((m, i) => {
                let opt = document.createElement('option');
                opt.value = (i + 1).toString().padStart(2, '0');
                opt.textContent = m;
                monthSel.appendChild(opt);
            });
        }

        const daySel = document.getElementById('natal-day');
        if (daySel) {
            for (let i = 1; i <= 31; i++) {
                let opt = document.createElement('option');
                let val = i.toString().padStart(2, '0');
                opt.value = val; opt.textContent = val;
                daySel.appendChild(opt);
            }
        }

        const yearSel = document.getElementById('natal-year');
        if (yearSel) {
            const currentYear = new Date().getFullYear();
            for (let i = currentYear; i >= 1900; i--) {
                let opt = document.createElement('option');
                opt.value = i; opt.textContent = i;
                yearSel.appendChild(opt);
            }
        }

        const hourSel = document.getElementById('natal-hour');
        if (hourSel) {
            for (let i = 1; i <= 12; i++) {
                let opt = document.createElement('option');
                let val = i.toString().padStart(2, '0');
                opt.value = val; opt.textContent = val;
                hourSel.appendChild(opt);
            }
        }

        const minSel = document.getElementById('natal-minute');
        if (minSel) {
            for (let i = 0; i < 60; i++) {
                let opt = document.createElement('option');
                let val = i.toString().padStart(2, '0');
                opt.value = val; opt.textContent = val;
                minSel.appendChild(opt);
            }
        }
    }

    validateForm() {
        if (!this.generateBtn) return;
        const required = ['natal-name', 'natal-month', 'natal-day', 'natal-year', 'natal-hour', 'natal-minute', 'natal-email'];
        let isValid = required.every(id => {
            const el = document.getElementById(id);
            return el && el.value.trim() !== '';
        });

        const locEl = document.getElementById('natal-location');
        if (!locEl || !locEl.dataset.lat) {
            isValid = false;
        }

        if (isValid) {
            this.generateBtn.classList.add('valid-pulse');
            this.generateBtn.innerHTML = `Get My Coordinates <span style="color: var(--accent-magenta); margin-left: 0.3rem;">></span>`;
        } else {
            this.generateBtn.classList.remove('valid-pulse');
            this.generateBtn.innerHTML = `Get My Coordinates <span style="color: rgba(255,255,255,0.2); margin-left: 0.3rem;">></span>`;
        }
    }

    async fetchCities(query) {
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
            if (!response.ok) return;
            const data = await response.json();
            const autocompleteList = document.getElementById('city-autocomplete-list');
            if (!autocompleteList) return;

            autocompleteList.innerHTML = '';

            if (data.results && data.results.length > 0) {
                data.results.forEach(city => {
                    const item = document.createElement('div');
                    item.style.padding = '10px 15px';
                    item.style.cursor = 'pointer';
                    item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                    item.style.color = 'rgba(255,255,255,0.9)';
                    item.style.fontSize = '0.9rem';

                    const admin = city.admin1 ? city.admin1 + ', ' : '';
                    const displayName = `${city.name}, ${admin}${city.country}`;
                    item.innerText = displayName;

                    item.addEventListener('click', () => {
                        const locInput = document.getElementById('natal-location');
                        if (locInput) {
                            locInput.value = displayName;
                            locInput.dataset.lat = city.latitude;
                            locInput.dataset.lng = city.longitude;
                        }
                        autocompleteList.style.display = 'none';
                        this.updateGeoDisplayCustom(city.latitude, city.longitude);
                        this.validateForm();
                    });

                    item.addEventListener('mouseenter', () => item.style.background = 'rgba(177, 75, 244, 0.2)');
                    item.addEventListener('mouseleave', () => item.style.background = 'transparent');

                    autocompleteList.appendChild(item);
                });
                autocompleteList.style.display = 'block';
            } else {
                const item = document.createElement('div');
                item.style.padding = '10px 15px';
                item.style.color = 'rgba(255,255,255,0.5)';
                item.innerText = 'No cities found';
                autocompleteList.appendChild(item);
                autocompleteList.style.display = 'block';
            }
        } catch (e) {
            console.error('City fetch error:', e);
        }
    }

    updateGeoDisplayCustom(lat, lng) {
        const latSpan = document.getElementById('gps-lat');
        const lngSpan = document.getElementById('gps-lng');
        if (!latSpan || !lngSpan) return;

        const formattedLat = parseFloat(lat).toFixed(4);
        const formattedLng = parseFloat(lng).toFixed(4);

        latSpan.innerText = `Lat: ${formattedLat > 0 ? '+' : ''}${formattedLat}°`;
        lngSpan.innerText = `Lng: ${formattedLng > 0 ? '+' : ''}${formattedLng}°`;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawEmptyState() {
        this.clearCanvas();
        this.drawWheelStructure();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.font = '16px "Space Grotesk", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Enter Birth Details', this.centerX, this.centerY - 10);
        this.ctx.font = '12px "Space Grotesk", sans-serif';
        this.ctx.fillText('To Get Soul Coordinates', this.centerX, this.centerY + 15);
    }

    drawWheelStructure() {
        // --- Traditional Black & White Zodiac Ring ---
        const outerRadius = this.radius;
        const innerZodiacRadius = this.radius - 40;

        // 1. Black background for Zodiac ring
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, outerRadius, 0, Math.PI * 2);
        this.ctx.arc(this.centerX, this.centerY, innerZodiacRadius, 0, Math.PI * 2, true); // counter-clockwise for cutout
        this.ctx.fillStyle = '#000000';
        this.ctx.fill();

        // 2. White borders for the ring and 12 segments
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, outerRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, innerZodiacRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        const zodiacSigns = [
            { glyph: '♈', color: '#ff4444' }, // Aries (Fire)
            { glyph: '♉', color: '#4caf50' }, // Taurus (Earth)
            { glyph: '♊', color: '#ffd700' }, // Gemini (Air)
            { glyph: '♋', color: '#00d4ff' }, // Cancer (Water)
            { glyph: '♌', color: '#ff4444' }, // Leo (Fire)
            { glyph: '♍', color: '#4caf50' }, // Virgo (Earth)
            { glyph: '♎', color: '#ffd700' }, // Libra (Air)
            { glyph: '♏', color: '#00d4ff' }, // Scorpio (Water)
            { glyph: '♐', color: '#ff4444' }, // Sagittarius (Fire)
            { glyph: '♑', color: '#4caf50' }, // Capricorn (Earth)
            { glyph: '♒', color: '#ffd700' }, // Aquarius (Air)
            { glyph: '♓', color: '#00d4ff' }  // Pisces (Water)
        ];

        // Draw 12 Zodiac dividers and Glyphs
        for (let i = 0; i < 12; i++) {
            const startAngle = (i * Math.PI) / 6;
            const endAngle = ((i + 1) * Math.PI) / 6;
            const midAngle = startAngle + (Math.PI / 12);

            // Dividers
            this.ctx.beginPath();
            this.ctx.moveTo(
                this.centerX + Math.cos(startAngle) * innerZodiacRadius,
                this.centerY + Math.sin(startAngle) * innerZodiacRadius
            );
            this.ctx.lineTo(
                this.centerX + Math.cos(startAngle) * outerRadius,
                this.centerY + Math.sin(startAngle) * outerRadius
            );
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();

            // Zodiac Glyphs in the middle of each segment
            const glyphRadius = outerRadius - 20;
            this.ctx.fillStyle = zodiacSigns[i].color;
            this.ctx.font = '20px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            // Simple rotation logic to make glyph upright or pointing outwards. Using upright for readability.
            this.ctx.fillText(
                zodiacSigns[i].glyph,
                this.centerX + Math.cos(midAngle) * glyphRadius,
                this.centerY + Math.sin(midAngle) * glyphRadius
            );
        }

        // --- Inner House Lines implementation ---
        const innerHouseRadius = innerZodiacRadius - 40;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, innerHouseRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            this.ctx.beginPath();
            this.ctx.moveTo(
                this.centerX + Math.cos(angle) * innerHouseRadius,
                this.centerY + Math.sin(angle) * innerHouseRadius
            );
            this.ctx.lineTo(
                this.centerX + Math.cos(angle) * innerZodiacRadius,
                this.centerY + Math.sin(angle) * innerZodiacRadius
            );
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.stroke();

            // Draw House numbers
            const midAngle = angle + (Math.PI / 12);
            this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
            this.ctx.font = '10px "Space Grotesk"';
            this.ctx.fillText(i + 1, this.centerX + Math.cos(midAngle) * (innerHouseRadius + 15), this.centerY + Math.sin(midAngle) * (innerHouseRadius + 15));
        }

        // Inner-most circle
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, innerHouseRadius - 50, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
    }

    generateChart() {
        const loading = document.getElementById('natal-loading');
        if (loading) loading.style.display = 'block';
        this.clearCanvas();
        this.drawWheelStructure();

        // Hide old results
        const soulResults = document.getElementById('soul-results-card');
        if (soulResults) soulResults.style.display = 'none';
        const timeDisplay = document.getElementById('natal-time-display');
        if (timeDisplay) timeDisplay.style.opacity = '0';

        // Simulate calculation delay
        setTimeout(() => {
            const activeNodes = this.calculateMockPositions();

            // Push nodes apart slightly if they are too close to prevent exact stacking
            for (let i = 0; i < activeNodes.length; i++) {
                for (let j = i + 1; j < activeNodes.length; j++) {
                    const dx = activeNodes[i].x - activeNodes[j].x;
                    const dy = activeNodes[i].y - activeNodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 30) {
                        activeNodes[i].x += dx * 0.5;
                        activeNodes[i].y += dy * 0.5;
                        activeNodes[j].x -= dx * 0.5;
                        activeNodes[j].y -= dy * 0.5;
                    }
                }
            }

            this.lastNodes = activeNodes; // Save for filtering
            this.drawAspectLines(activeNodes);
            this.drawPlanetaryNodes(activeNodes);

            // Show filters and canvas
            if (loading) loading.style.display = 'none';
            document.getElementById('natal-canvas-wrapper').style.opacity = '1';

            const filters = document.getElementById('aspect-filters');
            if (filters) {
                filters.style.opacity = '1';
                filters.style.pointerEvents = 'auto';
            }

            this.populateSoulResults();

            if (timeDisplay) {
                const hh = document.getElementById('natal-hour').value;
                const mm = document.getElementById('natal-minute').value;
                const ampm = document.getElementById('natal-ampm').value;
                timeDisplay.innerHTML = `${hh}:${mm} ${ampm}`;
                timeDisplay.style.opacity = '1';
            }
        }, 800);
    }

    populateSoulResults() {
        const soulResults = document.getElementById('soul-results-card');
        if (!soulResults) return;

        const year = document.getElementById('natal-year').value || '2000';
        const month = document.getElementById('natal-month').value || '01';
        const monthInt = parseInt(month, 10);
        const dayInt = parseInt(document.getElementById('natal-day').value || '01', 10);

        const hdTypes = ["Manifestor", "Generator", "Manifesting Generator", "Projector", "Reflector"];
        const profiles = ["1/3 Investigator Martyr", "2/4 Hermit Opportunist", "3/5 Martyr Heretic", "4/6 Opportunist Role Model", "5/1 Heretic Investigator", "6/2 Role Model Hermit"];

        const hdType = hdTypes[(year % 5)];
        const hdProfile = profiles[(monthInt % 6)];

        // True astrological simple mapping
        const getSign = (m, d) => {
            if ((m == 1 && d >= 20) || (m == 2 && d <= 18)) return "Aquarius";
            if ((m == 2 && d >= 19) || (m == 3 && d <= 20)) return "Pisces";
            if ((m == 3 && d >= 21) || (m == 4 && d <= 19)) return "Aries";
            if ((m == 4 && d >= 20) || (m == 5 && d <= 20)) return "Taurus";
            if ((m == 5 && d >= 21) || (m == 6 && d <= 20)) return "Gemini";
            if ((m == 6 && d >= 21) || (m == 7 && d <= 22)) return "Cancer";
            if ((m == 7 && d >= 23) || (m == 8 && d <= 22)) return "Leo";
            if ((m == 8 && d >= 23) || (m == 9 && d <= 22)) return "Virgo";
            if ((m == 9 && d >= 23) || (m == 10 && d <= 22)) return "Libra";
            if ((m == 10 && d >= 23) || (m == 11 && d <= 21)) return "Scorpio";
            if ((m == 11 && d >= 22) || (m == 12 && d <= 21)) return "Sagittarius";
            return "Capricorn";
        };

        const astroSign = getSign(monthInt, dayInt);
        const soulNode = `Z-${year.toString().slice(-2)}.${monthInt}.${Math.floor(Math.random() * 9)}`;

        document.getElementById('soul-hd-type').innerText = hdType;
        document.getElementById('soul-hd-profile').innerText = hdProfile;
        document.getElementById('soul-astro-sign').innerText = astroSign + ' ☉';

        // Z-Node is now only displayed in the main ticker
        const soulZNodeSpan = document.getElementById('soul-z-node');
        if (soulZNodeSpan) soulZNodeSpan.innerText = soulNode;

        soulResults.style.display = 'block';

        // Update the main widgets with the newly found coordinates
        const tickerEl = document.getElementById('true-date-ticker-text');
        if (tickerEl) tickerEl.innerText = `TRUE DATE | CUSTOM ORIGIN RECALIBRATED | SOUL NODE ESTABLISHED: ${soulNode} (X: Terra, Y: 3D)`;

        const xyzEl = document.getElementById('true-date-counter-xyz');
        if (xyzEl) xyzEl.innerText = `X SPACETIME · Y DIMENSION · ${soulNode}`;

        // Update New True Date Breakdown Ticker
        const tdX = document.getElementById('td-x');
        const tdY = document.getElementById('td-y');
        const tdZ = document.getElementById('td-z');

        const locInput = document.getElementById('natal-location');
        const locName = locInput && locInput.value ? locInput.value.split(',')[0] : 'Terra';

        if (tdX) tdX.innerHTML = `X: <span style="color:#fff">${locName}</span>`;
        if (tdY) tdY.innerHTML = `Y: <span style="color:#fff">3rd Dens.</span>`;
        if (tdZ) tdZ.innerHTML = `Z: <span style="color:#fff">${soulNode}</span>`;
    }

    calculateMockPositions() {
        // Limit planet radius to be inside the new Zodiac inner ring (radius - 40)
        // and outside the innermost empty space
        const plRadius = this.radius - 60;

        return this.planets.map(p => {
            const angle = Math.random() * Math.PI * 2;
            return {
                ...p,
                angle: angle,
                x: this.centerX + Math.cos(angle) * plRadius,
                y: this.centerY + Math.sin(angle) * plRadius
            };
        });
    }

    drawAspectLines(nodes) {
        this.drawnAspects = []; // Reset stored lines

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const angleDiff = Math.abs(nodes[i].angle - nodes[j].angle);
                const diffDegrees = (angleDiff * 180 / Math.PI) % 360;
                const shortestDiff = Math.min(diffDegrees, 360 - diffDegrees);

                let isAspect = false;
                let strokeStyle = '';
                let aspectName = '';
                let isMajor = false;
                let aspectType = ''; // 'harmonious' or 'challenging'

                if (Math.abs(shortestDiff - 120) < 8) { // Trine
                    isAspect = true;
                    strokeStyle = 'rgba(0, 212, 255, 0.6)';
                    aspectName = 'Trine';
                    isMajor = true;
                    aspectType = 'harmonious';
                } else if (Math.abs(shortestDiff - 90) < 8) { // Square
                    isAspect = true;
                    strokeStyle = 'rgba(255, 68, 68, 0.5)';
                    aspectName = 'Square';
                    isMajor = true;
                    aspectType = 'challenging';
                } else if (Math.abs(shortestDiff - 180) < 8) { // Opposition
                    isAspect = true;
                    strokeStyle = 'rgba(177, 75, 244, 0.5)';
                    aspectName = 'Opposition';
                    isMajor = true;
                    aspectType = 'challenging';
                } else if (Math.abs(shortestDiff - 60) < 6) { // Sextile
                    isAspect = true;
                    strokeStyle = 'rgba(255, 215, 0, 0.4)';
                    aspectName = 'Sextile';
                    isMajor = false;
                    aspectType = 'harmonious';
                }

                // Filter logic
                if (isAspect && (this.activeFilter === 'all' || this.activeFilter === aspectType)) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(nodes[i].x, nodes[i].y);
                    this.ctx.lineTo(nodes[j].x, nodes[j].y);
                    this.ctx.strokeStyle = strokeStyle;
                    this.ctx.lineWidth = isMajor ? 1.5 : 0.8;

                    if (!isMajor) this.ctx.setLineDash([5, 5]); // dashed minor lines
                    else this.ctx.setLineDash([]);

                    this.ctx.stroke();
                    this.ctx.setLineDash([]); // reset

                    // Store for hit detection
                    this.drawnAspects.push({
                        x1: nodes[i].x, y1: nodes[i].y,
                        x2: nodes[j].x, y2: nodes[j].y,
                        name: `${nodes[i].name} ${aspectName} ${nodes[j].name}`,
                        color: strokeStyle
                    });
                }
            }
        }
    }

    handleHover(e) {
        if (!this.tooltip || this.drawnAspects.length === 0) return;

        const rect = this.canvas.getBoundingClientRect();
        // Adjust for scale if canvas CSS width != fixed width
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        let foundHover = null;
        const tolerance = 5; // pixels

        for (const aspect of this.drawnAspects) {
            // Distance from point to line segment
            const lineLenSq = (aspect.x2 - aspect.x1) ** 2 + (aspect.y2 - aspect.y1) ** 2;
            if (lineLenSq === 0) continue;

            let t = ((mouseX - aspect.x1) * (aspect.x2 - aspect.x1) + (mouseY - aspect.y1) * (aspect.y2 - aspect.y1)) / lineLenSq;
            t = Math.max(0, Math.min(1, t));

            const projX = aspect.x1 + t * (aspect.x2 - aspect.x1);
            const projY = aspect.y1 + t * (aspect.y2 - aspect.y1);

            const distSq = (mouseX - projX) ** 2 + (mouseY - projY) ** 2;

            if (distSq < tolerance * tolerance) {
                foundHover = aspect;
                break;
            }
        }

        if (foundHover) {
            this.tooltip.innerText = foundHover.name;
            this.tooltip.style.color = foundHover.color;
            // Tooltip position needs to be relative to the wrapper, using clientX/Y mapped to wrapper
            const wrapperRect = document.getElementById('natal-canvas-wrapper').getBoundingClientRect();
            this.tooltip.style.left = (e.clientX - wrapperRect.left + 15) + 'px';
            this.tooltip.style.top = (e.clientY - wrapperRect.top + 15) + 'px';
            this.tooltip.style.opacity = '1';
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.tooltip.style.opacity = '0';
            this.canvas.style.cursor = 'default';
        }
    }

    drawPlanetaryNodes(nodes) {
        nodes.forEach(node => {
            // Shadow Glow
            this.ctx.shadowColor = node.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;

            // Draw background circle for glyph
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(10, 10, 18, 1)'; // Dark panel bg, fully opaque
            this.ctx.fill();
            this.ctx.strokeStyle = node.color;
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();

            // Reset shadow for text
            this.ctx.shadowBlur = 0;

            // Draw Glyph
            this.ctx.fillStyle = node.color;
            this.ctx.font = 'bold 16px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const yOffset = (node.name === 'Sun' || node.name === 'Mars') ? 1 : 0;
            this.ctx.fillText(node.glyph, node.x, node.y + yOffset);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.NatalChart = new NatalChartGenerator('natal-canvas');
});
