//���ļ���JS API֮�е�LTHtmlElementControl�࣬������һ��HTML�ؼ��Կؼ�ģʽ��ӵ���ͼ
//ÿ���ؼ�Ӧ����initialize��getObject,depose��������
	function LTHtmlElementControl(div)
	{
		LTFunction.inherit(this,LTBaseControl);
		this.div=(typeof(div)=="object")?div:document.getElementById(div);
		this.div._control=this;
		if(this.div.parentNode){this.div.parentNode.removeChild(this.div);}
		this.div.style.position = "absolute";
		LTEvent.addListener(this.div,"mousedown",LTEvent.returnTrue);//ָ���ؼ����mousedown�¼�����true
		LTEvent.addListener(this.div,"selectstart",LTEvent.returnTrue);//ָ���ؼ����mousedown�¼�����true
		LTEvent.addListener(this.div,"click",LTEvent.returnTrue);//ָ���ؼ����mousedown�¼�����true
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
