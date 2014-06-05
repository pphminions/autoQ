 if (!module.parent) {
	 console.log("Please don't call me directly. I am just the main app's minion.");
	 process.exit(1);
 }
 var 	rest		= require('restler'),
 		async		= require('async'),
 		querystring = require('querystring'),
 		http = require('http'),
 		https = require('https'),
 		escape = require('escape-html');
 var story = module.exports;
  
 story.process = function(req, res, next) {
		if (req.query.paragraph){
								
	    	var dirtytext = req.query.paragraph;
	    	dirtytext = dirtytext.replace(/\"/g, "'");
	    	var text = dirtytext.replace(/<\/?[^>]+(>|$)/g, "");
	    	text = text.replace(/[\r\n]/g, "");
	    	var sentences = text.split(".");
	    	var items = [];
	    	
	    	story.getConcept(text, function(concept){
		    	//console.log("length: "+sentences.length);	  
		    	
		    	async.eachSeries(sentences, 
			    		function(value, callback){
		    		        //console.log("\n original value: "+value+ " ++++ sequence:"+sequence);
		    		        if (value) {
				    			story.getAudio(value, function(audioPath){
				    				story.getKeyword(concept, value, function(keyword) {
					    				story.getImage(keyword, function(imagePath){
					    					console.log("\n ---------------------------------");
					    					
					    					console.log("\n text: "+value);
						    				console.log("\n audio path: "+audioPath);
						    				console.log("\n keyword list: "+keyword);
						    				console.log("\n imagePath: "+imagePath);
					    					
					    					var itemJson = "";
					    					itemJson += '{';
					    					itemJson += ' "keyword" : "'+keyword+'", ';
					    					itemJson += ' "text" : "'+value+'", ';
					    					itemJson += ' "image" : "'+imagePath+'", ';
					    					itemJson += ' "audio" : "'+audioPath+'" ';
					    					itemJson += '}';
					    					
					    					//console.log("\n ++++"+itemJson);
					    					items.push(itemJson);
					    					//callback();
						    				//console.log('audio path:'+imagePath);
		//				    				console.log('keyword:'+audioPath);
						    				callback();
					    				});
		
				    				});
		
				    			});
		    		       } else {
		    		    	   callback();
		    		       }
		    			}
		    			/*eachIterator.bind(this)*/, 
		    			function(err) {
		    				//console.log('iterating done '+items.length);
			    	    	var storyJson = '{ "concept": "'+concept+'", "items":[';
			    	    	storyJson += items.join(',');
			    	    	storyJson += ']}';
			    	    	
			    	    	next(storyJson);
		    	});
	    	
	    	});
		}	 	 
 }
 
 
 story.getConcept = function(data, next) {	 
	 var post_data = querystring.stringify({
		 'apikey' : '5ddc09f49423cc2c1726d75fccc6eb459a04f642',
         'text':data,
         'outputMode': 'json'
     });     

     // An object of options to indicate where to post to
     var post_options = {
         host: 'access.alchemyapi.com',
         port: '80',
         path: '/calls/text/TextGetRankedConcepts?'+post_data,
         method: 'GET'
     };

     //console.log("xxx data:"+post_data);
     // Set up the request
     //console.log("\n keyword: "+data);
     var post_req = http.request(post_options, function(res) {
         res.setEncoding('utf8');
         
         
         var fulldata = '';
         res.on('data', function (chunk) {
             //console.log('Response: ' + chunk);
             fulldata += chunk;

         });
         
         res.on("end", function () {
        	 
        	 	console.log("\n full data: "+fulldata);
        		var json = JSON.parse(fulldata) ;
        		var concept;
        		if(json && json.concepts
        				&& json.concepts[0]
        				&& json.concepts[0].text
        		){
        			concept = json.concepts[0].text;
             		
        		}
        		next(concept);
         });
     });

     post_req.end();
 };
 
 story.getImage = function(data, next) {	 
	 var post_data = querystring.stringify({
		 'v': '1.0',
         'q':data,
         'imgsz': 'large'
     });     

     // An object of options to indicate where to post to
     var post_options = {
         host: 'ajax.googleapis.com',
         port: '80',
         path: '/ajax/services/search/images?'+post_data,
         method: 'GET'
     };

     //console.log("xxx data:"+post_data);
     // Set up the request
     //console.log("\n keyword: "+data);
     var post_req = http.request(post_options, function(res) {
         res.setEncoding('utf8');
         
         
         var fulldata = '';
         res.on('data', function (chunk) {
             //console.log('Response: ' + chunk);
             fulldata += chunk;

         });
         
         res.on("end", function () {
        		var imageJSON = JSON.parse(fulldata) ;
        		var stringImage;
        		if(imageJSON 
        				&& imageJSON.responseData 
        				&& imageJSON.responseData.results 
        				&& imageJSON.responseData.results[0]
        				&& imageJSON.responseData.results[0].url
        		){
        			stringImage = imageJSON.responseData.results[0].url;             
             		//console.log("\n ++++++++++++++++++++++++===== "+stringImage);
             		
        		}
        		next(stringImage);
         });
     });

     post_req.end();
 };
 
 story.getAudio = function(data, next) {
     var post_data = querystring.stringify({
         'q' : data,
         'return_url' : 1
     });
     
     

     // An object of options to indicate where to post to
     var post_options = {
         host: 'tts-api.com',
         port: '80',
         path: '/tts.mp3',
         method: 'POST',
         headers: {
             'Content-Type': 'application/x-www-form-urlencoded',
             'Content-Length': post_data.length
         }
     };
     
     // Set up the request
     var post_req = http.request(post_options, function(res) {
         res.setEncoding('utf8');
         
         var fulldata = '';
         res.on('data', function (chunk) {
//             console.log('Response: ' + chunk);
             fulldata += chunk;
         });
         
         res.on("end", function () {
//        	 console.log('end');
        	 next(fulldata);
         });
     });
     post_req.write(post_data);
     post_req.end();
 }
 
 story.getKeyword = function(concept, data, next) {
     var post_data = querystring.stringify({
         'apikey' : '5ddc09f49423cc2c1726d75fccc6eb459a04f642',
         'text' : data,
         'outputMode' : "json"
     });
     
     

     // An object of options to indicate where to post to
     var post_options = {
         host: 'access.alchemyapi.com',
         port: '80',
         path: '/calls/text/TextGetRankedKeywords?'+post_data,
         method: 'GET'
     };

     // Set up the request
     var post_req = http.request(post_options, function(res) {
         res.setEncoding('utf8');
         
         var fulldata = "";
         
         res.on('data', function (chunk) {
        	 	//console.log("\n chunk: "+chunk);
        	 	fulldata += chunk
         });
         
         res.on('end', function(){
	    		var obj = JSON.parse(fulldata);
	    		var mostReleventKeyword = Array();
	    		var i = 0;
	    		
	    		
	    		console.log("\n concept: "+concept);
	    		console.log("\n data: "+fulldata);
	    		mostReleventKeyword.push(concept);
	    		if( obj.keywords) {
	    			for(i=0; i < obj.keywords.length && i < 5; i++) {
	    				mostReleventKeyword.push(obj.keywords[i].text);	    		
	    			}
         		}
	    		next(mostReleventKeyword.join(" + ")); 
         });

     });
     post_req.end();	 
 }
 
 
story.getPage = function(host, path, next) {
     // An object of options to indicate where to post to
     var post_options = {
         host: host,
         port: '80',
         path: path,
         method: 'GET'
     };

     var post_req = http.request(post_options, function(res) {
         res.setEncoding('utf8');
         
         var fulldata = '';
         res.on('data', function (chunk) {
             //console.log('Response: ' + chunk);
             fulldata += chunk;

         });
         
         res.on("end", function () {
        	 next(fulldata);
         });
     });
     post_req.end();	 
 }
 
 story.getStoryBook1 = function(jsonStr, next) {
	 try{
	 var json = JSON.parse(JSON.stringify(jsonStr));	 
	 var html = '<div id="bb-bookblock" class="bb-bookblock">';
	    html += '<link rel="stylesheet" type="text/css" href="css/default.css" />';
	    html += '<link rel="stylesheet" type="text/css" href="css/bookblock.css" />';
	    html += '<link rel="stylesheet" type="text/css" href="css/demo1.css" />';
	    
	    for(var i=0; i<json.items.length; i++){
	        html += '<div class="bb-item">';
	            html +=json.items[i].text;
	            html += '<img src="'+json.items[i].image+'" alt="image01" width="200" height="200"/>';
	            html += ' <object height="0" width="0" data="'+json.items[i].audio+'"></object>';
	         html += '</div>';
	    }
	    
	    html += '<script src="js/modernizr.custom.js"></script>';
	    html += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>';
	    html += '<script src="js/jquerypp.custom.js"></script>';
	    html += '<script src="js/jquery.bookblock.js"></script>';
	    html += '<script>';
	        html += 'var Page = (function() {';
					
	            html += 'var config = {';
	            html += '    $bookBlock : $( "#bb-bookblock" )';
	           html += ' },';
	            html += 'init = function() {';
	                html += 'config.$bookBlock.bookblock( {';
	                   html += ' speed : 5000,';
	                   html += 'shadowSides : 0.8,';
	                   html += 'shadowFlip : 0.7,';
	                   html += ' autoplay : true,';
	                   html += ' interval : 3000,';
	                   html += ' circular : false';
	               html += ' });';
	                            
	            html += '}';
	            html += 'return { init : init };';
	          html += ' })();';
			   html += 'Page.init();';
	       html += '</script>';
	html += '</div>';
	
	console.log("\n html "+html);
	next(html);
	 }catch(err){
		 next("error : "+err);
	 }
 }
 
 
 story.getStoryBook = function(jsonStr, next) {
	 try{
	 var json = JSON.parse(JSON.stringify(jsonStr));	 
	 var html = '<div id="magazine"> \
		    <div><span class="text">Page 1</span></div> \
		    <div><span class="text">Page 2</span></div> \
		    <div><span class="text">Page 3</span></div> \
		</div>';
	    html += '<link rel="stylesheet" type="text/css" href="css/mag.css" />';
	    html += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>';
	    html += '<script src="js/turn.js"></script>';
	    html += '<script>';
	    html += "$('#magazine').turn({gradients: true, acceleration: true});"
	    html += '</script>';
	    next(html);
	 }catch(err){
		 next("error : "+err);
	 }
 }
 