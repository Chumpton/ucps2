/**
 * UCPS Logic Module v0.5
 * Implements the Unified Cosmic Positioning System logic as per Glossary v0.5
 */

const UCPS = {
    // SINGLE STATE OBJECT
    state: {
        trueDateMode: "now", // 'now' | 'custom' | 'arrival' | 'origin'
        displayMode: "A",    // 'A' (Minimal) | 'B' (Expanded) | 'C' (Scientific)

        // Data structure for the "Current" calculation
        current: {
            x: {
                ulc: { index: 0, epochFraction: 0.0, preset: "EP-A" },
                go: null, // { val: "MilkyWay", lifecycle: null } - Galactic Orbit (Optional)
                gr: { val: "1", lifecycle: null },     // Galactic Rotation
                sto: { val: "Sol", lifecycle: 0.52 },  // Stellar Orbit
                po: { val: "Terra", lifecycle: null }, // Planetary Orbit

                // Geo (Lat/Long/Alt) - Optional
                geo: null
            },
            y: {
                branch: "0", // B# - Timeline Branch
                dim: "3.2",  // Sub-dimensional Zone D#.#
            },
            z: {
                sj: "3",            // Soul Journey Stage
                realm: "Physical",  // Realm of Consciousness
                phase: "Exploration" // Existential Phase
            }
        },

        // Placeholder for Custom Input Data
        custom: {
            x: {
                ulc: { index: 0, epochFraction: 0.111 },
                go: { val: "MilkyWay", lifecycle: 0.9 },
                gr: { val: "1" },
                sto: { val: "Sol" },
                po: { val: "Terra" }
            },
            y: { branch: "1", dim: "4.0" },
            z: { sj: "5", realm: "Mental" }
        }
    },

    init: function () {
        console.log("UCPS Logic Initializing...");
        this.bindEvents();
        this.startClock();
    },

    bindEvents: function () {
        // Mode Selector for True Date
        const modeSel = document.getElementById('true-date-mode');
        if (modeSel) {
            modeSel.addEventListener('change', (e) => {
                this.state.trueDateMode = e.target.value;
                this.requestUpdate();
            });
        }

        // Listen for Location Dropdown changes to update the "Now" state
        const locInput = document.getElementById('input-location');
        if (locInput) {
            locInput.addEventListener('change', (e) => {
                this.state.current.x.po.val = e.target.value;
                this.requestUpdate();
            });
        }
    },

    setDisplayMode: function (mode) {
        if (!['A', 'B', 'C'].includes(mode)) return;
        this.state.displayMode = mode;

        // Update Button UI
        ['a', 'b', 'c'].forEach(m => {
            const btn = document.getElementById(`mode-btn-${m}`);
            if (btn) {
                if (m.toUpperCase() === mode) btn.classList.add('active');
                else btn.classList.remove('active');
            }
        });

        this.requestUpdate();
    },

    // Main Update Request
    requestUpdate: function () {
        // In a real app, this might throttle.
        this.updateDisplay();
    },

    startClock: function () {
        // Update "Now" time continuously
        setInterval(() => {
            if (this.state.trueDateMode === 'now') {
                this.updateNowTime();
                this.updateDisplay();
            } else {
                // Just update display to catch mode switches valid static data
                this.updateDisplay();
            }
        }, 100);
    },

    updateNowTime: function () {
        const now = new Date();
        // Calculate a mock Epoch Fraction for the demo
        // Fractal time simulation
        const dayMillis = 86400000;
        const currentMillis = (now.getHours() * 3600000) + (now.getMinutes() * 60000) + (now.getSeconds() * 1000) + now.getMilliseconds();

        // Let's say x moves from 0 to 1 every day for this demo level (or use a longer cycle)
        // For visual interest, we'll keep it fast.
        let fraction = currentMillis / dayMillis;
        this.state.current.x.ulc.epochFraction = fraction;

        // Update Other Inputs if changed in DOM (sync)
        const locInput = document.getElementById('input-location');
        if (locInput) {
            const val = locInput.value;
            this.state.current.x.po.val = val;

            // Auto-update prefix context if needed (Stellar vs Planet)
            // But here we just store the val in PO or StO depending on type.
            // For simplicity, we put the celestial body in PO for now, 
            // OR we shift it based on type.
            if (['Sol', 'Polaris'].includes(val)) {
                this.state.current.x.sto.val = val;
                this.state.current.x.po.val = null; // It IS the star
            } else {
                this.state.current.x.sto.val = "Sol"; // Determine parent star
                this.state.current.x.po.val = val;
            }
        }
    },

    generateData: function (data) {
        // Returns { fullString, segments: [{ text, label }] }
        let segments = [];

        // Helper to add segment
        const add = (text, label) => segments.push({ text, label });

        // 1. X COORDINATE (Spacetime)

        // ULC
        let ulc = `ULC${data.x.ulc.index}`;
        if (this.state.displayMode !== 'A') {
            let frac = data.x.ulc.epochFraction.toFixed(5).substring(2);
            ulc += `.${frac}`;
        }
        add(ulc, "Univ. Cycle");

        // GO (Galactic Orbit)
        if (data.x.go && data.x.go.val) {
            let s = `GO.${data.x.go.val}`;
            if (this.state.displayMode === 'C' && data.x.go.lifecycle !== null) s += `.L(${data.x.go.lifecycle})`;
            add(s, "Galaxy");
        }

        // GR (Galactic Rotation)
        if (data.x.gr && data.x.gr.val) {
            add(`GR${data.x.gr.val}`, "Gal. Rot");
        }

        // StO (Stellar Orbit)
        if (data.x.sto && data.x.sto.val) {
            let s = `StO.${data.x.sto.val}`;
            if (this.state.displayMode === 'C' && data.x.sto.lifecycle !== null) s += `.L(${data.x.sto.lifecycle})`;
            add(s, "Star");
        }

        // PO (Planetary Orbit)
        if (data.x.po && data.x.po.val) {
            let s = `${data.x.po.val}.0`;
            if (this.state.displayMode === 'C' && data.x.po.lifecycle !== null) s += `.L(${data.x.po.lifecycle})`;
            add(s, "Planet");
        }

        // 2. Y COORDINATE (Dimension)
        // B# (Branch) + D#.# (Zone)
        // We might want to split these if we want separate labels? The string previously joined them.
        // Let's keep them as one segment "B0.D3.2" or split?
        // User wants "each section". Splitting might be better for "Dimension" vs "Branch".
        // But the previous code joined them. Let's split them for better labelling.
        add(`B${data.y.branch}`, "Timeline");
        add(`D${data.y.dim}`, "Dimension");

        // 3. Z COORDINATE (Existential)
        // SJ#
        add(`SJ${data.z.sj}`, "Soul Stage");

        // Construct full string for R-check
        const fullString = segments.map(s => s.text).join('.');

        return { fullString, segments };
    },

    updateDisplay: function () {
        const displayEl = document.getElementById('ucps-coords');

        let activeData;
        if (this.state.trueDateMode === 'now') {
            activeData = this.state.current;
        } else if (this.state.trueDateMode === 'custom') {
            activeData = this.state.custom;
        } else {
            // placeholders
            activeData = this.state.current;
        }



        const dataObj = this.generateData(activeData);
        // dataObj contains { fullString, segments: [{text, label}] }
        const str = dataObj.fullString;
        const segs = dataObj.segments;

        // Safety check for R
        if (str.includes(".R") || str.startsWith("R")) {
            console.error("FATAL: Reserved Token 'R' detected in string.");
            if (displayEl) {
                displayEl.innerHTML = "<span class='error'>ERR_RESERVED_TOKEN_R</span>";
            }
            return;
        }

        if (displayEl) {
            // Render HTML Segments
            displayEl.innerHTML = '';

            const wrapper = document.createElement('div');
            wrapper.className = 'rake-wrapper';

            segs.forEach((seg) => {
                const item = document.createElement('div');
                item.className = 'coord-item';

                const textSpan = document.createElement('span');
                textSpan.className = 'coord-text';
                textSpan.innerText = seg.text;
                item.appendChild(textSpan);

                const connector = document.createElement('div');
                connector.className = 'coord-connector';

                const arrow = document.createElement('div');
                arrow.className = 'coord-arrow-up';
                connector.appendChild(arrow);

                const stem = document.createElement('div');
                stem.className = 'coord-stem';
                connector.appendChild(stem);
                item.appendChild(connector);

                const labelSpan = document.createElement('span');
                labelSpan.className = 'coord-label';
                labelSpan.innerText = seg.label;
                item.appendChild(labelSpan);

                wrapper.appendChild(item);
            });

            displayEl.appendChild(wrapper);

            const baseline = document.createElement('div');
            baseline.className = 'rake-baseline';
            displayEl.appendChild(baseline);
        }

        const tickerEl = document.getElementById('true-date-ticker-text');
        if (tickerEl) {
            const now = new Date();
            const centralSample = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Chicago',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZoneName: 'short'
            }).format(now);
            tickerEl.innerText = `TRUE DATE | ${str} | CENTRAL U.S. ${centralSample} | XYZ: X SPACETIME · Y DIMENSION · Z SOUL STAGE`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof UCPS !== 'undefined') {
        UCPS.init();
        UCPS.requestUpdate();
    }
});

