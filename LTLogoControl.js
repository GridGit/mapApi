//本文件是JS API之中的LTHtmlElementControl类，用来将一个HTML控件以控件模式添加到地图
//每个控件应该有initialize，getObject,depose三个方法
	function LTLogoControl(html,config)
	{
		var div=LTFunction.createDiv(1,null,65535);
		var style=div.style;
		style.position = "absolute";
		config=config?config:[];
		this.config=config;
		//this.defaultLink=config.defaultLink?config.defaultLink:{text:"",url:""}
		var position=config[0].position?config[0].position:[0,1];
		style[position[0]==0?"left":"right"]="0px";
		style[position[1]==1?"bottom":"top"]="0px";
		//config.bgcolor=config.bgcolor?config.bgcolor:"#FFFF33";
		style.backgroundColor = "#FFFF33";//config.bgcolor;
		div.innerHTML=html;
		//if(config.showText)
		//{
			//this.clearTextLinks();
			var textLink=document.createElement("a");
			textLink.target="_blank";
			textLink.style.marginLeft="5px";
			textLink.style.fontSize="12px";
			textLink.style.textDecoration="none";
			textLink.style.color="#FF3300";
			div.appendChild(textLink);
			
			textLink.innerHTML=config[0].defaultLink.text;
			textLink.href=config[0].defaultLink.url;
				
			//window.setInterval("this.changeValue()",2000);
			window.setInterval(LTEvent.getCallback(this,this.changeValue),5000)
		   // alert(textLink.innerHTML);
			this.textLink=textLink;
			//this.setTextLink();
		/*
			var select=document.createElement("select");
			select.multiple=true;
			select.size=1;
			select.selectedIndex=-1;
			LTEvent.addListener(select,"click",function(){this.selectedIndex=-1;});
			select.style.position="absolute";
			select.style.top="-2px";
			select.style.backgroundColor=config.bgcolor;
			select.style.clip="rect(3,200,20,3)";
			LTFunction.setUnSelectable(select);
			div.appendChild(select);
			var option=new Option(config.defaultText);
			option.style.cursor="pointer";
			select.add(option);
		*/
		//}
		LTEvent.addListener(div,"mousedown",LTEvent.returnTrue);//指定控件层的mousedown事件返回true
		LTEvent.addListener(div,"selectstart",LTEvent.returnTrue);//指定控件层的mousedown事件返回true
		LTEvent.addListener(div,"click",LTEvent.returnTrue);//指定控件层的mousedown事件返回true
		this.div=div;
	}
	
	LTLogoControl.prototype.changeValue=function()
	{
	if(this.textLink.innerHTML==this.config[0].defaultLink.text){
			this.textLink.innerHTML=this.config[1].defaultLink.text;
			this.textLink.href=this.config[1].defaultLink.url;
		}else if(this.textLink.innerHTML==this.config[1].defaultLink.text){
			this.textLink.innerHTML=this.config[2].defaultLink.text;
			this.textLink.href=this.config[2].defaultLink.url;
		}else{
			this.textLink.innerHTML=this.config[0].defaultLink.text;
			this.textLink.href=this.config[0].defaultLink.url;
		}
		
		
	}
	//清除所有的文字连接
	LTLogoControl.prototype.clearTextLinks=function()
	{
		this.textLinks=[];
		this.setTextLink();
	}
	LTLogoControl.prototype.setTextLink=function(link)
	{
		if(!this.textLink || (this.currentLink && link==this.currentLink)){return;}
		if(this.timeout)
		{
			window.clearTimeout(this.timeout);
		}
		if(link)
		{
			link.lastShow=new Date().valueOf();
			this.textLinks.sort(function(a,b){return b.lastShow-a.lastShow});
		}
		else
		{
			link=this.defaultLink;
		}
		this.textLink.innerHTML=link.text;
		this.textLink.href=link.url;
		this.currentLink=link;
		if(link.times)
		{
			this.timeout=window.setTimeout(LTEvent.getCallback(this,this.showNextLink),link.times);
		}
	}
	LTLogoControl.prototype.addTextLink=function(textLink)
	{
		for(var i=0;i<this.textLinks.length;i++)
		{
			if(this.textLinks[i].url==textLink.url){return;};
		}
		textLink.lastShow=0;
		this.textLinks.push(textLink);
		if(this.currentLink==this.defaultLink)
		{
			if(textLink.bounds && !textLink.bounds.containsPoint(this.map.getCenterPoint())){return;}
			this.setTextLink(textLink);
		}
	}
	LTLogoControl.prototype.showNextLink=function()
	{
		var flag=false;
		for(var i=this.textLinks.length-1;i>=0;i--)
		{
			if(this.textLinks[i]!=this.currentLink)
			{
				this.setTextLink(this.textLinks[i]);
				flag=true;
				break;
			}
		}
		if(!flag)
		{
			this.setTextLink();
		}
	}
	LTLogoControl.prototype.initialize=function(map)
	{
		this.map=map;
	}
	LTLogoControl.prototype.getObject=function()
	{
		return this.div;
	}
	window.LTLogoControl=LTLogoControl;
//另一种实现的模式
//"<a href='http://www.51ditu.com' target='_blank' style='font-size:12px;text-decoration:none;color:blue;'>&copy;51ditu.com</a><iframe ALLOWTRANSPARENCY='true' title='<body onselectstart=\"return false\" UNSELECTABLE=\"true\" style=\"padding:0px;margin:0px;text-align:center;BACKGROUND-COLOR:transparent;-moz-user-select:none;padding-top:5px;\" NOWRAP=\"true\" align=\"center\"><a href=\"http://emap.51ditu.com/publish/api/mapszxj/click.html\" target=\"_blank\" style=\"margin-left:5px;font-size:12px;text-decoration:none;color:#FF3300;\">51ditu有奖用户调查！</a></body>' style='width:125px;height:18px;' frameBorder='0' scrolling='no' onload='if(!this.loaded){this.loaded=true;this.parentNode._control.map._textAdsFrame=this;var doc=this.contentWindow.document;doc.open();doc.write(this.title);doc.close();}' src='about:blank'></iframe>"