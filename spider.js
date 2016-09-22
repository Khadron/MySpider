
var fs = require("fs");
var http = require("http");
var urlUtil = require('url');
var path = require('path');
var cheerio = require('cheerio');
var jsonData = [];

var Spider = function (options){

	var options = options || {};
	this.captureNum = options.captureNum;
	this.filePath = options.filePath;
	// 入口URL
	this.entryUrl =options.entryUrl || '';
	//Url查找规则
	this.urlRule = typeof options.urlRule == 'function' ? options.urlRule : function(url) {return url}
}

Spider.prototype.crawl = function (){

	if(this.captureNum > 0){
		//抓取
		var curUrl = this.entryUrl;
		this.capture(curUrl);
		this.entryUrl = this.urlRule(curUrl);
	}else {

		console.log("抓取结束");
	}
}

Spider.prototype.capture = function (url){

	var jsonResult = {
		product:'',
		company:'',
		companyUrl:'',
		site:'',
		zhaopinUrl:''
	};

	var self = this,
	zhappinKeyWord=['加入我们','招贤纳士','诚聘英才','招聘信息','招聘'];

    //处理it桔子上的公司信息
    handleRequest(self,url,function($){
        //抓取规则处理，比如$('.title').text()
		//给jsonResult属性赋值
        //写入companies.json
        this.handleData(jsonResult);
    });

    //处理该公司主页上的招聘连接
    handleRequest(self,jsonResult.companyUrl,function($){

    	//根据zhappinKeyWord过滤出招聘网站信息,如果有的话
    	//jsonResult.zhaopinUrl = 'www.xxx.com/job'
    });

    this.captureNum--;
}

function handleRequest(self,url,fn){

	console.log(url);
	var urlParse = urlUtil.parse(url);
	//模拟浏览器请求
	var reqOptions={
		hostname:urlParse.hostname,
		port:urlParse.port,
		path:urlParse.path,
		method:'GET',
		headers:{
			"User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36"
		}
	}

	var req = http.request(reqOptions),
	    html = '';//请求过来的html内容

	    req.on('response',function (res){

	    	res.setEncoding('utf-8'); 
		res.on('data',function (chunk){ //监听data事件，收集数据
			
			html += chunk;
		}).on('end',function(){

		    var $ = cheerio.load(html); //使用cherrio模块解析html
		    fn($); //执行函数

		}).on('error',function(err){

			self.handleFailure();
			console.log('服务器响应失败:'+url);
		});

	}).on('error',function (err){

		self.handleFailure();
		console.log('抓取URL:'+url+' 失败\n');
	}).on('finish',function(){

		console.log('开始抓取URL：'+url+'\n');
	}).end();
}

Spider.prototype.handleData = function (data){

	var jsonStr = JSON.stringify(data) + '\n';
	fs.appendFile(path.join(this.filePath,'companies.json'),jsonStr,'utf-8',function(err){

		if(err){
			console.log('写入文件失败，原因：'+err.message);
		}
	});

};

Spider.prototype.handleFailure = function (){

	//当前抓取失败后，继续下一个抓取
	console.log(this.entryUrl);
	this.entryUrl = this.urlRule(this.entryUrl);
	this.crawl();
}

module.exports = Spider;