function LTNS()
{
	function LTIcon(url,size,anchor,doc)
	{
		var doc=doc?doc:document;
		this.img =doc.createElement("img");
		this.img.style.position="relative";
		if(url)
		{
			this.setSrc(url);
		}
		this.setSize(size);
		this.setAnchor(anchor);
	}
	LTIcon.prototype.getSize=function()
	{
		return this.size?this.size:[this.img.offsetWidth,this.img.offsetHeight]
	}
	LTIcon.prototype.setSize=function(size)
	{
		this.size=size;
		if(size)
		{
			LTFunction.setSize(this.img,size);
		}
		else
		{
			this.img.style.width="auto";
			this.img.style.height="auto";
		}
	
	}
	LTIcon.prototype.getAnchor=function()
	{
		if(this.anchor){return this.anchor;}
		var size=this.getSize();;
		return [size[0]/2,size[1]];
	}
	LTIcon.prototype.setAnchor=function(anchor)
	{
		this.anchor=anchor;
	}
	LTIcon.prototype.setImageUrl = function(url)
	{
		this.setSrc(url);
		this.size=null;
		this.anchor=null;
	}
	LTIcon.prototype.setSrc= function(url)
	{
		this.img.src=url;
	}
	LTIcon.prototype.getSrc = function()
	{
		return this.img.src;
	}
	LTIcon.prototype.setWidth = function( w )
	{
		this.img.style.width = LTFunction.getUserInput( w );
	}
	LTIcon.prototype.setHeight = function( h )
	{
		this.img.style.height = LTFunction.getUserInput( h );
	}
	LTIcon.prototype.setAlt = function( label )
	{
		this.img.alt = label;
	}
	LTIcon.prototype.setTitle = function( title )
	{
		this.img.title = title;
	}
	LTIcon.prototype.copy=function()
	{
		var size=this.getSize();
		if(!(size[0]>0 && size[1]>0)){size=null;}
		var anchor=this.getAnchor();
		if(size==null && anchor[0]==0 && anchor[1]==0){anchor=null;}
		return new LTIcon(this.img.src,size,anchor);
	}
	LTIcon.prototype.getObject = function()
	{
		this.beUsed=true;
		if( this.img.src == "" )
		{
			this.img.src = window._LT_icon_img;
			this.setSize(window._LT_icon_imgSize?window._LT_icon_imgSize:[23,21]);
			this.setAnchor(window._LT_icon_imgAnchor?window._LT_icon_imgAnchor:[4,21]);
		}
		return this.img;
	}
	window.LTIcon=LTIcon;
}
LTNS();