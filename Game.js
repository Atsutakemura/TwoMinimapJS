class Game {
    constructor() {
		this.canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true);
		
		this.scene = new BABYLON.Scene(this.engine);
		
        this.unitRegister = {1:{unit_id:1, unit_mass:1.6, unit_structure:600, unit_speed:12, unit_range:200, unit_ground:-50},  // Spaceship
            2:{unit_id:2, unit_mass:.3, unit_structure:50, unit_speed:3, unit_range:100, unit_ground:0},    // Infantry
            3:{unit_id:3, unit_mass:.9, unit_structure:320, unit_speed:7, unit_range:150, unit_ground:.1}    // Vehicle
        };

        this.buildingRegister = {1:{building_id:1, building_mass:2.2, building_structure:1600, building_position:new BABYLON.Vector3(-20, 0, 0)},  // Titanmine
            2:{building_id:2, building_mass:1.5, building_structure:1250, building_position:new BABYLON.Vector3(20, 0, 20)},    // Siliziummine
            3:{building_id:3, building_mass:1.5, building_structure:500, building_position:new BABYLON.Vector3(20, 0, 20)},    // Chemiefabrik
            4:{building_id:4, building_mass:1.5, building_structure:750, building_position:new BABYLON.Vector3(0, 0, 50)},    // Synthesizer
            5:{building_id:5, building_mass:1.5, building_structure:280, building_position:new BABYLON.Vector3(50, 0, 50)},    // Gewächshaus
            6:{building_id:6, building_mass:5.5, building_structure:3200, building_position:new BABYLON.Vector3(0, 0, 0)}    // Basis
        };

        this.users = [{user_id:1, user_type:0},    // Player
            {user_id:101, user_type:50},    // Imperialist
            {user_id:3001, user_type:1001} // Neutral
        ];

        this.mapTypes = {SPACE:1, GROUND:2};
		this.mapTextureSize = 256;
        this.mapScale = 1;
        this.mapSize = this.mapScale * this.mapTextureSize;
        this.starts = [new BABYLON.Vector3(-.4*this.mapSize, 0, -.4*this.mapSize),
            new BABYLON.Vector3(.4*this.mapSize, 0, .4*this.mapSize),
            new BABYLON.Vector3(.25*this.mapSize, 0, .25*this.mapSize)];

        this.spawnOffset = new BABYLON.Vector3(0, 0, this.buildingRegister[6]['building_mass']);

        this.rulers = [];
        this.userId = this.users[0]['user_id']; // main player id
		
        this.createScene();
    }
    
    createScene() {
        this.cameraSystem = new CameraSystem(this);

        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        this.light.intensity = 0.7;
		
		this.userGroups = [];
		this.units = [];
        this.userUnits = [];
        this.otherUnits = [];
        this.enemyUnits = [];
		
		this.selectionManager = new SelectionManager(this);
		
		this.ground = new Ground(this, 'assets/textures/background.png', this.mapTypes.SPACE);

        this.scene.onReadyObservable.add(() => {
            for (let i=0; i<this.users.length; i++) {
                const newRuler = new Ruler(this, this.users[i], this.starts[i]);
                this.rulers.push(newRuler);
            }

            this.selectionManager.addSelection();

            this.rollingAverage = new BABYLON.RollingAverage(60);
            this.scene.registerBeforeRender(() => {
                this.rollingAverage.add(this.scene.getAnimationRatio());
                this.update(this.rollingAverage.average);
            });
        });
		
		this.engine.runRenderLoop(() => {
			this.scene.render();
		});

        window.addEventListener('resize', () => {	// Watch for browser/canvas resize events
            this.engine.resize();
        });
		
		return this.scene;
    }

    update(dT) {
        for (let i=0; i<this.units; i++) {
            this.units[i].battle();
        }
        this.selectionManager.update(dT);
    }
}