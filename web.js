var express 	= require("express"),
	hbs         = require('hbs'),
	path        = require('path'),
	rest		= require('restler'),
	http 		= require('http'),
	querystring = require('querystring'),
	story		= require('./lib/story');
    qEngine     = require('./lib/qEngine');

//var mod_lib = require(__dirname+ '/lib/lib');

var app = express();
app.use(express.logger());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
app.engine('handlebars', hbs.__express);
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css/', express.static(__dirname + '/public/css/'));
app.use('/js/', express.static(__dirname + '/public/js/'));
app.use('/images/', express.static(__dirname + '/public/images/'));

//app.get('/', function(request, response) {
//  response.send('Hello World!!!');
//});

//var str = '{ "items" : [{ "text": "Here come the monkey", "image": "http://wild-facts.com/wp-content/uploads/2010/09/woolly_monkey1.jpg" , "audio": "http://media.tts-api.com/0a0f63d2004f7c924ea25839bc697a26ecd434c5.mp3" }, { "text": "Here come the monkey 22", "image": "http://wild-facts.com/wp-content/uploads/2010/09/woolly_monkey1.jpg" , "audio": "http://media.tts-api.com/0a0f63d2004f7c924ea25839bc697a26ecd434c5.mp3" } ]}';
//var json = JSON.parse(str);
//console.log("IMAGE ARRAY : " + json.items[0].text);

/*
for(var i=0; i<json.items.length; i++){
console.log("Looping : " + json.items[i].text);
console.log("Looping : " + json.items[i].image);
console.log("Looping : " + json.items[i].audio);
}*/

//var html = '<div id="bb-bookblock" class="bb-bookblock">';
//    html += '<link rel="stylesheet" type="text/css" href="css/default.css" />';
//    html += '<link rel="stylesheet" type="text/css" href="css/bookblock.css" />';
//    html += '<link rel="stylesheet" type="text/css" href="css/demo1.css" />';
//    
//    for(var i=0; i<json.items.length; i++){
//        html += '<div class="bb-item">';
//            html +=json.items[i].text;
//            html += '<img src="'+json.items[i].image+'" alt="image01" width="200" height="200"/>';
//            html += ' <object height="0" width="0" data="'+json.items[i].audio+'"></object>';
//         html += '</div>';
//    }
//    
//    html += '<script src="js/modernizr.custom.js"></script>';
//    html += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>';
//    html += '<script src="js/jquerypp.custom.js"></script>';
//    html += '<script src="js/jquery.bookblock.js"></script>';
//    html += '<script>';
//        html += 'var Page = (function() {';
//				
//            html += 'var config = {';
//            html += '    $bookBlock : $( "#bb-bookblock" )';
//           html += ' },';
//            html += 'init = function() {';
//                html += 'config.$bookBlock.bookblock( {';
//                   html += ' speed : 800,';
//                   html += 'shadowSides : 0.8,';
//                   html += 'shadowFlip : 0.7,';
//                   html += ' autoplay : true,';
//                   html += ' interval : 3000,';
//                   html += ' circular : false';
//               html += ' });';
//                            
//            html += '}';
//            html += 'return { init : init };';
//          html += ' })();';
//		   html += 'Page.init();';
//       html += '</script>';
//html += '</div>';
//        
//
//
//console.log("HTML : " + html);

app.get('/', function(request, response) {
	response.render('index', {
		title: "Storyteller 1.0"
	});
});

app.get('/getRecommendations/:keyword', function(req, res){ 
    console.log(req.params.keyword);
    qEngine.processKeyToVideo(req.params.keyword,res);
    //res.send();
});


app.get('/getEbooks/:keyword', function(req, res){ 
    qEngine.processEbook(req.params.keyword,res);
    //res.send();
});

app.post('/audio', function(req, res){ // return the url of the audio

    if (req.body.audio_query != ''){

        var url = 'http://tts-api.com/tts.mp3?q=';
        var return_url = '&return_url=1';
        url = url + req.body.audio_query + return_url;

        rest.get(url).on('complete', function(result) {
            if (result instanceof Error) {
                console.log('result fails '+ 'Error: ' + result.message);
                sys.puts('Error: ' + result.message);
                this.retry(5000); // try again after 5 sec
            } else {
                //sys.puts(result);
                console.log("\nresult is true");
                console.log("\nresult is "+JSON.stringify(result));
                res.send(
                    { 'items' : {
                         'text' : req.body.audio_query,
                         'audio_url' : result
                    }}
                );
            }
        });

    } else {
        res.send('the text should not be empty, please try again <a href="/test_audio">back</a>');
    }
});

app.post('/extractKeywords', function(req, res){ // return the url of the audio

    if (req.body.query != ''){
    	var apikey = "8b705cd4e31297cf064e31fe1506bbc05f34dc71";
    	var text = req.body.query;
    	var outputMode = "json";

    	rest.post("http://access.alchemyapi.com/calls/text/TextGetRankedKeywords",
            	{ 
    				data: {apikey: apikey, text: text, outputMode: outputMode},
    			}
        ).on( 'complete', function( result, response ) {
        	if ( result instanceof Error ) {
        		return;
    	    }
        	
        	try {
        		var obj = JSON.parse(JSON.stringify(result));
        		var mostReleventKeyword = obj.keywords[0]["text"];
        		var audioUrl;
        		
                var url = 'http://tts-api.com/tts.mp3?q=';
                var return_url = '&return_url=1';
                url = url + mostReleventKeyword + return_url;

                rest.get(url).on('complete', function(audiodata) {
                    if (result instanceof Error) {
                        console.log('result fails '+ 'Error: ' + audiodata.message);
                        sys.puts('Error: ' + audiodata.message);
                        this.retry(5000); // try again after 5 sec
                    } else {
                        
                        var audioJsonObj = JSON.parse(JSON.stringify(audiodata));
                        audioUrl = JSON.stringify(audiodata);
                        
                        console.log(audioUrl);
                        //Get image
                    }
                });        		
        		
        		//mod_lib.getImageJson(result);
        		res.send( response.statusCode, JSON.stringify(result) );
        		return;
        	}
        	catch (err) {
        		res.send( 500, 'Error.......' );
            	return;
            }
        });

    } else {
        res.send('Text area is empty, please try again !');
    }
});

app.get('/test_audio', function(req, res){ // shows the audio text form
    res.render('test_audio', {
                title: "Storyteller 1.0 | test audio"
        });
});

app.get('/test_keyword_extraction', function(req, res){ 
    res.render('test_keyword_extraction', {
                title: "Storyteller 1.0 | Test Extract Keywords"
    });
});



app.get('/test_textToImages/:text',function(req, res){
  
   var url = "http://ajax.googleapis.com/ajax/services/search/images";
   var return_url='?v=1.0&q='+req.params.text;
  
   url = url + return_url ;
    
   rest.get(url).on('complete', function(result) {
           
            if (result instanceof Error) {
                console.log('result fails '+ 'Error: ' + result.message);
                this.retry(5000);
            } else {
               
                console.log("\nresult is true");
                var imageJSON = JSON.parse(result) ;
                var stringImage = JSON.stringify(imageJSON);
                console.log("\nresult is "+ stringImage);
                
              
               res.send(
                    { 'items' : {
                         'image' : stringImage
                    }}
                );
            }
        });
 
});

app.get('/process', function(req, res){
	//console.log("\n req:"+req);
	if (req.query.paragraph) {
        story.process(req, res, function(result){
        	res.send(result);
        });
	}
	else{
		res.send({});
	}
});

app.get('/getPage', function(req, res){
	if(req.query.host){
		story.getPage(req.query.host, req.query.path, function(html){
			res.send(html);
		});
	}
});

app.get('/extractArticle', function(req, res){
    //console.log("\n req:"+req);
    if (req.query.url) {
        qEngine.extractArticle(req.query.url, function(content){
                res.send({"content": content});
        });
    }
    else{
        res.send({});
    }
});

app.get('/extractArticleText', function(req, res){
    //console.log("\n req:"+req);
    if (req.query.html) {
        qEngine.extractArticleText(req.query.html, function(content){
                res.send({"content": content});
        });
    }
    else{
        res.send({});
    }
});

app.get('/getEBooks', function(req, res){
    //console.log("\n req:"+req);
    if (req.query.keyword) {
        qEngine.getEBooks(req.query.keyword, function(content){
                res.send(content);
        });
    }
    else{
        res.send({});
    }
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
