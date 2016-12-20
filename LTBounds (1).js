//���ļ���JS API֮�е�LTBounds������������һ�����ε����귶Χ
//���ṩһЩ��صķ������������֮��Ľ����жϣ���;��ε�λ���жϣ��ߺ;��εĽ�����ȡ��
//����X�����ȣ�Y����γ��
function LTNS()
{
	function LTBounds(Xmin,Ymin,Xmax,Ymax)
	{
		this.Xmin=Xmin;
		this.Ymin=Ymin;
		this.Xmax=Xmax;
		this.Ymax=Ymax;
	}
	LTBounds.prototype.toString=function()
	{
		return this.Xmin+","+this.Ymin+","+this.Xmax+","+this.Ymax;
	}
	LTBounds.prototype.getXmax = function()
	{
		return this.Xmax;
	}
	LTBounds.prototype.getYmax = function()
	{
		return this.Ymax;
	}
	LTBounds.prototype.getXmin = function()
	{
		return this.Xmin;
	}
	LTBounds.prototype.getYmin = function()
	{
		return this.Ymin;
	}
	//���ظ÷�Χ�����ĵ�����
	LTBounds.prototype.getCenterPoint=function()
	{
		return new LTPoint((this.Xmax+this.Xmin)/2,(this.Ymax+this.Ymin)/2);
	}
	//�жϸ÷�Χ�Ƿ����ָ����Χ
	LTBounds.prototype.containsBounds=function(bounds)
	{
		return (bounds.Xmin>this.Xmin && bounds.Xmax<this.Xmax && bounds.Ymin>this.Ymin && bounds.Ymax<this.Ymax)
	}
	//�ж����������Ƿ��ཻ
	LTBounds.prototype.isIntersection=function(bounds)
	{
		var minx = Math.max(this.Xmin,bounds.Xmin);
		var maxx = Math.min(this.Xmax,bounds.Xmax);
		
		var miny = Math.max(this.Ymin,bounds.Ymin);
		var maxy = Math.min(this.Ymax,bounds.Ymax);
		
		return !(minx>maxx || miny>maxy);
	}
	//�жϸ÷�Χ�Ƿ����ָ����
	LTBounds.prototype.containsPoint=function(point)
	{
		return (point.getLongitude()>=this.Xmin && point.getLongitude()<this.Xmax && point.getLatitude()>=this.Ymin && point.getLatitude()<this.Ymax)
	}
	//����÷�Χ�ı߿��ָ���߶εĽ���
	LTBounds.prototype.getIntersection=function(startPoint,endPoint)
	{
		var intersection=[];
		if(startPoint.getLatitude()==endPoint.getLatitude())
		{
			if(startPoint.getLongitude()==endPoint.getLongitude()){return intersection;}
			if(startPoint.getLatitude()>=this.Ymin && startPoint.getLatitude()<this.Ymax)
			{
				var start=startPoint.getLongitude()<=this.Xmin?-1:(startPoint.getLongitude()>=this.Xmax?1:0);
				var end=endPoint.getLongitude()<=this.Xmin?-1:(endPoint.getLongitude()>=this.Xmax?1:0);
				if(start==end){return intersection;}
				if(start+end<=0){intersection.push(new LTPoint(this.Xmin,startPoint.getLatitude()));}
				if(start+end>=0){intersection.push(new LTPoint(this.Xmax,startPoint.getLatitude()));}
			}
			return intersection;
		}
		else if(startPoint.getLongitude()==endPoint.getLongitude())
		{
			if(startPoint.getLongitude()>=this.Xmin && startPoint.getLongitude()<this.Xmax)
			{
				var start=startPoint.getLatitude()<=this.Ymin?-1:(startPoint.getLatitude()>=this.Ymax?1:0);
				var end=endPoint.getLatitude()<=this.Ymin?-1:(endPoint.getLatitude()>=this.Ymax?1:0);
				if(start==end){return intersection;}
				if(start+end<=0){intersection.push(new LTPoint(startPoint.getLongitude(),this.Ymin));}
				if(start+end>=0){intersection.push(new LTPoint(startPoint.getLongitude(),this.Ymax));}
			}
			return intersection;
		}
		var leftY=(endPoint.getLatitude()-startPoint.getLatitude())*(this.Xmin-startPoint.getLongitude())/(endPoint.getLongitude()-startPoint.getLongitude())+startPoint.getLatitude();
		if(leftY>=this.Ymin && leftY<this.Ymax && (leftY-startPoint.getLatitude())*(leftY-endPoint.getLatitude())<=0)
		{
			intersection.push(new LTPoint(this.Xmin,leftY));
		}
		var rightY=(endPoint.getLatitude()-startPoint.getLatitude())*(this.Xmax-startPoint.getLongitude())/(endPoint.getLongitude()-startPoint.getLongitude())+startPoint.getLatitude();
		if(rightY>=this.Ymin && rightY<this.Ymax && (rightY-startPoint.getLatitude())*(rightY-endPoint.getLatitude())<=0)
		{
			intersection.push(new LTPoint(this.Xmax,rightY));
		}
		var topX=(endPoint.getLongitude()-startPoint.getLongitude())*(this.Ymax-startPoint.getLatitude())/(endPoint.getLatitude()-startPoint.getLatitude())+startPoint.getLongitude();
		if(topX>=this.Xmin && topX<this.Xmax && (topX-startPoint.getLongitude())*(topX-endPoint.getLongitude())<=0)
		{
			intersection.push(new LTPoint(topX,this.Ymax));
		}
		var bottomX=(endPoint.getLongitude()-startPoint.getLongitude())*(this.Ymin-startPoint.getLatitude())/(endPoint.getLatitude()-startPoint.getLatitude())+startPoint.getLongitude();
		if(bottomX>=this.Xmin && bottomX<this.Xmax && (bottomX-startPoint.getLongitude())*(bottomX-endPoint.getLongitude())<=0)
		{
			intersection.push(new LTPoint(bottomX,this.Ymin));
		}
		if(intersection.length==2)
		{
			if(intersection[0].getLongitude()==intersection[1].getLongitude())
			{//�����������ʵ������ͬ����ֻ����һ��
				intersection.pop();
			}
		}
		return intersection;
	}
	LTBounds.prototype.extend=function(point)
	{
		var lng=point.getLongitude(),lat=point.getLatitude();
		if(this.Xmin>lng){this.Xmin=lng;}
		if(this.Xmax<lng){this.Xmax=lng;}
		if(this.Ymin>lat){this.Ymin=lat;}
		if(this.Ymax<lat){this.Ymax=lat;}
	}
	LTBounds.getPointsBounds=function(points)
	{
		var bounds=new LTBounds(Number.MAX_VALUE,Number.MAX_VALUE,Number.MIN_VALUE,Number.MIN_VALUE);
		for(var i=points.length-1;i>=0;i--)
		{
			bounds.extend(points[i]);
		}
		return bounds;
	}
	window.LTBounds=LTBounds;
}
LTNS();