
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container, stats;
var camera;
var scene, renderer;
var controls1,controls2,controls3;

var raycaster;
var INTERSECTED;
var mouse = new THREE.Vector2();
var clock = new THREE.Clock();
var projector = new THREE.Projector();
var gSelectList=[];
var gModeMap={};


//SSAA
var composer, copyPass;
var ssaaRenderPassP;
var params = {
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
var materialsLib,mlib,textureCube;

//初始化、动画

init();
animate();

//重置
//WWParallels();
function init() {
    initScene();
    initCamera();
    initRenderer();
    initControls();
    loadSerialized(data);
    initLight();
    initEvent();
    //homeEve();
    //backgroundFloor();
    //toneMaping();
    initPostprocessing();
    initHelp();

}
function animate() {
    requestAnimationFrame( animate );
    stats.begin();
    render();
    stats.end();
}
function render() {

    camera.lookAt(scene.position );
    Rendering();
    // renderer.render(scene, camera);
    composer.render();

}
function Rendering(){
    var delta = clock.getDelta();
    // console.log(delta);
    if( controls1 &&  controls1.enabled)
    {
        controls1.update( delta );// required if controls.enableDamping = true, or if controls.autoRotate = true
    }
    if( controls2 &&  controls2.enabled)(

        controls2.update( delta )
    )

    //console.log(INTERSECTED);
    if(data.items.length){
        raycastProc();
        if(INTERSECTED){
            controls3.update();
        }

    }

    //地板纹理
    cubeCamera1.update( renderer, scene );

    //SSAA
    var newColor = ssaaRenderPassP.clearColor;
    ssaaRenderPassP.clearColor = newColor;
    ssaaRenderPassP.clearAlpha = params.clearAlpha;

    ssaaRenderPassP.sampleLevel = params.sampleLevel;
    ssaaRenderPassP.unbiased  = params.unbiased;

    ssaaRenderPassP.enabled = ( params.camera === 'perspective' );

    ssaaRenderPassP.renderToScreen = params.renderToScreen;
    copyPass.enabled = !params.renderToScreen;



}
function initScene(){

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();

    // scene.background = new THREE.Color( 0xf0f0f0 );
    //scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
    //scene.fog = new THREE.FogExp2( 0xffffff, 0.00015 );

}
function initCamera() {

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set( 0, 100, 300 );
    // camera.position.set(0, 800,0);
    //camera.rotation.x=Math.PI * 0.47;

    cubeCamera1 = new THREE.CubeCamera( 1, 10000, 2048 );
    //cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
    console.log(cubeCamera1);

}
function initControls(){

    controls1 = new THREE.OrbitControls(camera, renderer.domElement);
    //controls1.addEventListener('change', render); // remove when using animation loop
    {

        controls1.enableZoom = true;
        controls1.minPolarAngle = Math.PI * 0.01;
        controls1.maxPolarAngle = Math.PI * 0.47;
        controls1.maxDistance = 300;
        controls1.minDistance = 50;


    }

    controls1.enabled = true;


    controls2 = new THREE.FirstPersonControls(camera, renderer.domElement);
    {

        controls2.lookSpeed = 0.0325;
        controls2.autoForward=false;
        controls2.movementSpeed = 100;
        controls2.noFly = true ;
        controls2.lookVertical = true;
        controls2.constrainVertical = true;
        controls2.verticalMin = 1.5;
        controls2.verticalMax = 2.0;
        controls2.lon = 250;
        controls2.lat = 30;
    }

    controls2.enabled = false;

    controls3 = new THREE.TransformControls( camera, renderer.domElement );
    controls3.rotateSpeed = 1.0;
    controls3.zoomSpeed = 1.2;
    controls3.panSpeed = 0.8;
    controls3.staticMoving = true;
    controls3.dynamicDampingFactor = 0.3;
    controls3.addEventListener( 'change', renderer );
    scene.add(controls3);

}
function initRenderer(){

    renderer = new THREE.WebGLRenderer(
        {
            antialias:false
            // precision: "highp",
            // alpha: true,
            // premultipliedAlpha: false,
            // stencil: false
            // preserveDrawingBuffer: true //是否保存绘图缓冲
        }
    );
    //renderer.sortObjects = true;
    //renderer.autoClear = true;
    //renderer.shadowMap.enabled = true;
    //renderer.shadowMapSoft = true;
    //renderer.shadowMapType = THREE.PCFSoftShadowMap;
    //renderer.shadowMap.renderReverseSided = false;

    //遮挡剔除模式 ,与材质面有关系
    // renderer.setFaceCulling( THREE.CullFaceNone,THREE.FrontFaceDirectionCW );


    // SHADOW
    renderer.shadowMap.renderReverseSided = false;
    renderer.shadowMap.enabled = true;

    //tonmapping
    renderer.gammaInput = true;
    renderer.gammaOutput = true;


    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight  );
    container.appendChild( renderer.domElement );

}
function initPostprocessing(){
    //超级采样抗锯齿（SSAA）>多重采样抗锯齿（MSAA）>快速近似抗锯齿(FXAA)
    //SSAA

    composer = new THREE.EffectComposer( renderer );
    ssaaRenderPassP = new THREE.SSAARenderPass( scene, camera );
    composer.addPass( ssaaRenderPassP );
    copyPass = new THREE.ShaderPass( THREE.CopyShader );
    copyPass.renderToScreen = true;
    composer.addPass( copyPass );


    /*
        //tonMaping
        //在render循环中，使用EffectComposer渲染场景、应用通道，并输出结果
        composer = new THREE.EffectComposer( renderer );
        composer.setSize( window.innerWidth, window.innerHeight );

        //RenderPass通道，这个通道会渲染场景，但不会将渲染结果输出到屏幕上。
        //RenderPass/该通道在指定的场景和相机的基础上渲染出一个新场景
        var renderScene = new THREE.RenderPass( scene, camera );
        composer.addPass( renderScene );

        // ShaderPass/使用该通道你可以传入一个自定义的着色器，用来生成高级的、自定义的后期处理通道
        //传入了CopyShader着色器，用于拷贝渲染结果
        var copyPass = new THREE.ShaderPass( THREE.CopyShader );
        copyPass.renderToScreen = true;
        composer.addPass( copyPass );
    */



}

//自定义材质库
function commonMaterials(){


    var texture = new THREE.Texture();
    var loader = new THREE.ImageLoader();
    //地面
    loader.load( '3d_files/obj/shinei-dimian-01/maps/Rectangle29872VRay-1.png', function ( image ) {

        texture.image = image;
        texture.needsUpdate = true;

    } );
    //侧面大屏幕

    var texture2 = new THREE.Texture();
    var loader2 = new THREE.ImageLoader();
    loader2.load( '3d_files/obj/3x8-55/Rectangle29879VRay.jpg', function ( image ) {

        texture2.image = image;
        texture2.needsUpdate = true;
        // texture2.repeat.set( 500, 500 );
        //texture2.wrapS = THREE.RepeatWrapping;
        //texture2.wrapT = THREE.RepeatWrapping;
        //texture2.magFilter = THREE.NearestFilter;
        //texture2.minFilter = THREE.NearestMipMapNearestFilter;

    } );

    //房顶

    var texture3 = new THREE.Texture();
    var loader3 = new THREE.ImageLoader();
    loader3.load( '3d_files/obj/zouliangding-01/Rectangle29870VRay.png', function ( image ) {

        texture3.image = image;
        texture3.needsUpdate = true;
        // texture2.repeat.set( 500, 500 );
        //texture2.wrapS = THREE.RepeatWrapping;
        //texture2.wrapT = THREE.RepeatWrapping;
        //texture2.magFilter = THREE.NearestFilter;
        //texture2.minFilter = THREE.NearestMipMapNearestFilter;

    } );

    //墙体

    var texture4 = new THREE.Texture();
    var loader4 = new THREE.ImageLoader();
    loader4.load( '3d_files/obj/qiang-01/maps/Rectangle1865VRay.jpg', function ( image ) {

        texture4.image = image;
        texture4.needsUpdate = true;

    } );

    //控制台
    var texture5 = new THREE.Texture();
    var loader5 = new THREE.ImageLoader();
    loader5.load( '3d_files/obj/kongzhitai-zuhe/Arc22VRay-.jpg', function ( image ) {

        texture5.image = image;
        texture5.needsUpdate = true;
        texture5.wrapS = THREE.RepeatWrapping;
        texture5.wrapT = THREE.RepeatWrapping;
        texture5.magFilter = THREE.NearestFilter;
        texture5.minFilter = THREE.NearestMipMapNearestFilter;

    } )


    textureCube = new THREE.CubeTextureLoader()
        .setPath( '3d_files/texture/cube/home/')
        .load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );

    materialsLib = {
        "floorMat":	new THREE.MeshPhongMaterial( { color: 0xffffff, specular:0xee6600, shininess:10,map: texture, envMap: cubeCamera1.renderTarget.texture, combine: THREE.MixOperation, reflectivity: 0.35, refractionRatio: 0.98} ),
        "sideVidioMat":	new THREE.MeshPhongMaterial( { color: 0xffffff, specular:0xee6600, shininess:10, map:  texture2, combine: THREE.MixOperation, reflectivity: 0.25 } ),
        "liangTop":	new THREE.MeshPhongMaterial( { color: 0xffffff, specular:0xee6600, shininess:10, map: texture3, combine: THREE.MixOperation, reflectivity: 0.25 } ),
        "qiangMat": 	new THREE.MeshLambertMaterial( { color: 0x757167, map: texture4, combine: THREE.MixOperation, reflectivity: 0.15 } )
    };



}
//模型数据加载重构
function loadSerialized(files) {

    for ( var key in files ) {

        var section = files[ key ];

        for ( var i = 0; i < section.length; i ++ ) {

            var file = section[ i ];

            var options = {
                mtlPath: file.mtlPath + file.item_name +"/",
                mtlFileName:file.item_name+".mtl",
                objPath:file.objPath + file.item_name +"/",
                objFileName:file.item_name+".obj",
                thisObj:file
            }
            loadModel(options);

        }

    }

    /*    $.each(data.items, function(i,val){
            var options = {
                mtlPath: val.mtlPath + val.item_name +"/",
                mtlFileName:val.item_name+".mtl",
                objPath:val.objPath + val.item_name +"/",
                objFileName:val.item_name+".obj",
                thisObj:val
            }
            loadModel(options)

        });*/
}
function loadModel(options){

    commonMaterials();

    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( options.mtlPath );
    mtlLoader.load( options.mtlFileName, function( materials ) {

        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( options.objPath );
        objLoader.load( options.objFileName, completeCallback, onProgress, onError);
    });
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );
    };
    var completeCallback =  function(object){

        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {

                //child.scale.x = child.scale.y = child.scale.z = 0.01;
                // child.position.set(-97, 0, 68);
                child.updateMatrix();
                child.castShadow =true;
                child.receiveShadow =true;
                // child.material.side = THREE.DoubleSide;
                //child.material.emissive.r=0;//设置rgb通道R通道颜色
                //child.material.emissive.g=0.01;//设置rgb通道G通道颜色
                // child.material.emissive.b=0.05;//设置rgb通道B通道颜色
                //child.material.transparent=true;
                //child.material.opacity=0;
                child.material.SmoothShading = true;
                child.vertexColors = THREE.VertexColors;

                if (child) {

                    switch ( child.name ) {

                        case "Arc22":
                            child.position.set(0,200,0);
                            child.updateMatrix();

                            // child.material = mlib["Bronze"];
                            // child.material.needsUpdate = true;
                            break;

                        case "Rectangle29872":
                            child.material = materialsLib["floorMat"];
                            child.material.needsUpdate = true;
                            break;

                        case "Rectangle29879":
                            child.material = materialsLib["sideVidioMat"];
                            child.material.needsUpdate = true;
                            break;
                        case "Rectangle29870":
                            child.material = materialsLib["liangTop"];
                            child.material.needsUpdate = true;
                            break;
                        case " Rectangle1865":
                            child.material = materialsLib["Orange"];
                            child.material.needsUpdate = true;
                            break;

                    }

                }
            }
        } );



        object.scale.x = object.scale.y = object.scale.z = 0.01;
        object.position.set(-97, 0, 68);
        object.updateMatrix();
        //var boxHelper = new THREE.BoundingBoxHelper(object, 0x999999);
        //scene.add(boxHelper);
        var thisObj = options.thisObj;
        if(thisObj.isSelect){
            gModeMap[object.uuid] = thisObj ;
            gSelectList.push(object);
        }
        //console.log( gModeMap);
        scene.add( object );
    };
    var onProgress = function(xhr){
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            if(typeof options.progress =="function"){
                options.progress( Math.round(percentComplete, 2));
            }
            //console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    var onError = function(xhr){
        // $("#havenloading .progress").css("width",persent+"%");
    }

}

function initLight() {

    ambient = new THREE.AmbientLight(0xffffff );
    scene.add( ambient );
    //自动行走
    /*   guide = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0xffffff}));
     guide.position.set(1500, 900, -6000);
     guide.castShadow=true;
     guide.receiveShadow=true;
     scene.add(guide);*/
    /*
     gLightMgr=new LightMgr(gScene, false);
     //gLightMgr.isHelper=true;
     var ambient=gLightMgr.addAmbientLight(0xffffffff, 1.0);


     var spotPos=[
     {"x":1500,       "y":2000,   "z": -3000}
     // {"x":6500,      "y":3000,   "z": -6000},
     // {"x":12500,     "y":3000,   "z": -8000},
     //{"x":18500,     "y":3000,   "z": -8000},
     ];
     var spotParam=[
     {"castShadow":true, "mapW":104, "mapH":104, "mapN":104,"mapFar":104,"mapFov":104,"target":null},
     {"castShadow":true, "mapW":104, "mapH":104, "mapN":104,"mapFar":104,"mapFov":104,"target":null},
     {"castShadow":true, "mapW":104, "mapH":104, "mapN":104,"mapFar":104,"mapFov":104,"target":null},
     {"castShadow":true, "mapW":104, "mapH":104, "mapN":104,"mapFar":104,"mapFov":104,"target":null}
     ];

     for(var i in spotPos){
     var light=gLightMgr.addSpotLight(0xffffff, 8.5, 8500);
     //开启阴影
     light.castShadow = spotParam[i].castShadow;
     light.position.set( spotPos[i].x, spotPos[i].y, spotPos[i].z );
     light.target.position.set(spotPos[i].x, spotPos[i].y-500, spotPos[i].z);//=guide;
     light.penumbra = 0.05;
     light.decay = 2;
     light.angle=Math.PI/3;
     light.intensity=1.2;


     var lightMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({color: 0x00ff00}));
     lightMesh.position.set(1500, 350, -3000);
     scene.add(lightMesh);
     light.target=lightMesh;


     // light.penumbra =1;
     // light.decay=2;
     }
     */
    //半球光
    /*
     hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
     hemiLight.color.setHSL( 0.6, 1, 0.6 );
     hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
     hemiLight.position.set( 0, 50, 0 );
     scene.add( hemiLight );
     */

    // hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    // scene.add( hemiLightHelper );


    // var  dirLight, dirLightHeper, hemiLight, hemiLightHelper;
    //方向光
    /*    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
     dirLight.color.setHSL( 0.1, 1, 0.95 );
     dirLight.position.set( -1, 100, 1 );
     dirLight.position.multiplyScalar( 30 );
     scene.add( dirLight );

     dirLight.castShadow = true;

     dirLight.shadow.mapSize.width = 2048;
     dirLight.shadow.mapSize.height = 2048;

     var d = 50;

     dirLight.shadow.camera.left = -d;
     dirLight.shadow.camera.right = d;
     dirLight.shadow.camera.top = d;
     dirLight.shadow.camera.bottom = -d;

     dirLight.shadow.camera.far = 3500;
     dirLight.shadow.bias = -0.0001;

     */

    //点光源扩展
    pointLight = new THREE.PointLight(0xcccccc, 0.1, 1000);
    pointLight.position.set(0,20,0);
    pointLight.castShadow = true;
    //scene.add( pointLight);
    //  scene.add(new THREE.PointLightHelper(pointLight,5));

    // var light2 = new THREE.DirectionalLight( 0xaabbff, 1 );
    // light2.position.x = 300;
    // light2.position.y = 250;
    // light2.position.z = -500;
    //  scene.add( light2 );
    //  dirLightHeper = new THREE.DirectionalLightHelper( light2, 50 )
    // scene.add( dirLightHeper );

    /*   var gui, shadowCameraHelper, shadowConfig = {

     shadowCameraVisible: true,
     shadowCameraNear: 750,
     shadowCameraFar: 4000,
     shadowCameraFov: 30,
     shadowBias: -0.0002

     };

     sunLight = new THREE.SpotLight( 0xffffff, 0.3, 0, Math.PI/2 );
     sunLight.position.set( 100, 200, 1000 );;

     sunLight.castShadow = true;

     sunLight.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( shadowConfig.shadowCameraFov, 1, shadowConfig.shadowCameraNear, shadowConfig.shadowCameraFar ) );
     sunLight.shadow.bias = shadowConfig.shadowBias;

     scene.add( sunLight );

     // SHADOW CAMERA HELPER

     shadowCameraHelper = new THREE.CameraHelper( sunLight.shadow.camera );
     shadowCameraHelper.visible = shadowConfig.shadowCameraVisible;
     scene.add( shadowCameraHelper );*/
}
function initEvent(){
    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener('click', onDocumentClick, false);
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    document.addEventListener('mousemove', onDocumentMouseMove, false);
}
function initHelp(){

    var axisHelper = new  THREE.AxesHelper(800);
    scene.add(axisHelper);
    //状态栏位置信息
    stats = new Stats();
    container.appendChild( stats.dom );

    raycaster=new THREE.Raycaster();


    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '马甸展厅3D';
    container.appendChild( info );

    //var cameraParObj = new THREE.Object3D();
    //cameraParObj.position.y = 200;
    //cameraParObj.position.z = 700;
    // scene.add(cameraParObj);
    // cameraParObj.add(cameraCube);
    // var cameraHelper2 = new THREE.CameraHelper(cameraCube);
    // scene.add(cameraHelper2);
}
function onDocumentClick() {
    if(INTERSECTED)
    {
        var pt=toScreenPosition(INTERSECTED, camera);
        console.log(pt.x+"********************"+pt.y);
    }

    if(INTERSECTED){
        openBox(gModeMap[INTERSECTED.parent.uuid]);
    }

    if(INTERSECTED){
        controls3.attach( INTERSECTED );
    }
}
function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
function onDocumentMouseDown(event ) {

}
function onWindowResize() {

    var width = window.innerWidth;
    var height = window.innerHeight;
    var aspect = width / height;

    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    var pixelRatio = renderer.getPixelRatio();
    var newWidth  = Math.floor( width / pixelRatio ) || 1;
    var newHeight = Math.floor( height / pixelRatio ) || 1;
    composer.setSize( newWidth, newHeight );

   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );


}
function onKeyDown(event) {
    // if (event.keyCode == 188 && event.ctrlKey)
    // {
    //     camera.currentCamera.position.y -=10;
    //     console.log(event.keyCode);
    // }
}
function onKeyUp(event) {
    console.log(event.keyCode);
}
function raycastProc() {
    /*    var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
        //projector.unprojectVector( vector,camera);  //旧版本
        vector.unproject( camera );

        var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );*/

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( gSelectList, true );
    // console.log(scene.children );

    if (0<intersects.length) {

        if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            if(null!=INTERSECTED){
                controls3.detach( INTERSECTED );
            }
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.set( 0xff0000 );
            document.body.style.cursor = "pointer";
        }
    } else {
        if (INTERSECTED) {
            INTERSECTED.material.color.set(INTERSECTED.currentHex);
            INTERSECTED = null;
            document.body.style.cursor = "auto";
        }

    }
}
function toScreenPosition(obj, camera) {
    var vector = new THREE.Vector3();
    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    return {
        x: vector.x,
        y: vector.y
    };
};
function changeControls() {

    if(controls2.enabled){
        console.log("controls2是真的")
        document.getElementById('imgCamerCtrl').src = "image/man-tin.png";
        controls2.enabled=false;
        controls1.enabled=true;
    }else{
        console.log("controls2是假的")

        document.getElementById('imgCamerCtrl').src = "image/man-zou.png";
        controls2.enabled=true;
        controls1.enabled=false;
    }


    //  console.log("控制器运行中");


}
function openBox(param) {
    controls1.enabled=false;
    controls2.enabled=false;
    $("#showframe",parent.document.body).attr("src",gUrlList[param.type]);
    $("#box").css("display", "block");
}
function closebox() {
    $("#box").css("display", "none");
    controls1.enabled=true;
    // controls2.enabled=true;


}


'use strict';

var WWParallels = (function () {

    var Validator = THREE.OBJLoader2.prototype._getValidator();

    function WWParallels( elementToBindTo ) {
        this.renderer = null;
        this.canvas = elementToBindTo;
        this.aspectRatio = 1;
        this.recalcAspectRatio();

        this.scene = null;
        this.cameraDefaults = {
            posCamera: new THREE.Vector3( 0.0, 175.0, 500.0 ),
            posCameraTarget: new THREE.Vector3( 0, 0, 0 ),
            near: 0.1,
            far: 10000,
            fov: 45
        };
        this.camera = null;
        this.cameraTarget = this.cameraDefaults.posCameraTarget;

        this.wwDirector = new THREE.OBJLoader2.WWOBJLoader2Director();
        this.wwDirector.setCrossOrigin( 'anonymous' );

        this.controls = null;
        this.cube = null;

        this.allAssets = [];
        this.feedbackArray = null;

        this.running = false;
    }

    WWParallels.prototype.initGL = function () {
        this.renderer = new THREE.WebGLRenderer( {
            canvas: this.canvas,
            antialias: true
        } );

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x050505 );

        this.camera = new THREE.PerspectiveCamera( this.cameraDefaults.fov, this.aspectRatio, this.cameraDefaults.near, this.cameraDefaults.far );
        this.resetCamera();
        this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );

        var ambientLight = new THREE.AmbientLight( 0x404040 );
        var directionalLight1 = new THREE.DirectionalLight( 0xC0C090 );
        var directionalLight2 = new THREE.DirectionalLight( 0xC0C090 );

        directionalLight1.position.set( -100, -50, 100 );
        directionalLight2.position.set( 100, 50, -100 );

        this.scene.add( directionalLight1 );
        this.scene.add( directionalLight2 );
        this.scene.add( ambientLight );

        var geometry = new THREE.BoxGeometry( 10, 10, 10 );
        var material = new THREE.MeshNormalMaterial();
        this.cube = new THREE.Mesh( geometry, material );
        this.cube.position.set( 0, 0, 0 );
        this.scene.add( this.cube );
    };

    WWParallels.prototype.resizeDisplayGL = function () {
        this.controls.handleResize();

        this.recalcAspectRatio();
        this.renderer.setSize( this.canvas.offsetWidth, this.canvas.offsetHeight, false );

        this.updateCamera();
    };

    WWParallels.prototype.recalcAspectRatio = function () {
        this.aspectRatio = ( this.canvas.offsetHeight === 0 ) ? 1 : this.canvas.offsetWidth / this.canvas.offsetHeight;
    };

    WWParallels.prototype.resetCamera = function () {
        this.camera.position.copy( this.cameraDefaults.posCamera );
        this.cameraTarget.copy( this.cameraDefaults.posCameraTarget );

        this.updateCamera();
    };

    WWParallels.prototype.updateCamera = function () {
        this.camera.aspect = this.aspectRatio;
        this.camera.lookAt( this.cameraTarget );
        this.camera.updateProjectionMatrix();
    };

    WWParallels.prototype.render = function () {
        if ( ! this.renderer.autoClear ) this.renderer.clear();

        this.controls.update();

        this.cube.rotation.x += 0.05;
        this.cube.rotation.y += 0.05;

        this.renderer.render( this.scene, this.camera );
    };
    WWParallels.prototype.reportProgress = function( text ) {
        document.getElementById( 'feedback' ).innerHTML = text;
    };

    WWParallels.prototype.enqueueAllAssests = function ( maxQueueSize, maxWebWorkers, streamMeshes ) {
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
        } );

        var pivot;
        var distributionBase = -500;
        var distributionMax = 1000;
        var modelIndex = 0;
        var model;
        var runParams;
        for ( i = 0; i < maxQueueSize; i++ ) {

            modelIndex = Math.floor( Math.random() * models.length );
            model = models[ modelIndex ];

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

    WWParallels.prototype.clearAllAssests = function () {
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

    WWParallels.prototype.terminateManager = function () {
        this.wwDirector.deregister();
    };

    return WWParallels;

})();

