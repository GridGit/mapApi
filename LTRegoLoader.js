
///��JS�ļ��ǻ�ȡ�������Ϣ����
///������ҪLTEvent��֧��
function LTNS()
{
	//����һ��LTObjectLoader���󣬸ö�����������JS��ʽ���������
	//����win����Ҫ���صĴ��ڶ���
	function LTRegoLoader(win)
	{
		this.win=win?win:window;
		this.loader=new LTObjectLoader(this.win);
		this.url=window._LT_map_Rego?window._LT_map_Rego:"http://rgc.vip.51ditu.com/rgc?pos=";
		LTEvent.bind(this.loader,"loaded",this,this.onLoad);
		LTEvent.bind(this.loader,"error",this,this.onError);
	}
	
	//����������Ϣ
	LTRegoLoader.prototype.loadRego=function(point){
		var url=this.url+point[0]+","+point[1]+"&type=0";
		LTAjax.loadRemoteXml(url,LTEvent.createAdapter(this,this.onLoad),"GB2312");
	}
	
	//������Ϣ
	LTRegoLoader.prototype.loadDescribe=function(point){
		var url=this.url+point[0]+","+point[1]+"&type=1";
		LTAjax.loadRemoteXml(url,LTEvent.createAdapter(this,this.onLoad),"GB2312");
	}
	
	LTRegoLoader.prototype.onLoad=function(obj){
		//��������
		var regoobj={};
		if(LTAjax.selectNodes(obj,"/ReverseGeocode/Area")[0]){
			regoobj.rego=LTAjax.getNodeValue(LTAjax.selectNodes(obj,"/ReverseGeocode/Area/@regionCode")[0]);
			regoobj.t=LTAjax.getNodeValue(LTAjax.selectNodes(obj,"/ReverseGeocode/Area")[0]);
			LTEvent.trigger(this,"loaded",[regoobj]);
		}else{
		//������Ϣ
			regoobj.describe=LTAjax.getNodeValue(LTAjax.selectNodes(obj,"/R/msg")[0]);
			LTEvent.trigger(this,"loaded",[regoobj]);
		}
	}
	
	LTRegoLoader.prototype.onError=function(){
		LTEvent.trigger(this,"error",[]);
	}
	
	window.LTRegoLoader=LTRegoLoader;
}
LTNS();