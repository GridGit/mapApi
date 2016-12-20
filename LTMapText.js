//本文件是JS API之中的LTBounds对象，用来代表一个矩形的坐标范围
//并提供一些相关的方法，比如矩形之间的交叉判断，点和矩形的位置判断，线和矩形的交点求取等
//其中X代表经度，Y代表纬度
function LTNS()
{
	function LTMapText(obj,offset,anchorPer)
	{
		this.zIndexs=[480,500];
		var div=LTFunction.createDiv(1,null,this.zIndexs[0]);
		var style=div.style;
		style.border="solid 1px #ADAEAC";
		style.fontSize = "12px";
		style.backgroundColor = "#FFFFD7";
		style.color = "#993300";
		div.innerHTML = "<a href='http://www.51ditu.com' target='_blank'>http://www.51ditu.com</a>";
		this.div=div;
		LTEvent.bind(div,"mouseover",this,this.onMouseOver);
		LTEvent.bind(div,"mouseout",this,this.onMouseOut);
		LTEvent.bind(div,"mousedown",this,this.onMouseDown);
		LTEvent.bind(div,"resize",this,this.onViewChange);
		this.offset=offset?offset:[0,0];
		this.anchorPer=anchorPer?anchorPer:[0,0.5];
		if(obj){this.setPoint(obj);}
		this.setNoWrap(true);
	}
	LTMapText.prototype.onClick=function(e)
	{
		LTEvent.cancelBubble(e);
		var point=(e && this.map)?LTFunction.getEventPosition(e,this.map.container):this.getPoint();
		LTEvent.trigger(this,"click",[point,e?LTFunction.getEventButton(e):1]);
	}
	LTMapText.prototype.onMouseDown=function(e)
	{
		LTEvent.cancelBubble(e);
		var point=LTFunction.getEventPosition(e,this.map.container);
		var dragObj={"startTime":(new Date()).getTime(),"startDivPoint":[e.clientX,e.clientY],"mul":LTEvent.bind(document,"mouseup",this,this.onMouseUp)}
		this.dragObj=dragObj;
		LTEvent.trigger(this,"mousedown",[point,LTFunction.getEventButton(e)]);
		if(this.canDrag)
		{
			dragObj.sp=point;
			dragObj.startPoint=this.getPoint();
			dragObj.nCursor=this.div.style.cursor;
			dragObj.dl=LTEvent.bind(document,"mousemove",this,this.onDrag);
			LTFunction.setCursorStyle(this.div,"move");
			LTEvent.trigger(this,"dragstart",[this.getPoint()]);
		}
	}
	LTMapText.prototype.onMouseUp=function(e)
	{
		LTEvent.cancelBubble(e);
		if(!this.map){return;}
		var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"mouseup",[point,LTFunction.getEventButton(e)]);
		if(!this.dragObj){return;}
		LTEvent.removeListener(this.dragObj.mul);
		if((new Date()).getTime()-this.dragObj.startTime<=500&&(Math.abs(this.dragObj.startDivPoint[0]-e.clientX)<=2&&Math.abs(this.dragObj.startDivPoint[1]-e.clientY)<=2))
		{
			LTEvent.trigger(this.map,"click",[point,LTFunction.getEventButton(e),this])
			LTEvent.trigger(this,"click",[point,LTFunction.getEventButton(e)]);
		}
		this.dragEnd();
	}
	LTMapText.prototype.onDrag= function(e)
	{
		LTEvent.cancelBubble(e);
		var dragObj=this.dragObj;
		var point=LTFunction.getEventPosition(e,this.map.container);
		var offset=[point[0]-dragObj.sp[0],point[1]-dragObj.sp[1]];
		var units=this.map.zoomUnits;
		
		//改为墨卡托投影方式修改
		//add by zyg 
		//之前的方式：var latlng=new LTPoint(dragObj.startPoint.getLongitude()+offset[0]*units,dragObj.startPoint.getLatitude()-offset[1]*units);
		var point_M = new LTPointMercator(dragObj.startPoint.getLongitude(),dragObj.startPoint.getLatitude());
		var latlng=new LTPoint((point_M.getLongitude()+(offset[0]*units)),(point_M.getLatitude()-(offset[1]*units)));
		var point_N = new LTPointWGS84(latlng.getLongitude(),latlng.getLatitude());
		latlng=point_N;
		
		if(this.map.getBoundsLatLng().containsPoint(latlng))
		this.setPoint(latlng);
		LTEvent.trigger(this,"drag",[latlng]);
	}
	LTMapText.prototype.dragEnd= function()
	{
		//alert("dragend");
		var dragObj=this.dragObj;
		if(!dragObj){return;}
		LTEvent.removeListener(dragObj.dl);
		if(dragObj.nCursor){this.div.style.cursor=dragObj.nCursor;}
		this.dragObj=null;
		LTEvent.trigger(this,"dragend",[this.getPoint()]);
	}
	//将该图标突出显示和恢复的方法
	LTMapText.prototype.focus=function()
	{
		if(LTMapText.focus && LTMapText.focus.map){LTMapText.focus.blur();}
		LTFunction.setZIndex(this.div,this.zIndexs[1]);
		LTMapText.focus=this;
		LTEvent.trigger(this,"focus",[]);
	}
	LTMapText.prototype.blur=function()
	{
		LTFunction.setZIndex(this.div,this.zIndexs[0]);
		if(LTMapText.focus==this){LTMapText.focus=null;}
		LTEvent.trigger(this,"blur",[]);
	}
	LTMapText.prototype.onMouseOver = function(e)
	{
		if(LTMapText.focus==this){return;}
		var position=LTFunction.getEventPosition(e,this.map.container);
		this.focus();
		LTEvent.trigger(this,"mouseover",[position]);
	}
	LTMapText.prototype.onMouseOut = function(e)
	{
		LTEvent.trigger(this,"mouseout",[LTFunction.getEventPosition(e,this.map.container)]);
	}
	LTMapText.prototype.onViewChange=function(f)
	{
		setTimeout(LTEvent.getCallback(this,function(){this.reDraw(true)}),100);
	}
	LTMapText.prototype.initialize = function(map)
	{
		if(!this.div || this.map){return false;}
		this.map = map
		if(!map._MarkerInfoWin)	//初始化信息浮窗大小
		{
			map._MarkerInfoWin = new LTInfoWindow();
			if(LTMapText.infoWinWidth){this.setInfoWinWidth(LTMapText.infoWinWidth );}
			if(LTMapText.infoWinHeight){this.setInfoWinHeight(LTMapText.infoWinHeight);}
		}
	}
	LTMapText.prototype.getObject = function(){	return this.div;}
	LTMapText.prototype.reDraw = function( booleans )
	{
		if(!this.map || !booleans || !this.point){return;}//如果父层不发生重大变化
		var size=[this.div.offsetWidth,this.div.offsetHeight];
		if(this.anchorObj)
		{//如果this.point是一个LTMapText对象
			var objSize=this.anchorObj.getSize();
			var objAnchor=this.anchorObj.getAnchor();
			this.offset=[objSize[0]-objAnchor[0],objSize[1]/2-objAnchor[1]];
		}
		var anchor=this.getAnchor();
		var position = this.map.getOverLayPosition( this.point );//
		
		if( position[2])
		{//点在可视范围内
			if(!LTFunction.isInDocument(this.div))
			{//如果不存在
				this.map.overlaysDiv.appendChild( this.div );
			}
			LTFunction.setPosition(this.div,[position[0]-anchor[0],position[1]-anchor[1]]);
		}
		else
		{//点不在可视范围内
			if(LTFunction.isInDocument(this.div))
			{//如果标点已经存在
				this.div.parentNode.removeChild( this.div );
			}
		}
		LTEvent.trigger(this,"viewchange",[]);
	}
	//关于标注拖动的相关函数
	LTMapText.prototype.enableDrag= function()
	{
		this.canDrag=true;
	}
	LTMapText.prototype.disableDrag= function()
	{
		this.dragEnd();
		this.canDrag=false;
	}
	LTMapText.prototype.getPoint = function()
	{
		var point=this.point;
		return point.icon?point.getPoint():point;
	}
	LTMapText.prototype.setPoint = function( obj )
	{
		LTEvent.removeListener(this.mvl);
		if(obj.getObject)
		{
			this.mvl=LTEvent.bind(obj,"viewchange",this,this.onViewChange);
			this.point=obj.point;
			this.anchorObj=obj;
		}
		else
		{
			this.point=obj;
		}
		this.reDraw(true);
	}
	LTMapText.prototype.getSize = function()
	{
		return this.size?this.size:[this.div.offsetWidth,this.div.offsetHeight];
	}
	LTMapText.prototype.getAnchor = function()
	{
		var size=this.getSize();
		return this.anchor?this.anchor:[size[0]*this.anchorPer[0]-this.offset[0],size[1]*this.anchorPer[1]-this.offset[1]];
	}
	LTMapText.prototype.setLabel = function( html )
	{
		if(html && LTEvent.isHtmlControl(html))
		{
			this.div.innerHTML ="";
			if(html.parentNode){html.parentNode.removeChild(html);}
			this.div.appendChild(html);
		}
		else
		{
			this.div.innerHTML = html;
		}
	}
	//设置的代码
	LTMapText.prototype.setVisible = function( booleans )
	{
		this.div.style.display=booleans?"":"none";
	}
	LTMapText.prototype.getVisible = function()
	{
		return this.div.style.display!="none";
	}
	LTMapText.prototype.setBackgroundColor = function( color )
	{
		this.div.style.backgroundColor= color;
	}
	LTMapText.prototype.setBorderLine = function(line)
	{
		this.div.style.borderWidth=LTFunction.getUserInput(line);
	}
	LTMapText.prototype.setBorderColor = function( color )
	{
		this.div.style.borderColor=color;
	}
	LTMapText.prototype.setFontSize = function( size )
	{
		this.div.style.fontSize =LTFunction.getUserInput( size );
	}
	LTMapText.prototype.setFontColor = function( color )
	{
		this.div.style.color =color;
	}
	LTMapText.prototype.setOpacity = function( num )
	{
		LTFunction.setOpacity(this.div,num);
	}
	LTMapText.prototype.setNoWrap = function( booleans )
	{
		this.div.noWrap = booleans;
	}
	//信息浮窗的相应代码
	LTMapText.prototype.openInfoWinBase= function(content)
	{
		if(!this.map||!this.map._MarkerInfoWin){return}
		this.map._MarkerInfoWin.setLabel(content);
		this.map._MarkerInfoWin.setPoint( this );
		this.focus();
		if(!this.iwcl){this.iwcl=LTEvent.bind(this.map._MarkerInfoWin,"close",this,this.onInfoWinClose);}
		this.map.addOverLay( this.map._MarkerInfoWin );
		return this.map._MarkerInfoWin;
	}
	LTMapText.prototype.onInfoWinClose= function()
	{
		this.blur();
		LTEvent.removeListener(this.iwcl);
		this.iwcl=null;
	}
	LTMapText.prototype.closeInfoWin= function()
	{
		if(this.iwcl){
			this.map._MarkerInfoWin.closeInfoWindow();
		}
	}
	LTMapText.prototype.openInfoWinElement = function( obj ){return this.openInfoWinBase(obj);}
	LTMapText.prototype.openInfoWinUrl = function( url ){return this.openInfoWinBase("<iframe src='"+url+"' width='100%' height='100%' frameBorder='0' scrolling='no'>");}
	LTMapText.prototype.openInfoWinHtml = function( html ){return this.openInfoWinBase(html);}
	LTMapText.prototype.getPoint = function(){return this.point;}
	LTMapText.prototype.setInfoWinWidth = function( w )
	{
		if(this.map)
		{
			this.map._MarkerInfoWin.setWidth( w );
		}
		else
		{
			LTMapText.setInfoWinWidth(w);
		}
	}
	LTMapText.prototype.setInfoWinHeight = function( h )
	{
		if(this.map)
		{
			this.map._MarkerInfoWin.setHeight( h );
		}
		else
		{
			LTMapText.setInfoWinHeight(h);
		}
	}
	//清空的相关代码
	LTMapText.prototype.remove = function()
	{
		LTEvent.removeListener(this.mvl);
		this.mvl=null;
		LTEvent.removeListener(this.iwcl);
		this.iwcl=null;
		this.map=null;
	}
	LTMapText.prototype.depose = function()
	{
		LTEvent.deposeNode(this.div);
		this.div=null;
	}
	//标注功能改为由MapText来实现,这样可以压缩代码,并避免重复开发
	function LTMarker( point , icon )
	{
		var icon =icon?(icon.beUsed?icon.copy():icon): new LTIcon();
		var div=LTFunction.createDiv(2);
		var iconObj=icon.getObject();
		LTFunction.setCursorStyle(div,"hand");
		LTFunction.setZIndex(div,500);
		//LTEvent.addListener(div,"dblclick",LTEvent.cancelBubble);
		var size=icon.getSize();
		var mapText=new LTMapText(point);
		if(size[0]+size[1]==0)
		{
			mapText.anchorPer=[0.5,1];
		}
		else
		{
			mapText.anchorPer=[0,0];
			var anchor=icon.getAnchor();
			mapText.offset=[-anchor[0],-anchor[1]];
		}
		mapText.zIndexs=[490,510];
		mapText.icon=icon;
		mapText.iconObj=div;
		mapText.setBackgroundColor("");
		mapText.setBorderLine(0);
		mapText.setIconImage=this.setIconImage;
		mapText.getIcon=this.getIcon;
		mapText.setIcon=this.setIcon;
		mapText.getSize=function(){return this.icon.getSize();};
		mapText.getAnchor=function(){return this.icon.getAnchor();};
		LTFunction.setZIndex(mapText.getObject(),mapText.zIndexs[0]);
		LTEvent.bind(iconObj,"load",mapText,mapText.onViewChange);
		mapText.setLabel(div);
		div.appendChild(iconObj);
		return mapText;
	}
	LTMarker.setInfoWinWidth = function( w )
	{
		if(LTMapText.map )
		{
			LTMapText.map._MarkerInfoWin.setWidth( w );
		}
		else
		{
			LTMapText.infoWinWidth = w;
		}
		
	}
	LTMarker.setInfoWinHeight = function( h )
	{
		if( LTMapText.map )
		{
			LTMapText.map._MarkerInfoWin.setHeight( h );
		}
		else
		{
			LTMapText.infoWinHeight = h;
		}
	}
	LTMarker.prototype.getIcon = function(){return this.icon;}
	LTMarker.prototype.setIcon=function(icon)
	{
		this.icon=icon.beUsed?icon.copy():icon;
		this.div.removeChild(this.div.firstChild);
		this.div.appendChild(this.icon.getObject());
		this.anchorPer=[0,0];
		var anchor=icon.getAnchor();
		this.offset=[-anchor[0],-anchor[1]];
		this.reDraw(true);
	}
	LTMarker.prototype.setIconImage = function( url ){this.icon.setImageUrl(url);}
	window.LTMapText = LTMapText;
	window.LTMarker = LTMarker;
}
LTNS();