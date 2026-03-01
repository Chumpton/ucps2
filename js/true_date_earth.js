// Simple 3D Earth Module using Three.js specifically for the True Date Widget
function initTrueDateEarth() {
    const container = document.getElementById('true-date-earth-model');
    if (!container) return;

    // Ensure Three.js is loaded
    if (typeof THREE === 'undefined') {
        setTimeout(initTrueDateEarth, 500); // Retry if script tag hasn't finished loading
        return;
    }

    const scene = new THREE.Scene();

    // Adjust camera for a clean view within the component
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create Earth sphere
    const geometry = new THREE.SphereGeometry(2, 64, 64);

    // Load reliable earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('assets/earth_map.jpg');

    const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        specular: new THREE.Color('grey'),
        shininess: 10
    });

    const earth = new THREE.Mesh(geometry, material);

    // Tilt the earth slightly on its axis
    earth.rotation.z = 23.5 * Math.PI / 180;

    scene.add(earth);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Subtle backlight for the "glow" edge effect
    const backLight = new THREE.DirectionalLight(0x00d4ff, 0.4);
    backLight.position.set(-5, 0, -5);
    scene.add(backLight);

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Spin the earth slowly
        if (window.targetEarthRotationY !== undefined) {
            earth.rotation.y += (window.targetEarthRotationY - earth.rotation.y) * 0.05;
        } else {
            earth.rotation.y += 0.002;
        }

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    // Setup Planet Orbit Controls and Buttons
    setupPlanetButtons(earth, textureLoader);
}

const PLANET_DATA = {
    'mercury': { name: 'Mercury', map: 'assets/earth_map.jpg', color: 0xa8a8a8, scale: 0.38, year: 88, dayLengthHours: 1408 },
    'venus': { name: 'Venus', map: 'assets/earth_map.jpg', color: 0xe3bb76, scale: 0.94, year: 225, dayLengthHours: 5832 },
    'earth': { name: 'Terra (Earth)', map: 'assets/earth_map.jpg', color: 0xffffff, scale: 1, year: 365.25, dayLengthHours: 24 },
    'mars': { name: 'Mars', map: 'assets/earth_map.jpg', color: 0xc1440e, scale: 0.53, year: 687, dayLengthHours: 24.6 },
    'jupiter': { name: 'Jupiter', map: 'assets/earth_map.jpg', color: 0xd39c7e, scale: 1.5, year: 4333, dayLengthHours: 9.9 }, // Scaled down virtually for UI
    'saturn': { name: 'Saturn', map: 'assets/earth_map.jpg', color: 0xead6b8, scale: 1.4, year: 10759, dayLengthHours: 10.7 },
    'uranus': { name: 'Uranus', map: 'assets/earth_map.jpg', color: 0x4b70dd, scale: 1.2, year: 30687, dayLengthHours: 17.2 },
    'neptune': { name: 'Neptune', map: 'assets/earth_map.jpg', color: 0x274687, scale: 1.2, year: 60190, dayLengthHours: 16.1 }
};

function setupPlanetButtons(globeMesh, texLoader) {
    const container = document.getElementById('true-date-earth-model');
    if (!container) return;

    // Create Button Container directly layered over the Canvas
    const btnBox = document.createElement('div');
    btnBox.style.cssText = `
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 0.3rem;
        z-index: 10;
        background: rgba(0,0,0,0.6);
        padding: 5px 10px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.2);
    `;

    Object.keys(PLANET_DATA).forEach(planetKey => {
        const pBtn = document.createElement('button');
        pBtn.innerText = planetKey.charAt(0).toUpperCase();
        pBtn.title = PLANET_DATA[planetKey].name;
        pBtn.style.cssText = `
            width: 20px; height: 20px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); 
            background: #${PLANET_DATA[planetKey].color.toString(16)}; color: ${planetKey === 'earth' || planetKey === 'venus' ? '#000' : '#fff'};
            font-size: 0.6rem; font-weight: bold; cursor: pointer; transition: all 0.2s;
            display: flex; justify-content: center; align-items: center; padding: 0;
            opacity: ${planetKey === 'earth' ? '1' : '0.5'};
        `;

        pBtn.addEventListener('click', (e) => {
            // Update active state
            Array.from(btnBox.children).forEach(b => b.style.opacity = '0.5');
            e.target.style.opacity = '1';

            // Change Globe Mesh visuals (color tint for now since we don't have separate maps)
            globeMesh.material.color.setHex(PLANET_DATA[planetKey].color);
            globeMesh.scale.set(PLANET_DATA[planetKey].scale, PLANET_DATA[planetKey].scale, PLANET_DATA[planetKey].scale);

            // Update Global Logic for UCPS String
            if (window.UCPS) {
                window.UCPS.state.current.x.po.val = PLANET_DATA[planetKey].name.split(' ')[0]; // Convert "Terra (Earth)" -> "Terra"
                window.UCPS.requestUpdate();
            }

            // Optional: Spin to a specific rotation point temporarily
            window.targetEarthRotationY = globeMesh.rotation.y + Math.PI;
            setTimeout(() => { window.targetEarthRotationY = undefined; }, 1000);
        });

        // Hover
        pBtn.addEventListener('mouseover', () => pBtn.style.transform = 'scale(1.2)');
        pBtn.addEventListener('mouseout', () => pBtn.style.transform = 'scale(1)');

        btnBox.appendChild(pBtn);
    });

    // Need to lift the overflow hidden restriction off the parent container bounds for buttons to peek out
    container.style.overflow = 'visible';
    container.appendChild(btnBox);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initTrueDateEarth();
});
