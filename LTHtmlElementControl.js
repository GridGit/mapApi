//本文件是JS API之中的LTHtmlElementControl类，用来将一个HTML控件以控件模式添加到地图
//每个控件应该有initialize，getObject,depose三个方法
	function LTHtmlElementControl(div)
	{
		LTFunction.inherit(this,LTBaseControl);
		this.div=(typeof(div)=="object")?div:document.getElementById(div);
		this.div._control=this;
		if(this.div.parentNode){this.div.parentNode.removeChild(this.div);}
		this.div.style.position = "absolute";
		LTEvent.addListener(this.div,"mousedown",LTEvent.returnTrue);//指定控件层的mousedown事件返回true
		LTEvent.addListener(this.div,"selectstart",LTEvent.returnTrue);//指定控件层的mousedown事件返回true
		LTEvent.addListener(this.div,"click",LTEvent.returnTrue);//指定控件层的mousedown事件返回true
	}
	LTHtmlElementControl.prototype.initialize=function(map)
	{
		this.map=map;
	}
	LTHtmlElementControl.prototype.getObject=function()
	{
		return this.div;
	}
	LTHtmlElementControl.prototype.remove=function()
	{
		this.map=null;
	}
	LTHtmlElementControl.prototype.depose=function()
	{
		this.div._control=null;
		LTEvent.deposeNode(this.div);
		this.div=null;
	}
	window.LTHtmlElementControl=LTHtmlElementControl;
