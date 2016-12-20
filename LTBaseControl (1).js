//本文件是JS API之中的LTZoomInControl类，是地图的标准导航控件
//每个控件应该有initialize，getObject,depose三个方法
function LTMapNS()
{
	function LTBaseControl(){}
	LTBaseControl.setLeft=function(length)
	{
		this.getObject().style.left=LTFunction.getUserInput(length);
	}
	LTBaseControl.setRight=function(length)
	{
		this.getObject().style.left="auto";
		this.getObject().style.right=LTFunction.getUserInput(length);
	}
	LTBaseControl.setTop=function(length)
	{
		this.getObject().style.top=LTFunction.getUserInput(length);
	}
	LTBaseControl.setBottom=function(length)
	{
		this.getObject().style.top="auto";
		this.getObject().style.bottom=LTFunction.getUserInput(length);
	}
	LTBaseControl.setVisible = function(booleans)
	{
		this.getObject().style.visibility =booleans?"visible":"hidden";
	}
	LTBaseControl.setOpacity=function(opacity)
	{
		LTFunction.setOpacity(this.getObject(),opacity);
	}
	window.LTBaseControl=LTBaseControl;
}
LTMapNS();