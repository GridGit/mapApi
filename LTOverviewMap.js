//本文件是JS API之中的LTOverviewMap和LTOverviewMapControl对象，用来在页面或地图上显示一个鹰眼地图
function LTMapNS()
{
	//创建一个鹰眼地图，参数分别为：
	//	map			为哪个地图创建鹰眼地图
	//	container	用来显示鹰眼地图的层
	//	point		可选，指定鹰眼地图中心，如果不指定，则随原地图而变化
	//	zoom		可选，指定鹰眼地图的缩放等级，如果不指定，则随原地图而变化
	//	zoomAdd		可选，如果没有指定zoom，则可以用zoomAdd指定鹰眼地图和原地图之间的缩放等级差
	function LTOverviewMap(map,container,point,zoom,zoomAdd)
	{
		this.map=map;
		this.container=container;
		LTEvent.addListener(this.container,document.all?"mousewheel":"DOMMouseScroll",LTEvent.cancelBubble);
		LTFunction.setZIndex(this.container,10000);
		this.point=point;
		this.zoom=zoom;
		this.zoomAdd=typeof(zoomAdd)=="number"?parseInt(zoomAdd):4;
		var miniMap=new LTMaps(container);
		this.miniMap=miniMap;
		if(miniMap.progress)
		{
			miniMap.removeControl(miniMap.progress,true);
		}
		if(this.point){this.miniMap.disableDrag();}
		this.rectBorder=LTFunction.createDiv(1);
		this.rectBorder.align="left";
		var style=this.rectBorder.style;
		style.border="solid 1px #1c4bfd";
		style.fontSize="0px";
		miniMap.addControl(new LTHtmlElementControl(this.rectBorder));
		
		var bg=LTFunction.createDiv(1);
		LTFunction.setSize(bg,["100%","100%"]);
		bg.style.backgroundColor="#5895b6";
		this.rectBorder.appendChild(bg);
		LTFunction.setOpacity(this.rectBorder.firstChild,0.5);
		LTFunction.setOpacity(this.rectBorder,0.5);
		
		var circle=LTFunction.createDiv(1);
		circle.style.backgroundColor="#1c4bfd";
		circle.style.fontSize="0px";
		LTFunction.setSize(circle,["50%","1px"]);
		LTFunction.setPosition(circle,["25%","50%"]);
		this.rectBorder.appendChild(circle);
		
		circle=LTFunction.createDiv(1);
		circle.style.backgroundColor="#1c4bfd"
		circle.style.fontSize="0px";
		LTFunction.setSize(circle,["1px","50%"]);
		LTFunction.setPosition(circle,["50%","25%"]);
		this.rectBorder.appendChild(circle);
		
		this.rectBack=this.rectBorder.cloneNode(true);
		
		this.miniMap.addControl(new LTHtmlElementControl(this.rectBack));
		this.enable();
 	}
	//重置
	LTOverviewMap.prototype.resetRect=function(point,mType)
	{
		this.dragPoint=null;
		if(!this.point && (mType=="m_drag" || mType=="m_dblclick"))
		{
			this.map.moveToCenter(point);
		}
		if(!this.point){this.setRectPosition(this.rectBack,this.miniMap.getCenterPoint())};
	}
	//开始拖放矩形框
	LTOverviewMap.prototype.onRectMouseDown=function(e)
	{
		LTEvent.cancelBubble(e);
		if(this.dragObject){this.onRectMouseUp(e);}
		if(this.map.slideObject){this.map.slideEnd();}
		if(this.miniMap.slideObject){this.miniMap.slideEnd();}
		this.resetRect();
		this.dragObject={"startPosition":[parseInt(this.rectBack.style.left),parseInt(this.rectBack.style.top)],"preMove":[0,0],"startPoint":[e.clientX,e.clientY],"timeout":window.setInterval(LTEvent.getCallback(this,this.onRectMouseMove),16),"moveListener":LTEvent.bind(document,"mousemove",this,this.onRectMouseMove),"upListener":LTEvent.bind(document,"mouseup",this,this.onRectMouseUp)};
	}
	//拖动矩形框
	LTOverviewMap.prototype.onRectMouseMove=function(e)
	{
		var point;
		if(typeof(e)!="object"){point=this.dragEvent;}else{this.dragEvent=[e.clientX,e.clientY];}
		if(!point){return;}
		var dragObject=this.dragObject;
		LTFunction.setPosition(this.rectBack,this.getDragPoint(point));
		this.miniMap.setCenterAtLatLng(this.miniMap.getPointLatLng([this.miniMap.viewSize[0]/2+this.moveSize[0],this.miniMap.viewSize[1]/2+this.moveSize[1]]));
		dragObject.preMove[0]+=this.moveSize[0];
		dragObject.preMove[1]+=this.moveSize[1];
	}
	//获取矩形框的拖动距离
	LTOverviewMap.prototype.getDragPoint=function(point)
	{
		var dragObject=this.dragObject;
		var size=[dragObject.startPosition[0]-dragObject.startPoint[0]+point[0],dragObject.startPosition[1]-dragObject.startPoint[1]+point[1]];
		var moveSize=[0,0];
		if(!this.point)
		{
			if(size[0]<0)
			{
				size[0]=0;
				moveSize[0]=-1;
			}
			if(size[1]<0)
			{
				size[1]=0;
				moveSize[1]=-1;
			}
			if(size[0]>this.miniMap.viewSize[0]-this.rectSize[0])
			{
				size[0]=this.miniMap.viewSize[0]-this.rectSize[0];
				moveSize[0]=1;
			}
			if(size[1]>this.miniMap.viewSize[1]-this.rectSize[1])
			{
				size[1]=this.miniMap.viewSize[1]-this.rectSize[1];
				moveSize[1]=1;
			}
		}
		this.moveSize=moveSize;
		return size;
	}
	//完成矩形框的拖动过程
	LTOverviewMap.prototype.onRectMouseUp=function(e)
	{
		LTEvent.cancelBubble(e);
		var dragObject=this.dragObject;
		LTEvent.removeListener(dragObject.moveListener);
		LTEvent.removeListener(dragObject.upListener);
		window.clearInterval(dragObject.timeout);
		var point=this.getDragPoint([e.clientX,e.clientY]);
		if(!this.point)
		{
			this.dragPoint=this.miniMap.getPointLatLng([this.miniMap.viewSize[0]/2+point[0]-dragObject.startPosition[0],this.miniMap.viewSize[1]/2+point[1]-dragObject.startPosition[1]]);//这个参数代表本次移动是通过拖动信息浮窗上的矩形控制的，因此在移动之中要同时移动两个层this.rectBorder和this.rectBack
			this.miniMap.move([point[0]-dragObject.startPosition[0],point[1]-dragObject.startPosition[1]]);
		}
		this.map.move([(point[0]-dragObject.startPosition[0]+dragObject.preMove[0])*this.units,(point[1]-dragObject.startPosition[1]+dragObject.preMove[1])*this.units]);
		this.dragEvent=null;
		this.dragObject=null;
	}
	//初始化鹰眼地图
	LTOverviewMap.prototype.InitMap=function()
	{
		if(!this.map.loaded){return;}
		var point=this.point?this.point:this.map.getCenterPoint();
		if(!this.miniMap.loaded)
		{
			this.miniMap.centerAndZoom(point,this.getMiniMapZoom());
		}
		else
		{
			this.miniMap.moveToCenter(point);
			this.miniMap.zoomTo(this.getMiniMapZoom());
		}
		//初始化矩形框大小和位置
		var bounds=this.map.getBoundsLatLng();
		var tl=this.miniMap.getPixelCoord(new LTPoint(bounds.Xmin,bounds.Ymax));
		var br=this.miniMap.getPixelCoord(new LTPoint(bounds.Xmax,bounds.Ymin));
		this.rectSize=[br[0]-tl[0],br[1]-tl[1]];
		this.rectOffset=[0,0];
		var minSize=10;
		var maxSize=[parseInt(this.miniMap.viewSize[0]/2),parseInt(this.miniMap.viewSize[1]/2)];
		if(this.rectSize[0]<minSize)
		{
			this.rectOffset[0]=minSize-this.rectSize[0];
			this.rectSize[0]=minSize;
		}
		if(this.rectSize[1]<minSize)
		{
			this.rectOffset[1]=minSize-this.rectSize[1];
			this.rectSize[1]=minSize;
		}
		if(this.rectSize[0]>maxSize[0])
		{
			this.rectOffset[0]=this.rectSize[0]-maxSize[0];
			this.rectSize[0]=maxSize[0];
		}
		if(this.rectSize[1]>maxSize[1])
		{
			this.rectOffset[1]=this.rectSize[1]-maxSize[1];
			this.rectSize[1]=maxSize[1];
		}
		this.units=Math.pow(2,this.miniMap.getCurrentZoom()-this.map.getCurrentZoom());
		this.setRectPosition(this.rectBack,this.map.getCenterPoint());
		LTFunction.setSize(this.rectBack,this.rectSize);
		this.setRectPosition(this.rectBorder,this.map.getCenterPoint());
		LTFunction.setSize(this.rectBorder,this.rectSize);
	}
	//根据主地图缩放等级计算鹰眼地图缩放等级
	LTOverviewMap.prototype.getMiniMapZoom=function()
	{
		var zoom=this.zoom;
		if(typeof(zoom)=="number"){return zoom;}
		var index=this.map.zoomIndex+this.zoomAdd;
		//alert(index+"||"+this.miniMap.zoomLevels.length);
		if(index>=this.miniMap.zoomLevels.length){
			index=this.miniMap.zoomLevels.length-1;
		}
		
		if(index<0){index=0;}
		return index;
		//return this.miniMap.zoomLevels[index];
	}
	//返回鹰眼地图
	LTOverviewMap.prototype.getMiniMap=function()
	{
		return this.miniMap;
	}
	LTOverviewMap.prototype.setRectBackColor=function(color)
	{
		this.rectBorder.style.backgroundColor=color;
		this.rectBack.style.backgroundColor=color;
	}
	LTOverviewMap.prototype.setRectBorderColor=function(color)
	{
		this.rectBorder.style.borderColor=color;
		this.rectBack.style.borderColor=color;
	}
	LTOverviewMap.prototype.setRectBorderStroke=function(weight)
	{
		this.rectBorder.style.borderWidth=weight;
		this.rectBack.style.borderWidth=weight;
	}
	//地图移动后重新设置鹰眼地图
	LTOverviewMap.prototype.setRectPosition=function(rect,point)
	{
		if(!this.rectSize){return;}
		var p=this.miniMap.getPixelCoord(point);
		LTFunction.setPosition(rect,[p[0]-this.rectSize[0]/2,p[1]-this.rectSize[1]/2]);
	}
	//在主地图或者鹰眼地图移动时，实时设置矩形的位置
	LTOverviewMap.prototype.onMapMove=function()
	{
		this.setRectPosition(this.rectBorder,this.map.getCenterPoint());
		if(this.dragPoint){this.setRectPosition(this.rectBack,this.dragPoint);}
	}
	//在地图移动完成后进行移动鹰眼地图等操作
	LTOverviewMap.prototype.onMapMoveEnd=function()
	{
		if(!this.map.loaded){return;}
		if(!this.miniMap.loaded){this.InitMap();}
		if(!this.point)
		{
			if(!this.dragPoint && !this.miniMap.dragObject && (!this.miniMap.slideObject || this.miniMap.slideObject.mtype!="m_dblclick"))
			{
				this.miniMap.moveToCenter(this.map.getCenterPoint());
			}
		}
		else
		{//如果鹰眼地图是位置固定模式，则移动Back框位置
			this.dragPoint=this.map.getCenterPoint();
			this.onMapMove();
			this.dragPoint=null;
		}
		var zoom=this.getMiniMapZoom();
		if(zoom!=this.miniMap.getCurrentZoom()){this.miniMap.zoomTo(zoom);}
	}
	//启用鹰眼地图
	LTOverviewMap.prototype.enable=function()
	{
		if(this.listeners){return;}
		this.listeners=[
		LTEvent.bind(this.rectBack,"mousedown",this,this.onRectMouseDown),
		LTEvent.bind(this.map,"moveend",this,this.onMapMoveEnd),
		LTEvent.bind(this.map,"move",this,this.onMapMove),
		LTEvent.bind(this.map,"zoom",this,this.InitMap),
		LTEvent.bind(this.map,"resize",this,this.InitMap),
		LTEvent.bind(this.miniMap,"moveend",this,this.resetRect),
		LTEvent.bind(this.miniMap,"move",this,this.onMapMove)];
		this.InitMap();
	}
	//禁用鹰眼地图
	LTOverviewMap.prototype.disable=function()
	{
		var listener,listeners=this.listeners;
		if(!listeners){return;}
		while(listener=listeners.pop())
		{
			LTEvent.removeListener(listener);
		}
		this.listeners=null;
	}
	//用来将地图以控件模式添加到地图的对象，参数分别为：
	//	size		设置地图的大小，如：[200,200]
	//	point		可选，指定鹰眼地图中心，如果不指定，则随原地图而变化
	//	zoom		可选，指定鹰眼地图的缩放等级，如果不指定，则随原地图而变化
	//	zoomAdd		可选，如果没有指定zoom，则可以用zoomAdd指定鹰眼地图和原地图之间的缩放等级差
	function LTOverviewMapControl(direction,size,point,zoom,zoomAdd,pad)
	{
		LTFunction.inherit(this,LTBaseControl);
		pad=pad?pad:8;
		this.pad=pad;
		this.direction=(typeof(direction)=="number" && direction<=4 && direction>=-4)?parseInt(direction):4;
		var size=size?size:[260,170];
		this.point=point;
		this.zoom=zoom;
		this.zoomAdd=zoomAdd;
		this.buttonSrc=window._LT_omc_images?window._LT_omc_images:[window._LT_smc_activeXImg+"omc_close.gif",window._LT_smc_activeXImg+"omc_open.gif"];
		
		this.div=LTFunction.createDiv(1);
		this.div.style.overflow="hidden";
		LTFunction.setZIndex(this.div,800);
		this.resizeDiv=LTFunction.createDiv(1);
		this.div.appendChild(this.resizeDiv);
		this.resizeDiv.style.overflow="hidden";
		this.resizeDiv.style.backgroundColor="#D1D1DF";
		this.setMapPosition(this.direction);
		
		this.mapDiv=LTFunction.createDiv(1);
		this.mapDiv.style.backgroundColor="#FFFFFF";
		LTFunction.setSize(this.mapDiv,size);
		size=[size[0]+pad*2,size[1]+pad*2];
		LTFunction.setPosition(this.mapDiv,[pad,pad]);
		this.resizeDiv.appendChild(this.mapDiv);
		
		this.resizeDiv.style.border="solid 1px #9595A2";
		this.mapDiv.style.border="solid 1px #ADACBE";
		
		LTFunction.setSize(this.div,[size[0]+2,size[1]+2]);
		LTFunction.setSize(this.resizeDiv,size);
		this.size=size;
		
		this.button=document.createElement("img");
		this.button.style.position="absolute";
		LTFunction.setCursorStyle(this.button,"pointer");
		LTEvent.bind(this.button,"click",this,this.changeView);
		LTEvent.addListener(this.button,"dblclick",LTEvent.cancelBubble);
		LTEvent.addListener(this.button,"mousedown",LTEvent.cancelBubble);
		LTFunction.setZIndex(this.button,"10000");
		this.setButtonPosition(this.direction);
		this.show=true;
	}
	LTOverviewMapControl.prototype.setMapPosition=function(direction,pad)
	{
		pad=(typeof(pad)=="number")?pad:-this.pad;
		LTOverviewMapControl.setPosition(this.div,direction,false,0);
		LTOverviewMapControl.setPosition(this.resizeDiv,direction,true);
	}
	LTOverviewMapControl.prototype.setButtonPosition=function(direction,pad)
	{
		pad=(typeof(pad)=="number")?pad:this.pad;
		LTOverviewMapControl.setPosition(this.button,direction,false,pad+"px");
	}
	LTOverviewMapControl.prototype.setCollapsePosition=function(direction)
	{
		this.direction=direction;
	}
	LTOverviewMapControl.prototype.getMiniMap=function(e)
	{
		if(this.mini)
		{
			return this.mini.map;
		}
	}
	LTOverviewMapControl.setPosition=function(div,direction,flag,p)
	{
		var style=div.style;
		style.position="absolute";
		p=(typeof(p)=="number")?(p+"px"):"0px";
		if(direction==0){direction=4};
		if(direction<-1){style.right="auto";style.left=p;}
		else if(direction>1){style.left="auto";style.right=p;}
		else{style.right="auto";style.left=flag?p:"50%";}
		if((direction+6)%3==2){style.bottom="auto";style.top=p;}
		else if((direction+6)%3==1){style.top="auto";style.bottom=p;}
		else{style.bottom="auto";style.top=flag?p:"50%";}
	}
	LTOverviewMapControl.prototype.initialize=function(a)
	{
		if(!this.div || this.map){return false;}
		this.mini=new LTOverviewMap(a,this.mapDiv,this.point,this.zoom,this.zoomAdd);
		if(this.rectBackColor){this.mini.setRectBackColor(this.rectBackColor);}
		if(this.rectBorderColor){this.mini.setRectBorderColor(this.rectBorderColor);}
		if(this.rectBorderStroke){this.mini.setRectBorderStroke(this.rectBorderStroke);}
		if(this.show==true){this.mini.enable();}
		this.div.appendChild(this.button);
		if(!this.button.src){this.button.src=this.buttonSrc[0];}
	}
	LTOverviewMapControl.prototype.resizeTo=function(size)
	{
		if(this.slideObj){this.resizeEnd();}
		this.slideObj={"startSize":[parseInt(this.resizeDiv.style.width),parseInt(this.resizeDiv.style.height)],"endSize":size,"number":0,"timeout":window.setInterval(LTEvent.getCallback(this,this.resize),16)};
	}
	LTOverviewMapControl.prototype.resize=function()
	{
		var slideObj=this.slideObj;
		slideObj.number++;
		var totalNumber=25;
		
		var size=[slideObj.endSize[0]-(slideObj.endSize[0]-slideObj.startSize[0])*(Math.sin(Math.PI*(0.5-slideObj.number/totalNumber))+1)/2,slideObj.endSize[1]-(slideObj.endSize[1]-slideObj.startSize[1])*(Math.sin(Math.PI*(0.5-slideObj.number/totalNumber))+1)/2];
		LTFunction.setSize(this.resizeDiv,size);
		/*以下这个语句比较复杂，
		如果在IE下执行该语句，则会因为IE本身的处理机制而出现按钮跳动的情况，
		如果不在firefox下执行该语句，则会因为firefox不支持事件穿透，而遮挡地图上标记的点击
		因此采用选择性执行的方式
		*/
		if(!document.all){LTFunction.setSize(this.div,[size[0]+this.button.offsetWidth,size[1]+this.button.offsetHeight]);}
		if(slideObj.number==totalNumber){this.resizeEnd();}
	}
	LTOverviewMapControl.prototype.resizeEnd=function()
	{
		var slideObj=this.slideObj;
		window.clearInterval(slideObj.timeout);
		this.slideObj=null;
	}
	LTOverviewMapControl.prototype.changeView=function(e)
	{
		LTEvent.cancelBubble(e);
		if(this.show)
		{
			var size=[0,0];
			if(Math.abs(this.direction)==3){size[1]=this.size[1];}
			if(Math.abs(this.direction)==1){size[0]=this.size[0];}
			if(this.mini)
			{
				this.mini.disable();
				this.resizeTo(size);
			}
			else
			{
				LTFunction.setSize(this.resizeDiv,size);
			}
			this.button.src=this.buttonSrc[1];
			this.show=false;
		}
		else
		{
			if(this.mini)
			{
				this.mini.enable();
				this.resizeTo(this.size);
			}
			else
			{
				LTFunction.setSize(this.resizeDiv,this.size);
			}
			this.button.src=this.buttonSrc[0];
			this.show=true;
		}
		LTEvent.trigger(this,"viewchange",[this.show]);
	}
	LTOverviewMapControl.prototype.setButtonImage=function(closeImg,openImg)
	{
		this.buttonSrc=[closeImg,openImg];
		if(!this.buttonSrc[1]){this.buttonSrc[1]=this.buttonSrc[0];}
		this.button.removeAttribute("src");
		this.button.src=this.show?this.buttonSrc[0]:this.buttonSrc[1];
	}
	LTOverviewMapControl.prototype.setBorderColor=function(color)
	{
		this.resizeDiv.style.borderColor=color;
		this.mapDiv.style.borderColor=color;
	}
	LTOverviewMapControl.prototype.setBackColor=function(color)
	{
		this.resizeDiv.style.backgroundColor=color;
	}
	LTOverviewMapControl.prototype.setRectBackColor=function(color)
	{
		this.rectBackColor=color;
		if(this.mini){this.mini.setRectBackColor(color);}
	}
	LTOverviewMapControl.prototype.setRectBorderColor=function(color)
	{
		this.rectBorderColor=color;
		if(this.mini){this.mini.setRectBorderColor(color);}
	}
	LTOverviewMapControl.prototype.setRectBorderStroke=function(weight)
	{
		this.rectBorderStroke=weight;
		if(this.mini){this.mini.setRectBorderStroke(weight);}
	}
	LTOverviewMapControl.prototype.isOpen=function(e)
	{
		return this.show;
	}
	LTOverviewMapControl.prototype.getObject=function()
	{
		return this.div;
	}
	LTOverviewMapControl.prototype.remove = function()
	{
		this.mini.disable();
		this.map=null;
	}
	LTOverviewMapControl.prototype.depose=function()
	{
		this.mini.disable();
		LTEvent.deposeNode(this.div);
		this.div=null;
	};
	window.LTOverviewMap=LTOverviewMap;
	window.LTOverviewMapControl=LTOverviewMapControl;
}
LTMapNS();