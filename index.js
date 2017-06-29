var superagent = require('superagent'); 
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');
var request = require('request');
var page=1;
var num = 0;
console.log('爬虫程序开始运行......');

function fetchPage(x) {     //封装了一层函数
    startRequest(x); 
}
function startRequest(x) {

	superagent
		.post('http://tweixin.yueyishujia.com/home/fashionhair.json')
		.send({ 
			// 请求的表单信息Form data
			page : x, 
			sort : 'default'
		})
	   	// Http请求的Header信息
	   .set('Accept', 'application/json, text/javascript, */*; q=0.01')
	   .set('Content-Type','application/x-www-form-urlencoded; charset=UTF-8')
	   .end(function(err, res){      	
	    	// 请求返回后的处理
	    	// 将response中返回的结果转换成JSON对象
	    	if(err){
	            console.log(err);
	        }else{
		        var heroes = JSON.parse(res.text);
		        var hairList =  heroes.data.fashionhairlist;
		        if(hairList.length > 0){
					num += hairList.length;
			        // 并发遍历heroes对象
					async.mapLimit(hairList, 5, 
						function (hair, callback) {
						// 对每个对象的处理逻辑
					 		console.log('...正在抓取数据ID：'+hair.id);
					 		saveImg(hair,callback);
						}, 
						function (err, result) {
							console.log('...累计抓取的信息数→→' + num);
						}
					);
			        page++;
			        fetchPage(page);
		        }else{
		        	console.log('...爬虫程序运行结束,本次共爬取数据'+num+'条...');
		        }
	        }
	    });
} 
fetchPage(page);
function saveImg(hair,callback){
	// 存储图片
    var img_filename = hair.id + '.png';

    var img_src = 'http://photo.yueyishujia.com:8112' + hair.imgurl; //获取图片的url

	//采用request模块，向服务器发起一次请求，获取图片资源
    request.head(img_src,function(err,res,body){
        if(err){
            console.log(err);
        }else{
   			 request(img_src).pipe(fs.createWriteStream('./image/' + img_filename));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
   			 console.log('...存储id='+hair.id+'相关图片成功！');
        }
    });
    // 存储照片相关信息txt
    // var html = '套餐查看次数：'+hair.clicknum+'....套餐收藏次数：'+hair.keepnum;
    // fs.appendFile('./data/' + hair.id + '.txt', html, 'utf-8', function (err) {
    //     if (err) {
    //         console.log(err);
    //     }
    // });
    callback(null, hair);
}