var myCharts2 = (function () {
    var _map = {};
    /*
     * map为一个映射对象，
     * 用于将输入的英文字符转化为
     * 要在图中的图例上显示的其他字符
     */
    function setMap(map) {
        _map = map;
    }

    // 获取三个图表的基本框架
    // 即简单设置一下该图所需的基本内容
    function getXBarOption(title) {
        option = {
            title: {
                text: title,
                left: 100,
                show: true
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: []
            },
            yAxis: {
                type: 'value',
                splitNumber: 4
            },
            legend: {
                data: [],
            },
            series: [],
        };
        return option;
    }

    function getYBarOption(title) {
        var option = {
            title: {
                text: title,
                left: 30,
                textStyle: {
                    fontWeight: "normal",
                    fontSize: 20
                }
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: [],
                selectedMode: "single",
            },
            grid: {
                left: 120
            },
            yAxis: {
                type: "category",
                data: []
            },
            xAxis: {
                type: "value",
                data: []
            },
            series: []
        }
        return option;
    }

    function getPieOption(title, semiCircle) {
        semiCircle = semiCircle || false;
        //  饼图
        var option = {
            title: {
                text: title,
                left: "center"
            },
            legend: {
                data: [],
                orient: "vertical",
                left: 0,
            },
            tooltip: {
                trigger: 'item'
            },
            series: [{}]
        };

        // 是否为半圆
        if (semiCircle == true) {
            option.series = [
                {
                    type: 'pie',
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: "center"
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: 20,
                                fontWeight: 'bold'
                            }
                        }
                    },
                    center: ['50%', '60%'],
                    radius: ['40%', '70%'],
                    data: []
                }
            ]
        } else {
            option.series = [
                {
                    type: 'pie',
                    avoidLabelOverlap: true,
                    label: {
                        normal: {
                            show: true,
                            position: "left"
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: 20,
                                fontWeight: 'bold'
                            }
                        }
                    },
                    center: ['50%', '60%'],
                    data: []
                }
            ]
        }
        return option;
    }

    // 分别设置各个图表数据
    /*
     * X轴数据格式如下：
     *
     * xdata = {
     *  name1: [1, 1, 186, 1823, 3528, 4576, 4770, 399],
     *  name2: [1, 1, 186, 1823, 3528, 4576, 4770, 399],
     * };
     * name的映射值将自动成为图例的名称
     */
    function setXBarData(option, datas) {
        var data = [];
        var serieses = [];
        for (var key in datas) {  // 获取各系列数据名
            data.push({name: _map[key], icon: 'circle'});
            serieses.push({
                name: _map[key],
                type: 'bar',
                data: datas[key],
            })
        }
        option.legend = {}
        option.legend.data = data;
        option.series = serieses;
        return option;
    }

    /*
     * YData = {
     *   dataname : 'data1',
     *   names : ['a', 'b, 'c', d'],
     *   values : [369.00, 399.00, 478.00, 495.00],
     * }
     * 由于一般Y轴都只显示一个图例以进行比较，
     * 而且Y轴的数据不能随着图例的变化而变化，
     * 因此需要先设置整个图表所显示的所有图例，
     * 用 setYBarLegends() 方法，
     * 当触发图例切换事件时，便通过指定的url从服务器获取数据，重置X、Y轴数据，达到数据的动态显示
     * dataname 作为对应的图例
     * names 将作为Y轴的数据，
     * values 作为X轴数据，
     * */
    function setYBarData(option, datas) {
        option.yAxis = {
            data: datas.names,
        };
        option.series = [{
            name: _map[datas.dataname],
            type: 'bar',
            data: datas.values
        }];
        return option;
    }

    /*
    * * 若Y轴的legned为单选，则需指定legends
    * 指定当前Y轴图表的图例，
    * legends = ['a', 'b', 'c'], 指定每个图例名称
    * urls  = {
    *   a : 'www.example.com/get/data1',
    *   b : 'www.example.com/get/data2',
    *   c : 'www.example.com/get/data3'
    * }  指定每个图例名称对应的数据
    * visualMaps = {
    *   a : {
    *     colors : ['#aaa', '#bbb', '#ccc],  // colors 指定每个阶段图表中数据对应显示的颜色
    *     values : [0, 100, 1000],  // 指定数据段， 0-100, 100-1000, 1000-infinity
    *   }
    *   ...  // 余下省略
    * }
    */
    function setYBarLegends(chart, legends, urls, visualMaps) {
        if (chart.getOption().legend[0].selectedMode != 'single') {
            console.log("setYBarLegends : selectedMode need to be single!");
            return null;
        }
        serieses = [];
        mapped_legends = [];
        for (var index in legends) {
            serieses.push({
                type: 'bar',
                name: _map[legends[index]],
            })
            mapped_legends.push(_map[legends[index]]);
        }
        option = {
            legend: {
                data: mapped_legends,
            },
            series: serieses,
        }
        if (urls != null) {
            chart.on("legendselectchanged", function (param) {
                var cur_url = urls[_map[param.name]];
                var cur_visualMap = visualMaps[_map[param.name]];
                $.ajax({
                    method: 'get',
                    url: cur_url,
                    type: 'json',
                    success: function (data) {
                        myCharts2.setData(chart, data, cur_visualMap);
                    },
                    error: function () {
                        console.log("legendselectchanged : Fetch data error!");
                    }
                })
            })
        }
        chart.setOption(option);
    }

    /*
    * 设置Pie图的数据
    * pieData = [
    *   {name : 'a', value : 100},
    *   {name : 'b', value : 1000},
    * ]
    * name 表示该数据的名称，
    * value 表示该数据的值
    * */
    function setPieData(option, datas) {
        var legend = {data: []};
        for (var key in datas) {  // 获取各系列数据名
            legend.data.push({name: datas[key].name, icon: 'circle'});
        }
        option.legend = legend;
        option.series = {data: datas};
        return option;
    }

    /*
    * 数据设置分发函数
    * 该函数会根据传入的chart参数，
    * 通过获取其中的option中的xAxis参数来判断为哪一种图，
    * 然后进行数据的设置
    * vsiualMap 为可选参数，用于对当前的数据进行视觉映射
    */
    function setData(chart, datas, visualMap) {
        var option = {};
        var xAxis = chart.getOption().xAxis;  // 分析图的类型
        if (xAxis == null) {   // 饼图
            option = setPieData(option, datas);
        } else if (xAxis[0].type == 'category') {   // 以X轴为基础的图(柱状图和折线图)
            option = setXBarData(option, datas);
            if (visualMap != null) {
                option = setContinuousVisualMap(xAxis[0].type, option, visualMap.colors, Math.min.apply(null, visualMap.values), Math.max.apply(null, visualMap.values));
            }
        } else {  // 以Y轴为基础的图
            option = setYBarData(option, datas);
            if (visualMap != null) {
                option = setContinuousVisualMap(xAxis[0].type, option, visualMap.colors, Math.min.apply(null, visualMap.values), Math.max.apply(null, visualMap.values));
            }
        }
        chart.setOption(option);
    }

    /*
    * 设置图例单选模式
    * mode = 'single' 或 'multiple'
    * 可以选择设置切换时的回调函数,
    * 由于有回调函数设置在chart上，因此必须在初始化完成后设置
    */
    function setSelectedMode(chart, mode, callback) {
        mode = mode || 'muliple';
        if (mode == 'single') {
            var option = {
                legend: {
                    selectedMode: 'single',
                }
            }
        } else {
            var option = {
                legend: {
                    selectedMode: 'multiple',
                }
            }
        }
        chart.setOption(option);
        chart.on('legendselectchanged', callback);
    }

    /*
    * 设置原始工具箱
    * needmagiType 声明了是否需要添加折线图、堆积图等图形转换工具栏
    */
    function setPrimeTools(option, needmagicType) {
        needmagicType = needmagicType || false;
        option.toolbox = {};
        option.toolbox = {
            show: true,
            feature: {
                saveAsImage: {},
                restore: {},
                dataView: {}
            }
        }
        if (needmagicType) {
            option.toolbox.feature.magicType = {
                type: ['bar', 'line', 'stack', 'tiled'],
            }
        }
        return option;
    }

    /*
    * 设置自定义工具箱
    * myToolbox格式为:
    * myToolbox = {
    *   myTools1 = {      // 自定义工具栏变量必须以 my 开头
    *     myEnergy: {
    *         show: true,         // 是否显示工具栏 可选
    *         title: '总耗能',    // 工具栏显示的标题
    *         icon: 'image://http://localhost:8080/imgs/p1.png', // 工具栏图标的位置
    *         onclick: function () {   // 点击工具栏后调用的回调函数
    *             alert("a tool box");
    *         }
    *     },
    *  },
    *  myTools2 = {...}
    * }
    */
    function setNewTools(chart, myToolbox) {
        option = {
            toolbox: {
                show: true,
                feature: myToolbox
            }
        }
        try {
            chart.setOption(option);
        } catch (err) {
            console.log("addNewTools : setOption error");
        }
    }

    // 设置X轴坐标，默认为12个月
    // xData = ['a', 'b', 'c'];  // xData 坐标轴
    function setXAxis(option, xData) {
        var months = [];
        for (var i = 1; i < 13; ++i) {
            months.push(i + "月");
        }
        xData = xData || months;
        option.xAxis.data = xData;
        return option;
    }

    /* 通过视觉映射数据来改变预警颜色，
    * 只能在数据设置完成之后设置视觉映射，
    * 因为它是将已有的数据进行映射且不会随着数据的变化而改变映射,
    */

    /* 分段映射, 为每个分区指定一个颜色，并对该区间内的数据赋予该颜色
    * type : 传入option.xAxis[0].type  即坐标轴的类型，以此来判断映射第几维的数据
    * option : 需要改变的 option
    * colors : 需要映射的颜色列表 ['#aaa', '#bbb', '#ccc']
    * values : 需要映射的区间列表 [ 0, 100, 1000, 10000]
    */
    function setPiecewiseVisualMap(type, option, colors, values) {
        var pieces = [];
        var lastValue = 0;
        var curValue = 0;
        for (var index in values) {
            if (index == 0) {
                continue;
            }
            curValue = values[index];
            pieces.push({
                min: lastValue,
                max: curValue
            });
            lastValue = curValue;
        }
        pieces.push({
            min: lastValue,
        });

        option.visualMap = {
            show: true,
            type: 'piecewise',
            pieces: pieces,
            inRange: {
                color: colors
            }
        }
        if (type == 'category') {
            option.visualMap.dimension = 1;
        } else {
            option.visualMap.dimension = 0;
        }
        return option;
    }

    // datas = {values : {}, colors : {}};
    /* 连续映射，即映射的颜色是 连续 的，即为每个值赋予在给定颜色列表中变化的颜色
     * type : 传入option.xAxis[0].type  即坐标轴的类型，以此来判断映射第几维的数据
     * option : 需要改变的 option
     * colors : 需要映射的颜色列表 ['#aaa', '#bbb', '#ccc']
     * minVal : 需要映射的值的最小值
     * maxVal : 需要映射的值的最大值
     * visible : 设置颜色对照表的可见性
     */
    function setContinuousVisualMap(type, option, colors, minVal, maxVal, visible) {
        visible = visible || false;
        option.visualMap = {
            show: visible,
            min: minVal,
            max: maxVal,
            inRange: {
                color: colors
            }
        }
        if (type == 'category') {
            option.visualMap.dimension = 1;
        } else {
            option.visualMap.dimension = 0;
        }
        return option;
    }

    // 根据已有的函数合成的指定X轴图表
    function getXBar(dom, title) {
        var chart = echarts.init(dom);         // 初始化dom
        var option = getXBarOption(title);     // 获取X轴基本结构
        option = setPrimeTools(option, true);  // 设置echart自带的工具箱，（带有magicType）
        option = setXAxis(option);              // 设置X轴为默认的12月份
        chart.setOption(option);                // 将option设置到echart图表中
        // setSelectedMode(chart, 'single');
        return chart;
    }

    function getYBar(dom, title) {
        var chart = echarts.init(dom);
        var option = getYBarOption(title);
        option = setPrimeTools(option, false);
        chart.setOption(option);
        setSelectedMode(chart, 'single');
        return chart;
    }

    function getPie(dom, title, semiCircle) {
        var chart = echarts.init(dom);
        var option = getPieOption(title, semiCircle);
        option = setPrimeTools(option, false);
        chart.setOption(option);
        return chart;
    }

    return {
        setMap: setMap,
        getXBar: getXBar,
        getYBar: getYBar,
        setData: setData,
        getPie: getPie,
        setYBarLegends: setYBarLegends,
        setVisualMap: setContinuousVisualMap,
        setNewTools: setNewTools,
    }

})();