//本文件是JS API之中的LTPlaceList对象，用来管理一个树形的地名列表，该地名列表通过配置文件传递
function LTNS()
{
	function LTPlaceList(data,url)
	{
		this.data=data?data:window._LT_pld_data;
		this.root=new LTPlace(this.data,this);
	}
	LTPlaceList.getDefault=function()
	{
		if(window._LT_placelist)
		{
			return window._LT_placelist;
		}
		if(!LTPlaceList.defaultList)
		{
			LTPlaceList.defaultList=new LTPlaceList(window._LT_pld_data);
		}
		return LTPlaceList.defaultList;
	}
	LTPlaceList.prototype.getPoint=function(point)
	{
		if(typeof(point)!="object")
		{
			var places=this.searchPlace(point,1);
			if(places.length>0)
			{
				point=places[0].getPoint();
			}
			else
			{
				alert("51ditu Maps API Error:"+"place '"+point+"' not find");
				return null;
			}
		}
		return point;
	}
	LTPlaceList.prototype.getRootPlace=function()
	{
		return this.root;
	}
	LTPlaceList.getSearchFunction=function(word)
	{
		return function(place)
		{
			var att=place.node.a;
			if(att.p && att.p.toLowerCase()==word.toLowerCase()){return true;}
			if(att.t && (att.t==word || "0"+att.t==word)){return true;}
			if(att.r && (att.r==word)){return true;}
			if(word.indexOf(place.getName())==0){return true;}
			return false;
		}
	}
	LTPlaceList.prototype.searchPlace=function(word,num,node,handle)
	{
		if(word.indexOf("-")>0)
		{
			var words=word.split("-");
			var rootNode=null;
			for(var i=0;i<words.length;i++)
			{
				word=words[i];
				if(word.length<=0){continue;}
				var func,wordFunc=LTPlaceList.getSearchFunction(word);
				if(handle)
				{
					func=function(place){return wordFunc(place) && handle(place);}
				}
				else
				{
					func=wordFunc;
				}
				var nodes=this.search(func,1,rootNode);
				if(nodes.length==0){return []}
				rootNode=nodes[0];
			}
			return [rootNode];
		}
		var func,wordFunc=LTPlaceList.getSearchFunction(word);
		if(handle)
		{
			func=function(place){return wordFunc(place) && handle(place);}
		}
		else
		{
			func=wordFunc;
		}
		return this.search(func,num,node);
	}
	LTPlaceList.prototype.searchHandle=function(place,func,num,grade,array)
	{
		var args={};
		if(func(place,args))
		{
			array.push(place);
		}
		if(num>0 && array.length>=num){return;}
		if(args.ignoreChild){return;}
		if(grade>0 && place.grade>=grade){return;}
		for(var i=0;i<place.children.length;i++)
		{
			this.searchHandle(place.children[i],func,num,grade,array);
			if(num>0 && array.length>=num){return;}
		}
	}
	LTPlaceList.prototype.search=function(func,num,node,grade)
	{
		num=num?num:0;
		grade=grade?grade:0;
		var places=[];
		this.searchHandle(node?node:this.root,func,num,grade,places);
		return places;
	}
	LTPlaceList.prototype.getNearestPlace=function(point,func)
	{
		var places=LTPlaceList.getDefault().search(func);
		var minDis=Number.MAX_VALUE;
		var place;
		for(var i=places.length-1;i>=0;i--)
		{
			var p=places[i].getPoint();
			var dis=Math.sqrt(Math.pow(point.getLongitude()-p.getLongitude(),2)+Math.pow(point.getLatitude()-p.getLatitude(),2));
			if(dis<minDis && (!place || places[i].getParent()!=place))
			{
				place=places[i];
				minDis=dis;
			}
		}
		return place;
	}
	//用来代表一个简单的地名
	//.a.c	子地名的数目
	//.a.g	类型
	//.a.l	经纬度和缩放等级
	//.a.n	名称
	//.a.p	拼音
	//.a.s	对搜索的支持
	//.a.t	电话
	//.a.r	行政区划代码
	function LTPlace(node,list,parent)
	{
		this.node=node;
		this.placeList=list;
		this.parent=parent;
		this.grade=parent?parent.grade+1:0;
		this.loadChildren(node);
		this.isEncrypt=!(new RegExp("[^\\x00-\\xff]").test(node.a.n));
		this.loaded=!(this.node.a.c && this.node.a.c>this.children.length);
	}
	LTPlace.prototype.loadChildren=function(node)
	{
		this.children=[];
		if(node.c)
		{
			for(var i=0;i<node.c.length;i++)
			{
				this.children.push(new LTPlace(node.c[i],this.placeList,this));
			}
		}
	}
	LTPlace.prototype.getName=function()
	{
		var name=this.node.a.n;
		return name?(this.isEncrypt?LTObjectLoader.decrypt(name):name):"";
	}
	LTPlace.prototype.getParent=function()
	{
		return this.parent;
	}
	LTPlace.prototype.getPinyin=function()
	{
		return this.node.a.p?this.node.a.p.toLowerCase():null;
	}
	LTPlace.prototype.getTelCode=function()
	{
		return this.node.a.t?this.node.a.t:null;
	}
	LTPlace.prototype.getRegionCode=function()
	{
		return this.node.a.r?this.node.a.r:null;
	}
	LTPlace.prototype.hasChildren=function()
	{
		return (this.children.length>0 || !this.loaded);
	}
	LTPlace.prototype.getChildren=function()
	{
		return this.children;
	}
	LTPlace.prototype.getPoint=function()
	{
		var ll=this.node.a.l;
		if(!ll){return null;}
		ll=ll.split(",");
		return new LTPoint(ll[0],ll[1]);
	}
	LTPlace.prototype.getZoom=function()
	{
		var ll=this.node.a.l;
		if(!ll){return null;}
		ll=ll.split(",");
		return ll[2];
	}
	LTPlace.prototype.getType=function()
	{
		return this.node.a.g;
	}
	LTPlace.prototype.canLocalSearch=function()
	{
		var s=this.node.a.s;
		if(!s){return "none";}
		s=s%4;
		return (s==3)?"self":((s==2)?"parent":((s==1)?"child":"none"));
	}
	LTPlace.prototype.canBusSearch=function()
	{
		var s=this.node.a.s;
		if(!s){return "none";}
		s=parseInt((s%16)/4);
		return (s==3)?"self":((s==2)?"parent":((s==1)?"child":"none"));
	}
	window.LTPlaceList=LTPlaceList;
	window.LTPlace=LTPlace;
}
LTNS();