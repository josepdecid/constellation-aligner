import * as THREE from 'three'

import { centerDataPoints, getRandomAlignedPointToTarget } from './utils';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Vector3 } from 'three';
import data from '../resources/samples/pentagram.json'

let windowContext: any = window;
let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let controls: OrbitControls

const SKIP_POINTS = 15;
let startPoints: THREE.Mesh[] = []
let lineSegments: THREE.Line[] = []

init();
animate();

function init() {
    const scene = setupScene();
    setupCameraAndControls(scene);
    setupWorld();
    setupIllumination();
}

function setupWorld() {
    const dataPath = centerDataPoints(data)
    let previousRandomizedProjection: THREE.Vector3 = new THREE.Vector3()

    for (let i = 0; i < dataPath.length; i += SKIP_POINTS) {
        // Add points corresponding to the stars
        const material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, flatShading: true })
        const geometry = new THREE.DodecahedronGeometry(0.025, 10)

        let randomizedProjection = getRandomAlignedPointToTarget(
            new THREE.Vector3().copy(camera.position),
            new THREE.Vector3(dataPath[i].x, dataPath[i].y, 0)
        )

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.copy(randomizedProjection)

        mesh.updateMatrix()
        mesh.matrixAutoUpdate = false

        startPoints.push(mesh)
        scene.add(mesh)

        // Add lines that join all the points with a parametrized alpha value
        if (i > 0) {
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1 })
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                previousRandomizedProjection,
                randomizedProjection
            ])

            const linePoint = new THREE.Line(lineGeometry, lineMaterial)

            lineSegments.push(linePoint)
            scene.add(linePoint)
        }

        previousRandomizedProjection = randomizedProjection
    }

    // TODO: Set random initial position for x and z sin and cos with y=0
    // camera.position.copy(new Vector3())
}

function setupScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x350089, 0.002);

    /* const axesHelper = new THREE.AxesHelper();
    axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
    scene.add(axesHelper); */

    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load('resources/images/sky.jpg');
    scene.background = bgTexture;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize);

    return scene;
}

function setupCameraAndControls(scene: THREE.Scene) {
    const near = 0.1;
    const far = 10;

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, near, far);
    camera.position.set(0, 0, 3);
    camera.lookAt(scene.position);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(windowContext);

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = near;
    controls.maxDistance = far;

    controls.maxPolarAngle = Math.PI / 2;
}

function setupIllumination() {
    const dirLight1 = new THREE.DirectionalLight(0xffffff);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x002288);
    dirLight2.position.set(- 1, - 1, - 1);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
}

function checkAlignmentAndShowLines() {
    const cameraDirection = camera.getWorldDirection(new THREE.Vector3(0, 0, 0))
    const cameraAngleDistance = cameraDirection.distanceTo(new THREE.Vector3(0, 0, -1))
    lineSegments.forEach(lineSegment => {
        (lineSegment.material as THREE.Material).opacity = cameraAngleDistance < 0.5
            ? 2 * (0.5 - cameraAngleDistance) * 0.2
            : 0
    })
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate)
    checkAlignmentAndShowLines()
    controls.update()

    renderer.render(scene, camera)
}
