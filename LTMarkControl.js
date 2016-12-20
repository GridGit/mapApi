
function LTNS(){
	function LTMarkControl(icon,cursor,follow)
	{
		LTFunction.inherit(this,LTBaseControl);
		this.div =LTFunction.createDiv(1,["85%",10]);
		this.btn = document.createElement( "input" );
		this.btn.type = "button";
		this.btn.value =" 标注 ";
		LTEvent.addListener(this.btn,"dblclick",LTEvent.cancelBubble);
		LTEvent.addListener(this.btn,"mousedown",LTEvent.returnTrue);
		LTEvent.addListener(this.btn,"mouseup",LTEvent.cancelBubble);
		
		this.setIcon(icon?icon:new LTIcon());
		this.cursor=cursor?cursor:"pointer";
		this.follow=(follow!=false);

		this.div.appendChild( this.btn );
		LTEvent.bind(this.btn,"click",this,this.btnClick);
		this.setValue=this.setLabel;
	}
	LTMarkControl.prototype.setIcon=function( icon )
	{
		this.icon=icon;
		this.iconObj=this.icon.getObject();
		LTFunction.setZIndex(this.iconObj,500);
		if(this.marker)
		{
			this.marker.setIcon(icon);
		}
	}
	LTMarkControl.prototype.btnClick = function( Evnt ){
		LTEvent.returnTrue( Evnt );
		if(!this.flag )
		{
			if(!this.marker )
			{//删除之前存在的标点
				this.marker=new LTMarker(null,this.icon);
			}
			this.flag = true;
			this.lastCursor=this.map.mapCursor[0];
			this.map.setMapCursor(this.cursor);
			if(this.follow)
			{
				this.map.addOverLay(this.marker);
			}
			else
			{
				this.map.removeOverLay(this.marker);
			}
			this.point=null;
			this.mmoveListener=LTEvent.bind(this.map.container,"mousemove",this,this.followCursor);
			this.mupListener=LTEvent.bind(this.map,"click",this,this.setPoint);
			LTFunction.setCursorStyle(this.map.container,"default");
		}
		else
		{
			this.map.setMapCursor(this.lastCursor);
			LTEvent.removeListener(this.mmoveListener);
			this.mmoveListener=null;
			LTEvent.removeListener(this.mupListener);
			this.mupListener=null;
			LTFunction.setCursorStyle(this.map.container,"default");
			if(!this.point){this.map.removeOverLay( this.marker );}
			this.flag = false;
		}
	}
	LTMarkControl.prototype.followCursor = function(point)
	{//鼠标跟随
		var position = LTFunction.getEventPosition(point,this.map.container);
		this.marker.setPoint(this.map.getPointLatLng(position));
	}
	LTMarkControl.prototype.setPoint = function(point)
	{//标点
		this.point = this.map.getPointLatLng( point );
		this.map.addOverLay(this.marker);
		this.marker.setPoint(this.point);
		this.btnClick();
		LTEvent.trigger(this,"mouseup",[this.point]);
	}
	LTMarkControl.prototype.initialize = function(map)
	{
		if(!this.div || this.map){return false;}
		this.map = map;
	}
	LTMarkControl.prototype.depose = function()
	{
		LTEvent.deposeNode(this.div);
		this.div=null;
	}
	LTMarkControl.prototype.getObject = function(){return this.div;}
	LTMarkControl.prototype.remove = function()
	{
		if(this.flag){this.btnClick();}
		if(this.marker){this.map.removeOverLay( this.marker );}
	}
	LTMarkControl.prototype.setLabel = function( v ){this.btn.value = v;}
	LTMarkControl.prototype.setPointImage = function( url )
	{
		this.icon.setImageUrl( url );
		this.icon.setSize();
		this.icon.setAnchor();
	}
	LTMarkControl.prototype.getMarkControlPoint = function(){return this.point;}
	window.LTMarkControl = LTMarkControl;
}
LTNS();