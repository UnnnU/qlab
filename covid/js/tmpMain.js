var data_line=[];//线所需数据
var data_point=[];//点所需数据
var data_hour=[];//所需街区时间数据
var data_weekend=[];//周末24小时人流柱形图数据
var data_weekend_line=[];//周末24小时人流地图画线数据
var data_weekend_point=[];//周末24小时人流地图画圈数据
var data_point_all=[];//画圈数据
var data_line_all=[];//画圈数据
//var data_bar=[];//画柱形图数据
var HOUR=24;//时间
var block_Id;//街道id
var mode;
var OD_TABLE = [];
var OD_flag = 1;
var OD_FLAG_HZ ='选择住址，绘制工作地分布';
var cur_hour='H0';//默认通勤流
var j=1;   //根据OD-DO模式转换
$.ajaxSetup({
    async: false
});


/*------------------------------------省会ID与中心坐标表-----------------------------------------*/

// console.log('b'+0);

var block_id_latlng = [];
function block_id_latlng_init(){
    for(var i=0;i<centerData.features.length;i++){
        // block_id_latlng[i] = i
        block_id_latlng[i] = [centerData.features[i].properties.center.lat,centerData.features[i].properties.center.lon];
        // console.log(centerData.features[i].properties.name);
        // block_id_latlng[i] = centerData.features[i].properties.center;
}};
block_id_latlng_init();

// console.log(block_id_latlng[0]);

var block_id_latlng_dic={};
function block_id_latlng_dic_init(){
    block_id_latlng_dic[''+0] = [];
    for(var i=0;i<block_id_latlng.length;i++){
        block_id_latlng_dic['b'+(i)] = [];
        block_id_latlng_dic['b'+(i)][0] = block_id_latlng[i][1];
        block_id_latlng_dic['b'+(i)][1] = block_id_latlng[i][0];
    }
};

/*------------------------------------mapbox----------------------------------------*/
block_id_latlng_dic_init();
var geoCoordMap = block_id_latlng_dic; //加载街道经纬度

$(document).ready(function() {
    //绑定下拉框change事件，当下来框改变时调用 SelectChange()方法
    $("#selectID").change(function() { SelectChange(); });
});

mapboxgl.accessToken = 'pk.eyJ1IjoieXVyYW53YW5nIiwiYSI6ImNpdnVvanl4NzAwNTAyenFkemJsbHB5ejAifQ.HNTqg3xW1JKT5OvfPc_R7Q';
var map = new mapboxgl.Map({
    container: 'container', // 标签id
    style:  'mapbox://styles/mapbox/dark-v9',
    center:/*[-100.486052, 37.830348],*/[108,35], // 中心位置
    zoom: 3, // 地图缩放
    pitch: 10,
    //bearing: 20
});

var echartslayer = new EchartsLayer(map);

map.addControl(new mapboxgl.NavigationControl());
// option2.GLMap.map=map;
map.on('load', function () {
    // map.addSource('google.tile', {
    //     'type': 'raster',
    //     'tiles': ['https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'],
    //     'tileSize': 256
    // })
    map.addSource("states", {
        "type": "geojson",
        "data":centerData
    });
    map.addLayer({
        "id": "state-fills",
        "type": "fill",
        "source": "states",
        "layout": {},
        "paint": {
            "fill-color": "#343332",
            "fill-opacity": 0.1
        }
    });
    map.addLayer({
        "id": "state-borders",
        "type": "line",
        "source": "states",
        "layout": {},
        "paint": {
            "line-color": '#666',
            "line-width": 3
        }
    });
    map.addLayer({
        "id": "state-fills-hover",
        "type": "fill",
        "source": "states",
        "layout": {},
        "paint": {
            "fill-color": "#666",
            "fill-opacity": 0.7
        },
        "filter": ["==", "districtID", ""]
    });
    map.addLayer({
        "id": "state-fills-hover",
        "type": "fill",
        "source": "states",
        "layout": {},
        "paint": {
            "fill-color": "#666",
            "fill-opacity": 0.7
        },
        "filter": ["==", "name", ""]
    });
    // map.on("mousemove", function(e) {  //鼠标在地图上移动
        // var features = map.queryRenderedFeatures(e.point, { layers: ["state-fills"] });
        // if (features.length) {
        //     //   console.log(features[0].properties.block_num);
        //     map.setFilter("state-fills-hover", ["==", "districtID",  features[0].properties.districtID]);
        //     //显示街道信息
        //     $('#showContent').html('<h4>江苏省区域信息</h4>' +  ('<b>区域编号:' + features[0].properties.districtID + '</b><br />' +'区域面积: ' + (features[0].properties.Shape_Area/1000000).toFixed(2) + ' km<sup>2</sup>' + '<br />' ));
        // } else {
        //     map.setFilter("state-fills-hover", ["==", "districtID", ""]);
        //     $('#showContent').html('<h4>江苏省区域信息</h4>' + '无');
        // }
    // });
    map.on("mousemove", function(e) {  //鼠标在地图上移动
        var features = map.queryRenderedFeatures(e.point, { layers: ["state-fills"] });
        if (features.length) {
            //   console.log(features[0].properties.block_num);
            map.setFilter("state-fills-hover", ["==", "districtID",  features[0].properties.name]);
            //显示街道信息
            $('#showContent').html('<h4>The epidemic in China</h4>' +  ('<b>City Name:' + features[0].properties.name + '</b>'));
        } else {
            map.setFilter("state-fills-hover", ["==", "name", ""]);
            $('#showContent').html('<h4>The epidemic in China</h4>' + 'None');
        }
    });
    // map.on("mouseout", function() {
        // map.setFilter("state-fills-hover", ["==", "districtID", ""]);
        // $('#showContent').html('<h4>江苏省区域信息</h4>' + '无');
    // });
    map.on("mouseout", function() {
        map.setFilter("state-fills-hover", ["==", "name", ""]);
        $('#showContent').html('The epidemic in China' + 'None');
    });
    map.on('click', function (e) { //鼠标点击事件
        var features = map.queryRenderedFeatures(e.point);
        if (features.length) {
            //mode = od_flag_to_char(OD_flag);
            block_Id = 'b' +features[0].properties.districtID;
            var cityName = features[0].properties.name;
            // console.log('b')
            // time_barchart(cityName);
            document.getElementById("barChart").style.display = "block";
            // document.getElementById('btn_time').style.display = "block";
            // document.getElementById('time').style.display = "block";
            clear_layer();
            // clear_table();
            drawLine(block_Id);
            time_barchart(cityName);
            // time_barchart(block_Id);


        }
    });
    

});
/*--------------------------------菊花图绘制------------------------*/
function clear_layer(){//清除
    echartslayer.chart.setOption({}, 1);
}
// function clear_table(){
//     myChart.setOption({},1);
// }
// console.log(flood)

function drawLine(block_Id){
    clear_layer();
    var line_data = [];
    var point_data = [];

    
    for (var i=0; i<31; i++){
        // console.log(block_Id.substring(1,block_Id.length))
        if (flood[parseInt(block_Id.substring(1,block_Id.length))][i]){
            
            line_data.push({
                fromName:  block_Id,
                toName: 'b'+i,
                coords: [geoCoordMap[block_Id], geoCoordMap['b'+i]]
            });
            point_data.push({
                //name: blocksData.features[0][block_Id.substring(1,block_Id.length)].properties.XZQMC,
                name:'b'+i,
                value: geoCoordMap['b'+i].concat(flood[parseInt(block_Id.substring(1,block_Id.length))][i])
            })
        }
            //console.log(line_data);
            // console.log(point_data)


    }


    var color = ['#a6c84c', '#ffa022', '#46bee9'];
    var series = [];

        series.push({
            name: 'lines',  //不用管
            coordinateSystem: 'GLMap',
            type: 'lines',
            zlevel: 1,
            effect: {
                show: true,
                scaleSize: 1,
                period: 30,
                color: '#fff',
                shadowBlur: 10
            },
            lineStyle: {
                normal: {
                    color: color[i],
                    width: 0,
                    curveness: 0.2
                }
            },
            data : line_data
        }, {

            coordinateSystem: 'GLMap',
            type: 'lines',
            symbol: ['none', 'arrow'],   //箭头
            symbolSize: 10,
            zlevel: 2,
            effect: {
                show: true,
                scaleSize: 1,
                period: 30,
                color: '#fff',
                shadowBlur: 10
            },
            lineStyle: {
                normal: {
                    color: color[i],
                    width: 1,             //线的宽度
                    opacity: 0.4,
                    curveness: 0.2
                }
            },
            data: line_data
        }, {
            //不用管
            type: 'effectScatter',
            coordinateSystem: 'GLMap',
            effectType:'ripple',
            zlevel: 2,
            rippleEffect: {
                scale:4,
                brushType: 'stroke',
                period:'2'
            },
            label: {
                normal: {
                    show: false,
                    position: 'right',
                    formatter: '{b}'
                }
            },
            symbol:'circle',
            symbolSize: function (val) {
                return  5+ val[2]/1000;
            },
            itemStyle: {
                normal: {

                    label:{show:false}
                }
            },
            data: point_data

        },
        // {//scatter 加载

        //     type: 'Scatter',
        //     // coordinateSystem: 'GLMap',
        //     data: [100,500,200,200,100,50]
        //     // symbolSize: function (data) {
        //     //     return Math.sqrt(data) / 0.3;
        //     // }   

        // }
        );

    var option = {
        GLMap: {
            roam: true
        },
        coordinateSystem: 'GLMap',

        tooltip: {
            trigger: 'item'
        },

        geo: {
            map: 'GLMap',
            label: {
                emphasis: {
                    show: false
                }
            },
            roam: true,
            itemStyle: {
                normal: {
                    areaColor: '#323c48',
                    borderColor: '#404a59'
                },
                emphasis: {
                    areaColor: '#2a333d'
                }
            }
        },
        dataRange: {
            min : 0,
            max : 100,
            y: '60%',
            calculable : true,
            color: ['#ff3333', 'orange', 'yellow','lime','aqua']
        },
        series: series

    };

    echartslayer.chart.setOption(option);

    
    
};

// 累计病例柱状图
function time_barchart(cityName){
    var barcharts = echarts.init(document.getElementById("barChart"));
    var data_bar = patient[String(cityName)];
    var option = {
        title: {
            show:true,
            text: String(cityName)+"The cumulative confirmed cases",
            subtext: 'Data Source: National Health Commission of People’s Republic of China',
            textStyle:{
                color:'#DC143C',
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                axisLabel: {
                    rotate: 40,
                    show: true,
                    interval:0,
                    ratate:-30,
                    textStyle: {
                        color: '#fff',
                        
                    }
                },

                type: 'category',
                data: time
            }
        ],
        yAxis: [
            {
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#fff'
                    }
                },
                type: 'value',
                min: 0,
            }
        ],
        series: [
            {
                name:'人次',
                type:'bar',
                backgroundColor:"#343332",
                barGap:'10%',
                barWidth:'8px',
                data:data_bar
            },
            //加折线图
            {
                name:'number',
                type:'line',
                data:data_bar,
                itemStyle: {
                    normal: { lineStyle: { type: 'solid', color: '#fff' } },
                },
            }
        ]
    };
    barcharts.setOption(option);
    // barcharts.on('click',function(params){
    //     document.getElementById('time').innerHTML =params.name +"-"+(parseInt(params.name)+1)+":00时";
    //     clear_layer();
    //     cur_hour='H' + params.dataIndex;
    //     console.log(cur_hour)
    //     drawLine(block_Id);
        // barcharts.dispatchAction({
        //  type: 'dataZoom',
        //  startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
        //  endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
        // })

    // });
};

    var block_id_latlng1 = [];
    function block_id_latlng1_init(){
        for(var i=0;i<centerData.features.length;i++){
            // block_id_latlng[i] = i
            block_id_latlng1[i] = [centerData.features[i].properties.center.lat,centerData.features[i].properties.center.lon];
            // console.log(centerData.features[i].properties.name);
            // block_id_latlng[i] = centerData.features[i].properties.center;
    }};
    block_id_latlng1_init();

    // console.log(block_id_latlng[0]);

    var block_id_latlng_dic1={};
    function block_id_latlng_dic1_init(){
        block_id_latlng_dic1[''+0] = [];
        for(var i=0;i<block_id_latlng1.length;i++){
            block_id_latlng_dic1[centerData.features[i].properties.name] = [];
            block_id_latlng_dic1[centerData.features[i].properties.name][0] = block_id_latlng1[i][1];
            block_id_latlng_dic1[centerData.features[i].properties.name][1] = block_id_latlng1[i][0];
        }
    };

    /*------------------------------------mapbox----------------------------------------*/
    block_id_latlng_dic1_init();
    var geoCoordMap1 = block_id_latlng_dic1; //加载街道经纬度
    // console.log(geoCoordMap1);
    var cases_value = [];
    for(var i = 0; i<cityName.length; i++){
        cases_value.push({
            name: cityName[i],
            value: patient[cityName[i]][patient[cityName[i]].length - 1 ]
        })
    }
    // console.log(cases_value)
    //console.log(cases_value.length)
    //console.log(cases_value[0].name)
    //console.log(geoCoordMap1['北京市']);
    // console.log(patient[cityName[1]][patient[cityName[1]].length - 1 ])
    var convertData = function (data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
        var geoCoord =  geoCoordMap['b'+i];
        if (geoCoord) {
            res.push({
                name: data[i].name,
                value: geoCoord.concat(data[i].value)
            });
        }
    }
    return res;
    };
    var convertData1 = function (data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
        var geoCoord =  geoCoordMap1[data[i].name];
        if (geoCoord) {
            res.push({
                name: data[i].name,
                value: geoCoord.concat(data[i].value)
            });
        }
    }
    return res;
    };
        // console.log(convertData(cases_value.sort(
        //     function(a,b){
        //         return b.value -a.value ;
        //     }
        // )).slice(0,6))  
            
    var option = {

        GLMap: {
            roam: true
        },
        coordinateSystem: 'GLMap',

        tooltip: {
            trigger: 'item',
            formatter: function (obj) {
                var value = obj.value;
                return time[time.length - 1]+' '+obj.name + '：' + value[2];
            }
        },

        geo: {
            map: 'GLMap',
            label: {
                emphasis: {
                    show: false
                }
            },
            roam: true,
            itemStyle: {
                normal: {
                    areaColor: '#323c48',
                    borderColor: '#404a59'
                },
                emphasis: {
                    areaColor: '#2a333d'
                }
            }
        },                              

        series:  [{
            name: 'confirmed cases',

            type: 'scatter',
            coordinateSystem: 'GLMap',
            data: convertData1(cases_value),
            symbolSize: function (data) {
                if(data[2]>10000){return 80}
                else if(data[2]>1000){return data[2]/30}
                else{return data[2]/30;}
                
            },
            label: {
                normal: {
                    show: false,
                    position: 'right',
                    formatter: '{b}'
                }
            },
            itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(120, 36, 50, 0.5)',
                shadowOffsetY: 5,
                color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                    offset: 0,
                    color: 'rgba(251, 118, 123,0.5)'
                }, {
                    offset: 1,
                    color: 'rgba(204, 46, 72,0.5)'
                }])
            },
            emphasis: {
                label: {
                    show: true
                }
            }
        },
        {
            type: 'effectScatter',
            coordinateSystem: 'GLMap',
            symbol: "circle",
            data: convertData1(cases_value.sort(function (a, b) {
                return b.value - a.value;
            }).slice(0, 6)),
            symbolSize: function (data) {
                if(data[2]>10000){return 80}
                else if(data[2]>1000){return data[2]/30}
                else{return data[2]/30;}
                
            },
            showEffectOn: 'render',
            rippleEffect: {
                //涟漪特效
                period: 4, //特效动画时长
                scale: 3, //波纹的最大缩放比例
                brushType: "stroke" //波纹的绘制方式：stroke | fill
            },
            //hoverAnimation: true,
            label: {
                normal: {
                    show: false
                },
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    color: "rgba(255,255,255,0.4)" //颜色
                },
                emphasis: {
                    borderColor: "#fff",
                    borderWidth: 1
                }
            },
            zlevel: 1
        }
    ]
    };

    echartslayer.chart.setOption(option);


    // 显示各省累计患病人数柱状图
    //var barcharts = echarts.init(document.getElementById("barChart"));
    // var latest_cumulative_cases = [];
    // for (var i = 0; i<cityName.length; i++){
    //     latest_cumulative_cases[i] = patient[cityName[i]][patient[cityName[i]].length - 1 ];
    // }
    // console.log(latest_cumulative_cases)
    //var data_bar = patient[cityName];
    // console.log(cityName)
    // console.log(patient[cityName[0]])
    var myChart = echarts.init(document.getElementById('barChart'));
    var option1 = {
        title: {
            show:true,
            text: time[time.length - 1]+"   The cumulative confirmed cases outside Hubei",
            subtext: 'Data Source: National Health Commission of People’s Republic of China',
            textStyle:{
                color:'#DC143C',
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        
        xAxis: [
            {
                axisLabel: {
                    rotate: 40,
                    //fontSize:'5',
                    //show: true,
                    interval:0,//此一句，能够控制间隔几个显示
                    // ratate:-30,
                    textStyle: {
                        color: '#fff',
                        fontSize:'10'
                    },
                    
                    
            },

            type: 'category',
            data: [
                    "Beijing",
                    "Tianjin",
                    "Hebei",
                    "Shanxi",
                    "Inner Mongolia",
                    "Liaoning",
                    "Jilin",
                    "Heilongjiang",
                    "Shanghai",
                    "Jiangsu",
                    "Zhejiang",
                    "Anhui",
                    "Fujian",
                    "Jiangxi",
                    "Shandong",
                    "Henan",
                    // "Hubei",
                    "Henan",
                    "Guangdong",
                    "Guangxi",
                    "Hainan",
                    "Chongqing",
                    "Sichuan",
                    "Guizhou",
                    "Yunnan",
                    "Tibet",
                    "Shannxi",
                    "Gansu",
                    "Qinghai",
                    "Ningxia",
                    "Xinjiang",
                    
                ]
            }
        ],
        yAxis: [
            {
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#fff'
                    }
                },
                type: 'value',
            }
        ],
        series: [
            {
                name: 'number',
                type:'bar',
                backgroundColor:"#343332",
                barGap:'10%',
                barWidth:'12px',
                data:[428, 136, 318, 133, 75, 125, 93, 481, 342, 631, 1215, 990, 296, 936, 758, 1272, 1018, 1352, 252, 168, 575, 539, 146, 174, 1, 245, 120, 18, 75, 76]
            },
        ]
    };
    document.getElementById("barChart").style.display = "block";
    myChart.setOption(option1);

    // console.log(patient)








