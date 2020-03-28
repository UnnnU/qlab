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
/*  OD  1       DO  0 */
$.ajaxSetup({
    async: false
});
/*-----------------------------调用数据----------------------*/
/*var flood_json = {};
//flood_json[''+0] = [];
for(var i = 0; i < 113; i++){
    var flood_destinate_json = {};
   // flood_destinate_json[''+0] = [];
    for(var m = 0; m < 113; m++ ){
        var flood_hour_json = {};
        //flood_hour_json[''+0] = [];
        //if(flood[i][m].length == 25){
            for(var k = 0; k < 25; k++){
                flood_hour_json['H'+k] = flood[i][m][k];
                console.log(i)
                console.log(m)
                console.log(k)
                console.log(flood_hour_json)
            }
        //}
        flood_destinate_json['b'+(m+1)] = flood_hour_json
    }
    flood_json['b'+(i+1)] = flood_destinate_json;
}

/*------------------------------------街区ID与中心坐标表-----------------------------------------*/
var block_id_latlng = [];
function block_id_latlng_init(){
    for(var i=0;i<blocksData.features.length;i++){
        block_id_latlng[i] = [blocksData.features[i].properties.lat,blocksData.features[i].properties.lon]
    }
};
// function block_id_latlng_init(){
//     for(var i=0;i<centerData.features.length;i++){
//         block_id_latlng[i] = [centerData.features[i].properties.center[1],centerData.features[i].properties.center[1]]
//     }
// };


block_id_latlng_init();
var block_id_latlng_dic={};
function block_id_latlng_dic_init(){
    block_id_latlng_dic[''+0] = [];
    for(var i=0;i<block_id_latlng.length;i++){
        block_id_latlng_dic['b'+(i+1)] = [];
        block_id_latlng_dic['b'+(i+1)][0] = block_id_latlng[i][1];
        block_id_latlng_dic['b'+(i+1)][1] = block_id_latlng[i][0];
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
    center:/*[-100.486052, 37.830348],*/[118.75,32.13], // 中心位置
    zoom: 6, // 地图缩放
    pitch: 10,
    //bearing: 20
});

var echartslayer = new EchartsLayer(map);

map.addControl(new mapboxgl.NavigationControl());
// option2.GLMap.map=map;
map.on('load', function () {
    map.addSource("states", {
        "type": "geojson",
        "data":blocksData
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
            "line-width": 1
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
    map.on("mousemove", function(e) {  //鼠标在地图上移动
        var features = map.queryRenderedFeatures(e.point, { layers: ["state-fills"] });
        if (features.length) {
            //   console.log(features[0].properties.block_num);
            map.setFilter("state-fills-hover", ["==", "districtID",  features[0].properties.districtID]);
            //显示街道信息
            $('#showContent').html('<h4>江苏省区域信息</h4>' +  ('<b>区域编号:' + features[0].properties.districtID + '</b><br />' +'区域面积: ' + (features[0].properties.Shape_Area/1000000).toFixed(2) + ' km<sup>2</sup>' + '<br />' ));
        } else {
            map.setFilter("state-fills-hover", ["==", "districtID", ""]);
            $('#showContent').html('<h4>江苏省区域信息</h4>' + '无');
        }
    });
    map.on("mouseout", function() {
        map.setFilter("state-fills-hover", ["==", "districtID", ""]);
        $('#showContent').html('<h4>江苏省区域信息</h4>' + '无');
    });


});


map.on('click', function (e) { //鼠标点击事件
    var features = map.queryRenderedFeatures(e.point);
    if (features.length) {
        //mode = od_flag_to_char(OD_flag);
        block_Id = 'b' +features[0].properties.districtID;
        clear_layer();
        drawLine(block_Id);
        time_barchart(block_Id);
    }
});

/*--------------------------------菊花图绘制------------------------*/
function clear_layer(){//清除
    echartslayer.chart.setOption({}, 1);
}
function drawLine(block_Id){
    clear_layer();
    var line_data = [];
    var point_data = [];
    /*for (var i=0; i< flood_json[block_Id].length; i++){
        if(flood_json[block_Id]['b'+(i+1)].length){
                if (flood_json[block_Id]['b'+(i+1)][cur_hour]){
                    line_data.push({
                        fromName:  block_Id,
                        toName: 'b'+(i+1),
                        coords: [geoCoordMap[block_Id], geoCoordMap['b'+(i+1)]]
                    });
                    point_data.push({
                        name: blocksData.features[0][block_Id.substring(1,block_Id.length)].properties.XZQMC,
                        value: geoCoordMap['b'+(i+1)].concat(flood_json[block_Id]['b'+(i+1)][cur_hour])
                    })
                }


        }

    }*/
    for (var i=0; i< 113; i++){
            if (flood[parseInt(block_Id.substring(1,block_Id.length))-1][i][parseInt(cur_hour.substring(1,cur_hour.length))]){
                line_data.push({
                    fromName:  block_Id,
                    toName: 'b'+(i+1),
                    coords: [geoCoordMap[block_Id], geoCoordMap['b'+(i+1)]]
                });
                point_data.push({
                    //name: blocksData.features[0][block_Id.substring(1,block_Id.length)].properties.XZQMC,
                    name:'b'+(i+1),
                    value: geoCoordMap['b'+(i+1)].concat(flood[parseInt(block_Id.substring(1,block_Id.length)-1)][i][parseInt(cur_hour.substring(1,cur_hour.length))])
                })
            }
            //console.log(line_data);
            console.log(point_data)


    }


 /*   var convertData = function (data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
            var dataItem = data[i];
            var fromCoord = geoCoordMap[dataItem[0].name];
            var toCoord = geoCoordMap[dataItem[1].name];
            if (fromCoord && toCoord) {
                res.push({
                    fromName: dataItem[0].name,
                    toName: dataItem[1].name,
                    coords: [fromCoord, toCoord]
                });
            }
        }
        return res;
    };*/

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

        });

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
            max : 500,
            y: '60%',
            calculable : true,
            color: ['#ff3333', 'orange', 'yellow','lime','aqua']
        },
        series: series

    };

    echartslayer.chart.setOption(option);
};
/*--------------------------------OD／DO选择------------------------*/
/*function od_flag_to_char(flag){
    if(flag == 1){
        return 'OD'
    }
    else{
        return 'DO'
    }
};
function Sw_od_patten(){
    if(OD_flag ==1){
        OD_flag=0;
        j=0;
        mode=od_flag_to_char(OD_flag);
        OD_FLAG_HZ='DO:选择工作地，绘制家庭分布';
        document.getElementById("field2").value=OD_FLAG_HZ;
        drawLine(block_Id);
        // time_barchart(blockId);
    }
    else{
        OD_flag=1;
        j=1;
        mode=od_flag_to_char(OD_flag);
        OD_FLAG_HZ='OD:选择住址，绘制工作地分布';
        document.getElementById("field2").value=OD_FLAG_HZ;
        drawLine(block_Id);
        // time_barchart(blockId);
    };
};
/*--------------------------------生成街区流入量/流出量柱形图------------------------*/
function time_barchart(block_Id){
    var barcharts=echarts.init(document.getElementById("barChart"));
    /*var mode;
    if(OD_flag == 1){
        mode = 'OD';
        j=1;
    }
    else{
        mode = 'DO';
        j=0;
    }*/
    var data_bar =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (var i=0; i< 113; i++){
        //data_bar[i] =[];
        //if(flood_json[block_Id]['b'+(i+1)].length){
            for (var m=0; m<24; m++){
                if(flood[parseInt(block_Id.substring(1,block_Id.length))][i][m+1]){
 //               if (flood_json[block_Id]['b'+(i+1)]['H'+(m+1)]){
                    data_bar[m] = data_bar[m] + flood[parseInt(block_Id.substring(1,block_Id.length))][i][m+1]
                }

            }


        //}

    }
    option = {
        tooltip: {
            trigger: 'axis'
        },
        xAxis: [
            {
                axisLabel: {
                    show: true,
                    interval:0,
                    ratate:-30,
                    textStyle: {
                        color: '#fff'
                    }
                },

                type: 'category',
                data: ['0:00时','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00']
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
                barWidth:'30px',
                data:data_bar
            }
        ]
    };
    barcharts.setOption(option);
    barcharts.on('click',function(params){
        document.getElementById('time').innerHTML =params.name +"-"+(parseInt(params.name)+1)+":00时";
        clear_layer();
        cur_hour='H' + params.dataIndex;
        console.log(cur_hour)
        drawLine(block_Id);
        // barcharts.dispatchAction({
        //  type: 'dataZoom',
        //  startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
        //  endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
        // })

    });
}

/*--------------------------------周末／工作日选择------------------------*/

function SelectChange() {//下拉栏判断使用哪种流模式
    var selectValue = $("#selectID").val();
    if (selectValue == 0) {//全勤
        //$('#in_out_mode').css('display', 'none');
        //$('#OD_DO_mode').css('display', 'block');
        cur_hour = 'H0';
        /*if (OD_flag == 1) {
            mode = 'OD';
            j = 1;
        }
        else {
            mode = 'DO';
            j = 0;
        }*/
        // data_point_all = data_point;
        //////////////?data_line_all = data_line;
        data_bar = data_hour;
        drawLine(block_Id);
        document.getElementById("barChart").style.display = "none";
        document.getElementById('btn_time').style.display = "none";
    }
    if (selectValue == 1) {//工作日24小时流
        cur_hour = 'H0';
        /*OD_flag = 1;
        if (OD_flag == 1) {
            mode = 'OD';
            j = 1;
        }
        else {
            mode = 'DO';
            j = 0;
        }*/
        //data_point_all = data_point;
        ///////////////?data_line_all = data_line;
        data_bar = data_hour;
        /*$('#in_out_mode').css('display', 'block');
        $("#in_mode").css({
            "background": "#fff",
            "color": '#000000'
        })
        $("#out_mode").css({
            "background": "#CD2626",
            "color": '#fff'
        })*/
        //$('#OD_DO_mode').css('display', 'none');
        document.getElementById("barChart").style.display = "block";
        document.getElementById('btn_time').style.display = "block";
        document.getElementById('time').style.display = "block";
        document.getElementById('time').innerHTML = "全部通勤"
        drawLine(block_Id);
        time_barchart(block_Id);

    }
    /*if (selectValue == 2) {//周末24小时流
        cur_hour = 'H0';
        OD_flag = 1;

        if (OD_flag == 1) {
            mode = 'OD';
            j = 1;
        }
        else {
            mode = 'DO';
            j = 0;
        }
        //data_point_all = data_weekend_point;
        data_line_all = data_weekend_line;
        data_bar = data_weekend;
        $('#in_out_mode').css('display', 'block');
        $("#in_mode").css({
            "background": "#fff",
            "color": '#000000'
        })
        $("#out_mode").css({
            "background": "#CD2626",
            "color": '#fff'
        })
        $('#OD_DO_mode').css('display', 'none');
        document.getElementById("barChart").style.display = "block";
        document.getElementById('btn_time').style.display = "block";
        document.getElementById('time').style.display = "block";
        document.getElementById('time').innerHTML = "0:00-1:00时"
        drawLine(block_Id);
        time_barchart(block_Id);

    }*/
}