
        // Three.js Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 500, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('threeCanvas'),
            antialias: true,
            alpha: true
        });
        
        const container = document.getElementById('viewer-container');
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0xf8fafc, 1);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xf59e0b, 1, 100);
        pointLight.position.set(0, 5, 5);
        scene.add(pointLight);

        camera.position.z = 3;
        camera.position.y = 1;

        let minerModel = null;
        let currentMotionState = 'resting';
        let animationTime = 0;
        let currentModelFile = '';

        // ========================================
        // 🎯 CHANGE YOUR GLB FILE NAMES HERE! 🎯
        // ========================================
        // Model file mapping
        const modelFiles = {
            'resting': 'fgh.glb',      // ← Change this to your resting model file name
            'walking': 'fgh.glb',      // ← Change this to your walking model file name
            'running': 'fgh.glb',      // ← Change this to your running model file name
            'freefall': 'fgh.glb'      // ← Change this to your falling model file name
        };
        // ========================================

        // Load GLTF Model
        const loader = new THREE.GLTFLoader();

        function loadModel(modelFile) {
            if (currentModelFile === modelFile) return;
            currentModelFile = modelFile;

            // Remove existing model
            if (minerModel) {
                scene.remove(minerModel);
                minerModel = null;
            }

            loader.load(modelFile, 
                (gltf) => {
                    minerModel = gltf.scene;
                    minerModel.scale.set(1, 1, 1);
                    minerModel.position.set(0, -1, 0);
                    scene.add(minerModel);
                    console.log('Model loaded:', modelFile);
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                (error) => {
                    console.error('Error loading model:', error);
                    // Create a fallback cube if model fails to load
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshPhongMaterial({ color: 0xf59e0b });
                    minerModel = new THREE.Mesh(geometry, material);
                    minerModel.position.set(0, 0, 0);
                    scene.add(minerModel);
                }
            );
        }

        // Load initial model
        loadModel(modelFiles['resting']);

        // Chart.js Setup
        const chartConfig = (label, color) => ({
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: label,
                    data: [],
                    borderColor: color,
                    backgroundColor: color + '33',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true,
                        labels: { color: '#1e293b' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#e2e8f0' },
                        ticks: { color: '#64748b' }
                    },
                    x: {
                        grid: { color: '#e2e8f0' },
                        ticks: { color: '#64748b' }
                    }
                }
            }
        });

        const ch4Chart = new Chart(document.getElementById('ch4Chart').getContext('2d'), 
            chartConfig('Methane (CH4)', '#f59e0b'));
        const coChart = new Chart(document.getElementById('coChart').getContext('2d'), 
            chartConfig('Carbon Monoxide (CO)', '#ef4444'));
        const nh3Chart = new Chart(document.getElementById('nh3Chart').getContext('2d'), 
            chartConfig('Ammonia (NH3)', '#8b5cf6'));
        const smokeChart = new Chart(document.getElementById('smokeChart').getContext('2d'), 
            chartConfig('Smoke/LPG', '#64748b'));
        const oxygenChart = new Chart(document.getElementById('oxygenChart').getContext('2d'), 
            chartConfig('Oxygen (O2)', '#3b82f6'));

        // Data Management
        const maxDataPoints = 20;

        function updateChart(chart, value) {
            const time = new Date().toLocaleTimeString();
            
            if (chart.data.labels.length >= maxDataPoints) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            
            chart.data.labels.push(time);
            chart.data.datasets[0].data.push(value);
            chart.update('none');
        }

        // Danger Level Calculation
        function calculateDangerLevel(ch4, co, smoke) {
            // Normalize values (adjust thresholds based on your sensors)
            const ch4Danger = Math.min((ch4 / 1000) * 100, 100);
            const coDanger = Math.min((co / 500) * 100, 100);
            const smokeDanger = Math.min((smoke / 800) * 100, 100);
            
            // Weighted average (CO is most dangerous)
            const dangerLevel = (ch4Danger * 0.3 + coDanger * 0.4 + smokeDanger * 0.3);
            return Math.min(dangerLevel, 100);
        }

        function updateDangerMeter(dangerLevel, isFalling) {
            const meterFill = document.getElementById('dangerMeterFill');
            const dangerText = document.getElementById('dangerLevelText');
            const dangerOverlay = document.getElementById('dangerOverlay');
            const dangerSign = document.getElementById('dangerSign');
            
            meterFill.style.width = dangerLevel + '%';
            
            let levelText = 'SAFE';
            let levelClass = 'danger-level-safe';
            let showDanger = false;
            
            if (isFalling || dangerLevel >= 75) {
                levelText = 'CRITICAL';
                levelClass = 'danger-level-critical';
                meterFill.classList.add('critical');
                showDanger = true;
            } else if (dangerLevel >= 60) {
                levelText = 'DANGER';
                levelClass = 'danger-level-danger';
                meterFill.classList.remove('critical');
                showDanger = true;
            } else if (dangerLevel >= 40) {
                levelText = 'WARNING';
                levelClass = 'danger-level-warning';
                meterFill.classList.remove('critical');
            } else if (dangerLevel >= 20) {
                levelText = 'CAUTION';
                levelClass = 'danger-level-caution';
                meterFill.classList.remove('critical');
            } else {
                levelText = 'SAFE';
                levelClass = 'danger-level-safe';
                meterFill.classList.remove('critical');
            }
            
            dangerText.textContent = levelText;
            dangerText.className = 'danger-level-text ' + levelClass;
            
            // Show/hide danger overlay
            if (showDanger) {
                dangerOverlay.classList.add('active');
                dangerSign.classList.add('active');
            } else {
                dangerOverlay.classList.remove('active');
                dangerSign.classList.remove('active');
            }
        }

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            
            if (minerModel) {
                animationTime += 0.016;
                
                // Rotate model slowly
                minerModel.rotation.y += 0.005;
            }
            
            renderer.render(scene, camera);
        }
        animate();

        // Fetch and Update Data
        let lastMotionState = 'resting';

        async function fetchData() {
            try {
                const response = await fetch('latest.txt?' + new Date().getTime());
                const text = await response.text();
                const data = text.trim().split(',');
                
                if (data.length >= 14) {
                    const [ch4, co, nh3, smoke, temp, hum, flame, worn, motion_state, accX, accY, accZ, pressure, height, oxygen] = data;
                    
                    // Parse gas values
                    const ch4Val = parseFloat(ch4);
                    const coVal = parseFloat(co);
                    const smokeVal = parseFloat(smoke);
                    
                    // Update charts
                    updateChart(ch4Chart, ch4Val);
                    updateChart(coChart, coVal);
                    updateChart(nh3Chart, parseFloat(nh3));
                    updateChart(smokeChart, smokeVal);
                    updateChart(oxygenChart, parseFloat(oxygen || 0));
                    
                    // Update gas readings
                    document.getElementById('ch4Reading').textContent = ch4Val.toFixed(0);
                    document.getElementById('coReading').textContent = coVal.toFixed(0);
                    document.getElementById('smokeReading').textContent = smokeVal.toFixed(0);
                    
                    // Update environmental display
                    document.getElementById('tempValue').textContent = parseFloat(temp).toFixed(1) + '°C';
                    document.getElementById('humValue').textContent = parseFloat(hum).toFixed(1) + '%';
                    
                    // Update pressure and height
                    document.getElementById('pressureValue').textContent = parseFloat(pressure || 0).toFixed(1) + ' hPa';
                    document.getElementById('heightValue').textContent = parseFloat(height || 0).toFixed(1) + ' m';
                    
                    // Update flame sensor
                    const flameValue = parseInt(flame);
                    document.getElementById('flameValue').textContent = flameValue;
                    const fireAlarm = document.getElementById('fireAlarm');
                    
                    if (flameValue < 500) {
                        fireAlarm.classList.add('active');
                        document.getElementById('flameIcon').style.display = 'block';
                        document.getElementById('dangerText').style.display = 'block';
                    } else {
                        fireAlarm.classList.remove('active');
                        document.getElementById('flameIcon').style.display = 'none';
                        document.getElementById('dangerText').style.display = 'none';
                    }
                    
                    // Update helmet status
                    const isWorn = worn.trim().toLowerCase() === 'true' || worn.trim() === '1';
                    const statusBadge = document.getElementById('helmetStatus');
                    
                    if (isWorn) {
                        statusBadge.textContent = '✓ Helmet Weared';
                        statusBadge.className = 'status-badge status-worn';
                    } else {
                        statusBadge.textContent = '✗ Helmet Removed';
                        statusBadge.className = 'status-badge status-removed';
                    }
                    
                    // Update motion state and load appropriate model
                    const motionState = motion_state.trim().toLowerCase();
                    currentMotionState = motionState;
                    const motionIcon = document.getElementById('motionIcon');
                    const motionText = document.getElementById('motionText');
                    const freefallAlert = document.getElementById('freefallAlert');
                    
                    let modelToLoad = modelFiles['resting'];
                    
                    if (motionState === 'freefall') {
                        motionIcon.textContent = '⚠️';
                        motionText.textContent = 'FREE FALL!!!';
                        motionText.style.color = '#ef4444';
                        freefallAlert.classList.add('active');
                        modelToLoad = modelFiles['freefall'];
                    } else {
                        motionText.style.color = '#1e293b';
                        freefallAlert.classList.remove('active');
                        
                        if (motionState === 'walking') {
                            motionIcon.textContent = '🚶';
                            motionText.textContent = 'WALKING';
                            modelToLoad = modelFiles['walking'];
                        } else if (motionState === 'running') {
                            motionIcon.textContent = '🏃';
                            motionText.textContent = 'RUNNING';
                            modelToLoad = modelFiles['running'];
                        } else {
                            motionIcon.textContent = '🧍';
                            motionText.textContent = 'RESTING';
                            modelToLoad = modelFiles['resting'];
                        }
                    }
                    
                    // Load appropriate model
                    loadModel(modelToLoad);
                    
                    // Calculate and update danger level
                    const dangerLevel = calculateDangerLevel(ch4Val, coVal, smokeVal);
                    const isFalling = motionState === 'freefall';
                    updateDangerMeter(dangerLevel, isFalling);
                    
                    lastMotionState = motionState;
                    
                    // Apply accelerometer tilt (subtle effect)
                    if (minerModel && motionState !== 'freefall') {
                        const ax = parseFloat(accX) / 10000;
                        const ay = parseFloat(accY) / 10000;
                        minerModel.rotation.z = ax * 0.3;
                        minerModel.rotation.x = ay * 0.3;
                    }
                    
                    // Update connection status
                    document.getElementById('statusDot').className = 'status-dot';
                    document.getElementById('statusText').textContent = 'Connected';
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                document.getElementById('statusDot').className = 'status-dot error';
                document.getElementById('statusText').textContent = 'Connection Error';
            }
        }

        // Start fetching data
        fetchData();
        setInterval(fetchData, 1000);

        // Handle window resize
        window.addEventListener('resize', () => {
            const container = document.getElementById('viewer-container');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
  
