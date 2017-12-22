/**
 * Created by user on 2017/12/21
 */
var modelUrl = "3d_files/obj/";
var Datas = {
    "items":[

  /*
    自定义模型数据属性参数结构
    {
            modelName: 'male02',
            dataAvailable: false,
            pathObj: 'obj/male02/',
            fileObj: 'male02.obj',
            pathTexture: 'obj/male02/',
            fileMtl: 'male02.mtl',
            fixed: false,
            item_type: "projector",
            isSelect:true,

            author: 'srg',
            init_rotation: [ 0, 0, 0 ],
            scale: 0.01,
            init_material: 4,
            body_materials: [ 2 ],
            object: null,
            buttons: null,
            materials: null
        },*/
        {
            modelName: 'shexiangtou-qianji-360-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/shexiangtou-qianji-360-01/',
            fileObj: 'shexiangtou-qianji-360-01.obj',
            pathTexture: '3d_files/obj/shexiangtou-qianji-360-01/',
            fileMtl: 'shexiangtou-qianji-360-01.mtl'
            fixed: false,
            type: "projector",
            scale: 0.01,
            isSelect:true

        },
        {
            modelName: 'touyingji and jiazi-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/touyingji and jiazi-01/',
            fileObj: 'touyingji and jiazi-01.obj',
            pathTexture: '3d_files/obj/touyingji and jiazi-01/',
            fileMtl: 'touyingji and jiazi-01.mtl'
            fixed: false,
            type: "projector",
            scale: 0.01,
            isSelect:true

        }

        {
            modelName: 'touyingmu-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/touyingmu-01/',
            fileObj: 'touyingmu-01.obj',
            pathTexture: '3d_files/obj/touyingmu-01/',
            fileMtl: 'touyingmu-01.mtl',
            fixed: false,
            type: "led",
            scale: 0.01,
            isSelect:true

        },
        {
            modelName: 'zhongjianjigui',
            dataAvailable: false,
            pathObj: '3d_files/obj/zhongjianjigui/',
            fileObj: 'zhongjianjigui.obj',
            pathTexture: '3d_files/obj/zhongjianjigui/',
            fileMtl: 'zhongjianjigui.mtl',
            fixed: false,
            type: "rack",
            scale: 0.01,
            isSelect:true

        },
        {
            modelName: '3x8-55',
            dataAvailable: false,
            pathObj: '3d_files/obj/3x8-55/',
            fileObj: '3x8-55.obj',
            pathTexture: '3d_files/obj/3x8-55/',
            fileMtl: '3x8-55.mtl',
            fixed: false,
            type: "led",
            scale: 0.01,
            isSelect:true

        },
        {
            modelName: 'boli',
            dataAvailable: false,
            pathObj: '3d_files/obj/boli/',
            fileObj: 'boli.obj',
            pathTexture: '3d_files/obj/boli/',
            fileMtl: 'boli.mtl',
            fixed: false,
            type: "led",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'damen',
            dataAvailable: false,
            pathObj: '3d_files/obj/damen/',
            fileObj: 'damen.obj',
            pathTexture: '3d_files/obj/damen/',
            fileMtl: 'damen.mtl',
            fixed: false,
            type: "door",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'danti-3x3-55-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/danti-3x3-55-01/',
            fileObj: 'danti-3x3-55-01.obj',
            pathTexture: '3d_files/obj/danti-3x3-55-01/',
            fileMtl: 'danti-3x3-55-01.mtl',
            fixed: false,
            type: "door",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'danti-xiaomen-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/danti-xiaomen-01/',
            fileObj: 'danti-xiaomen-01.obj',
            pathTexture: '3d_files/obj/danti-xiaomen-01/',
            fileMtl: 'danti-xiaomen-01.mtl',
            fixed: false,
            type: "",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'dijiaoxian-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/dijiaoxian-01/',
            fileObj: 'dijiaoxian-01.obj',
            pathTexture: '3d_files/obj/dijiaoxian-01/',
            fileMtl: 'dijiaoxian-01.mtl',
            fixed: false,
            type: "",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'led',
            dataAvailable: false,
            pathObj: '3d_files/obj/led/',
            fileObj: 'led.obj',
            pathTexture: '3d_files/obj/led/',
            fileMtl: 'led.mtl',
            fixed: false,
            type: "",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'lvzhi-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/lvzhi-01/',
            fileObj: 'lvzhi-01.obj',
            pathTexture: '3d_files/obj/lvzhi-01/',
            fileMtl: 'lvzhi-01.mtl',
            fixed: false,
            type: "",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'pangbian-jigui',
            dataAvailable: false,
            pathObj: '3d_files/obj/pangbian-jigui/',
            fileObj: 'pangbian-jigui.obj',
            pathTexture: '3d_files/obj/pangbian-jigui/',
            fileMtl: 'pangbian-jigui.mtl',
            fixed: false,
            type: "rack",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'qiang-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/qiang-01/',
            fileObj: 'qiang-01.obj',
            pathTexture: '3d_files/obj/qiang-01/',
            fileMtl: 'qiang-01.mtl',
            fixed: false,
            type: "",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'shexiangtou-360-qiuji-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/shexiangtou-360-qiuji-01/',
            fileObj: 'shexiangtou-360-qiuji-01.obj',
            pathTexture: '3d_files/obj/shexiangtou-360-qiuji-01/',
            fileMtl: 'shexiangtou-360-qiuji-01.mtl',
            fixed: false,
            type: "camera",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'zouliangding-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/zouliangding-01/',
            fileObj: 'zouliangding-01.obj',
            pathTexture: '3d_files/obj/zouliangding-01/',
            fileMtl: 'zouliangding-01.mtl',
            fixed: false,
            type: "",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'lvzhi-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/lvzhi-01/',
            fileObj: 'lvzhi-01.obj',
            pathTexture: '3d_files/obj/lvzhi-01/',
            fileMtl: 'lvzhi-01.mtl',
            fixed: false,
            type: "",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'shinei-dimian-01',
            dataAvailable: false,
            pathObj: '3d_files/obj/shinei-dimian-01/',
            fileObj: 'shinei-dimian-01.obj',
            pathTexture: '3d_files/obj/shinei-dimian-01/',
            fileMtl: 'shinei-dimian-01.mtl',
            fixed: false,
            type: "",
            scale: 0.01,
            isSelect:true
        },
        {
            modelName: 'kongzhitai-zuhe',
            dataAvailable: false,
            pathObj: '3d_files/obj/kongzhitai-zuhe/',
            fileObj: 'kongzhitai-zuhe.obj',
            pathTexture: '3d_files/obj/kongzhitai-zuhe/',
            fileMtl: 'kongzhitai-zuhe.mtl',
            fixed: false,
            type: "",
            scale: 0.01,
            isSelect:true
        }


    ]
}

/*         for ( var key in Datas) {
              models = Datas[key];
          }
*/
var gUrlList={
    "led":"./charts/chart.html?type=led",
    "door":"./charts/chart.html?type=door",
    "console":"./charts/chart.html?type=console",
    "rack":"./charts/chart.html?type=rack",
    "projector":"./charts/chart.html?type=projector",
    "camera":"./charts/video.html?type=camera"
};


