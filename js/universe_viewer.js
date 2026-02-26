/**
 * SCENE ENGINE v2.1 - UCPS INTEGRATION
 * Features: X (Time), Y (Timeline/Color), Z (Realm/Shader), Compass Focus (Red Dot)
 */

class UniverseViewer {
    constructor() {
        this.container = document.getElementById('universe-viewer');
        this.labelContainer = document.getElementById('universe-labels');
        if (!this.container) return;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clock = new THREE.Clock();

        // UCPS State
        this.ucps = {
            x: 13, // Lifecycle %
            y: 'B1', // Branch
            z: 'PHYSICAL', // Realm
            focus: 'Overview' // Default to System view (no zoom)
        };

        this.init();
        this.createMaterials();
        this.createObjects();
        this.initInteraction();
        this.bindUCPS(); // New Binding
        this.animate();

        // Trigger initial focus
        this.setFocus(this.ucps.focus);

        window.addEventListener('resize', () => this.onResize());
    }

    bindUCPS() {
        // X: Lifecycle (Time)
        const xInput = document.getElementById('ucps-x');
        if (xInput) {
            xInput.addEventListener('input', (e) => {
                this.ucps.x = parseInt(e.target.value);
                this.updateSystemTime();
            });
        }

        // Y: Branch (Timeline/Color)
        const yInput = document.getElementById('ucps-y');
        if (yInput) {
            yInput.addEventListener('change', (e) => {
                this.ucps.y = e.target.value;
                this.updateTimelineBranch();
            });
        }

        // Z: Realm (Shader/Visuals)
        const zInput = document.getElementById('ucps-z');
        if (zInput) {
            zInput.addEventListener('change', (e) => {
                this.ucps.z = e.target.value;
                this.updateRealm();
            });
        }

        // Focus: Target
        const fInput = document.getElementById('ucps-focus');
        if (fInput) {
            fInput.addEventListener('change', (e) => {
                this.ucps.focus = e.target.value;
                this.setFocus(this.ucps.focus);
            });
        }
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);
        this.scene.fog = new THREE.FogExp2(0x000000, 0.001);

        // Camera
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 2000);
        this.camera.position.set(0, 40, 60);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxDistance = 5000;
            this.controls.minDistance = 5;
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);

        this.sunLight = new THREE.PointLight(0xFFFFFF, 2, 300);
        this.sunLight.castShadow = true;
        this.scene.add(this.sunLight);
    }

    createMaterials() {
        // FRESNEL ATMOSPHERE SHADER
        this.atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(0x00aaff) },
                viewVector: { value: new THREE.Vector3() },
                c: { value: 1.0 },
                p: { value: 6.0 }, // Higher power = thinner rim
                alpha: { value: 0.8 }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                uniform float c;
                uniform float p;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(c - dot(vNormal, vNormel), p);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float alpha;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, alpha * intensity);
                }
            `,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });

        // RED DOT MARKER MATERIAL (Compass)
        this.redDotMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });

        // GALAXY MATERIAL
        this.galaxyMat = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0, // Start hidden
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        // UNIVERSE MATERIAL
        this.universeMat = new THREE.PointsMaterial({
            color: 0x8888AA,
            size: 0.5,
            transparent: true,
            opacity: 0
        });
    }

    createObjects() {
        this.createStarfield();
        this.createSolarSystem();
        this.createGalaxies();
        this.createVisibleUniverse();
        this.createRedDot();
    }

    createStarfield() {
        const starGeo = new THREE.BufferGeometry();
        const starCount = 2000;
        const positions = [];
        for (let i = 0; i < starCount; i++) {
            positions.push((Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500);
        }
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const starMat = new THREE.PointsMaterial({ color: 0x888888, size: 0.5 });
        this.stars = new THREE.Points(starGeo, starMat);
        this.scene.add(this.stars);
    }

    createSolarSystem() {
        this.solarGroup = new THREE.Group();
        this.scene.add(this.solarGroup);

        // --- Sun ---
        const sunGeo = new THREE.SphereGeometry(4, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFDD00 });
        this.sun = new THREE.Mesh(sunGeo, sunMat);

        // Glow
        const spriteMat = new THREE.SpriteMaterial({
            map: this.createGlowTexture(),
            color: 0xFF5500,
            transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
        });
        const sunGlow = new THREE.Sprite(spriteMat);
        sunGlow.scale.set(30, 30, 1);
        this.sun.add(sunGlow);
        this.solarGroup.add(this.sun);

        // --- Planets ---
        this.planets = [];

        const pData = [
            { name: "Mercury", r: 10, speed: 0.04, size: 0.8, color: 0xA5A5A5, glow: 0xCCCCCC },
            { name: "Venus", r: 15, speed: 0.025, size: 1.2, color: 0xE1C699, glow: 0xFFDD00 },
            { name: "Earth", r: 22, speed: 0.02, size: 1.3, color: 0x2244FF, glow: 0x0088FF },
            { name: "Mars", r: 30, speed: 0.016, size: 1.0, color: 0xFF3300, glow: 0xFF0000 },
            { name: "Jupiter", r: 45, speed: 0.008, size: 3.5, color: 0xD9B889, glow: 0xFFA500 },
            { name: "Saturn", r: 60, speed: 0.006, size: 3.0, color: 0xF4D03F, glow: 0xFFD700, ring: true },
            { name: "Uranus", r: 75, speed: 0.004, size: 2.0, color: 0x4FD8F2, glow: 0x00FFFF },
            { name: "Neptune", r: 90, speed: 0.003, size: 2.0, color: 0x2E67F8, glow: 0x0000FF },
            { name: "Pluto", r: 105, speed: 0.002, size: 0.6, color: 0x988275, glow: 0xAAAAAA }
        ];

        pData.forEach(data => {
            const orbitGroup = new THREE.Group();

            // Orbit Ring
            const ringGeo = new THREE.TorusGeometry(data.r, 0.05, 128, 128);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.4 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            this.solarGroup.add(ring);

            // Planet Mesh
            const pGeo = new THREE.SphereGeometry(data.size, 32, 32);
            const pMat = new THREE.MeshStandardMaterial({
                color: data.color, metalness: 0.2, roughness: 0.8
            });
            const planet = new THREE.Mesh(pGeo, pMat);
            planet.position.set(data.r, 0, 0);

            // Atmosphere
            const atmoGeo = new THREE.SphereGeometry(data.size * 1.2, 32, 32);
            const atmoMat = this.atmosphereMaterial.clone();
            atmoMat.uniforms.glowColor.value.setHex(data.glow);
            const atmo = new THREE.Mesh(atmoGeo, atmoMat);
            planet.add(atmo);

            // Saturn Ring
            if (data.ring) {
                const sRingGeo = new THREE.TorusGeometry(data.size * 1.8, 0.6, 2, 64);
                const sRingMat = new THREE.MeshBasicMaterial({ color: 0xCBAF75, transparent: true, opacity: 0.7 });
                const sRing = new THREE.Mesh(sRingGeo, sRingMat);
                sRing.rotation.x = Math.PI / 2.5;
                sRing.scale.z = 0.1;
                planet.add(sRing);
            }

            orbitGroup.add(planet);

            // Store original speed
            orbitGroup.userData = {
                speed: data.speed * 0.7,
                radius: data.r,
                origColor: data.color,
                name: data.name
            };

            this.solarGroup.add(orbitGroup); // Add to group, not scene
            this.planets.push({ mesh: planet, group: orbitGroup, atmo: atmo, data: data });
        });
    }

    createRedDot() {
        const dotGeo = new THREE.SphereGeometry(0.3, 16, 16);
        this.redDot = new THREE.Mesh(dotGeo, this.redDotMat);
        this.redDot.visible = false;
        this.scene.add(this.redDot);
    }

    createGalaxies() {
        this.galaxyGroup = new THREE.Group();
        this.galaxyGroup.visible = false;

        const galaxyCount = 20;
        for (let i = 0; i < galaxyCount; i++) {
            const size = 50 + Math.random() * 50;
            const branches = 3 + Math.floor(Math.random() * 3);
            const color = new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.5);

            const galaxy = this.generateGalaxyParticles(size, branches, color);

            const r = 300 + Math.random() * 700;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            galaxy.position.set(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );

            galaxy.lookAt(0, 0, 0);
            galaxy.rotation.z = Math.random() * Math.PI;
            this.galaxyGroup.add(galaxy);
        }
        this.scene.add(this.galaxyGroup);
    }

    generateGalaxyParticles(radius, branches, color) {
        const particles = 1000;
        const positions = [];
        const colors = [];

        for (let i = 0; i < particles; i++) {
            const rad = Math.random() * radius;
            const spinAngle = rad * 0.1;
            const branchAngle = (i % branches) / branches * Math.PI * 2;

            const mixedColor = color.clone();
            mixedColor.lerp(new THREE.Color(0xFFFFFF), Math.random() * 0.5);

            const x = Math.cos(branchAngle + spinAngle) * rad + (Math.random() - 0.5) * 5;
            const y = (Math.random() - 0.5) * (radius * 0.1);
            const z = Math.sin(branchAngle + spinAngle) * rad + (Math.random() - 0.5) * 5;

            positions.push(x, y, z);
            colors.push(mixedColor.r, mixedColor.g, mixedColor.b);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        return new THREE.Points(geo, this.galaxyMat);
    }

    createVisibleUniverse() {
        this.universeGroup = new THREE.Group();
        this.universeGroup.visible = false;

        const count = 5000;
        const positions = [];
        for (let i = 0; i < count; i++) {
            const r = 1000 + Math.random() * 3000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            positions.push(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const points = new THREE.Points(geo, this.universeMat);
        this.universeGroup.add(points);
        this.scene.add(this.universeGroup);
    }

    createGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.3, 'rgba(255,255,255,0.4)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 32, 32);
        return new THREE.CanvasTexture(canvas);
    }

    // --- UCPS LOGIC ---

    updateSystemTime() {
        // X-Axis: Lifecycle Stage (0-100)
        // Controls "Age of Universe" visuals
        const t = this.ucps.x;

        // Also dim/redshift stars if X > 90 (Heat Death) (Juice)
        if (t > 90) {
            this.scene.background.setHex(0x000000);
            this.sunLight.intensity = 0.2;
            this.sunLight.color.setHex(0xFF0000); // Red Dwarf
        } else {
            this.scene.background.setHex(0x050505);
            this.sunLight.intensity = 2;
            this.sunLight.color.setHex(0xFFFFFF);
        }
    }

    updateTimelineBranch() {
        // Y-Axis: Changes Planet Colors/Mood
        const branch = this.ucps.y;

        this.planets.forEach(p => {
            const mat = p.mesh.material;

            if (branch === 'B2') { // SHATTERED (Desaturated / Destroyed)
                if (p.data.name === 'Earth') mat.color.setHex(0x555555); // Dead Earth
                else mat.color.setHex(0x888888);
            } else if (branch === 'B3') { // NEON (Cyberpunk)
                if (p.data.name === 'Earth') mat.color.setHex(0xFF00FF);
                else mat.color.setHSL(Math.random(), 1, 0.5); // Random Neon
            } else { // B1 PRIME (Original)
                mat.color.setHex(p.group.userData.origColor);
            }
        });
    }

    updateRealm() {
        // Z-Axis: Shader Intensity & Trails
        const realm = this.ucps.z;

        this.planets.forEach(p => {
            // Atmosphere Intensity
            if (realm === 'ASTRAL') {
                p.atmo.material.uniforms.p.value = 2.0; // Stronger glow
                p.atmo.material.uniforms.alpha.value = 0.9;
                // Enable trails? (MVP: just glow)
            } else if (realm === 'SOURCE') {
                p.atmo.material.uniforms.p.value = 1.0; // Blowout
                p.atmo.material.uniforms.glowColor.value.setHex(0xFFD700); // Gold
            } else { // PHYSICAL
                p.atmo.material.uniforms.p.value = 6.0; // Thin rim
                p.atmo.material.uniforms.glowColor.value.setHex(p.data.glow); // Restore color
            }
        });
    }

    setFocus(targetName) {
        // Find planet
        const target = this.planets.find(p => p.data.name === targetName);

        if (target) {
            this.focusedObj = target.mesh;
            this.isFocused = true;

            // Add Red Dot to target
            // We need to attach red dot to the planet mesh so it orbits with it
            target.mesh.add(this.redDot);
            this.redDot.position.set(0, target.data.size + 0.5, 0); // Float above/on surface
            this.redDot.visible = true;

        } else {
            // Overview
            this.focusedObj = null;
            this.isFocused = false;
            this.redDot.visible = false;
        }
    }

    // --- MAIN LOOP ---

    initInteraction() {
        const onMove = (e) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        };
        this.renderer.domElement.addEventListener('mousemove', onMove);

        // Click to Select Planet
        this.renderer.domElement.addEventListener('click', (e) => {
            // Raycast
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(
                this.planets.map(p => p.mesh)
            );

            if (intersects.length > 0) {
                const targetMesh = intersects[0].object;
                // Find planet data object
                const pObj = this.planets.find(p => p.mesh === targetMesh);
                if (pObj) {
                    this.setFocus(pObj.data.name);
                    // Update Dropdown UI
                    const fInput = document.getElementById('ucps-focus');
                    if (fInput) fInput.value = pObj.data.name;
                }
            } else {
                // Clicked empty space? Go back to Overview
                this.setFocus('Overview');
                const fInput = document.getElementById('ucps-focus');
                if (fInput) fInput.value = 'Overview';
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 1. Auto Rotation
        this.planets.forEach(pObj => {
            if (pObj.group) {
                pObj.group.rotation.y += pObj.group.userData.speed; // Orbit
            }
        });
        if (this.sun) this.sun.rotation.y += 0.002;

        // --- LOD / ZOOM VISIBILITY ---
        const dist = this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));

        // Solar System: Fade out as we leave
        if (this.solarGroup) {
            // Simple toggle for performance, or logic to fade could be added here
            this.solarGroup.visible = dist < 2000; // Keep visible longer for smooth transition
        }

        // Galaxy Layer: Appear 300+, Peak 1000
        if (this.galaxyGroup) {
            this.galaxyGroup.visible = dist > 300;
            if (this.galaxyMat) {
                let op = 0;
                // Fade In: 300 -> 1000
                if (dist > 300) op = Math.min(1, (dist - 300) / 700);
                // Fade Out: 2500 -> 4000
                if (dist > 2500) op = Math.max(0, 1 - (dist - 2500) / 1500);
                this.galaxyMat.opacity = op;
            }
        }

        // Universe Layer: Appear 2000+
        if (this.universeGroup) {
            this.universeGroup.visible = dist > 2000;
            if (this.universeMat) {
                let op = 0;
                // Fade In: 2000 -> 3500
                if (dist > 2000) op = Math.min(1, (dist - 2000) / 1500);
                this.universeMat.opacity = op;
            }
        }

        // 2. Camera Focus Logic
        if (this.isFocused && this.focusedObj) {
            // Get World Position of target
            const targetPos = new THREE.Vector3();
            this.focusedObj.getWorldPosition(targetPos);

            // Offset logic
            const offset = new THREE.Vector3(5, 5, 5); // Diagonal offset
            const desiredCamPos = targetPos.clone().add(offset);

            // LERP Camera
            this.camera.position.lerp(desiredCamPos, 0.05);
            this.controls.target.lerp(targetPos, 0.05);
        } else {
            // Overview logic - if just switched to System, maybe drift back?
            // controls.target auto handles center (0,0,0) if we reset it, but OrbitControls remembers last target
            // We gently pull target back to 0,0,0
            this.controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        }

        // 3. Red Dot Pulse (Compass)
        if (this.redDot.visible) {
            const scale = 1 + Math.sin(this.clock.getElapsedTime() * 10) * 0.3;
            this.redDot.scale.set(scale, scale, scale);
            // Color shift based on Y?
            if (this.ucps.y === 'B3') this.redDot.material.color.setHex(0x00FFFF);
            else this.redDot.material.color.setHex(0xFF0000);
        }

        // 4. Atmosphere Shaders
        this.planets.forEach(p => {
            if (p.atmo) {
                const viewVec = new THREE.Vector3().subVectors(this.camera.position, p.mesh.getWorldPosition(new THREE.Vector3()));
                p.atmo.material.uniforms.viewVector.value = viewVec;
            }
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        if (!this.container) return;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }
}

document.addEventListener('DOMContentLoaded', () => { setTimeout(() => new UniverseViewer(), 500); });
