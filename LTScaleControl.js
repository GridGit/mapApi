//本文件是JS API之中的LTScaleControl类，是地图的一个比例尺控件
//每个控件应该有initialize，getObject,depose三个方法
function LTMapNS()
{
	function LTScaleControl()
	{
		LTFunction.inherit(this,LTBaseControl);
		this.div=LTFunction.createDiv(1);
		this.units=window._LT_sclc_units?window._LT_sclc_units:[[1000,"km"],[1,"m"]];
		var style=this.div.style;
		style.align="center"
		style.right="10px";
		style.bottom="10px";
		style.height="20px";
		style.border="0px";

		this.span=LTFunction.createDiv(1);
		var style=this.span.style;
		style.height="15px";
		style.bottom="5px";
		style.fontSize="12px";
		style.width="100%";
		this.span.align="center";
		this.span.noWrap=true;
		this.div.appendChild(this.span);

		this.scale=LTFunction.createDiv(1);
		var style=this.scale.style;
		style.width="100%";
		style.bottom="4px";
		style.height="3px";
		style.fontSize="0px";
		this.div.appendChild(this.scale);
		
		var scaleLeft=LTFunction.createDiv(1);
		LTFunction.setSize(scaleLeft,[2,10]);
		var style=scaleLeft.style;
		style.bottom="0px";
		style.fontSize="0px";
		this.div.appendChild(scaleLeft);
		this.scaleLeft=scaleLeft;
		
		var scaleRight=LTFunction.createDiv(1);
		LTFunction.setSize(scaleRight,[2,10]);
		var style=scaleRight.style;
		style.right="-1px";
		style.bottom="0px";
		style.fontSize="0px";
		this.div.appendChild(scaleRight);
		this.scaleRight=scaleRight;
		
		this.setColor("#000000");
	}
	LTScaleControl.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		this.listener=LTEvent.bind(this.map,"move",this,this.resetScale)
		this.resetScale(this.map.centerPoint,true);
	}
	LTScaleControl.prototype.setColor=function(color)
	{
		this.scaleRight.style.backgroundColor=color;
		this.scale.style.backgroundColor=color;
		this.scaleLeft.style.backgroundColor=color;
	}
	LTScaleControl.prototype.resetScale=function(point,flag)
	{
		if(!flag){return;}
		var bounds=this.map.getBoundsLatLng();
		var dis=LTFunction.getPointsDistance(new LTPoint(bounds.Xmin,point.getLatitude()),new LTPoint(bounds.Xmax,point.getLatitude()))/this.map.viewSize[0];
		var mscale=Math.pow(10,Math.ceil(Math.log(dis*50)/Math.log(10)));
		var msize=mscale/dis;
		if(msize>=250){msize/=5;mscale/=5;}
		if(msize>=200){msize/=4;mscale/=4;}
		if(msize>=100){msize/=2;mscale/=2;}
		this.span.innerHTML=mscale;
		for(var i=0;i<this.units.length;i++)
		{
			if(mscale>=this.units[i][0])
			{
				this.span.innerHTML=mscale/this.units[i][0]+" "+this.units[i][1];
				break;
			}
		}
		this.div.style.width=Math.round(msize)+"px";
	}
	LTScaleControl.prototype.getObject=function()
	{
		return this.div;
	}
	LTScaleControl.prototype.remove=function()
	{
		LTEvent.removeListener(this.listener);
		this.listener=null;
		this.map=null;
	}
	LTScaleControl.prototype.depose=function()
	{
		LTEvent.deposeNode(this.div);
		this.div=null;
		this.span=null;
		this.scale=null;
	}
	window.LTScaleControl=LTScaleControl;
}
LTMapNS();