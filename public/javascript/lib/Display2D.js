
function default2DCamera(pixelsPerUnit, dimensions) {
    const aspectRatio = dimensions.height / dimensions.width; 
    const maxHorizontal = dimensions.width / (2 * pixelsPerUnit);
    const maxVertical = aspectRatio * maxHorizontal;

    const camera = new THREE.OrthographicCamera(-maxHorizontal, maxHorizontal, maxVertical, -maxVertical);
    const lookVector = vec3(0, 0, 0);

    camera.position.set(0, 0, 20);
    camera.lookAt(lookVector);

    return camera;
}

function construct2DGrid(viewportMaxAxis, centerLineColor, gridColor) {
    gridHelper = new THREE.GridHelper(viewportMaxAxis * 2, viewportMaxAxis * 2, centerLineColor, gridColor);
    gridHelper.position.z = DEFAULT_Z_2D - 10;
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.material.opacity = .5;
    gridHelper.material.transparent = true;

    return gridHelper;
}

function getRenderer(dimensions) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setClearColor(BACKGROUND_COLOR, 1.0);
    return renderer;
}

const wrapper = document.getElementById(WRAPPER_ID);
const dimensionProvider = () => new Dimensions(wrapper.offsetWidth, wrapper.offsetHeight);
const wrapperDimensions = dimensionProvider();

const renderer = getRenderer(wrapperDimensions);
const scene = new THREE.Scene();
const camera = default2DCamera(PIXELS_PER_UNIT, wrapperDimensions);
const grid = construct2DGrid(MAX_AXIS_VALUE, CENTER_LINE_COLOR, GRID_COLOR);

wrapper.appendChild(renderer.domElement);
scene.add(grid);

const movementHandler = new ScreenMovementHandler(wrapper, renderer, camera, RIGHT_MOUSE_BUTTON);
const intersectionFinder = new IntersectionFinder(camera, renderer.context.canvas.getBoundingClientRect(), new THREE.Raycaster());
const helperLinesHandler = new HelperLinesHandler(true, grid, intersectionFinder, wrapper, scene, MAX_AXIS_VALUE);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
