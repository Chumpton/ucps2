// Cosmic Viewer Logic using Three.js

class CosmicViewerSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Ensure Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.error('Three.js is not loaded.');
            return;
        }

        // Setup Scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Hide loading text
        const loader = document.getElementById('cosmic-loading');
        if (loader) loader.style.display = 'none';

        // Add Resize Listener
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });

        // Initialize groups for different scales
        this.groups = {
            earth: new THREE.Group(),
            solarSystem: new THREE.Group(),
            galaxy: new THREE.Group(),
            universe: new THREE.Group(),
            multiverse: new THREE.Group(),
            source: new THREE.Group()
        };

        for (const key in this.groups) {
            this.scene.add(this.groups[key]);
            this.groups[key].visible = false;
        }

        this.currentMode = 'earth';
        this.clock = new THREE.Clock();

        this.buildScenes();
        this.zoomTo('earth'); // Start at earth
        this.animate();
    }

    buildScenes() {
        // --- Earth Mode ---
        const earthGeometry = new THREE.SphereGeometry(2, 64, 64);

        // Load an Earth texture (using a reliable open-source CDN URL for Earth map)
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');

        const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthTexture,
            color: 0xffffff,
            emissive: 0x112244,
            shininess: 15
        });
        this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);

        // Atmosphere glow
        const atmoGeometry = new THREE.SphereGeometry(2.1, 32, 32);
        const atmoMaterial = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        this.atmoMesh = new THREE.Mesh(atmoGeometry, atmoMaterial);

        this.groups.earth.add(this.earthMesh);
        this.groups.earth.add(this.atmoMesh);

        // Basic Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(5, 3, 5);
        this.scene.add(sunLight);

        // --- Solar System Mode ---
        const sunGeo = new THREE.SphereGeometry(3, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        this.groups.solarSystem.add(this.sunMesh);

        this.planets = [];
        const planetData = [
            { r: 0.3, distance: 5, color: 0x888888, speed: 0.04 }, // Mercury
            { r: 0.6, distance: 7, color: 0xe3bb76, speed: 0.03 }, // Venus
            { r: 0.7, distance: 10, color: 0x2233ff, speed: 0.02 }, // Earth
            { r: 0.4, distance: 13, color: 0xff4422, speed: 0.015 }, // Mars
            { r: 1.5, distance: 18, color: 0xd39c7e, speed: 0.008 } // Jupiter
        ];

        planetData.forEach(p => {
            const geo = new THREE.SphereGeometry(p.r, 16, 16);
            const mat = new THREE.MeshPhongMaterial({ color: p.color });
            const mesh = new THREE.Mesh(geo, mat);

            // Orbit path
            const pathGeo = new THREE.RingGeometry(p.distance - 0.05, p.distance + 0.05, 64);
            const pathMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
            const pathMesh = new THREE.Mesh(pathGeo, pathMat);
            pathMesh.rotation.x = Math.PI / 2;

            this.groups.solarSystem.add(pathMesh);
            this.groups.solarSystem.add(mesh);
            this.planets.push({ mesh, distance: p.distance, speed: p.speed, angle: Math.random() * Math.PI * 2 });
        });

        // --- Galaxy Mode ---
        const particleCount = 10000;
        const galaxyGeo = new THREE.BufferGeometry();
        const galaxyPos = new Float32Array(particleCount * 3);
        const galaxyColors = new Float32Array(particleCount * 3);
        const colorInside = new THREE.Color(0xffd700);
        const colorOutside = new THREE.Color(0xb14bf4);

        for (let i = 0; i < particleCount; i++) {
            const radius = Math.random() * 20;
            const branchAngle = (i % 3) * ((Math.PI * 2) / 3);
            const spinAngle = radius * 0.5;

            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2;
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2;
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2;

            galaxyPos[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            galaxyPos[i * 3 + 1] = randomY * 0.5; // flatten
            galaxyPos[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            // Colors based on distance from center
            const mixedColor = colorInside.clone().lerp(colorOutside, radius / 20);
            galaxyColors[i * 3] = mixedColor.r;
            galaxyColors[i * 3 + 1] = mixedColor.g;
            galaxyColors[i * 3 + 2] = mixedColor.b;
        }

        galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
        galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));
        const galaxyMat = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        });

        this.galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat);
        this.groups.galaxy.add(this.galaxyPoints);

        // --- Universe Mode ---
        const univGeo = new THREE.BufferGeometry();
        const univPos = new Float32Array(20000 * 3);
        for (let i = 0; i < 20000; i++) {
            univPos[i * 3] = (Math.random() - 0.5) * 100;
            univPos[i * 3 + 1] = (Math.random() - 0.5) * 100;
            univPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }
        univGeo.setAttribute('position', new THREE.BufferAttribute(univPos, 3));
        const univMat = new THREE.PointsMaterial({ color: 0x88bbff, size: 0.2, transparent: true, opacity: 0.5 });
        this.universePoints = new THREE.Points(univGeo, univMat);
        this.groups.universe.add(this.universePoints);

        // --- Multiverse Mode ---
        for (let i = 0; i < 30; i++) {
            const bGeo = new THREE.SphereGeometry(Math.random() * 4 + 2, 16, 16);
            const bMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending,
                wireframe: true
            });
            const bubble = new THREE.Mesh(bGeo, bMat);
            bubble.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80
            );
            this.groups.multiverse.add(bubble);
        }

        // --- Source Mode ---
        const srcGeo = new THREE.SphereGeometry(4, 64, 64);
        const srcMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.sourceMesh = new THREE.Mesh(srcGeo, srcMat);
        this.groups.source.add(this.sourceMesh);

        // Huge energetic particles wrapping source
        const srcPartGeo = new THREE.BufferGeometry();
        const srcPartPos = new Float32Array(5000 * 3);
        for (let i = 0; i < 5000; i++) {
            const r = 4 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            srcPartPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            srcPartPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            srcPartPos[i * 3 + 2] = r * Math.cos(phi);
        }
        srcPartGeo.setAttribute('position', new THREE.BufferAttribute(srcPartPos, 3));
        const srcPartMat = new THREE.PointsMaterial({ color: 0xffd700, size: 0.1, blending: THREE.AdditiveBlending, transparent: true });
        this.sourcePoints = new THREE.Points(srcPartGeo, srcPartMat);
        this.groups.source.add(this.sourcePoints);
    }

    zoomTo(mode) {
        this.currentMode = mode;

        // Hide all, show target
        for (const key in this.groups) {
            this.groups[key].visible = (key === mode);
        }

        // Update button UI
        document.querySelectorAll('.zoom-controls button').forEach(btn => btn.classList.remove('active'));
        const btnIdMap = {
            'earth': 'btn-zoom-earth',
            'solarSystem': 'btn-zoom-solar',
            'galaxy': 'btn-zoom-galaxy',
            'universe': 'btn-zoom-universe',
            'multiverse': 'btn-zoom-multiverse',
            'source': 'btn-zoom-source'
        };
        const activeBtn = document.getElementById(btnIdMap[mode]);
        if (activeBtn) activeBtn.classList.add('active');

        // Reset camera based on mode
        switch (mode) {
            case 'earth':
                this.camera.position.set(0, 0, 8);
                break;
            case 'solarSystem':
                this.camera.position.set(0, 15, 25);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'galaxy':
                this.camera.position.set(0, 20, 30);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'universe':
                this.camera.position.set(0, 0, 100);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'multiverse':
                this.camera.position.set(0, 0, 120);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'source':
                this.camera.position.set(0, 0, 20);
                this.camera.lookAt(0, 0, 0);
                break;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        if (this.currentMode === 'earth') {
            this.earthMesh.rotation.y += 0.5 * delta;
        }
        else if (this.currentMode === 'solarSystem') {
            this.sunMesh.rotation.y += 0.1 * delta;
            this.groups.solarSystem.rotation.y = time * 0.05; // slowly rotate entire system

            this.planets.forEach(p => {
                p.angle += p.speed;
                p.mesh.position.x = Math.cos(p.angle) * p.distance;
                p.mesh.position.z = Math.sin(p.angle) * p.distance;
                p.mesh.rotation.y += 1 * delta; // Local spin
            });
        }
        else if (this.currentMode === 'galaxy') {
            this.galaxyPoints.rotation.y -= 0.05 * delta;
        }
        else if (this.currentMode === 'universe') {
            this.universePoints.rotation.y = time * 0.02;
            this.universePoints.rotation.x = time * 0.01;
        }
        else if (this.currentMode === 'multiverse') {
            this.groups.multiverse.rotation.y = time * 0.03;
            // animate bubbles slightly
            this.groups.multiverse.children.forEach((c, i) => {
                c.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
            });
        }
        else if (this.currentMode === 'source') {
            this.sourcePoints.rotation.y -= 0.2 * delta;
            this.sourcePoints.rotation.z += 0.1 * delta;

            // Pulse source
            const scale = 1 + Math.sin(time * 3) * 0.05;
            this.sourceMesh.scale.set(scale, scale, scale);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // delay initialization slightly to let UI settle
    setTimeout(() => {
        window.CosmicViewer = new CosmicViewerSystem('cosmic-canvas-container');
    }, 100);
});
