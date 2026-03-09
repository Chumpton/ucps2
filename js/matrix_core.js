
// Matrix Core System v5.3 Refactored
// Implements functionality for 'Reality Synthesizer' Dashboard

class MatrixCore {
    constructor() {
        this.canvas = document.querySelector('#reality-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });

        // --- State Variables ---
        // Formula: R = ((K - T) * W * D^4) * (X * Y * Z)
        this.state = {
            K: 200,            // Karmic Echo (0-1000)
            T: 100,            // Trauma Load (0-1000)
            W: 1,              // Selector (1 or 0)
            D: 3,              // Decision Level (1-9)
            X: 1,              // Reactive Record Multiplier (Frequency, base 1)
            Y: 1,              // Perception (Pressure/Volume derived)
            Z: 0.1,            // Trajectory (Progress)
            R: 0,              // Resonance

            // Context Switching
            currentContextIndex: 0,
            contexts: [
                { id: 'earth', name: 'Terra', emoji: '🌍', x: 'ULC0.0', y: 'D3.5', color: 0xD500F9 },
                { id: 'moon', name: 'Luna', emoji: '🌑', x: 'SaO12.2', y: 'D4.1', color: 0xCCCCCC },
                { id: 'mars', name: 'Mars', emoji: '🔴', x: 'PO4.0', y: 'D3.0', color: 0xFF4400 },
                { id: 'sun', name: 'Sol', emoji: '☀️', x: 'StO0.0', y: 'D5.8', color: 0xFFD700 },
                { id: 'galaxy', name: 'Galactic Core', emoji: '🌌', x: 'GO1.0', y: 'D9.0', color: 0x9900FF }
            ]
        };

        this.objects = {
            jukeboxGroup: null,
            record: null,
            personGroup: null,
            compassGroup: null,
            centerGroup: null,
            stars: null
        };

        this.init();
        this.buildScene();
        this.buildUI();
        this.animate();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Initial Camera Setup
        this.camera.position.set(0, 0, 40);
        this.camera.lookAt(0, 0, 0);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);

        // Window Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    buildScene() {
        // Main Center Group (The "Core")
        this.objects.centerGroup = new THREE.Group();
        this.scene.add(this.objects.centerGroup);

        // --- TOROIDAL ENERGY FIELD (Alex Grey / Sacred Mirror) ---
        this.objects.compassGroup = new THREE.Group();

        // Primary Torus (The Energy Field)
        const torusGeo = new THREE.TorusGeometry(5, 2, 32, 100);
        const torusMat = new THREE.MeshBasicMaterial({
            color: 0xD500F9, // Purple Neon (will shift with Hawkins)
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        this.objects.torus = new THREE.Mesh(torusGeo, torusMat);
        this.objects.compassGroup.add(this.objects.torus);

        // Inner Torus (Chakra Flow)
        const innerTorusGeo = new THREE.TorusGeometry(4, 1.5, 16, 64);
        const innerTorusMat = new THREE.MeshBasicMaterial({
            color: 0x00E676, // Heart Chakra Green
            wireframe: true,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        this.objects.innerTorus = new THREE.Mesh(innerTorusGeo, innerTorusMat);
        this.objects.compassGroup.add(this.objects.innerTorus);

        // Sushumna Column (Central Axis of Light)
        const sushumnaGeo = new THREE.CylinderGeometry(0.1, 0.1, 12, 16);
        const sushumnaMat = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.6
        });
        this.objects.sushumna = new THREE.Mesh(sushumnaGeo, sushumnaMat);
        this.objects.compassGroup.add(this.objects.sushumna);

        // Chakra Nodes (7 points along Sushumna)
        const chakraColors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x0000FF, 0x8B00FF];
        this.objects.chakraNodes = [];
        for (let i = 0; i < 7; i++) {
            const nodeGeo = new THREE.SphereGeometry(0.2, 16, 16);
            const nodeMat = new THREE.MeshBasicMaterial({
                color: chakraColors[i],
                transparent: true,
                opacity: 0.3
            });
            const node = new THREE.Mesh(nodeGeo, nodeMat);
            node.position.y = -5 + (i * 10 / 6); // Distribute along column
            this.objects.chakraNodes.push(node);
            this.objects.compassGroup.add(node);
        }

        // === SOLAR SYSTEM ORRERY (System View) ===
        this.objects.solarSystem = new THREE.Group();
        this.objects.compassGroup.add(this.objects.solarSystem);
        this.objects.planets = []; // Store for animation

        // 0. The Sun (Center)
        const sunGeo = new THREE.SphereGeometry(2, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.9 });
        const sun = new THREE.Mesh(sunGeo, sunMat);

        // Sun Glow
        const sunGlowMat = new THREE.SpriteMaterial({
            color: 0xFFA000,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const sunGlow = new THREE.Sprite(sunGlowMat);
        sunGlow.scale.set(6, 6, 1);
        sun.add(sunGlow);
        this.objects.solarSystem.add(sun);

        // Planet Data: { name, color, dist, size, speed }
        // Distances scaled for visual fit, not reality
        const planetData = [
            { name: "Mercury", color: 0xA5A5A5, dist: 12, size: 0.4, speed: 0.02 },
            { name: "Venus", color: 0xE1C699, dist: 16, size: 0.6, speed: 0.015 },
            { name: "Earth", color: 0x2196F3, dist: 22, size: 0.65, speed: 0.01, moon: true },
            { name: "Mars", color: 0xFF5722, dist: 28, size: 0.5, speed: 0.008 }
        ];

        planetData.forEach(p => {
            // Orbit Ring
            const orbitGeo = new THREE.TorusGeometry(p.dist, 0.05, 16, 64); // Thin orbit line
            const orbitMat = new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 });
            const orbit = new THREE.Mesh(orbitGeo, orbitMat);
            orbit.rotation.x = Math.PI / 2;
            this.objects.solarSystem.add(orbit);

            // Planet Mesh
            const pGeo = new THREE.SphereGeometry(p.size, 16, 16);
            const pMat = new THREE.MeshStandardMaterial({
                color: p.color,
                roughness: 0.7,
                emissive: p.color,
                emissiveIntensity: 0.2
            });
            const planet = new THREE.Mesh(pGeo, pMat);

            // Pivot group for rotation (simplified orbit mechanics)
            const pivot = new THREE.Group();
            pivot.rotation.y = Math.random() * Math.PI * 2; // Random start pos
            pivot.userData = { speed: p.speed };
            pivot.add(planet);
            planet.position.x = p.dist; // Offset from center

            this.objects.solarSystem.add(pivot);
            this.objects.planets.push(pivot);

            // Simple Moon for Earth
            if (p.moon) {
                const moonGeo = new THREE.SphereGeometry(0.15, 8, 8);
                const moonMat = new THREE.MeshBasicMaterial({ color: 0xDDDDDD });
                const moon = new THREE.Mesh(moonGeo, moonMat);
                moon.position.x = 1.2; // Relative to Earth
                planet.add(moon);
            }
        });

        // Hide initially (Self view is default)
        this.objects.solarSystem.visible = false;

        this.objects.centerGroup.add(this.objects.compassGroup);

        // --- Shadow Shell (Internal State / Astral Body) ---
        const shadowGeo = new THREE.TorusGeometry(5.5, 2.2, 16, 50);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0xD500F9,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        this.objects.shadowShell = new THREE.Mesh(shadowGeo, shadowMat);
        this.objects.centerGroup.add(this.objects.shadowShell);


        // --- Person (Ascension Grid Body) ---
        this.objects.personGroup = new THREE.Group();
        this.objects.personGroup.position.y = -2; // Lower to sit on "floor"

        const gridMat = new THREE.MeshBasicMaterial({
            color: 0x00FFFF, // Cyan Light Body
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });

        // 1. Head
        const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 2), gridMat);
        head.position.y = 3.5;
        this.objects.personGroup.add(head);

        // Third Eye Glow
        const eyeGlow = new THREE.Sprite(new THREE.SpriteMaterial({
            color: 0xFFFFFF, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
        }));
        eyeGlow.scale.set(1.5, 1.5, 1);
        head.add(eyeGlow);

        // 2. Torso (Tapered Cylinder / Chakra Column)
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.4, 2.5, 8, 4, true), gridMat);
        torso.position.y = 1.8;
        this.objects.personGroup.add(torso);

        // 3. Meditation Pose (Stylized)
        // Arms (Angled Down)
        const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2, 6), gridMat);
        armL.position.set(-1, 2, 0);
        armL.rotation.z = Math.PI / 4;
        this.objects.personGroup.add(armL);

        const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2, 6), gridMat);
        armR.position.set(1, 2, 0);
        armR.rotation.z = -Math.PI / 4;
        this.objects.personGroup.add(armR);

        // Legs (Crossed - simplified as Torus segment base or angled cylinders)
        const legs = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.3, 8, 16, Math.PI * 1.5), gridMat);
        legs.rotation.x = Math.PI / 2;
        legs.rotation.z = Math.PI / 4;
        legs.position.y = 0.3;
        this.objects.personGroup.add(legs);

        // 4. Chakras (Internal Points)
        const bodyColors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x0000FF, 0x8B00FF];
        for (let i = 0; i < 7; i++) {
            const dot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({ color: bodyColors[i] }));
            dot.position.set(0, 0.5 + i * 0.5, 0);
            this.objects.personGroup.add(dot);
        }

        // 5. Heart Field Torus (Dynamic Bio-Field)
        const heartGeo = new THREE.TorusGeometry(1.5, 0.05, 16, 50);
        const heartMat = new THREE.MeshBasicMaterial({ color: 0x00FF00, transparent: true, opacity: 0.3, wireframe: true });
        const heartField = new THREE.Mesh(heartGeo, heartMat);
        heartField.rotation.x = Math.PI / 2;
        heartField.position.y = 2.0; // Chest height
        this.objects.heartField = heartField; // Save ref
        this.objects.personGroup.add(heartField);

        this.objects.centerGroup.add(this.objects.personGroup);


        // --- Jukebox (Zone B) - NOW BACKGROUND ENGINE ---
        // Move it back and scale it up as a backdrop or "Machine" aesthetic
        this.objects.jukeboxGroup = new THREE.Group();

        // Hexagon Backplate
        const hexGeo = new THREE.CylinderGeometry(15, 15, 2, 6);
        const hexMat = new THREE.MeshBasicMaterial({
            color: 0x0F1724,
            wireframe: false
        });
        const hex = new THREE.Mesh(hexGeo, hexMat);
        hex.rotation.x = Math.PI / 2;
        hex.position.z = -10;
        this.objects.jukeboxGroup.add(hex);

        // Hex Wireframe
        const hexEdges = new THREE.EdgesGeometry(hexGeo);
        const hexLines = new THREE.LineSegments(hexEdges, new THREE.LineBasicMaterial({ color: 0x1A2226 }));
        hex.add(hexLines);

        // The Record (X) - Spinning Disk (Behind compass)
        const recGeo = new THREE.RingGeometry(10, 14, 64);
        const recMat = new THREE.MeshBasicMaterial({
            color: 0x1A2226,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        this.objects.record = new THREE.Mesh(recGeo, recMat);
        this.objects.record.position.set(0, 0, -8);
        this.objects.jukeboxGroup.add(this.objects.record);

        // Record Glow Ring (Label equivalent)
        const labGeo = new THREE.RingGeometry(13.5, 14, 64);
        const labMat = new THREE.MeshBasicMaterial({ color: 0xE07A5F });
        this.objects.recordLabel = new THREE.Mesh(labGeo, labMat);
        this.objects.recordLabel.position.set(0, 0, 0.1);
        this.objects.record.add(this.objects.recordLabel);

        this.scene.add(this.objects.jukeboxGroup);


        // --- Starfield ---
        const starGeo = new THREE.BufferGeometry();
        const starCount = 3000;
        const starPos = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            starPos[i] = (Math.random() - 0.5) * 300;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.2 }); // Start slightly visible
        this.objects.stars = new THREE.Points(starGeo, starMaterial);
        this.scene.add(this.objects.stars);

        // --- XYZ Grid System ---
        this.objects.gridGroup = new THREE.Group();

        const gridSize = 40;
        const gridDivs = 20;
        const gridColor = 0x2C3E50;
        const gridColorCenter = 0x445566;

        // 1. Floor (XZ Plane)
        const gridXZ = new THREE.GridHelper(gridSize, gridDivs, gridColorCenter, gridColor);
        gridXZ.position.y = -10;
        this.objects.gridGroup.add(gridXZ);

        // 2. Back (XY Plane)
        const gridXY = new THREE.GridHelper(gridSize, gridDivs, gridColorCenter, gridColor);
        gridXY.rotation.x = Math.PI / 2;
        gridXY.position.z = -20; // Behind Jukebox
        this.objects.gridGroup.add(gridXY);

        // 3. Side (YZ Plane)
        const gridYZ = new THREE.GridHelper(gridSize, gridDivs, gridColorCenter, gridColor);
        gridYZ.rotation.z = Math.PI / 2;
        gridYZ.position.x = -20;
        this.objects.gridGroup.add(gridYZ);

        this.scene.add(this.objects.gridGroup);
    }

    buildUI() {
        // --- Populate Ruler (Zone A) ---
        const ruler = document.getElementById('ruler-container');
        const steps = [

            { val: 1000, label: "1000 - SOURCE", desc: "Absolute Oneness. Ineffable existence." },
            { val: 850, label: "850 - VOID", desc: "The Great Silence. Potent emptiness before creation." },
            { val: 700, label: "700 - UNITY", desc: "Self and Other merge. Reality hacking enabled." },
            { val: 600, label: "600 - PEACE", desc: "Non-Local Perception. Events unfold perfectly." },
            { val: 540, label: "540 - JOY", desc: "Synchronicity becomes constant. Healing presence." },
            { val: 500, label: "500 - LOVE", desc: "Reason yields to Intuition. Heart-centered calibration." },
            { val: 400, label: "400 - REASON", desc: "Linear causality. Scientific and intellectual mastery." },
            { val: 350, label: "350 - ACCEPTANCE", desc: "Forgiveness. Understanding life's terms." },
            { val: 310, label: "310 - WILLINGNESS", desc: "Optimism and openness to serve." },
            { val: 250, label: "250 - NEUTRALITY", desc: "Detachment from outcomes. Flexible living." },
            { val: 200, label: "200 - COURAGE", desc: "The tipping point. Empowerment and action." },
            { val: 175, label: "175 - PRIDE", desc: "Demanding respect. Inflation of ego." },
            { val: 150, label: "150 - ANGER", desc: "Energy of attack. Frustration from unfulfilled desire." },
            { val: 125, label: "125 - DESIRE", desc: "Craving and acquisition. Never satisfied." },
            { val: 100, label: "100 - FEAR", desc: "Anxiety and withdrawal. World seen as dangerous." },
            { val: 75, label: "75 - GRIEF", desc: "Regret and loss. Despondency." },
            { val: 50, label: "50 - APATHY", desc: "Hopelessness. The victim mindset." },
            { val: 30, label: "30 - GUILT", desc: "Blame and remorse. Destructive self-judgment." },
            { val: 20, label: "20 - SHAME", desc: "Humiliation. Elimination of self." },
            { val: 0, label: "0 - NULL", desc: "Non-existence or total calibration failure." }
        ];

        // Populate Ruler & Scroll List
        const listContainer = document.getElementById('full-ability-list');
        const scrollPanel = document.getElementById('ability-scroll-panel');

        steps.forEach(s => {
            // Ruler Tick
            const div = document.createElement('div');
            div.className = s.val >= 700 ? 'scale-tick major' : 'scale-tick';
            div.innerHTML = s.label;
            div.dataset.val = s.val; // For rainbow color logic

            // Click: Change Theme
            div.addEventListener('click', () => {
                this.setTheme(s.val);
            });

            // Hover: Highlight in Scroll List
            div.addEventListener('mouseenter', () => {
                scrollPanel.classList.add('visible');
                // Auto-scroll to item
                const item = document.getElementById(`ability-${s.val}`);
                if (item) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    item.style.background = 'rgba(255,255,255,0.1)';
                }
            });
            div.addEventListener('mouseleave', () => {
                const item = document.getElementById(`ability-${s.val}`);
                if (item) item.style.background = 'transparent';
                // Don't auto-hide immediately to allow scrolling interaction if moved
            });

            ruler.appendChild(div);

            // List Item
            const item = document.createElement('div');
            item.className = 'ability-item';
            item.id = `ability-${s.val}`;
            item.innerHTML = `
                <h4>${s.label} <span>Freq: ${s.val}Hz</span></h4>
                <p>${s.desc}</p>
            `;
            if (listContainer) listContainer.appendChild(item);
        });

        // Hide panel when clicking outside/leaving Zone A? 
        // For now, let's keep it simple: hover over zone-left keeps it open
        const zoneLeft = document.querySelector('.zone-left');
        zoneLeft.addEventListener('mouseleave', () => {
            scrollPanel.classList.remove('visible');
        });

        // --- Populate Decision Staff (Zone D) ---
        const staff = document.querySelector('.staff-lines');
        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('div');
            btn.className = 'note-btn';
            if (i === 3) btn.classList.add('active'); // Default D=3
            btn.innerText = i;
            btn.dataset.d = i;
            btn.addEventListener('click', () => {
                // Update State
                this.state.D = i;
                document.getElementById('state-display').innerText = `${i}D - ${this.getDimName(i)}`;
                // Visuals
                document.querySelectorAll('.note-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
            staff.appendChild(btn);
        }

        // --- Bind Sliders & Knobs ---
        const bindRange = (id, key, scale = 1) => {
            const el = document.getElementById(id);
            el.addEventListener('input', (e) => {
                this.state[key] = parseFloat(e.target.value) * scale;
            });
        };

        bindRange('inp-k', 'K');
        bindRange('inp-t', 'T');
        // bindRange('inp-pressure', 'Y', 0.02); // Removed physical knob binding for direct update, logical only or mapped
        // Re-added if exists in HTML, else ignored. Assuming simplified UI for now.

        // W Selector
        document.getElementById('btn-w').addEventListener('click', (e) => {
            const btn = e.target;
            this.state.W = this.state.W === 1 ? 0 : 1;
            if (this.state.W === 1) {
                btn.classList.remove('inactive');
                btn.classList.add('active');
                btn.innerText = "ACTIVE";
            } else {
                btn.classList.remove('active');
                btn.classList.add('inactive');
                btn.innerText = "INACTIVE";
            }
        });

        // Context Switcher
        const ctxTrigger = document.getElementById('context-trigger');
        if (ctxTrigger) {
            ctxTrigger.addEventListener('click', () => {
                this.toggleContext();
            });
        }



        // === Dimension/Depth Slider (Cosmic Zoom) ===
        const depthSlider = document.getElementById('depth-slider');
        if (depthSlider) {
            depthSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value); // 0 to 100
                this.updateDepth(val);
            });
        }

        // === State Arrow Drag Handling ===
        const stateArrow = document.getElementById('state-arrow');
        const arrowZone = document.querySelector('.zone-left');
        if (stateArrow && arrowZone) {
            let isDragging = false;

            stateArrow.addEventListener('mousedown', (e) => {
                isDragging = true;
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const rect = arrowZone.getBoundingClientRect();
                const scaleTop = rect.top + (rect.height * 0.15); // 15% offset
                const scaleBottom = rect.top + (rect.height * 0.85); // 85% offset
                const scaleHeight = scaleBottom - scaleTop;

                // Clamp mouse Y within scale bounds
                let relY = Math.max(0, Math.min(scaleHeight, e.clientY - scaleTop));

                // Convert to value (inverted: top = 1000, bottom = 0)
                const val = Math.round((1 - (relY / scaleHeight)) * 1000);

                // Update K value (Karmic Echo)
                this.state.K = val;

                // Update arrow label
                const label = document.getElementById('arrow-val');
                if (label) label.innerText = val;

                // Update K slider to match
                const kSlider = document.getElementById('inp-k');
                if (kSlider) kSlider.value = val;

                // Trigger theme change
                this.setTheme(val);
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        }
    }

    toggleContext() {
        this.state.currentContextIndex = (this.state.currentContextIndex + 1) % this.state.contexts.length;
        this.updateContextUI();
    }

    updateContextUI() {
        const ctx = this.state.contexts[this.state.currentContextIndex];

        // Update Emoji
        const trigger = document.getElementById('context-trigger');
        if (trigger) trigger.innerText = ctx.emoji;


        // Update Info Fields (Coordinates) v6.0 Upgrade
        // Target the second info-module which acts as the Coordinate Display
        const infoModules = document.querySelectorAll('.info-module');
        if (infoModules.length > 1) {
            const coordinateModule = infoModules[1];
            coordinateModule.innerHTML = `
                <div class="module-header">Coordinates [${this.state.location || 'SCOTTSDALE, AZ'}]</div>
                <div class="stat-row">
                    <span>Lat/Long</span>
                    <span class="stat-val">33.49N / 111.92W</span>
                </div>
                <div class="stat-row">
                    <span>Desert Density</span>
                    <span class="stat-val">0.82 (Grounding)</span>
                </div>
                <div class="stat-row">
                    <span>Grid Sync</span>
                    <span class="stat-val" style="color:var(--accent-d)">OPTIMAL</span> 
                </div>
            `;
        }

        // Update 3D Compass Color
        if (this.objects.compassGroup) {
            // Find the Earth mesh
            this.objects.compassGroup.children.forEach(child => {
                if (child.geometry && child.geometry.type === 'IcosahedronGeometry') {
                    if (child.material) child.material.color.setHex(ctx.color);
                }
            });
        }
    }

    getDimName(d) {
        const names = ["Survival", "Sexual", "Power", "Emotional", "Conceptual", "Intuitive", "Karmic", "Planetary", "Solar"];
        return names[d - 1] || "Unknown";
    }

    checkUnlocks(personHeight) {
        let val = this.state.K - this.state.T;
        if (val < 0) val = 0;

        // Show Info Panel Data instead of floating tooltip for "Multiple Descriptions"
        const infoList = document.getElementById('ability-list');
        if (!infoList) return;

        // Determine current status description
        let status = "";
        let desc = "";

        if (val >= 700) { status = "REALITY HACKING"; desc = "Multiverse menu unlocked. Selector W active across timelines."; }
        else if (val >= 600) { status = "NON-LOCAL SIGHT"; desc = "Perception Y decoupled from Body. Remote viewing enabled."; }
        else if (val >= 500) { status = "NEUROSOMATIC BLISS"; desc = "Body acts as resonant antenna. Pain replaced by flow."; }
        else if (val >= 400) { status = "PATTERN RECOGNITION"; desc = "Distortion T cleared. Reality grooves Z visible."; }
        else { status = "SURVIVAL MODE"; desc = "Linear perception. Increase K to unlock higher functions."; }

        if (infoList.lastStatus === status) return;
        infoList.lastStatus = status;

        // Update UI
        infoList.innerHTML = `
            <span class="ability-highlight">${status}</span>
            ${desc}
        `;
    }

    calculateLogic() {
        // v6.0 Formula: R = (K * 100) / (T + 1)
        let K = this.state.K;
        let T = this.state.T;
        let base = (K * 100) / (T + 1);

        let dPower = Math.pow(this.state.D, 2);
        let xyz = this.state.X * this.state.Y * (1 + this.state.Z);

        // Normalized for display resonance, preventing infinity
        let R = base * this.state.W * dPower * xyz;

        // Cap for safety if T=0 or chaos
        if (!isFinite(R)) R = 999999;

        this.state.R = R;

        const rVal = document.getElementById('r-val');
        if (rVal) rVal.innerText = Math.floor(R).toLocaleString() + " Hz";

        return R;
    }

    updateDepth(sliderVal) {
        // Standardize: 0-100 input
        // 0-30: Micro/Bio/Self (Torus)
        // 30-70: System/Planetary (Solar Orrery)
        // 70-100: Galactic/Universal (Spiral)

        // 1. Update UI Labels (Universe Scroller)
        const layers = document.querySelectorAll('.uni-layer');
        let activeIdx = 2; // Default "Planetary"
        if (sliderVal < 20) activeIdx = 1; // Biological
        if (sliderVal < 10) activeIdx = 0; // Microcosm
        if (sliderVal > 40) activeIdx = 3; // Solar System
        if (sliderVal > 60) activeIdx = 4; // Interstellar
        if (sliderVal > 80) activeIdx = 5; // Galactic
        if (sliderVal > 95) activeIdx = 6; // Universal

        layers.forEach((l, i) => {
            if (i === activeIdx) l.classList.add('active');
            else l.classList.remove('active');
        });

        // 2. 3D Scene Transformation (Cosmic Zoom)
        // We simulate zoom by scaling the "Center Group"
        // At 0 (Self), scale is 1.
        // At 100 (Galactic), scale is tiny? No, zoom OUT means objects get smaller? 
        // Or we scale the WORLD down to see more?
        // Actually, easier to move Camera Z.

        // Base Z = 22. 
        // Self View: Z = 15 (Close up to Torus)
        // System View: Z = 40 (See orbits)
        // Galactic View: Z = 100 (See spiral)

        let targetZ = 22;
        if (sliderVal < 33) {
            // Self Mode
            targetZ = 15 + (sliderVal / 33) * 7; // 15 to 22
        } else if (sliderVal < 66) {
            // System Mode
            targetZ = 22 + ((sliderVal - 33) / 33) * 28; // 22 to 50
        } else {
            // Galactic Mode
            targetZ = 50 + ((sliderVal - 66) / 34) * 100; // 50 to 150
        }

        // Smooth move (using GSAP if available, but manual lerp in animate loop is safer here)
        // We'll set a target property on current object
        // 3. Toggle Visibility based on Scale
        if (this.objects.compassGroup) {
            // Torus visible mostly in Self/System
            if (this.objects.torus) this.objects.torus.visible = sliderVal < 50; // Fade out earlier
            if (this.objects.innerTorus) this.objects.innerTorus.visible = sliderVal < 40;
            if (this.objects.sushumna) this.objects.sushumna.visible = sliderVal < 80;
            if (this.objects.chakraNodes) {
                this.objects.chakraNodes.forEach(n => n.visible = sliderVal < 80);
            }

            // Solar System visible in System Mode (30-90)
            if (this.objects.solarSystem) {
                this.objects.solarSystem.visible = (sliderVal > 30 && sliderVal < 90);

                // Fade effect logic could go here, but visibility toggle is MVP
            }
        }
    }

    setTheme(val) {
        const root = document.documentElement;

        // === AXIOM-1 THRESHOLD LOGIC ===
        // Below 200: Contractive / Survival (Cyan/Black)
        // 200-500: Expansive / Empowered (Purple/White)
        // 500-700: Love/Flow / Liquid Glass (Emerald/Gold)
        // 700+: Source / Ascension (Violet/White Bloom)

        if (val >= 700) {
            // SOURCE / ASCENSION (Violet/White Bloom)
            root.style.setProperty('--bg-color', '#0A0008'); // Deep Violet Void
            root.style.setProperty('--text-primary', '#FFFFFF');
            root.style.setProperty('--accent-k', '#E040FB'); // Violet
            root.style.setProperty('--accent-glow', '#AA00FF');
            root.style.setProperty('--glass-bg', 'rgba(170, 0, 255, 0.1)');
            root.style.setProperty('--glass-border', '1px solid rgba(224, 64, 251, 0.5)');
        } else if (val >= 500) {
            // LOVE / FLOW / LIQUID GLASS (Emerald/Gold)
            root.style.setProperty('--bg-color', '#000A05'); // Deep Emerald Void
            root.style.setProperty('--text-primary', '#E8F5E9');
            root.style.setProperty('--accent-k', '#00E676'); // Emerald
            root.style.setProperty('--accent-glow', '#FFD700'); // Gold 
            root.style.setProperty('--glass-bg', 'rgba(0, 230, 118, 0.08)');
            root.style.setProperty('--glass-border', '1px solid rgba(0, 230, 118, 0.4)');
        } else if (val >= 200) {
            // COURAGE / EMPOWERED (Purple/White - Expansive)
            root.style.setProperty('--bg-color', '#000000');
            root.style.setProperty('--text-primary', '#FFFFFF');
            root.style.setProperty('--accent-k', '#D500F9');
            root.style.setProperty('--accent-glow', '#E040FB');
            root.style.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.7)');
            root.style.setProperty('--glass-border', '1px solid rgba(213, 0, 249, 0.5)');
        } else {
            // SURVIVAL / CONTRACTIVE (Cyan/Black - Below 200 Gate)
            root.style.setProperty('--bg-color', '#000508'); // Cold Black
            root.style.setProperty('--text-primary', '#80DEEA');
            root.style.setProperty('--accent-k', '#00BCD4'); // Teal/Cyan
            root.style.setProperty('--accent-glow', '#00E5FF');
            root.style.setProperty('--glass-bg', 'rgba(0, 20, 30, 0.8)');
            root.style.setProperty('--glass-border', '1px solid rgba(0, 229, 255, 0.3)');
        }

        // Update Torus Color
        const accentColor = getComputedStyle(root).getPropertyValue('--accent-k').trim();
        if (this.objects.torus && this.objects.torus.material) {
            this.objects.torus.material.color.set(accentColor);
        }
        if (this.objects.innerTorus && this.objects.innerTorus.material) {
            // Inner torus shifts to glow color
            const glowColor = getComputedStyle(root).getPropertyValue('--accent-glow').trim();
            this.objects.innerTorus.material.color.set(glowColor);
        }

        // Update Person/Avatar Color
        if (this.objects.personGroup) {
            this.objects.personGroup.children.forEach(mesh => {
                if (mesh.material) {
                    mesh.material.color.set(accentColor);
                    mesh.material.emissive.set(accentColor);
                }
            });
        }

        // Activate Chakra Nodes based on level (each ~100 Hz)
        if (this.objects.chakraNodes) {
            this.objects.chakraNodes.forEach((node, i) => {
                const threshold = 100 + (i * 100); // 100, 200, ... 700
                node.material.opacity = val >= threshold ? 0.8 : 0.15;
            });
        }
    }

    updateDate() {
        const now = new Date();
        const secs = String(now.getSeconds()).padStart(2, '0');

        if (this._lastSec === secs) return;
        this._lastSec = secs;

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');

        // Reset Counter: Days since Jan 1, 2026 (Scottsdale Move)
        const moveDate = new Date(2026, 0, 1); // Jan 1, 2026
        const daysSinceMove = Math.floor((now - moveDate) / (1000 * 60 * 60 * 24));

        // Cycle 3.0 Progress (based on Resonance)
        const cycleProgress = Math.min(100, (this.state.R / 1000) * 100);

        // Galactic Time (Simulated: Milky Way orbital position)
        const galacticYear = 230; // Million years (current galactic year)
        const galacticProgress = ((now.getTime() / 1000) % 31536000) / 31536000; // Yearly fractional
        const galacticStr = `ω.${galacticYear}M-y (${(galacticProgress * 100).toFixed(2)}%)`;

        // Update Universal Clock Hub
        const clockLocal = document.getElementById('clock-local');
        const clockCycle = document.getElementById('clock-cycle');
        const clockGalactic = document.getElementById('clock-galactic');

        if (clockLocal) {
            clockLocal.innerHTML = `${year}.${month}.${day} | ${hours}:${mins}:${secs} MST`;
        }
        if (clockCycle) {
            clockCycle.innerHTML = `CYCLE 3.0 <span style="color:var(--accent-glow)">${cycleProgress.toFixed(1)}%</span> | RESET +${daysSinceMove}d`;
        }
        if (clockGalactic) {
            clockGalactic.innerHTML = `GALACTIC: ${galacticStr}`;
        }

        // Fallback for old #true-date element if it exists
        const el = document.getElementById('true-date');
        if (el) {
            el.innerHTML = `${year}.${month}.${day} | ${hours}:${mins} MST | Reset +${daysSinceMove}d`;
        }
    }

    addSystemLog(val) {
        // v6.0 Narrative Logs "Consciousness Alerts"
        const container = document.getElementById('system-log');
        if (!container) {
            // If container doesn't exist (it should), create basic one or skip
            return;
        }

        const messages = [
            `[NOTICE] Ego-Resistance detected in D3.5 trajectory.`,
            `[CALIBRATING] Aligning Heart-Center with Scottsdale grid-lines.`,
            `[SUCCESS] Trauma (T) dissipation localized; Resonance climbing.`,
            `[ALERT] Density filter adjusted: 0.82 (Desert).`,
            `[INFO] Toroidal flow synchronized with Alpha node.`,
            `[UPDATE] Sushumna column active. Kundalini rising.`,
            `[SYSTEM] Ouroboros cycle advancing. Harvest imminent.`,
            `[SCAN] Locating energetic signature: 33.4942° N...`
        ];

        // Only add log occasionally
        if (Math.random() > 0.1) return;

        const msg = messages[Math.floor(Math.random() * messages.length)];
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerText = msg;
        div.style.color = msg.includes("SUCCESS") ? "var(--accent-d)" : (msg.includes("ALERT") ? "var(--accent-t)" : "var(--text-secondary)");

        container.appendChild(div);
        if (container.children.length > 5) {
            container.removeChild(container.children[0]);
        }
    }

    drawOscilloscope(R) {
        const canvas = document.getElementById('freq-scope');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        // Use CSS variable if available
        const mainColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-k').trim();
        ctx.strokeStyle = mainColor || '#00E5FF';

        if (this.state.T > 500) ctx.strokeStyle = '#FF0000'; // Red if Trauma high

        ctx.lineWidth = 1.5;

        // Frequency derived from R, Amplitude from K
        const freq = 0.05 + (R * 0.00001);
        const amp = 10;
        const speed = Date.now() * 0.005;

        for (let x = 0; x < w; x++) {
            const y = (h / 2) + Math.sin((x + speed * 100) * freq) * amp * Math.random(); // Add noise
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Target Frequency Marker (Dashed Line) - Feature 5.3
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([5, 5]);
        const targetY = h / 2 - 15; // Offset slightly to show "calibrating" towards it
        ctx.moveTo(0, targetY);
        ctx.lineTo(w, targetY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset
    }

    updateVisuals() {
        const R = this.state.R;
        const val = this.state.K - this.state.T; // Effective Hawkins level
        const time = Date.now() * 0.001;

        // Draw Scope
        this.drawOscilloscope(R);

        // Update Signal Bar
        const sigFill = document.getElementById('signal-fill');
        const sigText = document.getElementById('signal-text');
        if (sigFill) {
            const pct = Math.max(0, Math.min(100, (val / 1000) * 100));
            sigFill.style.width = pct + '%';

            if (sigText) {
                if (pct < 30) { sigText.innerText = "CRITICAL / LOW"; sigText.style.color = "red"; }
                else if (pct < 60) { sigText.innerText = "STABLE / MODERATE"; sigText.style.color = "yellow"; }
                else { sigText.innerText = "OPTIMAL / HIGH"; sigText.style.color = "#00FF00"; }
            }
        }

        // Calibration Stage Highlighting (Bottom Numbers) - Feature 5.3
        const dBtns = document.querySelectorAll('.note-btn');
        dBtns.forEach(btn => {
            const dVal = parseInt(btn.dataset.d);
            if (this.state.W === 1 && dVal === this.state.D) {
                btn.style.borderColor = 'var(--accent-glow)';
                btn.style.boxShadow = '0 0 20px var(--accent-glow)';
                btn.style.transform = `scale(${1.2 + Math.sin(time * 10) * 0.1})`; // Throb
            } else if (!btn.classList.contains('active')) {
                btn.style.borderColor = '';
                btn.style.boxShadow = '';
                btn.style.transform = '';
            }
        });

        // === GLASS-BREAKING EFFECT (High Trauma) ===
        // High Trauma "breaks" the Liquid Glass UI, requiring frequency calibration
        const traumaRatio = this.state.T / 1000; // 0 to 1
        const glassBreakThreshold = 0.5; // 50% trauma starts breaking

        if (traumaRatio > glassBreakThreshold) {
            const breakIntensity = (traumaRatio - glassBreakThreshold) / (1 - glassBreakThreshold); // 0 to 1

            // Canvas distortion
            if (Math.random() < breakIntensity * 0.15) {
                const jitter = breakIntensity * 8;
                this.canvas.style.transform = `translate(${(Math.random() - 0.5) * jitter}px, ${(Math.random() - 0.5) * jitter}px) skew(${(Math.random() - 0.5) * breakIntensity * 2}deg)`;
                this.canvas.style.filter = `hue-rotate(${Math.random() * 30 * breakIntensity}deg) blur(${breakIntensity * 2}px) contrast(${1 + breakIntensity * 0.5})`;
            } else {
                this.canvas.style.transform = 'none';
                this.canvas.style.filter = 'none';
            }

            // Glass Panel Fractures (CSS Class Toggle)
            document.querySelectorAll('.info-module, .user-form-panel').forEach(panel => {
                panel.style.boxShadow = `0 0 ${20 * breakIntensity}px rgba(255, 0, 0, ${breakIntensity * 0.5})`;
                if (Math.random() < breakIntensity * 0.05) {
                    panel.style.clipPath = `polygon(0 0, ${100 - Math.random() * 10 * breakIntensity}% 0, 100% ${Math.random() * 10 * breakIntensity}%, 100% 100%, ${Math.random() * 10 * breakIntensity}% 100%, 0 ${100 - Math.random() * 10 * breakIntensity}%)`;
                } else {
                    panel.style.clipPath = 'none';
                }
            });

            // Depth Slider Lock (Can't zoom out with high trauma)
            const depthSlider = document.getElementById('depth-slider');
            if (depthSlider && breakIntensity > 0.3) {
                depthSlider.style.opacity = 1 - breakIntensity;
                depthSlider.disabled = breakIntensity > 0.7;
            }
        } else {
            this.canvas.style.transform = 'none';
            this.canvas.style.filter = 'none';

            // Restore panels
            document.querySelectorAll('.info-module, .user-form-panel').forEach(panel => {
                panel.style.boxShadow = '';
                panel.style.clipPath = 'none';
            });

            // Restore depth slider
            const depthSlider = document.getElementById('depth-slider');
            if (depthSlider) {
                depthSlider.style.opacity = 1;
                depthSlider.disabled = false;
            }
        }

        // 1. Person Height - INSIDE TORUS
        const targetY = -2 + ((val / 1000) * 4);
        this.objects.personGroup.position.y += (targetY - this.objects.personGroup.position.y) * 0.05;

        // Rotate Person slowly
        if (this.objects.personGroup) {
            this.objects.personGroup.rotation.y -= 0.001;

            // Karmic Echo Jitter (Based on T)
            // "Friction" on Z-Axis
            if (this.state.T > 50) {
                const jitter = (this.state.T / 1000) * 0.1;
                this.objects.personGroup.position.x += (Math.random() - 0.5) * jitter;
                this.objects.personGroup.position.z += (Math.random() - 0.5) * jitter;
                // Damping to keep centered
                this.objects.personGroup.position.x *= 0.9;
                this.objects.personGroup.position.z *= 0.9;
            } else {
                this.objects.personGroup.position.x *= 0.9;
                this.objects.personGroup.position.z *= 0.9;
            }
        }

        // Heart Field Pulse (Bio-Geometric Interface)
        if (this.objects.heartField) {
            // Pulse freq base on Resonance (R)
            // R is ~3500. Sin time needs scaling.
            const pulseSpeed = 5 + (this.state.R * 0.002);
            const pulse = 1 + Math.sin(time * pulseSpeed) * 0.15 * (this.state.W); // W affects magnitude?
            this.objects.heartField.scale.setScalar(pulse);

            // Color transition (Heart 500+ -> Gold)
            if (val >= 500) this.objects.heartField.material.color.setHex(0xFFD700); // Gold
            else this.objects.heartField.material.color.setHex(0x00FF00); // Green
        }

        // 2. Torus Rotation (Energy Field Flow)
        if (this.objects.torus) {
            this.objects.torus.rotation.x += 0.002;
            this.objects.torus.rotation.y += 0.001;
        }
        if (this.objects.innerTorus) {
            this.objects.innerTorus.rotation.x -= 0.003;
            this.objects.innerTorus.rotation.z += 0.002;
        }

        // 2b. Planet Rotation (Solar System)
        if (this.objects.planets) {
            this.objects.planets.forEach(pivot => {
                const speed = pivot.userData.speed || 0.01;
                pivot.rotation.y += speed; // Orbit around sun
            });
        }

        // 3. Compass Group slow rotation
        if (this.objects.compassGroup) {
            this.objects.compassGroup.rotation.y += 0.0003 * (this.state.X + 1);
        }

        // 4. Shadow Shell (Astral Drift)
        if (this.objects.shadowShell) {
            const drift = (1000 - val) * 0.00002;
            this.objects.shadowShell.rotation.y -= (0.0003 + drift);
            this.objects.shadowShell.rotation.x += drift * 0.2;
            this.objects.shadowShell.material.opacity = 0.05 + (Math.sin(time * 3) * 0.03) + (drift * 5);
        }

        // 5. Record rotation
        if (this.objects.record) {
            let speed = 0.001 + (R * 0.000001);
            if (speed > 0.02) speed = 0.02;
            this.objects.record.rotation.z -= speed;
        }

        // 6. Update Z (Trajectory)
        this.state.Z = (Math.sin(time * (1 + (R * 0.0001))) + 1) / 2;

        // 7. Draw Influence Vectors
        this.drawOverlay(val);

        // 8. System Logs
        this.addSystemLog(val);

        // 9. Glow Intensity
        let glow = R > 100 ? Math.min(1, (R / 5000)) : 0;
        this.objects.personGroup.children.forEach(mesh => {
            if (mesh.material) {
                mesh.material.emissiveIntensity = glow * 2;
            }
        });

        // 10. Check Unlocks
        this.checkUnlocks(val);

        // 11. Update Current State Arrow Position
        this.updateStateArrow(val);
    }

    updateStateArrow(val) {
        const arrow = document.getElementById('state-arrow');
        if (!arrow) return;

        // Map val (0-1000) to vertical position (scale is 70% of viewport)
        const pct = Math.max(0, Math.min(1, val / 1000));
        // Invert because higher values are at top
        const topPct = 15 + (70 * (1 - pct)); // 15% to 85% range
        arrow.style.top = topPct + '%';
    }

    drawOverlay(val) {
        if (!this._overlayCanvas) this._overlayCanvas = document.getElementById('connection-overlay');
        const c = this._overlayCanvas;
        if (!c) return;

        // Resize check
        if (c.width !== window.innerWidth || c.height !== window.innerHeight) {
            c.width = window.innerWidth;
            c.height = window.innerHeight;
        }

        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);

        // Only draw influence vectors if T is high or K is being modulated
        // Draw from bottom left inputs to center of screen
        // Assume center is w/2, h/2
        const cx = c.width / 2;
        const cy = c.height / 2;

        // Origin point for vectors (Bottom Left Knob Panel)
        // Approximate position based on UI layout
        const ox = 150;
        const oy = c.height - 80;

        ctx.beginPath();

        // Transparency/Intensity based on T
        const intensity = (this.state.T / 1000);
        if (intensity > 0.1) {
            ctx.strokeStyle = `rgba(255, 42, 104, ${intensity * 0.5})`; // Neon Red
            ctx.lineWidth = 1 + (intensity * 2);

            // Draw multiple jagged lines
            ctx.moveTo(ox, oy);

            // Midpoint jitter
            const mx = (ox + cx) / 2 + (Math.random() - 0.5) * intensity * 100;
            const my = (oy + cy) / 2 + (Math.random() - 0.5) * intensity * 100;

            ctx.lineTo(mx, my);
            ctx.lineTo(cx, cy);
            ctx.stroke();
        }

        // K Vector (Blue/Cyan) - Always subtle connection
        ctx.beginPath();
        const kIntensity = (this.state.K / 1000);
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.1 + kIntensity * 0.2})`;
        ctx.lineWidth = 1;
        ctx.moveTo(ox - 50, oy); // Slightly offset for K slider position
        ctx.lineTo(cx, cy);
        ctx.stroke();
    }





    // --- CALIBRATION & INCARNATION SEQUENCE ---

    startCalibration() {
        const overlay = document.getElementById('calibration-overlay');
        if (overlay) overlay.style.display = 'flex';
        // Reset steps
        const s1 = document.getElementById('calib-step-1');
        const s2 = document.getElementById('calib-step-2');
        const s3 = document.getElementById('calib-step-3');
        if (s1) s1.style.display = 'block';
        if (s2) s2.style.display = 'none';
        if (s3) s3.style.display = 'none';
    }

    nextCalibStep(step) {
        if (step === 1) {
            // Validate X
            const dobInput = document.getElementById('calib-dob');
            if (dobInput && dobInput.value) {
                const year = new Date(dobInput.value).getFullYear();
                const age = new Date().getFullYear() - year;
                // Map Age to Lifecycle X
                this.state.X = Math.min(100, Math.max(0, age));
                // Sync slider if exists
                const xSlider = document.getElementById('slider-x');
                if (xSlider) { xSlider.value = this.state.X; }
            }

            const locInput = document.getElementById('calib-loc');
            if (locInput && locInput.value) {
                this.state.location = locInput.value.toUpperCase();
            } else {
                this.state.location = "SCOTTSDALE, AZ";
            }

            document.getElementById('calib-step-1').style.display = 'none';
            document.getElementById('calib-step-2').style.display = 'block';
        }
        else if (step === 2) {
            // Validate Y
            const branch = document.getElementById('calib-y-q1').value;
            this.state.Y = branch === 'B1' ? 1 : (branch === 'B2' ? 2 : 3);

            // Type for Meta
            const type = document.getElementById('calib-y-type').value;
            this.userMeta = { type: type, branch: branch };

            document.getElementById('calib-step-2').style.display = 'none';
            document.getElementById('calib-step-3').style.display = 'block';

            // Auto-focus Z slider logic?
        }
    }

    finishCalibration() {
        const locSlider = document.getElementById('calib-loc-slider');
        const loc = parseInt(locSlider ? locSlider.value : 500);

        // Z is 0-100 in logic, but represents 0-1000 LOC
        this.state.Z = loc / 10;
        const zSlider = document.getElementById('slider-z');
        if (zSlider) zSlider.value = this.state.Z;

        document.getElementById('calibration-overlay').style.display = 'none';

        // Apply Metadata Visuals
        if (this.userMeta && this.userMeta.type === 'GEN') {
            // Pulse Aura
            // (Handled in updateVisuals loop if we flag it)
            this.state.W = 1.5; // Boost magnitude
        } else if (this.userMeta && this.userMeta.type === 'PRO') {
            // Focused
            this.state.W = 0.8;
        }

        // Trigger Unlock
        this.setTheme(loc);
        this.checkUnlocks(loc);
        this.addSystemLog(`Calibration Complete. Grid Online.`);
    }

    // --- DIMENSION GRID CONTROL (1-10) ---
    setDimension(dim) {
        // Remove old Grid
        if (this.objects.floorGrid) {
            this.scene.remove(this.objects.floorGrid);
            if (this.objects.floorGrid.geometry) this.objects.floorGrid.geometry.dispose();
        }

        // --- 1D-5D: Standard Grid with Distortion ---
        if (dim <= 5) {
            const size = 100;
            const divs = Math.max(10, 10 * dim);
            let color = 0x444444;
            if (dim === 3) color = 0x00FFFF; // 3D Standard
            if (dim === 4) color = 0x9D00FF; // Time (Purple)
            if (dim === 5) color = 0xFF00FF; // 5D (Neon pink)

            const grid = new THREE.GridHelper(size, divs, color, 0x111111);

            // Distortion
            if (dim >= 4) {
                const pos = grid.geometry.attributes.position;
                const arr = pos.array;
                for (let i = 0; i < arr.length; i += 3) {
                    const x = arr[i];
                    const z = arr[i + 2];
                    const d = Math.sqrt(x * x + z * z);
                    const y = Math.sin(d * 0.1 * (dim - 3)) * (dim - 3);
                    arr[i + 1] = y;
                }
                pos.needsUpdate = true;
            }
            this.objects.floorGrid = grid;
        }
        // --- 6D-10D: THE UNIVERSAL LOOM ---
        else {
            this.objects.floorGrid = this.createLoomGeometry(dim);

            // Trigger "Destiny" Shift on high dims or transition
            if (dim >= 8) this.triggerTimelineJump();
        }

        this.objects.floorGrid.position.y = -2;
        this.scene.add(this.objects.floorGrid);

        // Update UI Info
        this.updateDimensionInfo(dim);

        // Highlight active button
        document.querySelectorAll('.dim-btn').forEach((b, i) => {
            if (i + 1 === dim) b.classList.add('active');
            else b.classList.remove('active');
        });
    }

    createLoomGeometry(dim) {
        const group = new THREE.Group();
        const width = 100;

        // 1. Vertical Warp (Source) - Curved Wall
        const warpGeo = new THREE.BufferGeometry();
        const warpPos = [];

        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * Math.PI - (Math.PI / 2);
            const r = 40;
            const x = Math.sin(angle) * r;
            const z = Math.cos(angle) * r - 20;

            warpPos.push(x, -10, z, x, 40, z); // Vertical line
        }
        warpGeo.setAttribute('position', new THREE.Float32BufferAttribute(warpPos, 3));
        const warpMat = new THREE.LineBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.3 });
        group.add(new THREE.LineSegments(warpGeo, warpMat));

        // 2. Horizontal Weft (Habits)
        const weftGeo = new THREE.BufferGeometry();
        const weftPos = [];

        for (let y = -5; y < 40; y += 2) {
            const curvePoints = [];
            for (let i = 0; i <= 60; i++) {
                const angle = (i / 60) * Math.PI - (Math.PI / 2);
                const r = 40;
                const x = Math.sin(angle) * r;
                let z = Math.cos(angle) * r - 20;

                // Habit Wave
                z += Math.sin(x * 0.5 + Date.now() * 0.0001) * 2;

                if (i > 0) {
                    weftPos.push(curvePoints[curvePoints.length - 3], curvePoints[curvePoints.length - 2], curvePoints[curvePoints.length - 1]);
                    weftPos.push(x, y, z);
                }
                curvePoints.push(x, y, z);
            }
        }
        weftGeo.setAttribute('position', new THREE.Float32BufferAttribute(weftPos, 3));
        const weftMat = new THREE.LineBasicMaterial({ color: 0x9D00FF, transparent: true, opacity: 0.5 });
        group.add(new THREE.LineSegments(weftGeo, weftMat));

        return group;
    }

    triggerTimelineJump() {
        this.addSystemLog(`5D Probability Field Expanded`);
        // Spiral Animation Logic (Simplified for stability)
        const sGeo = new THREE.BufferGeometry();
        const pos = new Float32Array(300 * 3);
        sGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const sMat = new THREE.PointsMaterial({ color: 0xFFD700, size: 0.4, transparent: true });
        const spiral = new THREE.Points(sGeo, sMat);
        this.scene.add(spiral);

        let t = 0;
        const anim = () => {
            t += 0.05;
            for (let i = 0; i < 300; i++) {
                const angle = i * 0.1 + t;
                const r = (i * 0.05) * t;
                pos[i * 3] = Math.cos(angle) * r;
                pos[i * 3 + 1] = Math.sin(t * 2 + i * 0.01) * 2;
                pos[i * 3 + 2] = Math.sin(angle) * r;
            }
            sGeo.attributes.position.needsUpdate = true;
            sMat.opacity = 1 - (t / 10);
            if (t < 10) requestAnimationFrame(anim);
            else this.scene.remove(spiral);
        };
        anim();
    }

    updateDimensionInfo(dim) {
        // Update Lifestyle Tips
        const habits = {
            1: "1D: Physicality - Grounding & Heirloom Nutrition",
            2: "2D: Emotional - Regenerative Living vs Synthetic",
            3: "3D: Ego/Action - Conscious Craftsmanship",
            4: "4D: Time - Deep Work vs Time Leaks",
            5: "5D: Probability - Synchronicity Tracking",
            6: "6D: Geometry - Sacred Creation (Signal vs Noise)",
            7: "7D: Shared Myth - Communal Sovereignty",
            8: "8D: Collective - Global Consciousness Seeding",
            9: "9D: Source - Avatar Alignment",
            10: "10D: ALL - The Forgotten Soul"
        };
        const text = habits[dim] || "Unknown Dimension";
        this.addSystemLog(text);

        // Update a specific UI element 
        let floatLabel = document.getElementById('dim-float-label');
        if (!floatLabel) {
            floatLabel = document.createElement('div');
            floatLabel.id = 'dim-float-label';
            floatLabel.style.position = 'fixed';
            floatLabel.style.bottom = '100px';
            floatLabel.style.width = '100%';
            floatLabel.style.textAlign = 'center';
            floatLabel.style.color = 'var(--text-primary)';
            floatLabel.style.fontFamily = 'Rajdhani';
            floatLabel.style.fontSize = '1.5rem';
            floatLabel.style.textShadow = '0 0 10px #000';
            floatLabel.style.pointerEvents = 'none';
            document.body.appendChild(floatLabel);
        }
        floatLabel.innerHTML = `<span style='color:var(--accent-k)'>${text.split(':')[0]}</span><span style='display:block; font-size:1rem; color:#fff; margin-top:5px;'>${text.split(':')[1]}</span>`;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.updateDate();
        this.calculateLogic();
        this.updateVisuals();

        // Smooth Zoom Interpolation
        if (this.targetCameraZ) {
            this.camera.position.z += (this.targetCameraZ - this.camera.position.z) * 0.05;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    window.matrixApp = new MatrixCore();
    window.matrixCore = window.matrixApp; // Alias for HTML
});
