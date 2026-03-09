
// Logic for Consciousness Dashboard

const state = {
    d: 4, // Dimension (1-9)
    k: 20, // Karmic load
    t: 10, // Trauma
    hawkins: 200, // Calculated consciousness level
};

// DOM Elements
const meterBar = document.getElementById('meter-bar');
const dimIndicator = document.getElementById('dim-indicator');
const trueDate = document.getElementById('true-date');
const sysStatus = document.getElementById('sys-status');
const navCompass = document.getElementById('nav-compass');
const btns = document.querySelectorAll('.staff-btn');

// --- 3D SCENE (Main Canvas - Jukebox/Engine) ---
const canvas = document.getElementById('scene-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add Jukebox Model (Simplified for now - reused concept)
const jukeboxGroup = new THREE.Group();
scene.add(jukeboxGroup);

// Geometries
const sphereGeo = new THREE.SphereGeometry(3, 32, 32);
const matCore = new THREE.MeshBasicMaterial({ color: 0x6BA2A8, wireframe: true });
const core = new THREE.Mesh(sphereGeo, matCore);
jukeboxGroup.add(core);

const rings = [];
for (let i = 0; i < 3; i++) {
    const rGeo = new THREE.TorusGeometry(4 + i, 0.1, 16, 100);
    const rMat = new THREE.MeshBasicMaterial({ color: 0x2F3E46 });
    const r = new THREE.Mesh(rGeo, rMat);
    r.rotation.x = Math.random() * Math.PI;
    r.rotation.y = Math.random() * Math.PI;
    jukeboxGroup.add(r);
    rings.push(r);
}

// --- 3D EARTH (Compass) ---
const earthContainer = document.getElementById('earth-container');
const scene2 = new THREE.Scene();
const camera2 = new THREE.PerspectiveCamera(45, 1, 0.1, 100); // 1:1 aspect
camera2.position.z = 3;

const renderer2 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer2.setSize(100, 100);
earthContainer.appendChild(renderer2.domElement);

const earthGeo = new THREE.SphereGeometry(1, 16, 16);
const earthMat = new THREE.MeshBasicMaterial({ color: 0x6BA2A8, wireframe: true });
const earth = new THREE.Mesh(earthGeo, earthMat);
scene2.add(earth);

//Compass Rings (2D DOM)
const ringSizes = [120, 150, 180, 210];
ringSizes.forEach((size, i) => {
    const ring = document.createElement('div');
    ring.classList.add('ring-btn');
    ring.style.width = size + 'px';
    ring.style.height = size + 'px';
    // ring.innerText = i; // Debug
    navCompass.appendChild(ring);
});


// --- INTERACTION ---
btns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update Active State
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const d = parseInt(btn.dataset.d);
        updateState(d);
    });
});

function updateState(d) {
    state.d = d;

    // Map D to Hawkins (roughly)
    // 1-3: 20-175
    // 4: 200-400
    // 5-6: 500-600
    // 7-9: 700-1000
    let h = 200;
    if (d <= 3) h = 50 + (d * 40);
    else if (d === 4) h = 300;
    else if (d <= 6) h = 500 + ((d - 5) * 50);
    else h = 700 + ((d - 7) * 100);

    state.hawkins = h;

    updateVisuals();
}

function updateVisuals() {
    // 1. Meter
    const pct = state.hawkins / 10; // 0-100% roughly
    meterBar.style.height = pct + '%';

    // 2. Body Theme
    document.body.className = '';
    if (state.d <= 3) document.body.classList.add('dim-low');
    else if (state.d === 4) document.body.classList.add('dim-mid');
    else if (state.d <= 6) document.body.classList.add('dim-high');
    else document.body.classList.add('dim-source');

    // 3. Text
    dimIndicator.innerText = state.d + 'D';
    trueDate.innerText = `ULC0.StO.Sol.D${state.d}.H${state.hawkins}`;

    // 4. 3D Jukebox Color
    let color = 0x6BA2A8;
    if (state.d <= 3) color = 0x554444; // Rusty
    else if (state.d >= 7) color = 0xFFD700; // Gold
    else if (state.d >= 5) color = 0x00FFFF; // Cyan

    matCore.color.setHex(color);
    earthMat.color.setHex(color);
}


// --- ANIMATION ---
function animate() {
    requestAnimationFrame(animate);

    // Jukebox Rotations
    core.rotation.y += 0.01;
    rings.forEach((r, i) => {
        r.rotation.x += 0.005 * (i + 1);
        r.rotation.y += 0.005 * (i + 1);
    });

    // Earth Rotation
    earth.rotation.y += 0.02;
    earth.rotation.x += 0.005;

    renderer.render(scene, camera);
    renderer2.render(scene2, camera2);
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Init
animate();
updateState(4);
