function LTNS()
{
	//折线绘制平台,用来高性能的绘制折线
	function LTPolyLineFlat()
	{
		this.namespaceArr = ["group","stroke","fill","polyline"];
		LTFunction.loadVmlNamespace(this.namespaceArr);
		this.group=document.createElement("v:group");
		this.group.style.position="absolute";
		this.group.unselectable="on";
		LTFunction.setZIndex(this.group,410);
		this.lines=[];
		this.minZooms={};
		this.maxZooms={};
	}
	//重新设置折线的显示状态
	LTPolyLineFlat.prototype.redrawLine=function(item)
	{
		if(!this.map){return;}
		var added=true;
		var zoom=this.map.getCurrentZoom();
		if((typeof(item.flatConfig.minZoom)=="number" && item.flatConfig.minZoom>zoom) || (typeof(item.flatConfig.maxZoom)=="number" && item.flatConfig.maxZoom<zoom))
		{
			added=false;
		}
		if(item.flatAdded!=added)
		{
			if(added)
			{
				item.line.style.display="";
			}
			else
			{
				item.line.style.display="none";
			}
			item.flatAdded=added;
		}
	}
	//重新绘制所有的折线
	LTPolyLineFlat.prototype.redrawLines=function(lines)
	{
		if(!lines){return;}
		var length=lines.length;
		for(var i=0;i<length;i++)
		{
			this.redrawLine(lines[i]);
		}
	}
	//添加一条折线
	LTPolyLineFlat.prototype.addLine=function(item,config)
	{
		config=config?config:{};
		if(typeof(config.minZoom)=="number")
		{
			if(!this.minZooms[config.minZoom]){this.minZooms[config.minZoom]=[];}
			this.minZooms[config.minZoom].push(item);
		}
		if(typeof(config.maxZoom)=="number")
		{
			if(!this.maxZooms[config.maxZoom]){this.maxZooms[config.maxZoom]=[];}
			this.maxZooms[config.maxZoom].push(item);
		}
		this.group.appendChild(item.line);
		item.flatConfig=config;
		this.redrawLine(item);
		this.lines.push(item);
		item.flat=this;
	}
	//控件初始化
	LTPolyLineFlat.prototype.initialize = function( map )
	{
		if(!this.group || this.map){return false;}
		this.map = map;
		map.mapsDiv.appendChild(this.group);
		this.initGroup();
		this.redrawLines(this.lines);
		this.listeners=[
			LTEvent.bind(map,"move",this,this.onMapMove),
			LTEvent.bind(map,"resize",this,this.initGroup),
			LTEvent.bind(map,"zoom",this,this.onMapZoom)];
	}
	//折线组初始化
	LTPolyLineFlat.prototype.initGroup= function()
	{
		var map=this.map;
		var group=this.group;
		
		var zoomUnits=map.zoomUnits;
		var bounds=map.getBoundsLatLng();
		var size=map.getViewSize();
		LTFunction.setSize(group,size);
		group.coordsize=size[0]*zoomUnits+","+size[1]*zoomUnits;
		this.onMapMove(true);
	}
	//在地图移动的时候执行
	LTPolyLineFlat.prototype.onMapMove= function(flag)
	{
		if(!flag){return;}
		this.group.coordorigin=this.map.areaCenter.getLongitude()+",-"+this.map.areaCenter.getLatitude();
	}
	LTPolyLineFlat.prototype.onMapZoom=function(oldZoom,newZoom)
	{
		var step=(newZoom>oldZoom)?1:-1;
		for(var i=oldZoom;true;i+=step)
		{
			this.redrawLines(this.maxZooms[i]);
			this.redrawLines(this.minZooms[i]);
			if(i==newZoom){break;}
		}
		this.initGroup();
	}
	LTPolyLineFlat.prototype.getObject = function(){}
	LTPolyLineFlat.prototype.remove = function()
	{
		var listener;
		while(listener=this.listeners.pop())
		{
			LTEvent.removeListener(this.listener);
		}
		this.listeners=null;
		this.map.mapsDiv.removeChild(this.group);
	}
	
	LTPolyLineFlat.prototype.depose = function()
	{
		LTEvent.deposeNode(this.group);
		this.group=null;
	}
	function LTPolyLineItem(points,color,weight,opacity,dash,arrow)
	{
		var lng,lat;
		var ps=[];
		while(lng=points.shift())
		{
			lat=points.shift();
			ps.push([lng,-lat]);
		}
		var line=document.createElement("v:polyline");
		line.points=ps.join(" ");

		line.filled=false;
		var stroke=document.createElement("v:stroke");
		stroke.joinstyle="round";
		stroke.endcap="round";
		stroke.color=color?color:"blue";
		stroke.weight=weight?weight:3;
		stroke.opacity=opacity?opacity:0.5;
		stroke.dashstyle=dash?dash:"solid";
		stroke.startarrow=arrow?arrow[0]:"None";
		stroke.endarrow=arrow?arrow[1]:"None";
		line.appendChild(stroke);
		LTEvent.bind(line,"click",this,this.onLineClick);
		LTEvent.bind(line,"mouseover",this,this.onLineMouseOver);
		LTEvent.bind(line,"mouseout",this,this.onLineMouseOut);
		this.line=line;
		this.stroke=stroke;
	}
	LTPolyLineItem.prototype.onLineClick= function(e)
	{
		var point=LTFunction.getEventPosition(e,this.flat.map.container);
		LTEvent.trigger(this,"click",[point]);
		LTEvent.trigger(this.flat,"click",[this,point]);
	}
	LTPolyLineItem.prototype.onLineMouseOver= function(e)
	{
		var point=LTFunction.getEventPosition(e,this.flat.map.container);
		LTEvent.trigger(this,"mouseover",[point]);
		LTEvent.trigger(this.flat,"mouseover",[this,point]);
	}
	LTPolyLineItem.prototype.onLineMouseOut= function(e)
	{
		var point=LTFunction.getEventPosition(e,this.flat.map.container);
		LTEvent.trigger(this,"mouseout",[point]);
		LTEvent.trigger(this.flat,"mouseout",[this,point]);
	}
	LTPolyLineItem.prototype.setLineColor= function(color)
	{
		this.stroke.color=color;
	}
	LTPolyLineItem.prototype.setLineStroke= function(weight)
	{
		this.stroke.weight=weight;
	}
	LTPolyLineItem.prototype.setOpacity= function(opacity)
	{
		this.stroke.opacity=opacity;
	}
	LTPolyLineItem.prototype.setLineStyle= function(dashstyle)
	{
		this.stroke.dashstyle=dashstyle;
	}
	window.LTPolyLineItem = LTPolyLineItem;
	window.LTPolyLineFlat = LTPolyLineFlat;
}
LTNS();