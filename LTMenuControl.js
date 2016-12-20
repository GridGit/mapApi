/**���ļ���JS API֮�е�LTMenuControl�࣬�ǵ�ͼ�ı�׼�Ҽ��ؼ�
 * ÿ���ؼ�Ӧ����initialize��getObject,depose��������
 * 
 */
function LTNS()
{
	function LTMenuControl(array)
	{
		this.array = array?array:[];
		this.copyright = window._LT_map_menu?window._LT_map_menu:"&copy; 51ditu.com";
		//�˵�������ʽ����
		this.menuWidth = 152;
		this.menuPadding = "0 0 0 0";
		this.menuBorderTop = "1px solid #cccccc";
		this.menuBorderRight = "1px solid #626262";
		this.menuBorderBottom = "1px solid #626262";
		this.menuBorderLeft = "1px solid #cccccc";
		this.menuColor = "#000000";
		this.menuFontSize = 12;
		this.menuBackgroundColor = "#ffffff";
		//�˵������ʽ����
		this.itemHeight = 25;
		this.itemPadding = "6px 0 5px 10px";
		//this.itemBackgroundColor = "#d3e3fe";
		this.itemBgMouseOver = "#d3e3fe";
		this.itemBgMouseOut = "#FFFFFF";
		this.itemColor = "#ACA899";
		this.itemCursor = "pointer";
		//�ָ��ߵ���ʽ����
		this.lineHeight = 1;
		this.lineWidth = this.menuWidth;
		this.lineBorderTop = 1;
		this.lineBackgroundColor = "#CCCCCC";
		
		this.menu = LTFunction.createDiv(1,null,1200);
		this.menu.id = "menu";
		this.menu.style.width = this.menuWidth+"px";
		var height = 1;
		if(LTBrowserInfo.isIE())
		{
			for(var i=0; i<this.array.length; i++){
				height = height+this.itemHeight;
			}
		}
		else
		{
			for(var i=0; i<this.array.length; i++){
				height = height+this.itemHeight;
				if(this.array[i].separateLine)
				{
					height = height+(this.lineHeight-1)+this.lineBorderTop;
				}
			}
		}
		this.menu.style.height = height+"px";
		this.menu.style.display = "none";
		this.menu.style.padding = this.menuPadding;
		this.menu.style.borderTop = this.menuBorderTop;
		this.menu.style.borderRight = this.menuBorderRight;
		this.menu.style.borderBottom = this.menuBorderBottom;
		this.menu.style.borderLeft = this.menuBorderLeft;
		this.menu.style.color = this.menuColor;
		this.menu.style.fontSize = this.menuFontSize+"px";
		this.menu.style.backgroundColor = this.menuBackgroundColor;
	}
	LTMenuControl.prototype.initialize = function(map) {
		if(!this.menu || this.map){return false;}
		this.map=map;
		this.contextMenu = this.menu;
		this.map.container.appendChild(this.contextMenu);
		LTEvent.bind(window.document,"click",this,this.hideContextMenu);
		LTEvent.bind(this.map.container,"contextmenu",this,this.onContextMenu);
	}
	LTMenuControl.prototype.menuItem = function(point){
		this.clear(this.menu);
		var menu = this.menu;
		var point = point;
		var itemBgMouseOverT = this.itemBgMouseOver;
		var itemBgMouseOutT = this.itemBgMouseOut;
		if(this.array.length==0){
			var item = document.createElement('div');
			item.style.fontSize = "14px";
			item.style.height = this.itemHeight + "px";
			item.innerHTML = this.copyright;
			this.menu.style.height = item.style.height;
			this.menu.appendChild(item);
			return;
		}
		for (var i = 0, array; array = this.array[i++];){
			var item = document.createElement('div');
			if (LTBrowserInfo.isIE()) {
				item.style.height = this.itemHeight + "px";
			}else{
				item.style.height = (this.itemHeight-11) + "px";
			}
			item.style.padding = this.itemPadding;
			item.style.cursor = this.itemCursor;
			if(array.menuTextColor){
				item.style.color = array.menuTextColor;
			}
			item.innerHTML = array.menuText;
			if (array.isEnabled&&array.functionName) {
				//��ֹֻ�����һ������󶨵��¼��������ã��հ����ơ�
				(function(i){
					var obj = array;
					LTEvent.addListener(item, 'click', (function(){
						obj.functionName(point);
						menu.style.display = 'none';
					}));
				})(i);
			}else{
				item.style.color = this.itemColor;
			}
			LTEvent.addListener(item,'mouseover',function(){
				this.style.backgroundColor=itemBgMouseOverT;
			});
			LTEvent.addListener(item,'mouseout',function(){
				this.style.backgroundColor=itemBgMouseOutT;
			});
			this.menu.appendChild(item);
			if(array.separateLine){
				var line = document.createElement('div');
				if(LTBrowserInfo.isIE())
				{
					line.style.height = this.lineHeight+"px";
					line.style.width = (this.lineWidth-4)+"px";
				}else
				{
					line.style.height = this.lineHeight-1+"px";
					line.style.width = (this.lineWidth-2)+"px";
				}
				
				line.style.borderTop = this.lineBorderTop+"px solid "+this.lineBackgroundColor;
				line.style.fontSize = "0px";
				line.style.margin = "0pt 1px";
				line.style.overflow = "hidden";
				this.menu.appendChild(line);
				//alert(this.menu.outerHTML);
			}
		}
	}
	
	LTMenuControl.prototype.hideContextMenu = function() {
		this.contextMenu.style.display = 'none';
	}
	
	LTMenuControl.prototype.onContextMenu = function(e) {
		this.clkPoint=this.map.getClickLatLng(e)
		this.menuItem(this.clkPoint);
		var container = this.map.container;
		var cSize = LTFunction.getSize(container);
		
		var eOffset = LTFunction.getEventPosition(e,container);
		
		//by lixiaoying	��¼����Ҽ�ʱ��λ��
		this.eOffset=eOffset;		
		
		var menu = this.contextMenu;
		var mSize = LTFunction.getSize(menu);

		var rightedge = cSize[0]-eOffset[0];
		var bottomedge = cSize[1]-eOffset[1];
		
		/*��������λ�õ������ұߵĿռ�С�ڲ˵��Ŀ�ȣ��Ͷ�λ�˵��������꣨Left��Ϊ��ǰ���λ������һ���˵����*/
		if (rightedge < mSize[0]){
			menu.style.left = container.scrollLeft + eOffset[0] - mSize[0] + "px";
		}
		else {/*���򣬾Ͷ�λ�˵���������Ϊ��ǰ���λ��*/
			menu.style.left = container.scrollLeft + eOffset[0] + "px";
		}
		
		/*��������λ�õ������±ߵĿռ�С�ڲ˵��ĸ߶ȣ��Ͷ�λ�˵��������꣨Top��Ϊ��ǰ���λ������һ���˵��߶�*/
		if (bottomedge < mSize[1]){
			menu.style.top = container.scrollTop + eOffset[1] - mSize[1] + "px";
		}else {/*���򣬾Ͷ�λ�˵���������Ϊ��ǰ���λ��*/
			menu.style.top = container.scrollTop + eOffset[1] + "px";
		}
		menu.style.display = 'block';
		LTEvent.addListener(menu,"contextmenu",LTEvent.cancelBubble);
	}
	
	LTMenuControl.prototype.getObject = function() {
		return this.menu;
	}
	
	LTMenuControl.prototype.depose = function() {
		LTEvent.deposeNode(this.menu);
		this.div=null;
	}
	
	LTMenuControl.prototype.clear = function(el){
		var child;
		while(child=el.firstChild)
		{
			el.removeChild(child);
		}
	}
	
	LTMenuControl.prototype.setOpacity = function(opacity) {
		if(LTBrowserInfo.isIE())
		{
			this.menu.style.filter = "alpha(opacity="+(opacity*100)+")";
		}
		else
		{
			this.menu.style.opacity = opacity;
		}
	}
	
	LTMenuControl.prototype.setMenuBorderTop = function(style) {
		this.menu.style.borderTop = style;
	}
	
	LTMenuControl.prototype.setMenuBorderRight = function(style) {
		this.menu.style.borderRight = style;
	}
	
	LTMenuControl.prototype.setMenuBorderBottom = function(style) {
		this.menu.style.borderBottom = style;
	}
	
	LTMenuControl.prototype.setMenuBorderLeft = function(style) {
		this.menu.style.borderLeft = style;
	}
	
	LTMenuControl.prototype.setMenuColor = function(color) {
		this.menu.style.color = color;
	}
	
	LTMenuControl.prototype.setMenuFontSize = function(num) {
		this.menu.style.fontSize = num+"px";
	}
	
	LTMenuControl.prototype.setMenuBackgroundColor = function(color) {
		this.menu.style.backgroundColor = color;
	}
	
	LTMenuControl.prototype.setMenuHeight = function(height) {
		if(height==0||height=="0"){
			height=1;
		}
		this.menu.style.height = height+"px";
	}
	
	LTMenuControl.prototype.setMenuWidth = function(width) {
		this.menu.style.width = width+"px";
		this.lineWidth = width;
	}
	
	LTMenuControl.prototype.setItemBgMouseOver = function(color) {
		this.itemBgMouseOver = color
	}
	
	LTMenuControl.prototype.setItemBgMouseOut = function(color) {
		this.itemBgMouseOut = color
	}
	
	LTMenuControl.prototype.setItemHeight = function(height) {
		//��������IE�²˵���߶Ȳ�ͬ������
		this.itemHeight = parseInt(height);
		var height = 1
		if(!LTBrowserInfo.isIE())
		{
			for(var i=0; i<this.array.length; i++){
				height = height+this.itemHeight;
				if(this.array[i].separateLine)
				{
					height = height+(this.lineHeight-1)+this.lineBorderTop;
				}
			}
		}
		this.menu.style.height = height+"px";
	}
	
	function LTMenuItem()
	{
		this.json = {};
		this.json.id = null;
		this.json.menuText = null;
		this.json.menuTextColor = null;
		this.json.functionName = null;
		this.json.isEnabled = true;
		this.json.separateLine = false;
		return this.json;
	}
	
	window.LTMenuControl=LTMenuControl;
	window.LTMenuItem=LTMenuItem;
}
LTNS();