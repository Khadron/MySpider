
var Spider = require('./spider');

var options = {
	captureNum:3,
	filePath: __dirname,
	entryUrl: 'http://itjuzi.com/company/1786',
	urlRule: function(url){

		var index = url.lastIndexOf('/');
		var uri = url.substring(0,index);
		var arg = parseInt(url.substring(index + 1)) + 1;

		return uri + '/' + arg;
	}
}

var spider = new Spider(options);
spider.crawl();// run 