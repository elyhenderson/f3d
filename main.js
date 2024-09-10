// Helper function to set up a scene, camera, and renderer
function createScene(containerId) {
    const container = document.getElementById(containerId);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);

    camera.position.z = 5;

    return { scene, camera, renderer };
}

// Function to load a GLB model and animate it
function loadGLB(sceneSetup, modelPath) {
    const loader = new THREE.GLTFLoader();
    let mixer = null; // Declare mixer outside

    loader.load(
        modelPath,
        function(gltf) {
            console.log('GLB model loaded:', modelPath); // Log when model is loaded
            // Add the loaded object to the scene
            const model = gltf.scene;
            sceneSetup.scene.add(model);

            // Set up animation mixer
            mixer = new THREE.AnimationMixer(model);
            console.log('Mixer created for model:', modelPath); // Log when mixer is created

            // Animation loop
            const clock = new THREE.Clock();
            function animate() {
                requestAnimationFrame(animate);
                if (mixer) {
                    const delta = clock.getDelta();
                    mixer.update(delta);
                }
                sceneSetup.renderer.render(sceneSetup.scene, sceneSetup.camera);
            }
            animate();
        },
        undefined,
        function(error) {
            console.error('An error occurred loading the GLB:', error);
        }
    );

    return mixer; // Return mixer for later use
}

// Set up the first scene for the first animated object (centered and animating immediately)
const firstSceneSetup = createScene('first-animation');
loadGLB(firstSceneSetup, 'object2.glb'); // Update the path to your first GLB model

// Set up the second scene for the second animated object (to the right, animation linked to scroll)
const secondSceneSetup = createScene('second-animation');
let secondMixer = null; // Store the mixer to control the animation later
let animationAction = null;
let animationDuration = 0;

// Load the second GLB
secondMixer = loadGLB(secondSceneSetup, 'babbabii.glb'); // Update the path to your second GLB model

// Scroll event listener to control the animation progress based on scroll
window.addEventListener('scroll', function() {
    const secondAnimationContainer = document.getElementById('second-animation');
    const rect = secondAnimationContainer.getBoundingClientRect();
    const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Calculate the percentage of scroll for the second object
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercent = Math.max(0, Math.min(1, (scrollTop - rect.top) / rect.height));

    console.log('Scroll percentage:', scrollPercent); // Log scroll percentage

    if (secondMixer) {
        if (!animationAction) {
            // Initialize animationAction when it's ready
            animationAction = secondMixer.clipAction(secondMixer._root.animations[0]);
            animationDuration = animationAction.getClip().duration; // Get the animation duration
            console.log('Animation action initialized:', animationAction); // Log when animationAction is initialized
        }

        // Set animation time based on scroll percentage
        animationAction.paused = true; // Pause the normal animation loop
        animationAction.time = animationDuration * scrollPercent; // Set animation progress based on scroll
        console.log('Animation time set to:', animationAction.time); // Log the current animation time
        secondMixer.update(0); // Update the mixer to reflect the new animation state
    }
});

// Handle window resizing for both scenes
window.addEventListener('resize', function() {
    // First scene resizing
    firstSceneSetup.camera.aspect = firstSceneSetup.renderer.domElement.clientWidth / firstSceneSetup.renderer.domElement.clientHeight;
    firstSceneSetup.camera.updateProjectionMatrix();
    firstSceneSetup.renderer.setSize(firstSceneSetup.renderer.domElement.clientWidth, firstSceneSetup.renderer.domElement.clientHeight);

    // Second scene resizing
    secondSceneSetup.camera.aspect = secondSceneSetup.renderer.domElement.clientWidth / secondSceneSetup.renderer.domElement.clientHeight;
    secondSceneSetup.camera.updateProjectionMatrix();
    secondSceneSetup.renderer.setSize(secondSceneSetup.renderer.domElement.clientWidth, secondSceneSetup.renderer.domElement.clientHeight);
});
