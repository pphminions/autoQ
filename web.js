var express 	= require("express"),
	path        = require('path'),
	rest		= require('restler'),
	http 		= require('http'),
	querystring = require('querystring'),
    qEngine     = require('./lib/qEngine');
    
var app = express();
app.use(express.logger());
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css/', express.static(__dirname + '/public/css/'));
app.use('/js/', express.static(__dirname + '/public/js/'));
app.use('/images/', express.static(__dirname + '/public/images/'));

app.get('/', function(request, response) {
	response.render('index', {
		title: "AutoQ"
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
//            console.log("\nContent : "+ content.substring(0, 20));
            qEngine.extractArticleText(content, function(text){
                console.log("\nText : " + text.substring(0, 20)); // + text);
                qEngine.getKeyword(text, function(keyword){
                    qEngine.getSentencesId(keyword, text, function(id){
                        qEngine.getSentences(id, function(sentences){
                            qEngine.makeQuestions(sentences, function(html){
                                res.send(html);
                            });
                        });
                    });
////                    console.log("\n\nKeyword : "+keyword);
////                    res.send({});
////                    
//////                    qEngine.getEBooks(keyword, function(b_content){
//////                        //res.send(content);
//////                        qEngine.getVideos(keyword, function(v_content){
//////                            res.send(b_content+v_content);
//////                        });
//////                    });
////                    
////                    
                    res.send({"content": keyword});
                });
//                res.send({"content": text});
            });
//            res.send({"content": content});
        });
    }
    else{
        res.send({});
    }
});

app.get('/extractArticleText', function(req, res){
    console.log("\n req:"+req);
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

app.get('/getVideos', function(req, res){
    //console.log("\n req:"+req);
    if (req.query.keyword) {
        qEngine.getVideos(req.query.keyword, function(content){
                res.send(content);
        });
    }
    else{
        res.send({});
    }
});

app.get('/getQuestion', function(req, res){
    //console.log("\n req:"+req);
//    if (req.query.keyword) {
//        qEngine.getVideos(req.query.keyword, function(content){
//                res.send(content);
//        });
//    }
//    else{
//        res.send({});
//    }
    
    var script = "<script type='javascript'>function checkAnswer(){ var list = document.getElementById('aq_radios'); alert(list.length); }</script>";
    
    var html = "<div>" +
          "<fieldset>" +
            "<legend>Question 1) Alexander died in ?</legend>" +
            "<div><input type='radio' id='aq_radios_0' value='0' name='question1'/><span>Persia</span></div>" +
            "<div><input type='radio' id='aq_radios_0' value='1' name='question1'/><span>India</span></div>" +
            "<div><input type='radio' id='aq_radios_0' value='2' name='question1'/><span>Babylon</span></div>" +
            "<div><input type='radio' id='aq_radios_0' value='3' name='question1'/><span>Macedon</span></div>" +
          "</fieldset>" +
          "<fieldset>" +
          "<legend>Question 2) Alexander was tutored by ?</legend>" +
          "<div><input type='radio' id='aq_radios_1' value='0' name='question2'/><span>David Hume</span></div>" +
          "<div><input type='radio' id='aq_radios_1' value='1' name='question2'/><span>Plato</span></div>" +
          "<div><input type='radio' id='aq_radios_1' value='2' name='question2'/><span>Aristotle</span></div>" +
          "<div><input type='radio' id='aq_radios_1' value='3' name='question2'/><span>John Rawls</span></div>" +
        "</fieldset>" +
          "<div><input type='button' value='submit' onclick='checkAnswer()'></div>" +
  "</div>";
    
    res.send(script+html);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
