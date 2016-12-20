//本文件是JS API之中的LTMaps对象，用来代表一个矩形的坐标范围
//并提供一些相关的方法，比如矩形之间的交叉判断，点和矩形的位置判断，线和矩形的交点求取等
//其中X代表经度，Y代表纬度
function LTMapNS()
{
	function LTMaps(container)
	{
		//初始化Container
		if(document.all){try{document.execCommand("BackgroundImageCache", false, true);}catch(e){}}
		this.container=(typeof container=="object")?container:document.getElementById(container);
		if(!this.container){alert('没有传入用来显示地图的层');return}
		//记录container层内的内容
		this.originChildren=[];
		var child;
		while(child=this.container.firstChild)//循环删除DIV中所有的子元素
		{
			this.originChildren.push(child);
			this.container.removeChild(child);
		}
		this.container.align="left";
		this.mapCursor=["default","move"];
		var style=this.container.style;
		if(style.position!="absolute"){style.position="relative";}
		//允许tips的文字可选 by lixiaoying 09/12/05
		//LTFunction.setUnSelectable(this.container);
		style.overflow="hidden";
		if(window._LT_map_bgImg)
		{
			style.backgroundImage="url("+window._LT_map_bgImg+")";
		}

		//获得Container大小
		var viewSize=this.getContainerSize();

		//初始化各层
		this.imgSize=window._LT_map_imgSize;
		this.baseUnits=window._LT_map_baseUnits?window._LT_map_baseUnits:256;
		this.methodConfig=window._LT_map_methodConfig;//8
		this.errorImgUrl=window._LT_map_errorImgURL;//LTMapTile.js中用到，当底图不存在时，用默认图片替换。这种几率很小。
		this.scrollSpeed=window._LT_map_scrollSpeed?window._LT_map_scrollSpeed:1;//滚动的速度，一次放大或缩小一级（一个比例尺zoom）
		this.slideNum=window._LT_map_slideNumber?window._LT_map_slideNumber:12;
		//处理缩放级别，并兼容以前的缩放级别模式
		this.zoomLevels=(window._LT_map_zoomLevels && window._LT_map_zoomLevels.length>0)?window._LT_map_zoomLevels:[];

		this.imgURLs=(typeof window._LT_map_imgURL=="string")?[window._LT_map_imgURL]:window._LT_map_imgURL;//图片服务器
		this.copyright = window._LT_map_copyright?window._LT_map_copyright:"";
		this.arrows = window._LT_map_arrows?window._LT_map_arrows:"";
		
		this.overlays=[];
		this.p_overlays=[];	//用来保存在地图加载之前添加到地图上的标注
		this.controls=[];
		this.canDrag=true;
		this.canMove=true;
		//mapsDiv是用来放置地图图片的层，overlaysDiv所在的因为要随着地图移动，也放置到mapsDiv之中
		this.mapsDiv=LTFunction.createDiv(1,null,100);
		LTFunction.setCursorStyle(this.mapsDiv,this.mapCursor[0]);
		LTFunction.setCursorStyle(this.container,this.mapCursor[0]);
		//允许tips的文字可选 by lixiaoying 09/12/05
		//LTFunction.setUnSelectable(this.mapsDiv);
		var style=this.mapsDiv.style;
		style.overflow="visible";
		this.container.appendChild(this.mapsDiv);
		
		var maskDiv=LTFunction.createDiv(1,null,180);
		maskDiv.id="lt_maskDiv";
		LTFunction.setSize(maskDiv,["100%","100%"]);
		maskDiv.style.backgroundImage="url("+window._LT_map_maskBackgroundURL+")";
		//允许tips的文字可选 by lixiaoying 09/12/05
		//LTFunction.setUnSelectable(maskDiv);
		this.mapsDiv.appendChild(maskDiv);
		this.maskDiv=maskDiv;

		//用来放地图标注的层
		this.overlaysDiv=LTFunction.createDiv(1,null,500);
		this.overlaysDiv.id="lt_overlaysDiv";
		//允许tips的文字可选 by lixiaoying 09/12/05
		//LTFunction.setUnSelectable(this.overlaysDiv);
		var style=this.overlaysDiv.style;
		style.overflow="visible";
		this.mapsDiv.appendChild(this.overlaysDiv);
		//监听地图右键菜单
		LTEvent.addListener(this.container,"contextmenu",LTEvent.cancelBubble);
		
		//动画是否开启，true为开启,false为关闭
		this.cartoon = false;
		//判断是否是双击
		this.dbclick = false;
		//动画的播放时间
		this.cartoonPlayTime = 40;
		//动画的停留时间
		this.cartoonTime = 100;
		
		//鼠标位置放大或缩小时的动画效果层
		this.cursorArrowsDiv = LTFunction.createDiv(1,null,100);
		this.cursorArrowsDiv.id = "arrows";
		this.container.appendChild(this.cursorArrowsDiv);
		//地图的事件捕获
		LTEvent.bind(this.container,"dblclick",this,this.onDoubleClick);
		LTEvent.bind(this.container,"mousedown",this,this.onMouseDown);
		LTEvent.bind(this.container,"click",this,this.onClick);
		LTEvent.bind(window,"resize",this,this.resizeMapDiv);
		LTEvent.bind(window,"move",this,this.resizeMapDiv);
		LTEvent.bind(window,"load",this,this.resizeMapDiv);
		this.setViewSize(viewSize);

		var bufferNumber=(typeof window._LT_map_bufferNumber=="number")?window._LT_map_bufferNumber:500;
		this.tileMgr=new LTMapTileMgr(this,this.imgSize,bufferNumber);
		this.maxPixel=1000;
		this.slideMaxZoom=typeof window._LT_map_slideMaxZoom=="number"?window._LT_map_slideMaxZoom:4;
		this.cityNameAndZoom=this.centerAndZoom;
		this.dbclickToCenter=true;
		setTimeout(LTEvent.getCallback(this,this.checkContainer),5000);
//		记录图像总数
		this.imgTotalNumber = 0;
		
		var logoFlag=true;
		try{if(typeof LTMaps.caller.arguments[0] == "object"){if(LTMaps.caller.arguments[0].constructor==LTMaps){logoFlag=false;}}}catch(e){}
		if(logoFlag)//如果不是鹰眼
		{
			if(!window._LT_map_disableProgressBar)
			{
				this.progress=new LTProgressControl();
				this.addControl(this.progress);
			}
			if(LTLogoControl)
			{
				this.logoControl=new LTLogoControl("<%=LOGO%>",window._LT_map_logoConfig);
				this.addControl(this.logoControl);
			}
			LTEvent.trigger(window,"ltmapscreate",[this]);
		}
	}
	LTMaps.prototype.getDocument=function(){return this.container.ownerDocument?this.container.ownerDocument:document;}
	//在地图运行1秒之后检查地图是否正常,如果正常,则清除container层内原有内容
	LTMaps.prototype.checkContainer=function()
	{	
		//此函数在地图渲染出来后5s后调用，但每次都是if都是false ，return;似乎没有什么用，上面的注释说是清除container层的原有内容，但此明明是添加
		if(this.originChildren==0 || this.mapsDiv.style.visibility!="hidden"){return;}
		var child;
		while(child=this.originChildren.shift())
		{
			this.container.appendChild(child);
		}
	}
	//地图所在层大小变化后，重新配置地图
	LTMaps.prototype.resizeMapDiv=function()
	{
		var size=this.getContainerSize();
		if(size[0]==99 && size[1]==99){setTimeout(LTEvent.getCallback(this,this.resizeMapDiv),1000)}
		if(this.viewSize && size[0]==this.viewSize[0] && size[1]==this.viewSize[1]){return;}
		this.setViewSize(size);
		this.loaded=false;
		if(this.centerPoint && typeof this.zoom=="number")
		{
			this.centerAndZoom(this.centerPoint,this.getZoomIndex(this.zoom));
		}
	}
	LTMaps.prototype.getContainer=function()
	{
		return this.container;
	}
	LTMaps.prototype.getZoomIndex=function(zoom)
	{
		zoom=parseInt(zoom);
		for(var i=0;i<this.zoomLevels.length;i++)
		{
			if(this.zoomLevels[i]==zoom)			
				return i;
		}
		return -1;
	}
	//重新设置地图大小
	LTMaps.prototype.getContainerSize=function()
	{
		return LTFunction.getSize(this.container);
	}
	LTMaps.prototype.setViewSize=function(viewSize)
	{
		LTFunction.setSize(this.overlaysDiv,viewSize);
		LTFunction.setSize(this.maskDiv,viewSize);
		this.viewSize=viewSize;
		LTEvent.trigger(this,"resize",[viewSize]);
	}
	LTMaps.prototype.getCenterPoint=function()
	{
		return this.centerPoint;
	}
	LTMaps.prototype.getCurrentZoom=function(bool)
	{
		if(bool){
			return this.zoom;
		}else{
			return this.getZoomIndex(this.zoom);
		}
	}
	LTMaps.prototype.getViewSize=function()
	{
		return this.viewSize;
	}
	LTMaps.prototype.getImgNumber=function()
	{
		return this.tileMgr.imgNumber;
	}
	LTMaps.prototype.getTotalImgNumber=function()
	{
		return this.imgTotalNumber;
//		return this.tileMgr.imgTotalNumber;
	}
	LTMaps.prototype.getErrorImgNumber=function()
	{
		return this.tileMgr.imgErrorNumber;
	}
	LTMaps.prototype.getZoomUnits = function(zoom)
	{//获得比例尺的换算单位
		zoom = this.zoomLevels[zoom];
		return ((20037508.3427892)/Math.pow(2,zoom-1))/this.imgSize;
	}
	LTMaps.prototype.getBoundsLatLng=function()
	{//获取地图的边界的经纬度
		//将中心点坐标NTU转换成墨卡托坐标
		var centerPoint_M = new LTPointMercator(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());

		var centerPoint=this.centerPoint;
		var viewSize=this.viewSize;
		var zoomUnit=this.zoomUnits;
		var Xmin=parseInt(centerPoint.getLongitude()-zoomUnit*viewSize[0]/2);
		var Ymin=parseInt(centerPoint.getLatitude()-zoomUnit*viewSize[1]/2);
		var Xmax=parseInt(centerPoint.getLongitude()+zoomUnit*viewSize[0]/2);
		var Ymax=parseInt(centerPoint.getLatitude()+zoomUnit*viewSize[1]/2);
		
		//将中心点坐标（墨卡托）转换成NTU
		var centerPoint_N = new LTPointWGS84(centerPoint.getLongitude(),centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
		
		var min_N = new LTPointWGS84(Xmin,Ymin);
		var max_N = new LTPointWGS84(Xmax,Ymax);
		
		return new LTBounds(min_N.getLongitude(),min_N.getLatitude(),max_N.getLongitude(),max_N.getLatitude());
	}
	LTMaps.prototype.getDrawBounds=function()
	{//获取地图不需重新绘制的区域
		var span=this.maxPixel*this.zoomUnits;
		var areaCenter=this.areaCenter;

		var leftDown = new LTPointWGS84((areaCenter.getLongitude()-span),(areaCenter.getLatitude()-span));
		var rigthUp = new LTPointWGS84((areaCenter.getLongitude()+span),(areaCenter.getLatitude()+span));
		
		return new LTBounds(leftDown.getLongitude(),leftDown.getLatitude(),rigthUp.getLongitude(),rigthUp.getLatitude());

	}
	LTMaps.prototype.addControl=function(control)
	{//添加一个控件
		//将控件的层添加到地图
		if(control.initialize(this)==false){return false;}
		var obj=control.getObject();
		
		if(obj)
		{
			LTEvent.addListener(obj,"contextmenu",LTEvent.cancelBubble);
			this.container.appendChild(obj);
			if(obj.style.zIndex==0){LTFunction.setZIndex(obj,1100);}
		}
		//控件的初始化操作
		this.controls.push(control);
		LTEvent.trigger(this,"addcontrol",[control]);
	}
	LTMaps.prototype.addMenuControl=function(control)
	{//添加一个右键控件
		//将控件的层添加到地图
		if(control.initialize(this)==false){return false;}
	}
	LTMaps.prototype.removeControl=function(control,depose)
	{
		//控件的取消操作
		if(!control){return;}
		if(control.remove){control.remove();}
		var obj=control.getObject();
		if(obj && obj.parentNode)
		{
			obj.parentNode.removeChild(obj);
		}
		//从控件数组之中删除控件
		LTFunction.deleteFromArray(this.controls,control);
		if(depose && control.depose){control.depose();}
	}
	LTMaps.prototype.addOverLay=function(overlay,keep)
	{
		//标注的初始化操作
		if(!this.loaded)
		{
			this.p_overlays.push(overlay);
			return;
		}
		if(overlay.initialize(this)==false){return false;}
		var obj=overlay.getObject();
		//window.console.log(obj);
		if(obj)
		{
			this.overlaysDiv.appendChild(obj);
			if(obj.style.zIndex==0){LTFunction.setZIndex(obj,500);}
		}
		overlay.reDraw(true);
		LTEvent.trigger(overlay,"add",[this]);
		overlay._keep=keep;
		this.overlays.push(overlay);
	}
	LTMaps.prototype.removeOverLay=function(overlay,depose)
	{
		if(!overlay){return;}
		if(overlay.remove){overlay.remove();}
		var obj=overlay.getObject();
		if(obj && obj.parentNode)
		{
			obj.parentNode.removeChild(obj);
		}
		LTEvent.trigger(overlay,"remove",[]);
		if(depose && overlay.depose){overlay.depose();}
		//从标注数组之中删除标注
		LTFunction.deleteFromArray(this.overlays,overlay);
	}
	LTMaps.prototype.clearOverLays=function()
	{
		var overlay;
		for(var i=this.overlays.length-1;i>=0;i--)
		{
			if(!this.overlays[i] || !this.overlays[i]._keep)
			{
				this.removeOverLay(this.overlays[i]);
			}
		}
	}
	LTMaps.prototype.getPointLatLng=function(point,center)
	{//将地图上相对于container的像素坐标转化为地理坐标，参数是数组[left,top],返回值是LTPoint
		
		var zoomUnit=this.zoomUnits;
		center=center?center:this.centerPoint;
		
		//将中心点NTU转换成墨卡托坐标
		var center_M = new LTPointMercator(center.getLongitude(),center.getLatitude());
		center = new LTPoint(center_M.getLongitude(),center_M.getLatitude());
		
		//把墨卡托的经纬度转换成NTU
		var point_N = new LTPointWGS84(center.getLongitude()+zoomUnit*(point[0]-this.viewSize[0]/2),center.getLatitude()-zoomUnit*(point[1]-this.viewSize[1]/2));

		return new LTPoint(point_N.getLongitude(),point_N.getLatitude());
	}
	LTMaps.prototype.getPixelCoord=function(point,center)
	{//将地理坐标转化为地图上点的像素坐标，相对于container的，参数是LTPoint,返回值是数组[left,top]
		var zoomUnit=this.zoomUnits;
		center=center?center:this.centerPoint;
		//将NTU转换成墨卡托坐标
		var center_M = new LTPointMercator(center.getLongitude(),center.getLatitude());
		center = new LTPoint(center_M.getLongitude(),center_M.getLatitude());
		
		//将NTU转换成墨卡托坐标
		var point_M = new LTPointMercator(point.getLongitude(),point.getLatitude());
		point = new LTPoint(point_M.getLongitude(),point_M.getLatitude());
		
		var px=[Math.round((point.getLongitude()-center.getLongitude())/zoomUnit+this.viewSize[0]/2),Math.round((center.getLatitude()-point.getLatitude())/zoomUnit+this.viewSize[1]/2)];
		
		//将中心点坐标（墨卡托）转换成NTU
		var centerPoint_N = new LTPointWGS84(center.getLongitude(),center.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
		
		return px;
	}
	
	LTMaps.prototype.getOverLayPosition=function(point)
	{//将地理坐标转化为地图上点的像素坐标，相对于container的，参数是LTPoint,返回值是数组[left,top]
		var p=this.getPixelCoord(point);
		var flag=p[0]>this.maxPixel*(-0.5) && p[1]>this.maxPixel*(-0.5) && p[0]<this.maxPixel*(1.5) && p[1]<this.maxPixel*(1.5);
		return [p[0]-parseInt(this.mapsDiv.style.left),p[1]-parseInt(this.mapsDiv.style.top),flag];
	}
	
	LTMaps.prototype.toMapId = function(point,zoom)
	{//转换物理坐标为块数坐标
		
		//将zoom转换成17-0
		zoom=this.zoomLevels[zoom];

		//将中心点坐标NTU转换成墨卡托坐标
		var point_M = new LTPointMercator(point.getLongitude(),point.getLatitude());
		point = new LTPoint(point_M.getLongitude(),point_M.getLatitude());
		
		var span=(20037508.3427892)/Math.pow(2,zoom-1);
		var bx_=point.getLongitude()/span;
	    var by_=point.getLatitude()/span;
		var bx=parseInt(point.getLongitude()/span);
	    var by=parseInt(point.getLatitude()/span);
		
		//判断经纬度出现负值时所在图片的坐标
		if(bx<0)
			bx = parseInt(bx_ - 1);
		
		if(by<0)
			by = parseInt(by_ - 1);
		
	    return [bx,by,(point.getLongitude()-bx*span)/span*this.imgSize,(point.getLatitude()-by*span)/span*this.imgSize];
	}
	LTMaps.prototype.centerAndZoom=function(point,zoom)
	{//设置地图的中心点坐标和缩放倍数
		if(typeof point!="object" && LTPlaceList)
		{
			var placeList=LTPlaceList.getDefault();
			if(placeList)
			{
				point=placeList.getPoint(point);
			}
		}
		
		var ARR_CITY=window.ARR_CITY;
		if(typeof point=="string" && ARR_CITY && ARR_CITY[point]){point= new LTPoint(ARR_CITY[point][0],ARR_CITY[point][1]);}
		if(typeof zoom=="string" && zoom!="") zoom=parseInt(zoom);	
		
		//现在的地图改为墨卡托投影地图，并且地图的缩放等级要改为国际准备，所以现在的等级与以前的等级是相反的，为了用户操作考虑，以下为兼容以前的等级
		//this.zoom = this.zoomLevels[zoom];
		//zoom = this.zoom;
		zoom=this.zoomLevels[zoom];
		
		//判断zoom是否在指定范围之中
		var index=this.getZoomIndex(zoom);
		if(index<0){return;}
		this.zoomIndex=index;
		this.lastCenterPoint=point;
		this.lastZoom=this.zoomLevels[this.zoomIndex];
		
		//this.zoomUnits=this.getZoomUnits(this.lastZoom);
		this.zoomUnits=this.getZoomUnits(this.zoomIndex);
		
		var flag;
		if(!this.loaded)
		{
			this.initialize();
			flag=true;
		}
		if(this.lastZoom==this.zoom && !flag)
		{
			this.setCenterAtLatLng(point);
			LTEvent.trigger(this,"moveend",[this.centerPoint]);//moveend事件在哪添加的呢？
		}
		else
		{
			this.centerPoint=point;
			this.zoom=this.lastZoom;
			if(!this["mapsDiv_"+this.zoomIndex])
			{
				this["mapsDiv_"+this.zoomIndex]=LTFunction.createDiv(1,null,100);
				LTFunction.setPosition(this["mapsDiv_"+this.zoomIndex],[0,0]);
				this["mapsDiv_"+this.zoomIndex].id = "lt_mapsDiv_" + this.zoomIndex;
				this.mapsDiv.appendChild(this["mapsDiv_"+this.zoomIndex]);
			}
			this.setTopMapDiv(this.zoomIndex);
			this.moveMapImages(true);	
			LTEvent.trigger(this,"zoom",[0,this.zoom]);
			LTEvent.trigger(this,"slidezoom",[this.zoomIndex]);
			if(this.p_overlays.length>0)
			{
				var overlay;
				while(overlay=this.p_overlays.shift())
				{
					this.addOverLay(overlay);
				}
			}
		}
	}
	LTMaps.prototype.returnLastView=function()
	{//返回上一视图的函数
		if(typeof this.lastZoom=="number" && this.lastCenterPoint)
		{
			var lastZoom = this.getZoomIndex(this.lastZoom);
			//moveToCenter方法为用户调用类，需要zoom传入为以前方式
			this.moveToCenter(this.lastCenterPoint,lastZoom);
		}
	}
//获得单元格的数目,应该是图像数,但是我发现有时候这个数目大于图像数,所以这个数字不能作为总图像数
//这个函数目前没有被人调用
	LTMaps.prototype.getMapTableNum = function()
	{//静态方法-获取单元格的数目
		var cellsNum = Math.ceil(this.viewSize[0]/this.imgSize);
		var rowsNum = Math.ceil(this.viewSize[1]/this.imgSize);
		rowsNum += 1;
		cellsNum += 1;
		return [cellsNum,rowsNum];
	}
	LTMaps.prototype.initialize=function()
	{//地图初始化，生成地图图片
		LTEvent.trigger(this,"init");
		this.loaded=true;
	}
	LTMaps.prototype.moveMapImages=function(flag)
	{//在地图移动的时候变换图片,flag为true代表初始化或改变缩放等级，将当前中心点变为区域中心点
		var imgBounds=this.imgBounds;
		var bounds=this.getBoundsLatLng();
		
		if(!flag && imgBounds && imgBounds.containsBounds(bounds)){
			this.toCenter(false);return;
		}
		var zoom=this.zoom;
		var zoomUnits=this.zoomUnits;
		var centerPoint=this.centerPoint;
		var areaCenter=this.areaCenter;
		var zoom_toMapId = this.getZoomIndex(zoom);
		var centerBox = this.toMapId(centerPoint,zoom_toMapId);
		//将中心点坐标NTU转换成墨卡托坐标
		var centerPoint_M = new LTPointMercator(centerPoint.getLongitude(),centerPoint.getLatitude());
		centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());
		//window.console.log(centerPoint);
		//window.console.log("centerBox:" +centerBox);//710,243,101.67236328125,105.38330078125
		//如果当前中心点离区域中心点太远，则将当前中心点变为区域中心点window.console.log("flag1");
		if(!flag && areaCenter && (Math.abs(areaCenter.getLongitude()-centerPoint.getLongitude())/zoomUnits+this.viewSize[0]/2>this.maxPixel || Math.abs(areaCenter.getLatitude()-centerPoint.getLatitude())/zoomUnits+this.viewSize[1]/2>this.maxPixel)){flag=true;}

		if(flag){
			this.areaCenter=centerPoint
		}
		//将不在列表之中的图片清除
		var imgSize=this.imgSize;
		var minX=centerBox[0]-Math.ceil((this.viewSize[0]/2-centerBox[2])/imgSize);
		var minY=centerBox[1]-Math.ceil((this.viewSize[1]/2-centerBox[3])/imgSize);
		var maxX=centerBox[0]+Math.ceil((this.viewSize[0]/2+centerBox[2])/imgSize)-1;
		var maxY=centerBox[1]+Math.ceil((this.viewSize[1]/2+centerBox[3])/imgSize)-1;
		var mapImages=this.tileMgr.mapImages;
		var offset=[-this.areaCenter.getLongitude()/zoomUnits,this.areaCenter.getLatitude()/zoomUnits];
		for(var imageName in mapImages)
		{
			var tile=mapImages[imageName];
			var id=tile.id;
			if(!id){continue;}//从for-each之中取得的项目，为避免用户网页上对array进行了prototype修改，必须县进行判断
			if(id[2]==this.zoomIndex && (minX>id[0] || maxX<id[0] || minY>id[1] || maxY<id[1]))
			{	
				this.hideMapImage(tile);
			}
			else if(id[2]!=this.zoomIndex && !this.slideObject &&(this.zoomLevels[id[2]]!=this.oZoom || !tile.loaded))
			{
				this.hideMapImage(tile);
			}
			else if(this.zoomLevels[id[2]]==this.oZoom)
			{
				this.tileMgr.showTile(id,[offset[0]*Math.pow(2,zoom-this.oZoom),offset[1]*Math.pow(2,zoom-this.oZoom)],flag);
			}
		}
		//添加或重新设置所有图片
		this.imgTotalNumber = 0;
		for(var x=minX;x<=maxX;x++)
		{
			for(var y=minY;y<=maxY;y++)
			{
				this.imgTotalNumber++;
				this.tileMgr.showTile([x,y,this.zoomIndex],offset,flag);
			}
		}
		//转换为
		var min_N = new LTPointWGS84(minX*zoomUnits*imgSize,minY*zoomUnits*imgSize);
		var max_N = new LTPointWGS84((maxX+1)*zoomUnits*imgSize,(maxY+1)*zoomUnits*imgSize);
		this.imgBounds=new LTBounds(min_N.getLongitude(),min_N.getLatitude(),max_N.getLongitude(),max_N.getLatitude());
		//this.imgBounds=new LTBounds(minX*zoomUnits*imgSize,minY*zoomUnits*imgSize,(maxX+1)*zoomUnits*imgSize,(maxY+1)*zoomUnits*imgSize);
		//window.console.log(minX*zoomUnits*imgSize + "," + minY*zoomUnits*imgSize);
		//window.console.log((maxX+1)*zoomUnits*imgSize + "," + (maxY+1)*zoomUnits*imgSize);
		
		//将中心点坐标（墨卡托）转换成NTU
		var centerPoint_N = new LTPointWGS84(centerPoint.getLongitude(),centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
		this.toCenter(flag);
		return;
	}
	LTMaps.prototype.toCenter=function(flag)
	{//将地图的centerPoint移动到地图图层中心
		//将中心点NTU转换成墨卡托
		var centerPoint_M = new LTPointMercator(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());
		var centerPoint=this.centerPoint;
		//var zoomUnits=this.getZoomUnits(this.zoom);
		var zoom = this.getZoomIndex(this.zoom);
		var zoomUnits=this.getZoomUnits(zoom);
		var divZoom=this.divZoom?this.divZoom:1;
		var position=[this.viewSize[0]/2-(centerPoint.getLongitude()-this.areaCenter.getLongitude())/zoomUnits*divZoom,this.viewSize[1]/2+(centerPoint.getLatitude()-this.areaCenter.getLatitude())/zoomUnits*divZoom];
		//将中心点墨卡托转换成NTU
		var centerPoint_N = new LTPointWGS84(centerPoint.getLongitude(),centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
		
		/*地图动画层的位置*/
		if (this.mapsDiv.style.left == "" && this.mapsDiv.style.top == "")
		{
			this.deltaImgPosition = [0, 0];
		}
		else
		{
			this.deltaImgPosition = [Math.floor((centerPoint.getLongitude()-this.areaCenter.getLongitude())/zoomUnits*divZoom),Math.floor((centerPoint.getLatitude()-this.areaCenter.getLatitude())/zoomUnits*divZoom)];
		}
		if (this.slideObject) {
			var slideObject = this.slideObject;
			if(!this.dbclick){
				if (this["mapsDiv_" + slideObject.oZIndex]) {
					var imgs = this["mapsDiv_" + slideObject.oZIndex].getElementsByTagName("img");
					for (var i = 0; i < imgs.length; i++) {
						imgs[i].style.left = (parseInt(imgs[i].style.left) + Math.round((parseInt(this.mapsDiv.style.left) - position[0]- this.deltaImgPosition_temp[0]) / 2))  + "px";
						imgs[i].style.top = (parseInt(imgs[i].style.top) + Math.round((parseInt(this.mapsDiv.style.top) - position[1] + this.deltaImgPosition_temp[1]) / 2)) + "px";
					}
					this.deltaImgPosition_temp = [0,0];
				}
			}else{
				if (this["mapsDiv_" + slideObject.oZIndex]) {
					var imgs = this["mapsDiv_" + slideObject.oZIndex].getElementsByTagName("img");
					this.deltaImgPosition_temp = [0,0];
					for(var i = 0; i < imgs.length; i++){
						imgs[i].style.left = (parseInt(imgs[i].style.left) + Math.round((parseInt(this.mapsDiv.style.left) - position[0]- this.deltaImgPosition_temp[0])))  + "px";
						imgs[i].style.top = (parseInt(imgs[i].style.top) + Math.round((parseInt(this.mapsDiv.style.top) - position[1] + this.deltaImgPosition_temp[1]))) + "px";
					}
				}
			}
		}
		//地图定位
		LTFunction.setPosition(this.mapsDiv,position);
		//叠加物定位
		LTFunction.setPosition(this.maskDiv,[-position[0],-position[1]]);
		if(flag==true)
		{
			//this.overlaysDiv.style.display = "block";
			var overlays=this.overlays;
			var overlaysLen=overlays.length;
			for(var i=0;i<overlaysLen;i++)
			{
				overlays[i].reDraw(flag);
			}
		}
		LTEvent.trigger(this,"move",[this.centerPoint,flag==true]);
	}
	LTMaps.prototype.showMapImage=function(bx,by,zoomIndex,offset,flag)
	{
		this.tileMgr.showTile([bx,by,zoomIndex],offset,flag);
	}
	LTMaps.prototype.hideMapImage=function(tile)
	{
		this.tileMgr.hideTile(tile);
	}
	LTMaps.prototype.getMapImagesUrl=function(bx,by,zoom)
	{//获取图片的网址
		
		//将zoom转换成17-0
		zoom=this.zoomLevels[zoom];
		
		if(!window._LT_map_useStaticFile)
		{
			return this.imgURLs[(bx+by)%this.imgURLs.length] + "bx=" + bx + "&by=" + by + "&level=" + zoom;
		}
		zoom+=8-this.methodConfig;
		var nGrade=Math.ceil((zoom-5)/4);
		var nPreRow=0,nPreCol=0,nPreSize=0;
		var path="";
		for(var i=0;i<nGrade;i++)
		{
			//每级最大网格数为  16* 16 = 256(相关于子目录数和文件数)
			var nSize=1<<(4*(nGrade-i));//计算当前目录包括的单元数(网格距离）
			var nRow =parseInt((bx-nPreRow*nPreSize)/nSize);  //得到行，列值
			var nCol =parseInt((by-nPreCol*nPreSize)/nSize);
			path+=((nRow>9)?nRow:"0"+nRow)+""+((nCol>9)?nCol:"0"+nCol)+"/";
			nPreRow = nRow;
			nPreCol = nCol;
			nPreSize = nSize;
		}
		var imgURLs=this.imgURLs;
		var id=(((bx)&((1<<20)-1))+(((by)&((1<<20)-1))*Math.pow(2,20))+(((zoom)&((1<<8)-1))*Math.pow(2,40)));
		
		return imgURLs[Math.abs(bx+by)%imgURLs.length]+zoom+"/"+path+id+(window._LT_map_staticFileType?window._LT_map_staticFileType:".png");
	}
	LTMaps.prototype.zoomTo=function(zoom)
	{//改变地图的缩放级别
		zoom=this.zoomLevels[zoom];
		if (zoom == this.zoom) {
			this.zoomToByStyle(); //通过鼠标滑轮改变缩放等级的时候
			return;
		}
		var index = this.getZoomIndex(zoom);
		if (index < 0) {
			return;
		}
		var oZoom = this.zoom;
		var oZIndex = this.zoomIndex;
		this.zoomIndex = index;
		this.zoom = this.zoomLevels[this.zoomIndex];
		this.zoomUnits = this.getZoomUnits(this.zoomIndex);
		//地图动画效果
		if(this.cartoon){
			//地图动画只允许在缩放一级时才有效
			if(Math.abs(this.zoom-this.zoomLevels[oZIndex])==1)
			{	
				//假如支持滑动缩放等级
				this.mapCartoon(oZIndex,index,"zoomto");
			}else{
				//由于在指定删除缓存中的哪几级图片时，有时删除不彻底，所以在每次在执行delMapsDivCache时都全部删除
				//删除地图上存在的图层
				if (this["mapsDiv_" + oZIndex]) {
					this.delMapsDivCache(oZIndex,oZIndex,true);
				}
				if (this["mapsDiv_" + (oZIndex+1)]) {
					this.delMapsDivCache((oZIndex+1),(oZIndex+1),true);
				}
				if (this["mapsDiv_" + (oZIndex-1)]) {
					this.delMapsDivCache((oZIndex-1),(oZIndex-1),true);
				}
				if (this["mapsDiv_" + (oZIndex-2)]) {
					this.delMapsDivCache((oZIndex-2),(oZIndex-2),true);
				}
				if (!this["mapsDiv_" + this.zoomIndex]) {
					this["mapsDiv_" + this.zoomIndex] = LTFunction.createDiv(1);
					this["mapsDiv_" + this.zoomIndex].id = "lt_mapsDiv_"+this.zoomIndex;
					this.mapsDiv.appendChild(this["mapsDiv_" + this.zoomIndex]);
				}
				this.moveMapImages(true);
			}
			LTEvent.trigger(this, "slidezoom", [this.zoomIndex]);
		}
		else
		{
			if (!this["mapsDiv_" + this.zoomIndex]) {
				this["mapsDiv_" + this.zoomIndex] = LTFunction.createDiv(1);
				this["mapsDiv_" + this.zoomIndex].id = "lt_mapsDiv_"+this.zoomIndex;
				this.mapsDiv.appendChild(this["mapsDiv_" + this.zoomIndex]);
			}
			
			this.setTopMapDiv(oZIndex);
			LTEvent.trigger(this, "slidezoom", [this.zoomIndex]);
			this.moveMapImages(true);
		}
		LTEvent.trigger(this, "zoom", [this.oZoom, this.zoom]);
		return this.zoomObject;
	}
	//地图动画开启方法
	LTMaps.prototype.mapCartoonControl = function(bool)
	{
		if(typeof bool == "undefined")
		{
			this.cartoon = true;
		}
		else
		{
			this.cartoon = (bool&&bool==true)?true:false;
		}
	}
	//删除地图上的瓦片图层和缓存的图片,cartoonIndex为动画层的ID，index为要显示的层的,allTile为要删除缓存图片的数（true为全部删除，false为指定删除）
	LTMaps.prototype.delMapsDivCache = function(cartoonIndex,index,allTile)
	{
		var mapsDivObj = this["mapsDiv_" + (cartoonIndex)]
		if(mapsDivObj && mapsDivObj.parentNode)
		{
			mapsDivObj.parentNode.removeChild(mapsDivObj);
		}
		this["mapsDiv_" + (cartoonIndex)] = null;
		
		if(allTile){
			this.tileMgr.mapImages = [];
			this.tileMgr.bufferImages = [];
		}else{
			//删除缓存中的地图图片
			var mapImages = this.tileMgr.mapImages;
			for (var imageName in mapImages) {
				var tile = mapImages[imageName];
				var id = tile.id;
				if (id[2] == index) {
					this.hideMapImage(tile);
				}
			}
			var mapImages = this.tileMgr.bufferImages;
			for (var imageName in mapImages) {
				tile = mapImages[imageName];
				var id = tile.id;
				if (typeof id != "undefined") {
					if (id[2] == index) {
						delete mapImages[imageName];
					}
				}
			}
		}
		
	}
	//双击地图时，地图动画移动方法
	LTMaps.prototype.mapCartoonSlide=function(point,slideObject,number,slideNum)
	{
		slideObject.toPoint = point;
		slideObject.number = 0;
		var num=slideNum;
		if(!slideObject){return;}
		if(slideObject.number==0)
		{
			if(slideObject.toPoint)
			{
				//将slideObject.toPoint的NTU值转换成墨卡托
				var slideObject_toPoint_M = new LTPointMercator(slideObject.toPoint.getLongitude(),slideObject.toPoint.getLatitude());
				slideObject_toPoint = new LTPoint(slideObject_toPoint_M.getLongitude(),slideObject_toPoint_M.getLatitude());
				//将中心点NTU转换成墨卡托
				var centerPoint_M = new LTPointMercator(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
				this.centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());
				var distanceX=slideObject_toPoint.getLongitude()-this.centerPoint.getLongitude();
				var distanceY=slideObject_toPoint.getLatitude()-this.centerPoint.getLatitude();
				var distance=Math.sqrt(Math.pow(distanceX,2)+Math.pow(distanceY,2));
				//将中心点墨卡托转换成NTU
				var centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
				this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
				//将slideObject.toPoint的墨卡托值转换成NTU
				var slideObject_toPoint_N = new LTPointWGS84(slideObject_toPoint.getLongitude(),slideObject_toPoint.getLatitude());
				slideObject.toPoint = new LTPoint(slideObject_toPoint_N.getLongitude(),slideObject_toPoint_N.getLatitude());
				LTFunction.inherit(slideObject,{fromPoint:this.centerPoint,distanceX:distanceX,distanceY:distanceY,distance:distance});
			}
			if(typeof slideObject.endZIndex=="number")
			{
				slideObject.changeZIndex=false;
			}
		}
		slideObject.number = number;
		if(slideObject.toPoint)
		{
			//将slideObject.toPoint的NTU值转换成墨卡托
			var slideObject_fromPoint_M = new LTPointMercator(slideObject.fromPoint.getLongitude(),slideObject.fromPoint.getLatitude());
			slideObject_fromPoint = new LTPoint(slideObject_fromPoint_M.getLongitude(),slideObject_fromPoint_M.getLatitude());
			var slideDistance=slideObject.distance;
			var slideMaxPixel=slideDistance*(Math.sin(Math.PI*(slideObject.number/num-0.5))/2+0.5);
			this.centerPoint=new LTPoint(slideObject_fromPoint.getLongitude()+Math.round(slideMaxPixel*slideObject.distanceX/slideDistance),slideObject_fromPoint.getLatitude()+Math.round(slideMaxPixel*slideObject.distanceY/slideDistance));
			//将中心点墨卡托转换成NTU
			var centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
			this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
			//将slideObject.toPoint的墨卡托转换成NTU值
			var slideObject_fromPoint_N = new LTPointWGS84(slideObject_fromPoint.getLongitude(),slideObject_fromPoint.getLatitude());
			slideObject.fromPoint = new LTPoint(slideObject_fromPoint_N.getLongitude(),slideObject_fromPoint_N.getLatitude());
			this.toCenter();
		}
	}
	//地图动画效果的主要方法，oZIndex当前级别，index要缩放的级别,true是否是相邻级别缩放,type是骨头棒或鼠标滚轮缩放（zoomto为骨头棒缩放，mousewheel为鼠标滚轮缩放）
	LTMaps.prototype.mapCartoon=function(oZIndex,index,type)
	{
		this.zoomInOrOut = oZIndex>index?true:false;
		if(typeof this.zoomInOrOut_temp == "undefined"){
			this.zoomInOrOut_temp = this.zoomInOrOut;
		}
		//因为在鼠标滚轮滑动特别快时，有时瓦片层会删除的不彻底，所以得先判断一下，要放大或缩小的时，下一级瓦片层是否存在。
		if(typeof this["mapsDiv_" + index] == "object"){
			this.delMapsDivCache(index,index);
		}
		//放大地图动画
		if(this.zoomInOrOut){
			if (this.zoomInOrOut_temp) {
				var level = 1;
			}else{
				var level = -1;
			}
			if(typeof this["mapsDiv_" + (oZIndex+level)] == "object"){
				this.delMapsDivCache((oZIndex+level),this.zoomIndex);
			}
			this.zoomInOrOut_temp = true;
		}else{	//缩小地图动画
			if (this.zoomInOrOut_temp) {
				var level = 0;
			}else{
				var level = 2;
			}
			
			if (typeof this["mapsDiv_" + (index-level)] == "object") {
				this.delMapsDivCache((index-level),this.zoomIndex);
			}
			this.zoomInOrOut_temp = false;
		}
		//创建新的瓦片层，用于显示新的地图
		if (!this["mapsDiv_" + this.zoomIndex]) {
			this["mapsDiv_" + this.zoomIndex] = LTFunction.createDiv(1);
			this["mapsDiv_" + this.zoomIndex].id = "lt_mapsDiv_"+this.zoomIndex;
			this.mapsDiv.appendChild(this["mapsDiv_" + this.zoomIndex]);
		}
		//在双击地图，然后放大动画，移动到中心点，再显示新的地图
		if(!this.slideObject)
		{
			//创建滑动对象
			this.slideObject={timeout:window.setInterval(LTEvent.getCallback(this,this.slide),this.cartoonPlayTime)};
		}
		var slideObject=this.slideObject;
		if(typeof(this.slideObject.endZIndex)!="number")
		{
			LTFunction.inherit(this.slideObject,{oZIndex:oZIndex,startZIndex:oZIndex});
		}
		else
		{
			LTFunction.inherit(this.slideObject,{oZIndex:slideObject.endZIndex,startZIndex:slideObject.zIndex});
		}
		//构造滑动缩放对象
		slideObject.endZIndex=index;
		slideObject.number=0;
		var oZoom_temp=this.zoomLevels[slideObject.oZIndex];
		this.oZoom=this.getZoomIndex(oZoom_temp);
		this.deltaImgPosition_temp = [];
		this.deltaImgPosition_temp[0] = this.deltaImgPosition[0];
		this.deltaImgPosition_temp[1] = this.deltaImgPosition[1];
		//控制瓦片层，让瓦片层的图片位置和高宽同时放大或缩小二倍，并且在鼠标将放大或缩小地图时，鼠标位置的动画层和要显示下一级地图时的位置相同
		if(this["mapsDiv_"+slideObject.oZIndex]){
			var imgs = this["mapsDiv_"+slideObject.oZIndex].getElementsByTagName("img");
			//复制一个imgs对象
			this.imgs_copy = [];
			this.imgs_hash = [];
			for(var i=0; i<imgs.length; i++){
				var img = document.createElement("img");
				img.style.position="absolute";
				img.style.left = imgs[i].style.left;
				img.style.top = imgs[i].style.top;
				img.style.width = imgs[i].style.width;
				img.style.height = imgs[i].style.height;
				img.src = imgs[i].src
				img.unselectable = imgs[i].unselectable;
				img.galleryImg=imgs[i].galleryImg;
				this.imgs_copy.push(img);
				this.imgs_hash.push(imgs[i]);
			}
			var mul = Math.pow(2,slideObject.oZIndex-slideObject.endZIndex);
			var dbclickPoint_temp = this.dbclickPoint;
			var slideObject_temp = this.slideObject;
			//隐藏地图上的叠加物
			this.overlaysDiv.style.display = "none";
			if(this.dbclickPoint){
				var delta;
				this.newCenterPixelCartoon = [];
				if (oZIndex > index) {
					if(!this.dbclick){		//鼠标鼠标放大
						delta = mul;
						//this.dbPoint	鼠标双击位置的像素
						this.dbPoint = this.getPixelCoord(this.dbclickPoint);
						//中心点像素
						this.centerPixelCartoon = this.getPixelCoord(this.getCenterPoint());
						var x = this.centerPixelCartoon[0] + (this.centerPixelCartoon[0] - this.dbPoint[0]) * (delta - 1);
						this.newCenterPixelCartoon.push(x);
						var y = this.centerPixelCartoon[1] + (this.centerPixelCartoon[1] - this.dbPoint[1]) * (delta - 1);
						this.newCenterPixelCartoon.push(y);
						//防止用户连续滚轮操作，而重新生成层
						if (typeof this.moveCartoon == "number") {
							clearInterval(this.moveCartoon);
						}
						var centerPixelCartoon_temp  = this.centerPixelCartoon;
						var dbPoint_temp = this.dbPoint;
						var num = 1/4;
						var delta_num = 0;
						var deltaImgPosition_interval = this.deltaImgPosition_temp;
						var imgs_copy_temp = this.imgs_copy;
						var imgs_hash_temp = this.imgs_hash;
						var self = this;
						//动画是否在执行
						var moveCartoon = null;
						moveCartoon = this.moveCartoon = setInterval(function(){
							if (delta_num < 1) {
									delta_num = delta_num + num;
									for (var i=0; i<imgs.length; i++) {
										if(imgs_copy_temp[i]){
											imgs[i].style.width = parseInt(imgs_copy_temp[i].style.width)+parseInt(imgs_copy_temp[i].style.width)*(delta_num) + "px";
											imgs[i].style.height = parseInt(imgs_copy_temp[i].style.height)+parseInt(imgs_copy_temp[i].style.height)*(delta_num) + "px";
											imgs[i].style.left = parseInt(imgs_copy_temp[i].style.left)+Math.ceil((parseInt(imgs_copy_temp[i].style.left)*(delta_num)+(centerPixelCartoon_temp[0]-dbPoint_temp[0])*(delta_num)/2)-deltaImgPosition_interval[0]*delta_num)+"px";
											imgs[i].style.top =parseInt(imgs_copy_temp[i].style.top)+Math.ceil((parseInt(imgs_copy_temp[i].style.top)*(delta_num)+(centerPixelCartoon_temp[1]-dbPoint_temp[1])*(delta_num)/2)+deltaImgPosition_interval[1]*delta_num)+"px";
										}
									}
							}else{
								clearInterval(moveCartoon);
								setTimeout(function(){
									self.moveMapImages(true);
									//显示地图上的叠加物
									self.overlaysDiv.style.display = "block";
								}, self.cartoonTime);
							}
						}, self.cartoonPlayTime);
					}
					else
					{
						delta = mul;
						window.clearTimeout(slideObject.timeout);
						//防止用户连续滚轮操作，而重新生成层
						if (typeof this.moveCartoon == "number") {
							clearInterval(this.moveCartoon);
						}
						this.dbCenterPoint = this.centerPoint;
						var dbclickPoint_temp = this.dbclickPoint;
						var num = 1/4;
						var delta_num = 0;
						this.state = 1;
						var dbclick_temp = this.dbclick;
						var imgs_copy_temp = this.imgs_copy;
						var imgs_hash_temp = this.imgs_hash;
						var self = this;
						//动画是否在执行
						var moveCartoon = null;
						moveCartoon = this.moveCartoon = setInterval(function(){
							if(delta_num < 1){
								self.dbPoint = self.getPixelCoord(dbclickPoint_temp);
								self.centerPixelCartoon = self.getPixelCoord(self.getCenterPoint());
								var x = self.centerPixelCartoon[0] + (self.centerPixelCartoon[0] - self.dbPoint[0]) * (delta - 1);
								self.newCenterPixelCartoon.push(x);
								var y = self.centerPixelCartoon[1] + (self.centerPixelCartoon[1] - self.dbPoint[1]) * (delta - 1);
								self.newCenterPixelCartoon.push(y);
								var centerPixelCartoon_temp  = self.centerPixelCartoon;
								var dbPoint_temp = self.dbPoint;
								var deltaImgPosition_interval = self.deltaImgPosition_temp;
								delta_num = delta_num + num;
								self.state = delta_num;
								for (var i=0; i<imgs.length; i++)
								{
									if(imgs_copy_temp[i])
									{
										imgs[i].style.width = parseInt(imgs_copy_temp[i].style.width)+parseInt(imgs_copy_temp[i].style.width)*(delta_num) + "px";
										imgs[i].style.height = parseInt(imgs_copy_temp[i].style.height)+parseInt(imgs_copy_temp[i].style.height)*(delta_num) + "px";
										imgs[i].style.left = parseInt(imgs_copy_temp[i].style.left)+Math.ceil((parseInt(imgs_copy_temp[i].style.left)*(delta_num)+(centerPixelCartoon_temp[0]-dbPoint_temp[0])*(delta_num)/2)-deltaImgPosition_interval[0]*delta_num)+"px";
										imgs[i].style.top =parseInt(imgs_copy_temp[i].style.top)+Math.ceil((parseInt(imgs_copy_temp[i].style.top)*(delta_num)+(centerPixelCartoon_temp[1]-dbPoint_temp[1])*(delta_num)/2)+deltaImgPosition_interval[1]*delta_num)+"px";
									}
								}
								self.mapCartoonSlide(dbclickPoint_temp,slideObject_temp,delta_num*4,4);
							}
							else
							{
								clearInterval(moveCartoon);
								setTimeout(function(){
									self.moveMapImages(true);
									self.dbclick = false;
									self.slideEnd();
									//显示地图上的叠加物
									self.overlaysDiv.style.display = "block";
								}, 300);
							}
						}, 50);
					}
				}else if(oZIndex < index){
					delta = mul;
					//this.dbPoint	鼠标位置的像素
					this.dbPoint = this.getPixelCoord(this.dbclickPoint);
					//中心点像素
					this.centerPixelCartoon = this.getPixelCoord(this.getCenterPoint());
					var x = this.centerPixelCartoon[0] + (this.centerPixelCartoon[0] - this.dbPoint[0]) * (delta - 1);
					this.newCenterPixelCartoon.push(x);
					var y = this.centerPixelCartoon[1] + (this.centerPixelCartoon[1] - this.dbPoint[1]) * (delta - 1);
					this.newCenterPixelCartoon.push(y);
					this.centerPoint = this.getPointLatLng(this.newCenterPixelCartoon);
					//防止用户连续滚轮操作，而重新生成层
					if (typeof this.moveCartoon == "number") {
						clearInterval(this.moveCartoon);
					}
					//储存临时变量，应用于定时器中
					var centerPixelCartoon_temp  = this.centerPixelCartoon;
					var dbPoint_temp = this.dbPoint;
					var num = 1/8;
					var delta_num = 0;
					var deltaImgPosition_interval = this.deltaImgPosition_temp;
					var imgs_copy_temp = this.imgs_copy;
					var imgs_hash_temp = this.imgs_hash;
					var self = this;
					var moveCartoon = null;
					moveCartoon = this.moveCartoon = setInterval(function(){
						if (delta_num < 0.5) {
							delta_num = delta_num + num;
							for (var i=0; i<imgs.length; i++) {
								if(imgs_copy_temp[i]){
									imgs[i].style.width = parseInt(imgs_copy_temp[i].style.width)*(1-delta_num) + "px";
									imgs[i].style.height = parseInt(imgs_copy_temp[i].style.height)*(1-delta_num) + "px";
									imgs[i].style.left = Math.ceil((parseInt(imgs_copy_temp[i].style.left)*(1-delta_num)+(centerPixelCartoon_temp[0]-dbPoint_temp[0])*(1-delta_num-1)*2)-deltaImgPosition_interval[0]*(1-delta_num-1))+"px";
									imgs[i].style.top =Math.ceil((parseInt(imgs_copy_temp[i].style.top)*(1-delta_num)+(centerPixelCartoon_temp[1]-dbPoint_temp[1])*(1-delta_num-1)*2)+deltaImgPosition_interval[1]*(1-delta_num-1))+"px";
								}
							}
						}else{
							clearInterval(moveCartoon);
							setTimeout(function(){
								self.moveMapImages(true);
								//显示地图上的叠加物
								self.overlaysDiv.style.display = "block";
							}, self.cartoonTime);
						}
					}, self.cartoonPlayTime);
				}
				this.dbclickPoint = null;
			}else{
				var delta = mul;
				if(delta == 2){
					var num = 1/4;
					var delta_num = 0;
					var self = this;
					var deltaImgPosition_interval = this.deltaImgPosition_temp;
					var imgs_copy_temp = this.imgs_copy;
					var imgs_hash_temp = this.imgs_hash;
					var moveCartoon = null;
					moveCartoon = this.moveCartoon = setInterval(function(){
						if(delta_num<1){		  
							delta_num = delta_num + num;
							for (var i=0; i<imgs.length; i++) {
								if(imgs_copy_temp[i]){
									imgs[i].style.width = parseInt(imgs_copy_temp[i].style.width)+parseInt(imgs_copy_temp[i].style.width)*delta_num + "px";
									imgs[i].style.height = parseInt(imgs_copy_temp[i].style.height)+parseInt(imgs_copy_temp[i].style.height)*delta_num + "px";
									imgs[i].style.left = parseInt(imgs_copy_temp[i].style.left)+Math.ceil(parseInt(imgs_copy_temp[i].style.left)*delta_num)-deltaImgPosition_interval[0]*delta_num+"px";
									imgs[i].style.top =parseInt(imgs_copy_temp[i].style.top)+Math.ceil(parseInt(imgs_copy_temp[i].style.top)*delta_num)+deltaImgPosition_interval[1]*delta_num+"px";
								}
							}
						}else{
							clearInterval(moveCartoon);
							setTimeout(function(){
								self.moveMapImages(true);
								//显示地图上的叠加物
								self.overlaysDiv.style.display = "block";
							},self.cartoonTime);
						}
					}, self.cartoonPlayTime);
				}else if(delta == 0.5){
					var num = 1/8;
					var delta_num = 0;
					var self = this;
					var deltaImgPosition_interval = this.deltaImgPosition_temp;
					var imgs_copy_temp = this.imgs_copy;
					var imgs_hash_temp = this.imgs_hash;
					var moveCartoon = null;
					moveCartoon = this.moveCartoon = setInterval(function(){
						if(delta_num<0.5){		  
							delta_num = delta_num + num;
							for (var i=0; i<imgs.length; i++) {
								if(imgs_copy_temp[i]){
								imgs[i].style.width = parseInt(imgs_copy_temp[i].style.width)*(1-delta_num) + "px";
								imgs[i].style.height = parseInt(imgs_copy_temp[i].style.height)*(1-delta_num) + "px";
									imgs[i].style.left = Math.ceil(parseInt(imgs_copy_temp[i].style.left)*(1-delta_num)-deltaImgPosition_interval[0]*(1-delta_num-1))+"px";
									imgs[i].style.top =Math.ceil(parseInt(imgs_copy_temp[i].style.top)*(1-delta_num)+deltaImgPosition_interval[1]*(1-delta_num-1))+"px";
								}
							}
						}else{
							clearInterval(moveCartoon);
							setTimeout(function(){
								self.moveMapImages(true);
								//显示地图上的叠加物
								self.overlaysDiv.style.display = "block";
							},self.cartoonTime);
						}
					}, self.cartoonPlayTime);
				}
			}
		}
	}
	//将地图缩放到指定的缩放等级(可能是小数)
	LTMaps.prototype.zoomToByStyle=function(index,latlng,point)
	{
		var divZoom=typeof index=="number"?Math.pow(2,this.getCurrentZoom(true)-((index==Math.floor(index))?this.zoomLevels[index]:(this.zoomLevels[Math.ceil(index)]-this.zoomLevels[Math.floor(index)])*(index-Math.floor(index))+this.zoomLevels[Math.floor(index)])):1;
		this.divZoom=divZoom;

		if(latlng)
		{
			//将中心点NTU转换成墨卡托
			var latlng_M = new LTPointMercator(latlng.getLongitude(),latlng.getLatitude());
			latlng = new LTPoint(latlng_M.getLongitude(),latlng_M.getLatitude());
			//var zoomUnits=this.getZoomUnits(this.zoom)/divZoom;
			var zoom = this.getZoomIndex(this.zoom);
			var zoomUnits=this.getZoomUnits(zoom)/divZoom;
			var viewSize=this.viewSize;
			latlng=new LTPoint(latlng.getLongitude()+zoomUnits*(viewSize[0]/2-point[0]),latlng.getLatitude()-zoomUnits*(viewSize[1]/2-point[1]));
			//将中心点墨卡托转换成NTU
			var latlng_N = new LTPointWGS84(latlng.getLongitude(),latlng.getLatitude());
			latlng = new LTPoint(latlng_N.getLongitude(),latlng_N.getLatitude());
		}
		else
		{
			latlng=this.centerPoint;
		}
		this.setCenterAtLatLng(latlng);
		LTEvent.trigger(this,"slidezoom",[typeof index=="number"?index:this.zoomIndex]);
	}
	LTMaps.prototype.zoomIn=function(){
		if(this.zoomIndex>0){
			var zoom = this.getZoomIndex(this.zoomLevels[this.zoomIndex-1]);
			this.zoomTo(zoom);
		}
	}
	LTMaps.prototype.zoomOut=function(){
		if(this.zoomIndex<this.zoomLevels.length-1){
			var zoom = this.getZoomIndex(this.zoomLevels[this.zoomIndex+1]);
			this.zoomTo(zoom);
		}
	}
	LTMaps.prototype.setCenterAtLatLng=function(point)
	{//移动到指定的经纬度
		this.centerPoint=point;
		this.moveMapImages(false);
	}
	//传入的zoom为以前0-13级别
	LTMaps.prototype.moveToCenter=function(point,zoom,mtype)
	{
		if(!this.loaded)
		{
			this.centerAndZoom(point,this.getZoomIndex(this.zoom));
			return;
		}
		
		if(LTBrowserInfo.isIE())
		{
			try{document.selection.empty();}catch(e){}
		}
		if(typeof zoom=="number")
		{
			//zoom = this.zoomLevels[zoom];
			this.zoomTo(zoom);
		}
		
		//将传入的NTU转换成墨卡托
		var point_M = new LTPointMercator(point.getLongitude(),point.getLatitude());
		point = new LTPoint(point_M.getLongitude(),point_M.getLatitude());
		
		//将中心点NTU转换成墨卡托
		var centerPoint_M = new LTPointMercator(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());
		
		var fromPoint=this.centerPoint;
		var distanceX=point.getLongitude()-fromPoint.getLongitude();
		var distanceY=point.getLatitude()-fromPoint.getLatitude();
		
		//将中心点墨卡托转换成NTU
		var centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
		
		//将传入的墨卡托转换成NTU
		var point_N = new LTPointWGS84(point.getLongitude(),point.getLatitude());
		point = new LTPoint(point_N.getLongitude(),point_N.getLatitude());
		
		if(distanceX==0  && distanceY==0)
		{//如果不需要移动，则直接退出
			return;
		}
		var units=this.zoomUnits;
		var viewSize=this.viewSize;
		
		if(Math.abs(distanceX)>viewSize[0]*units*2 || Math.abs(distanceY)>viewSize[1]*units*2)
		{//如果需要移动的范围比较大，则直接定位，不执行滑动过程
			this.setCenterAtLatLng(point);
			LTEvent.trigger(this,"moveend",[this.centerPoint,mtype]);
			return;
		}
		
		if(!this.slideObject)
		{
			this.slideObject={timeout:window.setInterval(LTEvent.getCallback(this,this.slide),16)};
		}
		LTFunction.inherit(this.slideObject,{toPoint:point,mtype:mtype,number:0});
		this.slide();
		LTEvent.trigger(this,"movestart",[this.centerPoint]);
	}
	LTMaps.prototype.slide=function()
	{
		var num=this.slideNum;
		var slideObject=this.slideObject;
		if(!slideObject){return;}
		if(slideObject.number>=num)
		{
			this.slideEnd();
			return;
		}
		if(slideObject.number==0)
		{
			if(slideObject.toPoint)
			{
				//将slideObject.toPoint的NTU值转换成墨卡托
				var slideObject_toPoint_M = new LTPointMercator(slideObject.toPoint.getLongitude(),slideObject.toPoint.getLatitude());
				slideObject_toPoint = new LTPoint(slideObject_toPoint_M.getLongitude(),slideObject_toPoint_M.getLatitude());

				//将中心点NTU转换成墨卡托
				var centerPoint_M = new LTPointMercator(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
				this.centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());
				
				var distanceX=slideObject_toPoint.getLongitude()-this.centerPoint.getLongitude();
				var distanceY=slideObject_toPoint.getLatitude()-this.centerPoint.getLatitude();
				var distance=Math.sqrt(Math.pow(distanceX,2)+Math.pow(distanceY,2));

				//将中心点墨卡托转换成NTU
				var centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
				this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
				
				//将slideObject.toPoint的墨卡托值转换成NTU
				var slideObject_toPoint_N = new LTPointWGS84(slideObject_toPoint.getLongitude(),slideObject_toPoint.getLatitude());
				slideObject.toPoint = new LTPoint(slideObject_toPoint_N.getLongitude(),slideObject_toPoint_N.getLatitude());
				
				LTFunction.inherit(slideObject,{fromPoint:this.centerPoint,distanceX:distanceX,distanceY:distanceY,distance:distance});
			}
			if(typeof slideObject.endZIndex=="number")
			{
				slideObject.changeZIndex=false;
			}
		}
		slideObject.number++;
		if(slideObject.toPoint)
		{
			//将slideObject.toPoint的NTU值转换成墨卡托
			var slideObject_fromPoint_M = new LTPointMercator(slideObject.fromPoint.getLongitude(),slideObject.fromPoint.getLatitude());
			slideObject_fromPoint = new LTPoint(slideObject_fromPoint_M.getLongitude(),slideObject_fromPoint_M.getLatitude());
			var slideDistance=slideObject.distance;
			var slideMaxPixel=slideDistance*(Math.sin(Math.PI*(slideObject.number/num-0.5))/2+0.5);
			this.centerPoint=new LTPoint(slideObject_fromPoint.getLongitude()+slideMaxPixel*slideObject.distanceX/slideDistance,slideObject_fromPoint.getLatitude()+slideMaxPixel*slideObject.distanceY/slideDistance);

			//将中心点墨卡托转换成NTU
			var centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
			this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
			
			//将slideObject.toPoint的墨卡托转换成NTU值
			var slideObject_fromPoint_N = new LTPointWGS84(slideObject_fromPoint.getLongitude(),slideObject_fromPoint.getLatitude());
			slideObject.fromPoint = new LTPoint(slideObject_fromPoint_N.getLongitude(),slideObject_fromPoint_N.getLatitude());
			this.toCenter();
		}
	}
	LTMaps.prototype.setTopMapDiv=function(index)
	{
		if(this.focusMapsDiv)
			LTFunction.setZIndex(this.focusMapsDiv,60);
		this.focusMapsDiv=this["mapsDiv_"+index];
		if(this.focusMapsDiv)
			LTFunction.setZIndex(this.focusMapsDiv,60);
	}
	LTMaps.prototype.slideEnd=function()
	{
		var slideObject=this.slideObject;
		this.slideObject=null;
		window.clearInterval(slideObject.timeout);
		if(slideObject.toPoint)
		{
			this.setCenterAtLatLng(slideObject.toPoint);
			LTEvent.trigger(this,"moveend",[this.centerPoint,slideObject.mtype]);
		}
		if(typeof slideObject.endZIndex=="number")
		{
			if(!slideObject.changeZIndex)
			{
				this.setTopMapDiv(slideObject.endZIndex);
			}
			this.zoomToByStyle();
			delete this.oZoom;
			LTEvent.trigger(this,"zoomend",[this.zoomLevels[slideObject.endZIndex]]);
		}
	}
	LTMaps.prototype.move=function(size)
	{//地图移动指定的像素值
		this.moveToCenter(this.getPointLatLng([this.viewSize[0]/2+size[0],this.viewSize[1]/2+size[1]]));
	}
	//以下是为了和接口兼容而创建的方法，都是调用move方法实现
	LTMaps.prototype.mapMoveToUp=function(num){this.move([0,-num*this.imgSize]);}
	LTMaps.prototype.mapMoveToRight=function(num){this.move([num*this.imgSize,0]);}
	LTMaps.prototype.mapMoveToDown=function(num){this.move([0,num*this.imgSize]);}
	LTMaps.prototype.mapMoveToLeft=function(num){this.move([-num*this.imgSize,0]);}
	LTMaps.prototype.onDoubleClick=function(e)
	{//地图被双击时执行的操作
		LTEvent.cancelBubble(e);
		if(!this.loaded){return;}
		var point=this.getPointLatLng(LTFunction.getEventPosition(e,this.container));
		this.dbclick = true;
		this.dbclickPoint = point;
		//加入是否双击放大地图开关
		LTEvent.trigger(this,"dblclick",[point]);
		if(this.canDrag && this.dbclickToCenter && this.canMove)
		{
			if(!this.cartoon)
			{
				this.moveToCenter(point,null,"m_dblclick");
			}
		}
	}
	LTMaps.prototype.onMouseDown=function(e)
	{//开始拖动过程
		LTEvent.cancelBubble(e);
		
		if(this.dragObject){this.dragEnd(e);}
		if(!this.loaded){return;}
		var dragObject={"startPoint":LTFunction.getEventPosition(e,this.container),"startDivPoint":[e.clientX,e.clientY],"startTime":(new Date()).getTime()};
		this.dragObject=dragObject;
		this.dragObjectStart = dragObject.startPoint;
		if(this.container.setCapture)
		{
			this.container.setCapture();
		}
		if(this.canDrag)
		{
			dragObject.centerPoint=this.centerPoint;
			this.dragImageTimeout=window.setInterval(LTEvent.getCallback(this,function(){if(this.dragObject){this.dragObject.enableDragImage=true;}	}),128);
//			this.dragImageTimeout=window.setInterval(function(){if(self.dragObject){self.dragObject.enableDragImage=true;}},128);
			dragObject.enableDragImage=false;
			LTFunction.setCursorStyle(this.mapsDiv,this.mapCursor[1]);
			LTFunction.setCursorStyle(this.container,this.mapCursor[1]);
			LTEvent.trigger(this,"movestart",[this.centerPoint]);
		}
		dragObject.enableDrag=false;
		if(!dragObject.timeout)
		{
			dragObject.timeout=window.setInterval(LTEvent.getCallback(this,function(){if(this.dragObject){this.dragObject.enableDrag=true;}}),32);
		}
		if(!dragObject.mouseMoveListener)
		{
			dragObject.mouseMoveListener=LTEvent.bind(document,"mousemove",this,this.onMouseMove);
		}
		if(!dragObject.mouseUpListener)
		{
			dragObject.mouseUpListener=LTEvent.bind(document,"mouseup",this,this.onMouseUp);
		}
		LTEvent.trigger(this,"mousedown",[dragObject.startPoint,LTFunction.getEventButton(e)]);
		if(LTBrowserInfo.isIE())
		{
			try{document.selection.empty();}catch(e){}
		}
	}
	LTMaps.prototype.onMouseMove=function(e)
	{//地图拖动
		LTEvent.cancelBubble(e);
		var dragObject=this.dragObject;
		if(!dragObject || !dragObject.enableDrag)
		{
			return;
		}
		var dragStartPoint=dragObject.startPoint;
		var dragStartDivPoint=dragObject.startDivPoint;
		var dragCenterPoint=dragObject.centerPoint;
		var dragPoint=[dragStartPoint[0]+e.clientX-dragStartDivPoint[0],dragStartPoint[1]+e.clientY-dragStartDivPoint[1]];
		dragObject.enableDrag=false;
		if(this.canDrag)
		{
			var units=this.zoomUnits;
			this.dragCenterPoint = dragCenterPoint;
			
			//将中心点坐标NTU转换成墨卡托坐标
			var onMouseMove_dragCenterPoint_M = new LTPointMercator(dragCenterPoint.getLongitude(),dragCenterPoint.getLatitude());
			dragCenterPoint = new LTPoint(onMouseMove_dragCenterPoint_M.getLongitude(),onMouseMove_dragCenterPoint_M.getLatitude());
			
			this.centerPoint=new LTPoint(dragCenterPoint.getLongitude()+((dragStartPoint[0]-dragPoint[0])*units),dragCenterPoint.getLatitude()+((dragPoint[1]-dragStartPoint[1])*units));
			
			//将中心点坐标（墨卡托）转换成NTU
			var onMouseMove_centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
			this.centerPoint = new LTPoint(onMouseMove_centerPoint_N.getLongitude(),onMouseMove_centerPoint_N.getLatitude());
			
			//原始中心点经纬度与新中心点经纬度相等时，不执行toCenter方法。
			if(this.dragCenterPoint.getLongitude() != this.centerPoint.getLongitude() && this.dragCenterPoint.getLatitude() != this.centerPoint.getLatitude()){
				this.toCenter();
				if(dragObject.enableDragImage)
				{
					this.moveMapImages(false);
					dragObject.enableDragImage=false;
				}
			}
		}
		LTEvent.trigger(this,"mousedrag",[dragPoint,LTFunction.getEventButton(e)]);
	}
	LTMaps.prototype.onMouseUp=function(e)
	{//结束拖动过程
		LTEvent.cancelBubble(e);
		var point=LTFunction.getEventPosition(e,this.container);
		this.dragEnd(e);
		if(document.releaseCapture)
		{
			document.releaseCapture();
		}
		LTFunction.setCursorStyle(this.mapsDiv,this.mapCursor[0]);
		LTFunction.setCursorStyle(this.container,this.mapCursor[0]);
		//将地图控制在一定范围之内，不允许地图拖动(或以其他方式移动)到该范围之外,这里控制在4级的世界地图
		//this.setMapBounds(this.mapSizePoint());
		LTEvent.trigger(this,"mouseup",[point,LTFunction.getEventButton(e)]);
	}
	//中止拖动进程
	LTMaps.prototype.dragEnd=function(e)
	{
		var dragObject=this.dragObject;
		if(dragObject)
		{
			if(dragObject.timeout)
			{
				window.clearInterval(dragObject.timeout);
				dragObject.timeout=null;
			}
			if(this.canDrag)
			{
				window.clearInterval(dragObject.dragImageTimeout);
				dragObject.dragImageTimeout=null;
			}
			dragObject.enableDrag=true;
			dragObject.enableDragImage=true;
			this.onMouseMove(e);
			if(dragObject.mouseMoveListener)
			{
				LTEvent.removeListener(dragObject.mouseMoveListener);
				dragObject.mouseMoveListener=null;
			}
			if(dragObject.mouseUpListener)
			{
				LTEvent.removeListener(dragObject.mouseUpListener);
				dragObject.mouseUpListener=null;
			}
			var dragStartDivPoint=this.dragObject.startDivPoint;
			if((new Date()).getTime()-this.dragObject.startTime<=500&&(Math.abs(dragStartDivPoint[0]-e.clientX)<=2&&Math.abs(dragStartDivPoint[1]-e.clientY)<=2))
			{
				var point=LTFunction.getEventPosition(e,this.container);
				LTEvent.trigger(this,"click",[point,LTFunction.getEventButton(e)])
			}
			else
			{
				LTEvent.trigger(this,"moveend",[this.centerPoint,"m_drag"]);
			}
			this.dragObject=null;
		}
	}
	LTMaps.prototype.isOccupy = function()
	{//判断模式是否被占用，eventName是模式名称
		return this._occupy?true:false;
	}
	LTMaps.prototype.startOccupy = function(name)
	{//开始占用地图的eventName模式
		if(!this._occupy)
		{
			this._occupy=name;
			return true;
		}
		else
		{
			alert("请先结束 "+this._occupy+" 操作！");
		}
		return false;
	}
	LTMaps.prototype.endOccupy = function(name)
	{//结束占用地图的eventName模式
		if(this._occupy==name)
		{
			this._occupy=null;
			return true;
		}
		return false;
	}
	LTMaps.prototype.isDragging = function()
	{
		return this.canDrag;
	}
	LTMaps.prototype.enableDrag = function()
	{//将地图设置为允许拖动
		this.canDrag=true;
	}
	LTMaps.prototype.disableDrag = function()
	{//将地图设置为禁止拖动
		this.canDrag=false;
	}
	LTMaps.prototype.setSlideMaxZoom=function(z)
	{//将地图设置为允许滑动缩放等级
		this.slideMaxZoom=parseInt(z);
	}
	LTMaps.prototype.setMapCursor=function(normalCursor,dragCursor)
	{//设置地图的鼠标样式
		var mapCursor=this.mapCursor;
		if(normalCursor){mapCursor[0]=normalCursor;}
		if(dragCursor){mapCursor[1]=dragCursor;}
		var cursor=this.dragObject?mapCursor[1]:mapCursor[0];
		LTFunction.setCursorStyle(this.container,cursor);
		LTFunction.setCursorStyle(this.mapsDiv,cursor);
	}
	LTMaps.prototype.onClick=function(e)
	{//地图禁止拖动状态下被单击时执行本方法来触发maps的click事件
		if(this.canDrag || !this.loaded)
		{
			return;
		}
		LTEvent.trigger(this,"click",[LTFunction.getEventPosition(e,this.container),1]);
	}
	LTMaps.prototype.getClickLatLng=function(e)
	{//返回event事件发生点对应的经纬度
		if(typeof e[0]=="number")
		{
			return this.getPointLatLng(e);
		}
		else
		{
			return this.getPointLatLng(LTFunction.getEventPosition(e,this.container));
		}
	}
	LTMaps.prototype.getSpanLatLng=function()
	{//返回当前container中显示的地图的经纬度范围，返回一个LTSize
	//注意：由于API简化，LTSize不再作为专门的对象开放，而在这个返回对象里面生成相应的属性和方法以保持兼容
		var bounds=this.getBoundsLatLng();
		var size={width:parseInt(bounds.Xmax-bounds.Xmin),height:parseInt(bounds.Ymax-bounds.Ymin)};
		size.getWidth=function(){return this.width}
		size.getHeight=function(){return this.height}
		return size;
	}
	LTMaps.prototype.getMapContent=function(flag)
	{
		var viewSize=this.viewSize;
		var style=this.mapsDiv.style;
		var html='<div id="LTMaps_Container" style="width:'+(viewSize[0])+'px;height:'+(viewSize[1])+'px;overflow:hidden">';
		//地图图片层
		html+='<div id="LTMaps_Maps" style="position:relative;left:'+style.left+';top:'+style.top+'">';
		html+=this.mapsDiv.innerHTML;
		if(flag!=1)
		{//地图标记层
			html+=this.overlaysDiv.outerHTML;
		}
		html+='</div>';
		html+='</div>';
		var offImgURL=window._LT_map_offImgURL;
		var imgURLs=this.imgURLs;
		if(offImgURL && offImgURL!="")
		{
			for(var i=0;i<imgURLs.length;i++)
			{
				html=html.replace(new RegExp(imgURLs[i].replace(new RegExp("([\\?\\$\\+\\.\\(\\)\\*\\.\\[\\\\\\^\\{\\|])","g"),"\\$1"),"g"),offImgURL);
			}
		}
		return html;
	}
	//根据指定的范围计算最佳的缩放等级
	LTMaps.prototype.getBestZoom=function(bounds,padding)
	{
		var min_N = new LTPointMercator(bounds.Xmin,bounds.Ymin);
		var max_N = new LTPointMercator(bounds.Xmax,bounds.Ymax);
		bounds = new LTBounds(min_N.getLongitude(),min_N.getLatitude(),max_N.getLongitude(),max_N.getLatitude());
		
		padding=(typeof padding=="number")?padding:10;
		var viewSize=this.viewSize;
		var zoomLevels=this.zoomLevels;
		var zoomLevelsLen=zoomLevels.length;
		var index;
		for(index=0;index<zoomLevelsLen;index++)
		{
			//var zoomUnits=this.getZoomUnits(zoomLevels[index]);
			var zoomUnits=this.getZoomUnits(index);
			
			if((bounds.getXmax()-bounds.getXmin())/zoomUnits<viewSize[0]-padding && (bounds.getYmax()-bounds.getYmin())/zoomUnits<viewSize[1]-padding)
			{
				break;
			}
		}
		if(index==zoomLevelsLen)
		{
			index--;
		}
		return zoomLevels[index];
	}
	//将地图定位到能包含指定点的最佳视图
	LTMaps.prototype.getBestMap=function(points,padding)
	{
		if(points.length==0){return;}
		var bounds=LTBounds.getPointsBounds(points);
		this.centerAndZoom(bounds.getCenterPoint(),this.getZoomIndex(this.getBestZoom(bounds,padding)));
	}

/*
关于鼠标滚轮滑动的方法
*/
	//打开鼠标滑动缩放等级的支持，flag=true是代表已鼠标指向点作为滑动的中心
	LTMaps.prototype.handleMouseScroll=function(flag)
	{
		this.clearHandleMouseScroll();//如果已经打开，则关闭支持
		//var event=document.all?"mousewheel":"DOMMouseScroll";//针对不同的浏览器选择不同的事件名称
		//以下代码是解决鼠标滚动事件
		if(LTBrowserInfo.getBrowserType() == "Other"){
			var event = "mousewheel";
		}else{
			var event=document.all?"mousewheel":"DOMMouseScroll";
		}
		this.msl=LTEvent.bind(this.container,event,this,this.onMouseWheel);//在鼠标滚轮被滑动的时候执行操作
		this.wheelByPoint=flag;//指定鼠标滚轮滑动中心是固定模式还是以鼠标指向点为中心
		//如果地图缩放是以鼠标位置缩放，那么就去掉地图加载进度条
		if(this.wheelByPoint){
			this.removeProgressControl();
		}else{
			this.addProgressControl();
		}
	}
	//关闭鼠标滑动的支持
	LTMaps.prototype.clearHandleMouseScroll=function()
	{
		if(this.mst){this.onStopMouseWheel();}//如果正在滑动，则先停止滑动
		if(this.msl){LTEvent.removeListener(this.msl);this.msl=null;}//取消滚轮事件绑定
	}
	//在鼠标滑动事件发生时执行
	LTMaps.prototype.onMouseWheel=function(e)
	{
		LTEvent.cancelBubble(e);
		if(this.slideObject){this.slideEnd();}//如果正在做地图的滑动，则先停止滑动
		if(typeof this.mzi!="number")
		{
			this.mzi=this.zoomIndex;
			this.wheelPoint=LTFunction.getEventPosition(e,this.container);
			this.wheelLatlng=this.getPointLatLng(this.wheelPoint);
		}
		//IE是event.wheelDelta，Firefox是event.detail 属性的方向值也不一样，IE向前滚 > 0为120，相反在-120，Firefox向后滚 > 0为3，相反则-3。
		var wheelDelta=(typeof e.wheelDelta=="number")?e.wheelDelta:(-e.detail*40);//所以*40，然后取反就和IE的相等了
		this.mzi-=wheelDelta/600*this.scrollSpeed;
		if(this.mzi>this.zoomLevels.length-1){this.mzi=this.zoomLevels.length-1}//最大不能超过规定的比例尺级别，如果超过取最大
		if(this.mzi<0){this.mzi=0}//最小不能小于0，否则取0
		if(this.mst){window.clearTimeout(this.mst);this.mst=null;}
		this.mst=window.setTimeout(LTEvent.getCallback(this,this.onStopMouseWheel),5);
		return;
	}
	LTMaps.prototype.onStopMouseWheel=function()
	{
		var index=(this.mzi>this.zoomIndex)?Math.ceil(this.mzi):Math.floor(this.mzi);
		var zoom=this.zoomLevels[index];
		if(this.wheelByPoint)
		{
			//是滚轮操作
			//this.mouseWheel = false;
			//滑动鼠标滚轮，放大或缩小鼠标当前位置
			var delta;
			this.newCenterPixel = [];
			if (this.mzi > this.zoomIndex && this.mzi!=13) {
				delta = 2;
				this.cursorArrows(this.wheelPoint,"zoomOut");
				//this.wheelPoint	鼠标位置的像素
				//中心点像素
				this.centerPixel = this.getPixelCoord(this.getCenterPoint());
				var x = this.centerPixel[0] + (this.centerPixel[0] - this.wheelPoint[0]) * (delta - 1);
				this.newCenterPixel.push(x);
				var y = this.centerPixel[1] + (this.centerPixel[1] - this.wheelPoint[1]) * (delta - 1);
				this.newCenterPixel.push(y);
				
				if(this.cartoon){
					//地图动画效果,因为滑动鼠标滚轮，放大或缩小鼠标当前位置方法在计算下一级比例尺中心点时，用到的getPointLatLng方法中this.zoomUnits是当前级别的值，所以中心点应在mapCartoon方法执行完后计算。
					this.dbclickPoint = this.wheelLatlng;
					var centerPoint_zoom = this.getPointLatLng(this.newCenterPixel);
					var zoomout = this.getZoomIndex(zoom);
					this.zoom = zoom;
					this.zoomUnits = this.getZoomUnits(zoomout);
					this.zoomIndex = Math.floor(this.mzi);
					this.zoomIndex = this.zoomIndex+1;
					this.mapCartoon(Math.floor(this.mzi),this.zoomIndex,"mousewheel");
					this.centerPoint = centerPoint_zoom;
					var self = this;
				}else{
					this.centerPoint = this.getPointLatLng(this.newCenterPixel);
					zoom = this.getZoomIndex(zoom);
					this.centerAndZoom(this.centerPoint, zoom);
				}
			}else if(this.mzi < this.zoomIndex && this.mzi!=0){
				delta = 0.5;
				//鼠标位置动画
				this.cursorArrows(this.wheelPoint,"zoomIn");
				//this.wheelPoint	鼠标位置的像素
				//中心点像素
				this.centerPixel = this.getPixelCoord(this.getCenterPoint());
				var x = this.centerPixel[0] + (this.centerPixel[0] - this.wheelPoint[0]) * (delta - 1);
				this.newCenterPixel.push(x);
				var y = this.centerPixel[1] + (this.centerPixel[1] - this.wheelPoint[1]) * (delta - 1);
				this.newCenterPixel.push(y);
				if(this.cartoon){
					//地图动画效果,因为滑动鼠标滚轮，放大或缩小鼠标当前位置方法在计算下一级比例尺中心点时，用到的getPointLatLng方法中this.zoomUnits是当前级别的值，所以中心点应在mapCartoon方法执行完后计算。
					this.dbclickPoint = this.wheelLatlng;
					var centerPoint_zoom = this.getPointLatLng(this.newCenterPixel);
					var zoomin = this.getZoomIndex(zoom);
					this.zoom = zoom;
					this.zoomUnits = this.getZoomUnits(zoomin);
					this.zoomIndex = Math.floor(this.mzi);
					this.mapCartoon(this.zoomIndex + 1, Math.floor(this.mzi));
					this.centerPoint = centerPoint_zoom;
					var self = this;
				}else{
					this.centerPoint = this.getPointLatLng(this.newCenterPixel);
					//var zoom_true = this.getZoomIndex(zoom);
					zoom = this.getZoomIndex(zoom);
					this.centerAndZoom(this.centerPoint, zoom);
				}
			}
		}
		else
		{
			zoom = this.getZoomIndex(zoom);
			this.zoomTo(zoom);
		}
		window.clearTimeout(this.mst);
		this.mst=null;
		this.mzi=null;
	}
	
	//鼠标位置动画效果
	LTMaps.prototype.cursorArrows=function(xy,zoom){
		
		//防止用户连续滚轮操作，而重新生成层
		if (typeof this.move == "number") {
			clearInterval(this.move);
		}
		var arrowsDiv = document.getElementById("arrows");
		if(!arrowsDiv){
			return;
		}
		arrowsDiv.innerHTML = "";
		
		//鼠标位置动画基本参数
		//动画最大宽度范围
		var widthMax = 120;
		//动画最大高度范围
		var heightMax = 90;
		//动画最小宽度范围
		var widthMin = 20;
		//动画最小高度范围
		var heightMin = 18;
		//四个角的图片宽度
		var cornerWidth = 7;
		//四个角的图片高度
		var cornerHeight = 7;
		//动画速度
		var speed = 4;
		//放大时鼠标图标在动画框内，中心点的偏移量
		var correctZoomIn = [0,12];
		//缩小时鼠标图标在动画框内，中心点的偏移量
		var correctZoomOut = [3,0];
		//动画是否在执行
		var move = null;
		
		var div_leftup = LTFunction.createDiv(1, null, 110);
		var div_leftdown = LTFunction.createDiv(1, null, 110);
		var div_rightup = LTFunction.createDiv(1, null, 110);
		var div_rightdown = LTFunction.createDiv(1, null, 110);
		div_leftup.style.background = "url("+this.arrows+")  no-repeat 0px 0px";
		div_leftdown.style.background = "url("+this.arrows+")  no-repeat 0px -7px";
		div_rightup.style.background = "url("+this.arrows+")  no-repeat -7px 0px";
		div_rightdown.style.background = "url("+this.arrows+")  no-repeat -7px -7px";
		this.cursorArrowsDiv.appendChild(div_leftup);
		this.cursorArrowsDiv.appendChild(div_leftdown);
		this.cursorArrowsDiv.appendChild(div_rightup);
		this.cursorArrowsDiv.appendChild(div_rightdown);
		
		if (zoom == "zoomIn") {
			//this.cursorArrowsDiv.style.backgroundColor = "white";
			this.cursorArrowsDiv.style.width = widthMin + "px";
			this.cursorArrowsDiv.style.height = heightMin + "px";
			this.cursorArrowsDiv.style.left = xy[0] - parseInt(this.cursorArrowsDiv.style.width) / 2;
			this.cursorArrowsDiv.style.top = xy[1] - parseInt(this.cursorArrowsDiv.style.height) / 2;
			
			//左上
			div_leftup.style.overflow = "hidden";
			div_leftup.style.width = cornerWidth + "px";
			div_leftup.style.height = cornerHeight + "px";
			div_leftup.style.left = "0px";
			div_leftup.style.top = "0px";
			//左下
			div_leftdown.style.overflow = "hidden";
			div_leftdown.style.width = cornerWidth + "px";
			div_leftdown.style.height = cornerHeight + "px";
			div_leftdown.style.left = "0px";
			div_leftdown.style.top = (parseInt(this.cursorArrowsDiv.style.height) - cornerHeight) + "px";
			//右上
			div_rightup.style.overflow = "hidden";
			div_rightup.style.width = cornerWidth + "px";
			div_rightup.style.height = cornerHeight + "px";
			div_rightup.style.left = (parseInt(this.cursorArrowsDiv.style.width) - cornerWidth) + "px";
			div_rightup.style.top = "0px";
			//右下
			div_rightdown.style.overflow = "hidden";
			div_rightdown.style.width = cornerWidth + "px";
			div_rightdown.style.height = cornerHeight + "px";
			div_rightdown.style.left = (parseInt(this.cursorArrowsDiv.style.width) - cornerWidth) + "px";
			div_rightdown.style.top = (parseInt(this.cursorArrowsDiv.style.height) - cornerHeight) + "px";
			move = this.move = setInterval(function(){
				if (parseInt(arrowsDiv.style.width) < widthMax) {
					arrowsDiv.style.width = (parseInt(arrowsDiv.style.width) + parseInt(widthMax - widthMin) / speed) + "px";
					arrowsDiv.style.height = (parseInt(arrowsDiv.style.height) + parseInt(heightMax - heightMin) / speed) + "px";
					arrowsDiv.style.left = parseInt(arrowsDiv.style.left) - parseInt(widthMax - widthMin - correctZoomIn[0]) / speed / 2 + "px";
					arrowsDiv.style.top = parseInt(arrowsDiv.style.top) - parseInt(heightMax - heightMin - correctZoomIn[1]) / speed / 2 + "px";
					//左上
					div_leftup.style.left = "0px";
					div_leftup.style.top = "0px";
					//左下
					div_leftdown.style.left = "0px";
					div_leftdown.style.top = (parseInt(arrowsDiv.style.height) - 7) + "px";
					//右上
					div_rightup.style.left = (parseInt(arrowsDiv.style.width) - 7) + "px";
					div_rightup.style.top = "0px";
					//右下
					div_rightdown.style.left = (parseInt(arrowsDiv.style.width) - 7) + "px";
					div_rightdown.style.top = (parseInt(arrowsDiv.style.height) - 7) + "px";
					
					
				}else{
					setTimeout(function(){
						arrowsDiv.innerHTML = "";
					},300);
					clearInterval(move);
				}
			}, 50);
		}else{
			//this.cursorArrowsDiv.style.backgroundColor = "white";
			this.cursorArrowsDiv.style.width = widthMax + "px";
			this.cursorArrowsDiv.style.height = heightMax + "px";
			this.cursorArrowsDiv.style.left = xy[0] - parseInt(this.cursorArrowsDiv.style.width) / 2;
			this.cursorArrowsDiv.style.top = xy[1] - parseInt(this.cursorArrowsDiv.style.height) / 2;
			//左上
			div_leftup.style.overflow = "hidden";
			div_leftup.style.width = cornerWidth + "px";
			div_leftup.style.height = cornerHeight + "px";
			div_leftup.style.left = (parseInt(this.cursorArrowsDiv.style.width) - cornerWidth) + "px";
			div_leftup.style.top = (parseInt(this.cursorArrowsDiv.style.height) - cornerHeight) + "px";
			//左下
			div_leftdown.style.overflow = "hidden";
			div_leftdown.style.width = cornerWidth + "px";
			div_leftdown.style.height = cornerHeight + "px";
			div_leftdown.style.left = (parseInt(this.cursorArrowsDiv.style.width) - cornerWidth) + "px";
			div_leftdown.style.top = "0px";
			//右上
			div_rightup.style.overflow = "hidden";
			div_rightup.style.width = cornerWidth + "px";
			div_rightup.style.height = cornerHeight + "px";
			div_rightup.style.left = "0px";
			div_rightup.style.top = (parseInt(this.cursorArrowsDiv.style.height) - cornerHeight) + "px";
			//右下
			div_rightdown.style.overflow = "hidden";
			div_rightdown.style.width = cornerWidth + "px";
			div_rightdown.style.height = cornerHeight + "px";
			div_rightdown.style.left = "0px";
			div_rightdown.style.top = "0px";

			move = this.move = setInterval(function(){
				if (widthMin < parseInt(arrowsDiv.style.width)) {
					arrowsDiv.style.width = (parseInt(arrowsDiv.style.width) - parseInt(widthMax - widthMin) / speed) + "px";
					arrowsDiv.style.height = (parseInt(arrowsDiv.style.height) - parseInt(heightMax - heightMin) / speed) + "px";
					arrowsDiv.style.left = parseInt(arrowsDiv.style.left) + parseInt(widthMax - widthMin + correctZoomOut[0]) / speed / 2 + "px";
					arrowsDiv.style.top = parseInt(arrowsDiv.style.top) + parseInt(heightMax - heightMin + correctZoomOut[1]) / speed / 2 + "px";
					//左上
					div_leftup.style.left = (parseInt(arrowsDiv.style.width) - 7) + "px";
					div_leftup.style.top = (parseInt(arrowsDiv.style.height) - 7) + "px";
					//左下
					div_leftdown.style.left = (parseInt(arrowsDiv.style.width) - 7) + "px";
					div_leftdown.style.top = "0px";
					//右上
					div_rightup.style.left = "0px";
					div_rightup.style.top = (parseInt(arrowsDiv.style.height) - 7) + "px";
					//右下
					div_rightdown.style.left = "0px";
					div_rightdown.style.top = "0px";
				}else{
					setTimeout(function(){
						arrowsDiv.innerHTML = "";
					},300);
					clearInterval(move);
				}
			}, 50);
		}
	}

/*
以下函数是地图键盘操作支持的方法
*/


	//打开键盘操作支持，任何时候页面上最多有一个地图正在使用键盘事件
	LTMaps.prototype.handleKeyboard=function()
	{
		this.clearHandleKeyboard();	//如果前面已经有键盘操作支持
		LTMaps.kdl=LTEvent.bind(document,"keydown",this,this.onKeyDown);//在键盘上的键被按下的时候执行操作
		LTMaps.kul=LTEvent.bind(document,"keyup",this,this.onKeyUp);//在键盘上的键被释放的时候执行操作
	//	LTMaps.mml=LTEvent.bind(this,"move",this,function(){if(document.all && document.activeElement!=this.container){try{this.container.setActive();}catch(e){}}});
	}
	//取消键盘操作的支持，这个函数实际上是一个静态的，也就是说假如页面上有多个地图实例，调用任何一个地图的该方法都会取消键盘操作
	LTMaps.prototype.clearHandleKeyboard=function()
	{
		if(LTMaps.kdl){LTEvent.removeListener(LTMaps.kdl);LTMaps.kdl=null;}
		if(LTMaps.kul){LTEvent.removeListener(LTMaps.kul);LTMaps.kul=null;}
	//	if(LTMaps.mml){LTEvent.removeListener(LTMaps.mml);LTMaps.mml=null;}
		if(LTMaps.mmt){window.clearInterval(LTMaps.mmt);LTMaps.mmt=null;}
	}
	//在键盘被按下的时候执行，在按下的时候主要开始地图的滑动过程
	LTMaps.prototype.onKeyDown=function(e)
	{
		if(!LTMaps.isMapKey(e)){return;}//判断是否应该由地图来处理该事件
		if(!LTMaps.move){LTMaps.move=[0,0]}//LTMaps.move用来记录地图的滑动方向
		var move=LTMaps.move;
		//判断地图上的按方向键的按下状态，根据状态变化地图的滑动方向
		switch(e.keyCode)
		{
			case 37:
				move[0]=-10;
				break;
			case 38:
				move[1]=-10;
				break;
			case 39:
				move[0]=10;
				break;
			case 40:
				move[1]=10;
				break;
		}
		if(!LTMaps.mmt)
		{
			//开始持续滑动
			LTEvent.trigger(this,"movestart",[this.centerPoint]);
			LTMaps.mmt=window.setInterval(LTEvent.getCallback(this,this.continuousMove),32);
		}
	}
	//本函数将会在地图方向键被按下的时候持续执行
	LTMaps.prototype.continuousMove=function()
	{//将地图向指定的方向移动
		this.setCenterAtLatLng(this.getPointLatLng([this.viewSize[0]/2+LTMaps.move[0],this.viewSize[1]/2+LTMaps.move[1]]));
	}
	//本函数判断指定的事件是否应该由地图来处理
	LTMaps.isMapKey=function(e)
	{
		if(e.ctrlKey||e.altKey||e.metaKey)//如果按下了控制键，则不处理
		{
			return false;
		}
		if((e.target.nodeName=="INPUT" && e.target.type=="text") || e.target.nodeName=="TEXTAREA")//如果当前的焦点在输入框上，则不处理
		{
			return false;
		}
		return true;
	}
	//在键盘上的键被释放的时候执行
	LTMaps.prototype.onKeyUp=function(e)
	{
		if(!LTMaps.isMapKey(e)){return;}
		switch(e.keyCode)
		{
			case 187://大键盘上的+
			case 107://小键盘上的+
			case 61:
				this.zoomIn();
				break;
			case 189://大键盘上的-
			case 109://小键盘上的-
				this.zoomOut();
				break;
			case 33://PageUp键
			case 87://W键
			case 104://小键盘上的8
				this.move([0,-this.viewSize[1]/2]);
				break;
			case 34://PageDown键
			case 83://S键
			case 98://小键盘上的2
				this.move([0,this.viewSize[1]/2]);
				break;
			case 35://Home键
			case 68://D键
			case 102://小键盘上的6
				this.move([this.viewSize[0]/2,0]);
				break;
			case 36://End键
			case 65://A键
			case 100://小键盘上的4
				this.move([-this.viewSize[0]/2,0]);
				break;
			case 37://左
			case 39://右
				if(LTMaps.move){LTMaps.move[0]=0;}
				break;
			case 38://上
			case 40://下
				if(LTMaps.move){LTMaps.move[1]=0;}
				break;
			case 101://小键盘上的5
				this.returnLastView();
				break;
		}
		//如果所有方向键都已经释放，则停止滑动定时执行
		if(LTMaps.mmt && LTMaps.move[0]==0 && LTMaps.move[1]==0)
		{
			window.clearInterval(LTMaps.mmt);
			LTMaps.mmt=null;
			LTEvent.trigger(this,"moveend",[this.centerPoint,"m_scroll"]);
		}
	}
	LTMaps.prototype.getDefaultInfoWin=function()
	{
		return this._MarkerInfoWin?this._MarkerInfoWin:(window.LTInfoWindow?new window.LTInfoWindow():null);
	}
	
	//去掉地图左下角版权的点击事件
	LTMaps.prototype.removeCopyrightClick=function()
	{
		if (this.logoControl) {
			this.removeControl(this.logoControl);
			this.logoControl = new LTLogoControl(this.copyright, window._LT_map_logoConfig);
			this.addControl(this.logoControl);
		}
	}
	LTMaps.prototype.removeProgressControl=function(){
		if(this.progress)
		{
			this.removeControl(this.progress);
		}
	}
	LTMaps.prototype.addProgressControl=function(){
		if(!this.progress)
		{
			this.progress=new LTProgressControl();
			this.addControl(this.progress);
		}
	}
	
	//控制世界地图拖动范围
	LTMaps.prototype.mapSizePoint=function()
	{
		var minXY = [0,this.viewSize[1]];
		var maxXY = [this.viewSize[0],0];
		var min_point = this.getPointLatLng(minXY);
		var max_point = this.getPointLatLng(maxXY);
		return new LTBounds(min_point.getLongitude(),min_point.getLatitude(),max_point.getLongitude(),max_point.getLatitude());
	}
	
	//此方法中的经纬度不用转换成墨卡托，因为中心点的坐标和输入的范围坐标都以NTU计算
	LTMaps.prototype.setMapBounds=function(minBounds,maxBounds)
	{
		var worldMaxBounds = new LTBounds(-18003716,-8665533,17996281,8505394);
		//var worldMaxBounds = new LTBounds(-17995748,-8506363,17995457,8270254);
		maxBounds=maxBounds?maxBounds:worldMaxBounds;
		
		var centerPoint = new LTPoint(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
		
		//上边超出边界
		if((centerPoint.getLatitude()-minBounds.getYmax())<(centerPoint.getLatitude()-maxBounds.getYmax())){
			//alert("上边超出边界");
			centerPoint.setLatitude(centerPoint.getLatitude()-(minBounds.getYmax()-maxBounds.getYmax()));
			//centerPoint.setLatitude(centerPoint.getLatitude()-(minBounds.getYmax()-maxBounds.getYmax())-4096*256);
		}
		//右边超出边界
		if((centerPoint.getLongitude()-minBounds.getXmax())<(centerPoint.getLongitude()-maxBounds.getXmax())){
			//alert("右边超出边界");
			centerPoint.setLongitude(centerPoint.getLongitude()-(minBounds.getXmax()-maxBounds.getXmax()));
		}
		//左边超出边界
		if((centerPoint.getLongitude()-minBounds.getXmin())>(centerPoint.getLongitude()-maxBounds.getXmin())){
			//alert("左边超出边界");
			centerPoint.setLongitude(centerPoint.getLongitude()-(minBounds.getXmin()-maxBounds.getXmin()));
		}
		//下边超出边界
		if((centerPoint.getLatitude()-minBounds.getYmin())>(centerPoint.getLatitude()-maxBounds.getYmin())){
			//alert("下边超出边界");
			centerPoint.setLatitude(centerPoint.getLatitude()-(minBounds.getYmin()-maxBounds.getYmin()));
			//centerPoint.setLatitude(centerPoint.getLatitude()-(minBounds.getYmin()-maxBounds.getYmin())-4096*256);
		}

		this.setCenterAtLatLng(centerPoint);
		//alert(this.centerPoint.getLongitude()+"||"+this.centerPoint.getLatitude());
	}
	
	window.LTMaps=LTMaps;
}
LTMapNS();