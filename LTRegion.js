/**
 * ������������
 */
function LTNS(){
	function LTRegionControl(handle){
		this.handle = handle; //�����������������ݺ�Ҫִ�еĺ���
	}
	//Ϊ�����¼�����֮�м��������ʹ�õĻص�����
	LTRegionControl.prototype.getCallback=function(func,args)
	{
		return function()
		{
			func.apply(this,[args]);
		}
	}
	//���������������ƣ����ֻ�ƴ����
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
	//��������������������json���ݵĴ��Ŀ¼
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
	//����json�����ļ�
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
	//�õ�LTRegion��������
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
		alert("��ʱ��֧�ִ��������!");
	}
	//������
	LTRegionControl.prototype.RegionChapter = function(reg){
		setTimeout(this.getCallback(this.onResult,[reg]),500);
	}
	//json�ļ����غ�ִ�еĳ���
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
			alert("��ʱ��֧�ִ��������");
		} 
		
	}
	function LTRegion(obj){
		this.regionCode = obj.id;
		this.name = LTObjectLoader.decrypt(obj.name);
		this.points = [];
		this.setDetail(obj.points);
		this.configs = new LTRegionConfigs();
	}
	//������������
	function LTRegionConfigs(){
		return{
			lineColor:"#0064fc",
			lineStroke:"2",
			fillColor:"#99FFCC",
			opacity:"1",
			lineStyle:"Dash"
		};
	}
	//����json���ݣ�ת����LTPoints����
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
	//�õ�������������
	LTRegion.prototype.getName = function(){
		return this.name;
	}
	//�õ��������������������
	LTRegion.prototype.getPoints = function(){
		return this.points;
	}
	//�õ�������������
	LTRegion.prototype.getRegionCode = function(){
		return this.regionCode;
	}
	//����ķ���
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
	//���ߵķ���
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
	//�������������߽��ߵ���ɫ
	LTRegion.prototype.setLineColor = function(color){
		this.configs.lineColor = color;
	}
	//�õ����������߽��ߵ���ɫ
	LTRegion.prototype.getLineColor = function(){
		return this.configs.lineColor;
	}
	//���������������ɫ
	LTRegion.prototype.setFillColor = function(color){
		this.configs.fillColor = color;
	}
	//�õ������������ɫ
	LTRegion.prototype.getFillColor = function(){
		return this.configs.fillColor;
	}
	//���������������͸����
	LTRegion.prototype.setOpacity = function(opacity){
		this.configs.opacity = opacity;
	}
	//�õ������������͸����
	LTRegion.prototype.getOpacity = function(){
		return this.configs.opacity;
	}
	//�������������ı߿���
	LTRegion.prototype.setLineStroke = function(weight){
		this.configs.lineStroke = weight;
	}
	//������������ı߿���
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