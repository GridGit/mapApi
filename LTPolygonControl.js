//应该设计一个提供给用户获取长度的变量
function LTMapNS(){
	function LTPolygonControl(showLabel,create)
	{
		LTFunction.inherit(this,LTBaseControl);
		this.textOpacity=0.8;
		this.color = "#FF0000";
		this.bgcolor = "#FFCC00";
		this.showLabel=showLabel!=false;
		this.showMarker=showLabel!=false;
		this.showClose=showLabel!=false;
		if(create){this.create=create;}
		this.create();
		LTEvent.addListener(this.btn,"dblclick",LTEvent.cancelBubble);
		LTEvent.addListener(this.btn,"mousedown",LTEvent.returnTrue);
		LTEvent.addListener(this.btn,"mouseup",LTEvent.cancelBubble);
		LTEvent.bind(this.btn,"click",this,this.btnClick);
		this.tips="右键单击结束";
		this.setValue=this.setLabel;
		this.delMarkers=[];
		this.autoClear=true;
	}
	LTPolygonControl.prototype.create=function()
	{
		this.div =LTFunction.createDiv(1,["85%","90%"]);
		this.btn = document.createElement( "input" );
		this.btn.type = "button";
		this.btn.value = window._LT_plg_btnValue;
		this.div.appendChild( this.btn );
	}
	LTPolygonControl.prototype.btnClick = function( Evnt )
	{
		LTEvent.returnTrue( Evnt);
		if( this.flag )
		{
			if(!this.map.startOccupy(this.btn.value))
			{
				return;
			}
			this.flag = false;
			this.mupListener=LTEvent.bind(this.map,"click",this,this.onMouseUp);
			this.points=[];
			this.polygons=new Array(0);
			
			//将this.mapTexts和this.zMarkers放在调用的时候创建，这样可以单独删除某条线的marker和text中的值，避免删除地图上所有的marker和text
			this.mapTexts=new Array(0);
			this.zMarkers=new Array(0);
			
			this.index=0;
			this.btn.style.backgroundColor="#FFFFFF";
		}
		else
		{
			this.map.endOccupy(this.btn.value)
			this.flag=true;
			LTEvent.removeListener(this.mupListener);
			LTEvent.removeListener(this.mmoveListener);
			this.mupListener=null;
			this.mmoveListener=null;
			//测距修改为画完一段线自动转换为地图缩放操作模式，需要保留画线信息，因此只移除监听不清除画线信息
			/*if(this.autoClear)
			{
				this.clear();
			}
			if(this.lastLine)
			{
				this.map.removeOverLay(this.lastLine);
				this.lastLine=null;
			}
			if(this.tipText)
			{
				this.map.removeOverLay(this.tipText);
				this.tipText=null;
			}*/
			this.btn.style.backgroundColor="";
		}
	}
	LTPolygonControl.prototype.clear=function()
	{
		var polygon;
		while(polygon=this.polygons.pop())
		{
			this.map.removeOverLay(polygon,true);
		}
		polygon=null;
		
		var maptext,maptexts;
		while(maptexts=this.mapTexts.pop())
		{
			while(maptext=maptexts.pop())
			{
				this.map.removeOverLay(maptext);
			}
		}
		maptexts=null;
		maptext=null;
		
		var zMarker;
		while(zMarker=this.zMarkers.pop())
		{
			this.map.removeOverLay(zMarker);
		}
		zMarker=null;
		
		var delMarker;
		while(delMarker=this.delMarkers.pop())
		{
			this.map.removeOverLay(delMarker);
		}
		delMarker=null;
	}
	LTPolygonControl.prototype.onMouseUp= function(point,button)
	{
		if(button==1)
		{
			this.addPoint(point);
		}
		else
		{
			this.endDraw();
		}
	}
	LTPolygonControl.prototype.addPoint=function(point)
	{
		var pointLatLng=this.map.getPointLatLng(point);
		if(!this.points[this.index])
		{//如果是新建一个多边形
			this.points.push([]);
			this.points[this.index].push(pointLatLng);
			var polygon=new LTPolygon(this.points[this.index],this.color,this.bgcolor,this.lineStroke,this.fillOpacity);
			if(this.lineColor){polygon.setLineColor(this.lineColor);}
			if(this.fillColor){polygon.setFillColor(this.fillColor);}
			if(this.lineStyle){polygon.setLineStyle(this.lineStyle);}
			this.polygons.push(polygon);
			this.map.addOverLay(this.polygons[this.index]);
			if(this.showLabel)
			{
				var mapText=new LTMapText(pointLatLng,[2,0]);
				mapText.setFontSize(13);
				mapText.setLabel("0&nbsp;km<sup>2</sup>");
				mapText.setOpacity(this.textOpacity);
				mapText.setNoWrap(true);
				this.map.addOverLay(mapText);
				this.mapTexts.push([]);
				this.mapTexts[this.index].push(mapText);
			}
			this.lastPoint=pointLatLng;
			if(!this.lastLine)
			{
				this.lastLine=new LTPolyLine([this.points[this.index][0]],this.lineColor,this.lineStroke,this.polygonOpacity);
				if(!this.lineColor){this.lastLine.setLineColor("gray");}
				if(this.lineStyle){this.lastLine.setLineStyle(this.lineStyle);}
				this.map.addOverLay(this.lastLine);
			}
			else
			{
				//将this.points[this.index][0]点坐标（墨卡托）转换成NTU
				var point_N = new LTPointMercator(this.points[this.index][0].getLongitude(),this.points[this.index][0].getLatitude());
				var point = new LTPoint(point_N.getLongitude(),point_N.getLatitude());
				this.lastLine.points[0]=point;
			}
			if(!this.tipText)
			{
				this.tipText=new LTMapText(this.points[this.index][0],[10,0]);
				this.tipText.setBackgroundColor("#D2F0FF");
				this.tipText.setFontSize(13);
				this.tipText.setOpacity(this.textOpacity);
				this.tipText.setNoWrap(true);
			}
			this.map.addOverLay(this.tipText);
			this.tipText.setLabel(this.tips);
			this.mmoveListener=LTEvent.bind(this.map.container,"mousemove",this,this.onMouseMove);
		}
		else
		{//如果是给多边形添加点
			this.points[this.index].push(pointLatLng);
			//以下代码实际上就是
			//this.polygons[this.index].setPoints(this.points[this.index]);
			//特意要延迟一秒执行是为了防止在firefox下首次单击绘制出来的多边形影响地图的点击事件的触发
			var index=this.index;
			window.setTimeout(LTEvent.getCallback(this,function(){try{this.polygons[index].setPoints(this.points[index]);}catch(e){}}),100);
			if(this.showLabel)
			{
				this.mapTexts[this.index][0].setPoint(pointLatLng);
				var area=LTPolygonControl.getPointsArea(this.points[this.index]);
				this.mapTexts[this.index][0].setLabel((area/1000000)+"&nbsp;km<sup>2</sup>");
			}
			this.tipText.setPoint(pointLatLng);
			this.lastPoint=pointLatLng;
		}
		//折点标记
		if(this.showMarker){
			var icon=new LTIcon("http://www.51ditu.com/img/point1.png",[9,9],[5,5]);//创建一个图标
			var zMarker = new LTMarker(new LTPoint(pointLatLng[0],pointLatLng[1]),icon);
			this.zMarkers.push(zMarker);
			this.map.addOverLay( zMarker );
		}
	}
	LTPolygonControl.prototype.endDraw=function()
	{
		if(!this.points || !this.points[this.index]){return;}
		var map=this.map;
		if(this.points[this.index].length==1)
		{
			var mapText;
			if(this.mapTexts[this.index])
			{
				while(mapText=this.mapTexts[this.index].pop())
				{
					map.removeOverLay(mapText);
				}
			}
			map.removeOverLay(this.polygons[this.index]);
		}
		this.index++;
		this.lastPoint=null;
		while(this.lastLine.points.pop()){}
		this.lastLine.setPoints(this.lastLine.points);
		this.map.removeOverLay(this.tipText);
		//再次调用，移除地图点击事件，和地图移动事件，避免关闭地图上的线时，又重新画面
		this.btnClick();
		if(this.showClose)
		{
			//双击结束后在最后一个节点添加一个删除btn,并派发结束事件共监听
			var polygons = this.polygons;
			var mapTexts = this.mapTexts;
			var zMarkers = this.zMarkers;
			var icon = new LTIcon("http://www.51ditu.com/img/del.gif", [11, 11], [18, 5]);//创建一个图标
			icon.setTitle("清除本次测面");
			var last = this.points[this.index - 1].length - 1;
			var delMarker = new LTMarker(new LTPoint(this.points[this.index - 1][last][0], this.points[this.index - 1][last][1] - 10), icon);
			this.map.addOverLay(delMarker);
			function delDraw(){
				//this.map.clearOverLays();
				//判断this.showLabel是否是false
				if (typeof mapTexts[0] != "undefined") {
					while (mapText = mapTexts[0].pop()) {
						this.map.removeOverLay(mapText);
					}
				}
				while (zMarker = zMarkers.pop()) {
					this.map.removeOverLay(zMarker);
				}
				this.map.removeOverLay(polygons[0]);
				this.map.removeOverLay(delMarker);
			}
			LTEvent.addListener(delMarker, "click", delDraw);
		}
		LTEvent.trigger(this.map, "endAreaEvt");
		LTEvent.trigger(this,"draw",[this.points[this.index-1],LTPolyLineControl.getPointsDistance(this.points[this.index-1]),this.polygons[this.index-1]]);
	}
	LTPolygonControl.prototype.onMouseMove= function(e)
	{
		if(!this.lastPoint)
		{
			return;
		}
		var p=LTFunction.getEventPosition(e,this.map.container);
		var lastP=this.map.getPixelCoord(this.lastPoint);
		//var point=this.map.getPointLatLng([p[0]+((lastP[0]>p[0])?2:-2),p[1]+((lastP[1]>p[1])?2:-2)]);
		var point=this.map.getPointLatLng([p[0]+((lastP[0]>p[0])?1:-1),p[1]]);
		//将this.lastPoint点坐标（墨卡托）转换成NTU
		var lastPoint_N = new LTPointMercator(this.lastPoint.getLongitude(),this.lastPoint.getLatitude());
		lastPoint_P = new LTPoint(lastPoint_N.getLongitude(),lastPoint_N.getLatitude());
		this.lastLine.points[2]=lastPoint_P;
		//将中心点坐标NTU转换成墨卡托坐标
		var point_M = new LTPointMercator(point.getLongitude(),point.getLatitude());
		point = new LTPoint(point_M.getLongitude(),point_M.getLatitude());
		this.lastLine.points[1]=point;
		var pointsTemp = [];
		//将经纬度转换成NTU
		for(var i=0; i<this.lastLine.points.length; i++){
			var Point_M = new LTPointWGS84(this.lastLine.points[i].getLongitude(),this.lastLine.points[i].getLatitude());
			pointsTemp[i] = new LTPoint(Point_M.getLongitude(),Point_M.getLatitude());
		}
		//画线
		this.lastLine.setPoints(pointsTemp);
		//将point点坐标（墨卡托）转换成NTU
		var point_M = new LTPointMercator(point.getLongitude(),point.getLatitude());
		point = new LTPoint(point_M.getLongitude(),point_M.getLatitude());
		this.tipText.setPoint(point);
	}
	LTPolygonControl.prototype.initialize = function( map )
	{
		if(!this.div || this.map){return false;}
		this.map = map;
		this.flag = true;
	}
	LTPolygonControl.prototype.getObject = function(){
		return this.div;
	}
	LTPolygonControl.prototype.remove = function()
	{
		if(!this.flag)
		{
			this.btnClick();
		}
	}
	LTPolygonControl.prototype.depose = function()
	{
		LTEvent.deposeNode(this.div);
		this.div=null;
	}
	LTPolygonControl.prototype.setLabel = function( v )
	{
		this.btn.value = v;
	}
	LTPolygonControl.prototype.setTips = function( v )
	{
		this.tips= v;
	}
	LTPolygonControl.getPointsArea=function(points)
	{
		var s=0;
		var num=points.length;
		for(var i=1;i<num;i++)
		{
			s+=LTPolygonControl.getLineSQR(points[i-1],points[i]);
		}
		s+=LTPolygonControl.getLineSQR(points[num-1],points[0]);
		return Math.abs(s);
	}
	LTPolygonControl.getLineSQR=function(points1,points2)
	{
		return (points2.getLongitude()-points1.getLongitude())*(points2.getLatitude()+points1.getLatitude())/2.0;
	}
	//显示提示的距离数
	LTPolygonControl.prototype.addLabel= function(bool)
	{
		this.showLabel = bool;
	}
	
	//隐藏提示的距离数
	LTPolygonControl.prototype.removeLabel= function()
	{
		this.showLabel = false;
	}
	
	//显示拐点处的Marker
	LTPolygonControl.prototype.addMarker= function(bool)
	{
		this.showMarker = bool;
	}
	
	//隐藏拐点处的Marker
	LTPolygonControl.prototype.removeMarker= function()
	{
		this.showMarker = false;
	}
	
	//打开关闭功能，并显示关闭图标
	LTPolygonControl.prototype.addMarkerClose= function(bool)
	{
		this.showClose = bool;
	}
	
	//隐藏关闭功能，并显示关闭图标
	LTPolygonControl.prototype.removeMarkerClose= function()
	{
		this.showClose = false;
	}
	
	//设置线和面的填充颜色
	LTPolygonControl.prototype.setColor= function(color)
	{
		this.color = color;
	}
	
	//获得线和面的填充颜色
	LTPolygonControl.prototype.getColor= function(color)
	{
		return this.color;
	}
	
	//设置线和面的边框颜色
	LTPolygonControl.prototype.setBgcolor= function(bgcolor)
	{
		this.bgcolor = bgcolor;
	}
	
	//获得线和面的边框颜色
	LTPolygonControl.prototype.getBgcolor= function(bgcolor)
	{
		return this.bgcolor;
	}
	
	function LTPolyLineControl(showLabel)
	{
		var control=new LTPolygonControl(showLabel,LTPolyLineControl.create);
		control.addPoint=LTPolyLineControl.addPoint;
		control.endDraw=LTPolyLineControl.endDraw;
		control.onMouseMove=LTPolyLineControl.onMouseMove;
		return control;
	}
	LTPolyLineControl.create=function()
	{
		this.div =LTFunction.createDiv(1,["70%","90%"]);
		this.btn = document.createElement( "input" );
		this.btn.type = "button";
		this.btn.value = window._LT_pll_btnValue;
		this.div.appendChild( this.btn );
	}
	LTPolyLineControl.addPoint=function(point)
	{
		var pointLatLng=this.map.getPointLatLng(point);
		if(!this.points[this.index])
		{
			this.points.push(new Array(0));
			this.points[this.index].push(pointLatLng);
			if(this.showLabel)
			{
				this.mapTexts.push(new Array(0));
				var mapText=new LTMapText(pointLatLng,[2,0]);
				this.mapTexts[this.index].push(mapText);
				mapText.setFontSize(13);
				mapText.setLabel("起点");
				mapText.setOpacity(this.textOpacity);
				mapText.setNoWrap(true);
				this.map.addOverLay(mapText);
			}
			var polyLine=new LTPolyLine(this.points[this.index],this.color,this.lineStroke,this.lineOpacity);
			if(this.lineColor){polyLine.setLineColor(this.lineColor);}
			if(this.lineStyle){polyLine.setLineStyle(this.lineStyle);}
			if(this.lineArrow){polyLine.setLineArrow(this.lineArrow);}
			this.polygons.push(polyLine);
			this.map.addOverLay(this.polygons[this.index]);
			this.lastPoint=pointLatLng;
			if(!this.tipText)
			{
				this.tipText=new LTMapText(this.points[this.index][0],[10,0]);
				this.tipText.setBackgroundColor("#D2F0FF");
				this.tipText.setFontSize(13);
				this.tipText.setOpacity(this.textOpacity);
				this.tipText.setNoWrap(true);
			}
			this.map.addOverLay(this.tipText);
			this.tipText.setLabel(this.tips);
			this.mmoveListener=LTEvent.bind(this.map.container,"mousemove",this,this.onMouseMove);
		}
		else
		{
			this.points[this.index].push(pointLatLng);
			if(this.showLabel)
			{
				var mapText=new LTMapText(pointLatLng,[2,0]);
				this.mapTexts[this.index].push(mapText);
				mapText.setFontSize(13);
				mapText.setOpacity(this.textOpacity);
				mapText.setNoWrap(true);
				var distance=LTPolyLineControl.getPointsDistance(this.points[this.index]);
				var distanceStr;
				if(distance<1000)
				{
					distanceStr=distance+"&nbsp;m";
				}
				else
				{
					distanceStr=(distance/1000)+"&nbsp;km";
				}
				mapText.setLabel(distanceStr);
				this.map.addOverLay(mapText);
			}
			
			//以下代码实际上就是
			//this.polygons[this.index].setPoints(this.points[this.index]);
			//特意要延迟一秒执行是为了防止在firefox下首次单击绘制出来的多边形影响地图的点击事件的触发
			var index=this.index;
			window.setTimeout(LTEvent.getCallback(this,function(){try{this.polygons[index].setPoints(this.points[index]);}catch(e){}}),100);
			this.lastPoint=pointLatLng;
			this.tipText.setPoint(pointLatLng);
		}
		//折点标记
		if(this.showMarker)
		{
			var icon=new LTIcon("http://www.51ditu.com/img/point1.png",[9,9],[5,5]);//创建一个图标
			var zMarker = new LTMarker( new LTPoint(pointLatLng[0], pointLatLng[1]) ,icon);
			this.zMarkers.push(zMarker);
			this.map.addOverLay( zMarker );
		}
	}
	LTPolyLineControl.endDraw=function()
	{
		if(!this.points || !this.points[this.index]){return;}
		var map=this.map;
		
		if(this.points[this.index].length==1)
		{
			var mapText;
			while(mapText=this.mapTexts[this.index].pop())
			{
				map.removeOverLay(mapText);
			}
			map.removeOverLay(this.polygons[this.index]);
		}
		this.index++;
		this.lastPoint=null;
		while(this.lastLine.points.pop()){}
		this.lastLine.setPoints(this.lastLine.points);
		this.map.removeOverLay(this.tipText);
		
		//再次调用，移除地图点击事件，和地图移动事件，避免关闭地图上的线时，又重新画线
		this.btnClick();
		
		if(this.showClose)
		{
			//双击结束后在最后一个节点添加一个删除btn,并派发结束事件共监听
			var polygons = this.polygons;
			var mapTexts = this.mapTexts;
			var zMarkers = this.zMarkers;
			var icon = new LTIcon("http://www.51ditu.com/img/del.gif", [11, 11], [18, 5]);//创建一个图标
			icon.setTitle("清除本次测距");
			var last = this.points[this.index - 1].length - 1;
			var delMarker = new LTMarker(new LTPoint(this.points[this.index - 1][last][0], this.points[this.index - 1][last][1] - 10), icon);
			this.map.addOverLay(delMarker);
			function delDraw(){
				//this.map.clearOverLays();
				if (typeof mapTexts[0] != "undefined") {
					while (mapText = mapTexts[0].pop()) {
						this.map.removeOverLay(mapText);
					}
				}
				while (zMarker = zMarkers.pop()) {
					this.map.removeOverLay(zMarker);
				}
				this.map.removeOverLay(polygons[0]);
				this.map.removeOverLay(delMarker);
			}
			LTEvent.addListener(delMarker, "click", delDraw);
		}
		LTEvent.trigger(this.map,"endDisEvt");
		LTEvent.trigger(this,"draw",[this.points[this.index-1],LTPolyLineControl.getPointsDistance(this.points[this.index-1]),this.polygons[this.index-1]]);
		
	}
	
	LTPolyLineControl.onMouseMove= function(e)
	{
		if(!this.lastPoint)
		{
			return;
		}
		var p=LTFunction.getEventPosition(e,this.map.container);
		var lastP=this.map.getPixelCoord(this.lastPoint);
		//var point=this.map.getPointLatLng([p[0]+((lastP[0]>p[0])?2:-2),p[1]+((lastP[1]>p[1])?2:-2)]);
		var point=this.map.getPointLatLng([p[0]+((lastP[0]>p[0])?1:-1),p[1]]);
		if(!this.lastLine)
		{
			this.lastLine=new LTPolyLine([this.lastPoint,point],this.lineColor,this.lineStroke,this.lineOpacity);
			if(!this.lineColor){this.lastLine.setLineColor("gray");}
			if(this.lineStyle){this.lastLine.setLineStyle(this.lineStyle);}
			if(this.lineArrow){this.lastLine.setLineArrow(this.lineArrow[0],this.lineArrow[1]);}
			this.map.addOverLay(this.lastLine);
		}
		//画线
		this.lastLine.setPoints([this.lastPoint,point]);
		this.tipText.setPoint(point);
	}
	LTPolyLineControl.getPointsDistance=function(points)
	{
		var s=0;
		for(var i=1;i<points.length;i++)
		{
			s+=LTFunction.getPointsDistance(points[i-1],points[i]);
		}
		return s;
	}
	window.LTPolygonControl = LTPolygonControl;
	window.LTPolyLineControl=LTPolyLineControl;
}
LTMapNS();