function LTMapNS()
{
	function LTPolygon(points,color,bgcolor,weight,opacity,linestyle,cursorstyle,create)
	{
		var pointsTemp = [];
		//将传入的经纬度转换成墨卡托
		if(points.length > 0){
			for(var i=0; i<points.length; i++){
				var Point_M = new LTPointMercator(points[i].getLongitude(),points[i].getLatitude());
				pointsTemp[i] = new LTPoint(Point_M.getLongitude(),Point_M.getLatitude());
			}
		}
		this.points=pointsTemp;
		this.color=(color || color=="")?color:"#0000FF";
		this.bgcolor=(bgcolor || bgcolor=="")?bgcolor:"#99FFCC";
		this.weight=weight?parseInt(weight):4;
		this.opacity=opacity?opacity:0.5;
		this.lineArrow=["None","None"];
		
		this.lineStyle = linestyle?linestyle:"solid";
		this.cursorStyle = cursorstyle?cursorstyle:"";
		this.strokeLinecap = "round";
		this.strokeLinejoin = "round";
		this.strokeDasharray = "none";
		
		this.countBounds();
		if(create){this.create=create;}
		this.create();
		this.setLineColor(this.color);
		this.setFillColor(this.bgcolor);
		this.setLineStroke(this.weight);
		this.setOpacity(this.opacity);
		this.setLineStyle("solid");
		LTFunction.setZIndex(this.div,420);
		this.listeners=[];
	}
	LTPolygon.prototype.create=function()
	{
		if(LTBrowserInfo.isIE())
		{
			this.namespaceArr = ["shape","stroke","fill"];
			LTFunction.loadVmlNamespace(this.namespaceArr);
			this.div=document.createElement("v:shape");
			this.div.unselectable="on";
			this.div.filled=true;
			this.stroke=document.createElement("v:stroke");
			this.stroke.joinstyle="round";
			this.stroke.endcap="round";
			this.div.appendChild(this.stroke);
			this.fill=document.createElement("v:fill");
			this.div.appendChild(this.fill);
		}
		else
		{
			this.div=LTFunction.createDiv(0);
			this.svgNS = "http://www.w3.org/2000/svg";
			this.svg = document.createElementNS(this.svgNS, "svg");
			this.path = document.createElementNS(this.svgNS, "path");
			this.svg.appendChild(this.path);
			this.div.appendChild(this.svg);
		}
		this.div.style.position="absolute";
	}
	LTPolygon.prototype.onMouseOver=function(e)
	{
		var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"mouseover",[point]);
	}
	LTPolygon.prototype.onMouseOut=function(e)
	{
		var point=LTFunction.getEventPosition(e,this.map.container);
		LTEvent.trigger(this,"mouseout",[point]);
	}
	LTPolygon.prototype.onClick=function(e)
	{
		var point=LTFunction.getEventPosition(e,this.map.container);
	//	LTEvent.trigger(this.map,"click",[point,LTFunction.getEventButton(e),this])
		LTEvent.trigger(this,"click",[point,LTFunction.getEventButton(e)]);
	}
	LTPolygon.prototype.countBounds=function()
	{
		this.bounds=new LTBounds(Number.MAX_VALUE,Number.MAX_VALUE,Number.MIN_VALUE,Number.MIN_VALUE);
		var arrayLength=this.points.length;
		for(var i=0;i<arrayLength;i++)
		{
			if(this.bounds.Xmin>this.points[i].getLongitude())
			{
				this.bounds.Xmin=this.points[i].getLongitude();
			}
			if(this.bounds.Xmax<this.points[i].getLongitude())
			{
				this.bounds.Xmax=this.points[i].getLongitude();
			}
			if(this.bounds.Ymin>this.points[i].getLatitude())
			{
				this.bounds.Ymin=this.points[i].getLatitude();
			}
			if(this.bounds.Ymax<this.points[i].getLatitude())
			{
				this.bounds.Ymax=this.points[i].getLatitude();
			}
		}
	}
	LTPolygon.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		this.added=true;
	}
	LTPolygon.prototype.getPointsString=function()
	{
		var pointArray=new Array(0);
		var arrayLength=this.points.length;
		if(this.drawSpan.Xmin>this.drawSpan.Xmax || this.drawSpan.Ymin>this.drawSpan.Ymax){return "";}
		//以下for语句对每一个点进行遍历
		for(var i=0;i<arrayLength;i++)
		{
			if(i==0)
			{
				pointArray.push("m");
			}
			else
			{
				pointArray.push("l");
			}
			pointArray.push(this.points[i].getLongitude()-this.drawSpan.Xmin);
			pointArray.push(-this.points[i].getLatitude()+this.drawSpan.Ymax);
		}
		pointArray.push("x");
		pointArray.push("e");
		return pointArray.join(" ");
	}
	LTPolygon.prototype.drawSvg=function()
	{
		this.path.setAttribute("stroke-width", this.weight);
		this.path.setAttribute("stroke", this.color);
		this.path.setAttribute("stroke-opacity", this.opacity);
		this.path.setAttribute("stroke-linecap", this.strokeLinecap);
		this.path.setAttribute("stroke-linejoin", this.strokeLinejoin);
		this.path.setAttribute("stroke-dasharray", this.strokeDasharray);
		if(this.path.hasAttribute("fill"))
		{
			this.path.setAttribute("fill", this.bgcolor);
			this.path.setAttribute("fill-opacity", this.opacity);
		}
		this.path.style.cursor = this.cursorStyle;
		var pointArray=new Array(0);
		var arrayLength=this.points.length;
		if(this.drawSpan.Xmin>this.drawSpan.Xmax || this.drawSpan.Ymin>this.drawSpan.Ymax){return;}
		var zoomUnits=this.map.getZoomUnits(this.map.getCurrentZoom());
		//以下for语句对每一个点进行遍历
		for(var i=0;i<arrayLength;i++)
		{
			if(i==0)
			{
				pointArray.push("M");
				
				pointArray.push(parseInt((this.points[i].getLongitude()-this.drawSpan.Xmin)/zoomUnits)+this.weight/2);
				pointArray.push(parseInt((-this.points[i].getLatitude()+this.drawSpan.Ymax)/zoomUnits)+this.weight/2);
			}
			else
			{
				pointArray.push("L");
				pointArray.push(parseInt((this.points[i].getLongitude()-this.drawSpan.Xmin)/zoomUnits)+this.weight/2);
				pointArray.push(parseInt((-this.points[i].getLatitude()+this.drawSpan.Ymax)/zoomUnits)+this.weight/2);
			}
		}
		pointArray.push("Z");
		this.path.setAttribute("d",pointArray.join(" "));
	}
	LTPolygon.prototype.reDraw=function(flag)
	{
		var bounds=this.map.getBoundsLatLng();
		
		if(!flag && this.drawBounds && this.drawBounds.containsBounds(bounds)){return;}
		this.drawBounds=this.map.getDrawBounds();
		
		//将中心点坐标NTU转换成墨卡托坐标
		var drawBounds_M = new LTPointMercator(this.drawBounds.Xmin,this.drawBounds.Ymin);
		drawBounds_LeftDown = new LTPoint(drawBounds_M.getLongitude(),drawBounds_M.getLatitude());
		
		//将中心点坐标NTU转换成墨卡托坐标
		var drawBounds_M = new LTPointMercator(this.drawBounds.Xmax,this.drawBounds.Ymax);
		drawBounds_RightUp = new LTPoint(drawBounds_M.getLongitude(),drawBounds_M.getLatitude());
		
		this.drawBounds = new LTBounds(drawBounds_LeftDown.getLongitude(),drawBounds_LeftDown.getLatitude(),drawBounds_RightUp.getLongitude(),drawBounds_RightUp.getLatitude());
		
		this.drawSpan=new LTBounds(Math.max(drawBounds_LeftDown.getLongitude(),this.bounds.Xmin),Math.max(drawBounds_LeftDown.getLatitude(),this.bounds.Ymin),Math.min(drawBounds_RightUp.getLongitude(),this.bounds.Xmax),Math.min(drawBounds_RightUp.getLatitude(),this.bounds.Ymax));
		if(this.drawSpan.Xmin>this.drawSpan.Xmax || this.drawSpan.Ymin>this.drawSpan.Ymax)
		{
			if(this.added)
			{
				this.map.overlaysDiv.removeChild(this.div);
				this.added=false;
			}
			this.expandDrawBounds();
			return;
		}
		else if(!this.added)
		{
			this.map.overlaysDiv.appendChild(this.div);
			this.added=true;
		}

		//将中心点坐标（墨卡托）转换成NTU
		var drawSpan_N = new LTPointWGS84(this.drawSpan.Xmin,this.drawSpan.Ymax);
		drawSpan_position = new LTPoint(drawSpan_N.getLongitude(),drawSpan_N.getLatitude());
		
		var position=this.map.getOverLayPosition(new LTPoint(drawSpan_position.getLongitude(),drawSpan_position.getLatitude()));
		
		//为什么要重新设置一遍，主要是IE的VML在被remove之后，有些属性就会丢失了
		if(LTBrowserInfo.isIE())
		{
			LTFunction.setPosition(this.div,position);
			LTFunction.setSize(this.div,[parseInt((this.drawSpan.Xmax-this.drawSpan.Xmin)/this.map.getZoomUnits(this.map.getCurrentZoom())),parseInt((this.drawSpan.Ymax-this.drawSpan.Ymin)/this.map.getZoomUnits(this.map.getCurrentZoom()))]);
		
			this.setLineColor(this.color);
			this.setFillColor(this.bgcolor);
			this.setLineStroke(this.weight);
			this.setOpacity(this.opacity);
			this.setLineStyle(this.lineStyle);
			this.div.path=this.getPointsString();
			this.div.coordsize=(this.drawSpan.Xmax-this.drawSpan.Xmin)+","+(this.drawSpan.Ymax-this.drawSpan.Ymin);
			if(this.listeners.length == 0){
				this.listeners=[
					LTEvent.bind(this.div,"click",this,this.onClick),
					LTEvent.bind(this.div,"mouseover",this,this.onMouseOver),
					LTEvent.bind(this.div,"mouseout",this,this.onMouseOut)
				];
			}
		}
		else
		{
			LTFunction.setPosition(this.div,[position[0]-Math.round(this.weight/2)+1,position[1]-Math.round(this.weight/2)+1]);
			LTFunction.setSize(this.div,[parseInt((this.drawSpan.Xmax-this.drawSpan.Xmin)/this.map.getZoomUnits(this.map.getCurrentZoom()))+this.weight+1,parseInt((this.drawSpan.Ymax-this.drawSpan.Ymin)/this.map.getZoomUnits(this.map.getCurrentZoom()))+this.weight+1]);
			this.drawSvg();
			if(this.listeners.length == 0){
				this.listeners=[
					LTEvent.bind(this.path,"click",this,this.onClick),
					LTEvent.bind(this.path,"mouseover",this,this.onMouseOver),
					LTEvent.bind(this.path,"mouseout",this,this.onMouseOut)
				];
			}
		}
		this.expandDrawBounds();
	}
	LTPolygon.prototype.expandDrawBounds=function()
	{
		if(this.bounds.Xmax<this.drawBounds.Xmax)
		{
			this.drawBounds.Xmax=Number.MAX_VALUE;
		}
		if(this.bounds.Ymax<this.drawBounds.Ymax)
		{
			this.drawBounds.Ymax=Number.MAX_VALUE;
		}
		if(this.bounds.Xmin>this.drawBounds.Xmin)
		{
			this.drawBounds.Xmin=Number.MIN_VALUE;
		}
		if(this.bounds.Ymin>this.drawBounds.Ymin)
		{
			this.drawBounds.Ymin=Number.MIN_VALUE;
		}
	}
	LTPolygon.prototype.getObject=function(){return this.div;}
	LTPolygon.prototype.remove=function()
	{
		this.added=false;
		this.map=null;
	}
	LTPolygon.prototype.depose=function()
	{
		var listener;
		while(listener=this.listeners.pop())
		{
			LTEvent.removeListener(listener);
		}
		LTEvent.deposeNode(this.div);
		this.div=null;
		this.stroke=null;
		this.points=null;
	}
	LTPolygon.prototype.getLineColor=function()
	{
		return this.color;
	}
	LTPolygon.prototype.getPoints=function()
	{
		var pointsTemp = [];
		//将经纬度转换成NTU
		for(var i=0; i<this.points.length; i++){
			var Point_M = new LTPointWGS84(this.points[i].getLongitude(),this.points[i].getLatitude());
			pointsTemp[i] = new LTPoint(Point_M.getLongitude(),Point_M.getLatitude());
		}
		return pointsTemp;
	}
	LTPolygon.prototype.setPoints=function(points)
	{
		var pointsTemp = [];
		//将传入的经纬度转换成墨卡托
		if(points.length > 0){
			for(var i=0; i<points.length; i++){
				var Point_M = new LTPointMercator(points[i].getLongitude(),points[i].getLatitude());
				pointsTemp[i] = new LTPoint(Point_M.getLongitude(),Point_M.getLatitude());
			}
		}
		this.points=pointsTemp;
		this.countBounds();
		if(this.map)
		{
			this.reDraw(true);
		}
	}
	LTPolygon.prototype.setLineColor=function(color)
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
			if(color=="block")
			{
				this.color = "#000000";
			}
			this.path.setAttribute("stroke", this.color);
		}
	}
	LTPolygon.prototype.getFillColor=function()
	{
		return this.bgcolor;
	}
	LTPolygon.prototype.setFillColor=function(bgcolor)
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
			if(this.bgcolor==""){
				if(this.path.hasAttribute("fill")){
					this.path.removeAttribute("fill");
				}
				this.path.setAttribute("fill-opacity", 0);
			}else{
				this.path.setAttribute("fill", this.bgcolor);
			}
		}
	}
	LTPolygon.prototype.getOpacity=function()
	{
		return this.opacity;
	}
	LTPolygon.prototype.setOpacity=function(opacity)
	{
		this.opacity=opacity;
		if(LTBrowserInfo.isIE())
		{
			this.stroke.opacity=this.opacity;
			this.fill.opacity=this.opacity;
		}
		else
		{
			if(!this.path.hasAttribute("fill") || this.path.getAttribute("fill")==""){
				this.path.setAttribute("stroke-opacity", this.opacity);
				this.path.setAttribute("fill-opacity", 0);
			}else{
				this.path.setAttribute("stroke-opacity", this.opacity);
				this.path.setAttribute("fill-opacity", this.opacity);
			}
		}
	}
	LTPolygon.prototype.getLineStroke=function()
	{
		return this.weight;
	}
	LTPolygon.prototype.setLineStroke=function(weight)
	{
		this.weight=parseInt(weight);
		if(LTBrowserInfo.isIE())
		{
			if(this.weight=="0" || this.weight==0)
			{
				this.div.stroked = false;
				this.div.strokeweight=this.weight+"px";
			}else{
				this.div.strokeweight=this.weight+"px";
			}
		}
		else
		{
			this.path.setAttribute("stroke-width", this.weight);
			//防止用户先调用setLineStyle后再调用setLineStroke时，线的样式会改变的情况
			if(this.lineStyle == "Dot")	//设置线的样式为点线
			{
				//用逗号分割，为了兼容3.5-4.0之间的火狐版本
				this.strokeDasharray = "1,"+this.weight*4+",1,"+this.weight*4;
			}
			else if(this.lineStyle == "Dash")	//设置线的样式为折线
			{
				if(this.weight > 1)
				{
					if(this.weight * 3 % 3 == 0)
					{
						var a = this.weight * 3
					}
					else
					{
						var a = this.weight * 3 + 1;
					}
					if(this.weight * 4 % 3 == 0)
					{
						var b = this.weight * 4;
					}
					else
					{
						var b = this.weight * 4 - 1;
					}
					this.strokeDasharray = a + "," + b + "," + a + "," + b;
				}
				else
				{
					this.strokeDasharray = "3,4,3,4";
				}
			}
			this.path.setAttribute("stroke-linecap", this.strokeLinecap);
			this.path.setAttribute("stroke-linejoin", this.strokeLinejoin);
			this.path.setAttribute("stroke-dasharray", this.strokeDasharray);
		}
	}
	LTPolygon.prototype.getLineStyle=function(style)
	{
		return this.lineStyle;
	}
	LTPolygon.prototype.setLineStyle=function(style)
	{
		if(!style){return;}
		this.lineStyle=style;
		if(LTBrowserInfo.isIE())
		{
			this.stroke.dashstyle=style;
		}
		else
		{
			if(style == "Dot")	//设置线的样式为点线
			{
				this.strokeDasharray = "1,"+this.weight*4+",1,"+this.weight*4;
			}
			else if(style == "Dash")	//设置线的样式为折线
			{
				/**计算规律
				IE线的宽度为1	火狐下SVG的设置"3 4 3 4"
				IE线的宽度为2	火狐下SVG的设置"7 7 7 7"
				IE线的宽度为3	火狐下SVG的设置"9 12 9 12"
				IE线的宽度为4	火狐下SVG的设置"13 15 13 15"
				**/
				if(this.weight > 1)
				{
					if(this.weight * 3 % 3 == 0)
					{
						var a = this.weight * 3
					}
					else
					{
						var a = this.weight * 3 + 1;
					}
					if(this.weight * 4 % 3 == 0)
					{
						var b = this.weight * 4;
					}
					else
					{
						var b = this.weight * 4 - 1;
					}
					this.strokeDasharray = a + "," + b + "," + a + "," + b;
				}
				else
				{
					this.strokeDasharray = "3,4,3,4";
				}
			}
			else
			{
				this.strokeLinecap = "round";
				this.strokeLinejoin = "round";
				this.strokeDasharray = "none";
			}
			this.path.setAttribute("stroke-linecap", this.strokeLinecap);
			this.path.setAttribute("stroke-linejoin", this.strokeLinejoin);
			this.path.setAttribute("stroke-dasharray", this.strokeDasharray);
		}
	}
	
	LTPolygon.prototype.setCursor=function(cur)
	{
		this.cursorStyle = cur;
		if(LTBrowserInfo.isIE())
		{
			this.div.style.cursor=this.cursorStyle;
		}
		else
		{
			this.path.style.cursor = this.cursorStyle;
		}
	}
	
	LTPolygon.prototype.getLineArrow=function()
	{
		return this.lineArrow;
	}
	LTPolygon.prototype.setLineArrow=function(start,end)
	{
		if(!end && typeof(start)=="object")
		{
			end=start[1];
			start=start[0];
		}
		if(start){this.lineArrow[0]=start;}
		if(end){this.lineArrow[1]=end;}
		if(LTBrowserInfo.isIE())
		{
			if(start){this.stroke.startarrow=start};
			if(end){this.stroke.endarrow=end};
		}
	}
	LTPolygon.prototype.hide=function(){//090409 add by zhoutao
		this.getObject.style.display="none";
	}
	function LTPolyLine(points,color,weight,opacity,linestyle,cursorstyle)
	{
		this.linestyle = linestyle?linestyle:null;
		this.cursorstyle = cursorstyle?cursorstyle:null;
		return new LTPolygon(points,color,"",weight,opacity,this.linestyle,this.cursorstyle,LTPolyLine.create);
	}
	LTPolyLine.create=function()
	{
		if(LTBrowserInfo.isIE())
		{
			this.namespaceArr = ["shape","stroke","fill"];
			LTFunction.loadVmlNamespace(this.namespaceArr);
			this.div=document.createElement("v:shape");
			this.div.style.position="absolute";
			this.div.unselectable="on";
			this.div.filled=false;
			this.stroke=document.createElement("v:stroke");
			this.stroke.joinstyle="round";
			this.stroke.endcap="round";
			this.fill=document.createElement("v:fill");
			this.div.appendChild(this.fill);
			this.div.appendChild(this.stroke);
		}
		else
		{
			this.div=LTFunction.createDiv(0);
			this.svgNS = "http://www.w3.org/2000/svg";
			this.svg = document.createElementNS(this.svgNS, "svg");
			this.path = document.createElementNS(this.svgNS, "path");
			this.svg.appendChild(this.path);
			this.div.appendChild(this.svg);

		}
		this.div.style.position="absolute";
		this.getPointsString=LTPolyLine.getPointsString;
		this.drawSvg=LTPolyLine.drawSvg;
	}
	LTPolyLine.getPointsString=function()
	{
		var pointArray=new Array(0);
		var arrayLength=this.points.length;
		var units=this.map.zoomUnits*4;
		if(this.drawSpan.Xmin>this.drawSpan.Xmax || this.drawSpan.Ymin>this.drawSpan.Ymax){return "";}
		var flag=-1;
//以下for语句对每一个点进行遍历，编写出该条折线在this.drawBounds范围中的画笔代码,flag总是代表上一个this.drawBounds范围中的点的索引
		var lastPoint=null;
		for(var i=0;i<arrayLength;i++)
		{
			if(this.drawBounds.containsPoint(this.points[i]))
			{//如果当前点在this.drawBounds范围中
				if(i==0)
				{//如果是整条折线中第一个在this.drawBounds范围中的点，则该点作为起点，将画笔移动到当前点
					pointArray.push("m");
					pointArray.push(parseInt(this.points[i].getLongitude()-this.drawSpan.Xmin));
					pointArray.push(parseInt(-this.points[i].getLatitude()+this.drawSpan.Ymax));
					lastPoint=this.points[i];
				}
				else if(flag==i-1)
				{//如果上一个点也在this.drawBounds范围中，则直接划线至当前点
					if(arrayLength-1==i || Math.abs(lastPoint.getLongitude()-this.points[i].getLongitude())>units || Math.abs(lastPoint.getLatitude()-this.points[i].getLatitude())>units)
					{
						pointArray.push("l");
						pointArray.push(parseInt(this.points[i].getLongitude()-this.drawSpan.Xmin));
						pointArray.push(parseInt(-this.points[i].getLatitude()+this.drawSpan.Ymax));
						lastPoint=this.points[i];
					}
				}
				else
				{//上一个点不在this.drawBounds范围之中，应该将画笔移动到[上一个点和当前点的线段与this.drawBounds的交点]，然后再划线至当前点
					var intersection=this.drawBounds.getIntersection(this.points[i-1],this.points[i]);
					if(intersection.length==1)
					{
						pointArray.push("m");
						pointArray.push(parseInt(intersection[0].getLongitude()-this.drawSpan.Xmin));
						pointArray.push(parseInt(-intersection[0].getLatitude()+this.drawSpan.Ymax));
						pointArray.push("l");
						pointArray.push(parseInt(this.points[i].getLongitude()-this.drawSpan.Xmin));
						pointArray.push(parseInt(-this.points[i].getLatitude()+this.drawSpan.Ymax));
					}
					lastPoint=this.points[i];
				}
				flag=i;
			}
			else
			{//如果当前点不在this.drawBounds范围中
				if(i==0)
				{
				}
				else if(flag==i-1)
				{//如果上一个点在this.drawBounds范围中，则应该将画笔划线至[上一个点和当前点的线段与this.drawBounds的交点]
					var intersection=this.drawBounds.getIntersection(this.points[i-1],this.points[i]);
					if(intersection.length==1)
					{
						pointArray.push("l");
						pointArray.push(parseInt(intersection[0].getLongitude()-this.drawSpan.Xmin));
						pointArray.push(parseInt(-intersection[0].getLatitude()+this.drawSpan.Ymax));
					}
				}
				else
				{//如果上一个点也不在this.drawBounds范围中，为了防止出现断线情况，应该求取[上一个点和当前点的线段与this.drawBounds的交点]，如果存在两个交点，则移动到第一个交点，划线至第二个交点
					var intersection=this.drawBounds.getIntersection(this.points[i-1],this.points[i]);
					if(intersection.length==2)
					{//假如存在两个交点
						pointArray.push("m");
						pointArray.push(parseInt(intersection[0].getLongitude()-this.drawSpan.Xmin));
						pointArray.push(parseInt(-intersection[0].getLatitude()+this.drawSpan.Ymax));
						pointArray.push("l");
						pointArray.push(parseInt(intersection[1].getLongitude()-this.drawSpan.Xmin));
						pointArray.push(parseInt(-intersection[1].getLatitude()+this.drawSpan.Ymax));
					}
				}
			}
		}
		pointArray.push("e");
		return pointArray.join(" ");
	}
	LTPolyLine.drawSvg=function()
	{
		this.path.setAttribute("stroke-width", this.weight);
		this.path.setAttribute("stroke", this.color);
		this.path.setAttribute("stroke-opacity", this.opacity);
		this.path.setAttribute("stroke-linecap", this.strokeLinecap);
		this.path.setAttribute("stroke-linejoin", this.strokeLinejoin);
		this.path.setAttribute("stroke-dasharray", this.strokeDasharray);
		this.path.setAttribute("fill", "none");
		this.path.style.cursor = this.cursorStyle;
		
		var pointArray=new Array(0);
		var arrayLength=this.points.length;
		if(this.drawSpan.Xmin>this.drawSpan.Xmax || this.drawSpan.Ymin>this.drawSpan.Ymax){return;}
		var flag=-1;
		var lastPoint=null;
		var zoomUnits=this.map.getZoomUnits(this.map.getCurrentZoom());
//以下for语句对每一个点进行遍历，编写出该条折线在this.drawBounds范围中的画笔代码,flag总是代表上一个this.drawBounds范围中的点的索引
		for(var i=0;i<arrayLength;i++)
		{
			if(this.drawBounds.containsPoint(this.points[i]))
			{//如果当前点在this.drawBounds范围中
				if(i==0)
				{//如果是整条折线中第一个在this.drawBounds范围中的点，则该点作为起点，将画笔移动到当前点
					
					pointArray.push("M");
					pointArray.push(parseInt((this.points[i].getLongitude()-this.drawSpan.Xmin)/zoomUnits)+this.weight/2);
					pointArray.push(parseInt((-this.points[i].getLatitude()+this.drawSpan.Ymax)/zoomUnits)+this.weight/2);
					lastPoint=this.points[i];
				}
				else if(flag==i-1)
				{//如果上一个点也在this.drawBounds范围中，则直接划线至当前点
					if(arrayLength-1==i || Math.abs(lastPoint.getLongitude()-this.points[i].getLongitude())>zoomUnits || Math.abs(lastPoint.getLatitude()-this.points[i].getLatitude())>zoomUnits)
					{
						pointArray.push("L");
						pointArray.push(parseInt((this.points[i].getLongitude()-this.drawSpan.Xmin)/zoomUnits)+this.weight/2);
						pointArray.push(parseInt((-this.points[i].getLatitude()+this.drawSpan.Ymax)/zoomUnits)+this.weight/2);
						lastPoint=this.points[i];
					}
				}
				else
				{//上一个点不在this.drawBounds范围之中，应该将画笔移动到[上一个点和当前点的线段与this.drawBounds的交点]，然后再划线至当前点
					var intersection=this.drawBounds.getIntersection(this.points[i-1],this.points[i]);
					if(intersection.length==1)
					{
						pointArray.push("M");
						pointArray.push(parseInt((intersection[0].getLongitude()-this.drawSpan.Xmin)/zoomUnits)+this.weight/2);
						pointArray.push(parseInt((-intersection[0].getLatitude()+this.drawSpan.Ymax)/zoomUnits)+this.weight/2);
						pointArray.push("L");
						pointArray.push(parseInt((this.points[i].getLongitude()-this.drawSpan.Xmin)/zoomUnits)+this.weight/2);
						pointArray.push(parseInt((-this.points[i].getLatitude()+this.drawSpan.Ymax)/zoomUnits)+this.weight/2);
					}
					lastPoint=this.points[i];
				}
				flag=i;
			}
			else
			{//如果当前点不在this.drawBounds范围中
				if(i==0)
				{
				}
				else if(flag==i-1)
				{//如果上一个点在this.drawBounds范围中，则应该将画笔划线至[上一个点和当前点的线段与this.drawBounds的交点]
					var intersection=this.drawBounds.getIntersection(this.points[i-1],this.points[i]);
					if(intersection.length==1)
					{
						pointArray.push("L");
						pointArray.push(parseInt((intersection[0].getLongitude()-this.drawSpan.Xmin)/zoomUnits)+this.weight/2);
						pointArray.push(parseInt((-intersection[0].getLatitude()+this.drawSpan.Ymax)/zoomUnits)+this.weight/2);
					}
				}
				else
				{//如果上一个点也不在this.drawBounds范围中，为了防止出现断线情况，应该求取[上一个点和当前点的线段与this.drawBounds的交点]，如果存在两个交点，则移动到第一个交点，划线至第二个交点
					var intersection=this.drawBounds.getIntersection(this.points[i-1],this.points[i]);
					if(intersection.length==2)
					{//假如存在两个交点
						pointArray.push("M");
						pointArray.push(parseInt((intersection[0].getLongitude()-this.drawSpan.Xmin)/zoomUnits)+this.weight/2);
						pointArray.push(parseInt((-intersection[0].getLatitude()+this.drawSpan.Ymax)/zoomUnits)+this.weight/2);
						pointArray.push("L");
						pointArray.push(parseInt((intersection[1].getLongitude()-this.drawSpan.Xmin)/zoomUnits)+this.weight/2);
						pointArray.push(parseInt((-intersection[1].getLatitude()+this.drawSpan.Ymax)/zoomUnits)+this.weight/2);
					}
				}
			}
		}
		this.path.setAttribute("d",pointArray.join(" "));
	}
	window.LTPolygon=LTPolygon;
	window.LTPolyLine=LTPolyLine;
}
LTMapNS();