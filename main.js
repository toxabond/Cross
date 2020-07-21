
	
	function rangeLine(line, fromLine, toLine){
		var range = []
		for(var i=fromLine;i<toLine;i++){
			if(line[i]!=1){
				continue;
			}
			if(i==fromLine || line[i-1]==-1 || line[i-1]==0){
				range.push({left:i, count:1});
			}else{
				range[range.length-1].count = range[range.length-1].count+1;
			}
		}
		return range;
	
	}
	
	function rangeCross(line, fromLine, toLine){
		var range = []
		for(var i=fromLine;i<toLine;i++){
			if(line[i]!=0){
				continue;
			}
			if(i==fromLine || line[i-1]==-1 || line[i-1]==1){
				range.push({left:i, count:1});
			}else{
				range[range.length-1].count = range[range.length-1].count+1;
			}
		}
		return range;
	
	}
	
	function rangeFree(line, fromLine, toLine){
		var range = []
		for(var i=fromLine;i<toLine;i++){
			if(line[i]!=-1){
				continue;
			}
			if(i==fromLine || line[i-1]==0 || line[i-1]==1){
				range.push({left:i, count:1});
			}else{
				range[range.length-1].count = range[range.length-1].count+1;
			}
		}
		return range;
	
	}
	
	function rangeAll(line, fromLine, toLine){
		var _rangeLine = rangeLine(line, fromLine, toLine);
		var _rangeFree = rangeFree(line, fromLine, toLine);
		var _rangeCross = rangeCross(line, fromLine, toLine);
		
		var width = 0;
		var left = fromLine;
		var l = 0;
		var f = 0;
		var c = 0;
		var result = [];
		while(left != toLine){
			if(l<_rangeLine.length && _rangeLine[l].left==left){
				result.push({left:_rangeLine[l].left, count:_rangeLine[l].count, state:"line"});
				left += _rangeLine[l].count;
				l++;
				continue;
			}
			if(f<_rangeFree.length && _rangeFree[f].left==left){
				result.push({left:_rangeFree[f].left, count:_rangeFree[f].count, state:"free"});
				left += _rangeFree[f].count;
				f++;
				continue;
			}
			if(c<_rangeCross.length && _rangeCross[c].left==left){
				result.push({left:_rangeCross[c].left, count:_rangeCross[c].count, state:"cross"});
				left += _rangeCross[c].count;
				c++;
				continue;
			}
			throw 2;
		}
		return result;
	}
	
	// облости 
	function rangeZone(_rangeAll){
		var result = [];
		var hasZone = false;
		for(var item of _rangeAll){
			if(item.state=="free" || item.state=="line"){
				if(hasZone){
					result[result.length-1].count += item.count;
				}else{
					hasZone = true;
					result.push({left:item.left, count:item.count});
				}
			}
			if(item.state=="cross"){
				hasZone=false;
			}
		}
		return result;
	}
	
	// зона должна содержать line
	function rangeActive(_rangeAll){
		var state = true;
		var hasLine = false;
		var result = [];
		if(_rangeAll.length==0){
			return result;
		}
		
		if(_rangeAll[0].state=="free" || _rangeAll[0].state=="line"){
			result.push({left:_rangeAll[0].left, count:0});
		}
		for( var item of _rangeAll){
			if(item.state=="line"){
				hasLine = true;
			}
			if(item.state=="free" || item.state=="line"){
				if(state){
				if(result.length==0){
					throw 1;
				}
					result[result.length-1].count += item.count;
				}else{
					state = true;
					result.push({left:item.left, count:item.count});			
				}
			}
			if(item.state=="cross"){
				state = false;
				if(!hasLine){
					result.pop();
				}
				hasLine = false;
			}
		}
		if(!hasLine){
			result.pop();
		}
		return result;
	}

	function draw(data){
		if(data==null || data.length==0){
			return false;
		}
		// console.info(data);
		for(d of data){
			if(d.state == true){
				setBlack(d.x, d.y);
				M[d.y][d.x] = 1;
			}else{
				M[d.y][d.x] = 0;
				setCross(d.x, d.y);
			}
		}
		return true;
	}

	function equalRange(a, b){
		var result = [];
		if(b==undefined ){
			throw 5;
		}
		if(a.left+a.count<b.left){
			return result;
		}
		if(a.left>b.left+b.count){
			return result;
		}
		
		if(a.left<=b.left && a.left+a.count<=b.left+b.count){
			
			for(var i = b.left;i<a.left+a.count;i++){
				result.push(i);
			}
			return result;
		}
		if(a.left>b.left && a.left+a.count>b.left+b.count){
			var result = [];
			for(var i = a.left;i<b.left+b.count;i++){
				result.push(i);
			}
			return result;
		}
		return result;
	}
	
	function leftPosition(p,range){
		
		var width = 0;
		var firstLeft = 0;
		for(var i=0;i<range.length;i++){
			item = range[i];
			if(item.state=="cross"){
				return -1;
			}
			if(item.state=="free"){
				if(width+item.count>p){
					return range[0].left + p;
				}
				if(width+item.count==p && i==range.length-1){
					return range[0].left + p;
				}
				width +=item.count;
			}
			if(item.state=="line"){
				if(firstLeft==0){
					firstLeft = item.left;
				}
				if(width+item.count==p){
					return range[0].left + p;
				}
				
				if(width+item.count>p && width+item.count-firstLeft<=p){
					return item.left + item.count;
				}
				width +=item.count;
			}
		}
		return 0;	
	}
	
	function rightPosition(p,range){
		
		var width = 0;
		var firstRight = 0;
		var to = (range[range.length-1].left +range[range.length-1].count);
		for(var i=range.length-1;i>=0;i--){
			item = range[i];
			if(item.state=="cross"){
				return -1;
			}
			if(item.state=="free"){
				if(width+item.count>p){
					return to - p;
				}
				if(width+item.count==p && i==0){
					return to - p;
				}
				width +=item.count;
			}
			if(item.state=="line"){
				if(firstRight==0){
					firstRight = to-(item.left + item.count);
				}
				if(width+item.count==p){
					return to - p;
				}				
				if(width+item.count>p && width+item.count-firstRight<=p){
					return item.left;
				}
				width +=item.count;
			}
		}
		return 0;	
	}
	
	function isValide(l,from, to, line, fromLine, toLine){
		try{

		
			if(fromLine==toLine){
				return false;
			}
		}catch(e){
			throw e;
		}
		if(to-from>3){
			//throw 4;
			//return false;
		}
		

		var width = 0;
		for(var i=from;i<to;i++){
			if(i!=from){
				width++;
			}
			width += l[i];
		}

		var range = rangeAll(line, fromLine, toLine);
		for(var item of range){
			if(item.state=="cross"){
				throw 6;
			}
		}
		
		
		var select = 0
		for(var item of range){
			if(item.state=="free" || item.state=="line" ){
				select += item.count;
			}else{
				return false;
			}
		}
		if(select<width){
			return false;
		}

		
		if(to-from == 3){
			var length = range.length;
			if(range[0].state=="free" && length==1){
				return true;
			}
			if(range[0].state=="cross" && length==1){
				return false;
			}
			if(range[0].state=="line" && length==1){
				return false;
			}
			var left = leftPosition(l[from], range);
			if(left==0){
				return false;
			}
			
			var right = rightPosition(l[to-1], range);
			if(right==0){
				return false;
			}
			if(right-left>=l[from+1]){
				return true;
			}else{
				return false;
			}
		}
						
		return true;		
	}
	
	function correctCrossLeft(line, fromLine, toLine){
		var diff=0;
		for(var i=fromLine;i<toLine;i++){
			if(line[i]==0){
				diff++;
			}else{
				break;
			}
		}
		return fromLine + diff;
	}
	function correctCrossRight(line, fromLine, toLine){
		diff=0;
		for(var i=toLine-1;i>=fromLine;i--){
			if(line[i]==0){
				diff++;
			}else{
				break;
			}
		}
		return toLine - diff;
	}	
	function correctLineLeft(l,from, to, line, fromLine, toLine){
		var diff=0;
		for(var i=fromLine;i<toLine;i++){
			if(line[i]==1){
				diff++;
			}else{
				break;
			}
		}
		if(l[from]==diff){
			return fromLine + diff;
		}
		return fromLine;
	}
	function correctLineRight(l,from, to, line, fromLine, toLine){
		diff=0;
		for(var i=toLine-1;i>=fromLine;i--){
			if(line[i]==1){
				diff++;
			}else{
				break;
			}
		}
		if(l[to-1]==diff){
			return toLine - diff;
		}
		return toLine;
	}	

	
	function stratageSubSub1(l, from, to, line, fromLine, toLine){

		var leftToRight = [];
		var countLine = toLine - fromLine;
		var tempCount = countLine;
		var leftL = fromLine;
		for(var i=from;i<to;i++){
			if(l[i]<=tempCount){
				leftToRight.push({left:leftL, count:l[i]});
				leftL += (l[i]+1);
				tempCount -= l[i];
				if(tempCount>0){
					tempCount--;
				}
			}
		}
		
		var rightToLeft = [];
		var tempCount = countLine;
		var rightL = toLine;
		for(var i=to-1;i>=from;i--){
			if(l[i]<=tempCount){
				rightToLeft.push({left:rightL-l[i], count:l[i]});
				rightL -= (l[i]+1);
				tempCount -= l[i];
				if(tempCount>0){
					tempCount--;
				}
			}
		}
		var result = [];
		for(var i=0;i<leftToRight.length;i++){
			result = result.concat(equalRange(leftToRight[i], rightToLeft[leftToRight.length-1-i]));			
		}

		
		return result;
	}

	function stratageSubSub2(l, from, to, line, fromLine, toLine){
		
		var range = rangeLine(line, fromLine, toLine);
		var result = [];
		if(range.length == 0){
			return result;
		}
		
		if((range[0].left-fromLine)+range[0].count<l[from]){
			var border  = (range[0].left)+range[0].count;
			for(var i=0;i<l[from]-(border- fromLine);i++){
				result.push(border+i);
			}
		}
		
		if((toLine - range[range.length-1].left)<l[to-1]){
			var border  = range[range.length-1].left;
			for(var i=toLine-l[to-1];i<border;i++){
				result.push(i);
			}
		}

		var range = rangeAll(line, fromLine, toLine);
		var min = l[from];
		for(var i=from;i<to;i++){
			if (l[i]<min) {
				min = l[i];
			}
		}

		for(var i=1;i<range.length-1;i++){
			if(i-2>=0 && range[i-2].state=="cross" && range[i-1].state=="free" && range[i].state=="line" && range[i+1].state=="free" && range[i-1].count+range[i].count<min){
				for(var j=range[i-1].left+range[i-1].count; j<range[i-1].left+min;j++){
					result.push(j);
				}
			}
			if(i+2<range.length && range[i-1].state=="free" && range[i].state=="line" && range[i+1].state=="free"&& range[i+2].state=="cross" && range[i].count+range[i+1].count<min){
				for(var j=range[i+1].left+range[i+1].count-min;j<range[i].left;j++){
					result.push(j);
				}
			}

			if(range[i-1].state=="cross" && range[i].state=="line" && range[i+1].state=="free" && range[i].count<min){
				for(var j=range[i].left+range[i].count;j<range[i].left+min;j++){
					result.push(j);
				}
			}
			if(range[i-1].state=="free" && range[i].state=="line" && range[i+1].state=="cross" && range[i].count<min){
				for(var j=range[i].left+range[i].count-min;j<range[i].left;j++){
					result.push(j);
				}
			}

		}

		return result;
	}

	function stratageSubSub3(l, from, to, line, fromLine, toLine){		

		var range = rangeLine(line, fromLine, toLine);
		var result = [];
		if(range.length == 0){
			return result;
		}
		
		if(to-from==1||((range[0].left-fromLine)<=l[from])){
		var length = (range[0].left-fromLine+range[0].count)-l[from];
			for(var i=fromLine;i<fromLine+length;i++){
				result.push(i);
			}
		}
		
		if(to-from==1||((toLine - (range[range.length-1].left+range[range.length-1].count))<=l[to-1])){
			for(var i=0;i<(toLine - range[range.length-1].left)-l[to-1];i++){
				result.push(toLine-i-1);
			}
		}
		return result;
	}
	
	function stratageSubSub4(l, from, to, line, fromLine, toLine){		
		var range = rangeCross(line, fromLine, toLine);
		var result = [];
		if(range.length == 0){
			return result;
		}
		var min = l[from];
		for(var i = from;i<to;i++){
			if(min>l[i]){
				min = l[i];
			}
		}
		if(range[0].left - fromLine < l[from]){
			for(var i=fromLine;i<range[0].left;i++){
				result.push(i);
			}
		}
		
		if(toLine - range[range.length-1].left - range[range.length-1].count < l[to-1]){
			for(var i=(range[range.length-1].left + range[range.length-1].count);i<toLine;i++){
				result.push(i);
			}
		}
		
		if(range.length>1){
			for(var i=1;i<range.length;i++){
				var border = (range[i-1].left+range[i-1].count);
				if(range[i].left-border<min){
					for(var j=border;j<range[i].left;j++){
						result.push(j);
					}
				}
			}
		}

		return result;
	}
	
	function stratageSubSub5(l,from, to, line, fromLine, toLine){
		var max = l[from];
		for(var i = from;i<to;i++){
			if(max<l[i]){
				max = l[i];
			}
		}
		
		var result = [];
		var _rangeLine = rangeLine(line, fromLine, toLine);
		if(_rangeLine.length == 0){
			return result;
		}
		for(var i=1;i<_rangeLine.length;i++){
			if((_rangeLine[i-1].left+_rangeLine[i-1].count+1==_rangeLine[i].left)
				&& (_rangeLine[i-1].count+_rangeLine[i].count+1>max)){
				result.push(_rangeLine[i].left-1);
			
			}
		}
		
		return result;
		
	}
	function stratageSubSub6(l,from, to, line, fromLine, toLine){

		
		var result = [];
		var _rangeLine = rangeLine(line, fromLine, toLine);
		if(_rangeLine.length == 0){
			return result;
		}
		
		if(_rangeLine[0].left==fromLine && l[from]==_rangeLine[0].count && _rangeLine[0].left+_rangeLine[0].count<toLine){
			result.push(_rangeLine[0].left+_rangeLine[0].count);
		}

		var lastRangeLine = _rangeLine[_rangeLine.length-1];
		if(lastRangeLine.left+lastRangeLine.count==toLine && l[to-1]==lastRangeLine.count && lastRangeLine.left-1>fromLine){
			result.push(lastRangeLine.left-1);
		}
		
		var max = l[from];
		for(var i = from;i<to;i++){
			if(max<l[i]){
				max = l[i];
			}
		}
		
		for(var i=0;i<_rangeLine.length;i++){
			if(_rangeLine[i].count==max){
				if(_rangeLine[i].left-1>fromLine && line[_rangeLine[i].left-1]==-1){
					result.push(_rangeLine[i].left-1);
				}
				if(_rangeLine[i].left+_rangeLine[i].count<toLine && line[_rangeLine[i].left+_rangeLine[i].count]==-1){
					result.push(_rangeLine[i].left+_rangeLine[i].count);
				}
			}
		}
		return result;
		
	}
	
	function stratageSubSub7(l,from, to, line, fromLine, toLine){

		var result = [];
		var _rangeLine = rangeLine(line, fromLine, toLine);
		if(_rangeLine.length < 2){
			return result;
		}
		
		var leftMax = 0;
		var max = l[from];
		var rightMax = 0;
		for(var i = from;i<to;i++){
			if(max<l[i]){
				max = l[i];
				if(i>from){
					leftMax = l[i-1];
				}
				if(i<to-1){
					rightMax = l[i+1];
				}
			}
		}
		
		var subMax = l[from];
		var count =0;
		for(var i = from;i<to;i++){
			if(l[i]==max){
				count++;				
			}
			if(subMax==max){
				subMax = l[i];
			}
			if(subMax<l[i] && l[i]!=max){
				subMax = l[i];
			}
		}
		if(count>1){
			return result;
		}
		if(l.length==1){
			subMax = 0;
		}
		
		for(var i=1;i<_rangeLine.length;i++){
			if(_rangeLine[i-1].count>subMax && _rangeLine[i].count>subMax ){
				for(var j=_rangeLine[i-1].left+_rangeLine[i-1].count;j<_rangeLine[i].left;j++){
					result.push(j);
				}
			}					
		}
		

		return result;
		
	}
	
	function isIncludeLeft(l,from, to, range){
		if(to-from!=2){
			throw 7;
		}
		for(var item of range){
			if(item.count>l[from] && item.count<=l[from+1]){
				return true;
			}
		}
		return false;
	}

	function isIncludeRight(l,from, to, range){
		if(to-from!=2){
			throw 8;
		}
		for(var item of range){
			if(item.count>l[to-1] && item.count<=l[to-2]){
				return true;
			}
		}
		return false;
	}
	function generatorSub(l,from, to, line, fromLine, toLine, fSub, fSubSub){
		var result = [];
		var _rangeFree = rangeFree(line, fromLine, toLine);
		if(_rangeFree.length==0 || to-from<2){
			return result
		}

		var _rangeAll = rangeAll(line, fromLine, toLine);
		var _rangeZone = rangeZone(_rangeAll);
		result = result.concat(generatorOnlyOne(l,from, to, line, fromLine, toLine, fSub, fSubSub));
		result = result.concat(generatorSub2(l, from, to, _rangeZone,line, fSub, fSubSub));
		result = result.concat(generatorCutByFullLine(l, from, to, _rangeAll,line, fSub, fSubSub));	
		result = result.concat(generatorCutByMaxLine(l, from, to, _rangeAll,line, fSub, fSubSub));

		var range = rangeActive(_rangeAll);
		if(range.length >1 && range.length == to-from){
			for(var i=0;i<range.length;i++){
				var _fromLine = range[i].left;
				var _toLine = range[i].left+range[i].count;
				result = result.concat(fSubSub(l,from+i,from+i+1,line,_fromLine,_toLine))
			}
		}
		
		return result;
	}

	function generatorOnlyOne(l,from, to, line, fromLine, toLine, fSub, fSubSub){
		var result = [];
		var _rangeFree = rangeFree(line, fromLine, toLine);
		var _rangeLine = rangeLine(line, fromLine, toLine);
		// var _rangeCross = rangeCross(line, fromLine, toLine);
		var d = 0;
		for(var d=0;d<to-from-1 && d<3-1;d++)
		{
			var i=0;
			var border = _rangeFree[i].left+_rangeFree[i].count;
			while(i<_rangeLine.length && border == _rangeLine[i].left){
				border += _rangeLine[i].count;
				i++;
				if((isValide(l,from, from+d+1, line, fromLine, border) && !isValide(l,from, from+d+2, line, fromLine, border)) && !(i<_rangeFree.length && border == _rangeFree[i].left)){
					var range = rangeLine(line, fromLine, border);
					if(d+2<3 ||((d+2==3)&&isIncludeLeft(l,from, from+d+1, range) )){
						result = result.concat(fSubSub(l,from, from+d+1, line, fromLine, border));
						result = result.concat(fSub(l,from+d+1, to, line, border, toLine));						
						//return result;
					}
					}else if(i<_rangeFree.length && border == _rangeFree[i].left){
						border += _rangeFree[i].count;
						if((isValide(l,from, from+d+1, line, fromLine, border) && !isValide(l,from, from+d+2, line, fromLine, border) )&& !(i<_rangeLine.length && border == _rangeLine[i].left)){
							var range = rangeLine(line, fromLine, border);
							if(d+2<3 ||((d+2==3)&&isIncludeLeft(l,from, from+d+1, range) )){
								result = result.concat(fSubSub(l,from, from+d+1, line, fromLine, border));
								result = result.concat(fSub(l,from+d+1, to, line, border, toLine));
								//return result;
							}
						}
					}
			}
		}
		
		for(var d=0;d<to-from-1 && d<3-1;d++)
		{
			i = _rangeFree.length-1;
			var j = _rangeLine.length-1;
			border = _rangeFree[i].left;
			while(i>=0 && j>=0&& border == _rangeLine[j].left+_rangeLine[j].count){
				border = _rangeLine[j].left;
				i--;
				j--;
				if((isValide(l,to-d-1, to, line, border, toLine) && !isValide(l,to-d-2, to, line, border, toLine)) && !(i>=0 && border == _rangeFree[i].left+_rangeFree[i].count)){
					var range = rangeLine(line, border, toLine );
					if(d+2<3 ||((d+2==3)&&isIncludeRight(l,to-d-1, to, range) )){
						result = result.concat(fSubSub(l,to-d-1, to, line, border, toLine));
						result = result.concat(fSub(l,from, to-d-1, line, fromLine, border));
						//return result;
					}
					}else if(i>=0 && border == _rangeFree[i].left+_rangeFree[i].count){
						border = _rangeFree[i].left;
						if((	isValide(l,to-d-1, to, line, border, toLine) && !isValide(l,to-d-2, to, line, border, toLine) )&& !(j>=0 && border == _rangeLine[j].left+_rangeLine[j].count)){
							var range = rangeLine(line, border, toLine );
							if(d+2<3 ||((d+2==3)&&isIncludeRight(l,to-d-1, to, range) )){
								result = result.concat(fSubSub(l,to-d-1, to, line, border, toLine));
								result = result.concat(fSub(l,from, to-d-1, line, fromLine, border));
								//return result;
							}
						}
					}
			}
		}

		return result;
	}

	function generatorCutByMaxLine(l, from, to, _rangeAll,line, fSub, fSubSub){
		var result = [];

		if(to-from<=1){
			return result;
		}
		if(_rangeAll.length<3){
			return result;
		}	

		var max =l[from];
		var count = 0;
		var position = from;
		for(var i=from;i<to;i++){
			if(max==l[i]){
				count++
			}
			if(max<l[i]){
				count =1;
				max=l[i];
				position = i; 
			}
		}

		if(count>1 || position==from || position==to-1){
			return result;
		}
		var lowMax = -1;
		for(var i=from;i<to;i++){
			if(lowMax<l[i] && max!=l[i]){
				lowMax=l[i];
			}
		}

		for(var i=1;i< _rangeAll.length-1;i++){
			if(_rangeAll[i].state=="line" && _rangeAll[i].count>lowMax){
				if(_rangeAll[i+1].state=="cross"){
					result = result.concat(fSub(l, from, position+1, line, _rangeAll[0].left, _rangeAll[i].left+_rangeAll[i].count));
				}
				if(_rangeAll[i-1].state=="cross"){
					result = result.concat(fSub(l, position, to, line, _rangeAll[i].left, _rangeAll[_rangeAll.length-1].left+_rangeAll[_rangeAll.length-1].count));
				}
			}
		}
		return result;
	}
	
	function generatorCutByFullLine(l, from, to, _rangeAll,line, fSub, fSubSub){
		var result = [];
		if(_rangeAll.length<3){
			return result;
		}		
		for(var i=1;i< _rangeAll.length-1;i++){
			if(_rangeAll[i-1].state=="cross" && _rangeAll[i].state=="line" && _rangeAll[i+1].state=="cross"){
				var count = 0;
				var position;
				for(var j=from;j<to;j++){
					if(_rangeAll[i].count==l[j]){
						count++;
						position = j;
					}
				}
				if(count==1){
					result = result.concat(fSub(l, from, position, line, _rangeAll[0].left, _rangeAll[i-1].left+_rangeAll[i-1].count));
					result = result.concat(fSub(l, position+1, to, line, _rangeAll[i+1].left+_rangeAll[i+1].count, _rangeAll[_rangeAll.length-1].left+_rangeAll[_rangeAll.length-1].count));
				}
			}
		}
		return result;
	}
	
	// c лева на права и с права на лево заполнение одинаково
	function generatorSub2(l,from, to, _rangeZone,line, fSub, fSubSub){
		var range = _rangeZone;
		var leftToRight = [];
		var _from = from;
		for(var i=0;i<range.length;i++){
			if(to -_from==1 && range[i].count>=l[_from]){
				leftToRight.push(1);
				_from = to;
				break;
			}
			for(var _to=_from+2;_to<=to;_to++){
				var cur = isValide(l,_from, _to-1, line, range[i].left, range[i].left+range[i].count);
				var next = isValide(l,_from, _to, line, range[i].left, range[i].left+range[i].count);
				if( cur && !next){
					leftToRight.push(_to-_from-1);
					_from = _to-1;
					break;
				}
				if(_to == to){
					leftToRight.push(_to-_from);
					_from = _to;
				}
			}
		}
		
		var rightToLeft = [];
		var _to = to;
		for(var i=range.length-1;i>=0;i--){
			if(_to -from==1 && range[i].count>=l[_to-1]){
				rightToLeft.push(1);
				_to = from;
				break;
			}
			for(var _from=_to-2;_from>=from;_from--){
				var cur = isValide(l,_from+1, _to, line, range[i].left, range[i].left+range[i].count);
				var next = isValide(l,_from, _to, line, range[i].left, range[i].left+range[i].count);
				if(cur && !next){
					rightToLeft.push(_to-(_from+1));
					_to = _from+1;
					break;
				}
				if(_from == from){
					leftToRight.push(_to-_from);
					_to = _from;
				}
			}
		}
		
		var sum1=leftToRight.reduce((a,v)=>a+v, 0);
		var sum2=rightToLeft.reduce((a,v)=>a+v, 0);
		
		var result = [];
		if(leftToRight.length!=rightToLeft.length || rightToLeft.length!=range.length || sum1!=sum2 || sum1 != to-from){
			return result;
		}
		for(var i=0;i<leftToRight.length;i++){
			if(leftToRight[i]!=rightToLeft[rightToLeft.length-1-i]){
				return result;
			}
		}
		
		var _from = from;		
		for(var i=0;i<leftToRight.length;i++){
			result = result.concat(fSub(l,_from, _from+leftToRight[i], line, range[i].left, range[i].left+range[i].count));
			_from += leftToRight[i];
		}
		
		return result;
	}
	
	function stratageSub1(l,from, to, line, fromLine, toLine){

		fromLine = correctCrossLeft(line, fromLine, toLine);
		tempFromLine = correctLineLeft(l,from, to, line, fromLine, toLine);
		if(fromLine!=tempFromLine){
			return stratageSub1(l,from+1, to, line, tempFromLine, toLine)
		}
		
		toLine = correctCrossRight(line, fromLine, toLine);
		tempToLine = correctLineRight(l,from, to,line, fromLine, toLine);
		if(toLine!=tempToLine){
			return stratageSub1(l,from, to-1, line, fromLine, tempToLine)
		}
		
		var result = [];
		result = result.concat( stratageSubSub1(l,from, to, line, fromLine, toLine));
		result = result.concat( generatorSub(l,from, to, line, fromLine, toLine, stratageSub1, stratageSubSub1));

		
		return result;
	}
	
	function stratageSub2(l,from, to, line, fromLine, toLine){
		fromLine = correctCrossLeft(line, fromLine, toLine);		
		toLine = correctCrossRight(line, fromLine, toLine);

		
		var range = rangeLine(line, fromLine, toLine);
		var result = [];
		result = result.concat( stratageSubSub2(l,from, to, line, fromLine, toLine));
		result = result.concat( generatorSub(l,from, to, line, fromLine, toLine, stratageSub2, stratageSubSub2));

		tempFromLine = correctLineLeft(l,from, to, line, fromLine, toLine);
		if(fromLine!=tempFromLine){
			return result = result.concat(stratageSub2(l,from+1, to, line, tempFromLine, toLine));
		}
		tempToLine = correctLineRight(l,from, to,line, fromLine, toLine);
		if(toLine!=tempToLine){
			return result = result.concat(stratageSub2(l,from, to-1, line, fromLine, tempToLine));
		}
		return result;	
	}
	
	function stratageSub3(l,from, to, line, fromLine, toLine){
		fromLine = correctCrossLeft(line, fromLine, toLine);
		tempFromLine = correctLineLeft(l,from, to, line, fromLine, toLine);
		if(fromLine!=tempFromLine){
			return stratageSub3(l,from+1, to, line, tempFromLine, toLine)
		}
		
		toLine = correctCrossRight(line, fromLine, toLine);
		tempToLine = correctLineRight(l,from, to,line, fromLine, toLine);
		if(toLine!=tempToLine){
			return stratageSub3(l,from, to-1, line, fromLine, tempToLine)
		}
		
		var _rangeLine = rangeLine(line, fromLine, toLine);
		var _rangeFree = rangeFree(line, fromLine, toLine);
		var _rangeCross = rangeCross(line, fromLine, toLine);
		

		var result = [];
		result = result.concat(stratageSubSub3(l,from, to, line, fromLine, toLine));
		result = result.concat( generatorSub(l,from, to, line, fromLine, toLine, stratageSub3, stratageSubSub3));
		
		return result;
	}
	
	function stratageSub4(l,from, to, line, fromLine, toLine){
		fromLine = correctCrossLeft(line, fromLine, toLine);
		tempFromLine = correctLineLeft(l,from, to, line, fromLine, toLine);
		if(fromLine!=tempFromLine){
			return stratageSub4(l,from+1, to, line, tempFromLine, toLine)
		}
		
		toLine = correctCrossRight(line, fromLine, toLine);
		tempToLine = correctLineRight(l,from, to,line, fromLine, toLine);
		if(toLine!=tempToLine){
			return stratageSub4(l,from, to-1, line, fromLine, tempToLine)
		}
		
		var range = rangeCross(line, fromLine, toLine);
		
		var result = [];
		result = result.concat(stratageSubSub4(l,from, to, line, fromLine, toLine));
		
		return result;
	}
	
	function stratageSub5(l,from, to, line, fromLine, toLine){
		fromLine = correctCrossLeft(line, fromLine, toLine);
		tempFromLine = correctLineLeft(l,from, to, line, fromLine, toLine);
		if(fromLine!=tempFromLine){
			return stratageSub5(l,from+1, to, line, tempFromLine, toLine)
		}
		
		toLine = correctCrossRight(line, fromLine, toLine);
		tempToLine = correctLineRight(l,from, to,line, fromLine, toLine);
		if(toLine!=tempToLine){
			return stratageSub5(l,from, to-1, line, fromLine, tempToLine)
		}
				
		var result = [];
		result = result.concat(stratageSubSub5(l,from, to, line, fromLine, toLine));
		
		return result;
	}
	function stratageSub6(l,from, to, line, fromLine, toLine){
		fromLine = correctCrossLeft(line, fromLine, toLine);
		toLine = correctCrossRight(line, fromLine, toLine);
				
		var result = [];
		result = result.concat(stratageSubSub6(l,from, to, line, fromLine, toLine));
		
		tempFromLine = correctLineLeft(l,from, to, line, fromLine, toLine);
		if(fromLine!=tempFromLine){
			return result.concat(stratageSub6(l,from+1, to, line, tempFromLine, toLine));
		}
		tempToLine = correctLineRight(l,from, to,line, fromLine, toLine);
		if(toLine!=tempToLine){
			return result.concat(stratageSub6(l,from, to-1, line, fromLine, tempToLine));
		}
		
		return result;
	}
	function stratageSub7(l,from, to, line, fromLine, toLine){
		fromLine = correctCrossLeft(line, fromLine, toLine);
		tempFromLine = correctLineLeft(l,from, to, line, fromLine, toLine);
		if(fromLine!=tempFromLine){
			return stratageSub7(l,from+1, to, line, tempFromLine, toLine)
		}
		
		toLine = correctCrossRight(line, fromLine, toLine);
		tempToLine = correctLineRight(l,from, to,line, fromLine, toLine);
		if(toLine!=tempToLine){
			return stratageSub7(l,from, to-1, line, fromLine, tempToLine)
		}
				
		var result = [];
		result = result.concat(stratageSubSub7(l,from, to, line, fromLine, toLine));
		
		return result;
	}
	
	function stratageSub8(l,from, to, line, fromLine, toLine){
		
		var range = rangeLine(line, fromLine, toLine);
		var result = [];
		if(range.length!=l.length){
			return result;
		}
		for(var i=0;i<l.length;i++){
			if(range[i].count!=l[i]){	
				return result;
			}
		}
		for(var i=0;i<line.length;i++){
			if(line[i]==-1){
				result.push(i);
			}
		}
		
		return result;
	}
	function stratageG(l, u, m, f, state){
		var result = [];
		for(var i=0;i<l.length;i++){
			var tempResult = f(l[i],0, l[i].length, m[i], 0, m[i].length);
			for(var j=0;j<tempResult.length;j++){
				result.push({x:tempResult[j],y:i,state:state});
			}
		}
		return result;
	}
	
	function stratageV(l, u, m, f, state){
		var result = [];
		for(var i=0;i<u.length;i++){
			var tempU = [];
			for(var k=0;k<l.length;k++){
				tempU.push(m[k][i])
			}
			var tempResult = f(u[i], 0, u[i].length, tempU, 0, tempU.length);
			for(var j=0;j<tempResult.length;j++){
				result.push({x:i,y:tempResult[j],state:state});
			}
		}
		return result;
	}
	
	function subSubT(l, from, to, line, fromLine, toLine){
	  console.info(l, from, to, line, fromLine, toLine);  
	}

	function subT(l,from, to, line, fromLine, toLine){
		fromLine = correctCrossLeft(line, fromLine, toLine);
		tempFromLine = correctLineLeft(l,from, to, line, fromLine, toLine);
		if(fromLine!=tempFromLine){
			return subT(l,from+1, to, line, tempFromLine, toLine)
		}
		
		toLine = correctCrossRight(line, fromLine, toLine);
		tempToLine = correctLineRight(l,from, to,line, fromLine, toLine);
		if(toLine!=tempToLine){
			return subT(l,from, to-1, line, fromLine, tempToLine)
		}
		
	  subSubT(l, from, to, line, fromLine, toLine);
	  generatorSub(l,from, to, line, fromLine, toLine, subT, subSubT);
	}
	
	M = []
	for(var i=0;i<L.length;i++){
		M.push([]);
		for(var j=0;j<U.length;j++){
			M[i].push(-1);
		}
	}

	function drawAll(){
		for (let i = 0; i < M.length; i++) {
			for (let j = 0; j < M[0].length; j++) {
				if(M[i][j]==1){
					fc2({which:false, button:1},j,i)
				}
				if(M[i][j]==0){
					fc2({which:null, button:2},j,i)
				}				
			}
		}
	}
	
	function test(){
	
		for(var i=0;i<M.length;i++){
			for(var j=0;j<M[0].length;j++){
				if(M[i][j]!=-1 && M[i][j]!=testM[i][j]){
					throw 100;
				}
			}
		}
	}
	//do{
		//isAction = false;
		//isAction |= draw(stratage(L, U, M, stratageSub1));
		//isAction |= draw(stratage(L, U, M, stratageSub2));
	//}while(isAction)
	/*
for(var q=0;q<10;q++)
{
draw(stratageG(L, U, M, stratageSub1, true))
draw(stratageV(L, U, M, stratageSub1, true))

draw(stratageG(L, U, M, stratageSub2, true))
draw(stratageV(L, U, M, stratageSub2, true))

draw(stratageG(L, U, M, stratageSub3, false))
draw(stratageV(L, U, M, stratageSub3, false))

draw(stratageG(L, U, M, stratageSub4, false))
draw(stratageV(L, U, M, stratageSub4, false))

draw(stratageG(L, U, M, stratageSub5, false))
draw(stratageV(L, U, M, stratageSub5, false))

draw(stratageG(L, U, M, stratageSub6, false))
draw(stratageV(L, U, M, stratageSub6, false))

draw(stratageG(L, U, M, stratageSub7, true))
draw(stratageV(L, U, M, stratageSub7, true))
  
draw(stratageG(L, U, M, stratageSub8, false))
draw(stratageV(L, U, M, stratageSub8, false))
}

test()


draw([{x:10,y:3,state:false}])
draw([{x:9,y:3,state:false}])
draw([{x:21,y:21,state:false}])
draw([{x:23,y:21,state:false}])

draw([{x:10,y:4,state:true}])
fc2({which:false, button:1},10,4)
fc2({which:true, button:2},1,1)

drawAll();

var tempU = [];
var t = 11
for(var k=0;k<M.length;k++){
	tempU.push(M[k][t])
}
console.info(tempU);
//isValide(U[t], 0, 2, tempU, 1, 15)
//isValide(U[t], 0, 3, tempU, 1, 15)
//isValide(U[t], 0, U[t].length, tempU, 0, tempU.length, 0)
stratageSub1(U[t], 0, U[t].length, tempU, 0, tempU.length)

//stratageSub1(L[t], 0, L[t].length, M[t], 0, M[t].length)


*/
	