
///本JS文件是获取逆地理信息的类
///该类需要LTEvent的支持
function LTNS()
{
	//创建一个LTObjectLoader对象，该对象用来加载JS格式的类和数据
	//参数win是需要加载的窗口对象
	function LTRegoLoader(win)
	{
		this.win=win?win:window;
		this.loader=new LTObjectLoader(this.win);
		this.url=window._LT_map_Rego?window._LT_map_Rego:"http://rgc.vip.51ditu.com/rgc?pos=";
		LTEvent.bind(this.loader,"loaded",this,this.onLoad);
		LTEvent.bind(this.loader,"error",this,this.onError);
	}
	
	//行政区划信息
	LTRegoLoader.prototype.loadRego=function(point){
		var url=this.url+point[0]+","+point[1]+"&type=0";
		LTAjax.loadRemoteXml(url,LTEvent.createAdapter(this,this.onLoad),"GB2312");
	}
	
	//描述信息
	LTRegoLoader.prototype.loadDescribe=function(point){
		var url=this.url+point[0]+","+point[1]+"&type=1";
		LTAjax.loadRemoteXml(url,LTEvent.createAdapter(this,this.onLoad),"GB2312");
	}
	
	LTRegoLoader.prototype.onLoad=function(obj){
		//行政区划
		var regoobj={};
		if(LTAjax.selectNodes(obj,"/ReverseGeocode/Area")[0]){
			regoobj.rego=LTAjax.getNodeValue(LTAjax.selectNodes(obj,"/ReverseGeocode/Area/@regionCode")[0]);
			regoobj.t=LTAjax.getNodeValue(LTAjax.selectNodes(obj,"/ReverseGeocode/Area")[0]);
			LTEvent.trigger(this,"loaded",[regoobj]);
		}else{
		//描述信息
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