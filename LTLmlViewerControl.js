function LTNS()
{
	//�����Զ�����Զ��LML�ļ���ʾ����ͼ�ϵĶ���
	function LTLmlViewerControl(url,config)
	{
		config=config?config:{};
		this.config=config;
		this.isSuper=config.isSuper;//����ǳ����ر꣬����ڵ�ͼ�ƶ�֮���Զ���������
		this.loadDelay=config.loadDelay?config.loadDelay:1000;
		this.keepOverlays=config.keepOverlays;//�����ֵΪtrue,����clearOverlays��ʱ������Щ��ע
		this.url=url;
		this.markers=[];
		this.units=10000;
		this.timeout=null;
	}
	//�ؼ���ʼ��
	LTLmlViewerControl.prototype.initialize=function(map)
	{
		this.map=map;
		if(this.isSuper)
		{
			if(!this.mzl)
			{
				this.mzl=LTEvent.bind(map,"zoom",this,this.onMapZoom);
			}
			this.onMapZoom();
		}
		else
		{
			this.delayLoad();
		}
	}
	//�����ŵȼ��仯ʱ����
	LTLmlViewerControl.prototype.onMapZoom=function()
	{
		this.bufferBounds=null;
		var inuse=true;
		var zoom=this.map.getCurrentZoom();
		if(typeof(zoom)!="number"){return;}
		if(typeof(this.config.maxZoom)=="number" && this.config.maxZoom<zoom){inuse=false;}
		if(typeof(this.config.minZoom)=="number" && this.config.minZoom>zoom){inuse=false;}
		if(inuse)
		{
			if(!this.mml)
			{
				this.mml=LTEvent.bind(this.map,"moveend",this,this.delayLoad);
			}
			this.delayLoad();
		}
		else
		{
			this.clear();
			LTEvent.removeListener(this.mml);
		}
	}
	//����һ��ʱ��֮��ʼ����LML����
	LTLmlViewerControl.prototype.delayLoad=function()
	{
		if(this.timeout)
		{
			window.clearTimeout(this.timeout);
		}
		this.timeout=setTimeout(LTEvent.getCallback(this,this.loadUrl),this.loadDelay);
	}
	//����ָ��URL��LML�ļ�
	LTLmlViewerControl.prototype.loadUrl=function(url)
	{
		var url=url?url:this.url;
		if(!url){return;}
		if(this.isSuper)
		{
			if(!this.map.loaded){return;}
			if(this.bufferBounds && this.bufferBounds.containsBounds(this.map.getBoundsLatLng())){return;}
			var params=[];
			var bounds=this.map.getDrawBounds();
			this.bufferBounds=bounds;
			params.push("bounds="+bounds.getXmin()/100000+","+bounds.getYmin()/100000+","+bounds.getXmax()/100000+","+bounds.getYmax()/100000);
			params.push("scale="+parseInt(3779*this.map.getZoomUnits(this.map.getCurrentZoom())));
			url+=params.join("&");
		}
		if(!this.loader)
		{
			this.loader=new LTObjectLoader();
			LTEvent.bind(this.loader,"loaded",this,this.onLmlLoaded);
		}
		this.loader.load(url,this.config.charset?this.config.charset:"gb2312");
	}
	//��LML�������֮���ȡ����
	LTLmlViewerControl.prototype.onLmlLoaded=function(obj)
	{
		var lml=LTAjax.toXml(obj);
 		this.loadLml(lml);
	}
	LTLmlViewerControl.prototype.loadLml=function(lml)
	{
		if(!lml || !lml.documentElement){return;}
		if(!this.triggerEvent("lmlloaded",[lml])){return;}//�����LML���ػ������κδ���
		this.clear();
		this.readLmlFolder(lml.documentElement);
		this.triggerEvent("lmlcomplete",[lml]);
	}
	//��ȡFolder�ڵ�(���ڵ�lmlҲ����Ϊ��һ��Folder�ڵ�)
	LTLmlViewerControl.prototype.readLmlFolder=function(node)
	{
		if(!this.triggerEvent("folderread",[node])){return;}
		for(var child=node.firstChild;child!=null;child=child.nextSibling)
		{
			switch(child.nodeName)
			{
				case "Placemark":
					this.readLmlPlacemark(child);
					break;
				case "Folder":
					this.readLmlFolder(child);
					break;
			}
		}
	}
	LTLmlViewerControl.prototype.readLmlPlacemark=function(node)
	{
		if(!this.triggerEvent("placemarkread",[node])){return;}
		var markerInfo={extension:{}};
		for(var child=node.firstChild;child;child=child.nextSibling)
		{
			switch(child.nodeName)
			{
				case "Point":
					var coord=LTAjax.getNodeValue(child.firstChild).split(",");
					markerInfo.point=new LTPoint(coord[0]*100000,coord[1]*100000);
					break;
				case "Style":
					style=child;
					break;
				case "styleUrl":
					if(LTAjax.getNodeValue(child).indexOf("#")==0)
					{
						var id=LTAjax.getNodeValue(child).substring(1);
						var newStyle=document.getElementById(id);
						if(newStyle)
						{
							markerInfo.style=newStyle;
						}
					}
					break;
				case "extension":
					markerInfo.extension[child.getAttribute("keyword")]=LTAjax.getNodeValue(child);
					break;
				default:
					markerInfo[child.nodeName]=LTAjax.getNodeValue(child);
			}
		}
		if(markerInfo.style)
		{
			var iconStyle=null;
			for(var child=markerInfo.style.firstChild;child;child=child.nextSibling)
			{
				if(child.nodeName=="IconStyle")
				{
					iconStyle=child;
					break;
				}
			}
			if(iconStyle)
			{
				var iconNode=null;
				for(var child=iconStyle.firstChild;child;child=child.nextSibling)
				{
					if(child.nodeName=="Icon")
					{
						iconNode=child;
						break;
					}
				}
				if(iconNode)
				{
					var href=null;
					for(var child=iconNode.firstChild;child;child=child.nextSibling)
					{
						if(child.nodeName=="href")
						{
							href=child;
							break;
						}
					}
					if(href)
					{
						var href,width,height;
						for(var child=href.firstChild;child;child=child.nextSibling)
						{
							switch(child.nodeName)
							{
								case "w":
									width=LTAjax.getNodeValue(child);
									break;
								case "h":
									height=LTAjax.getNodeValue(child);
									break;
							}
						}
						var size=(width && height)?[width,height]:[0,0];
						markerInfo.icon=new LTIcon(href,size,[Math.ceil(size[0]/2),Math.ceil(size[1]/2)]);
					}
				}
			}
		}
		if(!markerInfo.icon && window._LT_lml_defaultIcon)
		{
			var ic=window._LT_lml_defaultIcon;
			markerInfo.icon=new LTIcon(ic.url,ic.size,ic.anchor);
		}
		var marker=this.showPlacemark(markerInfo);
		if(marker)
		{
			this.map.addOverLay(marker,this.keepOverlays);
			this.markers.push(marker);
		}
	}
	LTLmlViewerControl.prototype.showPlacemark=function(markerInfo)
	{
		var marker=new LTMarker(markerInfo.point,markerInfo.icon);
		marker._lmlInfo=markerInfo;
		LTEvent.bind(marker,"click",this,this.onMarkerClick(marker));
		return marker;
	}
	LTLmlViewerControl.prototype.getPlacemarkNumber=function()
	{
		return this.markers.length;
	}
	//���ɸ�LML��ǵ���Ϣ������ʾHTML����
	LTLmlViewerControl.prototype.getInfoContent=function(marker)
	{
		var html="";
		var info=marker._lmlInfo;
		html+='<table><tr><td align="left" valign="top">'
		if(info.url){html+='<div><a style="padding:-top:3px;font-size:12px;color:blue" href="'+info.url+'" target="_blank">'+info.url+'</a></div>';}
		if(info.address){html+='<div style="padding-top:3px;font-size:12px;">'+info.address+'</div>';}
		if(info.tel){html+='<div style="padding-top:3px;font-size:12px;width:140px;">�绰��'+info.tel+'</div>';}
		html+='</td><td>';
		var photo=info.photo?info.photo:info.extension.photo;
		if(photo){html+='<img width="100" src="'+photo+'"/>';}
		html+='</td></tr></table>';
		return html
	}
	//���ض��ı�Ǳ���� ʱ��ִ�еĲ���
	LTLmlViewerControl.prototype.onMarkerClick=function(marker)
	{
		return function()
		{
			var infowin=marker.openInfoWinHtml(this.getInfoContent(marker));
			var img=infowin.content.firstChild.rows[0].cells[1].firstChild;
			if(img)
			{
				LTEvent.bind(img,"resize",infowin,function(){infowin.reDraw(true)},true);
			}
			infowin.setTitle(marker._lmlInfo.name);
		}
	}
	///�����¼�������¼��ķ���ֵ
	LTLmlViewerControl.prototype.triggerEvent=function(eventName,argu)
	{
		var eventObj={returnValue:true};
		argu=argu?argu:[];
		argu.push(eventObj);
		LTEvent.trigger(this,eventName,argu);
		return eventObj.returnValue;
	}
	//�����������
	LTLmlViewerControl.prototype.clear=function()
	{
		if(this.timeout)
		{
			window.clearTimeout(this.timeout);
		}
		if(this.loader)
		{
			this.loader=new LTObjectLoader();
			LTEvent.clearListeners(this.loader);
			this.loader=null;
		}
		var marker;
		while(marker=this.markers.pop())
		{
			this.map.removeOverLay(marker,true);
		}
	}
	LTLmlViewerControl.prototype.getObject=function()
	{
		return this.div;
	}
	LTLmlViewerControl.prototype.remove=function()
	{
		this.clear();
		LTEvent.removeListener(this.mml);
		LTEvent.removeListener(this.mzl);
		this.map=null;
	}
	LTLmlViewerControl.prototype.depose=function()
	{
	}
	window.LTLmlViewerControl=LTLmlViewerControl;
}
LTNS();