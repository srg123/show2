
'use strict';

var ShowRoom = (function () {

    var Validator = THREE.OBJLoader2.prototype._getValidator();

    function ShowRoom( elementToBindTo ) {
        this.renderer = null;
        this.canvas = elementToBindTo;
        this.aspectRatio = 1;
        this.recalcAspectRatio();

        this.scene = null;
        this.cameraDefaults = {
            posCamera: new THREE.Vector3( 0, 100, 300),
            posCameraTarget: new THREE.Vector3( 0, 0, 0 ),
            near: 1,
            far: 10000,
            fov: 70
        };
        this.camera = null;
        this.cubeCamera1 =  null;
        this.cameraTarget = this.cameraDefaults.posCameraTarget;

        //使用可配置数量的线程从指令队列中协调加载多个OBJ文件/数据
        this.wwDirector = new THREE.OBJLoader2.WWOBJLoader2Director();
        this.wwDirector.setCrossOrigin( 'anonymous' );

        this.controls1 = null;
        this.controls2 = null;
        this.controls = null;

        this.cube = null;

        this.allAssets = [];
        this.feedbackArray = null;

        this.running = false;

        this.stats = new Stats();

        this.raycaster = null;
        this.INTERSECTED = null;
        this.mouse = new THREE.Vector2();
        this.clock = new THREE.Clock();
        this.projector = new THREE.Projector();
        this.gSelectList=[];
        this.gModeMap={};

        //SSAA
        this.composer = null;
        this.copyPass = null;
        this.ssaaRenderPassP = null;
        this.params = {
            sampleLevel:4,
            renderToScreen: false,
            unbiased: true,
            camera: 'perspective',
            clearColor: 'black',
            clearAlpha: 1.0,
            autoRotate: true,
            enabled :true

        };

        //材质库
        this.materialsLib = null;
        this.mlib = null;
        this.textureCube = null;
    }

    ShowRoom.prototype.initGL = function () {

        //渲染器初始化
        this.renderer = new THREE.WebGLRenderer({
            antialias:false,
            canvas: this.canvas
        });
        //renderer.sortObjects = true;
        //renderer.autoClear = true;
        //遮挡剔除模式 ,与材质面有关系
        // renderer.setFaceCulling( THREE.CullFaceNone,THREE.FrontFaceDirectionCW );

        // SHADOW
        this.renderer.shadowMap.renderReverseSided = false;
        this.renderer.shadowMap.enabled = true;

        //tonmapping
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight  );

        //创景初始化
        this.scene = new THREE.Scene();
        // scene.background = new THREE.Color( 0xf0f0f0 );
        //scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
        //scene.fog = new THREE.FogExp2( 0xffffff, 0.00015 );

        //相机初始化
        this.camera = new THREE.PerspectiveCamera( this.cameraDefaults.fov, this.aspectRatio, this.cameraDefaults.near, this.cameraDefaults.far );
        this.resetCamera();

        this.cubeCamera1 = new THREE.CubeCamera( this.cameraDefaults.near, this.cameraDefaults.far, 2048 );
        //cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

        //控制器初始化
        this.controls1 = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls1.enableZoom = true;
        this.controls1.minPolarAngle = Math.PI * 0.01;
        this.controls1.maxPolarAngle = Math.PI * 0.47;
        this.controls1.maxDistance = 300;
        this.controls1.minDistance = 50;
        this.controls1.enabled = true;

        this.controls2 = new THREE.FirstPersonControls(this.camera, this.renderer.domElement);
        this.controls2.lookSpeed = 0.0325;
        this.controls2.autoForward=false;
        this.controls2.movementSpeed = 100;
        this.controls2.noFly = true ;
        this.controls2.lookVertical = true;
        this.controls2.constrainVertical = true;
        this.controls2.verticalMin = 1.5;
        this.controls2.verticalMax = 2.0;
        this.controls2.lon = 250;
        this.controls2.enabled = false;

        this.controls = new THREE.TransformControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;

        //灯光初始化
        var ambient = new THREE.AmbientLight(0xffffff );

        // var directionalLight1 = new THREE.DirectionalLight( 0xC0C090 );
        // var directionalLight2 = new THREE.DirectionalLight( 0xC0C090 );

        var pointLight = new THREE.PointLight(0xcccccc, 0.1, 1000);
        pointLight.castShadow = true;

        pointLight.position.set(0,20,0);
        //directionalLight1.position.set( -100, -50, 100 );
        //directionalLight2.position.set( 100, 50, -100 );


        this.scene.add( ambient );
        //this.scene.add( directionalLight1 );
        // this.scene.add( directionalLight2 );
        this.scene.add( pointLight);


        var geometry = new THREE.BoxGeometry( 10, 10, 10 );
        var material = new THREE.MeshNormalMaterial();
        this.cube = new THREE.Mesh( geometry, material );
        this.cube.position.set( 0, 0, 0 );
        this.scene.add( this.cube );
    };

    ShowRoom.prototype.resizeDisplayGL = function () {
        // this.controls1.handleResize();

        this.recalcAspectRatio();
        // this.renderer.setSize( this.canvas.offsetWidth, this.canvas.offsetHeight, false );

        this.updateCamera();
    };

    ShowRoom.prototype.recalcAspectRatio = function () {
        this.aspectRatio = ( this.canvas.offsetHeight === 0 ) ? 1 : this.canvas.offsetWidth / this.canvas.offsetHeight;
    };

    ShowRoom.prototype.resetCamera = function () {
        this.camera.position.copy( this.cameraDefaults.posCamera );
        this.cameraTarget.copy( this.cameraDefaults.posCameraTarget );

        this.updateCamera();
    };

    ShowRoom.prototype.updateCamera = function () {
        this.camera.aspect = this.aspectRatio;
        this.camera.lookAt( this.cameraTarget );
        this.camera.updateProjectionMatrix();
    };

    ShowRoom.prototype.render = function () {
        if ( ! this.renderer.autoClear ) this.renderer.clear();

        this.controls1.update();

        this.cube.rotation.x += 0.05;
        this.cube.rotation.y += 0.05;

        this.renderer.render( this.scene, this.camera );
    };

    ShowRoom.prototype.reportProgress = function( text ) {
        document.getElementById( 'feedback' ).innerHTML = text;
    };

    ShowRoom.prototype.enqueueAllAssests = function ( maxQueueSize, maxWebWorkers, streamMeshes ) {
        if ( this.running ) {

            return;

        } else {

            this.running = true;

        }
        var scope = this;
        scope.wwDirector.objectsCompleted = 0;
        scope.feedbackArray = [];
        scope.reportDonwload = [];

        var i;
        for ( i = 0; i < maxWebWorkers; i++ ) {

            scope.feedbackArray[ i ] = 'Worker #' + i + ': Awaiting feedback';
            scope.reportDonwload[ i ] = true;

        }
        scope.reportProgress( scope.feedbackArray.join( '\<br\>' ) );

        var callbackCompletedLoading = function ( modelName, instanceNo ) {
            scope.reportDonwload[ instanceNo ] = false;

            var msg = 'Worker #' + instanceNo + ': Completed loading: ' + modelName + ' (#' + scope.wwDirector.objectsCompleted + ')';
            console.log( msg );
            scope.feedbackArray[ instanceNo ] = msg;
            scope.reportProgress( scope.feedbackArray.join( '\<br\>' ) );

            if ( scope.wwDirector.objectsCompleted + 1 === maxQueueSize ) scope.running = false;
        };

        var callbackReportProgress = function ( content, instanceNo ) {
            if ( scope.reportDonwload[ instanceNo ] ) {
                var msg = 'Worker #' + instanceNo + ': ' + content;
                console.log( msg );

                scope.feedbackArray[ instanceNo ] = msg;
                scope.reportProgress( scope.feedbackArray.join( '\<br\>' ) );
            }
        };

        var callbackMeshLoaded = function ( name, bufferGeometry, material ) {
            var materialOverride;

            if ( Validator.isValid( material ) && material.name === 'defaultMaterial' || name === 'Mesh_Mesh_head_geo.001' ) {

                materialOverride = material;
                materialOverride.color = new THREE.Color( Math.random(), Math.random(), Math.random() );

            }

            return new THREE.OBJLoader2.WWOBJLoader2.LoadedMeshUserOverride( false, undefined, materialOverride );
        };

        var globalCallbacks = new THREE.OBJLoader2.WWOBJLoader2.PrepDataCallbacks();
        globalCallbacks.registerCallbackProgress( callbackReportProgress );
        globalCallbacks.registerCallbackCompletedLoading( callbackCompletedLoading );
        globalCallbacks.registerCallbackMeshLoaded( callbackMeshLoaded );
        this.wwDirector.prepareWorkers( globalCallbacks, maxQueueSize, maxWebWorkers );
        console.log( 'Configuring WWManager with queue size ' + this.wwDirector.getMaxQueueSize() + ' and ' + this.wwDirector.getMaxWebWorkers() + ' workers.' );

        var callbackCompletedLoadingWalt = function () {
            console.log( 'Callback check: WALT was loaded (#' + scope.wwDirector.objectsCompleted + ')' );
        };

        var models = [];

/*
        models.push( {
            modelName: 'male02',
            dataAvailable: false,
            pathObj: 'obj/male02/',
            fileObj: 'male02.obj',
            pathTexture: 'obj/male02/',
            fileMtl: 'male02.mtl'
        } );
        models.push( {
            modelName: 'female02',
            dataAvailable: false,
            pathObj: 'obj/female02/',
            fileObj: 'female02.obj',
            pathTexture: 'obj/female02/',
            fileMtl: 'female02.mtl'
        } );
        models.push( {
            modelName: 'viveController',
            dataAvailable: false,
            pathObj: 'models/obj/vive-controller/',
            fileObj: 'vr_controller_vive_1_5.obj',
            scale: 400.0
        } );
        models.push( {
            modelName: 'cerberus',
            dataAvailable: false,
            pathObj: 'models/obj/cerberus/',
            fileObj: 'Cerberus.obj',
            scale: 50.0
        } );
        models.push( {
            modelName: 'WaltHead',
            dataAvailable: false,
            pathObj: 'obj/walt/',
            fileObj: 'WaltHead.obj',
            pathTexture: 'obj/walt/',
            fileMtl: 'WaltHead.mtl'
        } );*/



      models.push( {
            modelName: 'shexiangtou-qianji-360-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/shexiangtou-qianji-360-01/',
            fileObj: 'shexiangtou-qianji-360-01.obj',
            pathTexture: '3d_files/obj/shexiangtou-qianji-360-01/',
            fileMtl: 'shexiangtou-qianji-360-01.mtl',
            scale: 0.01
        } );
        models.push( {
            modelName: 'touyingji and jiazi-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/touyingji and jiazi-01/',
            fileObj: 'touyingji and jiazi-01.obj',
            pathTexture: '3d_files/obj/touyingji and jiazi-01/',
            fileMtl: 'touyingji and jiazi-01.mtl',
            scale: 0.01
        } );


 /*           for ( var key in Datas) {
                      models = Datas[key];
                  }
*/


        var pivot;
        var distributionBase = -50;
        var distributionMax = 100;
        var modelIndex = 0;
        var model;
        var runParams;
        for ( i = 0; i < maxQueueSize; i++ ) {

           modelIndex = Math.floor( Math.random() * models.length );
           model = models[modelIndex ];


            pivot = new THREE.Object3D();
            pivot.position.set(
                distributionBase + distributionMax * Math.random(),
                distributionBase + distributionMax * Math.random(),
                distributionBase + distributionMax * Math.random()
            );


            if ( Validator.isValid( model.scale ) ) pivot.scale.set( model.scale, model.scale, model.scale );

            this.scene.add( pivot );

            model.sceneGraphBaseNode = pivot;

            runParams = new THREE.OBJLoader2.WWOBJLoader2.PrepDataFile(
                model.modelName, model.pathObj, model.fileObj, model.pathTexture, model.fileMtl
            );
            runParams.setSceneGraphBaseNode( model.sceneGraphBaseNode );
            runParams.setStreamMeshes( streamMeshes );
            if ( model.modelName === 'WaltHead' ) {
                runParams.getCallbacks().registerCallbackCompletedLoading( callbackCompletedLoadingWalt );
            }

            this.wwDirector.enqueueForRun( runParams );
            this.allAssets.push( runParams );
        }


        this.wwDirector.processQueue();

    };

    ShowRoom.prototype.clearAllAssests = function () {
        var ref;
        var scope = this;

        for ( var asset in this.allAssets ) {
            ref = this.allAssets[ asset ];

            var remover = function ( object3d ) {

                if ( object3d === ref.sceneGraphBaseNode ) return;
                console.log( 'Removing ' + object3d.name );
                scope.scene.remove( object3d );

                if ( object3d.hasOwnProperty( 'geometry' ) ) object3d.geometry.dispose();
                if ( object3d.hasOwnProperty( 'material' ) ) {

                    var mat = object3d.material;
                    if ( mat.hasOwnProperty( 'materials' ) ) {

                        var materials = mat.materials;
                        for ( var name in materials ) {

                            if ( materials.hasOwnProperty( name ) ) materials[ name ].dispose();

                        }
                    }
                }
                if ( object3d.hasOwnProperty( 'texture' ) ) object3d.texture.dispose();
            };
            scope.scene.remove( ref.sceneGraphBaseNode );
            ref.sceneGraphBaseNode.traverse( remover );
            ref.sceneGraphBaseNode = null;
        }
        this.allAssets = [];
    };

    ShowRoom.prototype.terminateManager = function () {
        this.wwDirector.deregister();
    };

    return ShowRoom;

})();


var container = document.getElementById( 'example' );
var app = new ShowRoom(container);

var resizeWindow = function () {
    app.resizeDisplayGL();
};

var animate = function () {

    app.stats.begin();

    requestAnimationFrame(animate );
    app.render();

    app.stats.end();
};

window.addEventListener( 'resize', resizeWindow, false );

console.log( 'Starting initialisation phase...' );
app.initGL();
app.resizeDisplayGL();
animate();


var WWParallelsControl = function() {
    this.queueLength = 1;
    this.workerCount = 4;
    this.streamMeshes = true;
    this.run = function () {
        app.enqueueAllAssests( this.queueLength, this.workerCount, this.streamMeshes );
    };
    this.terminate = function () {
        app.terminateManager();
    };
    this.clearAllAssests = function () {
        app.terminateManager();
        app.clearAllAssests();
    };
};
var wwParallelsControl = new WWParallelsControl();
wwParallelsControl.run();
