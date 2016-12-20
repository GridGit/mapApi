//���ļ���JS API֮�е�LTMaps������������һ�����ε����귶Χ
//���ṩһЩ��صķ������������֮��Ľ����жϣ���;��ε�λ���жϣ��ߺ;��εĽ�����ȡ��
//����X�����ȣ�Y����γ��
function LTMapNS()
{
	function LTMaps(container)
	{
		//��ʼ��Container
		if(document.all){try{document.execCommand("BackgroundImageCache", false, true);}catch(e){}}
		this.container=(typeof container=="object")?container:document.getElementById(container);
		if(!this.container){alert('û�д���������ʾ��ͼ�Ĳ�');return}
		//��¼container���ڵ�����
		this.originChildren=[];
		var child;
		while(child=this.container.firstChild)//ѭ��ɾ��DIV�����е���Ԫ��
		{
			this.originChildren.push(child);
			this.container.removeChild(child);
		}
		this.container.align="left";
		this.mapCursor=["default","move"];
		var style=this.container.style;
		if(style.position!="absolute"){style.position="relative";}
		//����tips�����ֿ�ѡ by lixiaoying 09/12/05
		//LTFunction.setUnSelectable(this.container);
		style.overflow="hidden";
		if(window._LT_map_bgImg)
		{
			style.backgroundImage="url("+window._LT_map_bgImg+")";
		}

		//���Container��С
		var viewSize=this.getContainerSize();

		//��ʼ������
		this.imgSize=window._LT_map_imgSize;
		this.baseUnits=window._LT_map_baseUnits?window._LT_map_baseUnits:256;
		this.methodConfig=window._LT_map_methodConfig;//8
		this.errorImgUrl=window._LT_map_errorImgURL;//LTMapTile.js���õ�������ͼ������ʱ����Ĭ��ͼƬ�滻�����ּ��ʺ�С��
		this.scrollSpeed=window._LT_map_scrollSpeed?window._LT_map_scrollSpeed:1;//�������ٶȣ�һ�ηŴ����Сһ����һ��������zoom��
		this.slideNum=window._LT_map_slideNumber?window._LT_map_slideNumber:12;
		//�������ż��𣬲�������ǰ�����ż���ģʽ
		this.zoomLevels=(window._LT_map_zoomLevels && window._LT_map_zoomLevels.length>0)?window._LT_map_zoomLevels:[];

		this.imgURLs=(typeof window._LT_map_imgURL=="string")?[window._LT_map_imgURL]:window._LT_map_imgURL;//ͼƬ������
		this.copyright = window._LT_map_copyright?window._LT_map_copyright:"";
		this.arrows = window._LT_map_arrows?window._LT_map_arrows:"";
		
		this.overlays=[];
		this.p_overlays=[];	//���������ڵ�ͼ����֮ǰ��ӵ���ͼ�ϵı�ע
		this.controls=[];
		this.canDrag=true;
		this.canMove=true;
		//mapsDiv���������õ�ͼͼƬ�Ĳ㣬overlaysDiv���ڵ���ΪҪ���ŵ�ͼ�ƶ���Ҳ���õ�mapsDiv֮��
		this.mapsDiv=LTFunction.createDiv(1,null,100);
		LTFunction.setCursorStyle(this.mapsDiv,this.mapCursor[0]);
		LTFunction.setCursorStyle(this.container,this.mapCursor[0]);
		//����tips�����ֿ�ѡ by lixiaoying 09/12/05
		//LTFunction.setUnSelectable(this.mapsDiv);
		var style=this.mapsDiv.style;
		style.overflow="visible";
		this.container.appendChild(this.mapsDiv);
		
		var maskDiv=LTFunction.createDiv(1,null,180);
		maskDiv.id="lt_maskDiv";
		LTFunction.setSize(maskDiv,["100%","100%"]);
		maskDiv.style.backgroundImage="url("+window._LT_map_maskBackgroundURL+")";
		//����tips�����ֿ�ѡ by lixiaoying 09/12/05
		//LTFunction.setUnSelectable(maskDiv);
		this.mapsDiv.appendChild(maskDiv);
		this.maskDiv=maskDiv;

		//�����ŵ�ͼ��ע�Ĳ�
		this.overlaysDiv=LTFunction.createDiv(1,null,500);
		this.overlaysDiv.id="lt_overlaysDiv";
		//����tips�����ֿ�ѡ by lixiaoying 09/12/05
		//LTFunction.setUnSelectable(this.overlaysDiv);
		var style=this.overlaysDiv.style;
		style.overflow="visible";
		this.mapsDiv.appendChild(this.overlaysDiv);
		//������ͼ�Ҽ��˵�
		LTEvent.addListener(this.container,"contextmenu",LTEvent.cancelBubble);
		
		//�����Ƿ�����trueΪ����,falseΪ�ر�
		this.cartoon = false;
		//�ж��Ƿ���˫��
		this.dbclick = false;
		//�����Ĳ���ʱ��
		this.cartoonPlayTime = 40;
		//������ͣ��ʱ��
		this.cartoonTime = 100;
		
		//���λ�÷Ŵ����Сʱ�Ķ���Ч����
		this.cursorArrowsDiv = LTFunction.createDiv(1,null,100);
		this.cursorArrowsDiv.id = "arrows";
		this.container.appendChild(this.cursorArrowsDiv);
		//��ͼ���¼�����
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
//		��¼ͼ������
		this.imgTotalNumber = 0;
		
		var logoFlag=true;
		try{if(typeof LTMaps.caller.arguments[0] == "object"){if(LTMaps.caller.arguments[0].constructor==LTMaps){logoFlag=false;}}}catch(e){}
		if(logoFlag)//�������ӥ��
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
	//�ڵ�ͼ����1��֮�����ͼ�Ƿ�����,�������,�����container����ԭ������
	LTMaps.prototype.checkContainer=function()
	{	
		//�˺����ڵ�ͼ��Ⱦ������5s����ã���ÿ�ζ���if����false ��return;�ƺ�û��ʲô�ã������ע��˵�����container���ԭ�����ݣ��������������
		if(this.originChildren==0 || this.mapsDiv.style.visibility!="hidden"){return;}
		var child;
		while(child=this.originChildren.shift())
		{
			this.container.appendChild(child);
		}
	}
	//��ͼ���ڲ��С�仯���������õ�ͼ
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
	//�������õ�ͼ��С
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
	{//��ñ����ߵĻ��㵥λ
		zoom = this.zoomLevels[zoom];
		return ((20037508.3427892)/Math.pow(2,zoom-1))/this.imgSize;
	}
	LTMaps.prototype.getBoundsLatLng=function()
	{//��ȡ��ͼ�ı߽�ľ�γ��
		//�����ĵ�����NTUת����ī��������
		var centerPoint_M = new LTPointMercator(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());

		var centerPoint=this.centerPoint;
		var viewSize=this.viewSize;
		var zoomUnit=this.zoomUnits;
		var Xmin=parseInt(centerPoint.getLongitude()-zoomUnit*viewSize[0]/2);
		var Ymin=parseInt(centerPoint.getLatitude()-zoomUnit*viewSize[1]/2);
		var Xmax=parseInt(centerPoint.getLongitude()+zoomUnit*viewSize[0]/2);
		var Ymax=parseInt(centerPoint.getLatitude()+zoomUnit*viewSize[1]/2);
		
		//�����ĵ����꣨ī���У�ת����NTU
		var centerPoint_N = new LTPointWGS84(centerPoint.getLongitude(),centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
		
		var min_N = new LTPointWGS84(Xmin,Ymin);
		var max_N = new LTPointWGS84(Xmax,Ymax);
		
		return new LTBounds(min_N.getLongitude(),min_N.getLatitude(),max_N.getLongitude(),max_N.getLatitude());
	}
	LTMaps.prototype.getDrawBounds=function()
	{//��ȡ��ͼ�������»��Ƶ�����
		var span=this.maxPixel*this.zoomUnits;
		var areaCenter=this.areaCenter;

		var leftDown = new LTPointWGS84((areaCenter.getLongitude()-span),(areaCenter.getLatitude()-span));
		var rigthUp = new LTPointWGS84((areaCenter.getLongitude()+span),(areaCenter.getLatitude()+span));
		
		return new LTBounds(leftDown.getLongitude(),leftDown.getLatitude(),rigthUp.getLongitude(),rigthUp.getLatitude());

	}
	LTMaps.prototype.addControl=function(control)
	{//���һ���ؼ�
		//���ؼ��Ĳ���ӵ���ͼ
		if(control.initialize(this)==false){return false;}
		var obj=control.getObject();
		
		if(obj)
		{
			LTEvent.addListener(obj,"contextmenu",LTEvent.cancelBubble);
			this.container.appendChild(obj);
			if(obj.style.zIndex==0){LTFunction.setZIndex(obj,1100);}
		}
		//�ؼ��ĳ�ʼ������
		this.controls.push(control);
		LTEvent.trigger(this,"addcontrol",[control]);
	}
	LTMaps.prototype.addMenuControl=function(control)
	{//���һ���Ҽ��ؼ�
		//���ؼ��Ĳ���ӵ���ͼ
		if(control.initialize(this)==false){return false;}
	}
	LTMaps.prototype.removeControl=function(control,depose)
	{
		//�ؼ���ȡ������
		if(!control){return;}
		if(control.remove){control.remove();}
		var obj=control.getObject();
		if(obj && obj.parentNode)
		{
			obj.parentNode.removeChild(obj);
		}
		//�ӿؼ�����֮��ɾ���ؼ�
		LTFunction.deleteFromArray(this.controls,control);
		if(depose && control.depose){control.depose();}
	}
	LTMaps.prototype.addOverLay=function(overlay,keep)
	{
		//��ע�ĳ�ʼ������
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
		//�ӱ�ע����֮��ɾ����ע
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
	{//����ͼ�������container����������ת��Ϊ�������꣬����������[left,top],����ֵ��LTPoint
		
		var zoomUnit=this.zoomUnits;
		center=center?center:this.centerPoint;
		
		//�����ĵ�NTUת����ī��������
		var center_M = new LTPointMercator(center.getLongitude(),center.getLatitude());
		center = new LTPoint(center_M.getLongitude(),center_M.getLatitude());
		
		//��ī���еľ�γ��ת����NTU
		var point_N = new LTPointWGS84(center.getLongitude()+zoomUnit*(point[0]-this.viewSize[0]/2),center.getLatitude()-zoomUnit*(point[1]-this.viewSize[1]/2));

		return new LTPoint(point_N.getLongitude(),point_N.getLatitude());
	}
	LTMaps.prototype.getPixelCoord=function(point,center)
	{//����������ת��Ϊ��ͼ�ϵ���������꣬�����container�ģ�������LTPoint,����ֵ������[left,top]
		var zoomUnit=this.zoomUnits;
		center=center?center:this.centerPoint;
		//��NTUת����ī��������
		var center_M = new LTPointMercator(center.getLongitude(),center.getLatitude());
		center = new LTPoint(center_M.getLongitude(),center_M.getLatitude());
		
		//��NTUת����ī��������
		var point_M = new LTPointMercator(point.getLongitude(),point.getLatitude());
		point = new LTPoint(point_M.getLongitude(),point_M.getLatitude());
		
		var px=[Math.round((point.getLongitude()-center.getLongitude())/zoomUnit+this.viewSize[0]/2),Math.round((center.getLatitude()-point.getLatitude())/zoomUnit+this.viewSize[1]/2)];
		
		//�����ĵ����꣨ī���У�ת����NTU
		var centerPoint_N = new LTPointWGS84(center.getLongitude(),center.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
		
		return px;
	}
	
	LTMaps.prototype.getOverLayPosition=function(point)
	{//����������ת��Ϊ��ͼ�ϵ���������꣬�����container�ģ�������LTPoint,����ֵ������[left,top]
		var p=this.getPixelCoord(point);
		var flag=p[0]>this.maxPixel*(-0.5) && p[1]>this.maxPixel*(-0.5) && p[0]<this.maxPixel*(1.5) && p[1]<this.maxPixel*(1.5);
		return [p[0]-parseInt(this.mapsDiv.style.left),p[1]-parseInt(this.mapsDiv.style.top),flag];
	}
	
	LTMaps.prototype.toMapId = function(point,zoom)
	{//ת����������Ϊ��������
		
		//��zoomת����17-0
		zoom=this.zoomLevels[zoom];

		//�����ĵ�����NTUת����ī��������
		var point_M = new LTPointMercator(point.getLongitude(),point.getLatitude());
		point = new LTPoint(point_M.getLongitude(),point_M.getLatitude());
		
		var span=(20037508.3427892)/Math.pow(2,zoom-1);
		var bx_=point.getLongitude()/span;
	    var by_=point.getLatitude()/span;
		var bx=parseInt(point.getLongitude()/span);
	    var by=parseInt(point.getLatitude()/span);
		
		//�жϾ�γ�ȳ��ָ�ֵʱ����ͼƬ������
		if(bx<0)
			bx = parseInt(bx_ - 1);
		
		if(by<0)
			by = parseInt(by_ - 1);
		
	    return [bx,by,(point.getLongitude()-bx*span)/span*this.imgSize,(point.getLatitude()-by*span)/span*this.imgSize];
	}
	LTMaps.prototype.centerAndZoom=function(point,zoom)
	{//���õ�ͼ�����ĵ���������ű���
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
		
		//���ڵĵ�ͼ��Ϊī����ͶӰ��ͼ�����ҵ�ͼ�����ŵȼ�Ҫ��Ϊ����׼�����������ڵĵȼ�����ǰ�ĵȼ����෴�ģ�Ϊ���û��������ǣ�����Ϊ������ǰ�ĵȼ�
		//this.zoom = this.zoomLevels[zoom];
		//zoom = this.zoom;
		zoom=this.zoomLevels[zoom];
		
		//�ж�zoom�Ƿ���ָ����Χ֮��
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
			LTEvent.trigger(this,"moveend",[this.centerPoint]);//moveend�¼�������ӵ��أ�
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
	{//������һ��ͼ�ĺ���
		if(typeof this.lastZoom=="number" && this.lastCenterPoint)
		{
			var lastZoom = this.getZoomIndex(this.lastZoom);
			//moveToCenter����Ϊ�û������࣬��Ҫzoom����Ϊ��ǰ��ʽ
			this.moveToCenter(this.lastCenterPoint,lastZoom);
		}
	}
//��õ�Ԫ�����Ŀ,Ӧ����ͼ����,�����ҷ�����ʱ�������Ŀ����ͼ����,����������ֲ�����Ϊ��ͼ����
//�������Ŀǰû�б��˵���
	LTMaps.prototype.getMapTableNum = function()
	{//��̬����-��ȡ��Ԫ�����Ŀ
		var cellsNum = Math.ceil(this.viewSize[0]/this.imgSize);
		var rowsNum = Math.ceil(this.viewSize[1]/this.imgSize);
		rowsNum += 1;
		cellsNum += 1;
		return [cellsNum,rowsNum];
	}
	LTMaps.prototype.initialize=function()
	{//��ͼ��ʼ�������ɵ�ͼͼƬ
		LTEvent.trigger(this,"init");
		this.loaded=true;
	}
	LTMaps.prototype.moveMapImages=function(flag)
	{//�ڵ�ͼ�ƶ���ʱ��任ͼƬ,flagΪtrue�����ʼ����ı����ŵȼ�������ǰ���ĵ��Ϊ�������ĵ�
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
		//�����ĵ�����NTUת����ī��������
		var centerPoint_M = new LTPointMercator(centerPoint.getLongitude(),centerPoint.getLatitude());
		centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());
		//window.console.log(centerPoint);
		//window.console.log("centerBox:" +centerBox);//710,243,101.67236328125,105.38330078125
		//�����ǰ���ĵ����������ĵ�̫Զ���򽫵�ǰ���ĵ��Ϊ�������ĵ�window.console.log("flag1");
		if(!flag && areaCenter && (Math.abs(areaCenter.getLongitude()-centerPoint.getLongitude())/zoomUnits+this.viewSize[0]/2>this.maxPixel || Math.abs(areaCenter.getLatitude()-centerPoint.getLatitude())/zoomUnits+this.viewSize[1]/2>this.maxPixel)){flag=true;}

		if(flag){
			this.areaCenter=centerPoint
		}
		//�������б�֮�е�ͼƬ���
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
			if(!id){continue;}//��for-each֮��ȡ�õ���Ŀ��Ϊ�����û���ҳ�϶�array������prototype�޸ģ������ؽ����ж�
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
		//��ӻ�������������ͼƬ
		this.imgTotalNumber = 0;
		for(var x=minX;x<=maxX;x++)
		{
			for(var y=minY;y<=maxY;y++)
			{
				this.imgTotalNumber++;
				this.tileMgr.showTile([x,y,this.zoomIndex],offset,flag);
			}
		}
		//ת��Ϊ
		var min_N = new LTPointWGS84(minX*zoomUnits*imgSize,minY*zoomUnits*imgSize);
		var max_N = new LTPointWGS84((maxX+1)*zoomUnits*imgSize,(maxY+1)*zoomUnits*imgSize);
		this.imgBounds=new LTBounds(min_N.getLongitude(),min_N.getLatitude(),max_N.getLongitude(),max_N.getLatitude());
		//this.imgBounds=new LTBounds(minX*zoomUnits*imgSize,minY*zoomUnits*imgSize,(maxX+1)*zoomUnits*imgSize,(maxY+1)*zoomUnits*imgSize);
		//window.console.log(minX*zoomUnits*imgSize + "," + minY*zoomUnits*imgSize);
		//window.console.log((maxX+1)*zoomUnits*imgSize + "," + (maxY+1)*zoomUnits*imgSize);
		
		//�����ĵ����꣨ī���У�ת����NTU
		var centerPoint_N = new LTPointWGS84(centerPoint.getLongitude(),centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
		this.toCenter(flag);
		return;
	}
	LTMaps.prototype.toCenter=function(flag)
	{//����ͼ��centerPoint�ƶ�����ͼͼ������
		//�����ĵ�NTUת����ī����
		var centerPoint_M = new LTPointMercator(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());
		var centerPoint=this.centerPoint;
		//var zoomUnits=this.getZoomUnits(this.zoom);
		var zoom = this.getZoomIndex(this.zoom);
		var zoomUnits=this.getZoomUnits(zoom);
		var divZoom=this.divZoom?this.divZoom:1;
		var position=[this.viewSize[0]/2-(centerPoint.getLongitude()-this.areaCenter.getLongitude())/zoomUnits*divZoom,this.viewSize[1]/2+(centerPoint.getLatitude()-this.areaCenter.getLatitude())/zoomUnits*divZoom];
		//�����ĵ�ī����ת����NTU
		var centerPoint_N = new LTPointWGS84(centerPoint.getLongitude(),centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
		
		/*��ͼ�������λ��*/
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
		//��ͼ��λ
		LTFunction.setPosition(this.mapsDiv,position);
		//�����ﶨλ
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
	{//��ȡͼƬ����ַ
		
		//��zoomת����17-0
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
			//ÿ�����������Ϊ  16* 16 = 256(�������Ŀ¼�����ļ���)
			var nSize=1<<(4*(nGrade-i));//���㵱ǰĿ¼�����ĵ�Ԫ��(������룩
			var nRow =parseInt((bx-nPreRow*nPreSize)/nSize);  //�õ��У���ֵ
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
	{//�ı��ͼ�����ż���
		zoom=this.zoomLevels[zoom];
		if (zoom == this.zoom) {
			this.zoomToByStyle(); //ͨ����껬�ָı����ŵȼ���ʱ��
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
		//��ͼ����Ч��
		if(this.cartoon){
			//��ͼ����ֻ����������һ��ʱ����Ч
			if(Math.abs(this.zoom-this.zoomLevels[oZIndex])==1)
			{	
				//����֧�ֻ������ŵȼ�
				this.mapCartoon(oZIndex,index,"zoomto");
			}else{
				//������ָ��ɾ�������е��ļ���ͼƬʱ����ʱɾ�������ף�������ÿ����ִ��delMapsDivCacheʱ��ȫ��ɾ��
				//ɾ����ͼ�ϴ��ڵ�ͼ��
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
	//��ͼ������������
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
	//ɾ����ͼ�ϵ���Ƭͼ��ͻ����ͼƬ,cartoonIndexΪ�������ID��indexΪҪ��ʾ�Ĳ��,allTileΪҪɾ������ͼƬ������trueΪȫ��ɾ����falseΪָ��ɾ����
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
			//ɾ�������еĵ�ͼͼƬ
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
	//˫����ͼʱ����ͼ�����ƶ�����
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
				//��slideObject.toPoint��NTUֵת����ī����
				var slideObject_toPoint_M = new LTPointMercator(slideObject.toPoint.getLongitude(),slideObject.toPoint.getLatitude());
				slideObject_toPoint = new LTPoint(slideObject_toPoint_M.getLongitude(),slideObject_toPoint_M.getLatitude());
				//�����ĵ�NTUת����ī����
				var centerPoint_M = new LTPointMercator(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
				this.centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());
				var distanceX=slideObject_toPoint.getLongitude()-this.centerPoint.getLongitude();
				var distanceY=slideObject_toPoint.getLatitude()-this.centerPoint.getLatitude();
				var distance=Math.sqrt(Math.pow(distanceX,2)+Math.pow(distanceY,2));
				//�����ĵ�ī����ת����NTU
				var centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
				this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
				//��slideObject.toPoint��ī����ֵת����NTU
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
			//��slideObject.toPoint��NTUֵת����ī����
			var slideObject_fromPoint_M = new LTPointMercator(slideObject.fromPoint.getLongitude(),slideObject.fromPoint.getLatitude());
			slideObject_fromPoint = new LTPoint(slideObject_fromPoint_M.getLongitude(),slideObject_fromPoint_M.getLatitude());
			var slideDistance=slideObject.distance;
			var slideMaxPixel=slideDistance*(Math.sin(Math.PI*(slideObject.number/num-0.5))/2+0.5);
			this.centerPoint=new LTPoint(slideObject_fromPoint.getLongitude()+Math.round(slideMaxPixel*slideObject.distanceX/slideDistance),slideObject_fromPoint.getLatitude()+Math.round(slideMaxPixel*slideObject.distanceY/slideDistance));
			//�����ĵ�ī����ת����NTU
			var centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
			this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
			//��slideObject.toPoint��ī����ת����NTUֵ
			var slideObject_fromPoint_N = new LTPointWGS84(slideObject_fromPoint.getLongitude(),slideObject_fromPoint.getLatitude());
			slideObject.fromPoint = new LTPoint(slideObject_fromPoint_N.getLongitude(),slideObject_fromPoint_N.getLatitude());
			this.toCenter();
		}
	}
	//��ͼ����Ч������Ҫ������oZIndex��ǰ����indexҪ���ŵļ���,true�Ƿ������ڼ�������,type�ǹ�ͷ�������������ţ�zoomtoΪ��ͷ�����ţ�mousewheelΪ���������ţ�
	LTMaps.prototype.mapCartoon=function(oZIndex,index,type)
	{
		this.zoomInOrOut = oZIndex>index?true:false;
		if(typeof this.zoomInOrOut_temp == "undefined"){
			this.zoomInOrOut_temp = this.zoomInOrOut;
		}
		//��Ϊ�������ֻ����ر��ʱ����ʱ��Ƭ���ɾ���Ĳ����ף����Ե����ж�һ�£�Ҫ�Ŵ����С��ʱ����һ����Ƭ���Ƿ���ڡ�
		if(typeof this["mapsDiv_" + index] == "object"){
			this.delMapsDivCache(index,index);
		}
		//�Ŵ��ͼ����
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
		}else{	//��С��ͼ����
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
		//�����µ���Ƭ�㣬������ʾ�µĵ�ͼ
		if (!this["mapsDiv_" + this.zoomIndex]) {
			this["mapsDiv_" + this.zoomIndex] = LTFunction.createDiv(1);
			this["mapsDiv_" + this.zoomIndex].id = "lt_mapsDiv_"+this.zoomIndex;
			this.mapsDiv.appendChild(this["mapsDiv_" + this.zoomIndex]);
		}
		//��˫����ͼ��Ȼ��Ŵ󶯻����ƶ������ĵ㣬����ʾ�µĵ�ͼ
		if(!this.slideObject)
		{
			//������������
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
		//���컬�����Ŷ���
		slideObject.endZIndex=index;
		slideObject.number=0;
		var oZoom_temp=this.zoomLevels[slideObject.oZIndex];
		this.oZoom=this.getZoomIndex(oZoom_temp);
		this.deltaImgPosition_temp = [];
		this.deltaImgPosition_temp[0] = this.deltaImgPosition[0];
		this.deltaImgPosition_temp[1] = this.deltaImgPosition[1];
		//������Ƭ�㣬����Ƭ���ͼƬλ�ú͸߿�ͬʱ�Ŵ����С��������������꽫�Ŵ����С��ͼʱ�����λ�õĶ������Ҫ��ʾ��һ����ͼʱ��λ����ͬ
		if(this["mapsDiv_"+slideObject.oZIndex]){
			var imgs = this["mapsDiv_"+slideObject.oZIndex].getElementsByTagName("img");
			//����һ��imgs����
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
			//���ص�ͼ�ϵĵ�����
			this.overlaysDiv.style.display = "none";
			if(this.dbclickPoint){
				var delta;
				this.newCenterPixelCartoon = [];
				if (oZIndex > index) {
					if(!this.dbclick){		//������Ŵ�
						delta = mul;
						//this.dbPoint	���˫��λ�õ�����
						this.dbPoint = this.getPixelCoord(this.dbclickPoint);
						//���ĵ�����
						this.centerPixelCartoon = this.getPixelCoord(this.getCenterPoint());
						var x = this.centerPixelCartoon[0] + (this.centerPixelCartoon[0] - this.dbPoint[0]) * (delta - 1);
						this.newCenterPixelCartoon.push(x);
						var y = this.centerPixelCartoon[1] + (this.centerPixelCartoon[1] - this.dbPoint[1]) * (delta - 1);
						this.newCenterPixelCartoon.push(y);
						//��ֹ�û��������ֲ��������������ɲ�
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
						//�����Ƿ���ִ��
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
									//��ʾ��ͼ�ϵĵ�����
									self.overlaysDiv.style.display = "block";
								}, self.cartoonTime);
							}
						}, self.cartoonPlayTime);
					}
					else
					{
						delta = mul;
						window.clearTimeout(slideObject.timeout);
						//��ֹ�û��������ֲ��������������ɲ�
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
						//�����Ƿ���ִ��
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
									//��ʾ��ͼ�ϵĵ�����
									self.overlaysDiv.style.display = "block";
								}, 300);
							}
						}, 50);
					}
				}else if(oZIndex < index){
					delta = mul;
					//this.dbPoint	���λ�õ�����
					this.dbPoint = this.getPixelCoord(this.dbclickPoint);
					//���ĵ�����
					this.centerPixelCartoon = this.getPixelCoord(this.getCenterPoint());
					var x = this.centerPixelCartoon[0] + (this.centerPixelCartoon[0] - this.dbPoint[0]) * (delta - 1);
					this.newCenterPixelCartoon.push(x);
					var y = this.centerPixelCartoon[1] + (this.centerPixelCartoon[1] - this.dbPoint[1]) * (delta - 1);
					this.newCenterPixelCartoon.push(y);
					this.centerPoint = this.getPointLatLng(this.newCenterPixelCartoon);
					//��ֹ�û��������ֲ��������������ɲ�
					if (typeof this.moveCartoon == "number") {
						clearInterval(this.moveCartoon);
					}
					//������ʱ������Ӧ���ڶ�ʱ����
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
								//��ʾ��ͼ�ϵĵ�����
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
								//��ʾ��ͼ�ϵĵ�����
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
								//��ʾ��ͼ�ϵĵ�����
								self.overlaysDiv.style.display = "block";
							},self.cartoonTime);
						}
					}, self.cartoonPlayTime);
				}
			}
		}
	}
	//����ͼ���ŵ�ָ�������ŵȼ�(������С��)
	LTMaps.prototype.zoomToByStyle=function(index,latlng,point)
	{
		var divZoom=typeof index=="number"?Math.pow(2,this.getCurrentZoom(true)-((index==Math.floor(index))?this.zoomLevels[index]:(this.zoomLevels[Math.ceil(index)]-this.zoomLevels[Math.floor(index)])*(index-Math.floor(index))+this.zoomLevels[Math.floor(index)])):1;
		this.divZoom=divZoom;

		if(latlng)
		{
			//�����ĵ�NTUת����ī����
			var latlng_M = new LTPointMercator(latlng.getLongitude(),latlng.getLatitude());
			latlng = new LTPoint(latlng_M.getLongitude(),latlng_M.getLatitude());
			//var zoomUnits=this.getZoomUnits(this.zoom)/divZoom;
			var zoom = this.getZoomIndex(this.zoom);
			var zoomUnits=this.getZoomUnits(zoom)/divZoom;
			var viewSize=this.viewSize;
			latlng=new LTPoint(latlng.getLongitude()+zoomUnits*(viewSize[0]/2-point[0]),latlng.getLatitude()-zoomUnits*(viewSize[1]/2-point[1]));
			//�����ĵ�ī����ת����NTU
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
	{//�ƶ���ָ���ľ�γ��
		this.centerPoint=point;
		this.moveMapImages(false);
	}
	//�����zoomΪ��ǰ0-13����
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
		
		//�������NTUת����ī����
		var point_M = new LTPointMercator(point.getLongitude(),point.getLatitude());
		point = new LTPoint(point_M.getLongitude(),point_M.getLatitude());
		
		//�����ĵ�NTUת����ī����
		var centerPoint_M = new LTPointMercator(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());
		
		var fromPoint=this.centerPoint;
		var distanceX=point.getLongitude()-fromPoint.getLongitude();
		var distanceY=point.getLatitude()-fromPoint.getLatitude();
		
		//�����ĵ�ī����ת����NTU
		var centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
		this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
		
		//�������ī����ת����NTU
		var point_N = new LTPointWGS84(point.getLongitude(),point.getLatitude());
		point = new LTPoint(point_N.getLongitude(),point_N.getLatitude());
		
		if(distanceX==0  && distanceY==0)
		{//�������Ҫ�ƶ�����ֱ���˳�
			return;
		}
		var units=this.zoomUnits;
		var viewSize=this.viewSize;
		
		if(Math.abs(distanceX)>viewSize[0]*units*2 || Math.abs(distanceY)>viewSize[1]*units*2)
		{//�����Ҫ�ƶ��ķ�Χ�Ƚϴ���ֱ�Ӷ�λ����ִ�л�������
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
				//��slideObject.toPoint��NTUֵת����ī����
				var slideObject_toPoint_M = new LTPointMercator(slideObject.toPoint.getLongitude(),slideObject.toPoint.getLatitude());
				slideObject_toPoint = new LTPoint(slideObject_toPoint_M.getLongitude(),slideObject_toPoint_M.getLatitude());

				//�����ĵ�NTUת����ī����
				var centerPoint_M = new LTPointMercator(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
				this.centerPoint = new LTPoint(centerPoint_M.getLongitude(),centerPoint_M.getLatitude());
				
				var distanceX=slideObject_toPoint.getLongitude()-this.centerPoint.getLongitude();
				var distanceY=slideObject_toPoint.getLatitude()-this.centerPoint.getLatitude();
				var distance=Math.sqrt(Math.pow(distanceX,2)+Math.pow(distanceY,2));

				//�����ĵ�ī����ת����NTU
				var centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
				this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
				
				//��slideObject.toPoint��ī����ֵת����NTU
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
			//��slideObject.toPoint��NTUֵת����ī����
			var slideObject_fromPoint_M = new LTPointMercator(slideObject.fromPoint.getLongitude(),slideObject.fromPoint.getLatitude());
			slideObject_fromPoint = new LTPoint(slideObject_fromPoint_M.getLongitude(),slideObject_fromPoint_M.getLatitude());
			var slideDistance=slideObject.distance;
			var slideMaxPixel=slideDistance*(Math.sin(Math.PI*(slideObject.number/num-0.5))/2+0.5);
			this.centerPoint=new LTPoint(slideObject_fromPoint.getLongitude()+slideMaxPixel*slideObject.distanceX/slideDistance,slideObject_fromPoint.getLatitude()+slideMaxPixel*slideObject.distanceY/slideDistance);

			//�����ĵ�ī����ת����NTU
			var centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
			this.centerPoint = new LTPoint(centerPoint_N.getLongitude(),centerPoint_N.getLatitude());
			
			//��slideObject.toPoint��ī����ת����NTUֵ
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
	{//��ͼ�ƶ�ָ��������ֵ
		this.moveToCenter(this.getPointLatLng([this.viewSize[0]/2+size[0],this.viewSize[1]/2+size[1]]));
	}
	//������Ϊ�˺ͽӿڼ��ݶ������ķ��������ǵ���move����ʵ��
	LTMaps.prototype.mapMoveToUp=function(num){this.move([0,-num*this.imgSize]);}
	LTMaps.prototype.mapMoveToRight=function(num){this.move([num*this.imgSize,0]);}
	LTMaps.prototype.mapMoveToDown=function(num){this.move([0,num*this.imgSize]);}
	LTMaps.prototype.mapMoveToLeft=function(num){this.move([-num*this.imgSize,0]);}
	LTMaps.prototype.onDoubleClick=function(e)
	{//��ͼ��˫��ʱִ�еĲ���
		LTEvent.cancelBubble(e);
		if(!this.loaded){return;}
		var point=this.getPointLatLng(LTFunction.getEventPosition(e,this.container));
		this.dbclick = true;
		this.dbclickPoint = point;
		//�����Ƿ�˫���Ŵ��ͼ����
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
	{//��ʼ�϶�����
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
	{//��ͼ�϶�
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
			
			//�����ĵ�����NTUת����ī��������
			var onMouseMove_dragCenterPoint_M = new LTPointMercator(dragCenterPoint.getLongitude(),dragCenterPoint.getLatitude());
			dragCenterPoint = new LTPoint(onMouseMove_dragCenterPoint_M.getLongitude(),onMouseMove_dragCenterPoint_M.getLatitude());
			
			this.centerPoint=new LTPoint(dragCenterPoint.getLongitude()+((dragStartPoint[0]-dragPoint[0])*units),dragCenterPoint.getLatitude()+((dragPoint[1]-dragStartPoint[1])*units));
			
			//�����ĵ����꣨ī���У�ת����NTU
			var onMouseMove_centerPoint_N = new LTPointWGS84(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
			this.centerPoint = new LTPoint(onMouseMove_centerPoint_N.getLongitude(),onMouseMove_centerPoint_N.getLatitude());
			
			//ԭʼ���ĵ㾭γ���������ĵ㾭γ�����ʱ����ִ��toCenter������
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
	{//�����϶�����
		LTEvent.cancelBubble(e);
		var point=LTFunction.getEventPosition(e,this.container);
		this.dragEnd(e);
		if(document.releaseCapture)
		{
			document.releaseCapture();
		}
		LTFunction.setCursorStyle(this.mapsDiv,this.mapCursor[0]);
		LTFunction.setCursorStyle(this.container,this.mapCursor[0]);
		//����ͼ������һ����Χ֮�ڣ��������ͼ�϶�(����������ʽ�ƶ�)���÷�Χ֮��,���������4���������ͼ
		//this.setMapBounds(this.mapSizePoint());
		LTEvent.trigger(this,"mouseup",[point,LTFunction.getEventButton(e)]);
	}
	//��ֹ�϶�����
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
	{//�ж�ģʽ�Ƿ�ռ�ã�eventName��ģʽ����
		return this._occupy?true:false;
	}
	LTMaps.prototype.startOccupy = function(name)
	{//��ʼռ�õ�ͼ��eventNameģʽ
		if(!this._occupy)
		{
			this._occupy=name;
			return true;
		}
		else
		{
			alert("���Ƚ��� "+this._occupy+" ������");
		}
		return false;
	}
	LTMaps.prototype.endOccupy = function(name)
	{//����ռ�õ�ͼ��eventNameģʽ
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
	{//����ͼ����Ϊ�����϶�
		this.canDrag=true;
	}
	LTMaps.prototype.disableDrag = function()
	{//����ͼ����Ϊ��ֹ�϶�
		this.canDrag=false;
	}
	LTMaps.prototype.setSlideMaxZoom=function(z)
	{//����ͼ����Ϊ���������ŵȼ�
		this.slideMaxZoom=parseInt(z);
	}
	LTMaps.prototype.setMapCursor=function(normalCursor,dragCursor)
	{//���õ�ͼ�������ʽ
		var mapCursor=this.mapCursor;
		if(normalCursor){mapCursor[0]=normalCursor;}
		if(dragCursor){mapCursor[1]=dragCursor;}
		var cursor=this.dragObject?mapCursor[1]:mapCursor[0];
		LTFunction.setCursorStyle(this.container,cursor);
		LTFunction.setCursorStyle(this.mapsDiv,cursor);
	}
	LTMaps.prototype.onClick=function(e)
	{//��ͼ��ֹ�϶�״̬�±�����ʱִ�б�����������maps��click�¼�
		if(this.canDrag || !this.loaded)
		{
			return;
		}
		LTEvent.trigger(this,"click",[LTFunction.getEventPosition(e,this.container),1]);
	}
	LTMaps.prototype.getClickLatLng=function(e)
	{//����event�¼��������Ӧ�ľ�γ��
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
	{//���ص�ǰcontainer����ʾ�ĵ�ͼ�ľ�γ�ȷ�Χ������һ��LTSize
	//ע�⣺����API�򻯣�LTSize������Ϊר�ŵĶ��󿪷ţ�����������ض�������������Ӧ�����Ժͷ����Ա��ּ���
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
		//��ͼͼƬ��
		html+='<div id="LTMaps_Maps" style="position:relative;left:'+style.left+';top:'+style.top+'">';
		html+=this.mapsDiv.innerHTML;
		if(flag!=1)
		{//��ͼ��ǲ�
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
	//����ָ���ķ�Χ������ѵ����ŵȼ�
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
	//����ͼ��λ���ܰ���ָ����������ͼ
	LTMaps.prototype.getBestMap=function(points,padding)
	{
		if(points.length==0){return;}
		var bounds=LTBounds.getPointsBounds(points);
		this.centerAndZoom(bounds.getCenterPoint(),this.getZoomIndex(this.getBestZoom(bounds,padding)));
	}

/*
���������ֻ����ķ���
*/
	//����껬�����ŵȼ���֧�֣�flag=true�Ǵ��������ָ�����Ϊ����������
	LTMaps.prototype.handleMouseScroll=function(flag)
	{
		this.clearHandleMouseScroll();//����Ѿ��򿪣���ر�֧��
		//var event=document.all?"mousewheel":"DOMMouseScroll";//��Բ�ͬ�������ѡ��ͬ���¼�����
		//���´����ǽ���������¼�
		if(LTBrowserInfo.getBrowserType() == "Other"){
			var event = "mousewheel";
		}else{
			var event=document.all?"mousewheel":"DOMMouseScroll";
		}
		this.msl=LTEvent.bind(this.container,event,this,this.onMouseWheel);//�������ֱ�������ʱ��ִ�в���
		this.wheelByPoint=flag;//ָ�������ֻ��������ǹ̶�ģʽ���������ָ���Ϊ����
		//�����ͼ�����������λ�����ţ���ô��ȥ����ͼ���ؽ�����
		if(this.wheelByPoint){
			this.removeProgressControl();
		}else{
			this.addProgressControl();
		}
	}
	//�ر���껬����֧��
	LTMaps.prototype.clearHandleMouseScroll=function()
	{
		if(this.mst){this.onStopMouseWheel();}//������ڻ���������ֹͣ����
		if(this.msl){LTEvent.removeListener(this.msl);this.msl=null;}//ȡ�������¼���
	}
	//����껬���¼�����ʱִ��
	LTMaps.prototype.onMouseWheel=function(e)
	{
		LTEvent.cancelBubble(e);
		if(this.slideObject){this.slideEnd();}//�����������ͼ�Ļ���������ֹͣ����
		if(typeof this.mzi!="number")
		{
			this.mzi=this.zoomIndex;
			this.wheelPoint=LTFunction.getEventPosition(e,this.container);
			this.wheelLatlng=this.getPointLatLng(this.wheelPoint);
		}
		//IE��event.wheelDelta��Firefox��event.detail ���Եķ���ֵҲ��һ����IE��ǰ�� > 0Ϊ120���෴��-120��Firefox���� > 0Ϊ3���෴��-3��
		var wheelDelta=(typeof e.wheelDelta=="number")?e.wheelDelta:(-e.detail*40);//����*40��Ȼ��ȡ���ͺ�IE�������
		this.mzi-=wheelDelta/600*this.scrollSpeed;
		if(this.mzi>this.zoomLevels.length-1){this.mzi=this.zoomLevels.length-1}//����ܳ����涨�ı����߼����������ȡ���
		if(this.mzi<0){this.mzi=0}//��С����С��0������ȡ0
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
			//�ǹ��ֲ���
			//this.mouseWheel = false;
			//���������֣��Ŵ����С��굱ǰλ��
			var delta;
			this.newCenterPixel = [];
			if (this.mzi > this.zoomIndex && this.mzi!=13) {
				delta = 2;
				this.cursorArrows(this.wheelPoint,"zoomOut");
				//this.wheelPoint	���λ�õ�����
				//���ĵ�����
				this.centerPixel = this.getPixelCoord(this.getCenterPoint());
				var x = this.centerPixel[0] + (this.centerPixel[0] - this.wheelPoint[0]) * (delta - 1);
				this.newCenterPixel.push(x);
				var y = this.centerPixel[1] + (this.centerPixel[1] - this.wheelPoint[1]) * (delta - 1);
				this.newCenterPixel.push(y);
				
				if(this.cartoon){
					//��ͼ����Ч��,��Ϊ���������֣��Ŵ����С��굱ǰλ�÷����ڼ�����һ�����������ĵ�ʱ���õ���getPointLatLng������this.zoomUnits�ǵ�ǰ�����ֵ���������ĵ�Ӧ��mapCartoon����ִ�������㡣
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
				//���λ�ö���
				this.cursorArrows(this.wheelPoint,"zoomIn");
				//this.wheelPoint	���λ�õ�����
				//���ĵ�����
				this.centerPixel = this.getPixelCoord(this.getCenterPoint());
				var x = this.centerPixel[0] + (this.centerPixel[0] - this.wheelPoint[0]) * (delta - 1);
				this.newCenterPixel.push(x);
				var y = this.centerPixel[1] + (this.centerPixel[1] - this.wheelPoint[1]) * (delta - 1);
				this.newCenterPixel.push(y);
				if(this.cartoon){
					//��ͼ����Ч��,��Ϊ���������֣��Ŵ����С��굱ǰλ�÷����ڼ�����һ�����������ĵ�ʱ���õ���getPointLatLng������this.zoomUnits�ǵ�ǰ�����ֵ���������ĵ�Ӧ��mapCartoon����ִ�������㡣
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
	
	//���λ�ö���Ч��
	LTMaps.prototype.cursorArrows=function(xy,zoom){
		
		//��ֹ�û��������ֲ��������������ɲ�
		if (typeof this.move == "number") {
			clearInterval(this.move);
		}
		var arrowsDiv = document.getElementById("arrows");
		if(!arrowsDiv){
			return;
		}
		arrowsDiv.innerHTML = "";
		
		//���λ�ö�����������
		//��������ȷ�Χ
		var widthMax = 120;
		//�������߶ȷ�Χ
		var heightMax = 90;
		//������С��ȷ�Χ
		var widthMin = 20;
		//������С�߶ȷ�Χ
		var heightMin = 18;
		//�ĸ��ǵ�ͼƬ���
		var cornerWidth = 7;
		//�ĸ��ǵ�ͼƬ�߶�
		var cornerHeight = 7;
		//�����ٶ�
		var speed = 4;
		//�Ŵ�ʱ���ͼ���ڶ������ڣ����ĵ��ƫ����
		var correctZoomIn = [0,12];
		//��Сʱ���ͼ���ڶ������ڣ����ĵ��ƫ����
		var correctZoomOut = [3,0];
		//�����Ƿ���ִ��
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
			
			//����
			div_leftup.style.overflow = "hidden";
			div_leftup.style.width = cornerWidth + "px";
			div_leftup.style.height = cornerHeight + "px";
			div_leftup.style.left = "0px";
			div_leftup.style.top = "0px";
			//����
			div_leftdown.style.overflow = "hidden";
			div_leftdown.style.width = cornerWidth + "px";
			div_leftdown.style.height = cornerHeight + "px";
			div_leftdown.style.left = "0px";
			div_leftdown.style.top = (parseInt(this.cursorArrowsDiv.style.height) - cornerHeight) + "px";
			//����
			div_rightup.style.overflow = "hidden";
			div_rightup.style.width = cornerWidth + "px";
			div_rightup.style.height = cornerHeight + "px";
			div_rightup.style.left = (parseInt(this.cursorArrowsDiv.style.width) - cornerWidth) + "px";
			div_rightup.style.top = "0px";
			//����
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
					//����
					div_leftup.style.left = "0px";
					div_leftup.style.top = "0px";
					//����
					div_leftdown.style.left = "0px";
					div_leftdown.style.top = (parseInt(arrowsDiv.style.height) - 7) + "px";
					//����
					div_rightup.style.left = (parseInt(arrowsDiv.style.width) - 7) + "px";
					div_rightup.style.top = "0px";
					//����
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
			//����
			div_leftup.style.overflow = "hidden";
			div_leftup.style.width = cornerWidth + "px";
			div_leftup.style.height = cornerHeight + "px";
			div_leftup.style.left = (parseInt(this.cursorArrowsDiv.style.width) - cornerWidth) + "px";
			div_leftup.style.top = (parseInt(this.cursorArrowsDiv.style.height) - cornerHeight) + "px";
			//����
			div_leftdown.style.overflow = "hidden";
			div_leftdown.style.width = cornerWidth + "px";
			div_leftdown.style.height = cornerHeight + "px";
			div_leftdown.style.left = (parseInt(this.cursorArrowsDiv.style.width) - cornerWidth) + "px";
			div_leftdown.style.top = "0px";
			//����
			div_rightup.style.overflow = "hidden";
			div_rightup.style.width = cornerWidth + "px";
			div_rightup.style.height = cornerHeight + "px";
			div_rightup.style.left = "0px";
			div_rightup.style.top = (parseInt(this.cursorArrowsDiv.style.height) - cornerHeight) + "px";
			//����
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
					//����
					div_leftup.style.left = (parseInt(arrowsDiv.style.width) - 7) + "px";
					div_leftup.style.top = (parseInt(arrowsDiv.style.height) - 7) + "px";
					//����
					div_leftdown.style.left = (parseInt(arrowsDiv.style.width) - 7) + "px";
					div_leftdown.style.top = "0px";
					//����
					div_rightup.style.left = "0px";
					div_rightup.style.top = (parseInt(arrowsDiv.style.height) - 7) + "px";
					//����
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
���º����ǵ�ͼ���̲���֧�ֵķ���
*/


	//�򿪼��̲���֧�֣��κ�ʱ��ҳ���������һ����ͼ����ʹ�ü����¼�
	LTMaps.prototype.handleKeyboard=function()
	{
		this.clearHandleKeyboard();	//���ǰ���Ѿ��м��̲���֧��
		LTMaps.kdl=LTEvent.bind(document,"keydown",this,this.onKeyDown);//�ڼ����ϵļ������µ�ʱ��ִ�в���
		LTMaps.kul=LTEvent.bind(document,"keyup",this,this.onKeyUp);//�ڼ����ϵļ����ͷŵ�ʱ��ִ�в���
	//	LTMaps.mml=LTEvent.bind(this,"move",this,function(){if(document.all && document.activeElement!=this.container){try{this.container.setActive();}catch(e){}}});
	}
	//ȡ�����̲�����֧�֣��������ʵ������һ����̬�ģ�Ҳ����˵����ҳ�����ж����ͼʵ���������κ�һ����ͼ�ĸ÷�������ȡ�����̲���
	LTMaps.prototype.clearHandleKeyboard=function()
	{
		if(LTMaps.kdl){LTEvent.removeListener(LTMaps.kdl);LTMaps.kdl=null;}
		if(LTMaps.kul){LTEvent.removeListener(LTMaps.kul);LTMaps.kul=null;}
	//	if(LTMaps.mml){LTEvent.removeListener(LTMaps.mml);LTMaps.mml=null;}
		if(LTMaps.mmt){window.clearInterval(LTMaps.mmt);LTMaps.mmt=null;}
	}
	//�ڼ��̱����µ�ʱ��ִ�У��ڰ��µ�ʱ����Ҫ��ʼ��ͼ�Ļ�������
	LTMaps.prototype.onKeyDown=function(e)
	{
		if(!LTMaps.isMapKey(e)){return;}//�ж��Ƿ�Ӧ���ɵ�ͼ��������¼�
		if(!LTMaps.move){LTMaps.move=[0,0]}//LTMaps.move������¼��ͼ�Ļ�������
		var move=LTMaps.move;
		//�жϵ�ͼ�ϵİ�������İ���״̬������״̬�仯��ͼ�Ļ�������
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
			//��ʼ��������
			LTEvent.trigger(this,"movestart",[this.centerPoint]);
			LTMaps.mmt=window.setInterval(LTEvent.getCallback(this,this.continuousMove),32);
		}
	}
	//�����������ڵ�ͼ����������µ�ʱ�����ִ��
	LTMaps.prototype.continuousMove=function()
	{//����ͼ��ָ���ķ����ƶ�
		this.setCenterAtLatLng(this.getPointLatLng([this.viewSize[0]/2+LTMaps.move[0],this.viewSize[1]/2+LTMaps.move[1]]));
	}
	//�������ж�ָ�����¼��Ƿ�Ӧ���ɵ�ͼ������
	LTMaps.isMapKey=function(e)
	{
		if(e.ctrlKey||e.altKey||e.metaKey)//��������˿��Ƽ����򲻴���
		{
			return false;
		}
		if((e.target.nodeName=="INPUT" && e.target.type=="text") || e.target.nodeName=="TEXTAREA")//�����ǰ�Ľ�����������ϣ��򲻴���
		{
			return false;
		}
		return true;
	}
	//�ڼ����ϵļ����ͷŵ�ʱ��ִ��
	LTMaps.prototype.onKeyUp=function(e)
	{
		if(!LTMaps.isMapKey(e)){return;}
		switch(e.keyCode)
		{
			case 187://������ϵ�+
			case 107://С�����ϵ�+
			case 61:
				this.zoomIn();
				break;
			case 189://������ϵ�-
			case 109://С�����ϵ�-
				this.zoomOut();
				break;
			case 33://PageUp��
			case 87://W��
			case 104://С�����ϵ�8
				this.move([0,-this.viewSize[1]/2]);
				break;
			case 34://PageDown��
			case 83://S��
			case 98://С�����ϵ�2
				this.move([0,this.viewSize[1]/2]);
				break;
			case 35://Home��
			case 68://D��
			case 102://С�����ϵ�6
				this.move([this.viewSize[0]/2,0]);
				break;
			case 36://End��
			case 65://A��
			case 100://С�����ϵ�4
				this.move([-this.viewSize[0]/2,0]);
				break;
			case 37://��
			case 39://��
				if(LTMaps.move){LTMaps.move[0]=0;}
				break;
			case 38://��
			case 40://��
				if(LTMaps.move){LTMaps.move[1]=0;}
				break;
			case 101://С�����ϵ�5
				this.returnLastView();
				break;
		}
		//������з�������Ѿ��ͷţ���ֹͣ������ʱִ��
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
	
	//ȥ����ͼ���½ǰ�Ȩ�ĵ���¼�
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
	
	//���������ͼ�϶���Χ
	LTMaps.prototype.mapSizePoint=function()
	{
		var minXY = [0,this.viewSize[1]];
		var maxXY = [this.viewSize[0],0];
		var min_point = this.getPointLatLng(minXY);
		var max_point = this.getPointLatLng(maxXY);
		return new LTBounds(min_point.getLongitude(),min_point.getLatitude(),max_point.getLongitude(),max_point.getLatitude());
	}
	
	//�˷����еľ�γ�Ȳ���ת����ī���У���Ϊ���ĵ�����������ķ�Χ���궼��NTU����
	LTMaps.prototype.setMapBounds=function(minBounds,maxBounds)
	{
		var worldMaxBounds = new LTBounds(-18003716,-8665533,17996281,8505394);
		//var worldMaxBounds = new LTBounds(-17995748,-8506363,17995457,8270254);
		maxBounds=maxBounds?maxBounds:worldMaxBounds;
		
		var centerPoint = new LTPoint(this.centerPoint.getLongitude(),this.centerPoint.getLatitude());
		
		//�ϱ߳����߽�
		if((centerPoint.getLatitude()-minBounds.getYmax())<(centerPoint.getLatitude()-maxBounds.getYmax())){
			//alert("�ϱ߳����߽�");
			centerPoint.setLatitude(centerPoint.getLatitude()-(minBounds.getYmax()-maxBounds.getYmax()));
			//centerPoint.setLatitude(centerPoint.getLatitude()-(minBounds.getYmax()-maxBounds.getYmax())-4096*256);
		}
		//�ұ߳����߽�
		if((centerPoint.getLongitude()-minBounds.getXmax())<(centerPoint.getLongitude()-maxBounds.getXmax())){
			//alert("�ұ߳����߽�");
			centerPoint.setLongitude(centerPoint.getLongitude()-(minBounds.getXmax()-maxBounds.getXmax()));
		}
		//��߳����߽�
		if((centerPoint.getLongitude()-minBounds.getXmin())>(centerPoint.getLongitude()-maxBounds.getXmin())){
			//alert("��߳����߽�");
			centerPoint.setLongitude(centerPoint.getLongitude()-(minBounds.getXmin()-maxBounds.getXmin()));
		}
		//�±߳����߽�
		if((centerPoint.getLatitude()-minBounds.getYmin())>(centerPoint.getLatitude()-maxBounds.getYmin())){
			//alert("�±߳����߽�");
			centerPoint.setLatitude(centerPoint.getLatitude()-(minBounds.getYmin()-maxBounds.getYmin()));
			//centerPoint.setLatitude(centerPoint.getLatitude()-(minBounds.getYmin()-maxBounds.getYmin())-4096*256);
		}

		this.setCenterAtLatLng(centerPoint);
		//alert(this.centerPoint.getLongitude()+"||"+this.centerPoint.getLatitude());
	}
	
	window.LTMaps=LTMaps;
}
LTMapNS();