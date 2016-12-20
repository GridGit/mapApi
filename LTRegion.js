/**
 * 操作行政区划
 */
function LTNS(){
	function LTRegionControl(handle){
		this.handle = handle; //加载行政区划的数据后要执行的函数
	}
	//为了在事件处理之中加入参数而使用的回调函数
	LTRegionControl.prototype.getCallback=function(func,args)
	{
		return function()
		{
			func.apply(this,[args]);
		}
	}
	//传入行政区的名称（汉字或拼音）
	LTRegionControl.prototype.setRegion = function(arg){
		var strType = new RegExp('^\d{6}$','ig');
		if(strType.test(arg)){
			this.regionCode = arg;
		}else{
			var placeList=LTPlaceList.getDefault();
			var place = placeList.searchPlace(arg,1)[0];
			this.regionCode = place.getRegionCode();
		}
	}
	//根据行政区划编码生成json数据的存放目录
	LTRegionControl.prototype.getRegionUrl = function(){
		var num = this.regionCode;
		var path = "http://api.51ditu.com/region/json";
		var first = num.substring(0,2);
		var second = num.substring(2,4);
		var third = num.substring(4,6);
		if(second === "00"&& third==="00"){
			path+="/"+first+"/";
		}else if(second!=="00"&&third==="00"){	
			path+="/"+first+"/"+second+"/";
		}else{
			path+="/"+first+"/"+second+"/"+third+"/";
		}
		return path+num+".js";
	}
	//加载json数据文件
	LTRegionControl.prototype.getScript = function(){
		try{
			
			var jsFile= document.createElement("script");
			jsFile.setAttribute("type","text/javascript");
			jsFile.setAttribute("defer","true");
			jsFile.setAttribute("src",this.getRegionUrl());
			
			document.body.insertBefore(jsFile,document.body.firstChild);
		}catch(e){
			return;
		}
		
		return jsFile;
	}
	//得到LTRegion对象数据
	LTRegionControl.prototype.getRegion = function(){
		if((typeof this.handle)==="function"){
			var jsFile = this.getScript();
			this.jsFilet = jsFile;
			var reg = this.regionCode;
			LTEvent.bind(this.jsFilet,"readystatechange",this,this.getCallback(this.RegionChapter,[reg]));
			LTEvent.bind(jsFile,"load",this,this.getCallback(this.onResult,[reg]));
			LTEvent.bind(jsFile,"error",this,LTRegionControl.Error);
		}
	}
	LTRegionControl.Error = function(){
		alert("暂时不支持此域的数据!");
	}
	//适配器
	LTRegionControl.prototype.RegionChapter = function(reg){
		setTimeout(this.getCallback(this.onResult,[reg]),500);
	}
	//json文件加载后执行的程序
	LTRegionControl.prototype.onResult = function(reg){
		if(this.jsFilet && (this.jsFilet.readyState == "loading" || this.jsFilet.readyState=="loaded" || this.jsFilet.readyState=="complete")){
			this.jsFilet.onreadystatechange = null; 
		}
		var regCode = ""+_LT_pl_rg_data.id;
		var argCode = ""+reg;
		if(regCode === argCode){
			this.varible = _LT_pl_rg_data;
			this.handle(new LTRegion(this.varible));
		}else{
			alert("暂时不支持此域的数据");
		} 
		
	}
	function LTRegion(obj){
		this.regionCode = obj.id;
		this.name = LTObjectLoader.decrypt(obj.name);
		this.points = [];
		this.setDetail(obj.points);
		this.configs = new LTRegionConfigs();
	}
	//行政区划参数
	function LTRegionConfigs(){
		return{
			lineColor:"#0064fc",
			lineStroke:"2",
			fillColor:"#99FFCC",
			opacity:"1",
			lineStyle:"Dash"
		};
	}
	//解析json数据，转化成LTPoints数组
	LTRegion.prototype.setDetail = function(pointsA){
		var points = [];
		for(var i = 0;i < pointsA.length; i++){
			var pointsArr = [];
			for(var j = 0; j < pointsA[i].length; j++){
				pointsArr.push(new LTPoint(pointsA[i][j].ln,pointsA[i][j].la));
			}
			points.push(pointsArr);
		}
		this.points = points;
	}
	//得到行政区划名称
	LTRegion.prototype.getName = function(){
		return this.name;
	}
	//得到行政区划的坐标点数组
	LTRegion.prototype.getPoints = function(){
		return this.points;
	}
	//得到行政区划编码
	LTRegion.prototype.getRegionCode = function(){
		return this.regionCode;
	}
	//画面的方法
	LTRegion.prototype.drawPolygon = function(map){
		var points = this.points;
		var all = [];
		if(points.length>0){
			for(var k = 0; k<points.length;k++){
				var polygon = new LTPolygon(points[k]);
				polygon.setLineColor(this.getLineColor());
				polygon.setFillColor(this.getFillColor());
				polygon.setLineStroke(this.getLineStroke());
				polygon.setLineStyle(this.getLineStyle());
				polygon.setOpacity(this.getOpacity());
				map.addOverLay( polygon );
				all = all.concat(points[k]);
			}
			map.getBestMap(all);
		}
	}
	//画线的方法
	LTRegion.prototype.drawPolyLine = function(map){
		var points = this.points;
		var all = [];
		if(points.length>0){
			for(var k = 0; k<points.length;k++){
				var polyline = new LTPolyLine(points[k]);
				polyline.setLineColor(this.getLineColor());
				polyline.setOpacity(this.getOpacity());
				polyline.setLineStroke(this.getLineStroke());
				polyline.setLineStyle(this.getLineStyle());
				map.addOverLay( polyline );
				all = all.concat(points[k]);
			}
			map.getBestMap(all);
		}
	}
	//设置行政区划边界线的颜色
	LTRegion.prototype.setLineColor = function(color){
		this.configs.lineColor = color;
	}
	//得到行政区划边界线的颜色
	LTRegion.prototype.getLineColor = function(){
		return this.configs.lineColor;
	}
	//设置行政区面的颜色
	LTRegion.prototype.setFillColor = function(color){
		this.configs.fillColor = color;
	}
	//得到行政区面的颜色
	LTRegion.prototype.getFillColor = function(){
		return this.configs.fillColor;
	}
	//设置行政区划面的透明度
	LTRegion.prototype.setOpacity = function(opacity){
		this.configs.opacity = opacity;
	}
	//得到行政区划面的透明度
	LTRegion.prototype.getOpacity = function(){
		return this.configs.opacity;
	}
	//设置行政区划的边框宽度
	LTRegion.prototype.setLineStroke = function(weight){
		this.configs.lineStroke = weight;
	}
	//获得行政区划的边框宽度
	LTRegion.prototype.getLineStroke = function(){
		return this.configs.lineStroke;
	}
	LTRegion.prototype.setLineStyle = function(style){
		this.configs.lineStyle = style;
	}
	LTRegion.prototype.getLineStyle = function(){
		return this.configs.lineStyle;
	}
	window.LTRegionControl = LTRegionControl;
	window.LTRegionConfigs = LTRegionConfigs;
	window.LTRegion = LTRegion;
}
LTNS();