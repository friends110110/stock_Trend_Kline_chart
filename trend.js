var Trend_Url="http://open.hs.net/quote/v1/trend?prod_code=600570.SS&fields=last_px,business_amount,avg_px&access_token=484005EF72534601B246BE756C2437242016053019132738999840&_v=14652885931607251";
var Real_Url="http://open.hs.net/quote/v1/real?en_prod_code=600570.SS&fields=open_px,preclose_px&access_token=484005EF72534601B246BE756C2437242016053019132738999840&_v=14652885931607251"
var DIVID='#line_map';

//https://open.hs.net/quote/v1/trend?prod_code=600570.SS&fields=last_px,business_amount,avg_px&access_token=484005EF72534601B246BE756C2437242016053019132738999840&_v=14652885931607251

//接收个股代码
var STOCK_CODE = "600570.SS";//js_lib.getQueryStringByName("stock_code");
/*
 * 分时
 */
if(STOCK_CODE==""){
    STOCK_CODE="600570.SS";
}
function clickTrend(obj){
    $.ajax({url:Real_Url,
            success:callbackReal,
            type: "get",
            dataType:"json",
            error:failCallback});
   
}
function clickTrend_Show(val){
    var jsonText = val;//JSON.parse(val);    
    if(typeof(jsonText.error_info)!='undefined'){
        failCallback();
        return ;
    }
    var data=jsonText.data.trend;
    data=data[STOCK_CODE];
    //画图
    trendChart(DIVID,data);
}
//图表上的成交量第一条的数据红绿的判断 是根据昨日的收盘价preclose_px 和今日的最新价last_px进行对比
//同时获取的昨日收盘价  用于涨幅的计算
var isFirstLineColorflag=true;
//保存昨收数据
var yesterdayClose;
//可以获取今开 与昨收
function callbackReal(val){
    //var jsonText = JSON.parse(val);    
    var price_data=val.data.snapshot;
    if(typeof(price_data[STOCK_CODE])=='undefined'){
        failCallback();
        return ;
    }
    //今开
    var open_px=price_data[STOCK_CODE][2];
    //昨收
    var preclose_px=price_data[STOCK_CODE][3];
    yesterdayClose=preclose_px;
    isFirstLineColorflag=open_px>preclose_px?true:false;
    //获取分时数据
    var kline_params = "prod_code="+STOCK_CODE+"&fields=last_px,business_amount,avg_px";
    $.ajax({url:Trend_Url,
            success:clickTrend_Show,
            type: 'get',
            error:failCallback});
}
/*
 * 5日
 */
function clickFiveDayTrend(obj){
    $(obj).parent().parent().children().each(function(){
        $(this).removeClass("hover");
    });
    $(obj).parent().addClass("hover");
}
var avg_pxyAxisMin;
var avg_pxyAxisMax;
var percentageyAxisMin;
var percentageyAxisMax;
var volume_yAxisMin;
var volume_yAxisMax;
var red="#ff0000";
var blue="#00a800";
function trendChart(DIVID,data)
{  
    var ohlc = [],
    volume = [],//昨日开盘价
    i = 0;
    //容错判断
    if(data!=undefined&&data!=null&&data.length==0){
        failCallback();
        return;
    }
    // split the data set into ohlc and volume
    //数据处理
    for (i; i < data.length; i += 1) {
        var dateUTC=getDateUTCOrNot(data[i][0],true);
        var business_amount=data[i][2];
        var columnColor = red;
        if(i==0){//第一笔的 红绿柱 判断依据是根据 今天开盘价与昨日收盘价比较
            if(isFirstLineColorflag==false){
                columnColor = blue;
            }
            avg_pxyAxisMin=data[i][3];
            avg_pxyAxisMax=data[i][3];
            percentageyAxisMin=Number(100*(data[i][1]/yesterdayClose-1));
            percentageyAxisMax=Number(100*(data[i][1]/yesterdayClose-1));
            volume_yAxisMin=data[i][2];
            volume_yAxisMax=data[i][2];
        }
        else {
            //除了第一笔，其它都是  返回的 last_px 与前一个对比
            if(data[i-1][1]-data[i][1]>0){
                columnColor = blue;
                }
            business_amount=data[i][2]-data[i-1][2];
            }
        avg_pxyAxisMin=avg_pxyAxisMin>data[i][1]?data[i][1]:avg_pxyAxisMin;
        avg_pxyAxisMax=avg_pxyAxisMax>data[i][1]?avg_pxyAxisMax:data[i][1];
        percentageyAxisMin=percentageyAxisMin>Number(100*(data[i][1]/yesterdayClose-1))?Number(100*(data[i][1]/yesterdayClose-1)):percentageyAxisMin;
        percentageyAxisMax=percentageyAxisMax>Number(100*(data[i][1]/yesterdayClose-1))?percentageyAxisMax:Number(100*(data[i][1]/yesterdayClose-1));
        volume_yAxisMin=volume_yAxisMin>business_amount?business_amount:volume_yAxisMin;
        volume_yAxisMax=volume_yAxisMax>business_amount?volume_yAxisMax:business_amount;
        //将数据放入 ohlc volume 数组中
        ohlc.push({x:dateUTC,y:Number(data[i][1])});
        volume.push({x:dateUTC,y:Number(business_amount),color:columnColor});
    }
    //将剩下的时间信息补全
    appendTimeMessage(ohlc,volume,data);
    createTrendChart(data,ohlc,volume);
};
function createTrendChart(data,ohlc,volume){
    var date;
    if(data.length>0){
        date=data[data.length-1][0]+"";
        var dArr = new Array();
        for(var hh=0;hh<5;hh++){
            var numb ;
            if(hh==0){
                numb = Number(date.slice(0,4));
            }
            else {
                numb= Number(date.slice((hh-1)*2+4,hh*2+4));
                };
            dArr.push(numb);
        }
    }
    var last_dataTime=new Date(dArr[0],dArr[1]-1,dArr[2],dArr[3],dArr[4]);
    var $reporting = $("#report");
    $reporting.html("");
     // Create the chart
    var am_startTime=new Date(last_dataTime);
    am_startTime.setHours(9, 30, 0, 0);
    var am_startTimeUTC=Number(Date.UTC(am_startTime.getFullYear(),am_startTime.getMonth(),am_startTime.getDate(),am_startTime.getHours(),am_startTime.getMinutes()));
    
    var am_midTime=new Date(last_dataTime);
    am_midTime.setHours(10, 30, 0, 0);
    var am_midTimeUTC=Number(Date.UTC(am_midTime.getFullYear(),am_midTime.getMonth(),am_midTime.getDate(),am_midTime.getHours(),am_midTime.getMinutes()));
    
    //股票交易早上最后的时间
    var am_lastTime=new Date(last_dataTime);
    am_lastTime.setHours(11, 30, 0, 0);
    var am_lastTimeUTC=Number(Date.UTC(am_lastTime.getFullYear(),am_lastTime.getMonth(),am_lastTime.getDate(),am_lastTime.getHours(),am_lastTime.getMinutes()));
    //股票交易下午最后的时间
    var pm_startTime=new Date(last_dataTime);
    pm_startTime.setHours(13, 1, 0, 0);
    var pm_startTimeUTC=Number(Date.UTC(pm_startTime.getFullYear(),pm_startTime.getMonth(),pm_startTime.getDate(),pm_startTime.getHours(),pm_startTime.getMinutes()));

    var pm_midTime=new Date(last_dataTime);
    pm_midTime.setHours(14, 0, 0, 0);
    var pm_midTimeUTC=Number(Date.UTC(pm_midTime.getFullYear(),pm_midTime.getMonth(),pm_midTime.getDate(),pm_midTime.getHours(),pm_midTime.getMinutes()));

    var pm_lastTime=new Date(last_dataTime);
    pm_lastTime.setHours(15, 0, 0, 0);
    var pm_lastTimeUTC=Number(Date.UTC(pm_lastTime.getFullYear(),pm_lastTime.getMonth(),pm_lastTime.getDate(),pm_lastTime.getHours(),pm_lastTime.getMinutes()));
    //常量本地化
    Highcharts.setOptions({
        global : {
            useUTC : true
        }
    });
    
    var startX,startY,swipeX,swipeY;
    createTrendChart.trend_touchstart=function(event){
        var touch = event.touches[0];
        startX=touch.pageX;
        startY=touch.pageY;
        swipeX=swipeY=false;
        document.getElementById("line_map").addEventListener("touchmove", createTrendChart.trend_touchmove);
    }
    createTrendChart.trend_touchmove=function (event){
        var touch = event.touches[0];
        var currenX=touch.pageX;
        var currentY=touch.pageY;
        if(true==swipeX){//先左右就一直左右  上下也不影响
            swipeY=false;
        }
        else if(true==swipeY){//向上下移动的标志
            swipeX=false;
        }else{
            if(Math.abs(currentY-startY)>Math.abs(currenX-startX)){//上下移动
                swipeY=true;
                }
            else{
                swipeX=true;
                }
        }
        if(true==swipeY){//上下移动   先重画线 人后删除事件
            document.getElementById("line_map").removeEventListener("touchmove", createTrendChart.trend_touchmove,false);
        }else if(true==swipeX){ 
            event.stopPropagation();
            event.preventDefault();
        }
        //不管 上下 还是 左右 都需要先画标示线
        var chart = $(DIVID).highcharts();
        var left=chart.yAxis[0].left+(chart.yAxis[0].axisLine.strokeWidth==undefined?0:chart.yAxis[0].axisLine.strokeWidth);
        var y ;
        var x = touch.pageX-left-7;
        //x点 =x/chart宽度 * 总体点的个数
        x=(x/chart.plotWidth)*ohlc.length;
        var i=0;
       i=Number(Math.ceil(x));
       if(i>=data.length||i<0){
           return;}
       //计算图表x轴
       x=ohlc[i].x;//utc格式时间数据
       y=data[i][1];
       var last_px=data[i][1].toFixed(2);
       var business_amount=data[i][2];
       var avg_price=data[i][3].toFixed(2);
       var zfz=(100*(ohlc[i].y/yesterdayClose-1)).toFixed(2);
       var time=Highcharts.dateFormat('%H:%M ', x);
         //除了第一笔，其它都是  返回的 last_px 与前一个对比
        if(i!=0){
             business_amount=data[i][2]-data[i-1][2];
         }
         $reporting.html(
                 '<div class="detail">'+
                               '<ul>'+
                         '<li class="value-2">'+ '价格:  <span>'+last_px+'</span></li>'+
                         '<li class="value-2">'+ '成交量:  <span>'+business_amount+'</span></li>'+
                                                         '<li class="value-2">'+ '均价:  <span>'+avg_price+'</span></li>'+
                     '<li class="value-2">'+ '涨幅值:  <span>'+zfz+'%</span></li>'+
                     '</ul>'+
                 '</div>'
                 );
         var chart = $(DIVID).highcharts();           // Highcharts构造函数
         chart.xAxis[0].removePlotBand("plotBand-x");
         chart.xAxis[0].addPlotBand({
            borderColor:'red',
            borderWidth:0.1,
            color: 'red',
            from: x-0.000001,//,Date.UTC(2015, 3, 27,10,50),
            to:  x+0.000001,//Date.UTC(2015, 3, 27,10,51),
            label: {
                useHTML:true,
                text: '<span class="value" style="font-size:10px;background-color:rgba(0,0,0,.6); color:#fff; height:15px; line-height:15px; padding:0 5px;">'+time+'</span>',
                textAlign: 'bottom',
                y:5,
                x:-30
            },
            id:'plotBand-x',
            zIndex:1001
         });
         chart.yAxis[0].removePlotBand("plotBand-y0");
         chart.yAxis[0].addPlotBand({
             borderColor:'red',
             borderWidth:0.1,
             color: 'red',
                from: y-0.000001,//,Date.UTC(2015, 3, 27,10,50),
                to:   y+0.000001,//Date.UTC(2015, 3, 27,10,51),
                label: {
                    useHTML:true,
                    style: {         //字体样式
                        font: 'normal 5px Verdana, sans-serif'
                        },
                    text: '<span class="value" style="font-size:10px;background-color:rgba(0,0,0,.6); color:#fff; height:15px; line-height:15px; padding:0 5px;">'+y+'</span>',
                    verticalAlign:'top',
                    textAlign: 'left',
                    x:-25,
                    y:-2
                },
                id:'plotBand-y0',
                zIndex:1001

         });
         chart.yAxis[0].removePlotBand("plotBand-y1");
         chart.yAxis[0].addPlotBand({
             color: '#BEBEBE',
             borderColor:'#BEBEBE',
             borderWidth:0.1,
                from: y-0.000001,//,Date.UTC(2015, 3, 27,10,50),
                to:  y+0.000001,//Date.UTC(2015, 3, 27,10,51),
                label: {
                    useHTML:true,
                    style: {         //字体样式
                        font: 'normal 5px Verdana, sans-serif'
                        },
                    text: '<span class="value" style="font-size:10px;background-color:rgba(0,0,0,.6); color:#fff; height:15px; line-height:15px; padding:0 5px;">'+zfz+"%"+'</span>',
                    textAlign: 'right',
                    verticalAlign:'bottom',
                    x:280,
                    y:-2
                },
                id:'plotBand-y1',
                zIndex:1001
         });
    }
    //document.getElementById("line_map").removeEventListener("touchstart",createKlineChart.kline_touchstart,false);
    document.getElementById("line_map").addEventListener("touchstart", createTrendChart.trend_touchstart);
    //document.getElementById("line_map").removeEventListener("touchmove",createKlineChart.kline_touchmove,false);
    //开始画图
    $(DIVID).highcharts('StockChart', {
         chart:{
             //关闭平移
            panning:false,
            zoomType: 'none',
            pinchType:'none',
             renderTo : "line_map",
            margin: [25, 25,25, 25],
            spacing: [0,0,0,0],
             plotBorderColor: '#3C94C4',
             plotBorderWidth: 0,
            events:{
                load:function(){
                    x=ohlc[data.length-1].x;
                    y=ohlc[data.length-1].y;
                    var chart = $(DIVID).highcharts();       // Highcharts构造函数
                     //基准线
                     chart.yAxis[0].addPlotLine({           //在x轴上增加
                         value:yesterdayClose,              //在值为2的地方
                         width:0.1,                         //标示线的宽度为0.1px
                         color: '#FFA500',                  //标示线的颜色
                         zIndex:1001
                     });
                     chart.xAxis[0].removePlotBand("plotBand-x");
                     chart.xAxis[0].addPlotBand({
                        borderColor:'#BEBEBE',
                        borderWidth:0.1,
                        color: '#BEBEBE',
                        from: ohlc[data.length-1].x-0.000001,//,Date.UTC(2015, 3, 27,10,50),
                        to:  ohlc[data.length-1].x+0.000001,//Date.UTC(2015, 3, 27,10,51),
                        label: {
                            useHTML:true,
                            text: '<span class="value" style="font-size:10px;background-color:rgba(0,0,0,.6); color:#fff; height:15px; line-height:15px; padding:0 5px;">'+Highcharts.dateFormat('%H:%M ', ohlc[data.length-1].x)+'</span>',
                            textAlign: 'top',
                            y:5,
                            x:-30
                        },
                        id:'plotBand-x',
                        zIndex:1001
                     });
                     chart.yAxis[0].removePlotBand("plotBand-y0");
                     chart.yAxis[0].addPlotBand({
                         borderColor:'#BEBEBE',
                         borderWidth:0.1,
                         color: '#BEBEBE',
                            from: ohlc[data.length-1].y-0.0001,//,Date.UTC(2015, 3, 27,10,50),
                            to:  ohlc[data.length-1].y+0.0001,//Date.UTC(2015, 3, 27,10,51),
                            label: {
                                useHTML:true,
                                style: {         //字体样式
                                    font: 'normal 5px Verdana, sans-serif'
                                    },
                                text: '<span class="value" style="font-size:10px;background-color:rgba(0,0,0,.6); color:#fff; height:15px; line-height:15px; padding:0 5px;">'+ohlc[data.length-1].y.toFixed(2)+'</span>',
                                verticalAlign:'top',
                                textAlign: 'left',
                                x:-25,
                                y:-2
                            },
                            id:'plotBand-y0',
                            zIndex:1001
                     });
                     chart.yAxis[0].removePlotBand("plotBand-y1");
                     chart.yAxis[0].addPlotBand({
                         color: '#BEBEBE',
                         borderWidth:0.1,
                         borderColor:'#BEBEBE',
                            from: ohlc[data.length-1].y-0.0001,//,Date.UTC(2015, 3, 27,10,50),
                            to:  ohlc[data.length-1].y+0.0001,//Date.UTC(2015, 3, 27,10,51),
                            label: {
                                useHTML:true,
                                style: {         //字体样式
                                    font: 'normal 5px Verdana, sans-serif'
                                    },
                                text: '<span class="value" style="font-size:10px;background-color:rgba(0,0,0,.6); color:#fff; height:15px; line-height:15px; padding:0 5px;">'+(100*(ohlc[data.length-1].y/yesterdayClose-1)).toFixed(2)+"%"+'</span>',
                                textAlign: 'right',
                                verticalAlign:'bottom',
                                x:280,
                                y:-2
                            },
                            id:'plotBand-y1',
                            zIndex:1001
                     });
                     $reporting.html(
                             '<div class="detail">'+
                             '<ul>'+
                             '<li class="value-2">'+ '价格:  <span>'+data[data.length-1][1].toFixed(2)+'</span></li>'+
                             '<li class="value-2">'+ '成交量:  <span>'+data[data.length-1][2]+'</span></li>'+
                             '<li class="value-2">'+ '均价:  <span>'+data[data.length-1][3].toFixed(2)+'</span></li>'+
                             '<li class="value-2">'+ '涨幅值:  <span>'+(100*(data[data.length-1][3]/yesterdayClose-1)).toFixed(2)+'%</span></li>'+
                             '</ul>'+
                             '</div>'
                     ); 
                }
            }
         },
         tooltip:{
            enabled:false,
            crosshairs:false
         },
        rangeSelector:{
            enabled: false,
        },
         /*导出配置*/
        exporting: {
            enabled: false,
        },
          /*创建者信息*/
        credits: {
            enabled: false,
        },
        /*下部时间拖拉选择*/
        navigator: {
            enabled: false,
            /*关闭时间选择*/
            baseseries: 10
        },
        scrollbar: {
            enabled: false /*关闭下方滚动条*/
        },
        /*底部滚动条*/
        scrollbar: {
            enabled: false
        },
        plotOptions:{
            //去掉分时线上的hover事件
            series:{
                states: {
                    hover: {
                        enabled: false
                    }
                },
            line: {
                marker: {
                    enabled: false
                }
             },
          }
        },
        xAxis:{
            showFirstLabel: true,
            showLastLabel:true,
            scrollbar:{enabled:true},
            labels: {
               // staggerLines:5
                style: {         //字体样式
                    font: 'normal 5px Verdana, sans-serif'
                    },
                formatter:function(){
                    var returnTime=Highcharts.dateFormat('%H:%M ', this.value);
                    if(returnTime=="11:30 "){
                        return "11:30/13:00";
                    }
                    return returnTime;
                },
            },
            tickPositioner:function(){
                var positions=[am_startTimeUTC,am_midTimeUTC,am_lastTimeUTC,pm_midTimeUTC,pm_lastTimeUTC];
                return positions;
            },
             gridLineWidth: 1,
        },
        yAxis: [{
            opposite: false,//是否把它显示到另一边（右边）
            labels: {
                style: {         //字体样式
                    font: 'normal 5px Verdana, sans-serif'
                    },
                     overflow: 'justify',
                align: 'right',
                x: -3,
                y:5,
                formatter:function(){
                    //最新价  px_last/preclose昨收盘-1
                    return (this.value).toFixed(2);
                  }
            },
            title: {
                text: ''
            },
            top:'0%',
            height: '65%',
            lineWidth: 1,
            showFirstLabel: true,
            showLastLabel:true,
            
            tickPositioner:function(){    //以yesterdayClose为界限，统一间隔值，从 最小到最大步进
                positions = [],
                tick = Number((avg_pxyAxisMin)),
                increment = Number(((avg_pxyAxisMax - avg_pxyAxisMin) / 5));
                  var tickMin=Number((avg_pxyAxisMin)),tickMax=Number((avg_pxyAxisMax));
                if(0==data.length){//还没有数据时，yesterdayClose 的幅值 在 -1% - 1%上下浮动
                    tickMin=0.99*yesterdayClose;
                    tickMax=1.01*yesterdayClose;
                }else if(0==increment){//有数据了  但是数据都是一样的幅值
                    if(yesterdayClose>Number(avg_pxyAxisMin)){
                        tickMin=Number(avg_pxyAxisMin);
                        tickMax=2*yesterdayClose-Number(avg_pxyAxisMin);
                    }else if(yesterdayClose<Number(avg_pxyAxisMin)){
                        tickMax=Number(avg_pxyAxisMax);
                        tickMin=yesterdayClose-(Number(avg_pxyAxisMax)-yesterdayClose);
                    }else{
                        tickMin=0.99*yesterdayClose;
                        tickMax=1.01*yesterdayClose;
                    }
                }else if(avg_pxyAxisMin-yesterdayClose<0&&avg_pxyAxisMax-yesterdayClose>0){//最小值在昨日收盘价下面，最大值在昨日收盘价上面
                    var limit=Math.max(Math.abs(avg_pxyAxisMin-yesterdayClose),Math.abs(avg_pxyAxisMax-yesterdayClose));
                    tickMin=yesterdayClose-limit;
                    tickMax=yesterdayClose+limit;
                }else if(avg_pxyAxisMin>yesterdayClose&&avg_pxyAxisMax>yesterdayClose){//最小最大值均在昨日收盘价上面
                    tickMax=avg_pxyAxisMax;
                    tickMin=yesterdayClose-(tickMax-yesterdayClose);
                    
                }else if(avg_pxyAxisMin<yesterdayClose&&avg_pxyAxisMax<yesterdayClose){//最小最大值均在昨日收盘价下面
                    tickMin=avg_pxyAxisMin;
                    tickMax=yesterdayClose+(yesterdayClose-tickMin);
                }
                if(tickMax>2*yesterdayClose){//数据超过100%了
                    tickMax=2*yesterdayClose;
                    tickMin=0;
                }
                var interval=Number(tickMax-yesterdayClose)/10;
                tickMax+=interval;
                tickMin=yesterdayClose-(tickMax-yesterdayClose);
                increment=(tickMax-yesterdayClose)/3;
                tick=tickMin;
                var i=0;
                for (tick;i ++ <7  ; tick += increment) {
                    positions.push(Number(tick));
                    }
                
            return positions;
            },
        },
        {
            opposite: true,//是否把它显示到另一边（右边）
            showFirstLabel: true,
            showLastLabel:true,
            labels: {
                overflow: 'justify',
                style: {         //字体样式
                    font: 'normal 5px Verdana, sans-serif'
                    },
                align: 'right',
                x: 25,
                y:5,
                formatter:function(){//最新价  px_last/preclose昨收盘-1
                    return (100*(this.value/yesterdayClose-1)).toFixed(2)+"%";
                  }
            },
            title: {
                text: ''
            },
            lineWidth: 1,
            top:'0%',
            height: '65%',
            gridLineWidth: 1,
            tickPositioner:function(){
                return positions;
            }
        },
        {
            opposite: false,//是否把它显示到另一边（右边）
            labels: {
                overflow: 'justify',
                style: {         //字体样式
                    font: 'normal 5px Verdana, sans-serif'
                    },
                align: 'right',
                x: -3,
                y:5,
                formatter:function(){
                    if(this.value>1000000000){
                        return Number((this.value/1000000000).toFixed(2))+"G";
                    }else if(this.value>1000000){
                        return Number((this.value/1000000).toFixed(2))+"M";
                    }else if(this.value>1000){
                        return Number((this.value/1000).toFixed(2))+"K";
                    }else{
                        return Number(this.value.toFixed(2));
                    }
                }
            },
            title: {
                text: ''
            },
            top: '70%',
            height: '30%',
            width:'100%',
            offset: 0,
            lineWidth: 1,
            showFirstLabel: true,
            showLastLabel:true,
            tickPositioner:function(){
                var positions = [],
                tickMax=volume_yAxisMax,
                tickMin=volume_yAxisMin,
                tick = 0,
                increment = 0;
                var limit=tickMax/2;
                tickMax+=limit;
                increment=tickMax/2;
                tick=0;
                for (tick; tick  <= tickMax; tick += increment) {
                    positions.push(Number(tick.toFixed(2)));
                    if(increment==0){
                        break;
                    }
                }
                return positions;
            },
        }],
        series : [{
                    name : 'AAPL Stock Price',
                    data : ohlc,
                    type : 'areaspline',
                    tooltip : {
                        valueDecimals : 2
                    },
                    fillColor : {
                        linearGradient : {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops : [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    yAxis:0,
                },
                {
                    name : 'AAPL Stock Price',
                    data : ohlc,
                    type : 'scatter',
                    cursor:'pointer',
                    onSeries : 'candlestick',
                    color:'transparent',
                    tooltip : {
                        valueDecimals : 2
                    },
                    style:{
                           fontSize: '0px',
                           fontWeight: '0',
                           textAlign: 'center'
                       },
                    zIndex:-1000,
                    yAxis:1,
                },
                {
                    type: 'column',
                    name: '成交量',
                    data: volume,
                    dataGrouping: {
                        enabled: false,
                        forced: true
                    },
                    yAxis:2,
                    zIndex:-1000
                }]
    });
}
/**
 * 错误处理
 */
function failCallback(){
    var last_dataTime=new Date();
    var $reporting = $("#report");
    $reporting.html("");
     // Create the chart
    var am_startTime=new Date(last_dataTime);
    am_startTime.setHours(9, 30, 0, 0);
    var am_startTimeUTC=Number(Date.UTC(am_startTime.getFullYear(),am_startTime.getMonth(),am_startTime.getDate(),am_startTime.getHours(),am_startTime.getMinutes()));
    
    var am_midTime=new Date(last_dataTime);
    am_midTime.setHours(10, 30, 0, 0);
    var am_midTimeUTC=Number(Date.UTC(am_midTime.getFullYear(),am_midTime.getMonth(),am_midTime.getDate(),am_midTime.getHours(),am_midTime.getMinutes()));
    
    //股票交易早上最后的时间
    var am_lastTime=new Date(last_dataTime);
    am_lastTime.setHours(11, 30, 0, 0);
    var am_lastTimeUTC=Number(Date.UTC(am_lastTime.getFullYear(),am_lastTime.getMonth(),am_lastTime.getDate(),am_lastTime.getHours(),am_lastTime.getMinutes()));
    //股票交易下午最后的时间
    var pm_startTime=new Date(last_dataTime);
    pm_startTime.setHours(13, 1, 0, 0);
    var pm_startTimeUTC=Number(Date.UTC(pm_startTime.getFullYear(),pm_startTime.getMonth(),pm_startTime.getDate(),pm_startTime.getHours(),pm_startTime.getMinutes()));

    var pm_midTime=new Date(last_dataTime);
    pm_midTime.setHours(14, 0, 0, 0);
    var pm_midTimeUTC=Number(Date.UTC(pm_midTime.getFullYear(),pm_midTime.getMonth(),pm_midTime.getDate(),pm_midTime.getHours(),pm_midTime.getMinutes()));

    
    var pm_lastTime=new Date(last_dataTime);
    pm_lastTime.setHours(15, 0, 0, 0);
    var pm_lastTimeUTC=Number(Date.UTC(pm_lastTime.getFullYear(),pm_lastTime.getMonth(),pm_lastTime.getDate(),pm_lastTime.getHours(),pm_lastTime.getMinutes()));
    var data=[];
    data.push({x:am_startTimeUTC,y:1});
    data.push({x:am_midTimeUTC,y:2});
    data.push({x:am_lastTimeUTC,y:3});
    data.push({x:pm_midTimeUTC,y:4});
    data.push({x:pm_lastTimeUTC,y:5});
    //常量本地化
    Highcharts.setOptions({
        global : {
            useUTC : true
        }
    });
    $(DIVID).highcharts('StockChart', {
         chart:{
             renderTo : "line_map",
             margin: [25, 25,25, 25],
              plotBorderColor: '#3C94C4',
              plotBorderWidth: 0.3,
             // zoomType:false,
         },
         tooltip:{
             enabled:false
        },
        rangeSelector:{
            enabled: false,
        },
         /*导出配置*/
        exporting: {
            enabled: false,
        },
          /*创建者信息*/
        credits: {
            enabled: false,
        },
        /*下部时间拖拉选择*/
        navigator: {
            enabled: false,
            /*关闭时间选择*/
            baseseries: 10
        },
        /*底部滚动条*/
        scrollbar: {
            enabled: false
        },
        plotOptions:{
            //去掉分时线上的hover事件
            series: {
                states: {
                    hover: {
                        enabled: false
                    }
                },
            line: {
                marker: {
                    enabled: false
                }
             },
            },
        },
        xAxis:{
            showFirstLabel: true,
            showLastLabel:true,
             tickInterval: 1,
            labels: {
                style: {         //字体样式
                    font: 'normal 5px Verdana, sans-serif'
                    },
                formatter:function(){
                    var labels=['9:30','10:30','11:30/13:00','14:00','15:00']
                    return labels[this.value];
                },
            },
            categories:['9:30','10:30','11:30/13:00','14:00','15:00'],
            gridLineWidth: 1,
        },
        yAxis: [{
            showFirstLabel: true,
            showLastLabel:true,
            opposite: false,//是否把它显示到另一边（右边）
            labels: {
                align: 'right',
                x: -3,
                y:5
            },
            title: {
                text: ''
            },
            height: '50%',
            lineWidth: 1,
            gridLineWidth: 1,
        },
        {
            showFirstLabel: true,
            showLastLabel:true,
            opposite: false,//是否把它显示到另一边（右边）
            labels: {
                align: 'right',
                x: -3,
                y:5
            },
            title: {
                text: ''
            },
            top: '60%',
            height: '40%',
            offset: 0,
            lineWidth: 1,
            gridLindeWidth:1,
        }],
        series : [{
                    name : 'AAPL Stock Price',
                    data :[10,20,30,40,50],// [["9:30",200],["10:30",205]["11:30/13:00",210],["14:00",215],["15:00",220]],
                    type:'column',
                    color:'transparent',
                    fillColor : {
                        linearGradient : {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops : [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    dataGrouping: {
                        enabled: false,
                        forced: true
                    },
                    yAxis:0,
                },
                {
                    type: 'column',
                    name: '成交量',
                    fillColor : {
                        linearGradient : {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops : [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                        },
                    data : [10,20,30,40,50],//[[0, 15], [10, -50], [20, -56.5], [30, -46.5], [40, -22.1],
                                   //[50, -2.5], [60, -27.7], [70, -55.7], [80, -76.5]],
                    color:'transparent',
                       yAxis: 1,
                    dataGrouping: {
                        enabled: false,
                        forced: true
                    },
                yAxis:1,
                }]
    });
}
/**
 * 获取日期对象，如果isUTC为true获取 日期的UTC对象，false则获取普通日期对象
 * @param date
 * @param isUTC
 * @returns
 */
function getDateUTCOrNot(date,isUTC){
        if(! (date instanceof String))
        {    
            date+="";
        }
        var dArr = new Array();
        for(var hh=0;hh<5;hh++){
            var numb ;
            if(hh==0){
                numb = Number(date.slice(0,4));
            }
            else {
                numb= Number(date.slice((hh-1)*2+4,hh*2+4));
                };
            dArr.push(numb);
        }
        if(isUTC==false){
            return new Date(dArr[0],dArr[1]-1,dArr[2],dArr[3],dArr[4]);
        }
        var dateUTC = Number(Date.UTC(dArr[0],dArr[1]-1,dArr[2],dArr[3],dArr[4]));//得出的UTC时间
        return dateUTC;
}

//数据补全
function appendTimeMessage(ohlc,volume,data){
    var date=data[data.length-1][0]+"";
    var last_dataTime=getDateUTCOrNot(date,false);
    
    //股票交易早上最后的时间
    var am_lastTime=new Date(last_dataTime);
    am_lastTime.setHours(11, 30, 0, 0);
    //股票交易下午最后的时间
    var pm_startTime=new Date(last_dataTime);
    pm_startTime.setHours(13, 1, 0, 0);
    var pm_lastTime=new Date(last_dataTime);
    pm_lastTime.setHours(15, 0, 0, 0);
    //把时间日期格式转化成utc格式
    function convertDateToUTC(date){
        return Number(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes()));
    }
//如果获取的时间11：:30之前的计算
    if(last_dataTime<am_lastTime){
        var i=last_dataTime;
        i.setMinutes((i.getMinutes()+1));
        for(;i<=am_lastTime;i.setMinutes((i.getMinutes()+1)))
        {
            ohlc.push({x:convertDateToUTC(i)});
            volume.push({x:convertDateToUTC(i)});
        }
        i=pm_startTime;
        for(;i<=pm_lastTime;i.setMinutes((i.getMinutes()+1)))
        {
            ohlc.push({x:convertDateToUTC(i)});
            volume.push({x:convertDateToUTC(i)});
        }
    }else if(last_dataTime<pm_lastTime){    //获取的时间下午13:00之后的计算
        var i;
        if(Number(last_dataTime)==Number(am_lastTime)){
            i=pm_startTime;
        }else{
            i=last_dataTime;
        }
        i.setMinutes((i.getMinutes()+1));
        for(;i<=pm_lastTime;i.setMinutes((i.getMinutes()+1)))
        {
            ohlc.push({x:convertDateToUTC(i)});
            volume.push({x:convertDateToUTC(i)});
        }
    }
}