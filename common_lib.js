
/**
 * ################
 * @author cjl
 * @version 1.0
 * @info js公共调用函数
 * @create 2015-03-26
 * ################
 */
/*document.write('<script type="text/javascript" src="../getToken"></script>');*/
document.write('<script type="text/javascript" src="https://light.hs.net/auth.json?callback=getTokenStr"></script>');
//全局定时器变量
var timer;

//全局token字串获取
var jres_token;
function getTokenStr(json_token){
	jres_token = json_token.access_token;
}
var js_lib = {





	/**
	 * 配置初始化，获取渠道号
	 */
	getChannelCustomerNo : function () {

		if(null != chnl_str && "" != chnl_str){
			return chnl_str;
		}else{
			return "html5zh";
		}
	},

	/**
	 * 初始化模块配置
	 * @param callback
	 */
	initView : function (callback) {
		this.ajax("property.json",callback,"get");
		this.shieldFunction();
		this.changeMenuName();
	},

	/**
	 * @param url： ajax请求数据的URL地址
	 * @param callback： ajax完毕的回调函数
	 * @param method： 数据获取类型
	 * @param data： ajax请求最终数据
	 * @param beforesend： 请求前操作
	 * @info 原生态JS请求AJAX
	 * @description AJAX运行机制需要四步：
	 * 1，创建XMLHttpRequest对象 2，调用xmlHttp.open()设置请求内容 3，设置回调函数（根据服务器返回的状态信息，do sth） 4，调用xmlHttp.send()发送请求
	 */
	ajax : function(url, callback, method, data,callback2,beforesend) {
		var method = method ? method : "get";
		var data = data ? data : "";
		if (!data) {
			var url = url;
		} else {
			var url = (method == "get") ? (url + "?" + data) : url;
		}

		url = this.setUrlStampVersion(url);

		/**
		 * @info 为兼容IE非IE浏览器
		 */
		var http = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");


		/**
		 * xmlHttp.open(请求方式,请求地址,[是否为异步请求]);
		 * post传值需放在send方法中，格式为key=value，多值用逗号隔开
		 *
		 */
		var doGet = function() {
			http.onreadystatechange = function() {
				if (http.readyState == 4 && http.status == 200) {
					if(callback !=  null){
						callback(http.responseText);
						http = null;
					}
				}else if(http.readyState == 4 && http.status == 400){
					if(callback2 !=  null){
						callback2(http.responseText);
						http = null;
					}
				}
			};
			http.open(method, url, true);
			beforesend && beforesend();
			http.send(data);
		};

		var doPost = function() {
			http.onreadystatechange = function() {
				if (http.readyState == 4 && http.status == 200) {
					if(callback != null){
						callback(http.responseText);
						http = null;
					}
				}else if(http.readyState == 4 && http.status == 400){
					if(callback2 !=  null){
						callback2(http.responseText);
						http = null;
					}
				}
			};
			http.open(method, url, true);
			http.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			beforesend && beforesend();
			http.send(data);

		};
		if (method == "post") {
			doPost();
		} else {
			doGet();
		}
	},

	timestamp : function () {
		return '_v='+new Date().getTime()+''+Math.floor(Math.random()*9999+1000);
	},


	/**
	 * 设置随机参数，防止缓存
	 * @param url
	 * @returns
	 */
	setUrlStampVersion : function (url){
		url = url.replace(/(^\s+)|(\s+$)/g,"");
		if(url.indexOf("_v=") == -1){
			if(url.indexOf("?") != -1){
				if(null != jres_token && "undefined" != jres_token && "" != jres_token){
					url = url+"&access_token=" + jres_token + "&" +this.timestamp();
				}else{
					url = url+"&"+this.timestamp();
				}
			}else{
				if(null != jres_token && "undefined" != jres_token && "" != jres_token){
					url = url+"?"+"access_token=" + jres_token + "&"+this.timestamp();
				}else{
					url = url+"?"+this.timestamp();
				}
			};
		}
		return url;
	},
	/**
	 * 解码且替换标题
	 * @param val
	 */
	decode : function(val){
		var title_name = decodeURI(val);
		document.getElementById("title_name").innerHTML=title_name;
	},
	endecode : function(val){

	},
	/**
	 *  移除loading 效果
	 */
	completeLoading : function() {
		var loadingMask = document.getElementById('loadingDiv');
		loadingMask.parentNode.removeChild(loadingMask);
	},

	/**
	 * 给dom元素新增css样式。
	 * @param obj
	 * @param itsClass
	 */
	addClass : function(obj, itsClass) {
		if(obj!=null){
			if (obj.className.toString() == "") { //若没有设置class
				obj.className = itsClass;
			} else if (obj.className.indexOf(itsClass) < 0) {
				obj.className += " " + itsClass;
			}
		}


	},
	/**
	 * 给dom元素删除css样式
	 * @param obj
	 * @param clsName
	 */
	removeClass : function(obj, clsName) {
		var re = new RegExp("\s*" + clsName, "g");
		obj.className = obj.className.replace(re, "");
	},

	/**
	 * 将数字保留后两位小数
	 * @param val
	 */
	mathRound2 : function (val){
		return Math.round(val*100)/100;
	},
	/**
	 * 将数字保留后3位小数
	 * @param val
	 */
	mathRound3 : function (val){
		return Math.round(val*1000)/1000;
	},

	/**
	 *获取URL中的参数。
	 *location.search是从当前URL的?号开始的字符串
	 */
	getRequestParams : function() {

		var url = location.search; //获取url中"?"符后的字串

		var theRequest = new Object();
		if (url.indexOf("?") != -1) {
			var str = url.substr(1);
			if (str.indexOf("&") != -1) {
				strs = str.split("&");
				for ( var i = 0; i < strs.length; i++) {
					theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
				}
			} else {
				theRequest[str.split("=")[0]] = unescape(str.split("=")[1]);
			}
		}
		return theRequest;
	},

	/**
	 * 判断是否为空
	 * @param variable1
	 * @returns {Boolean}
	 */
	isEmpty : function(variable1) {
		var result = false;

		if (variable1 == null || variable1 == undefined || variable1 == '') {
			result = true;
		}
		return result;
	},
	/**
	 * js触发点击跳转页面
	 * @param url
	 */
	forwordUrlback : function(url){
		window.location.href = url+"?prod="+prod_str+"&chnl="+chnl_str+"&user_impType="+user_impType_str+"&openid="+openid_str;
	},
	/**
	 * 将object 转成 map 数据长度方法
	 * @param jsonObj
	 * @returns {Map}
	 */
	getJsonFields : function(jsonObj) {
		var fields = new Array();
		var fieldsMap = {};
		var obj = jsonObj.toString();
		fields = obj.split(",");
		for ( var j = 0; j < fields.length; j++) {
			fieldsMap[fields[j]] = j;
		}
		return fieldsMap;
	},

	/**
	 * html页面间传参，根据参数名字取值
	 * @param name
	 * @returns
	 */
	getQueryStringByName : function (name){
		var result = location.search.match(new RegExp("[\?\&]" + name+ "=([^\&]+)","i"));
		if(result == null || result.length < 1){
			return "";
		}
		return result[1];
	},

	/**
	 * 获取资金流信息
	 */
	getCommonFoundUrl : function(){
		return "https://open.hs.net/quote/v1/fundflow";
	},

	/**
	 * 获取itn_h6_api 详情url地址
	 */
	getCommonRealUrl : function (){
		return "https://open.hs.net/quote/v1/real";
	},

	/**
	 * 获取提醒数据（生产环境）
	 * @returns {string}
	 */
	getRemindUrl : function(){
		return "https://tuc.hsmdb.com/noc/zixun_chaxun";
	},

	/**
	 * 获取itn_h6_api 排序url地址
	 */
	getCommonSortUrl : function (){
		return "https://open.hs.net/quote/v1/sort";
	},

	/**
	 * 获取个股新闻数据URL
	 * @returns {String}
	 */
	getCommonNewsUrl : function (){
		return "https://open.hs.net/info/v2/news";
	},
	/**
	 * 自选股的URL
	 * @returns {String}
	 */
	getSelfStockUrl : function(){
		return "https://tuc.hsmdb.com/uc/tucfs";
	},

	/**
	 * 键盘精灵URL
	 * @returns {String}
	 */
	getWizardUrl:function(){
		return "https://open.hs.net/quote/v1/wizard";
	},
	/**
	 * 获取模块排序URl
	 * @returns {String}
	 */
	getBlockUrl : function (){
		return "https://open.hs.net/quote/v1/block/sort";
	},

	/**
	 * 获取静默注册url
	 * @returns {String}
	 */
	getRegistUrl : function (){
		return "https://tuc.hsmdb.com/uc/mRegister";
	},

	/**
	 *
	 * 获取k线查询URL
	 */
	getkLineUrl:function(){
		return "https://open.hs.net/quote/v1/kline";
	},
	/**
	 *
	 * 获取分时查询URL
	 */
	getTrendUrl:function(){
		return "https://open.hs.net/quote/v1/trend";
	},
	/**
	 * 获取资讯公用查询URL
	 */
	getCommonQueryUrl : function (){
		return "https://open.hs.net/info/v2/query";
	},

	/**
	 *获取美股的url
	 * @returns {String}
	 */
	getCommonUSUrl : function (){
		return "https://open.hs.net/quote/v1/block/sort";
	},
	/**
	 * 格式化日期
	 * @param date
	 * @param format
	 */
	getFormatDate : function (date,format){
		var paddNum = function(num){
			num += "";
			return num.replace(/^(\d)$/,"0$1");
		};

		//指定格式字符
		var cfg = {
			yyyy : date.getFullYear() //年 : 4位
			,yy : date.getFullYear().toString().substring(2)//年 : 2位
			,M  : date.getMonth() + 1  //月 : 如果1位的时候不补0
			,MM : paddNum(date.getMonth() + 1) //月 : 如果1位的时候补0
			,d  : date.getDate()   //日 : 如果1位的时候不补0
			,dd : paddNum(date.getDate())//日 : 如果1位的时候补0
			,hh : date.getHours()  //时
			,mm : date.getMinutes() //分
			,ss : date.getSeconds() //秒
		};
		format || (format = "yyyy-MM-dd hh:mm:ss");
		return format.replace(/([a-z])(\1)*/ig,function(m){return cfg[m];});
	},

	/**
	 * @info 下滑加载数据事件
	 * param callback 加载事件触发时的操作
	 * param tips 提示信息处理
	 */
	scrollLoader : function(callback,tips){
		var isLoading = false;
		window.onscroll = function (ev) {
			if(isLoading) return;
			var visiable_h = document.body.clientHeight;
			var top = document.body.scrollTop;
			var total_h = document.body.scrollHeight;
			//当窗口可视区域+可视区域到文档顶部的距离 >= 整个文档的高度
			if (visiable_h  + top >= total_h - 5) {
				isLoading = true;
				if(tips)tips.start();
				setTimeout(function(){
					if(tips){
						tips.finish(callback);
					}else{
						callback();
					}
					isLoading = false;
				}, 1000);
			};
		};
	},
	/**
	 * 替换原有的block
	 * @param val block的类型
	 * @param val1 市场类型
	 * @param val2 blockid
	 * @param val3 原有的bockid
	 */
	replaceBlock : function (val,val1,val2,val3){
		var block_type = val;
		var block_name = "";
		var marker_type = val1;
		var html = "";
		if(block_type == "turnover_ratio"){
			block_name = "换手率榜";


		}else if(block_type == "vol_ratio"){
			block_name = "量比榜";
		}
		html = 	'<header class="frameTitle-gray clearfix">'+
		'<h6 class="name cm-left">'+block_name+'</h6>'+
		'<a href="../list/listDetail.html?en_hq_type_code='+marker_type+'&sort_field_name='+block_type+'&data_count=10'+
		'&sort_type=1&fields=last_px,preclose_px,prod_name" class="more cm-right"><i class="icon-type icon-more"></i></a>'+
		'</header>'+
		'<ul class="listLine-white listLateral" id="'+val3+'">'+
		'</ul>';
		document.getElementById(val2).innerHTML=html;
	},

	/**
	 * 这个是屏蔽微信 右边功能键
	 */
	shieldFunction : function(){
		document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
			WeixinJSBridge.call('hideOptionMenu');
		});
	},
	/**
	 * 跳转到个股
	 * @param val
	 * @returns
	 */
	forwordStockComposite : function(val){
		window.location.href = "../stock/stocks_composite.html?stock_code="+val+"&prod="+prod_str+"&chnl="+chnl_str+"&user_impType="+user_impType_str+"&openid="+openid_str;
	},

	/**
	 * 热门行业跳转链接
	 * @param url
	 */
	forwordListTopPage : function(url,val){
		window.location.href = url + "?stock_type="+val+"&prod="+prod_str+"&chnl="+chnl_str+"&user_impType="+user_impType_str+"&openid="+openid_str;
	},
	/**
	 * 链接到listStock.html
	 * @param val 行业代码
	 */
	forwordListStock : function(val,val2){
		var val_str = val.split(",");
		if(val_str[1] !=null && val_str[1] != ""){
			window.location.href = "../list/listStock.html?stock_type="+val_str[0]+"&sort_type="+val_str[1]+"&prod="+prod_str+"&chnl="+chnl_str+"&user_impType="+user_impType_str+"&openid="+openid_str+"&title_name="+val2;
		}else{
			window.location.href = "../list/listStock.html?stock_type="+val_str[0]+"&prod="+prod_str+"&chnl="+chnl_str+"&user_impType="+user_impType_str+"&openid="+openid_str+"&title_name="+val2;
		}
	},
	/**
	 * 链接到listDetail。html
	 * @param val 参数字符串
	 * @param val1 市场类型
	 * @param val2 从接口获取数据的参数
	 */
	forwordUrl : function(val,val1,val2){
		var temp_str = val.split(",");
		if(temp_str[4] != null && temp_str[4] != ""){
			window.location.href = "../list/listDetail.html?en_hq_type_code="+val1+"&sort_field_name="+temp_str[0]+"&data_count="+temp_str[1]+"&sort_type="+temp_str[2]+"&special_marker="+temp_str[4]+"&fields="+val2+"&prod="+prod_str+"&chnl="+chnl_str+"&user_impType="+user_impType_str+"&openid="+openid_str+"&title_name="+temp_str[3];
		}else{
			window.location.href = "../list/listDetail.html?en_hq_type_code="+val1+"&sort_field_name="+temp_str[0]+"&data_count="+temp_str[1]+"&sort_type="+temp_str[2]+"&fields="+val2+"&prod="+prod_str+"&chnl="+chnl_str+"&user_impType="+user_impType_str+"&openid="+openid_str+"&title_name="+temp_str[3];
		}
	},
	/**
	 * 列表的伸缩
	 * @param val 按钮ID
	 * @param val 列表ID
	 */
	hiddenOrShow : function(val,val1){
		var dom1 = document.getElementById(val);
		var dom2 = document.getElementById(val1);
		if(dom2.style.display == 'none'){
			this.removeClass(dom1,"icon-xsArrow icon-xsArrowUp");
			this.addClass(dom1,"icon-xsArrow icon-xsArrowDown");
		}else{
			this.removeClass(dom1,"icon-xsArrow icon-xsArrowDown");
			this.addClass(dom1,"icon-xsArrow icon-xsArrowUp");
		}
		dom2.style.display = (dom2.style.display=='none'?'block':'none');
	},
	/**
	 * 自动更新  页面定时刷新请求数据
	 * 沪深每日下午3点停盘，港股3点后停止刷新。
	 * 港股和沪港通是下午4点停盘，4点后停止刷新。
	 * 所有股市都是早上9:30点半开盘，所以9点开始刷新
	 * @param callback
	 */
	refreshGetData : function(callback,refresh_rate,flag,type){
		if(null != callback && "undefined" != callback && "" != callback){
			if(null != flag && true == flag){
				callback();
				var dateTimeHours = new Date().getHours();
				if("main" == type){
					if( dateTimeHours >= 9  &&  dateTimeHours < 15){
						timer = window.setInterval(callback,parseInt(refresh_rate));
					}
				}else{
					if(dateTimeHours >= 9 && dateTimeHours < 16){
						timer = window.setInterval(callback,parseInt(refresh_rate));
					}
				}
			}else{
				window.clearInterval(timer);
			}
		}
	},

	/**
	 * 功能描述：此方法用于东北证券交易名称显示为持仓
	 * 在初始化交易时调用
	 */
	changeMenuName : function(){
		var chnl_str = this.getQueryStringByName("chnl");
		if(chnl_str !='undefined' && chnl_str != null && chnl_str =='html5zhdbzq'){
			if(document.getElementById("main_price_tradeName")){
				document.getElementById("main_price_tradeName").innerText='持仓';
			}
		}
	},

    /**
     * H5页面加回退事件
     */
    goBackUrl:function(){
       var chnlStr=this.getChannelCustomerNo();
       if(chnlStr=='htm5dxyzf'){
           App.overrideBackPressed(true);
           App.setKeyEventListener(function (event) {
               if (event == 'backpress') {
                   history.back();
               }
           });
       }
    }
};


var _$Url = location.href;
if (_$Url.indexOf("main-price.html") > -1) {
	localStorage.setItem("returnUrl","../price/main-price.html");
} else if (_$Url.indexOf("hk-price.html") > -1) {
	localStorage.setItem("returnUrl","../price/hk-price.html");
} else if (_$Url.indexOf("hgt-price.html") > -1) {
	localStorage.setItem("returnUrl","../price/hgt-price.html");
} else if (_$Url.indexOf("us-price.html") > -1) {
	localStorage.setItem("returnUrl","../price/us-price.html");
} else if (_$Url.indexOf("zxg_list.html") > -1) {
	localStorage.setItem("returnUrl","../zxg/zxg_list.html");
}

/**
 * prod_str  产品类型
 * chnl_str 渠道号
 * user_impType_str 设备类型（pc|android|ios|weixin）
 * openid_str 微信唯一标识
 * jmUserID 静默注册的userid
 */
var prod_str = js_lib.getQueryStringByName("prod");
var chnl_str = js_lib.getQueryStringByName("chnl");
var user_impType_str = js_lib.getQueryStringByName("user_impType");
var openid_str = js_lib.getQueryStringByName("openid");
var jmUserID ;
//window.onload = js_lib.getTokenStr();
window.onload = js_lib.initView(setValue);


/**
 * 静默注册，返回json字符串   其中error_no 代表返回号码
 */
function getCommonUserID(){
	//根据不同的页面    来判断是否请求静默注册
	var url = window.location.href;
	//对自选股页面  股票搜索页面   还有个股综评页面自行静默注册  因为需要查询自选股     ajax异步请求导致先后问题
	if(url.indexOf("zxg_list.html")==-1 && url.indexOf("zxg_search.html")==-1 && url.indexOf("stocks_composite.html")==-1){
		//开始静默注册操作
		var params = "tuc_regt=silent_reg&prod="+prod_str+"&channel="+chnl_str+"&uid="+openid_str+"&uidtype=openuuid";
		js_lib.ajax(js_lib.getRegistUrl(), returnCommonStr, 'get', params);
	}
}

/**
 * trade_buyurl  交易买入的URL
 * trade_sellurl 交易卖出的URL
 * trade_wxurl 交易首页
 */
var trade_buyurl,trade_sellurl,trade_wxurl,forward_buyurl,forward_sellurl;
function setValue(val){
	var jsonText = JSON.parse(val);

	//=======================动态皮肤================================//
	var customer_code = jsonText.customer_arr.channel_customer[0][js_lib.getChannelCustomerNo()][0];//根据渠道号得到模板号
	var skinCfg = jsonText.customer_arr.customer_name_arr[0][customer_code][0]["skinCfg"];//根据模板号得到对应模板中的配置参数(css皮肤)
	skinColorChange(skinCfg);//动态使用皮肤配置
	document.body.style.display="block";

	trade_buyurl = jsonText.customer_arr.customer_name_arr[0][customer_code][0].trade_buyurl;
	trade_sellurl = jsonText.customer_arr.customer_name_arr[0][customer_code][0].trade_sellurl;
	trade_wxurl = jsonText.customer_arr.customer_name_arr[0][customer_code][0].trade_wxurl;

	if(jsonText.customer_arr.customer_name_arr[0][customer_code][0].top_buyurl){
		forward_buyurl = jsonText.customer_arr.customer_name_arr[0][customer_code][0].top_buyurl;
		forward_sellurl = jsonText.customer_arr.customer_name_arr[0][customer_code][0].top_sellurl;
	}else{
		forward_buyurl = 'window.location.href = trade_buyurl+"?STOCK_CODE="+code+"&prod="+prod+ "&chnl="+chnl+"&user_impType="+user_impType+"&openid="+openid+"&way=buy"';
		forward_sellurl = 'window.location.href = trade_sellurl+"?STOCK_CODE="+code+"&prod="+prod+ "&chnl="+chnl+"&user_impType="+user_impType+"&openid="+openid+"&way=sell"';
	}
	getCommonUserID();
}

/**
 * 功能描述：此js是动态的使用皮肤
 * @param skinCfg
 */
function skinColorChange(skinCfg){
	var content = new Array();
	var rstObj = document.getElementById("footer-importCss");
	if(rstObj != undefined && rstObj!=null && rstObj !=""){
		document.getElementById("footer-importCss").innerHTML="";
	}
	if(skinCfg != undefined && skinCfg != null && skinCfg != ""){
		//使用配置中的css皮肤
		content[0] = "<link rel=\"stylesheet\" type=\"text/css\" href=\"../css/"+skinCfg+"/global.css\"/>";
		content[1] = "<link rel=\"stylesheet\" type=\"text/css\" href=\"../css/"+skinCfg+"/layout.css\"/>";
		content[2] = "<link rel=\"stylesheet\" type=\"text/css\" href=\"../css/"+skinCfg+"/mystyle.css\"/>";
	}else{
		//使用默认的css皮肤
		content[0] = "<link rel=\"stylesheet\" type=\"text/css\" href=\"../css/global.css\"/>";
		content[1] = "<link rel=\"stylesheet\" type=\"text/css\" href=\"../css/layout.css\"/>";
		content[2] = "<link rel=\"stylesheet\" type=\"text/css\" href=\"../css/mystyle.css\"/>";
	}
	if(rstObj != undefined && rstObj!=null && rstObj !="") {
		document.getElementById("footer-importCss").innerHTML = content.join("");
	}
}


/**
 * 开启页面数据刷新
 * @returns {String}
 */
function openRefreshDataDoor (callback,refresh_rate, flag) {
	js_lib.refreshGetData(callback, refresh_rate, flag);
}

/**
 * 关闭页面数据刷新
 */
function closeRefreshDataDoor () {
	window.clearInterval(timer);
}

/**
 * js触发点击跳转页面
 * @param url
 */
function zxgReturnUrl(url){
	window.location.href = url+"?prod="+prod_str+"&chnl="+chnl_str+"&user_impType="+user_impType_str+"&openid="+openid_str;
}

/**
 * 跳转到微信登陆页面
 * @param url
 */
function zxgReturnWXLogin(){
	if(trade_wxurl.indexOf("?") > -1){
		window.location.href = trade_wxurl;
	}else{
		window.location.href = trade_wxurl + '?prod='+prod_str+'&chnl='+chnl_str+'&user_impType='+user_impType_str+'&openid='+openid_str;
	}

}

/**
 * 跳转到买入页面
 * @param code
 */
function forwardBuy(code,prod,chnl,user_impType,openid){
	eval(forward_buyurl);
	//window.location.href = trade_buyurl+"?STOCK_CODE="+code+"&prod="+prod+ "&chnl="+chnl+"&user_impType="+user_impType+"&openid="+openid+"&way=buy";
}

/**
 * 跳转到卖出页面
 * @param code
 */
function forwardSell(code,prod,chnl,user_impType,openid){
	eval(forward_sellurl);
	//window.location.href = trade_sellurl+"?STOCK_CODE="+code+"&prod="+prod+ "&chnl="+chnl+"&user_impType="+user_impType+"&openid="+openid+"&way=sell";
}

/**
 * 屏蔽屏蔽右上角的菜单
 */
document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
	WeixinJSBridge.call('hideOptionMenu');
});
/**
 * 根据静默注册接口返回的参数 0|XXX（成功）  或者是 1|xxx（失败）   进行判断静默注册是否成功
 * @param val
 */
function returnCommonStr(val){
	var userid_str = JSON.parse(val);
	if("0" == userid_str.error_no){
		//静默注册成功
		jmUserID = userid_str.user_id;
	}else {
		//静默注册失败
	}
}
