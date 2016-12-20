//本文件是JS API之中的LTProgressControl类，用来在地图上显示一个进度条
//每个控件应该有initialize，getObject,depose三个方法
	function LTProgressControl()
	{
		LTFunction.inherit(this,LTBaseControl);
		this.size=[150,40];
		var div=LTFunction.createDiv(1);
		LTFunction.setSize(div,this.size);
		var text=LTFunction.createDiv(0);
		LTFunction.setSize(text,["100%",30]);
		var style=text.style;
		style.fontSize="12px";
		style.fontWeight="bolder";
		style.color="#D01E14";
		style.verticalAlign ="bottom";
		text.align="center";
		div.appendChild(text);
		var back=LTFunction.createDiv(0);
		LTFunction.setSize(back,["100%",10]);
		var style=back.style;
		style.border="solid 1px #D01E14";
		style.fontSize="0px";
		div.appendChild(back);
		var bar=LTFunction.createDiv(1);
		LTFunction.setSize(bar,[0,10]);
		var style=bar.style;
		style.fontSize="0px";
		style.left="0px";
		style.backgroundColor="#D01E14";
		back.appendChild(bar);
		this.bar=bar;
		this.div=div;
		this.text=text;
		this.label=window._LT_pgc_labelPre?window._LT_pgc_labelPre:"地图加载中";
	}
	LTProgressControl.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		this.mrl=LTEvent.bind(map,"resize",this,this.setCenter);
		this.mil=LTEvent.bind(map,"init",this,this.setProgress);
		this.micl=LTEvent.bind(map,"imagechange",this,this.setProgress);
		this.setCenter();
	}
	LTProgressControl.prototype.setLabel=function(label)
	{
		this.text.innerHTML=label;
	}
	LTProgressControl.prototype.setProgress=function(p)
	{
		//在地图没加载以前this.map.getTotalImgNumber()是等于0的
		var totalImgNum = this.map.getTotalImgNumber()==0?Number.MAX_VALUE:this.map.getTotalImgNumber();
		var p=this.map.getImgNumber()/totalImgNum;
		if(p>1){p=1;}
		if(p<0){p=0;}
		this.setOpacity(1-p);
		if(p>0.8 && this.div.style.display!='none'){this.div.style.display='none';}
		if(p<0.5 && this.div.style.display=='none'){this.div.style.display='';}
		this.setLabel(this.label+parseInt(100*p)+"%");
		this.bar.style.width=this.size[0]*p+"px";
	}
	LTProgressControl.prototype.setCenter=function()
	{
		var mapSize=this.map.getViewSize();
		this.setLeft(mapSize[0]/2-this.size[0]/2);
		this.setTop(mapSize[1]*3/5-this.size[1]/2);
	}
	LTProgressControl.prototype.getObject=function()
	{
		return this.div;
	}
	LTProgressControl.prototype.remove=function()
	{
		LTEvent.removeListener(this.mrl);
		this.mrl=null;
		LTEvent.removeListener(this.mil);
		this.mil=null;
		LTEvent.removeListener(this.micl);
		this.micl=null;

	}
	LTProgressControl.prototype.depose=function()
	{
		LTEvent.deposeNode(this.div);
		this.div=null;
	}
	window.LTProgressControl=LTProgressControl;
