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
        encoding = require("encoding");
var qEngine = module.exports;

qEngine.processKeyToVideo = function(keyWord,res) {
    var videoJson = "https://www.googleapis.com/youtube/v3/search?part=snippet&q="+keyWord+"&maxResults=3&key=AIzaSyAKLLo3fkzjG7SZHNJgyhAaCb29zEsU_7U";

    rest.get(videoJson).on('complete', function(result) {
        if (result instanceof Error) {
            console.log('result fails '+ 'Error: ' + result.message);
            sys.puts('Error: ' + result.message);
            this.retry(5000); // try again after 5 sec
        } else {
            //sys.puts(result);
            console.log("\nresult is true");
            //console.log("\nresult is "+JSON.stringify(result));
            var resultJson = qEngine.processResponce(result);
            console.log("\nresult is **** "+JSON.stringify(resultJson));
            //next(resultJson);
            res.send({'videos' : resultJson});
        }
    });
    
}

qEngine.processResponce = function(resp) {
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
}