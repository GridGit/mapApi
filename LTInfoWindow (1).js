function LTMapNS()
{
	function LTInfoWindow(point,offset,config)
	{
		this.imgSrc=window._LT_info_img;
		if(point){this.setPoint(point,offset);}
		this.config=config?config:((window._LT_info_config)?window._LT_info_config:{})
		this.offset=offset?offset:[0,0];
		this.div =LTFunction.createDiv(1,null,560);
		this.title=LTFunction.createDiv(0);
		this.title.style.overflowX="hidden";
		LTFunction.setSize(this.title,["100%","100%"]);
		this.title.style.fontSize="12px";
		this.content=LTFunction.createDiv(1);
		LTEvent.addListener(this.content,"mousedown",LTEvent.returnTrue);
		LTEvent.addListener(this.content,"selectstart",LTEvent.returnTrue);
		LTEvent.addListener(this.content,"click",LTEvent.returnTrue);
		LTEvent.addListener(this.content,"dblclick",LTEvent.returnTrue);
		this.markerOffset=[0,0];
		this.createInfoWin();
		this.created=true;
		this.clear=this.disableCloseInfoWindowWithMouse;
	}
	//自定义信息浮窗的绘制函数
	LTInfoWindow.prototype.createInfoWin=function()
	{
		var tabSize=[7,6];
		var cursorSize=[40,28];
		var imgSrc=this.imgSrc;
		this.setSize([200,20]);
		this.markerOffset=[0.5,0];
		this.cursorPer=0.6;
		var topDiv=this.div;
		var config=this.config;
		this.arcImgs=[];
		//四个角的图片
		var img=new Image(tabSize[0],tabSize[1]);
		img.src=imgSrc+"iw_ul.gif";
		img.style.position="absolute";
		img.style.left="0px";
		img.style.top="0px";
		this.arcImgs.push(img);
		topDiv.appendChild(img);

		var img=new Image(tabSize[0],tabSize[1]);
		img.src=imgSrc+"iw_ur.gif";
		img.style.position="absolute";
		img.style.right="0px";
		img.style.top="0px";
		this.arcImgs.push(img);
		topDiv.appendChild(img);

		var img=new Image(tabSize[0],tabSize[1]);
		img.src=imgSrc+"iw_bl.gif";
		img.style.position="absolute";
		img.style.left="0px";
		this.arcImgs.push(img);
		topDiv.appendChild(img);

		var img=new Image(tabSize[0],tabSize[1]);
		img.src=imgSrc+"iw_br.gif";
		img.style.position="absolute";
		img.style.right="0px";
		this.arcImgs.push(img);
		topDiv.appendChild(img);

		//四条边的图片背景
		var div=LTFunction.createDiv(1);
		var style=div.style;
		style.backgroundImage ="url("+imgSrc+"iw_u.gif)";
		style.fontSize="0px";
		style.left=tabSize[0]+"px";
		style.top="0px";
		style.height=tabSize[1]+"px";
		topDiv.appendChild(div);
		this.topDiv=div;

		var div=LTFunction.createDiv(1);
		var style=div.style;
		style.backgroundImage ="url("+imgSrc+"iw_l.gif)";
		style.fontSize="0px";
		style.left="0px";
		style.top=tabSize[1]+"px";
		style.width=tabSize[0]+"px";
		topDiv.appendChild(div);
		this.leftDiv=div;

		var div=LTFunction.createDiv(1);
		var style=div.style;
		style.backgroundImage ="url("+imgSrc+"iw_b.gif)";
		style.fontSize="0px";
		style.left=tabSize[0]+"px";
		style.height=tabSize[1]+"px";
		topDiv.appendChild(div);
		this.bottomDiv=div;

		var div=LTFunction.createDiv(1);
		var style=div.style;
		style.backgroundImage ="url("+imgSrc+"iw_r.gif)";
		style.fontSize="0px";
		style.right="0px";
		style.top=tabSize[1]+"px";
		style.width=tabSize[0]+"px";
		topDiv.appendChild(div);
		this.rightDiv=div;

		//指向点图片
		var img=new Image(cursorSize[0],cursorSize[1]);
		img.src=imgSrc+"iw_p.gif";
		img.style.position="absolute";
		topDiv.appendChild(img);
		this.cursor=img;

		//内容区整体层
		var div=LTFunction.createDiv(1);
		div.style.backgroundColor="#FFFFFF";
		div.style.left=tabSize[0]+"px";
		div.style.top=tabSize[1]+"px";
		div.align="center";
		topDiv.appendChild(div);
		this.containerDiv=div;

		this.containerDiv.appendChild(this.title);
		this.title.align="left";
		var style=this.title.style;
		style.fontSize="14px";
		style.color="#000000";
		style.position="absolute";
		style.left="3px";
		style.top="3px";
		style.height="16px";
		style.overflowX="hidden";
		//横条
		var bar=LTFunction.createDiv(2);
		var style=bar.style;
		style.fontSize="0px";
		style.backgroundColor=config.barColor?config.barColor:"#CE170F";
		style.left="2px";
		style.height="3px";
		style.width="100%";
		this.containerDiv.appendChild(bar);
		this.barDiv=bar;

		this.containerDiv.appendChild(this.content);
		this.content.style.position="absolute";
		this.content.style.fontSize="12px";
		this.content.style.color="#333333";
		this.content.style.left="3px";
		
		if(window._LT_info_adsUrl)
		{
			var iframe=document.createElement("iframe");
			iframe.style.position="absolute";
			iframe.style.left="3px";
			iframe.height=51;
			iframe.width=200;
			iframe.src=window._LT_info_adsUrl+"w="+iframe.width+"&h="+iframe.height+"&url="+encodeURIComponent(location.href);
			iframe.frameBorder=0;
			iframe.scrolling="no";
			this.containerDiv.appendChild(iframe);
			this.adsFrm=iframe;
		}
		
		//关闭按钮
		var img=new Image(8,8);
		img.src=imgSrc+"iw_c.gif";
		img.style.position="absolute";
		img.style.top=(tabSize[1]+6)+"px";
		img.style.right=tabSize[0]+2+"px";
		LTFunction.setCursorStyle(img,"pointer");
		topDiv.appendChild(img);
		LTEvent.addListener(img,"mousedown",LTEvent.cancelBubble);
		LTEvent.bind(img,"click",this,this.closeInfoWindow);
		this.tabSize=tabSize;
		this.cursorSize=cursorSize;
	}
	LTInfoWindow.prototype.moveToShow=function(padding)
	{
		padding=padding?padding:5;
		var map=this.map;
		if(!map){return;}
		var mapSize=this.map.getViewSize();
		var winSize=this.asize;
		var point=map.slideObject?map.slideObject.toPoint:map.centerPoint;
		var position=this.map.getPixelCoord(this.getPoint(),point);
		var anchor=this.getAnchorPoint();
		var offset=this.offset;
		var left=position[0]+anchor[0]+offset[0];
		var top=position[1]+anchor[1]+offset[1];
		var right=mapSize[0]-position[0]-(winSize[0]+anchor[0])-offset[0];
		var bottom=mapSize[1]-position[1]-(winSize[1]+anchor[1])-offset[1];
		var p=[0,0];
		if(left*right<0)
		{
			p[0]+=Math.min(left,right)-padding;
			if(right<0){p[0]=-p[0]}
		}
		if(top*bottom<0)
		{
			p[1]+=Math.min(top,bottom)-padding;
			if(bottom<0){p[1]=-p[1]}
		}
		if(p[0]!=0 || p[1]!=0)
		{
			this.map.moveToCenter(this.map.getPointLatLng([mapSize[0]/2+p[0],mapSize[1]/2+p[1]],point));
		}
	}
	//获取infowin的锚点相对于div层左上角的位置
	LTInfoWindow.prototype.getAnchorPoint=function()
	{
		return [-this.asize[0]*this.cursorPer+this.cursorSize[0]-2,-this.asize[1]+2];
	}
	//在信息浮窗大小或者内容发生变化的时候重新设置一些层的位置，可以用来做自适应大小的功能
	LTInfoWindow.prototype.changeInfoWin=function()
	{
		var tabSize=this.tabSize;
		var cursorSize=this.cursorSize;
		var titleHeight=this.title.offsetHeight;
		var asize=[Math.max(this.content.offsetWidth,this.size[0])+tabSize[0]*2+3,Math.max(this.content.offsetHeight,this.size[1])+tabSize[1]*2+(cursorSize[1]-1)+titleHeight+15+(this.adsFrm?parseInt(this.adsFrm.height)+5:0)];
		this.div.style.width=asize[0]+"px";
		this.div.style.height=asize[1]+"px";
		this.topDiv.style.width=asize[0]-tabSize[0]*2+"px";
		this.leftDiv.style.height=asize[1]-tabSize[1]*2-(cursorSize[1]-1)+"px";
		this.bottomDiv.style.top=(asize[1]-this.cursorSize[1]-tabSize[1]+1)+"px";
		this.bottomDiv.style.width=asize[0]-tabSize[0]*2+"px";
		this.rightDiv.style.height=asize[1]-tabSize[1]*2-(cursorSize[1]-1)+"px";
		this.containerDiv.style.width=asize[0]-tabSize[0]*2+"px";
		this.containerDiv.style.height=asize[1]-tabSize[1]*2-(cursorSize[1]-1)+"px";
		this.content.style.top=titleHeight+15+"px";
		this.barDiv.style.top=titleHeight+5+"px";
		this.title.style.width=asize[0]-tabSize[0]*2-20+"px";
		this.cursor.style.top=(asize[1]-this.cursorSize[1])+"px";
		this.cursor.style.right=(asize[0]*(1-this.cursorPer))+"px";
		this.arcImgs[2].style.top=(asize[1]-this.cursorSize[1]-tabSize[1])+"px";
		this.arcImgs[3].style.top=(asize[1]-this.cursorSize[1]-tabSize[1])+"px";
		
		if(this.adsFrm)
		{
			this.adsFrm.style.top=(titleHeight+15+this.content.offsetHeight+5)+"px";
	//		this.adsFrm.width=asize[0]-tabSize[0]*2-20;
	//		this.adsFrm.src=window._LT_info_adsUrl+"w="+this.adsFrm.width+"&h="+this.adsFrm.height+"&url="+encodeURIComponent(location.href);
		}
			
		this.asize=asize;
		for(var i=0;i<this.content.childNodes.length;i++)
		{
			var child=this.content.childNodes[i];
			if(child.width || (child.style && child.style.width))
			{
				var w=child.width?child.width.toString():child.style.width;
				if(w && w.indexOf("%")==w.length-1)
				{
					child.style.width=(this.size[0])*parseInt(w)/100+"px";
				}
			}
			if(child.height || (child.style && child.style.height))
			{
				var h=child.height?child.height.toString():child.style.height;
				if(h && h.indexOf("%")==h.length-1)
				{
					child.style.height=(this.size[1])*parseInt(h)/100+"px";
				}
			}
		}
	}
	LTInfoWindow.prototype.setSize=function(size)
	{
		this.size=size;
		if(LTFunction.isInDocument(this.div)){this.reDraw(true);}
	}
	LTInfoWindow.prototype.initialize = function( map )
	{
		if(!this.div || this.map){return false;}
		this.map = map;
	}
	LTInfoWindow.prototype.getObject = function()
	{
		return this.div;
	}
	LTInfoWindow.prototype.remove = function()
	{
		this.map=null;
	}
	LTInfoWindow.prototype.depose = function()
	{
		LTEvent.deposeNode(this.div);
		this.div=null;
	}
	LTInfoWindow.prototype.reDraw = function(booleans)
	{
		if(!booleans || !this.map){return;}
		var position = this.map.getOverLayPosition( this.point );//
		if( position[2])
		{//点在可视范围内
			if(!LTFunction.isInDocument(this.div))
			{//如果不存在
				this.map.overlaysDiv.appendChild( this.div );
			}
			this.changeInfoWin();
			var anchor=this.getAnchorPoint();
			if( this.anchorObj  && this.anchorObj.map)
			{
				var size=this.anchorObj.focusSize;
				if(!size){size=this.anchorObj.getSize();}
				var ach=this.anchorObj.getAnchor();
				this.offset=[-ach[0]+size[0]*this.markerOffset[0],-ach[1]+size[1]*this.markerOffset[1]];
			}
			anchor[0]+=this.offset[0];
			anchor[1]+=this.offset[1];
			LTFunction.setPosition(this.div,[position[0]+anchor[0],position[1]+anchor[1]]);
		}
		else
		{//点不在可视范围内
			if(LTFunction.isInDocument(this.div))
			{//如果标点已经存在
				this.div.parentNode.removeChild( this.div );
			}
		}
	}
	LTInfoWindow.prototype.setLabel =function(label)
	{
		while(this.content.firstChild)
		{
			this.content.removeChild(this.content.firstChild);
		}
		if(typeof(label)=="object")
		{
			this.content.appendChild( label );
		}
		else
		{
			this.content.innerHTML=label;
		}
		if(this.created){this.changeInfoWin();}
		if(LTFunction.isInDocument(this.div)){this.reDraw(true);}
	}
	LTInfoWindow.prototype.setTitle = function(label)
	{
		this.title.innerHTML ="";
		if(typeof(label)=="object")
		{
			this.title.appendChild(label);
		}
		else
		{
			var span=document.createElement("span");
			span.innerHTML=label;
			this.title.appendChild(span);
		}
		if(this.created){this.changeInfoWin();}
		if(LTFunction.isInDocument(this.div)){this.reDraw(true);}
	}
	LTInfoWindow.prototype.closeInfoWindow=function()
	{
		if(!this.map){return;}
		LTEvent.trigger(this,"close",[]);
		this.map.removeOverLay( this );
	}
	LTInfoWindow.prototype.setWidth=function( w )
	{
		this.size[0] =parseInt(w);
		if(LTFunction.isInDocument(this.div)){this.reDraw(true);}
	}
	LTInfoWindow.prototype.setHeight = function( h )
	{
		this.size[1] =parseInt(h);
		if(LTFunction.isInDocument(this.div)){this.reDraw(true);}
	}
	LTInfoWindow.prototype.setPoint = function( obj,offset)
	{
		if(obj.getPoint)
		{
			this.point=obj.getPoint();
			this.anchorObj=obj;
		}
		else
		{
			this.point = obj;
			this.anchorObj=null;
		}
		this.offset=offset?offset:[0,0];
		this.reDraw( true);
	}
	LTInfoWindow.prototype.getPoint = function()
	{
		return this.point?this.point:this.anchorObj.getPoint();
	}
	LTInfoWindow.prototype.closeInfoWindowWithMouse = function()
	{
		if(!this.mouseMoveListener){this.mouseMoveListener=LTEvent.bind(document,"mousemove",this,this.onMouseMove);}
	}
	LTInfoWindow.prototype.onMouseMove=function(e)
	{
		if(!LTFunction.isInDocument(this.div))
		{
			return;
		}
		var mouse = LTFunction.getEventPosition(e,this.map.container);
		var position = LTFunction.getPageOffset(this.div );
		var container = LTFunction.getPageOffset(this.map.container );
		position = [position[0]-container[0],position[1]-container[1]];
		if(this.point.icon )
		{//如果是marker
			var markerSize=this.point.icon.getSize();
			if(mouse[0]<position[0]-markerSize[0] || mouse[0]>position[0]+this.asize[0]+markerSize[0] || mouse[1]<position[1]- markerSize[1] || mouse[1]>position[1]+this.asize[1] + markerSize[1] )
			{
				this.closeInfoWindow();
			}
		}
		else if( this.point.getLatitude )
		{//如果是point
			if( mouse[0]<position[0] || mouse[0]>position[0]+this.asize[0] || mouse[1]<position[1] || mouse[1]>position[1]+this.asize[1]+this.asize[1])
			{
				this.closeInfoWindow();
			}
		}
	}
	LTInfoWindow.prototype.disableCloseInfoWindowWithMouse= function()
	{
		LTEvent.removeListener(this.mouseMoveListener);
		this.mouseMoveListener=null;
	}
	window.LTInfoWindow = LTInfoWindow;
}
LTMapNS();