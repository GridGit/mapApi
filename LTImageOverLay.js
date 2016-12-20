/*
本对象用来向地图上显示一张地图图片，这张图片和原有的地图API叠加在一起
*/
function LTNS()
{
	function LTImageOverLay(imgUrl,bounds,opacity,offset,isPng)
	{
		this.zIndexs=[470,490];
		this.bounds=bounds;
		this.isPng=isPng && document.all;
		this.opacity=opacity||0.5;
		this.offset=offset?offset:[0,0];
		var div=this.isPng?document.createElement("div"):document.createElement("img");
		if(this.isPng)
		{
			div.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=image)";
		}
		this.div=div;
		if(imgUrl){this.setImgUrl(imgUrl);}
		div.galleryImg=false;
		LTFunction.setUnSelectable(div);
		div.style.border="0px";
		div.style.position="absolute";
		this.listeners=[
			LTEvent.addListener(div,"contextmenu",LTEvent.returnTrue),
			LTEvent.bind(div,"mouseover",this,this.onMouseOver),
			LTEvent.bind(div,"mouseout",this,this.onMouseOut),
			LTEvent.bind(div,"mousedown",this,this.onMouseDown)
		];
		this.div.style.zIndex=this.zIndexs[0];
	}
	//将该图标突出显示和恢复的方法
	LTImageOverLay.prototype.setImgUrl=function(imgUrl)
	{
		if(this.isPng)
		{
			this.div.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src=imgUrl;
		}
		else
		{
			this.div.src=imgUrl;
		}
	}
	LTImageOverLay.prototype.getBounds=function()
	{
		return this.bounds;
	}
	LTImageOverLay.prototype.setBounds=function(imgUrl)
	{
		this.bounds=bounds;
		this.reDraw(true);
	}
	//将该图标突出显示和恢复的方法
	LTImageOverLay.prototype.focus=function()
	{
		if(LTImageOverLay.focus && LTImageOverLay.focus.map){LTImageOverLay.focus.blur();}
		LTFunction.setZIndex(this.div,this.zIndexs[1]);
		LTImageOverLay.focus=this;
		LTEvent.trigger(this,"focus",[]);
	}
	LTImageOverLay.prototype.blur=function()
	{
		LTFunction.setZIndex(this.div,this.zIndexs[0]);
		if(LTImageOverLay.focus==this){LTImageOverLay.focus=null;}
		LTEvent.trigger(this,"blur",[]);
	}
	LTImageOverLay.prototype.onMouseOver = function(e)
	{
		this.focus();
		LTEvent.trigger(this,"mouseover",[LTFunction.getEventPosition(e,this.map.container)]);
	}
	LTImageOverLay.prototype.onMouseOut = function(e)
	{
		this.focus();
		LTEvent.trigger(this,"mouseout",[LTFunction.getEventPosition(e,this.map.container)]);
	}
	LTImageOverLay.prototype.onClick=function(e)
	{
		LTEvent.cancelBubble(e);
		var point=(e && this.map)?LTFunction.getEventPosition(e,this.map.container):this.bounds.getCenterPoint();
		LTEvent.trigger(this,"click",[point,LTFunction.getEventButton(e)]);
	}
	LTImageOverLay.prototype.onMouseDown=function(e)
	{
		var point=LTFunction.getEventPosition(e,this.map.container);
		var dragObj={"startTime":(new Date()).getTime(),"startDivPoint":[e.clientX,e.clientY],"mul":LTEvent.bind(document,"mouseup",this,this.onMouseUp)}
		this.dragObj=dragObj;
		LTEvent.trigger(this,"mousedown",[point,LTFunction.getEventButton(e)]);
	}
	LTImageOverLay.prototype.onMouseUp=function(e)
	{
		LTEvent.cancelBubble(e);
		var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"mouseup",[point,LTFunction.getEventButton(e)]);
		if(!this.dragObj){return;}
		LTEvent.removeListener(this.dragObj.mul);
		if((new Date()).getTime()-this.dragObj.startTime<=500&&(Math.abs(this.dragObj.startDivPoint[0]-e.clientX)<=2&&Math.abs(this.dragObj.startDivPoint[1]-e.clientY)<=2))
		{
			LTEvent.trigger(this.map,"click",[point,LTFunction.getEventButton(e),this])
			LTEvent.trigger(this,"click",[point,LTFunction.getEventButton(e)]);
		}
	}
	LTImageOverLay.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		if(!map._MarkerInfoWin)	//初始化信息浮窗大小
		{
			map._MarkerInfoWin = new LTInfoWindow();
		}
	}
	LTImageOverLay.prototype.reDraw=function(flag)
	{
		if(!this.map || !flag){return;}
		var bounds=this.bounds;
		if(!bounds){return;}
		var min=this.map.getOverLayPosition(new LTPoint(bounds.Xmin,bounds.Ymin));
		var max=this.map.getOverLayPosition(new LTPoint(bounds.Xmax,bounds.Ymax));
		LTFunction.setPosition(this.div,[min[0]+this.offset[0],max[1]+this.offset[1]]);
		LTFunction.setSize(this.div,[max[0]-min[0],min[1]-max[1]]);
	}
	LTImageOverLay.prototype.setOpacity=function(opacity)
	{
		this.opacity=opacity;
		if(this.isPng)
		{
			this.div.filters.item("DXImageTransform.Microsoft.Alpha").opacity=opacity*100;
			this.div.filters.item("DXImageTransform.Microsoft.Alpha").enabled=true;
		}
		else
		{
			LTFunction.setOpacity(this.div,opacity);
		}
	}
	LTImageOverLay.prototype.getOpacity=function(opacity)
	{
		return this.opacity;
	}
	LTImageOverLay.prototype.remove=function()
	{
		this.map=null;
	}
	LTImageOverLay.prototype.depose = function()
	{
		var listener;
		while(listener=this.listeners.pop())
		{
			LTEvent.removeListener(listener);
		}
		LTEvent.deposeNode(this.div);
		this.div=null;
	}
	LTImageOverLay.prototype.getObject = function(){return this.div;}
	LTImageOverLay.prototype.openInfoWinBase= function(point,content)
	{
		this.map._MarkerInfoWin.setLabel(content);
		this.map._MarkerInfoWin.setPoint(point);
		this.focus();
		if(!this.iwcl){this.iwcl=LTEvent.bind(this.map._MarkerInfoWin,"close",this,this.onInfoWinClose);}
		if(!this.imml){this.imml=LTEvent.bind(this.map,"zoom",this.map._MarkerInfoWin,this.map._MarkerInfoWin.closeInfoWindow);}
		this.map.addOverLay( this.map._MarkerInfoWin );
		return this.map._MarkerInfoWin;
	}
	LTImageOverLay.prototype.onInfoWinClose= function()
	{
		this.blur();
		LTEvent.removeListener(this.iwcl);
		LTEvent.removeListener(this.imml);
		this.iwcl=null;
	}
	LTImageOverLay.prototype.openInfoWinElement = function(point, obj ){return this.openInfoWinBase(point,obj);}
	LTImageOverLay.prototype.openInfoWinUrl = function(point, url ){return this.openInfoWinBase(point,"<iframe src='"+url+"' width='100%' height='100%'>");}
	LTImageOverLay.prototype.openInfoWinHtml = function(point, html ){return this.openInfoWinBase(point,html);}
	window.LTImageOverLay=LTImageOverLay;
}
LTNS();