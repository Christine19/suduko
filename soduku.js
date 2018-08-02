function SD(){
	this.sdArr = [];//生成的数独数组	
	this.errorArr = [];//错误的格子。
	this.blankNum = 30;//空白格子数量 
	this.backupSdArr = [];//数独数组备份。
}

SD.prototype={

	constructor:SD,
	// 初始化方法
	init:function(blankNum){
		// 调用createDoms函数 绘制九宫格
		this.createDoms();
		// 声明开始时间
		var beginTime = new Date().getTime();
		// 调用createsdarr函数  绘制数独
		this.createSdArr();
		// 打印绘制用时
		console.log("数独生成完毕，耗时："+((new Date().getTime())-beginTime)/1000+"秒！");
		//  需要留多少空去填  如果用户有输入就使用用户输入 不然就使用默认30孔
		this.blankNum = this.setLevel()||blankNum || this.blankNum;		
		// 调用drawCells函数  将生成的数独数组放入九宫格中
		this.drawCells();
		// 调用createBlank函数 挖坑
		this.createBlank(this.blankNum);
		// 调用createBlankCells函数 
		this.createBlankCells();
	},
	//重置程序。
	reset:function(){
		// 清空错误数组
		this.errorArr = [];
		// 找到数独盒子 删除背景 类
		$(".sdspan").removeClass('bg_red blankCell');
		// 重新绘制数独
		var beginTime = new Date().getTime();
		this.createSdArr();
		console.log("数独生成完毕，耗时："+((new Date().getTime())-beginTime)/1000+"秒！");
		this.blankNum = this.setLevel()||this.blankNum;
		// 将 可编辑元素改完不可编辑  contenteditable为H5新属性 可以设置元素是否可编辑 ***
		$(".sdspan[contenteditable=true]").prop('contenteditable',false);
		this.drawCells();
		this.createBlank(this.blankNum);
		this.createBlankCells();
	},
	//重玩本局
	again:function(){
		// 清理错误数组
		this.errorArr = [];
		// 将报错样式取消
		$(".sdspan").removeClass('bg_red blankCell');	
		// 重新绘制	
		this.createBlankCells();
	},
	//用户输入难度。
	setLevel:function(){
		var num = prompt("请输入难度（5-50）"); 
		// 判断用户输入是否合理
		if(!isNaN(num)){
			num = parseInt(num);
			num = num<5?5:num;
			num = num>50?50:num;
		}else{
			num = false;
		}
		// 合理返回输入结果,不合理返回false
		return num;
	},
	//生成数独数组。
	createSdArr:function(){

		var that = this;
		try{
			this.sdArr = [];
			// 随机生成斜线上的三个3宫格对应坐标的值
			this.setThird(2,2);
			this.setThird(5,5);
			this.setThird(8,8);
			// 三宫格中使用的所有数字
			var allNum = [1,2,3,4,5,6,7,8,9];
			// 外层循环
			outerfor:
			for(var i=1;i<=9;i++){
				// 里层循环
				innerfor:
				for(var j=1;j<=9;j++){
					// 判断当前行列在sdarr中是否存在 如果有 就跳出当前里层循环
					if(this.sdArr[parseInt(i+''+j)]){
						continue innerfor;
					}
					// 如果sdarr中不存在当前 ij 下标
					// 获取当前行的值 
					var XArr = this.getXArr(j,this.sdArr);
					// 获取当前列的值
					var YArr = this.getYArr(i,this.sdArr);
					// 获取 当前i j 坐标 对应九宫格所有值
					var thArr = this.getThArr(i,j,this.sdArr);
					// 求 XArr与YArr交集与thArr的交集
					var arr = getConnect(getConnect(XArr,YArr),thArr);
					// 求出allNUm与arr数组的差值
					var ableArr = arrMinus(allNum,arr);
					// 当allNUm与arr的差值数组长度为0时表示数独数组已经生成了 跳出循环
					if(ableArr.length == 0){
						this.createSdArr();
						return;
						break outerfor;
					}

					var item;
					//如果生成的重复了就重新生成。
					do{
						item = ableArr[getRandom(ableArr.length)-1];
					}while(($.inArray(item, arr)>-1));

					this.sdArr[parseInt(i+''+j)] = item;
				}
			}
			// 将数独数组备份
			this.backupSdArr = this.sdArr.slice();
		}catch(e){
			//如果因为超出浏览器的栈限制出错，就重新运行。
			that.createSdArr();
		}
	},
	//获取所在行的值。
	getXArr:function(j,sdArr){
		var arr = [];
		for(var a =1;a<=9;a++){
			if(this.sdArr[parseInt(a+""+j)]){
				arr.push(sdArr[parseInt(a+""+j)])
			}
		}
		return arr;
	},
	//获取所在列的值。
	getYArr:function(i,sdArr){
		var arr = [];
		for(var a =1;a<=9;a++){
			if(sdArr[parseInt(i+''+a)]){
				arr.push(sdArr[parseInt(i+''+a)])
			}
		}
		return arr;
	},
	//获取所在三宫格的值。
	getThArr:function(i,j,sdArr){
		var arr = [];
		var cenNum = this.getTh(i,j);
		var thIndexArr = [cenNum-11,cenNum-1,cenNum+9,cenNum-10,cenNum,cenNum+10,cenNum-9,cenNum+1,cenNum+11];
		for(var a =0;a<9;a++){
			if(sdArr[thIndexArr[a]]){
				arr.push(sdArr[thIndexArr[a]]);
			}
		}
		return arr;
	},
	//获取所在三宫格的中间位坐标。
	getTh:function(i,j){
		var cenArr = [22,52,82,25,55,85,28,58,88];
		var index = (Math.ceil(j/3)-1) * 3 +Math.ceil(i/3) -1;
		var cenNum = cenArr[index];
		return cenNum;
	},
	//为对角线上的三个三宫格随机生成。
	setThird:function(i,j){
		// 三宫格内的数字
		var numArr = [1,2,3,4,5,6,7,8,9];
		// 对numarr数组重新排序
		var sortedNumArr= numArr.sort(function(){return Math.random()-0.5>0?-1:1});
		// 当前传入值对应的坐标
		var cenNum = parseInt(i+''+j);
		// 当前传入值对应九宫格坐标
		var thIndexArr = [cenNum-11,cenNum-1,cenNum+9,cenNum-10,cenNum,cenNum+10,cenNum-9,cenNum+1,cenNum+11];
		// 给数独数组坐标赋值 
		for(var a=0;a<9;a++){
			this.sdArr[thIndexArr[a]] = sortedNumArr[a];
		}
	},
	//将生成的数组填写到九宫格
	drawCells:function(){
		for(var j =1;j<=9;j++){
			for(var i =1;i<=9;i++){					
				$(".sdli").eq(j-1).find(".sdspan").eq(i-1).html(this.sdArr[parseInt(i+''+j)]);
			}
		}
	},
	//生成指定数量的空白格子的坐标。
	createBlank:function(num){
		var blankArr = [];
		var numArr = [1,2,3,4,5,6,7,8,9];
		var item;
		for(var a =0;a<num;a++){
			do{
				item = parseInt(numArr[getRandom(9) -1] +''+ numArr[getRandom(9) -1]);
			}while($.inArray(item, blankArr)>-1);
			blankArr.push(item);
		}
		// 将空白格子的坐标保存给this
		this.blankArr = blankArr;
	},
	//在创建好的数独中去除一部分格子的值，给用户自己填写。把对应格子变成可编辑,并添加事件。
	createBlankCells:function(){
		var blankArr = this.blankArr,
			len = this.blankArr.length,
			x,
			y,
			dom;

		for(var i =0;i<len;i++){
			// 拿到空白格子坐标 ,根据坐标找到对应盒子
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			// 将空白格子 清空内容 变为可以编译 添加类名 
			dom.attr('contenteditable', true).html('').addClass('blankCell');
			// 将备份中数独数组中的空白格子对应的值改为undefined		
			this.backupSdArr[blankArr[i]] = undefined;
		}
		// 给空白格子添加键盘弹起事件, 正则检验用户输入的是否是单个数字
		$(".sdspan[contenteditable=true]").keyup(function(event) {
			var val = $(this).html();			
			var reStr = /^[1-9]{1}$/;
			if(!reStr.test(val)){
				// 如果用户输入的不是一个数字则清空 
				$(this).html('');
			};
		});
	},
	//检测用户输入结果。检测前将输入加入数组。检测单个的时候将这一个的值缓存起来并从数组中删除，检测结束在赋值回去。
	checkRes:function(){
		var blankArr = this.blankArr,len = this.blankArr.length,x,y,dom,done,temp;
		this.getInputVals();
		this.errorArr.length = 0;
		for(var i =0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;
			temp = this.backupSdArr[blankArr[i]];
			this.backupSdArr[blankArr[i]] = undefined;
			this.checkCell(x,y);
			this.backupSdArr[blankArr[i]] = temp;

		}
		done = this.isAllInputed();
		// 验证 如果错误数组为空 且 没用空着的空格子
		if(this.errorArr.length == 0 && done ){
			alert('you win!');
			$(".bg_red").removeClass('bg_red');
		}else{
			if(!done){
				alert("你没有完成游戏！");
			}
			this.showErrors();
		}
	},
	//检测一个格子中输入的值，在横竖宫里是否已存在。
	checkCell:function(i,j){
		var index = parseInt(i+''+j);
		
		var backupSdArr = this.backupSdArr;
		var XArr = this.getXArr(j,backupSdArr);
		var YArr = this.getYArr(i,backupSdArr);
		var thArr = this.getThArr(i,j,backupSdArr);
		var arr = getConnect(getConnect(XArr,YArr),thArr);			
		var val = parseInt($(".sdli").eq(j-1).find(".sdspan").eq(i-1).html());
		// 如果检测时,当前值在所在的行 或 列 或三宫格中存在 ,则将这个坐标存入错误数组中
		if($.inArray(val, arr)>-1){

			this.errorArr.push(index);
		}
	},
	//将用户输入的结果添加到数组中。
	getInputVals:function(){
		var blankArr = this.blankArr,
			len = this.blankArr.length,
			i,
			x,
			y,
			dom,
			theval;
		for(i=0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			theval = parseInt(dom.text())||undefined;
			this.backupSdArr[blankArr[i]] = theval;
		}
	},
	//检测是否全部空格都有输入。
	isAllInputed:function(){
		var blankArr = this.blankArr,
			len = this.blankArr.length,
			i,
			x,
			y,
			dom;
		for(i=0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			if(dom.text()==''){
				return false
			}
		}
		return true;
	},
	//把错误显示出来。
	showErrors:function(){
		var errorArr = this.errorArr,len = this.errorArr.length,x,y,dom;
		$(".bg_red").removeClass('bg_red');
		for(var i =0;i<len;i++){
			x = parseInt(errorArr[i]/10);
			y = errorArr[i]%10;	
			dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			dom.addClass('bg_red');
		}
	},
	//生成九宫格。
	createDoms:function(){
		var html='<ul class="sd clearfix">';
		String.prototype.times = String.prototype.times || function(n) { return (new Array(n+1)).join(this);}; 
		html = html + ('<li class="sdli">'+'<span class="sdspan"></span>'.times(9) +'</li>').times(9)+'</ul>';
		$("body").prepend(html);

		for(var k=0;k<9;k++){
			$(".sdli:eq("+k+") .sdspan").eq(2).addClass('br');
			$(".sdli:eq("+k+") .sdspan").eq(5).addClass('br');
			$(".sdli:eq("+k+") .sdspan").eq(3).addClass('bl');
			$(".sdli:eq("+k+") .sdspan").eq(6).addClass('bl');
		}
		$(".sdli:eq(2) .sdspan,.sdli:eq(5) .sdspan").addClass('bb');
		$(".sdli:eq(3) .sdspan,.sdli:eq(6) .sdspan").addClass('bt');
	}		
}


//生成随机正整数
function getRandom(n){
	return Math.floor(Math.random()*n+1)
}

//两个简单数组的并集。
function getConnect(arr1,arr2){
	var i,len = arr1.length,resArr = arr2.slice();
	for(i=0;i<len;i++){
		if($.inArray(arr1[i], arr2)<0){
			resArr.push(arr1[i]);
		}
	}
	return resArr;
}

//两个简单数组差集，arr1为大数组
function　arrMinus(arr1,arr2){
	var resArr = [],len = arr1.length;
	for(var i=0;i<len;i++){
		if($.inArray(arr1[i], arr2)<0){
			resArr.push(arr1[i]);
		}
	}
	return resArr;
}
