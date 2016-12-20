//本文件是JS API之中的LTZoomSearchControl类，是地图的标准导航控件
//每个控件应该有initialize，getObject,depose三个方法
function LTNS()
{
	function LTRectControl(color,bgcolor,weight,opacity,create)
	{
		this.lineColor=(color || color=="")?color:"#003366";
		this.fillColor=(bgcolor || bgcolor=="")?bgcolor:"#CCCCFF";
		this.lineStroke=weight?weight:1;
		this.fillOpacity=opacity?opacity:0.5;
		LTFunction.inherit(this,LTBaseControl);
		if(create){this.create=create;}
		this.create();

		LTEvent.bind(this.btn,"click",this,this.btnClick);
		LTEvent.addListener(this.btn,"dblclick",LTEvent.cancelBubble);
		LTEvent.addListener(this.btn,"mousedown",LTEvent.returnTrue);
		LTEvent.addListener(this.btn,"mouseup",LTEvent.cancelBubble);
		this.autoClear=true;
	}
	LTRectControl.prototype.create=function()
	{
		this.div =LTFunction.createDiv(1,["70%",10])
		this.btn = document.createElement( "input" );
		this.btn.type = "button";
		this.btn.value = "画矩形";
		this.div.appendChild(this.btn);
	}
	LTRectControl.prototype.btnClick = function(e)
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
			this.rects=[];
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
			this.rects=[];
			this.bounds=[];
			this.index=0;
			this.btn.style.backgroundColor="";
		}
	}
	LTRectControl.prototype.clear=function()
	{
		if(!this.rects){return;}
		var rect;
		while(rect=this.rects.pop())
		{
			this.map.removeOverLay(rect,true);
		}
		rect=null;
	}
	LTRectControl.prototype.drawRect=function(bounds)
	{
		var rect=new LTRect(bounds,this.lineColor,this.fillColor,this.lineStroke,this.fillOpacity);
		if(this.lineStyle){rect.setLineStyle(this.lineStyle);}
		return rect;
	}
	LTRectControl.prototype.onMouseDown = function(e)
	{
		if(this.dragObj){this.onMouseUp(e);}
		var dragObj={startPoint:LTFunction.getEventPosition(e,this.map.container),startDivPoint:[e.clientX,e.clientY]};
		dragObj.mmdrl=LTEvent.bind(document,"mousemove",this,this.onMouseMove);
		dragObj.mmul=LTEvent.bind(document,"mouseup",this,this.onMouseUp);
		this.lastPoint=this.map.getPointLatLng(dragObj.startPoint);
		this.lastBounds=new LTBounds(this.lastPoint.getLongitude(),this.lastPoint.getLatitude(),this.lastPoint.getLongitude(),this.lastPoint.getLatitude());
		this.bounds.push(this.lastBounds);
		this.lastRect=this.drawRect(this.lastBounds);
		this.rects.push(this.lastRect);
		this.map.addOverLay(this.lastRect);
		this.dragObj=dragObj;
		if(this.map.container.setCapture)
		{
			this.map.container.setCapture();
		}
	}
	LTRectControl.prototype.onMouseUp = function(e)
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
		LTEvent.trigger(this,"draw",[this.bounds[this.index-1],this.lastRect]);
		this.lastPoint=null;
	}
	LTRectControl.prototype.onMouseMove = function(e)
	{
		var dragObj=this.dragObj;
		var p=this.map.getPointLatLng([dragObj.startPoint[0]+e.clientX-dragObj.startDivPoint[0],dragObj.startPoint[1]+e.clientY-dragObj.startDivPoint[1]]);
		this.lastBounds=new LTBounds(Math.min(p.getLongitude(),this.lastPoint.getLongitude()),Math.min(p.getLatitude(),this.lastPoint.getLatitude()),Math.max(p.getLongitude(),this.lastPoint.getLongitude()),Math.max(p.getLatitude(),this.lastPoint.getLatitude()));
		this.bounds[this.index]=this.lastBounds;
		this.lastRect.setBounds(this.lastBounds);
	}
	LTRectControl.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		this.flag = true;
	}
	LTRectControl.prototype.getObject=function()
	{
		return this.div;
	}
	LTRectControl.prototype.remove=function()
	{
		if(!this.flag)
		{
			this.btnClick();
		}
		this.map=null;
	}
	LTRectControl.prototype.depose=function()
	{
		LTEvent.deposeNode(this.div);
		this.div=null;
	}
	LTRectControl.prototype.setLabel = function( Name )
	{
		this.btn.value = Name;
	}
	//椭圆的绘制控件
/*
	function LTEllipseControl(color,bgcolor,weight,opacity)
	{
		return new LTRectControl(color,bgcolor,weight,opacity,LTEllipseControl.create);
	}
	LTEllipseControl.create=function()
	{
		this.div =LTFunction.createDiv(1,["55%","90%"]);
		this.btn = document.createElement( "input" );
		this.btn.type = "button";
		this.btn.value = window._LT_ple_btnValue;
		this.div.appendChild( this.btn );
		this.drawRect=LTEllipseControl.drawRect;
	}
	LTEllipseControl.drawRect=function(bounds)
	{
		var rect=new LTEllipse(bounds,this.lineColor,this.fillColor,this.lineStroke,this.fillOpacity);
		if(this.lineStyle){rect.setLineStyle(this.lineStyle);}
		return rect;
	}
*/
	//兼容原先的LTZoomSearchControl
	function LTZoomSearchControl(color,bgcolor,weight,opacity)
	{
		return new LTRectControl(color,bgcolor,weight,opacity,LTZoomSearchControl.create);
	}
	LTZoomSearchControl.create=function()
	{	
		this.div =LTFunction.createDiv(1,["70%",10])
		this.btn = document.createElement( "input" );
		this.btn.type = "button";
		this.btn.value = "拉框查找";
		this.div.appendChild(this.btn);
		this.getBoundsLatLng=LTZoomSearchControl.getBoundsLatLng;
		LTEvent.bind(this,"draw",this,LTZoomSearchControl.onDraw);
		this.setValue=this.setLabel;
	}
	LTZoomSearchControl.getBoundsLatLng = function()
	{
		return this.boundsLatLng;
	}
	LTZoomSearchControl.onDraw= function(bounds)
	{
		this.boundsLatLng=bounds;
		LTEvent.trigger(this,"mouseup",[this.bounds[this.index-1]]);
		this.clear();
		this.bounds=[];
		this.index=0;
	}
	//支持拉框放大控件
	function LTZoomInControl(zoomAdd,color,bgcolor,weight,opacity)
	{
		bgcolor=bgcolor?bgcolor:"#CCCCFF";
		var control=new LTRectControl(color,bgcolor,weight,opacity,LTZoomInControl.create);
		control.zoomAdd=(typeof(zoomAdd)=="number")?zoomAdd:1;
		if(control.zoomAdd<0){control.setLabel("拉框缩小");}
		LTEvent.bind(control,"draw",control,LTZoomInControl.onDraw);
		return control;
	}
	LTZoomInControl.create=function()
	{
		this.div =LTFunction.createDiv(1,["55%",10])
		this.btn = document.createElement( "input" );
		this.btn.type = "button";
		this.btn.value ="拉框放大";
		this.div.appendChild(this.btn);
		this.setValue=this.setLabel;
	}
	LTZoomInControl.onDraw=function(bounds)
	{
		this.clear();
		this.bounds=[];
		this.index=0;
		var centerPoint=new LTPoint((bounds.Xmin+bounds.Xmax)/2,(bounds.Ymin+bounds.Ymax)/2);
		var map=this.map;
		if(map.zoomIndex-this.zoomAdd>=0 && map.zoomIndex-this.zoomAdd<map.zoomLevels.length)
		{
			map.setCenterAtLatLng(centerPoint);
			//map.zoomTo(this.map.zoomLevels[map.zoomIndex-this.zoomAdd]);
			map.zoomTo(map.zoomIndex-this.zoomAdd);
		}
		else
		{
			map.moveToCenter(centerPoint);
		}
	}
	window.LTRectControl=LTRectControl;
	//window.LTEllipseControl=LTEllipseControl;
	window.LTZoomSearchControl=LTZoomSearchControl;
	window.LTZoomInControl=LTZoomInControl;
}
LTNS();