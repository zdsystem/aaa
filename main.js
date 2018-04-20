var model = require('./model/model');
var axios = require('axios');

function rand(m,n){
	return Math.ceil(Math.random() * (n-m+1))+m-1;
}

//获取所有的分类
function getAllCate() {
	return new Promise(function(resolve, reject){
		model.cate.find(function(err, data){
			resolve(data);
		})
	});
}

function getOneCate(){
	return new Promise(async function(resolve, reject){
		var cates = await getAllCate();
		resolve(cates[rand(0, cates.length-1)]);
	})
}

//获取详情页
function detail(url) {
	return new Promise(async function(resolve, reject){
		//获取一个分类
		var cate = await getOneCate();

		axios.get(url).then(function(res){
			if(res.status != 200) return;
			// console.log(res.status);//状态码
			// console.log(res.headers);// 响应头
			var body = res.data;// 响应体

			//获取标题
			var reg = /<div class="post-title"> <h1><a.*?>(.*?)<\/a>/;
			var res = reg.exec(body);
			if(!res){
				return;
			}else{
				var title = res[1];
			}

			//获取时间
			var reg = / 时间：(.*?)</;
			var time = reg.exec(body);
			if(!time){
				return;
			}else{
				var t = time[1];
			}

			//内容
			var reg = /<dd class="con">(.*?)<ins class="kandyDiggLog">/;
			var con = reg.exec(body);
			if(!con){
				return;
			}else{
				var content = con[1];
			}

			//图片
			var reg = /<dd class="con">.*?<img.*?src="(.*?)"/;
			var res = reg.exec(body);
			if(res){
				var img = res[1];
			}else{
				var img = '';
			}
			

			var data = {
				title: title,
				content: content,
				addtime: Date.now(),
				pic: img,
				classify: cate._id
			};
			//写入数据
			var ArticleEntity = new model.article(data)

			ArticleEntity.save(function(err, data){
				if(err){
					console.log('失败');
				}else{
					console.log('采集成功!!!');
				}
			})
		}).catch(function(err){
			console.log(err);
		});
	})
}

//获取列表页
function list(urls) {
	return new Promise(function(resolve, reject){
		axios.get('http://lusongsong.com/blog/1', {
			headers: {
				Host: 'lusongsong.com',
				Cookie:'__cfduid=dde9bfbd5e1a1a2ca0f44e6f5fa3dba391521018162; yjs_id=c7a5e7bf2bc655500510608648dca603; BAIDU_SSP_lcr=https://www.baidu.com/link?url=meoJRXeDQINe1aP32MbKkjSn9vV4NpZA9ZfLHW0nLt3&wd=&eqid=ab581dba000576da000000035ac431dd; Hm_lvt_c2c6bed2d140c53e5cde2fbb263011f6=1522378189,1522397423,1522736542,1522807264; timezone=8; Hm_lpvt_c2c6bed2d140c53e5cde2fbb263011f6=1522808040; yunsuo_session_verify=847ccec1b04a83fc0c14f014a4601bbf',
				Referer: 'http://lusongsong.com/blog/',
				'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36'
			}
		}).then(function(res){
			var us = [];
			var reg = /<div class="post"> <h2><a.*?href="(.*?)"/g;
			while(r = reg.exec(res.data)){
				us.push(r[1]);
			}
			resolve(us);
		}).catch(function(err){
			console.log(err)
		})
	});
}


async function main() {
	//获取所有分类
	// var cates = await getAllCate();
	//获取单个文章

	// 获取列表页 URL
	var urls = [];
	for(var i=1;i<=50;i++){
		var url = 'http://lusongsong.com/blog/'+i;
		urls = urls.concat(await list(url));
	}

	for(var i=0;i<urls.length;i++){
		detail(urls[i]);
	}

}

main();