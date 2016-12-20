//本文件是JS API之中的LTEllipseControl类，是地图的标准导航控件
//每个控件应该有initialize，getObject,depose三个方法
function LTNS()
{
	function LTEllipseControl(color,bgcolor,weight,opacity,lineStyle,cursorStyle,create,type)
	{
		this.lineColor=(color || color=="")?color:"#003366";
		this.fillColor=(bgcolor || bgcolor=="")?bgcolor:"#CCCCFF";
		this.lineStroke=weight?weight:1;
		this.fillOpacity=opacity?opacity:0.5;
		this.lineStyle = lineStyle?lineStyle:"Solid";
		this.cursorStyle = cursorStyle?cursorStyle:"";
		this.type = type?type:"ellipse";
		LTFunction.inherit(this,LTBaseControl);
		if(create){this.create=create;}
		this.create();
		LTEvent.bind(this.btn,"click",this,this.btnClick);
		LTEvent.addListener(this.btn,"dblclick",LTEvent.cancelBubble);
		LTEvent.addListener(this.btn,"mousedown",LTEvent.returnTrue);
		LTEvent.addListener(this.btn,"mouseup",LTEvent.cancelBubble);
		this.autoClear=true;
	}
	LTEllipseControl.prototype.create=function()
	{
		this.div =LTFunction.createDiv(1,["70%",10])
		this.btn = document.createElement( "input" );
		this.btn.type = "button";
		this.btn.value = window._LT_plr_btnValue?window._LT_plr_btnValue:"画椭圆";
		this.div.appendChild(this.btn);
	}
	LTEllipseControl.prototype.btnClick = function(e)
	{
		LTEvent.returnTrue(e);
		if(this.flag)
		{
			if(!this.map.startOccupy(this.btn.value))
			{
				return;
			}
			this.map.disableDrag();
			this.flag=false;
			this.mmdl=LTEvent.bind(this.map.container,"mousedown",this,this.onMouseDown);
			this.bounds=[];
			this.ellipses=[];
			this.index=0;
			this.lastPoint=null;
			this.btn.style.backgroundColor="#FFFFFF";
		}
		else
		{
			this.map.endOccupy(this.btn.value);
			this.map.enableDrag();
			this.flag=true;
			LTEvent.removeListener(this.mmdl);
			LTEvent.removeListener(this.mmdrl);
			LTEvent.removeListener(this.mmul);
			this.mmdl=null;
			this.mmdrl=null;
			this.mmul=null;
			if(this.autoClear)
			{
				this.clear()
			}
			this.ellipses=[];
			this.bounds=[];
			this.index=0;
			this.btn.style.backgroundColor="";
		}
	}
	LTEllipseControl.prototype.clear=function()
	{
		if(!this.ellipses){return;}
		var ellipse;
		while(ellipse=this.ellipses.pop())
		{
			this.map.removeOverLay(ellipse,true);
		}
		ellipse=null;
	}
	LTEllipseControl.prototype.drawEllipse=function(bounds)
	{
		var ellipse=new LTEllipse(bounds,this.lineColor,this.fillColor,this.lineStroke,this.fillOpacity,this.lineStyle,this.cursorStyle);
		return ellipse;
	}
	LTEllipseControl.prototype.onMouseDown = function(e)
	{
		if(this.dragObj){this.onMouseUp(e);}
		var dragObj={startPoint:LTFunction.getEventPosition(e,this.map.container),startDivPoint:[e.clientX,e.clientY]};
		dragObj.mmdrl=LTEvent.bind(document,"mousemove",this,this.onMouseMove);
		dragObj.mmul=LTEvent.bind(document,"mouseup",this,this.onMouseUp);
		this.lastPoint=this.map.getPointLatLng(dragObj.startPoint);
		this.lastBounds=new LTBounds(this.lastPoint.getLongitude(),this.lastPoint.getLatitude(),this.lastPoint.getLongitude(),this.lastPoint.getLatitude());
		this.bounds.push(this.lastBounds);
		this.lastEllipse=this.drawEllipse(this.lastBounds);
		this.radius = 0;
		this.ellipses.push(this.lastEllipse);
		this.map.addOverLay(this.lastEllipse);
		this.dragObj=dragObj;
		if(this.map.container.setCapture)
		{
			this.map.container.setCapture();
		}
	}
	LTEllipseControl.prototype.onMouseUp = function(e)
	{
		LTEvent.cancelBubble(e);
		if(document.releaseCapture)
		{
			document.releaseCapture();
		}
		this.index++;
		var dragObj=this.dragObj;
		if(dragObj)
		{
			LTEvent.removeListener(dragObj.mmdrl);
			LTEvent.removeListener(dragObj.mmul);
		}
		this.dragObj=null;
		if (this.type == "circle") {
			var jsonStr = "{lo:"+this.lastPoint.getLongitude()+",la:"+this.lastPoint.getLatitude()+",radius:"+this.radius+"}";
			var json = eval('('+jsonStr+')');
			LTEvent.trigger(this,"mouseup",[json,this.lastEllipse]);
		}else{
			LTEvent.trigger(this,"mouseup",[this.bounds[this.index-1],this.lastEllipse]);
		}
		this.lastPoint=null;
	}
	LTEllipseControl.prototype.onMouseMove = function(e)
	{
		var dragObj=this.dragObj;
		var p=this.map.getPointLatLng([dragObj.startPoint[0]+e.clientX-dragObj.startDivPoint[0],dragObj.startPoint[1]+e.clientY-dragObj.startDivPoint[1]]);
		this.lastBounds=new LTBounds(Math.min(p.getLongitude(),this.lastPoint.getLongitude()),Math.min(p.getLatitude(),this.lastPoint.getLatitude()),Math.max(p.getLongitude(),this.lastPoint.getLongitude()),Math.max(p.getLatitude(),this.lastPoint.getLatitude()));
		this.bounds[this.index]=this.lastBounds;
		if(this.type == "circle"){
			var startPoint = new LTPoint(this.lastPoint.getLongitude(),this.lastPoint.getLatitude());
			var endPoint = new LTPoint(p.getLongitude(),p.getLatitude());
			this.radius = LTFunction.getPointsDistance(startPoint,endPoint);
			this.lastEllipse.setCircle(this.lastPoint,this.radius);
		}else{
			this.lastEllipse.setBounds(this.lastBounds);
		}
	}
	LTEllipseControl.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		this.flag = true;
	}
	LTEllipseControl.prototype.getObject=function()
	{
		return this.div;
	}
	LTEllipseControl.prototype.remove=function()
	{
		if(!this.flag)
		{
			this.btnClick();
		}
		this.map=null;
	}
	LTEllipseControl.prototype.depose=function()
	{
		LTEvent.deposeNode(this.div);
		this.div=null;
	}
	LTEllipseControl.prototype.setLabel = function( Name )
	{
		this.btn.value = Name;
	}
	
	LTEllipseControl.prototype.setLineColor=function(color)
	{
		this.lineColor = color;
	}
	LTEllipseControl.prototype.setFillColor=function(bgcolor)
	{
		this.fillColor = bgcolor;
	}
	
	LTEllipseControl.prototype.setLayerOpacity=function(opacity)
	{
		this.fillOpacity = opacity;
	}
	
	LTEllipseControl.prototype.setLineStroke=function(weight)
	{
		this.lineStroke = weight;
	}
	LTEllipseControl.prototype.setLineStyle=function(style)
	{
		this.lineStyle = style;
	}
	LTEllipseControl.prototype.setCursor=function(cur)
	{
		this.cursorStyle = cur;
	}
	//圆的绘制控件
	function LTCircleControl(color,bgcolor,weight,opacity)
	{
		return new LTEllipseControl(color,bgcolor,weight,opacity,null,null,LTCircleControl.create,"circle");
	}
	LTCircleControl.create=function()
	{
		this.div =LTFunction.createDiv(1,["55%","90%"]);
		this.btn = document.createElement( "input" );
		this.btn.type = "button";
		this.btn.value = window._LT_plc_btnValue?window._LT_plc_btnValue:"画圆";
		this.div.appendChild( this.btn );
		this.drawEllipse=LTCircleControl.drawEllipse;
	}
	LTCircleControl.drawEllipse=function(bounds)
	{
		if((bounds.Xmax==bounds.Xmin)&&(bounds.Ymax==bounds.Ymin)){
			var center = new LTPoint(bounds.Xmin,bounds.Ymin);
			var radius = 0;
		}
		var circle=new LTCircle(center,radius,"point",this.lineColor,this.fillColor,this.lineStroke,this.fillOpacity,this.lineStyle,this.cursorStyle);
		return circle;
	}
	window.LTEllipseControl=LTEllipseControl;
	window.LTCircleControl=LTCircleControl;
}
LTNS();