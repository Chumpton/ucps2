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
        earth.rotation.y += 0.002;

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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initTrueDateEarth();
});
