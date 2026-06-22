const floating3dAssets = [
    'Element3d/1.png',
    'Element3d/2.png',
    'Element3d/3.png',
    'Element3d/4.png'
];

// Gunakan container yang sudah ada di HTML (termasuk class opacity-30 sm:opacity-100 untuk mobile)
const floating3dContainer = document.getElementById('floating-3d-container');
floating3dContainer.setAttribute('aria-hidden', 'true');
// Style yang perlu ditambahkan via JS (yang tidak bisa dari Tailwind)
floating3dContainer.style.perspective = '1400px';

const floating3dState = [];
let currentViewportMode = '';

function getViewportMode() {
    if (window.innerWidth <= 640) {
        return 'mobile';
    }

    if (window.innerWidth <= 1024) {
        return 'tablet';
    }

    return 'desktop';
}

function getFloating3dConfig() {
    const viewportMode = getViewportMode();

    if (viewportMode === 'mobile') {
        return {
            viewportMode,
            count: 7,
            minSize: 28,
            maxSize: 54,
            maxSpeed: 0.11,
            driftRange: 0.0014,
            depthMin: -90,
            depthMax: 180,
            wobble: 5,
            bobMin: 0.6,
            bobMax: 1.4,
            swayMin: 0.6,
            swayMax: 1.6
        };
    }

    if (viewportMode === 'tablet') {
        return {
            viewportMode,
            count: 9,
            minSize: 42,
            maxSize: 72,
            maxSpeed: 0.13,
            driftRange: 0.0018,
            depthMin: -120,
            depthMax: 230,
            wobble: 6,
            bobMin: 0.8,
            bobMax: 1.8,
            swayMin: 0.8,
            swayMax: 2
        };
    }

    return {
        viewportMode,
        count: 12,
        minSize: 60,
        maxSize: 140,
        maxSpeed: 0.15,
        driftRange: 0.002,
        depthMin: -150,
        depthMax: 300,
        wobble: 8,
        bobMin: 1,
        bobMax: 3,
        swayMin: 1,
        swayMax: 3.5
    };
}

function clearFloating3dElements() {
    floating3dState.splice(0, floating3dState.length);
    floating3dContainer.replaceChildren();
}

function createFloating3dElements() {
    const config = getFloating3dConfig();
    currentViewportMode = config.viewportMode;

    for (let index = 0; index < config.count; index += 1) {
        const asset = floating3dAssets[index % floating3dAssets.length];
        const wrapper = document.createElement('div');
        const image = document.createElement('img');

        image.src = asset;
        image.alt = '';
        image.draggable = false;
        image.style.display = 'block';
        image.style.width = '100%';
        image.style.height = '100%';
        image.style.objectFit = 'contain';
        image.style.filter = 'drop-shadow(0 20px 28px rgba(33, 52, 72, 0.15))';
        image.style.opacity = '0.85';

        wrapper.style.position = 'absolute';
        wrapper.style.left = '0';
        wrapper.style.top = '0';
        wrapper.style.willChange = 'transform';
        wrapper.style.transformStyle = 'preserve-3d';

        const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
        wrapper.style.width = `${size}px`;
        wrapper.style.height = `${size}px`;
        wrapper.appendChild(image);
        floating3dContainer.appendChild(wrapper);

        floating3dState.push({
            el: wrapper,
            x: Math.random() * 100,
            y: Math.random() * 100,
            vx: (Math.random() - 0.5) * 0.08,
            vy: (Math.random() - 0.5) * 0.08,
            driftX: (Math.random() - 0.5) * config.driftRange,
            driftY: (Math.random() - 0.5) * config.driftRange,
            rotateZ: Math.random() * 360,
            rotateSpeed: (Math.random() - 0.5) * 0.4,
            tiltX: -20 + Math.random() * 40,
            tiltY: -20 + Math.random() * 40,
            depth: config.depthMin + Math.random() * (config.depthMax - config.depthMin),
            bobOffset: Math.random() * Math.PI * 2,
            bobSpeed: 0.005 + Math.random() * 0.008,
            bobAmplitude: config.bobMin + Math.random() * (config.bobMax - config.bobMin),
            swayAmplitude: config.swayMin + Math.random() * (config.swayMax - config.swayMin)
        });
    }
}

function updateFloating3dElements() {
    const time = performance.now();
    const config = getFloating3dConfig();

    floating3dState.forEach((item) => {
        item.vx += item.driftX;
        item.vy += item.driftY;

        if (Math.abs(item.vx) > config.maxSpeed) item.driftX *= -1;
        if (Math.abs(item.vy) > config.maxSpeed) item.driftY *= -1;

        if (Math.random() < 0.005) {
            item.driftX = (Math.random() - 0.5) * config.driftRange;
            item.driftY = (Math.random() - 0.5) * config.driftRange;
        }

        item.x += item.vx;
        item.y += item.vy;
        item.rotateZ += item.rotateSpeed;

        if (item.x < -15) item.x = 115;
        if (item.x > 115) item.x = -15;
        if (item.y < -15) item.y = 115;
        if (item.y > 115) item.y = -15;

        const bob = Math.sin(time * item.bobSpeed + item.bobOffset) * item.bobAmplitude;
        const sway = Math.cos(time * item.bobSpeed * 0.8 + item.bobOffset) * item.swayAmplitude;
        const wobbleX = Math.sin(time * item.bobSpeed * 0.65 + item.bobOffset) * config.wobble;
        const wobbleY = Math.cos(time * item.bobSpeed * 0.55 + item.bobOffset) * config.wobble;

        item.el.style.transform = `
      translate3d(calc(${item.x}vw + ${sway}px), calc(${item.y}vh + ${bob}px), ${item.depth}px) 
      rotateX(${item.tiltX + wobbleX}deg) 
      rotateY(${item.tiltY + wobbleY}deg) 
      rotateZ(${item.rotateZ}deg)
    `;
    });

    requestAnimationFrame(updateFloating3dElements);
}

function syncFloating3dLayout() {
    const nextViewportMode = getViewportMode();

    if (nextViewportMode === currentViewportMode) {
        return;
    }

    clearFloating3dElements();
    createFloating3dElements();
}

createFloating3dElements();
updateFloating3dElements();

window.addEventListener('resize', syncFloating3dLayout);