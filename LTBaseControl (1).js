//���ļ���JS API֮�е�LTZoomInControl�࣬�ǵ�ͼ�ı�׼�����ؼ�
//ÿ���ؼ�Ӧ����initialize��getObject,depose��������
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