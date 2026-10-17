/**
 * =============================================================================
 * METAL GEAR JAVA 3D // THREE.JS TACTICAL ENGINE & PROCEDURAL PBR BUILDER
 *  - Texturas PBR Procedurales en alta resolución (CanvasTexture + Bump/Emissive)
 *  - Rigs 3D Articulados: Solid Byte, Centinelas Genome, Vulcan, Olympo y REX
 *  - Grúas Magnéticas 3D, Torretas EMP, Piso Matricial 3D y Cables Cyber-Visor
 *  - Director de Cámara 3D (Táctica + Corner-Cam en Cobertura + Acción Cercana)
 * =============================================================================
 */
(function () {
    'use strict';

    const SCALE = 0.1; // 800x450 lógico -> 80m x 45m en espacio 3D
    const toWorldX = x => (x - 400) * SCALE;
    const toWorldZ = y => (y - 225) * SCALE;

    let scene = null;
    let camera = null;
    let renderer = null;
    let roomGroup = null;
    let actorsGroup = null;
    let fxGroup = null;
    let visorGroup = null;

    let textures = {};
    let playerRig = null;
    let guardRigs = new Map();
    let sleeperRigs = new Map();
    let cameraRigs = new Map();
    let terminalMeshes = new Map();
    let sabotageMeshes = new Map();
    let hazardMeshes = new Map();
    let laserMeshes = [];
    let doorMeshes = [];
    let itemMeshes = new Map();
    let matrixTileMeshes = [];
    let bossRig = null;
    let snowSystem = null;

    // Estado de cámara 3D y efectos
    const CAM_STATE = {
        mode: 'tactical', // 'tactical' | 'close' | 'overhead'
        curPos: { x: 0, y: 42, z: 28 },
        curLook: { x: 0, y: 0, z: 0 },
        visorActive: false,
        wallHugFactor: 0
    };

    const particles3D = [];
    const shockwaves3D = [];
    const projectiles3D = [];
    const dashGhosts3D = [];

    // -------------------------------------------------------------------------
    // 1. GENERADOR DE TEXTURAS PBR PROCEDURALES (ALTA DEFINICIÓN)
    // -------------------------------------------------------------------------
    function makeCanvasTex(w, h, drawFn, repeatX = 1, repeatY = 1) {
        if (typeof document === 'undefined') return null;
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        drawFn(ctx, w, h);
        if (typeof THREE === 'undefined') return null;
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        return tex;
    }

    function initTextures() {
        if (typeof THREE === 'undefined') return;

        // 1. Suelo Hexagonal / Grilla Táctica Metálica
        textures.floor = makeCanvasTex(256, 256, (ctx, w, h) => {
            ctx.fillStyle = '#0b1322';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#16243d';
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 2, w - 4, h - 4);
            ctx.strokeStyle = '#111d33';
            ctx.lineWidth = 1;
            for (let i = 32; i < w; i += 32) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
            }
            // Cruces técnicas en intersecciones
            ctx.fillStyle = '#1e3a5f';
            for (let x = 64; x < w; x += 64) {
                for (let y = 64; y < h; y += 64) {
                    ctx.fillRect(x - 4, y - 1, 8, 2);
                    ctx.fillRect(x - 1, y - 4, 2, 8);
                }
            }
        }, 20, 11);

        // 2. Muro de Búnker Industrial
        textures.wall = makeCanvasTex(256, 256, (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#1e293b');
            g.addColorStop(0.5, '#0f172a');
            g.addColorStop(1, '#090d16');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
            // Costillas verticales metálicas
            ctx.fillStyle = '#26354d';
            for (let x = 16; x < w; x += 64) {
                ctx.fillRect(x, 0, 8, h);
            }
            // Franja inferior de precaución industrial
            ctx.fillStyle = '#eab308';
            ctx.fillRect(0, h - 18, w, 14);
            ctx.fillStyle = '#0f172a';
            for (let x = -20; x < w + 20; x += 24) {
                ctx.beginPath();
                ctx.moveTo(x, h - 18);
                ctx.lineTo(x + 12, h - 18);
                ctx.lineTo(x + 4, h - 4);
                ctx.lineTo(x - 8, h - 4);
                ctx.fill();
            }
            // Línea superior LED cian
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(0, 10, w, 4);
        }, 1, 1);

        // 3. Rack de Servidores con LEDs
        textures.server = makeCanvasTex(128, 256, (ctx, w, h) => {
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, w - 4, h - 4);
            for (let y = 14; y < h - 16; y += 22) {
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(10, y, w - 20, 16);
                // LEDs de estado
                ctx.fillStyle = (y % 44 === 0) ? '#38bdf8' : '#10b981';
                ctx.fillRect(16, y + 5, 10, 6);
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(32, y + 5, 6, 6);
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(46, y + 4, w - 62, 8);
            }
        }, 1, 1);

        // 4. Contenedor Militar UTN-CARGO
        textures.containerCyan = makeCanvasTex(256, 128, (ctx, w, h) => {
            ctx.fillStyle = '#0e3a5c';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#0a2942';
            for (let x = 0; x < w; x += 16) ctx.fillRect(x, 8, 8, h - 16);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, w - 4, h - 4);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(36, 36, 184, 56);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('UTN // JVM-CARGO', w / 2, 62);
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('BYTECODE SECURE UNIT', w / 2, 82);
        }, 1, 1);

        textures.containerAmber = makeCanvasTex(256, 128, (ctx, w, h) => {
            ctx.fillStyle = '#5c340e';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#422308';
            for (let x = 0; x < w; x += 16) ctx.fillRect(x, 8, 8, h - 16);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, w - 4, h - 4);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(36, 36, 184, 56);
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SAO // HEAVY BOX', w / 2, 62);
            ctx.fillStyle = '#fde68a';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('CAUTION: HIGH VOLTAGE', w / 2, 82);
        }, 1, 1);

        // 5. Caja de Camuflaje Óptico JAVA.ZIP
        textures.holoBox = makeCanvasTex(128, 128, (ctx, w, h) => {
            ctx.fillStyle = '#b45309';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 4;
            ctx.strokeRect(3, 3, w - 6, h - 6);
            ctx.fillStyle = '#451a03';
            ctx.fillRect(12, 42, w - 24, 44);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('JAVA.ZIP', w / 2, 64);
            ctx.fillStyle = '#fde68a';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('OPTICAL CAMO CRATE', w / 2, 80);
        }, 1, 1);
    }

    // -------------------------------------------------------------------------
    // 2. INICIALIZACIÓN DE LA ESCENA THREE.JS
    // -------------------------------------------------------------------------
    function init3D(containerOrCanvas) {
        if (typeof THREE === 'undefined' || !containerOrCanvas) return false;

        let canvasEl = containerOrCanvas;
        if (containerOrCanvas.tagName !== 'CANVAS') {
            canvasEl = document.createElement('canvas');
            canvasEl.style.width = '100%';
            canvasEl.style.height = '100%';
            canvasEl.style.display = 'block';
            containerOrCanvas.innerHTML = '';
            containerOrCanvas.appendChild(canvasEl);
        }

        initTextures();

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060b14);
        scene.fog = new THREE.FogExp2(0x060b14, 0.0075);

        const rect = containerOrCanvas.getBoundingClientRect ? containerOrCanvas.getBoundingClientRect() : { width: 960, height: 540 };
        const w = rect.width || containerOrCanvas.clientWidth || 960;
        const h = rect.height || containerOrCanvas.clientHeight || 540;
        camera = new THREE.PerspectiveCamera(40, w / h, 0.5, 260);
        camera.position.set(0, 40, 26);
        camera.lookAt(0, 0, 0);

        try {
            renderer = new THREE.WebGLRenderer({
                canvas: canvasEl,
                antialias: true,
                preserveDrawingBuffer: true,
                powerPreference: 'high-performance'
            });
            renderer.setSize(w, h, false);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        } catch (e) {
            console.warn('[MGS3D] WebGL fallback activado:', e.message);
            return false;
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => {
                const r = containerOrCanvas.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && renderer && camera) {
                    camera.aspect = r.width / r.height;
                    camera.updateProjectionMatrix();
                    renderer.setSize(r.width, r.height, false);
                }
            });
        }

        // Iluminación Cinemática Multicapa
        const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x0f172a, 0.65);
        hemiLight.position.set(0, 50, 0);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xe0f2fe, 0.85);
        dirLight.position.set(18, 48, 24);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 5;
        dirLight.shadow.camera.far = 120;
        const d = 48;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        scene.add(dirLight);

        roomGroup = new THREE.Group();
        actorsGroup = new THREE.Group();
        fxGroup = new THREE.Group();
        visorGroup = new THREE.Group();
        scene.add(roomGroup);
        scene.add(actorsGroup);
        scene.add(fxGroup);
        scene.add(visorGroup);

        // Partículas atmosféricas flotantes en 3D (nieve / polvo de datos)
        const snowGeo = new THREE.BufferGeometry();
        const snowCount = 220;
        const posArr = new Float32Array(snowCount * 3);
        for (let i = 0; i < snowCount; i++) {
            posArr[i * 3] = (Math.random() - 0.5) * 85;
            posArr[i * 3 + 1] = Math.random() * 14 + 0.5;
            posArr[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        snowGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        const snowMat = new THREE.PointsMaterial({
            color: 0x38bdf8,
            size: 0.35,
            transparent: true,
            opacity: 0.55
        });
        snowSystem = new THREE.Points(snowGeo, snowMat);
        scene.add(snowSystem);

        playerRig = buildPlayerRig();
        actorsGroup.add(playerRig.root);

        window.addEventListener('resize', onResize);
        return true;
    }

    function onResize() {
        if (!renderer || !camera) return;
        const canvasEl = renderer.domElement;
        const parent = canvasEl.parentElement || document.body;
        const w = parent.clientWidth || 960;
        const h = parent.clientHeight || 540;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    }

    // -------------------------------------------------------------------------
    // 3. RIGS 3D ARTICULADOS: SOLID BYTE, CENTINELAS Y JEFES
    // -------------------------------------------------------------------------
    function buildPlayerRig() {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        root.add(bodyGroup);

        // Anillo Táctico Holográfico en la base
        const ringGeo = new THREE.RingGeometry(1.15, 1.42, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
        const baseRing = new THREE.Mesh(ringGeo, ringMat);
        baseRing.position.y = 0.06;
        root.add(baseRing);

        // Piernas articuladas
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 });
        const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 });

        const leftLeg = new THREE.Group();
        leftLeg.position.set(-0.32, 1.1, 0);
        const lThigh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.0, 0.42), legMat);
        lThigh.position.y = -0.45;
        lThigh.castShadow = true;
        const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.58), bootMat);
        lBoot.position.set(0, -0.95, 0.08);
        leftLeg.add(lThigh, lBoot);

        const rightLeg = new THREE.Group();
        rightLeg.position.set(0.32, 1.1, 0);
        const rThigh = lThigh.clone();
        const rBoot = lBoot.clone();
        rightLeg.add(rThigh, rBoot);
        bodyGroup.add(leftLeg, rightLeg);

        // Torso Sneaking Suit Blindado
        const torsoMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.65 });
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.35, 0.68), torsoMat);
        torso.position.y = 1.82;
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Pechera Kevlar + Emblema Luminoso JVM
        const chestMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.7 });
        const chest = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.78, 0.74), chestMat);
        chest.position.y = 1.98;
        bodyGroup.add(chest);

        const coreBadge = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.22, 0.78),
            new THREE.MeshBasicMaterial({ color: 0x00ff66 })
        );
        coreBadge.position.y = 2.02;
        bodyGroup.add(coreBadge);

        // Hombreras Tácticas
        const pauldronGeo = new THREE.BoxGeometry(0.42, 0.38, 0.62);
        const lPauldron = new THREE.Mesh(pauldronGeo, chestMat);
        lPauldron.position.set(-0.74, 2.25, 0);
        const rPauldron = new THREE.Mesh(pauldronGeo, chestMat);
        rPauldron.position.set(0.74, 2.25, 0);
        bodyGroup.add(lPauldron, rPauldron);

        // Brazos + Pistola de Pulso Silenciada
        const leftArm = new THREE.Group();
        leftArm.position.set(-0.72, 2.1, 0);
        const armMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.34), legMat);
        armMeshL.position.y = -0.4;
        leftArm.add(armMeshL);

        const rightArm = new THREE.Group();
        rightArm.position.set(0.72, 2.1, 0);
        const armMeshR = armMeshL.clone();
        rightArm.add(armMeshR);

        // Pistola SOCOM Cyber con silenciador y láser
        const gun = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, 0.22, 0.95),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 })
        );
        gun.position.set(0, -0.72, 0.48);
        const gunTip = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.1, 0.25),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        gunTip.position.set(0, -0.70, 0.98);
        rightArm.add(gun, gunTip);
        rightArm.rotation.x = -0.45;
        bodyGroup.add(leftArm, rightArm);

        // Cabeza + Visor Táctico + Bandana Dinámica
        const headGroup = new THREE.Group();
        headGroup.position.y = 2.85;
        const headMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.74, 0.76, 0.74),
            new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 })
        );
        const hairMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.80, 0.36, 0.80),
            new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 })
        );
        hairMesh.position.y = 0.26;
        // Visor / Gafas Cyber-Stealth
        const visorMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.78, 0.20, 0.20),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        visorMesh.position.set(0, 0.05, 0.32);
        // Bandana Verde Esmeralda / Cian
        const headband = new THREE.Mesh(
            new THREE.BoxGeometry(0.82, 0.18, 0.82),
            new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        headband.position.y = 0.16;

        // Cintas de la bandana que ondean al correr
        const tail1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.12, 0.65),
            new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        tail1.position.set(-0.14, 0.12, -0.68);
        const tail2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, 0.10, 0.55),
            new THREE.MeshBasicMaterial({ color: 0x059669 })
        );
        tail2.position.set(0.14, 0.06, -0.62);

        headGroup.add(headMesh, hairMesh, visorMesh, headband, tail1, tail2);
        bodyGroup.add(headGroup);

        // Caja Holográfica JAVA.ZIP
        const boxGroup = new THREE.Group();
        const boxMesh = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 2.2, 2.2),
            new THREE.MeshStandardMaterial({
                map: textures.holoBox || null,
                color: textures.holoBox ? 0xffffff : 0xd97706,
                roughness: 0.5,
                metalness: 0.2
            })
        );
        boxMesh.position.y = 1.1;
        boxMesh.castShadow = true;
        const boxWire = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(2.26, 2.26, 2.26)),
            new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
        );
        boxWire.position.y = 1.1;
        boxGroup.add(boxMesh, boxWire);
        boxGroup.visible = false;
        root.add(boxGroup);

        return {
            root,
            bodyGroup,
            boxGroup,
            baseRing,
            leftLeg,
            rightLeg,
            leftArm,
            rightArm,
            tail1,
            tail2,
            walkPhase: 0,
            lastX: 0,
            lastY: 0
        };
    }

    function buildGuardRig(g) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        root.add(bodyGroup);

        const armorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.5 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.6 });

        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.05, 0.42), darkMat);
        leftLeg.position.set(-0.32, 0.55, 0);
        const rightLeg = leftLeg.clone();
        rightLeg.position.set(0.32, 0.55, 0);

        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.38, 0.74), armorMat);
        torso.position.y = 1.78;
        torso.castShadow = true;

        const vest = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.82, 0.80), darkMat);
        vest.position.y = 1.88;

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.78), armorMat);
        head.position.y = 2.82;

        // Visor Cíclope NVG (Cambia de color según patrulla / curiosidad / alerta)
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.22, 0.22), visorMat);
        visor.position.set(0, 2.82, 0.34);

        // Rifle táctico
        const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 1.35), darkMat);
        rifle.position.set(0.52, 1.75, 0.55);

        bodyGroup.add(leftLeg, rightLeg, torso, vest, head, visor, rifle);

        // Cono Volumétrico 3D de Visión en el suelo
        const coneMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.18,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const fov = g.fov || Math.PI / 2.8;
        const dist = (g.viewDist || 160) * SCALE;
        const sectorGeo = new THREE.CircleGeometry(dist, 24, -fov / 2, fov);
        sectorGeo.rotateX(-Math.PI / 2);
        const visionMesh = new THREE.Mesh(sectorGeo, coneMat);
        visionMesh.position.y = 0.08;
        root.add(visionMesh);

        // Borde luminoso del cono de visión
        const edgeGeo = new THREE.EdgesGeometry(sectorGeo);
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 });
        const visionEdge = new THREE.LineSegments(edgeGeo, edgeMat);
        visionEdge.position.y = 0.10;
        root.add(visionEdge);

        // Indicador flotante 3D (! / ?)
        const alertGem = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.45, 0),
            new THREE.MeshBasicMaterial({ color: 0xff2a2a })
        );
        alertGem.position.y = 4.1;
        alertGem.visible = false;
        root.add(alertGem);

        return {
            root,
            bodyGroup,
            leftLeg,
            rightLeg,
            visorMat,
            visionMesh,
            visionEdge,
            coneMat,
            edgeMat,
            alertGem,
            walkPhase: 0,
            lastX: g.x,
            lastY: g.y
        };
    }

    function buildBossRig(type) {
        const root = new THREE.Group();

        if (type === 'vulcan') {
            // VULCAN BYTEMASTER: Tanque de Asedio Pesado 3D
            const treadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.4 });
            const hullMat = new THREE.MeshStandardMaterial({ color: 0x065f46, metalness: 0.6, roughness: 0.3 });
            const barrelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });

            const treadL = new THREE.Mesh(new THREE.BoxGeometry(8.6, 1.8, 1.8), treadMat);
            treadL.position.set(0, 0.9, -3.2);
            treadL.castShadow = true;
            const treadR = treadL.clone();
            treadR.position.set(0, 0.9, 3.2);

            const hull = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.4, 5.2), hullMat);
            hull.position.set(0, 2.1, 0);
            hull.castShadow = true;

            const turret = new THREE.Group();
            turret.position.set(0.4, 3.6, 0);
            const turretBox = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.8, 3.8), hullMat);
            turretBox.castShadow = true;

            const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 5.2, 12), barrelMat);
            barrel1.rotation.z = Math.PI / 2;
            barrel1.position.set(-4.2, 0.2, -1.0);
            const barrel2 = barrel1.clone();
            barrel2.position.set(-4.2, 0.2, 1.0);
            turret.add(turretBox, barrel1, barrel2);

            // Reactor Central Expuesto
            const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
            const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(1.35, 16, 16), coreMat);
            coreMesh.position.set(-3.8, 2.4, 0);

            // Domo de Escudo Holográfico
            const shieldMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.32 });
            const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(6.2, 16, 12), shieldMat);
            shieldMesh.position.y = 2.2;

            root.add(treadL, treadR, hull, turret, coreMesh, shieldMesh);
            return { root, turret, coreMesh, coreMat, shieldMesh, shieldMat, type };

        } else if (type === 'olympo') {
            // CYBER OLYMPO: Araña Hexápoda Modular 3D
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.7, roughness: 0.25 });
            const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });

            const carapace = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.2, 2.2, 6), bodyMat);
            carapace.position.y = 2.6;
            carapace.castShadow = true;

            const legs = [];
            for (let i = 0; i < 6; i++) {
                const legGroup = new THREE.Group();
                const ang = (i / 6) * Math.PI * 2 + 0.5;
                legGroup.position.set(Math.cos(ang) * 3.2, 2.2, Math.sin(ang) * 3.2);
                legGroup.rotation.y = -ang;
                const upper = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.45), legMat);
                upper.position.set(1.2, 0.5, 0);
                upper.rotation.z = 0.35;
                const lower = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.8, 0.45), legMat);
                lower.position.set(2.3, -0.8, 0);
                const claw = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0x2dd4bf }));
                claw.position.set(2.3, -2.1, 0);
                legGroup.add(upper, lower, claw);
                legs.push(legGroup);
                root.add(legGroup);
            }

            const coreMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
            const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 1), coreMat);
            coreMesh.position.set(0, 3.8, 0);

            const shieldMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, wireframe: true, transparent: true, opacity: 0.3 });
            const shieldMesh = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 4.5, 6), shieldMat);
            shieldMesh.position.y = 2.4;

            // Retícula de salto en el suelo
            const targetRing = new THREE.Mesh(
                new THREE.RingGeometry(2.2, 2.8, 32),
                new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
            );
            targetRing.rotation.x = -Math.PI / 2;
            targetRing.position.y = 0.12;
            targetRing.visible = false;
            scene.add(targetRing);

            root.add(carapace, coreMesh, shieldMesh);
            return { root, legs, coreMesh, coreMat, shieldMesh, shieldMat, targetRing, type };

        } else {
            // METAL GEAR JVM-REX PRIME: Titán Bípedo Colosal 3D
            const rexMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.3 });
            const accentMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, metalness: 0.6, roughness: 0.35 });

            // Piernas Hidráulicas Gigantes
            const legL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.2, 2.4), rexMat);
            legL.position.set(0, 2.6, -2.8);
            legL.castShadow = true;
            const legR = legL.clone();
            legR.position.set(0, 2.6, 2.8);

            // Cabeza / Cockpit Acorazado de REX
            const headCockpit = new THREE.Mesh(new THREE.BoxGeometry(7.8, 3.4, 4.6), accentMat);
            headCockpit.position.set(-0.6, 6.2, 0);
            headCockpit.rotation.z = 0.12;
            headCockpit.castShadow = true;

            // Cañón Railgun Derecho
            const railgun = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.2, 1.2), rexMat);
            railgun.position.set(-2.5, 7.6, -3.2);
            const railGlow = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.3, 1.3), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
            railGlow.position.copy(railgun.position);

            // Radomo Circular Izquierdo
            const radome = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.7, 20), rexMat);
            radome.rotation.x = Math.PI / 2;
            radome.position.set(1.2, 7.6, 3.1);

            // Reactor / Núcleo Frontal
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa });
            const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), coreMat);
            coreMesh.position.set(-4.2, 4.2, 0);

            const shieldMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.3 });
            const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(7.2, 16, 12), shieldMat);
            shieldMesh.position.y = 4.5;

            // Haz de láser Railgun 3D
            const laserBeam = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 65, 8),
                new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0.85 })
            );
            laserBeam.rotation.z = Math.PI / 2;
            laserBeam.visible = false;
            scene.add(laserBeam);

            root.add(legL, legR, headCockpit, railgun, railGlow, radome, coreMesh, shieldMesh);
            return { root, coreMesh, coreMat, shieldMesh, shieldMat, laserBeam, type };
        }
    }

    // -------------------------------------------------------------------------
    // 4. CONSTRUCCIÓN DE SALA 3D (MUROS, PUERTAS, GRÚAS, MATRIZ Y VISOR)
    // -------------------------------------------------------------------------
    function clearGroup(grp) {
        if (!grp) return;
        while (grp.children.length > 0) {
            const obj = grp.children[0];
            grp.remove(obj);
        }
    }

    function buildRoom3D(room, levelData, hackTerminals, sabotajesList, gameState) {
        if (!scene || !room) return;

        clearGroup(roomGroup);
        clearGroup(visorGroup);
        guardRigs.forEach(r => actorsGroup.remove(r.root));
        guardRigs.clear();
        sleeperRigs.forEach(r => actorsGroup.remove(r));
        sleeperRigs.clear();
        cameraRigs.clear();
        terminalMeshes.clear();
        sabotageMeshes.clear();
        hazardMeshes.clear();
        itemMeshes.clear();
        laserMeshes = [];
        doorMeshes = [];
        matrixTileMeshes = [];

        if (bossRig) {
            if (bossRig.targetRing) scene.remove(bossRig.targetRing);
            if (bossRig.laserBeam) scene.remove(bossRig.laserBeam);
            actorsGroup.remove(bossRig.root);
            bossRig = null;
        }

        // 1. Suelo 3D con reflejos metálicos
        const floorGeo = new THREE.PlaneGeometry(80, 45);
        floorGeo.rotateX(-Math.PI / 2);
        const floorMat = new THREE.MeshStandardMaterial({
            map: textures.floor || null,
            color: levelData ? levelData.floorColor : 0x0b1524,
            roughness: 0.4,
            metalness: 0.55
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.receiveShadow = true;
        roomGroup.add(floorMesh);

        // Grilla táctica holográfica sutil
        const gridHelper = new THREE.GridHelper(80, 40, 0x1e3a5f, 0x0f1d33);
        gridHelper.position.y = 0.03;
        gridHelper.scale.z = 45 / 80;
        roomGroup.add(gridHelper);

        // 2. Muros Perimetrales, Contenedores, Racks de Servidores y Tanques Crio
        (room.walls || []).forEach(w => {
            const wx = toWorldX(w.x + w.w / 2);
            const wz = toWorldZ(w.y + w.h / 2);
            const ww = w.w * SCALE;
            const wd = w.h * SCALE;
            const kind = w.kind || 'perimeter';

            let wh = 4.6;
            let mat = null;

            if (kind === 'perimeter') {
                wh = 5.2;
                mat = new THREE.MeshStandardMaterial({
                    map: textures.wall || null,
                    color: 0xffffff,
                    roughness: 0.45,
                    metalness: 0.5
                });
            } else if (kind === 'server_rack') {
                wh = 4.2;
                mat = new THREE.MeshStandardMaterial({
                    map: textures.server || null,
                    color: 0xffffff,
                    roughness: 0.3,
                    metalness: 0.75
                });
            } else if (kind === 'container_cyan') {
                wh = 3.8;
                mat = new THREE.MeshStandardMaterial({
                    map: textures.containerCyan || null,
                    color: 0xffffff,
                    roughness: 0.45,
                    metalness: 0.5
                });
            } else if (kind === 'container_amber') {
                wh = 3.8;
                mat = new THREE.MeshStandardMaterial({
                    map: textures.containerAmber || null,
                    color: 0xffffff,
                    roughness: 0.45,
                    metalness: 0.5
                });
            } else if (kind === 'cryo_tank') {
                wh = 4.4;
                mat = new THREE.MeshStandardMaterial({
                    color: 0x0ea5e9,
                    emissive: 0x0369a1,
                    emissiveIntensity: 0.35,
                    roughness: 0.2,
                    metalness: 0.8
                });
            } else {
                wh = 4.8;
                mat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
            }

            const mesh = new THREE.Mesh(new THREE.BoxGeometry(ww, wh, wd), mat);
            mesh.position.set(wx, wh / 2, wz);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            roomGroup.add(mesh);

            // Borde superior luminoso en obstáculos internos para claridad táctica 3D
            if (kind !== 'perimeter') {
                const edgeColor = kind === 'cryo_tank' ? 0x38bdf8 : (kind === 'container_amber' ? 0xf59e0b : 0x38bdf8);
                const topEdge = new THREE.LineSegments(
                    new THREE.EdgesGeometry(new THREE.BoxGeometry(ww + 0.04, wh + 0.04, wd + 0.04)),
                    new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.45 })
                );
                topEdge.position.copy(mesh.position);
                roomGroup.add(topEdge);
            }
        });

        // 3. Compuertas 3D con arcos luminosos
        (room.doors || []).forEach(door => {
            const dx = toWorldX(door.x + door.w / 2);
            const dz = toWorldZ(door.y + door.h / 2);
            const dw = door.w * SCALE;
            const dd = door.h * SCALE;

            const doorGroup = new THREE.Group();
            doorGroup.position.set(dx, 0, dz);

            const frameMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.55 });
            const arch = new THREE.Mesh(new THREE.BoxGeometry(dw, 4.4, dd), frameMat);
            arch.position.y = 2.2;

            const floorPad = new THREE.Mesh(
                new THREE.PlaneGeometry(dw + 0.8, dd + 0.8),
                new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
            );
            floorPad.rotation.x = -Math.PI / 2;
            floorPad.position.y = 0.07;

            doorGroup.add(arch, floorPad);
            roomGroup.add(doorGroup);
            doorMeshes.push({ door, arch, floorPad, frameMat });
        });

        // 4. Terminales Curriculares 3D
        (room.terminals || []).forEach(t => {
            const tx = toWorldX(t.x + t.w / 2);
            const tz = toWorldZ(t.y + t.h / 2);
            const grp = new THREE.Group();
            grp.position.set(tx, 0, tz);

            const base = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 2.2, 1.8),
                new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
            );
            base.position.y = 1.1;
            base.castShadow = true;

            const screenMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
            const screen = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.1, 0.2), screenMat);
            screen.position.set(0, 1.9, 0.85);
            screen.rotation.x = -0.35;

            const holoCube = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.65, 0),
                new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true })
            );
            holoCube.position.y = 3.5;

            grp.add(base, screen, holoCube);
            roomGroup.add(grp);
            terminalMeshes.set(t.terminalId, { grp, screenMat, holoCube, x: tx, z: tz });
        });

        // 5. Nodos de Sabotaje en Vivo + Objetos Físicos 3D (Grúas Magnéticas / Torretas EMP)
        (room.sabotageNodes || []).forEach(sn => {
            const sx = toWorldX(sn.x + sn.w / 2);
            const sz = toWorldZ(sn.y + sn.h / 2);
            const hx = toWorldX(sn.hazardX);
            const hz = toWorldZ(sn.hazardY);

            // Consola Cian de Sabotaje
            const nodeGrp = new THREE.Group();
            nodeGrp.position.set(sx, 0, sz);
            const ped = new THREE.Mesh(
                new THREE.CylinderGeometry(0.9, 1.2, 2.0, 6),
                new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
            );
            ped.position.y = 1.0;
            const holo = new THREE.Mesh(
                new THREE.TorusGeometry(0.75, 0.12, 8, 24),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
            );
            holo.position.y = 2.8;
            nodeGrp.add(ped, holo);
            roomGroup.add(nodeGrp);
            sabotageMeshes.set(sn.sabotageId, { nodeGrp, holo, sn });

            // Objeto físico 3D controlado (Grúa con contenedor suspendido o Torreta EMP)
            const hazGrp = new THREE.Group();
            hazGrp.position.set(hx, 0, hz);

            const dangerRing = new THREE.Mesh(
                new THREE.RingGeometry((sn.hazardRadius * SCALE) - 0.3, sn.hazardRadius * SCALE, 36),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.28 })
            );
            dangerRing.rotation.x = -Math.PI / 2;
            dangerRing.position.y = 0.06;
            hazGrp.add(dangerRing);

            let payloadMesh = null;
            if (sn.hazardType === 'crane') {
                // Contenedor de plasma suspendido a 8 metros de altura con cable magnético
                const cable = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.08, 8, 8),
                    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
                );
                cable.position.y = 9.5;
                payloadMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(3.4, 2.2, 2.4),
                    new THREE.MeshStandardMaterial({ map: textures.containerAmber || null, color: 0xf59e0b, roughness: 0.4 })
                );
                payloadMesh.position.y = 6.2;
                payloadMesh.castShadow = true;
                hazGrp.add(cable, payloadMesh);
            } else {
                // Torreta / Bobina Tesla EMP en el centro
                payloadMesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.8, 1.3, 3.6, 8),
                    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.5 })
                );
                payloadMesh.position.y = 1.8;
                hazGrp.add(payloadMesh);
            }

            roomGroup.add(hazGrp);
            hazardMeshes.set(sn.sabotageId, { hazGrp, payloadMesh, dangerRing, triggered: false, dropY: 6.2 });

            // Cable de datos 3D en el suelo que conecta el Nodo con la Grúa/Torreta
            const points = [
                new THREE.Vector3(sx, 0.12, sz),
                new THREE.Vector3(sx, 0.12, hz),
                new THREE.Vector3(hx, 0.12, hz)
            ];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
            const cableLine = new THREE.Line(lineGeo, lineMat);
            visorGroup.add(cableLine);
            roomGroup.add(cableLine.clone());
        });

        // 6. Barreras Láser 3D + Cables de conexión a su Terminal
        (room.lasers || []).forEach(ls => {
            const lx1 = toWorldX(ls.x1), lz1 = toWorldZ(ls.y1);
            const lx2 = toWorldX(ls.x2), lz2 = toWorldZ(ls.y2);
            const cx = (lx1 + lx2) / 2, cz = (lz1 + lz2) / 2;
            const len = Math.hypot(lx2 - lx1, lz2 - lz1);
            const ang = Math.atan2(lz2 - lz1, lx2 - lx1);

            const emitterGrp = new THREE.Group();
            emitterGrp.position.set(cx, 0, cz);
            emitterGrp.rotation.y = -ang;

            const beams = [];
            [0.8, 1.7, 2.6, 3.5].forEach(by => {
                const b = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.09, 0.09, len, 8),
                    new THREE.MeshBasicMaterial({ color: 0xff2a2a })
                );
                b.rotation.z = Math.PI / 2;
                b.position.y = by;
                emitterGrp.add(b);
                beams.push(b);
            });
            roomGroup.add(emitterGrp);
            laserMeshes.push({ ls, emitterGrp, beams });

            // Conectar con la terminal que la controla en modo Visor
            const termObj = terminalMeshes.get(ls.terminalId);
            if (termObj) {
                const pts = [
                    new THREE.Vector3(termObj.x, 0.14, termObj.z),
                    new THREE.Vector3(cx, 0.14, cz)
                ];
                const lGeo = new THREE.BufferGeometry().setFromPoints(pts);
                visorGroup.add(new THREE.Line(lGeo, new THREE.LineBasicMaterial({ color: 0xf59e0b })));
            }
        });

        // 7. Piso Matricial 3D Interactivo (Sala 04 de Misión 3)
        if (room.hasMatrixFloor) {
            const startX = 340, startY = 165, step = 56;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const px = startX + c * step;
                    const py = startY + r * step;
                    const wx = toWorldX(px);
                    const wz = toWorldZ(py);
                    const isDiag = (r === c);
                    const tileMat = new THREE.MeshStandardMaterial({
                        color: 0x1e293b,
                        emissive: isDiag ? 0x064e3b : 0x3b0764,
                        emissiveIntensity: 0.45,
                        roughness: 0.3
                    });
                    const tile = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.24, 4.6), tileMat);
                    tile.position.set(wx, 0.12, wz);
                    roomGroup.add(tile);
                    matrixTileMeshes.push({ r, c, px, py, tile, tileMat, activated: false });
                }
            }
        }

        // 8. Ítems (Estación de Expreso UTN +50 HP)
        (room.items || []).forEach(it => {
            if (it.taken) return;
            const ix = toWorldX(it.x + it.w / 2);
            const iz = toWorldZ(it.y + it.h / 2);
            const grp = new THREE.Group();
            grp.position.set(ix, 1.2, iz);
            const cup = new THREE.Mesh(
                new THREE.CylinderGeometry(0.65, 0.5, 1.3, 12),
                new THREE.MeshBasicMaterial({ color: 0x10b981 })
            );
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(1.0, 0.08, 8, 24),
                new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
            );
            ring.rotation.x = Math.PI / 2;
            grp.add(cup, ring);
            roomGroup.add(grp);
            itemMeshes.set(it.id, grp);
        });

        // 9. Cámaras de Seguridad en Muros
        (room.cameras || []).forEach(cam => {
            const cx = toWorldX(cam.x);
            const cz = toWorldZ(cam.y);
            const grp = new THREE.Group();
            grp.position.set(cx, 0, cz);

            const head = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 0.6, 0.6),
                new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
            );
            head.position.y = 3.8;

            const fov = cam.fov || 0.55;
            const dist = (cam.viewDist || 150) * SCALE;
            const coneGeo = new THREE.CircleGeometry(dist, 20, -fov / 2, fov);
            coneGeo.rotateX(-Math.PI / 2);
            const coneMat = new THREE.MeshBasicMaterial({
                color: 0xf59e0b,
                transparent: true,
                opacity: 0.20,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.position.y = 0.09;
            grp.add(head, cone);
            roomGroup.add(grp);
            cameraRigs.set(cam.id, { grp, cone, coneMat });
        });

        // 10. Centinelas 3D
        (room.guards || []).forEach(g => {
            const rig = buildGuardRig(g);
            actorsGroup.add(rig.root);
            guardRigs.set(g.id, rig);
        });

        // 11. Boss 3D y Balizas de Arena 3D
        if (room.hasBoss && gameState && gameState.boss) {
            bossRig = buildBossRig(gameState.boss.type || 'vulcan');
            actorsGroup.add(bossRig.root);

            const beaconCoords = [
                { x: 110, y: 78 },
                { x: 690, y: 78 },
                { x: 110, y: 372 },
                { x: 690, y: 372 }
            ];
            beaconCoords.forEach((bc, idx) => {
                const bx = toWorldX(bc.x);
                const bz = toWorldZ(bc.y);
                const bGrp = new THREE.Group();
                bGrp.position.set(bx, 0, bz);

                const ped = new THREE.Mesh(
                    new THREE.CylinderGeometry(1.1, 1.4, 2.2, 8),
                    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 })
                );
                ped.position.y = 1.1;

                const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
                const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.14, 8, 24), ringMat);
                ring.rotation.x = Math.PI / 2;
                ring.position.y = 2.6;

                const crystalMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true });
                const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), crystalMat);
                crystal.position.y = 3.4;

                bGrp.add(ped, ring, crystal);
                roomGroup.add(bGrp);
                doorMeshes.push({ isBeacon: true, idx, ring, ringMat, crystal, crystalMat });
            });
        }
        if (visorGroup) visorGroup.visible = CAM_STATE.visorActive;
    }

    // -------------------------------------------------------------------------
    // 5. DISPARADOR DE EFECTOS 3D (ONDAS, PARTÍCULAS, PROYECTILES, SABOTAJES)
    // -------------------------------------------------------------------------
    function triggerSabotage3DFX(sabotageId) {
        const h = hazardMeshes.get(sabotageId);
        if (!h) return;
        h.triggered = true;
        spawnShockwave3D(h.hazGrp.position.x, h.hazGrp.position.z, 16, 0x38bdf8);
    }

    function spawnShockwave3D(wx, wz, maxRadius = 12, colorHex = 0x38bdf8) {
        if (!fxGroup || typeof THREE === 'undefined') return;
        const geo = new THREE.RingGeometry(0.5, 0.95, 32);
        geo.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(wx, 0.15, wz);
        fxGroup.add(mesh);
        shockwaves3D.push({ mesh, mat, scale: 1, maxScale: maxRadius, life: 1.0 });
    }

    function spawnDashGhost3D(px, py, dir) {
        if (!fxGroup || typeof THREE === 'undefined') return;
        const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55, wireframe: true });
        const ghost = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.6, 0.7), mat);
        ghost.position.set(toWorldX(px), 1.4, toWorldZ(py));
        ghost.rotation.y = -dir + Math.PI / 2;
        fxGroup.add(ghost);
        dashGhosts3D.push({ mesh: ghost, mat, life: 0.35 });
    }

    // -------------------------------------------------------------------------
    // 6. ACTUALIZACIÓN Y RENDERIZADO DE CADA FRAME 3D
    // -------------------------------------------------------------------------
    function renderFrame3D(gameState, currentRoom, hackTerminals, arenaBeacons, activeBeaconIdx, dt) {
        if (!renderer || !scene || !camera || !gameState) return;
        const now = performance.now() * 0.001;
        const p = gameState.player;

        // A. Actualizar Jugador (Solid Byte)
        if (playerRig && p) {
            const wx = toWorldX(p.x);
            const wz = toWorldZ(p.y);
            playerRig.root.position.set(wx, 0, wz);
            playerRig.root.rotation.y = -p.dir + Math.PI / 2;

            playerRig.bodyGroup.visible = !p.inBox;
            playerRig.boxGroup.visible = !!p.inBox;

            const moved = Math.hypot(p.x - playerRig.lastX, p.y - playerRig.lastY);
            playerRig.lastX = p.x;
            playerRig.lastY = p.y;

            if (moved > 0.1) {
                playerRig.walkPhase += moved * 0.38;
                const swing = Math.sin(playerRig.walkPhase) * 0.65;
                playerRig.leftLeg.rotation.x = swing;
                playerRig.rightLeg.rotation.x = -swing;
                playerRig.leftArm.rotation.x = -swing * 0.5;
            } else {
                playerRig.leftLeg.rotation.x *= 0.8;
                playerRig.rightLeg.rotation.x *= 0.8;
            }

            // Ondulación física de la bandana
            playerRig.tail1.rotation.x = 0.25 + Math.sin(now * 9) * 0.18 + (moved * 0.15);
            playerRig.tail2.rotation.x = 0.32 + Math.cos(now * 9) * 0.18 + (moved * 0.15);

            // Color del anillo táctico según estado de sigilo/alerta
            if (gameState.alertState === 'alert') {
                playerRig.baseRing.material.color.setHex(0xef4444);
            } else if (p.dashTimer > 0) {
                playerRig.baseRing.material.color.setHex(0x38bdf8);
            } else if (p.camoIndex >= 70) {
                playerRig.baseRing.material.color.setHex(0x10b981);
            } else {
                playerRig.baseRing.material.color.setHex(0x38bdf8);
            }
        }

        // B. Actualizar Centinelas 3D
        if (currentRoom && currentRoom.guards) {
            const activeIds = new Set();
            currentRoom.guards.forEach(g => {
                activeIds.add(g.id);
                let rig = guardRigs.get(g.id);
                if (!rig) {
                    rig = buildGuardRig(g);
                    actorsGroup.add(rig.root);
                    guardRigs.set(g.id, rig);
                }
                rig.root.position.set(toWorldX(g.x), 0, toWorldZ(g.y));
                rig.bodyGroup.rotation.y = -g.angle + Math.PI / 2;
                rig.visionMesh.rotation.z = -g.angle;
                rig.visionEdge.rotation.z = -g.angle;

                // Escalar cono según visión efectiva o apagar bajo EMP
                const empOff = (gameState.empTimer || 0) > 0;
                rig.visionMesh.visible = !empOff;
                rig.visionEdge.visible = !empOff;

                const distMoved = Math.hypot(g.x - rig.lastX, g.y - rig.lastY);
                rig.lastX = g.x;
                rig.lastY = g.y;
                if (distMoved > 0.08) {
                    rig.walkPhase += distMoved * 0.35;
                    rig.leftLeg.position.z = Math.sin(rig.walkPhase) * 0.28;
                    rig.rightLeg.position.z = -Math.sin(rig.walkPhase) * 0.28;
                }

                // Color del cono y visor según estado
                const cHex = gameState.alertState === 'alert' ? 0xef4444 : (g.investigateTimer > 0 ? 0xf59e0b : 0x38bdf8);
                rig.visorMat.color.setHex(cHex);
                rig.coneMat.color.setHex(cHex);
                rig.edgeMat.color.setHex(cHex);

                if (g._bubble) {
                    rig.alertGem.visible = true;
                    rig.alertGem.rotation.y = now * 5;
                    rig.alertGem.material.color.setHex(g._bubble.ch === '!' ? 0xff2a2a : 0xfbbf24);
                } else {
                    rig.alertGem.visible = false;
                }
            });

            // Remover rigs de centinelas que pasaron a sleepers (CQC)
            guardRigs.forEach((rig, id) => {
                if (!activeIds.has(id)) {
                    actorsGroup.remove(rig.root);
                    guardRigs.delete(id);
                }
            });
        }

        // C. Centinelas Dormidos (CQC)
        if (currentRoom && currentRoom.sleepers) {
            currentRoom.sleepers.forEach(sg => {
                let sMesh = sleeperRigs.get(sg.id);
                if (!sMesh) {
                    sMesh = new THREE.Group();
                    const body = new THREE.Mesh(
                        new THREE.BoxGeometry(2.2, 0.55, 1.0),
                        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 })
                    );
                    body.position.y = 0.3;
                    const stunRing = new THREE.Mesh(
                        new THREE.TorusGeometry(0.65, 0.06, 8, 16),
                        new THREE.MeshBasicMaterial({ color: 0x34d399 })
                    );
                    stunRing.rotation.x = Math.PI / 2;
                    stunRing.position.y = 1.1;
                    sMesh.add(body, stunRing);
                    actorsGroup.add(sMesh);
                    sleeperRigs.set(sg.id, sMesh);
                }
                sMesh.position.set(toWorldX(sg.x), 0, toWorldZ(sg.y));
                sMesh.children[1].rotation.z = now * 3;
            });
        }

        // D. Cámaras de Seguridad
        if (currentRoom && currentRoom.cameras) {
            currentRoom.cameras.forEach(cam => {
                const cr = cameraRigs.get(cam.id);
                if (!cr) return;
                cr.cone.rotation.z = -(cam.angle || cam.baseAngle);
                cr.cone.visible = (gameState.empTimer || 0) <= 0;
            });
        }

        // E. Actualizar Grúas / Torretas Saboteadas e Ítems
        hazardMeshes.forEach(h => {
            if (h.triggered && h.payloadMesh && h.dropY > 1.1) {
                h.dropY = Math.max(1.1, h.dropY - 22 * dt);
                h.payloadMesh.position.y = h.dropY;
            }
        });
        if (currentRoom && currentRoom.items) {
            currentRoom.items.forEach(it => {
                const im = itemMeshes.get(it.id);
                if (im) {
                    im.visible = !it.taken;
                    im.rotation.y = now * 2.5;
                }
            });
        }

        // F. Terminales, Puertas, Balizas de Boss y Láseres
        terminalMeshes.forEach((tm, id) => {
            const data = (hackTerminals || []).find(t => t.id === id);
            const unlocked = data && data.unlocked;
            tm.screenMat.color.setHex(unlocked ? 0x10b981 : 0xf59e0b);
            tm.holoCube.material.color.setHex(unlocked ? 0x10b981 : 0xf59e0b);
            tm.holoCube.rotation.y = now * 2.2;
            tm.holoCube.rotation.x = now * 1.3;
        });

        sabotageMeshes.forEach(sm => {
            sm.holo.rotation.y = now * 3;
            if (sm.sn._used) {
                sm.holo.material.color.setHex(0x10b981);
            }
        });

        laserMeshes.forEach(lm => {
            const term = (hackTerminals || []).find(t => t.id === lm.ls.terminalId);
            const active = (!term || !term.unlocked) && (gameState.empTimer || 0) <= 0;
            lm.emitterGrp.visible = active;
        });

        doorMeshes.forEach(dm => {
            if (dm.isBeacon) {
                const bData = (arenaBeacons || [])[dm.idx];
                const isDone = bData && bData.completed;
                const isActive = dm.idx === activeBeaconIdx && !isDone;
                const col = isDone ? 0x10b981 : (isActive ? 0xfbbf24 : 0x475569);
                dm.ringMat.color.setHex(col);
                dm.crystalMat.color.setHex(col);
                dm.crystal.rotation.y = now * (isActive ? 4.0 : 1.2);
                dm.ring.scale.setScalar(isActive ? (1.1 + Math.sin(now * 8) * 0.15) : 1.0);
                return;
            }
            const lockdown = currentRoom && currentRoom.hasBoss && gameState.boss && gameState.boss.hp > 0;
            const canOpen = !lockdown && (gameState.player.keycard >= dm.door.reqKey);
            dm.frameMat.color.setHex(canOpen ? 0x10b981 : 0xef4444);
            dm.floorPad.material.color.setHex(canOpen ? 0x10b981 : 0xef4444);
        });

        // G. Actualizar Proyectiles 3D (Guardias y Boss)
        const allProjs = (gameState.bossProjectiles || []).concat(gameState.guardProjectiles || []);
        while (projectiles3D.length < allProjs.length) {
            const pm = new THREE.Mesh(
                new THREE.SphereGeometry(0.45, 10, 10),
                new THREE.MeshBasicMaterial({ color: 0xff3b30 })
            );
            fxGroup.add(pm);
            projectiles3D.push(pm);
        }
        for (let i = 0; i < projectiles3D.length; i++) {
            const pm = projectiles3D[i];
            if (i < allProjs.length) {
                const pr = allProjs[i];
                pm.visible = true;
                pm.position.set(toWorldX(pr.x), 1.6, toWorldZ(pr.y));
                pm.material.color.setHex(pr.colorHex || 0xff3b30);
            } else {
                pm.visible = false;
            }
        }

        // H. Actualizar Boss 3D
        if (currentRoom && currentRoom.hasBoss && bossRig && gameState.boss) {
            const b = gameState.boss;
            bossRig.root.visible = b.hp > 0;
            const bx = toWorldX(b.x);
            const bz = toWorldZ(b.y);
            const by = (b.elevation || 0) * SCALE;
            bossRig.root.position.set(bx, by, bz);

            const isStunned = b.state === 'stunned';
            bossRig.shieldMesh.visible = !isStunned && b.hp > 0;
            bossRig.shieldMesh.rotation.y = now * 0.8;
            bossRig.coreMat.color.setHex(isStunned ? 0xff2a2a : 0x00ff66);
            const scalePulse = isStunned ? (1.25 + Math.sin(now * 14) * 0.22) : 1.0;
            bossRig.coreMesh.scale.setScalar(scalePulse);

            if (bossRig.type === 'olympo' && bossRig.targetRing) {
                if (b.leapProgress > 0 && b.leapTarget) {
                    bossRig.targetRing.visible = true;
                    bossRig.targetRing.position.set(toWorldX(b.leapTarget.x), 0.15, toWorldZ(b.leapTarget.y));
                } else {
                    bossRig.targetRing.visible = false;
                }
            }
            if (bossRig.type === 'rex' && bossRig.laserBeam) {
                if (b.laserSweeping && b.hp > 0) {
                    bossRig.laserBeam.visible = true;
                    const ang = b.laserAngle || Math.PI;
                    bossRig.laserBeam.position.set(bx + Math.cos(ang) * 32, 3.2, bz + Math.sin(ang) * 32);
                    bossRig.laserBeam.rotation.y = -ang;
                } else {
                    bossRig.laserBeam.visible = false;
                }
            }
        }

        // I. Ondas de choque 3D y fantasmas de Dash
        for (let i = shockwaves3D.length - 1; i >= 0; i--) {
            const sw = shockwaves3D[i];
            sw.life -= dt * 1.6;
            sw.scale += (sw.maxScale - sw.scale) * dt * 6;
            sw.mesh.scale.setScalar(sw.scale);
            sw.mat.opacity = Math.max(0, sw.life);
            if (sw.life <= 0) {
                fxGroup.remove(sw.mesh);
                shockwaves3D.splice(i, 1);
            }
        }
        for (let i = dashGhosts3D.length - 1; i >= 0; i--) {
            const dg = dashGhosts3D[i];
            dg.life -= dt;
            dg.mat.opacity = Math.max(0, dg.life * 1.5);
            if (dg.life <= 0) {
                fxGroup.remove(dg.mesh);
                dashGhosts3D.splice(i, 1);
            }
        }

        // J. Nieve / Partículas Atmosféricas
        if (snowSystem) {
            snowSystem.rotation.y = now * 0.05;
        }

        // K. Director de Cámara 3D Dinámica (Táctica + Corner-Cam + Boss)
        updateCamera3D(gameState, currentRoom, dt);

        renderer.render(scene, camera);
    }

    function updateCamera3D(gameState, currentRoom, dt) {
        const p = gameState.player;
        if (!p || !camera) return;

        const px = toWorldX(p.x);
        const pz = toWorldZ(p.y);

        // Detectar si está pegado a un obstáculo interno (Corner-Cam Kojima)
        let nearInteriorWall = false;
        if (currentRoom && currentRoom.walls) {
            for (const w of currentRoom.walls) {
                if (w.kind === 'perimeter') continue;
                if (p.x >= w.x - 24 && p.x <= w.x + w.w + 24 &&
                    p.y >= w.y - 24 && p.y <= w.y + w.h + 24) {
                    nearInteriorWall = true;
                    break;
                }
            }
        }

        const targetHug = nearInteriorWall ? 1 : 0;
        CAM_STATE.wallHugFactor += (targetHug - CAM_STATE.wallHugFactor) * Math.min(1, dt * 4);

        let baseHeight = 40;
        let baseBack = 25;
        if (CAM_STATE.mode === 'close') {
            baseHeight = 22;
            baseBack = 18;
        } else if (CAM_STATE.mode === 'overhead') {
            baseHeight = 56;
            baseBack = 6;
        }

        // En Corner-Cam la cámara baja sutilmente para dar perspectiva 3D dramática
        const effHeight = baseHeight - CAM_STATE.wallHugFactor * 7;
        const effBack = baseBack - CAM_STATE.wallHugFactor * 3;

        const lookAheadX = Math.cos(p.dir) * 3.2;
        const lookAheadZ = Math.sin(p.dir) * 3.2;

        // Si estamos en sala de Boss, encuadrar entre el jugador y el Boss
        let targetLookX = px * 0.65 + lookAheadX;
        let targetLookZ = pz * 0.65 + lookAheadZ;
        if (currentRoom && currentRoom.hasBoss && gameState.boss && gameState.boss.hp > 0) {
            const bx = toWorldX(gameState.boss.x);
            const bz = toWorldZ(gameState.boss.y);
            targetLookX = (px + bx) * 0.35;
            targetLookZ = (pz + bz) * 0.35;
        }

        let shakeX = 0, shakeZ = 0;
        if (gameState.screenShake > 0) {
            shakeX = (Math.random() - 0.5) * gameState.screenShake * 2.4;
            shakeZ = (Math.random() - 0.5) * gameState.screenShake * 2.4;
        }

        const targetCamX = targetLookX * 0.75 + shakeX;
        const targetCamZ = targetLookZ * 0.65 + effBack + shakeZ;

        const damp = Math.min(1, dt * 6.5);
        CAM_STATE.curPos.x += (targetCamX - CAM_STATE.curPos.x) * damp;
        CAM_STATE.curPos.y += (effHeight - CAM_STATE.curPos.y) * damp;
        CAM_STATE.curPos.z += (targetCamZ - CAM_STATE.curPos.z) * damp;

        CAM_STATE.curLook.x += (targetLookX - CAM_STATE.curLook.x) * damp;
        CAM_STATE.curLook.z += (targetLookZ - CAM_STATE.curLook.z) * damp;

        camera.position.set(CAM_STATE.curPos.x, CAM_STATE.curPos.y, CAM_STATE.curPos.z);
        camera.lookAt(CAM_STATE.curLook.x, 1.2, CAM_STATE.curLook.z);
    }

    function cycleCameraMode() {
        const order = ['tactical', 'close', 'overhead'];
        const next = order[(order.indexOf(CAM_STATE.mode) + 1) % order.length];
        CAM_STATE.mode = next;
        return next;
    }

    function toggleVisor3D(forceState) {
        CAM_STATE.visorActive = (typeof forceState === 'boolean') ? forceState : !CAM_STATE.visorActive;
        if (visorGroup) visorGroup.visible = CAM_STATE.visorActive;
        if (scene) {
            scene.fog.color.setHex(CAM_STATE.visorActive ? 0x05283d : 0x060b14);
        }
        return CAM_STATE.visorActive;
    }

    function getMatrixTiles() {
        return matrixTileMeshes;
    }

    window.MGS3D_GFX = {
        init3D,
        buildRoom3D,
        renderFrame3D,
        spawnShockwave3D,
        spawnDashGhost3D,
        triggerSabotage3DFX,
        cycleCameraMode,
        toggleVisor3D,
        getMatrixTiles,
        toWorldX,
        toWorldZ
    };
})();
