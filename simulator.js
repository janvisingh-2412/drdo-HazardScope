(function() {
    const container = document.getElementById('three-container') || document.getElementById('threejs-container-ANIMATION_3');
    if (!container) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    // ASTRON-X BLAST SIMULATOR: CORE 3D VISUALIZATION
    // Implements an interactive 3D tactical environment for blast analysis

    let scene, camera, renderer, controls;
    let explosionSource, ground, grid, axes;
    let humans = [];
    let blastRings = [];

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x080c12);
        
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(20, 20, 20);
        
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Tactical Grid and Axes
        grid = new THREE.GridHelper(100, 50, 0x00f2ff, 0x1a2430);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        scene.add(grid);

        axes = new THREE.AxesHelper(5);
        scene.add(axes);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0x00f2ff, 0.8);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        // Ground Plane
        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshStandardMaterial({ 
            color: 0x0a1018, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = Math.PI / 2;
        scene.add(ground);

        // Explosion Source (Bomb)
        const bombGeo = new THREE.SphereGeometry(0.5, 32, 32);
        const bombMat = new THREE.MeshPhongMaterial({ 
            color: 0xff3b30, 
            emissive: 0xff3b30,
            emissiveIntensity: 0.5
        });
        explosionSource = new THREE.Mesh(bombGeo, bombMat);
        explosionSource.position.set(0, 0.5, 0);
        scene.add(explosionSource);

        // Human Targets
        createHumans();

        // Visual Blast Rings
        createBlastRings();

        animate();
    }

    function createHumans() {
        const humanPositions = [
            { x: 5, z: 5, color: 0x00f2ff },
            { x: -8, z: 4, color: 0x00f2ff },
            { x: 12, z: -10, color: 0x00f2ff },
            { x: -5, z: -15, color: 0x00f2ff }
        ];

        humanPositions.forEach((pos, index) => {
            const group = new THREE.Group();
            
            // Body (Cylinder)
            const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.8, 16);
            const bodyMat = new THREE.MeshPhongMaterial({ color: pos.color, transparent: true, opacity: 0.8 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.9;
            group.add(body);

            // Head (Sphere)
            const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
            const head = new THREE.Mesh(headGeo, bodyMat);
            head.position.y = 2.0;
            group.add(head);

            group.position.set(pos.x, 0, pos.z);
            scene.add(group);
            humans.push(group);
        });
    }

    function createBlastRings() {
        const zones = [
            { radius: 5, color: 0xff3b30 }, // Fatal
            { radius: 10, color: 0xff9500 }, // Lethal
            { radius: 18, color: 0xffcc00 }, // Severe
            { radius: 30, color: 0x007aff }, // Moderate
            { radius: 50, color: 0x4cd964 }  // Minor
        ];

        zones.forEach(zone => {
            const ringGeo = new THREE.RingGeometry(zone.radius - 0.2, zone.radius, 64);
            const ringMat = new THREE.MeshBasicMaterial({ 
                color: zone.color, 
                side: THREE.DoubleSide, 
                transparent: true, 
                opacity: 0.4 
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 0.05;
            scene.add(ring);
            blastRings.push(ring);
        });
    }

    function animate() {
        requestAnimationFrame(animate);
        
        // Slow pulse for rings
        const time = Date.now() * 0.002;
        blastRings.forEach((ring, i) => {
            ring.material.opacity = 0.2 + Math.sin(time + i) * 0.1;
        });

        // Bomb pulse
        explosionSource.scale.setScalar(1 + Math.sin(time * 2) * 0.1);

        renderer.render(scene, camera);
    }

    // Event Listeners for Dynamic Updates
    window.addEventListener('updatePositions', (e) => {
        const { bomb, targets } = e.detail;
        if (bomb) explosionSource.position.set(bomb.x, bomb.y, bomb.z);
        if (targets) {
            targets.forEach((pos, i) => {
                if (humans[i]) humans[i].position.set(pos.x, pos.y, pos.z);
            });
        }
    });

    window.addEventListener('resize', () => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    init();
})();
