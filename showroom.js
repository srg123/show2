
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

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;


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

//GPU渲染计算
var gpuCompute;
var effectController;
effectController = {
    // Can be changed dynamically
    gravityConstant: 100.0,
    density: 0.45,

    // Must restart simulation
    radius: 300,
    height: 8,
    exponent: 0.4,
    maxMass: 15.0,
    velocity: 70,
    velocityExponent: 0.2,
    randVelocity: 0.001
};
var isIE = /Trident/i.test( navigator.userAgent );
var isEdge = /Edge/i.test( navigator.userAgent );
var hash = document.location.hash.substr( 1 );
if ( hash ) hash = parseInt( hash, 0 );
// Texture width for simulation (each texel is a debris particle)
var WIDTH = hash || ( isIE || isEdge ) ? 4 : 64;
var PARTICLES = WIDTH * WIDTH;




//初始化、动画

init();
animate();

//重置
//WWParallels();
function init() {
    initScene();
    initCamera();
    initRenderer();
   // initComputeRenderer();
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
   // gpuCompute.compute();
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

    //地板纹理相机
    renderer.autoClear = true;
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
   // camera.target = new THREE.Vector3( 0, 0,100);
    camera.position.set( 0, 100, 300 );
    // camera.position.set(0, 800,0);
    //camera.rotation.x=Math.PI * 0.47;

    cubeCamera1 = new THREE.CubeCamera( 1, 100000, 2048);
    cubeCamera1.renderTarget.texture.magFilter = THREE.NearestFilter;
    cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;


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
function initComputeRenderer() {


    gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );


    var dtPosition = gpuCompute.createTexture();
    var dtVelocity = gpuCompute.createTexture();

    fillTextures( dtPosition, dtVelocity );

    velocityVariable = gpuCompute.addVariable( "textureVelocity", document.getElementById( 'computeShaderVelocity' ).textContent, dtVelocity );
    positionVariable = gpuCompute.addVariable( "texturePosition", document.getElementById( 'computeShaderPosition' ).textContent, dtPosition );

    gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
    gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );

    positionUniforms = positionVariable.material.uniforms;
    velocityUniforms = velocityVariable.material.uniforms;

    velocityUniforms.gravityConstant = { value: 0.0 };
    velocityUniforms.density = { value: 0.0 };

    var error = gpuCompute.init();

    if ( error !== null ) {

        console.error( error );

    }

    console.log(gpuCompute);

}
function fillTextures( texturePosition, textureVelocity ) {

    var posArray = texturePosition.image.data;
    var velArray = textureVelocity.image.data;

    var radius = effectController.radius;
    var height = effectController.height;
    var exponent = effectController.exponent;
    var maxMass = effectController.maxMass * 1024 / PARTICLES;
    var maxVel = effectController.velocity;
    var velExponent = effectController.velocityExponent;
    var randVel = effectController.randVelocity;

    for ( var k = 0, kl = posArray.length; k < kl; k += 4 ) {

        // Position
        var x, y, z, rr;

        do {

            x = ( Math.random() * 2 - 1 );
            z = ( Math.random() * 2 - 1 );
            rr = x * x + z * z;

        } while ( rr > 1 );

        rr = Math.sqrt( rr );

        var rExp = radius * Math.pow( rr, exponent );

        // Velocity
        var vel = maxVel * Math.pow( rr, velExponent );

        var vx = vel * z + ( Math.random() * 2 - 1 ) * randVel;
        var vy = ( Math.random() * 2 - 1 ) * randVel * 0.05;
        var vz = - vel * x + ( Math.random() * 2 - 1 ) * randVel;

        x *= rExp;
        z *= rExp;
        y = ( Math.random() * 2 - 1 ) * height;

        var mass = Math.random() * maxMass + 1;

        // Fill in texture values
        posArray[ k + 0 ] = x;
        posArray[ k + 1 ] = y;
        posArray[ k + 2 ] = z;
        posArray[ k + 3 ] = 1;

        velArray[ k + 0 ] = vx;
        velArray[ k + 1 ] = vy;
        velArray[ k + 2 ] = vz;
        velArray[ k + 3 ] = mass;

    }

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
function loadObj(sName) {

    group = new THREE.Group();
    //group.position.y = 50;
    scene.add(group);

    var groundMirror = new THREE.Mirror( 236, 167, {
        clipBias: 0.003,
        textureWidth: WIDTH * window.devicePixelRatio,
        textureHeight: HEIGHT * window.devicePixelRatio,
        color: 0x777777
    } );
    groundMirror.rotateX( - Math.PI / 2 );
    groundMirror.material.side = THREE.DoubleSide;
    groundMirror.receiveShadow=true;
    group.add( groundMirror );

    //make floor
    //var planeGeo = new THREE.PlaneBufferGeometry( 236, 167 );
    //var mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
    //mirrorMesh.add(groundMirror);
    //mirrorMesh.rotation.set(Math.PI / 4, 100, 0);
    // groundMirror.rotateX( Math.PI / 2 );
    // group.add(mirrorMesh);


    // texture

    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );
    };

    var texture = new THREE.Texture();
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    var onError = function ( xhr ) {
    };

    var loader = new THREE.ImageLoader( manager );
    var imgUrl="3d_files/obj/"+sName+"/";
    loader.load( imgUrl+"maps/"+sName+'.jpg', function ( image ) {
        texture.image = image;
        texture.needsUpdate = true;

    } );

    standardMaterial = new THREE.MeshStandardMaterial( {
        bumpScale: - 0.05,
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.8,
        premultipliedAlpha: true,
        transparent: true
    } );
    /*    standardMaterial2 = new THREE.MeshStandardMaterial( {
            map: null,
            roughnessMap: null,
            color: 0x888888,
            metalness: 0.0,
            roughness: 1.0,
            side: THREE.BackSide
        } );*/
    var textureLoader = new THREE.TextureLoader();
    /*
        textureLoader.load( "3d_files/obj/shinei-dimian-01/maps/shinei-dimian-01.jpg", function( map ) {
            map.wrapS =  map.wrapT = THREE.RepeatWrapping;
            map.anisotropy = 4;
            map.repeat.set( 1, 1 );
            standardMaterial.map = map;
            standardMaterial.needsUpdate = true;
            standardMaterial.magFilter = THREE.NearestFilter;
            standardMaterial.format = THREE.RGBFormat;
        } );
        textureLoader.load( "3d_files/obj/shinei-dimian-01/maps/shinei-dimian-01.jpg", function( map ) {
            map.wrapS =  map.wrapT = THREE.RepeatWrapping;
            map.anisotropy = 4;
            map.repeat.set( 1, 1 );
            standardMaterial.bumpMap = map;
            standardMaterial.needsUpdate = true;
            standardMaterial.magFilter = THREE.NearestFilter;
            standardMaterial.format = THREE.RGBFormat;
        } );
        textureLoader.load( "3d_files/obj/shinei-dimian-01/maps/shinei-dimian-01.jpg", function( map ) {
            map.wrapS =  map.wrapT = THREE.RepeatWrapping;
            map.anisotropy = 4;
            map.repeat.set( 1, 1 );
            standardMaterial.roughnessMap = map;
            standardMaterial.needsUpdate = true;
            standardMaterial.magFilter = THREE.NearestFilter;
            standardMaterial.format = THREE.RGBFormat;
        } );*/



    /*    var geometry = new THREE.BoxBufferGeometry( 236, 2, 167 );
        var mesh = new THREE.Mesh( geometry, floorMaterial );
        mesh.position.y = 50;
        mesh.rotation.x = - Math.PI * 0.5;
        mesh.receiveShadow = true;
        scene.add( mesh );*/


    /*    var hdrpath = "3d_files/texture/cube/pisaHDR/";
        var hdrformat = '.hdr';
        var hdrurls = [
            hdrpath + 'px' + hdrformat, hdrpath + 'nx' + hdrformat,
            hdrpath + 'py' + hdrformat, hdrpath + 'ny' + hdrformat,
            hdrpath + 'pz' + hdrformat, hdrpath + 'nz' + hdrformat
        ];


        var hdrCubeMap = new THREE.HDRCubeTextureLoader().load( THREE.UnsignedByteType, hdrurls, function ( hdrCubeMap ) {

            var pmremGenerator = new THREE.PMREMGenerator( hdrCubeMap );
            pmremGenerator.update( renderer );

            var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
            pmremCubeUVPacker.update( renderer );

            //standardMaterial.envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;
            standardMaterial.needsUpdate = true;

        } );*/


    var loader = new THREE.OBJLoader( manager );
    var sObjUrl="3d_files/obj/"+sName+"/";
    loader.load( sObjUrl+sName+'.obj', function ( object ) {

        object.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                //  child.material = standardMaterial;
                child.material.needsUpdate = true;
                child.material.map = texture;
                child.material.envMap = textureCube;
                child.material.transparent=true;
                child.material.opacity= 0.8;
                child.receiveShadow =true;
                // child.castShadow = true;
                child.position.set(-97,0,68);
                child.scale.x =  child.scale.y =  child.scale.z = 0.01;
                child.updateMatrix();

            }

        } );

        object.position.y = 0;
        group.add( object );

    }, onProgress, onError );


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
//地面法线贴图
    var texture01 = new THREE.Texture();
    var loader01 = new THREE.ImageLoader();
    loader01.load( '3d_files/texture/cube/home/map/decal-normal.jpg', function ( image ) {

        texture01.image = image;
        texture01.needsUpdate = true;

    } );

    //地面环境贴图
    var texture02 = new THREE.Texture();
    var loader02 = new THREE.ImageLoader();
    loader02.load( '3d_files/texture/cube/home/map/t.jpg', function ( image ) {

        texture02.image = image;
        texture02.needsUpdate = true;

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
        "floorMat":	new THREE.MeshPhongMaterial( { color: 0xffffff, specular:0xee6600, shininess:10,map: texture,normalMap :texture01,envMap: cubeCamera1.renderTarget.texture, combine: THREE.MixOperation, reflectivity: 0.35, refractionRatio: 0.98} ),
        "sideVidioMat":	new THREE.MeshPhongMaterial( { color: 0xffffff, specular:0xee6600, shininess:10, map:  texture2, combine: THREE.MixOperation, reflectivity: 0.25 } ),
        "liangTop":	new THREE.MeshPhongMaterial( { color: 0xffffff, specular:0xee6600, shininess:10, map: texture3, combine: THREE.MixOperation, reflectivity: 0.25 } ),
        "qiangMat": 	new THREE.MeshLambertMaterial( { color: 0x757167, map: texture, combine: THREE.MixOperation,reflectivity: 0.15 } ),

    };

//PBR材质扩展  ，物理渲染
    standardMaterial = new THREE.MeshStandardMaterial( {
        color: 0xffffff,
        metalness: 0.0,
       // roughness: 0.8,
       // premultipliedAlpha: true,
       // transparent: true,
        map: texture4,
       // normalMap :texture01,
       // envMap:textureCube
      // envMap: cubeCamera1.renderTarget.texture
} );



}
//模型数据加载重构
function loadSerialized(files) {

    for ( var key in files ) {

        var section = files[ key ];

        for ( var i = 0; i < section.length; i ++ ) {

            var model = section[ i ];

/*
            pivot = new THREE.Object3D();
           // pivot.position.set(-97, 0, 68);
            if (model.scale ) pivot.scale.set( model.scale, model.scale, model.scale );
            scene.add( pivot );
            model.sceneGraphBaseNode = pivot;
*/

            var options = {
                mtlPath: model.mtlPath + model.item_name +"/",
                mtlFileName:model.item_name+".mtl",
                objPath:model.objPath + model.item_name +"/",
                objFileName:model.item_name+".obj",
                thisObj:model
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
                            console.log(child);
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
                        case "Rectangle1865":
                            child.material = standardMaterial ;
                            child.material.needsUpdate = true;
                            break;
                    }
                }
            }
        } );

        // console.log(object);
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
    pointLight = new THREE.PointLight(0xcccccc, 0.8, 300);
    pointLight.position.set(0,20,0);
    //pointLight.castShadow = true;
  //  scene.add( pointLight);
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

   // var axisHelper = new  THREE.AxesHelper(800);
   // scene.add(axisHelper);
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

