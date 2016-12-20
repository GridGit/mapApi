function LTNS()
{
	//构造函数，使用5个参数，
	//	bounds	类型是LTBounds,代表画圆的位置和大小
	//	color	线条颜色
	//	bgcolor	背景颜色
	//	weight	线条宽度
	//	opacity	不透明度 0-1
	function LTRect(bounds,color,bgcolor,weight,opacity,create)
	{
		this.bounds=bounds;
		color=(color || color=="")?color:"blue";
		bgcolor=(bgcolor || bgcolor=="")?bgcolor:"#99FFCC";
		weight=weight?weight:3;
		opacity=opacity?opacity:0.5;

		if(create){this.create=create;}
		this.create();
		this.setLineStroke(weight);
		this.setLineColor(color);
		this.setOpacity(opacity);
		this.setFillColor(bgcolor);
		this.setLineStyle("solid");
		LTFunction.setZIndex(this.div,420);
		LTEvent.bind(this.div,"click",this,this.onClick);
		LTEvent.bind(this.div,"mouseover",this,this.onMouseOver);
		LTEvent.bind(this.div,"mouseout",this,this.onMouseOut);
	}
	LTRect.prototype.create=function()
	{
		this.div=LTFunction.createDiv(1);
//		设置字体为0,防止div高度跟随字体大小而无法缩小
		this.div.style.fontSize = "0px";
		LTFunction.setUnSelectable(this.div);
	}
	LTRect.prototype.onMouseOver=function(e)
	{
		var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"mouseover",[point]);
	}
	LTRect.prototype.onMouseOut=function(e)
	{
		var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"mouseout",[point]);
	}
	LTRect.prototype.onClick=function(e)
	{
		var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"click",[point,LTFunction.getEventButton(e)]);
	}
	LTRect.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
	}
	LTRect.prototype.reDraw=function(flag)
	{
		//如果不是必须重绘，则不重绘，大部分的标注都不需要每次重绘
		if(!flag){return;}
		//进行重绘,对div进行切割,如果边框超出就剪掉
		this.drawSpan = this.map.getDrawBounds();
		//modify by zyg(2010-10-12)
		//转墨卡托
		var point_min = new LTPointMercator(this.bounds.Xmin,this.bounds.Ymin);
		var point_max = new LTPointMercator(this.bounds.Xmax,this.bounds.Ymax);
		
		var point_drawSpan_min = new LTPointMercator(this.drawSpan.Xmin,this.drawSpan.Ymin);
		var point_drawSpan_max = new LTPointMercator(this.drawSpan.Xmax,this.drawSpan.Ymax);
		
		var l = Math.max(point_drawSpan_min.getLatitude(),point_min.getLongitude());
		var b = Math.min(point_drawSpan_max.getLatitude(),point_max.getLatitude());
		var r = Math.min(point_drawSpan_max.getLongitude(),point_max.getLongitude());
		var t = Math.max(point_drawSpan_min.getLatitude(),point_min.getLatitude());
		//转NTU
		var point_leftup_m = new LTPointWGS84(l,b);
		var point_rightdown_m = new LTPointWGS84(r,t);
		var lb=this.map.getOverLayPosition(new LTPoint(point_leftup_m.getLongitude(),point_leftup_m.getLatitude()));//取得范围bounds左上角的坐标
		var rt=this.map.getOverLayPosition(new LTPoint(point_rightdown_m.getLongitude(),point_rightdown_m.getLatitude()));//取得范围bounds右下角坐标
		
/*		var l = Math.max(this.drawSpan.Xmin,this.bounds.Xmin);
		var b = Math.min(this.drawSpan.Ymax,this.bounds.Ymax);
		var r = Math.min(this.drawSpan.Xmax,this.bounds.Xmax);
		var t = Math.max(this.drawSpan.Ymin,this.bounds.Ymin);
		var lb=this.map.getOverLayPosition(new LTPoint(l,b));//取得范围bounds左上角的坐标
		var rt=this.map.getOverLayPosition(new LTPoint(r,t));//取得范围bounds右下角坐标*/
		
//		var lb=this.map.getOverLayPosition(new LTPoint(this.bounds.Xmin,this.bounds.Ymax));//取得范围bounds左上角的坐标
//		var rt=this.map.getOverLayPosition(new LTPoint(this.bounds.Xmax,this.bounds.Ymin));//取得范围bounds右下角坐标
		this.draw(lb,rt);
	}
	LTRect.prototype.draw=function(lb,rt)
	{
		LTFunction.setPosition(this.div,lb);
		LTFunction.setSize(this.div,[rt[0]-lb[0],rt[1]-lb[1]]);
	}
	LTRect.prototype.getObject=function(){return this.div;}
	LTRect.prototype.remove=function()
	{
		this.map=null;
	}
	LTRect.prototype.depose=function()
	{
		if(this.graphics)
		{
			this.graphics.clear(); 
			this.graphics=null;
		}
		LTEvent.deposeNode(this.div);
		this.div=null;
		this.bounds=null;
	}
	LTRect.prototype.getBounds=function()
	{
		return this.bounds;
	}
	LTRect.prototype.setBounds=function(bounds)
	{
		this.bounds=bounds;
		if(this.map)
		{
			this.reDraw(true);
		}
	}
	LTRect.prototype.getLineColor=function()
	{
		return this.color;
	}
	LTRect.prototype.setLineColor=function(color)
	{
		this.color=color;
		this.div.style.borderColor=color;
	}
	LTRect.prototype.getFillColor=function()
	{
		return this.bgcolor;
	}
	LTRect.prototype.setFillColor=function(bgcolor)
	{
		this.bgcolor=bgcolor;
		this.div.style.backgroundColor=bgcolor;
	}
	LTRect.prototype.getOpacity=function()
	{
		return this.opacity;
	}
	LTRect.prototype.setOpacity=function(opacity)
	{
		this.opacity=opacity;
		LTFunction.setOpacity(this.div,this.opacity);
	}
	LTRect.prototype.getLineStroke=function()
	{
		return this.weight;
	}
	LTRect.prototype.setLineStroke=function(weight)
	{
		this.weight=weight;
		this.div.style.borderWidth=weight;
	}
	LTRect.prototype.getLineStyle=function(style)
	{
		return this.lineStyle;
	}
	LTRect.prototype.setLineStyle=function(style)
	{
		if(!style){return;}
		this.lineStyle=style;
		if(style.toLowerCase()=="dot"){style="dotted";}
		if(style.toLowerCase()=="dash"){style="dashed";}
		this.div.style.borderStyle=style;
	}
/*
	function LTEllipse(bounds,color,bgcolor,weight,opacity)
	{
		var overlay=new LTRect(bounds,color,bgcolor,weight,opacity,LTEllipse.create);
		return overlay;
	}
	LTEllipse.create=function()
	{
		this.draw=LTEllipse.draw;
		this.setLineColor=LTEllipse.setLineColor;
		this.setFillColor=LTEllipse.setFillColor;
		this.setOpacity=LTEllipse.setOpacity;
		this.setLineStroke=LTEllipse.setLineStroke;
		this.setLineStyle=LTEllipse.setLineStyle;
		if(LTBrowserInfo.isIE())
		{
			this.namespaceArr = ["oval","stroke","fill"];
			LTFunction.loadVmlNamespace(this.namespaceArr);
			this.div=document.createElement("v:oval");
			this.div.unselectable="on";
			this.div.filled=true;
			this.stroke=document.createElement("v:stroke");
			this.div.appendChild(this.stroke);
			this.fill=document.createElement("v:fill");
			this.div.appendChild(this.fill);
		}
		else
		{
			this.div=LTFunction.createDiv(0);
			this.graphics=new window.jsGraphics(this.div);
			LTFunction.setOpacity(this.div,this.opacity);
		}
		this.div.style.position="absolute";
	}
	LTEllipse.draw=function(lb,rt)
	{
		if(LTBrowserInfo.isIE())
		{
			LTFunction.setPosition(this.div,lb);
			LTFunction.setSize(this.div,[rt[0]-lb[0],rt[1]-lb[1]]);
		}
		else
		{
			this.graphics.clear(); 
			this.graphics.setColor(this.bgcolor);
			this.graphics.fillEllipse(lb[0],lb[1],rt[0]-lb[0],rt[1]-lb[1]);
			this.graphics.setStroke(this.weight);
			this.graphics.setColor(this.color);
			this.graphics.drawEllipse(lb[0],lb[1],rt[0]-lb[0],rt[1]-lb[1]);
			this.graphics.paint(); 
		}
	}
	LTEllipse.setLineColor=function(color)
	{
		this.color=color;
		if(LTBrowserInfo.isIE())
		{
			if(this.color=="transparent" || this.color=="")
			{
				this.div.stroked=false;
			}
			else
			{
				this.div.stroked=true;
				this.div.strokecolor=this.color;
			}
		}
		else
		{
			if(this.map)
			{
				this.reDraw(true);
			}
		}
	}
	LTEllipse.setFillColor=function(bgcolor)
	{
		this.bgcolor=bgcolor;
		if(LTBrowserInfo.isIE())
		{
			if(this.bgcolor=="transparent" || this.bgcolor=="")
			{
				this.div.filled=false;
			}
			else
			{
				this.div.filled=true;
				this.div.fillcolor=this.bgcolor;
			}
		}
		else
		{
			if(this.map)
			{
				this.reDraw(true);
			}
		}
	}
	LTEllipse.setOpacity=function(opacity)
	{
		this.opacity=opacity;
		if(LTBrowserInfo.isIE())
		{
			this.stroke.opacity=this.opacity;
			this.fill.opacity=this.opacity;
		}
		else
		{
			LTFunction.setOpacity(this.div,this.opacity);
		}
	}
	LTEllipse.setLineStroke=function(weight)
	{
		this.weight=weight;
		if(LTBrowserInfo.isIE())
		{
			this.div.strokeweight=this.weight;
		}
		else
		{
			if(this.map)
			{
				this.graphics.setStroke(this.weight);
				this.reDraw(true);
			}
		}
	}
	LTEllipse.setLineStyle=function(style)
	{
		if(!style){return;}
		this.lineStyle=style;
		if(LTBrowserInfo.isIE())
		{
			this.stroke.dashstyle=style;
		}
	}
*/
	window.LTRect=LTRect;
	//window.LTEllipse=LTEllipse;
}
LTNS();