////本文件是JS API之中的LTMapTile和LTMapTileMgr对象，用来处理地图上的分块图片
function LTMapNS()
{
	function LTMapTile(mgr,src,position,id)
	{
		this.mgr=mgr;
		this.name=mgr.getTileName(id);
		this.id=id;
		var img=document.createElement("img");
		LTFunction.setSize(img,[mgr.imgSize,mgr.imgSize]);
		LTFunction.setUnSelectable(img);
		img.style.position="absolute";
		img.galleryImg=false;
		LTFunction.setPosition(img,position);
		this.img=img;
		this.loadListener=LTEvent.bind(img,"load",this,this.onLoad);
		this.errorListener=LTEvent.bind(img,"error",this,this.onError);
		img.src=src;
	}
	LTMapTile.prototype.onLoad=function()
	{
		var mgr=this.mgr;
		this.stopLoad();
		var bufferImages=mgr.bufferImages;
		bufferImages[this.name]=this;
		bufferImages.push(this.name);
		var dNum=bufferImages.length-mgr.bufferNumber;
		for(var i=0;dNum>0&&i<bufferImages.length;i++)
		{
			var index=bufferImages[i];
			if(!mgr.mapImages[index])
			{
				if(bufferImages[index])
				{
					bufferImages[index].mgr=null;
					LTEvent.deposeNode(bufferImages[index].img);
					delete bufferImages[index];
				}
				bufferImages.splice(i,1);
				i--;
				dNum--;
			}
		}
		this.loaded=true;
		mgr.imgNumber++;
		if(!LTFunction.isInDocument(this.img))
		{
			mgr.getParentDiv(this.id).appendChild(this.img);
		}
		LTEvent.trigger(mgr.map,"imagechange",[this,1]);
	}
	LTMapTile.prototype.setPosition=function(position)
	{
		LTFunction.setPosition(this.img,position);
	}
	LTMapTile.prototype.stopLoad=function()
	{
		LTEvent.removeListener(this.loadListener);
		this.loadListener=null;
		LTEvent.removeListener(this.errorListener);
		this.errorListener=null;
	}
	LTMapTile.prototype.onError=function()
	{
		var map=this.mgr.map;
		this.stopLoad();
		this.error=true;
		this.mgr.imgErrorNumber++;
		if(map.errorImgUrl){this.img.src=map.errorImgUrl;}
		if(!LTFunction.isInDocument(this.img))
		{
			this.mgr.getParentDiv(this.id).appendChild(this.img);
		}
		LTEvent.trigger(map,"imageerror",[this]);
	}
	function LTMapTileMgr(map,imgSize,bufferNumber)
	{
		this.map=map;
		this.imgSize=imgSize;
		this.bufferNumber=bufferNumber;
		this.mapImages=[];
		this.bufferImages=[];
		this.imgNumber=0;
		this.imgErrorNumber=0;
	}
	LTMapTileMgr.prototype.getParentDiv=function(id)
	{
		return this.map["mapsDiv_"+id[2]];
	}
	LTMapTileMgr.prototype.getTileName=function(id)
	{
		return "IMG_"+id[0]+"_"+id[1]+"_"+id[2];
	}
	LTMapTileMgr.prototype.showTile=function(id,offset,flag)
	{
		var imageName=this.getTileName(id);
		var position=[(id[0]*this.imgSize)+parseInt(offset[0]),(-1-id[1])*this.imgSize+parseInt(offset[1])];
		var tile=this.mapImages[imageName];
		if(tile)
		{
			if(flag){LTFunction.setPosition(tile.img,position);}
			return;
		}
		tile=this.bufferImages[imageName];
		if(tile)
		{
			this.getParentDiv(id).appendChild(tile.img);
			this.mapImages[imageName]=tile;
			LTFunction.setPosition(tile.img,position);
			this.imgNumber++;
			LTEvent.trigger(this.map,"imagechange",[tile.img,2]);
			return;
		}
		else
		{
			//将zoom转换成0-13
			zoom=this.map.getZoomIndex(this.map.zoomLevels[id[2]]);
			
			tile=new LTMapTile(this,this.map.getMapImagesUrl(id[0],id[1],zoom),position,id);
			//tile=new LTMapTile(this,this.map.getMapImagesUrl(id[0],id[1],this.map.zoomLevels[id[2]]),position,id);
			this.mapImages[imageName]=tile;
		}
		if(!(LTBrowserInfo.isIE() || LTBrowserInfo.isFF()))
		{
			this.getParentDiv(id).appendChild(tile.img);
		}
	}
	LTMapTileMgr.prototype.hideTile=function(tile)
	{
		tile.stopLoad();
		var flag=false;
		if(LTFunction.isInDocument(tile.img))
		{
			if(tile.loaded)
			{
				this.imgNumber--;
				flag=true;
			}
			tile.img.parentNode.removeChild(tile.img);
		}
		if(tile.error){this.imgErrorNumber--;}
		LTEvent.trigger(this.map,"imagechange",[tile.img,3]);
		delete this.mapImages[tile.name];
		if(!flag)
		{
			LTEvent.deposeNode(tile.img);
			tile.mgr=null;
		}
	}
	window.LTMapTile=LTMapTile;
	window.LTMapTileMgr=LTMapTileMgr;
}
LTMapNS();