// Logic for Reality Synthesizer Jukebox

// State
const state = {
    k: 20, // Karmic Echo (0-100)
    t: 10, // Trauma (0-100)
    speed: 50, // Speed/Pressure (0-100) -> drives animation speed
    w: true, // Selector Switch (Power)
    d: 1, // Decision Level (1-7)
};

// DOM Elements
const sliderK = document.getElementById('slider-k');
const sliderT = document.getElementById('slider-t');
const sliderVol = document.getElementById('slider-vol'); // Speed
const switchW = document.getElementById('switch-w');
const notes = document.querySelectorAll('.music-note-btn');
const display = document.getElementById('timeline-display');
const compassStatus = document.getElementById('compass-status');

// Labels for Dimensions/Notes
const dimensions = [
    "BASELINE",
    "SUBTLE SHIFT",
    "DIVERGENT",
    "CHAOTIC",
    "TRANSCENDENT",
    "UNIFIED",
    "SOURCE"
];

// --- THREE.JS SETUP ---
const canvas = document.getElementById('reality-canvas');
const scene = new THREE.Scene();
// Scene background is transparent to let CSS show through? 
// No, CSS is background. Renderer needs alpha: true.

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// --- MODELING THE JUKEBOX (Primitives) ---
const jukeboxGroup = new THREE.Group();
scene.add(jukeboxGroup);

// Materials (Toon-ish via Basic/Lambert with colors from palette)
const matCream = new THREE.MeshLambertMaterial({ color: 0xF2E6D0 });
const matDark = new THREE.MeshLambertMaterial({ color: 0x2F3E46 });
const matOrange = new THREE.MeshLambertMaterial({ color: 0xD96C4A });
const matTeal = new THREE.MeshLambertMaterial({ color: 0x6BA2A8 });
const matVinyl = new THREE.MeshLambertMaterial({ color: 0x111111 });
const matGlow = new THREE.MeshBasicMaterial({ color: 0x7DF9FF }); // Cyan glow

// 1. Base
const baseGeo = new THREE.BoxGeometry(4, 0.5, 4);
const base = new THREE.Mesh(baseGeo, matDark);
base.position.y = -0.25;
jukeboxGroup.add(base);

// 2. Turntable Platter
const platterGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32);
const platter = new THREE.Mesh(platterGeo, matCream);
platter.position.y = 0.1;
jukeboxGroup.add(platter);

// 3. The Record (Vinyl)
const recordGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.05, 32);
const record = new THREE.Mesh(recordGeo, matVinyl);
record.position.y = 0.25;
jukeboxGroup.add(record);

// Record Label (Orange)
const labelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.06, 32);
const label = new THREE.Mesh(labelGeo, matOrange);
label.position.y = 0.26;
jukeboxGroup.add(label);

// 4. Tone Arm (Pivot + Arm + Head)
const pivotGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16);
const pivot = new THREE.Mesh(pivotGeo, matTeal);
pivot.position.set(2, 0.25, 1);
jukeboxGroup.add(pivot);

const armGeo = new THREE.BoxGeometry(0.1, 0.1, 2.5);
const arm = new THREE.Mesh(armGeo, matTeal);
arm.position.set(1.5, 0.6, 0.5);
arm.rotation.y = 0.5;
jukeboxGroup.add(arm);

// 5. Vacuum Tubes (Glowing)
const tubes = [];
function createTube(x, z) {
    const geo = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 16);
    const tube = new THREE.Mesh(geo, matGlow);
    tube.position.set(x, 0.4, z);
    jukeboxGroup.add(tube);
    return tube;
}
tubes.push(createTube(-1.5, -1.5));
tubes.push(createTube(-1.0, -1.5));
tubes.push(createTube(-0.5, -1.5));

// --- INTERACTION LOGIC ---

// Listeners
sliderK.addEventListener('input', (e) => {
    state.k = parseInt(e.target.value);
    updateReality();
});

sliderT.addEventListener('input', (e) => {
    state.t = parseInt(e.target.value);
    updateReality();
});

sliderVol.addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value);
    updateReality();
});

switchW.addEventListener('change', (e) => {
    state.w = e.target.checked;
    updateReality();
});

notes.forEach(btn => {
    btn.addEventListener('click', () => {
        // UI Update
        notes.forEach(n => n.classList.remove('active'));
        btn.classList.add('active');

        // State Update
        state.d = parseInt(btn.dataset.val);
        updateReality();
    });
});

function updateReality() {
    // 1. Selector Switch Logic
    if (!state.w) {
        // Power Off
        display.innerText = "SYSTEM OFFLINE";
        display.style.color = "#555";
        compassStatus.innerText = "Heading: NULL";

        // Dim Lights
        matGlow.color.setHex(0x333333);

        return;
    } else {
        // Restore Glow
        matGlow.color.setHex(0x7DF9FF);
    }

    // 2. Timeline Display
    const dimIndex = state.d - 1;
    let label = dimensions[dimIndex] || "UNKNOWN";

    // Modifiers
    if (state.speed > 80) label += " [ACCELERATED]";
    if (state.t > 60) label += " [UNSTABLE]";
    if (state.k > 80) label += " [HEAVY KARMA]";

    display.innerText = `CURRENT REALITY: ${label}`;
    display.style.color = "var(--bp-dark)";

    // 3. Compass Heading
    let heading = "ALIGNED";
    if (state.t > 50) heading = "DRIFTING";
    if (state.t > 80) heading = "CRITICAL DEVIATION";
    compassStatus.innerText = `Heading: ${heading}`;
}

// --- ANIMATION LOOP ---
let time = 0;

function animate() {
    requestAnimationFrame(animate);

    if (state.w) {
        // 1. Record Rotation
        // Base speed + slider speed component
        const rotSpeed = 0.01 + (state.speed / 1000);
        record.rotation.y -= rotSpeed;
        label.rotation.y -= rotSpeed;

        // 2. Pulse Tubes based on K (Karma)
        // const pulseSpeed = 0.05 + (state.k / 500);
        // const pulseInt = Math.sin(time * pulseSpeed) * 0.5 + 0.5;
        // matGlow.opacity = pulseInt; // MeshBasic doesn't use opacity easily without transparent=true
        // Let's scale them slightly instead
        time += 0.05;
        tubes.forEach((t, i) => {
            const offset = i * 2;
            const flicker = state.t > 50 ? Math.random() * 0.2 : 0; // Glitch if trauma high
            const scale = 1 + (Math.sin(time + offset) * 0.1 * (state.k / 50)) + flicker;
            t.scale.set(scale, 1, scale);
        });

        // 3. Float Body
        jukeboxGroup.position.y = Math.sin(time * 0.5) * 0.1;

        // 4. Glitch Jitter (Trauma)
        if (state.t > 70) {
            jukeboxGroup.position.x = (Math.random() - 0.5) * 0.05;
            jukeboxGroup.position.z = (Math.random() - 0.5) * 0.05;
        } else {
            jukeboxGroup.position.x = THREE.MathUtils.lerp(jukeboxGroup.position.x, 0, 0.1);
            jukeboxGroup.position.z = THREE.MathUtils.lerp(jukeboxGroup.position.z, 0, 0.1);
        }

        // 5. Transcendence Effect (D7)
        if (state.d === 7) {
            jukeboxGroup.rotation.y += 0.02; // Spin the whole machine
        } else {
            jukeboxGroup.rotation.y = THREE.MathUtils.lerp(jukeboxGroup.rotation.y, 0, 0.05);
        }

    } else {
        // Stopped
    }

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
animate();
updateReality();
