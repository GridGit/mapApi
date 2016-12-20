function LTMapNS()
{
	function LTFunction()
	{
	}
	LTFunction.inherit=function(obj,cla)
	{
		var item;
		for(item in cla){obj[item]=cla[item];}
	}
	LTFunction.deleteFromArray=function(array,item)
	{
		for(var i=array.length-1;i>=0;i--)
		{
			if(array[i]==item)
			{
				array.splice(i,1);
			}
		}
	}
	LTFunction.getPageOffset=function(obj)
	{
		var point=[0,0];
		var a=obj;
		while(a && a.offsetParent)
		{
			point[0]+=a.offsetLeft;
			point[1]+=a.offsetTop;
			a=a.offsetParent
		}
		return point;
	}
	LTFunction.isInDocument=function(obj)
	{
		return obj.parentNode && obj.parentNode.nodeType!=11;
	}
	LTFunction.createDiv=function(position,point,zIndex)
	{
		var div=document.createElement("div");
		if(position>0){div.style.position=(position==2)?"relative":"absolute";}
		if(point){LTFunction.setPosition(div,point);}
		if(zIndex){LTFunction.setZIndex(div,zIndex);}
		return div;
	}
	LTFunction.setPosition=function(div,position)
	{
		div.style.left=LTFunction.getUserInput(position[0]);
		div.style.top=LTFunction.getUserInput(position[1]);
	}
	LTFunction.setSize=function(div,size)
	{
		div.style.width=LTFunction.getUserInput(size[0]);
		div.style.height=LTFunction.getUserInput(size[1]);
	}
	LTFunction.setZIndex=function(div,zIndex)
	{
		div.style.zIndex=zIndex;
	}
	LTFunction.getEventPosition=function(e,container)
	{
		if(typeof e.offsetX!="undefined")
		{
			var src=e.target||e.srcElement;
			var offset=[e.offsetX,e.offsetY];
			while(src&&src!=container)
			{
				var zoom=src.style.zoom;
				if(zoom)
				{
					offset[0]*=zoom;
					offset[1]*=zoom;
				}
				if(!(src.clientWidth==0 && src.clientHeight==0 && src.offsetParent && src.offsetParent.nodeName=="TD"))
				{
					offset[0]+=src.offsetLeft;
					offset[1]+=src.offsetTop;
				}
				src=src.offsetParent;
			}
			return offset;
		}
		else if(typeof e.pageX!="undefined")
		{
			var offset=LTFunction.getPageOffset(container);
			return [e.pageX-offset[0],e.pageY-offset[1]];
		}
		else
			return [0,0];
	}
	LTFunction.getUserInput = function( values ){//用于处理用户输入数字、像素或百分比
		if( typeof values == "number" )
		{
			return values+"px";
		}
		else if(typeof values == "string" )
		{
			//var patrn0 = /\s/g;//去空格
			//var patrn1 = /^\d+(px|%)+$/i;//后面是%或是px
			//var patrn2 = /^\d+$/;//一个数字字符串
			var patrn0 = new RegExp("\\s","g");//去空格
			var patrn1 = new RegExp("^\\d+(px|%)+$","i");//后面是%或是px
			var v = values.replace( patrn0 , "" );//去除所有的空格
			if( patrn1.exec( v ) ){	return v;}
			var patrn2 = new RegExp("^\\d+$");//一个数字字符串
			if( patrn2.exec( v ) ){	return v+"px";}
			return "0px";
		}
	}
	LTFunction.setCursorStyle=function(obj,style)
	{
		if(style.indexOf(",")>0)
		{
			var styles=style.split(",");
			for(var i=0;i<styles.length;i++)
			{
				if(LTFunction.setCursorStyle(obj,styles[i])){return true;}
			}
			return false;
		}
		try
		{
			if(style.toLowerCase().indexOf(".cur")>0)
			{
				style="url("+style+"),auto";
			}
			style=style.toLowerCase();
			if(style=="hand" && !document.all)
			{
				style="pointer";
			}
			obj.style.cursor = style;
			return true;
		}
		catch(e){return false;}
	}
	//090831 add by zhoutao
	LTFunction.setFloatStyle=function(obj,style)
	{
		var sty=obj.style;
		if('cssFloat' in sty){
			obj.style.cssFloat=style;
		}else if('styleFloat' in sty){
			obj.style.styleFloat=style;
		}else{
			throw 'set float style:'+style+'error.';
		}
	}
	//090911 add by zhoutao 
	LTFunction.getRealStyle=function(el,styName)
	{
		var len=arguments.length;
		var sty=null;
		if('currentStyle' in el){
			sty=el.currentStyle;
		}else if('getComputedStyle' in window){
			sty=window.getComputedStyle(el,null);
		}
		if(len==1){
			return sty;	
		}else if(len==2){
			return sty[styName];
		}
	}
	LTFunction.getRemainder = function(num1,num2){
		var num=num1%num2;
		if(num<0){num+=num2;}
		return num;
    }
    LTFunction.falseFunction=function()
    {
    	return false;
    }
    LTFunction.setUnSelectable=function(obj)
	{
		if(LTBrowserInfo.isIE())
		{
			obj.unselectable="on";
			LTEvent.addListener(obj,"selectstart",LTFunction.falseFunction);
		}
		else
		{
			obj.style.MozUserSelect="text";
		}
	}
    LTFunction.setOpacity=function(obj,opacity)
	{
		obj.style.filter="progid:DXImageTransform.Microsoft.Alpha(opacity="+parseInt(opacity*100)+")";
		obj.style.MozOpacity =opacity;
		obj.style.opacity=opacity;
	}
	LTFunction.getEventButton=function(e)
	{
		return LTBrowserInfo.isIE()?e.button:(e.button==2?2:1);
	}
	LTFunction.getPointsDistance=function(a,b)
	{
		var R = 6371.004;//地球的平均半径6371.004千米,赤道半径6378.140千米,极地6356.755千米
		var B = (b.getLongitude()-a.getLongitude())*Math.PI/100000/180;
		var c =Math.PI/2-a.getLatitude()*Math.PI/100000/180;
		var a =Math.PI/2-b.getLatitude()*Math.PI/100000/180;
		var b =Math.cos(a)*Math.cos(c)+Math.sin(a)*Math.sin(c)*Math.cos(B);
		var L = R*Math.acos(b)*1000;
		return Math.round(L);//返回以米做单位的距离
	}
	LTFunction.loadVmlNamespace=function(namespace)
	{
		if(document.createElement("v:shape").tagUrn){
			return;
		}
		if(!document.namespaces.v){document.namespaces.add("v","schemas-microsoft-com:vml");}
		var style=document.createElement('style');
		style.type="text/css";
		document.body.insertBefore(style,document.body.firstChild);
		var styleSheets=document.styleSheets;
		for(var i=0;i<styleSheets.length;i++)
		{
			if(styleSheets[i].owningElement==style){
//				styleSheets[i].addRule('v\\:*','Behavior:url(#default#VML)');
				//以下修改是为是兼容IE8
				if(namespace){
					for (var s=0;s<namespace.length;s++) {
						styleSheets[i].addRule('v\\:'+namespace[s],'Behavior:url(#default#VML)');
					}
				}
			};
		}
	}
	LTFunction.getSize=function(container)
	{
		var viewSize=[container.offsetWidth,container.offsetHeight];
		if(container==document.body && !document.all){viewSize[1]=container.clientHeight;}
		if(!viewSize[0])
		{
			viewSize[0]=container.clientWidth;
		}
		if(!viewSize[0])
		{
			viewSize[0]=parseInt(container.style.width);
		}
		if(!viewSize[1])
		{
			viewSize[1]=container.clientHeight;
		}
		if(!viewSize[1])
		{
			viewSize[1]=parseInt(container.style.height);
		}
		if(!viewSize[0] || !viewSize[1])
		{
			var obj=container.parentElement;
			while(obj)
			{
				if(!viewSize[0] && obj.offsetWidth)
				{
					viewSize[0]=obj.offsetWidth;
				}
				if(!viewSize[1] && obj.offsetHeight)
				{
					viewSize[1]=obj.offsetHeight;
				}
				if(viewSize[0] && viewSize[1])
				{
					break;
				}
				obj=obj.parentElement;
			}
		}
		return viewSize;
	}
	window.LTFunction=LTFunction;
}
LTMapNS();