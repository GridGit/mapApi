function LTNS()
{
	//	bounds	类型是LTBounds,代表画圆的位置和大小
	//	color	线条颜色
	//	bgcolor	背景颜色
	//	weight	线条宽度
	//	opacity	不透明度 0-1
	//  linestyle 线的样式
	//  cursorstyle 鼠标放上时的样式
	//  create  创建圆对象，vml或svg
	//	type	circle表示画圆，ellipse表示画椭圆
	//	centerPoint	圆心经纬度
	//	radius	圆半径
	//  distanceType 圆半径的单位，米：meter,像素：pixel，经纬度：point，默认值meter
	function LTEllipse(bounds,color,bgcolor,weight,opacity,linestyle,cursorstyle,create,type,centerPoint,radius,distanceType)
	{
		this.bounds=(bounds || bounds=="")?bounds:"";
		this.type = type?type:"ellipse";
		this.centerPoint = centerPoint?centerPoint:"";
		this.radius = radius?radius:(radius==0)?radius:"1000";
		this.distanceUnits = distanceType?distanceType:"meter";	//圆半径的单位，米：meter,像素：pixel，经纬度：point，默认值meter
		
		this.color=(color || color=="")?color:"blue";
		this.bgcolor=(bgcolor || bgcolor=="")?bgcolor:"#99FFCC";
		this.weight=weight?parseInt(weight):3;
		this.opacity=opacity?opacity:0.5;
		this.lineStyle = linestyle?linestyle:"solid";
		this.cursorStyle = cursorstyle?cursorstyle:"";
		this.strokeLinecap = "round";
		this.strokeLinejoin = "round";
		this.strokeDasharray = "none";
		if(create){this.create=create;}
		this.create();
		this.setLineStroke(this.weight);
		this.setLineColor(this.color);
		this.setOpacity(this.opacity);
		this.setFillColor(this.bgcolor);
		this.setLineStyle(this.lineStyle);
		LTFunction.setZIndex(this.div,420);
		
		this.eventClick = null;
		this.eventMouseover = null;
		this.eventMouseout = null;
		this.eventMousedown = null;
		this.eventMouseup = null;
	}
	LTEllipse.prototype.create=function()
	{
		if(LTBrowserInfo.isIE())
		{
			this.namespaceArr = ["oval","stroke","fill"];
			LTFunction.loadVmlNamespace(this.namespaceArr);
			this.div=document.createElement("v:oval");
			this.div.unselectable="on";
			this.div.filled=true;
			this.stroke=document.createElement("v:stroke");
			this.div.appendChild(this.stroke);
			this.fill=document.createElement("v:fill");
			this.div.appendChild(this.fill);
		}
		else
		{
			this.div=LTFunction.createDiv(0);
			this.svgNS = "http://www.w3.org/2000/svg";
			this.svg = document.createElementNS(this.svgNS, "svg");
			this.ellipseSVG = document.createElementNS(this.svgNS, "ellipse");
			this.svg.appendChild(this.ellipseSVG);
			this.div.appendChild(this.svg);
		}
		this.div.style.position="absolute";
	}
	LTEllipse.prototype.onMouseOver=function(e)
	{
		//var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"mouseover",[this.eventReturnJson()]);
	}
	LTEllipse.prototype.onMouseOut=function(e)
	{
		//var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"mouseout",[this.eventReturnJson()]);
	}
	LTEllipse.prototype.onClick=function(e)
	{
		//var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"click",[this.eventReturnJson(),LTFunction.getEventButton(e)]);
	}
	
	LTEllipse.prototype.onMouseDown = function(e){
		//var point = LTFunction.getEventPosition(e, this.map.container);
		LTEvent.trigger(this, "mousedown", [this.eventReturnJson(), LTFunction.getEventButton(e)]);
	}
	
	LTEllipse.prototype.onMouseUp=function(e)
	{
		//var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"mouseup",[this.eventReturnJson(),LTFunction.getEventButton(e)]);
	}
	
	//用户注册事件触发后返回一个JSON数据
	LTEllipse.prototype.eventReturnJson=function()
	{
		if(this.type == "ellipse"){
			return this.bounds;
		}
		var radiusMeter = this.radius;
		if(this.distanceUnits == "point")
		{
			radiusMeter = LTFunction.getPointsDistance(this.centerPoint,this.radius);
		}else if(this.distanceUnits == "pixel"){
			var zoomUnits = this.map.getCurrentZoom();
			radiusMeter = this.map.getZoomUnits(zoomUnits)*this.radius;
		}
		var point = this.centerPoint;
		var jsonStr = "{lo:"+point.getLongitude()+",la:"+point.getLatitude()+",radius:"+radiusMeter+"}";
		return eval('('+jsonStr+')');
	}
	
	LTEllipse.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		this.added=true;
	}
	LTEllipse.prototype.setCircleBounds = function()
	{
		if(this.radius == 0 || this.radius == "0"){return;}
		var zoom=this.map.getCurrentZoom();
		var units=this.map.getZoomUnits(zoom);
		var centerXY = this.map.getPixelCoord(this.centerPoint);
		//获得 半径所对应的真实像素距离
		if(this.distanceUnits == "meter")
		{
			var radiusPixel = this.getPixelRadius(this.centerPoint,this.radius);
		}
		else if(this.distanceUnits == "point")
		{
			var radiusPixel = this.getPixelRadius(this.centerPoint,LTFunction.getPointsDistance(this.centerPoint,this.radius));
		}
		else
		{
			var radiusPixel = parseInt(this.radius);
		}
		
		//获得左下角像素坐标和右上角像素坐标
		var leftup = [(centerXY[0]-radiusPixel),(centerXY[1]-radiusPixel)];
		var rightdown = [(centerXY[0]+radiusPixel),(centerXY[1]+radiusPixel)];
		var leftdown = [leftup[0],rightdown[1]];
		var rightup = [rightdown[0],leftup[1]];

		//将左下角和右上角像素坐标转换成经纬度
		var min = this.map.getPointLatLng(leftdown);
		var max = this.map.getPointLatLng(rightup);
		this.bounds = new LTBounds(min.getLongitude(),min.getLatitude(),max.getLongitude(),max.getLatitude());
	}
	//获得圆所在矩形实际对应的经纬度范围，以弧度计划
	LTEllipse.prototype.getCircleBounds = function(center,radius){
		var center = new LTPoint(center.getLongitude()/100000,center.getLatitude()/100000);
		var radius = radius;
		var bounds = null;
		var cLat = center.getLatitude();
		if (center) {
			if (radius <= 0) {
				bounds = new LTBounds(center.getLongitude()*100000,center.getLatitude()*100000,center.getLongitude()*100000,center.getLatitude()*100000);
			}
			else {
				var EARTH_RADIUS = 6371004;	//地球的平均半径6371.004千米,赤道半径6378.140千米,极地6356.755千米
				var param = radius / EARTH_RADIUS;
				var delta = param * 180 / Math.PI;
				var maxLat = cLat + delta;
				var minLat = cLat - delta;
				var left = Math.cos(cLat * Math.PI / 180);
				delta = Math.asin(param / 2 / left) * 360 / Math.PI;
				var maxLng = center.getLongitude() + delta;
				var minLng = center.getLongitude() - delta;
				bounds = new LTBounds(minLng*100000, minLat*100000, maxLng*100000, maxLat*100000);
			}
		}
		return bounds
	}
	//获得圆半径实际对应的像素距离，以弧度计划
    LTEllipse.prototype.getPixelRadius = function(center,radius)
    {
        var EARTH_RADIUS=6371004;	//地球的平均半径6371.004千米,赤道半径6378.140千米,极地6356.755千米
        var delta=Math.sin(radius/EARTH_RADIUS/2)/(Math.PI/180);
        var center=center;
        var lat=center.getLatitude()/100000+delta;
		//获得结束点经纬度所对应的像素坐标
		var up = new LTPoint(center.getLongitude(),lat*100000);
		var radiusPixel=this.map.getPixelCoord(up);
		//获得中心点经纬度所对应的像素坐标
		var c = new LTPoint(center.getLongitude(),center.getLatitude());
        var centerPixel=this.map.getPixelCoord(c);
        var dx=centerPixel[0]-radiusPixel[0];
        var dy=centerPixel[1]-radiusPixel[1];
        return dy*2;
    }
	LTEllipse.prototype.reDraw=function(flag)
	{
		//如果不是必须重绘，则不重绘，大部分的标注都不需要每次重绘
		if(!flag){return;}
		//画圆，由圆心和半径换算出圆所在的正方区域
		if(this.type == "circle"){
			this.setCircleBounds();
		}
		
		var point_min = new LTPointMercator(this.bounds.Xmin,this.bounds.Ymin);
		var point_max = new LTPointMercator(this.bounds.Xmax,this.bounds.Ymax);
		
		var l = point_min.getLongitude();
		var b = point_max.getLatitude();
		var r = point_max.getLongitude();
		var t = point_min.getLatitude();
		
		//转NTU
		var point_leftup_m = new LTPointWGS84(l,b);
		var point_rightdown_m = new LTPointWGS84(r,t);
		var lb=this.map.getOverLayPosition(new LTPoint(point_leftup_m.getLongitude(),point_leftup_m.getLatitude()));//取得范围bounds左上角的坐标
		var rt=this.map.getOverLayPosition(new LTPoint(point_rightdown_m.getLongitude(),point_rightdown_m.getLatitude()));//取得范围bounds右下角坐标
		
		this.draw(lb,rt);
	}
	LTEllipse.prototype.draw=function(lb,rt)
	{
		if(LTBrowserInfo.isIE())
		{
			this.setLineStroke(this.weight);
			this.setLineColor(this.color);
			this.setOpacity(this.opacity);
			this.setFillColor(this.bgcolor);
			this.setLineStyle(this.lineStyle);
			this.setCursor(this.cursorStyle);
			LTFunction.setPosition(this.div,lb);
			LTFunction.setSize(this.div,[rt[0]-lb[0],rt[1]-lb[1]]);
			
			if(!this.eventClick || !this.eventMouseover || !this.eventMouseout || !this.eventMousedown || !this.eventMouseup)
			{
				this.eventClick = LTEvent.bind(this.div,"click",this,this.onClick);
				this.eventMouseover = LTEvent.bind(this.div,"mouseover",this,this.onMouseOver);
				this.eventMouseout = LTEvent.bind(this.div,"mouseout",this,this.onMouseOut);
				this.eventMousedown = LTEvent.bind(this.div,"mousedown",this,this.onMouseDown);
				this.eventMouseup = LTEvent.bind(this.div,"mouseup",this,this.onMouseUp);
			}
		}
		else
		{
			this.ellipseSVG.setAttribute("cx",Math.ceil((rt[0]-lb[0])/2+this.weight/2));
			this.ellipseSVG.setAttribute("cy",Math.ceil((rt[1]-lb[1])/2+this.weight/2));
			this.ellipseSVG.setAttribute("rx",((rt[0]-lb[0])-(rt[0]-lb[0])/2));
			this.ellipseSVG.setAttribute("ry",((rt[1]-lb[1])-(rt[1]-lb[1])/2));
			this.ellipseSVG.setAttribute("stroke-width", this.weight);
			this.ellipseSVG.setAttribute("stroke", this.color);
			this.ellipseSVG.setAttribute("stroke-opacity", this.opacity);
			this.ellipseSVG.setAttribute("fill", this.bgcolor);
			this.ellipseSVG.setAttribute("fill-opacity", this.opacity);
			this.ellipseSVG.setAttribute("stroke-linecap", this.strokeLinecap);
			this.ellipseSVG.setAttribute("stroke-linejoin", this.strokeLinejoin);
			this.ellipseSVG.setAttribute("stroke-dasharray", this.strokeDasharray);
			this.ellipseSVG.style.cursor = this.cursorStyle;
			LTFunction.setPosition(this.div,[lb[0]-Math.round(this.weight/2),lb[1]-Math.round(this.weight/2)]);
			LTFunction.setSize(this.div,[rt[0]-lb[0]+this.weight+1,rt[1]-lb[1]+this.weight+1]);
			if(!this.eventClick || !this.eventMouseover || !this.eventMouseout || !this.eventMousedown || !this.eventMouseup)
			{
				this.eventClick = LTEvent.bind(this.ellipseSVG,"click",this,this.onClick);
				this.eventMouseover = LTEvent.bind(this.ellipseSVG,"mouseover",this,this.onMouseOver);
				this.eventMouseout = LTEvent.bind(this.ellipseSVG,"mouseout",this,this.onMouseOut);
				this.eventMousedown = LTEvent.bind(this.ellipseSVG,"mousedown",this,this.onMouseDown);
				this.eventMouseup = LTEvent.bind(this.ellipseSVG,"mouseup",this,this.onMouseUp);
			}
		}
	}
	LTEllipse.prototype.getObject=function(){return this.div;}
	LTEllipse.prototype.remove=function()
	{
		this.map=null;
	}
	LTEllipse.prototype.depose=function()
	{
		if(this.graphics)
		{
			this.graphics.clear(); 
			this.graphics=null;
		}
		LTEvent.deposeNode(this.div);
		this.div=null;
		this.bounds=null;
	}
	LTEllipse.prototype.getBounds=function()
	{
		return this.bounds;
	}
	LTEllipse.prototype.setBounds=function(bounds,type)
	{
		this.bounds=bounds;
		if(this.map)
		{
			this.reDraw(true);
		}
	}
	LTEllipse.prototype.setCircle=function(center,radius)
	{
		this.centerPoint = center
		this.radius = radius;
		this.distanceUnits = "meter";
		if(this.map)
		{
			this.reDraw(true);
		}
	}
	//为画圆时使用，改变半径大小，从而改变圆大小,num(单位m)
	LTEllipse.prototype.setRadius=function(num,type)
	{
		this.distanceUnits = type?type:"meter";
		this.radius=num;
		if(this.map)
		{
			this.reDraw(true);
		}
	}
	LTEllipse.prototype.setCursor=function(cur)
	{
		this.cursorStyle = cur;
		if(LTBrowserInfo.isIE())
		{
			this.div.style.cursor=this.cursorStyle;
		}
		else
		{
			if (this.type == "circle")
			{
				this.circleSVG.style.cursor = this.cursorStyle;
			}
			else
			{
				this.ellipseSVG.style.cursor = this.cursorStyle;
			}
		}
	}
	
	LTEllipse.prototype.getXmax = function()
	{
		return this.bounds.getXmax();
	}
	LTEllipse.prototype.getYmax = function()
	{
		return this.bounds.getYmax();
	}
	LTEllipse.prototype.getXmin = function()
	{
		return this.bounds.getXmin();
	}
	LTEllipse.prototype.getYmin = function()
	{
		return this.bounds.getYmin();
	}
	
	LTEllipse.prototype.getCenterPoint=function()
	{
		return this.centerPoint;
	}
	
	LTEllipse.prototype.getRadius=function()
	{
		var radius_temp = this.radius; 
		if(this.distanceUnits == "point")
		{
			radius_temp = LTFunction.getPointsDistance(this.centerPoint,this.radius);
		}else if(this.distanceUnits == "pixel"){
			var zoomUnits = this.map.getCurrentZoom();
			radius_temp = this.map.getZoomUnits(zoomUnits)*this.radius;
		}
		return radius_temp;
	}
	
	LTEllipse.prototype.getLineColor=function()
	{
		return this.color;
	}
	LTEllipse.prototype.getFillColor=function()
	{
		return this.bgcolor;
	}
	LTEllipse.prototype.getOpacity=function()
	{
		return this.opacity;
	}
	LTEllipse.prototype.getLineStroke=function()
	{
		return this.weight;
	}
	LTEllipse.prototype.getLineStyle=function(style)
	{
		return this.lineStyle;
	}
	LTEllipse.prototype.setLineColor=function(color)
	{
		this.color=color;
		if(LTBrowserInfo.isIE())
		{
			if(this.color=="transparent" || this.color=="")
			{
				this.div.stroked=false;
			}
			else
			{
				if(this.weight!=0||this.weight!="0"){
					this.div.stroked=true;
					this.div.strokecolor=this.color;
				}
			}
		}
		else
		{
			if(color=="block")
			{
				this.color = "#000000";
			}
			this.ellipseSVG.setAttribute("stroke", this.color);
		}
	}
	LTEllipse.prototype.setFillColor=function(bgcolor)
	{
		this.bgcolor=bgcolor;
		if(LTBrowserInfo.isIE())
		{
			if(this.bgcolor=="transparent" || this.bgcolor=="")
			{
				this.div.filled=true;
				this.div.fillcolor="";
				this.fill.opacity=0;
			}
			else
			{
				this.div.filled=true;
				this.div.fillcolor=this.bgcolor;
			}
		}
		else
		{
			if(bgcolor==""){
				if(this.ellipseSVG.hasAttribute("fill")){
					this.ellipseSVG.removeAttribute("fill");
				}
				this.ellipseSVG.setAttribute("fill-opacity", 0);
			}
		}
	}
	
	//设置椭圆透明度
	LTEllipse.prototype.setOpacity=function(opacity)
	{
		this.opacity=opacity;
		if(LTBrowserInfo.isIE())
		{
			this.stroke.opacity=this.opacity;
			this.fill.opacity=this.opacity;
		}
		else
		{
			if(!this.ellipseSVG.hasAttribute("fill") || this.ellipseSVG.getAttribute("fill")==""){
				this.ellipseSVG.setAttribute("stroke-opacity", this.opacity);
				this.ellipseSVG.setAttribute("fill-opacity", 0);
			}else{
				this.ellipseSVG.setAttribute("stroke-opacity", this.opacity);
				this.ellipseSVG.setAttribute("fill-opacity", this.opacity);
			}
		}
	}
	LTEllipse.prototype.setLineStroke=function(weight)
	{
		this.weight=parseInt(weight);
		if(LTBrowserInfo.isIE())
		{
			if(this.weight=="0" || this.weight==0)
			{
				this.div.stroked = false;
				this.div.strokeweight=this.weight+"px";
			}
			else
			{
				this.div.strokeweight=this.weight+"px";
			}
		}
		else
		{
			this.ellipseSVG.setAttribute("stroke-width", this.weight);
			//防止用户先调用setLineStyle后再调用setLineStroke时，线的样式会改变的情况
			this.strokeLinecap = "none";
			this.strokeLinejoin = "none";
			if(this.lineStyle == "Dot")	//设置线的样式为点线
			{
				//用逗号分割，为了兼容3.5-4.0之间的火狐版本
				this.strokeDasharray = (this.weight*1)+","+(this.weight*3)+","+(this.weight*1)+","+(this.weight*3);
			}
			else if(this.lineStyle == "Dash")	//设置线的样式为折线
			{
				this.strokeDasharray = (this.weight*4+1)+","+(this.weight*3)+","+(this.weight*4+1)+","+(this.weight*3);
			}
			else
			{
				this.strokeLinecap = "round";
				this.strokeLinejoin = "round";
				this.strokeDasharray = "none";
			}
			this.ellipseSVG.setAttribute("stroke-linecap", this.strokeLinecap);
			this.ellipseSVG.setAttribute("stroke-linejoin", this.strokeLinejoin);
			this.ellipseSVG.setAttribute("stroke-dasharray", this.strokeDasharray);
		}
	}
	LTEllipse.prototype.setLineStyle=function(style)
	{
		if(!style){return;}
		this.lineStyle=style;
		if(LTBrowserInfo.isIE())
		{
			this.stroke.dashstyle=style;
		}else{
			this.strokeLinecap = "none";
			this.strokeLinejoin = "none";
			if(style == "Dot")	//设置线的样式为点线
			{
				/*换算规律
					边框粗度为1时，IE下VML的值4 2，火狐下SVG的值1 3 1 3
					边框粗度为2时，IE下VML的值5 5，火狐下SVG的值2 6 2 6
					边框粗度为3时，IE下VML的值6 8，火狐下SVG的值3 9 3 9
					边框粗度为4时，IE下VML的值7 11，火狐下SVG的值4 12 4 12
					边框粗度为5时，IE下VML的值5 14，火狐下SVG的值5 15 5 15
				*/
				//用逗号分割，为了兼容3.5-4.0之间的火狐版本
				this.strokeDasharray = (this.weight*1)+","+(this.weight*3)+","+(this.weight*1)+","+(this.weight*3);
			}
			else if(style == "Dash")	//设置线的样式为折线
			{
				/*换算规律
					边框粗度为1时，IE下VML的值7 2，火狐下SVG的值4,3,4,3
					边框粗度为2时，IE下VML的值11 5，火狐下SVG的值9,6,9,6
					边框粗度为3时，IE下VML的值15 8，火狐下SVG的值13,9,13,9
					边框粗度为4时，IE下VML的值18 11，火狐下SVG的值17 12 17 12
					边框粗度为5时，IE下VML的值22 15，火狐下SVG的值21 15 21 15
				*/
				this.strokeDasharray = (this.weight*4+1)+","+(this.weight*3)+","+(this.weight*4+1)+","+(this.weight*3);
			}
			else
			{
				this.strokeLinecap = "round";
				this.strokeLinejoin = "round";
				this.strokeDasharray = "none";
			}
			this.ellipseSVG.setAttribute("stroke-linecap", this.strokeLinecap);
			this.ellipseSVG.setAttribute("stroke-linejoin", this.strokeLinejoin);
			this.ellipseSVG.setAttribute("stroke-dasharray", this.strokeDasharray);
		}
	}
	
	/**
	 * <p>Description: API画圆接口类LTCircle</p>
	 * @param center	圆的中心点坐标
	 * @param radius	圆的半径，单位为米。
	 * @param color		线条颜色
	 * @param bgcolor	背景颜色
	 * @param weight	线条宽度
	 * @param opacity	部透明度 0-1
	 * @author huangbin
	 * @version 1.0 2011-5-23
	 */
	function LTCircle(center,radius,type,color,bgcolor,weight,opacity,linestyle,cursorstyle)
	{
		this.center = center?center:null;
		this.linestyle = linestyle?linestyle:null;
		this.cursorstyle = cursorstyle?cursorstyle:null;
		var overlay=new LTEllipse("",color,bgcolor,weight,opacity,this.linestyle,this.cursorstyle,LTCircle.create,"circle",center,radius,type);
		return overlay;
	}
	LTCircle.create=function()
	{
		this.draw=LTCircle.draw;
		this.setLineColor=LTCircle.setLineColor;
		this.setFillColor=LTCircle.setFillColor;
		this.setOpacity=LTCircle.setOpacity;
		this.setLineStroke=LTCircle.setLineStroke;
		this.setLineStyle=LTCircle.setLineStyle;
		if(LTBrowserInfo.isIE())
		{
			this.namespaceArr = ["oval","stroke","fill"];
			LTFunction.loadVmlNamespace(this.namespaceArr);
			this.div=document.createElement("v:oval");
			this.div.unselectable="on";
			this.div.filled=true;
			this.stroke=document.createElement("v:stroke");
			this.div.appendChild(this.stroke);
			this.fill=document.createElement("v:fill");
			this.div.appendChild(this.fill);
		}
		else
		{
			this.div=LTFunction.createDiv(0);
			this.svgNS = "http://www.w3.org/2000/svg";
			this.svg = document.createElementNS(this.svgNS, "svg");
			this.circleSVG = document.createElementNS(this.svgNS, "circle");
			this.svg.appendChild(this.circleSVG);
			this.div.appendChild(this.svg);
		}
		this.div.style.position="absolute";
	}
	LTCircle.draw=function(lb,rt)
	{
		if(LTBrowserInfo.isIE())
		{
			this.setLineStroke(this.weight);
			this.setLineColor(this.color);
			this.setOpacity(this.opacity);
			this.setFillColor(this.bgcolor);
			this.setLineStyle(this.lineStyle);
			this.setCursor(this.cursorStyle);
			LTFunction.setPosition(this.div,lb);
			LTFunction.setSize(this.div,[rt[0]-lb[0],rt[1]-lb[1]]);
			if (!this.eventClick || !this.eventMouseover || !this.eventMouseout || !this.eventMousedown || !this.eventMouseup) {
				this.eventClick = LTEvent.bind(this.div, "click", this, this.onClick);
				this.eventMouseover = LTEvent.bind(this.div, "mouseover", this, this.onMouseOver);
				this.eventMouseout = LTEvent.bind(this.div, "mouseout", this, this.onMouseOut);
				this.eventMousedown = LTEvent.bind(this.div,"mousedown",this,this.onMouseDown);
				this.eventMouseup = LTEvent.bind(this.div,"mouseup",this,this.onMouseUp);
			}
		}
		else
		{
			this.circleSVG.setAttribute("cx",Math.ceil((rt[0]-lb[0])/2+this.weight/2));
			this.circleSVG.setAttribute("cy",Math.ceil((rt[1]-lb[1])/2+this.weight/2));
			this.circleSVG.setAttribute("r",((rt[0]-lb[0])-(rt[0]-lb[0])/2));
			this.circleSVG.setAttribute("stroke-width", this.weight);
			this.circleSVG.setAttribute("stroke", this.color);
			this.circleSVG.setAttribute("stroke-opacity", this.opacity);
			this.circleSVG.setAttribute("fill", this.bgcolor);
			this.circleSVG.setAttribute("fill-opacity", this.opacity);
			this.circleSVG.setAttribute("stroke-linecap", this.strokeLinecap);
			this.circleSVG.setAttribute("stroke-linejoin", this.strokeLinejoin);
			this.circleSVG.setAttribute("stroke-dasharray", this.strokeDasharray);
			this.circleSVG.style.cursor = this.cursorStyle;
			LTFunction.setPosition(this.div,[lb[0]-Math.round(this.weight/2),lb[1]-Math.round(this.weight/2)]);
			LTFunction.setSize(this.div,[rt[0]-lb[0]+this.weight+1,rt[1]-lb[1]+this.weight+1]);
			if(!this.eventClick || !this.eventMouseover || !this.eventMouseout || !this.eventMousedown || !this.eventMouseup)
			{
				this.eventClick = LTEvent.bind(this.circleSVG,"click",this,this.onClick);
				this.eventMouseover = LTEvent.bind(this.circleSVG,"mouseover",this,this.onMouseOver);
				this.eventMouseout = LTEvent.bind(this.circleSVG,"mouseout",this,this.onMouseOut);
				this.eventMousedown = LTEvent.bind(this.circleSVG,"mousedown",this,this.onMouseDown);
				this.eventMouseup = LTEvent.bind(this.circleSVG,"mouseup",this,this.onMouseUp);
			}
		}
	}
	LTCircle.setLineColor=function(color)
	{
		this.color=color;
		if(LTBrowserInfo.isIE())
		{
			if(this.color=="transparent" || this.color=="")
			{
				this.div.stroked=false;
			}
			else
			{
				this.div.stroked=true;
				this.div.strokecolor=this.color;
			}
		}
		else
		{
			if(color=="block")
			{
				this.color = "#000000";
			}
			this.circleSVG.setAttribute("stroke", this.color);
		}
	}
	LTCircle.setFillColor=function(bgcolor)
	{
		this.bgcolor=bgcolor;
		if(LTBrowserInfo.isIE())
		{
			if(this.bgcolor=="transparent" || this.bgcolor=="")
			{
				this.div.filled=true;
				this.div.fillcolor="";
				this.fill.opacity=0;
			}
			else
			{
				this.div.filled=true;
				this.div.fillcolor=this.bgcolor;
			}
		}
		else
		{
			if(bgcolor==""){
				if(this.circleSVG.hasAttribute("fill")){
					this.circleSVG.removeAttribute("fill");
				}
				this.circleSVG.setAttribute("fill-opacity", 0);
			}
		}
	}
	//设置椭圆透明度
	LTCircle.setOpacity=function(opacity)
	{
		this.opacity=opacity;
		if(LTBrowserInfo.isIE())
		{
			this.stroke.opacity=this.opacity;
			this.fill.opacity=this.opacity;
		}
		else
		{
			if(!this.circleSVG.hasAttribute("fill") || this.circleSVG.getAttribute("fill")==""){
				this.circleSVG.setAttribute("stroke-opacity", this.opacity);
				this.circleSVG.setAttribute("fill-opacity", 0);
			}else{
				this.circleSVG.setAttribute("stroke-opacity", this.opacity);
				this.circleSVG.setAttribute("fill-opacity", this.opacity);
			}
		}
	}
	LTCircle.setLineStroke=function(weight)
	{
		this.weight=parseInt(weight);
		if(LTBrowserInfo.isIE())
		{
			this.div.strokeweight=this.weight+"px";
		}
		else
		{
			this.circleSVG.setAttribute("stroke-width", this.weight);
			//防止用户先调用setLineStyle后再调用setLineStroke时，线的样式会改变的情况
			this.strokeLinecap = "none";
			this.strokeLinejoin = "none";
			if(this.lineStyle == "Dot")	//设置线的样式为点线
			{
				//用逗号分割，为了兼容3.5-4.0之间的火狐版本
				this.strokeDasharray = (this.weight*1)+","+(this.weight*3)+","+(this.weight*1)+","+(this.weight*3);
			}
			else if(this.lineStyle == "Dash")	//设置线的样式为折线
			{
				this.strokeDasharray = (this.weight*4+1)+","+(this.weight*3)+","+(this.weight*4+1)+","+(this.weight*3);
			}
			else
			{
				this.strokeLinecap = "round";
				this.strokeLinejoin = "round";
				this.strokeDasharray = "none";
			}
			this.circleSVG.setAttribute("stroke-linecap", this.strokeLinecap);
			this.circleSVG.setAttribute("stroke-linejoin", this.strokeLinejoin);
			this.circleSVG.setAttribute("stroke-dasharray", this.strokeDasharray);
		}
	}
	LTCircle.setLineStyle=function(style)
	{
		if(!style){return;}
		this.lineStyle=style;
		if(LTBrowserInfo.isIE())
		{
			this.stroke.dashstyle=style;
		}else{
			this.strokeLinecap = "none";
			this.strokeLinejoin = "none";
			if(style == "Dot")	//设置线的样式为点线
			{
				/*换算规律
					边框粗度为1时，IE下VML的值4 2，火狐下SVG的值1 3 1 3
					边框粗度为2时，IE下VML的值5 5，火狐下SVG的值2 6 2 6
					边框粗度为3时，IE下VML的值6 8，火狐下SVG的值3 9 3 9
					边框粗度为4时，IE下VML的值7 11，火狐下SVG的值4 12 4 12
					边框粗度为5时，IE下VML的值5 14，火狐下SVG的值5 15 5 15
				*/
				//用逗号分割，为了兼容3.5-4.0之间的火狐版本
				this.strokeDasharray = (this.weight*1)+","+(this.weight*3)+","+(this.weight*1)+","+(this.weight*3);
			}
			else if(style == "Dash")	//设置线的样式为折线
			{
				/*换算规律
					边框粗度为1时，IE下VML的值7 2，火狐下SVG的值4,3,4,3
					边框粗度为2时，IE下VML的值11 5，火狐下SVG的值9,6,9,6
					边框粗度为3时，IE下VML的值15 8，火狐下SVG的值13,9,13,9
					边框粗度为4时，IE下VML的值18 11，火狐下SVG的值17 12 17 12
					边框粗度为5时，IE下VML的值22 15，火狐下SVG的值21 15 21 15
				*/
				this.strokeDasharray = (this.weight*4+1)+","+(this.weight*3)+","+(this.weight*4+1)+","+(this.weight*3);
			}
			else
			{
				this.strokeLinecap = "round";
				this.strokeLinejoin = "round";
				this.strokeDasharray = "none";
			}
			this.circleSVG.setAttribute("stroke-linecap", this.strokeLinecap);
			this.circleSVG.setAttribute("stroke-linejoin", this.strokeLinejoin);
			this.circleSVG.setAttribute("stroke-dasharray", this.strokeDasharray);
		}
	}
	LTCircle.setCursor=function(cur)
	{
		if(LTBrowserInfo.isIE())
		{
			this.div.style.cursor=cur;
		}
		else
		{
			this.circleSVG.style.cursor = cur;
		}
	}
	
	window.LTEllipse=LTEllipse;
	window.LTCircle=LTCircle;
}
LTNS();