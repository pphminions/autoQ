 if (!module.parent) {
     console.log("Please don't call me directly. I am just the main app's minion.");
     process.exit(1);
 }
 var    rest        = require('restler'),
        async       = require('async'),
        querystring = require('querystring'),
        http = require('http'),
        https = require('https'),
        escape = require('escape-html');
var qEngine = module.exports;

qEngine.processKeyToVideo = function(keyWord,res) {
    var videoJson = "https://www.googleapis.com/youtube/v3/search?part=snippet&q="+keyWord+"&maxResults=3&key=AIzaSyAKLLo3fkzjG7SZHNJgyhAaCb29zEsU_7U";
    console.log("inside the method");
    rest.get(videoJson).on('complete', function(result) {
        if (result instanceof Error) {
            console.log('result fails '+ 'Error: ' + result.message);
            //sys.puts('Error: ' + result.message);
            this.retry(5000); // try again after 5 sec
        } else {
            //sys.puts(result);
            console.log("\nresult is true");
            console.log("\nresult is "+JSON.stringify(result));
            var resultJson = qEngine.processVideo(result);
            console.log("\nresult is **** "+JSON.stringify(resultJson));
            //next(resultJson);
            
            res.send({'videos' : resultJson});
        }
    });
    
};

qEngine.processVideo = function(resp) {
    //console.log(JSON.stringify(resp));
    var vedioJSON = JSON.parse(JSON.stringify(resp)) ;
    var videoArray = [];
    
    
    for(var i = 0; i < vedioJSON.items.length; i++){  
       // if(JSON.stringify(vedioJSON.items[i].volumeInfo.imageLinks.thumbnail) != undefined){
        var videoURL = "https://www.youtube.com/watch?v="+vedioJSON.items[i].id.videoId;
            videoArray.push ({
                'thumbNail': vedioJSON.items[i].snippet.thumbnails.default.url,
                'url' : videoURL,
                'title' : vedioJSON.items[i].snippet.title      
            });                     
       // }                 
    }
    console.log("\nresult is "+JSON.stringify(videoArray));
    return videoArray;
};

qEngine.processEbook = function(keyword,resp){
    var url = "https://www.googleapis.com/books/v1/volumes";
    var return_url='?q='+keyword+'+inauthor:keyes&key=AIzaSyA1smezt7VfTFeoMYzaYqf4cC9hYkQ3mUs';   
    url = url + return_url ;
    console.log('\ninside method'+url);
    rest.get(url).on('complete', function(result) {
            //console.log('inside methoddddddddddddddddddddd'+result);
             if (result instanceof Error) {
                 console.log('result fails '+ 'Error: ' + result.message);
                 this.retry(5000);
             } else {
                
                 console.log("\n book result is true" + JSON.stringify(result));
                 var bookJSON = JSON.parse(JSON.stringify(result)) ;
                 var stringBook = JSON.stringify(bookJSON);             
                 var bookArray = [];
                 
                 for(var i = 0; i < bookJSON.items.length; i++){  
                     
                         if(JSON.stringify(bookJSON.items[i].volumeInfo.imageLinks) != undefined){
                        
                         bookArray.push ({   
                             'thumbnail' : bookJSON.items[i].volumeInfo.imageLinks.thumbnail,
                             'title' :  bookJSON.items[i].volumeInfo.title,
                             'url': bookJSON.items[i].selfLink,                   
                         });                     
                     }                 
               }   
                
                 resp.send({'Books' : bookArray});
           }
         });
};

qEngine.getEBooks = function(keyword, next) {
    var post_data = querystring.stringify({
        'q' : keyword,
        'key':"AIzaSyDbBTiOtEYSfHc5NK6TDiMObA5sCyTbmRg"
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'www.googleapis.com',
        port: 443,
        path: '/books/v1/volumes?'+post_data,
        method: 'GET'
    };

    //console.log("xxx data:"+post_data);
    // Set up the request
    //console.log("\n keyword: "+data);
    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        
        
        var fulldata = '';
        res.on('data', function (chunk) {
            //console.log('Response: ' + chunk);
            fulldata += chunk;

        });
        
        res.on("end", function () {
            
               console.log("\n full data: "+fulldata);
               var json = JSON.parse(fulldata) ;
               var bookHtml = "";
               if(json && json.items && json.items.length > 0
               ){
                   
                   bookHtml += "<ul>";
                   for(var i = 0; i < json.items.length, i < 5; i++){  
                       
                       if(JSON.stringify(json.items[i].volumeInfo.imageLinks) != undefined){                 
                           
                           bookHtml += "<li>";
                           bookHtml += "<div class='book-container'>";
                           bookHtml += "<a href='"+json.items[i].accessInfo.webReaderLink+"'>";
                           bookHtml += "<img src='"+ json.items[i].volumeInfo.imageLinks.thumbnail +"' width=50 height=50 />";
                           bookHtml += "<span>" + json.items[i].volumeInfo.title + "</span>";
                           bookHtml += "</a>";
                           bookHtml += "</div>";
                           bookHtml += "</li>";
                       }
                   }
                   bookHtml += "</ul>"
                   
               }
                   
               next(bookHtml);
        });
    });

    post_req.end();
};

qEngine.getVideos = function(keyword, next) {
    var post_data = querystring.stringify({
        'part' : "snippet",
        'q' : keyword,
        'maxResults': 5,
        'key':"AIzaSyAKLLo3fkzjG7SZHNJgyhAaCb29zEsU_7U"
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'www.googleapis.com',
        port: 443,
        path: '/youtube/v3/search?'+post_data,
        method: 'GET'
    };

    //console.log("xxx data:"+post_data);
    // Set up the request
    //console.log("\n keyword: "+data);
    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        
        
        var fulldata = '';
        res.on('data', function (chunk) {
            //console.log('Response: ' + chunk);
            fulldata += chunk;

        });
        
        res.on("end", function () {
            
               console.log("\n full data: "+fulldata);
               var json = JSON.parse(fulldata) ;
               var html = "";
               if(json && json.items && json.items.length > 0
               ){
                   
                   html += "<ul>";
                   for(var i = 0; i < json.items.length, i < 5; i++){  
                           
                       html += "<li>";
                       html += "<div class='video-container'>";
                       html += "<a href='https://www.youtube.com/watch?v="+json.items[i].id.videoId+"'>";
                       html += "<img src='"+ json.items[i].snippet.thumbnails.default.url +"' width=50 height=50 />";
                       html += "<span>" + json.items[i].snippet.title + "</span>";
                       html += "</a>";
                       html += "</div>";
                       html += "</li>";
                   }
                   html += "</ul>"
                   
               }
                   
               next(html);
        });
    });

    post_req.end();
};

qEngine.extractArticle = function(article_url, next) {
    var post_data = querystring.stringify({
        'token' : 'ddc0c6279b86d346458ce968e5fa9bab2197a8c6',
        'url':article_url
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'readability.com',
        port: '80',
        path: '/api/content/v1/parser?'+post_data,
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
               var content;
               if(json && json.content
               ){
                   content = json.content;
               }
               
               next(content);
        });
    });

    post_req.end();
    
    
};

qEngine.extractArticleText = function(html_content, next) {
    var request = "http://access.alchemyapi.com/calls/html/HTMLGetText?apikey=5ddc09f49423cc2c1726d75fccc6eb459a04f642&outputMode=json";
    console.log(request);
    var data = {html:html_content};
    var headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': data.length
                };
    rest.post(request, {data:data, headers:headers}).on('complete', function(result) {
        if (result instanceof Error) {
            console.log("here=============="+ result.message);
            next(result);
            //this.retry(5000); // try again after 5 sec
        } else {
            var json = JSON.parse(JSON.stringify(result));
            console.log(JSON.stringify(json));
            next(json.text);
        }
    });
    
};

qEngine.getKeyword = function(text, next) {
    var request = "http://access.alchemyapi.com/calls/text/TextGetRankedKeywords?apikey=5ddc09f49423cc2c1726d75fccc6eb459a04f642&outputMode=json";
    console.log(request);
    var data = {text:text};
    var headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': data.length
                };
    rest.post(request, {data:data, headers:headers}).on('complete', function(result) {
        if (result instanceof Error) {
            console.log("here=============="+ result.message);
            next(result);
            //this.retry(5000); // try again after 5 sec
        } else {
            var json = JSON.parse(JSON.stringify(result));
            console.log(JSON.stringify(json));
            
            var keyword = json.keywords[0].text;
            next(keyword);
        }
    });
    
};

qEngine.extractArticleText1 = function(html_content, next) {
    
    //html_content = html_content.substring(0, 4096);
    var post_data = querystring.stringify({
        'apikey' : '5ddc09f49423cc2c1726d75fccc6eb459a04f642',
        'html':html_content,
        'outputMode': 'json'
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'access.alchemyapi.com',
        port: '80',
        path: '/calls/html/HTMLGetText?'+post_data,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        },
        rejectUnauthorized: false
    };

    //console.log("xxx data:"+post_data);
    // Set up the request
    //console.log("\n keyword: "+data);
    console.log("===========html_content:"+html_content+"<<<\n");
    var post_req = http.request(post_options, function(res) {
        console.log("===========here");
        res.setEncoding('utf8');
        
        
        var fulldata = '';
        res.on('data', function (chunk) {
            //console.log('Response: ' + chunk);
            fulldata += chunk;

        });
        
        res.on("end", function () {
            
               console.log("\n full data: "+fulldata);
               var json = JSON.parse(fulldata) ;
               var content;
               if(json && json.text
               ){
                   content = json.text;
                   
               }
               next(content);
        });
    });

    post_req.end();
    
    post_req.on('error', function(e) {
        console.error(e);
      });
    
    
};
