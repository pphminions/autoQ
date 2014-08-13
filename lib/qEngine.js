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

    console.log("\n URL: " + article_url);
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
               //console.log("\n article data: "+fulldata);
               var json = JSON.parse(fulldata) ;
               //console.log("\n article data: "+json.content);
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

//qEngine.extractArticleText = function(html_content, next) {
//    var request = "http://access.alchemyapi.com/calls/html/HTMLGetText?apikey=ca4eaca5879e6cb9a41498ad9dde03bb7cffc8af&outputMode=json";
////    console.log(request);
//    var data = {html:html_content};
//    var headers = {
//                    'Content-Type': 'application/x-www-form-urlencoded',
//                    'Content-Length': data.length
//                };
//    rest.post(request, {data:data, headers:headers}).on('complete', function(result) {
//        if (result instanceof Error) {
//            console.log("\n Error!"+result.message+"<<<");
//            //next(result);
//            //this.retry(5000); // try again after 5 sec
//        } else {
//            var json = JSON.parse(result);
//            console.log("\narticale text:"+ json.text);
//            next(json.text);
//        }
//    });
//    
//};


qEngine.extractArticleText = function(html_content, next) {
    var post_data = querystring.stringify({
      'apikey' : 'ca4eaca5879e6cb9a41498ad9dde03bb7cffc8af',
      'html' : html_content,
      'outputMode': 'json'
    });
    
    // An object of options to indicate where to post to
    var post_options = {
      host: 'access.alchemyapi.com',
      port: '80',
      path: '/calls/html/HTMLGetText',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
    };
    
    var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      
      var fulldata = '';
      res.on('data', function (chunk) {
          fulldata += chunk;
    
      });
      
      res.on("end", function () {
             console.log("RESULT: " + fulldata);
             var json = JSON.parse(fulldata) ;
             //console.log("status: " + json.status);
             //console.log("-- concepts length: "+json.concepts.length);
             var content = json.text;
             console.log("content:"+content.substring(20));
             next(content);
      });
    });
    
    post_req.write(post_data);
    post_req.end();
    
    post_req.on('error', function(e) {
      console.error(e);
    });
};

//qEngine.extractArticleText = function(url, next) {
//    var post_data = querystring.stringify({
//        'apikey' : 'ca4eaca5879e6cb9a41498ad9dde03bb7cffc8af',
//        'url' : url,
//        'outputMode': 'json'
//    });
//
//    // An object of options to indicate where to post to
//    var post_options = {
//        host: 'access.alchemyapi.com',
//        port: '80',
//        path: '/calls/url/URLGetText',
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/x-www-form-urlencoded',
//            'Content-Length': Buffer.byteLength(post_data)
//        }
//    };
//
//    var post_req = http.request(post_options, function(res) {
//        res.setEncoding('utf8');
//        
//        var fulldata = '';
//        res.on('data', function (chunk) {
//            fulldata += chunk;
//
//        });
//        
//        res.on("end", function () {
//               console.log("RESULT: " + fulldata);
//               var json = JSON.parse(fulldata) ;
//               //console.log("status: " + json.status);
//               //console.log("-- concepts length: "+json.concepts.length);
//               var content = json.text;
//               console.log("content:"+content.substring(20));
//               next(content);
//        });
//    });
//
//    post_req.write(post_data);
//    post_req.end();
//    
//    post_req.on('error', function(e) {
//        console.error(e);
//    });
//};

qEngine.getKeyword = function(text, next) {
    
    //console.log("\n--text : " + text.length);
    text = text.substring(0, 32000);
    //html_content = html_content.substring(0, 4096);
    var post_data = querystring.stringify({
        'apikey' : 'ca4eaca5879e6cb9a41498ad9dde03bb7cffc8af',
        'text' : text,
        'outputMode': 'json'
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'access.alchemyapi.com',
        port: '80',
        path: '/calls/text/TextGetRankedConcepts',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        },
        rejectUnauthorized: false
    };

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        
        var fulldata = '';
        res.on('data', function (chunk) {
            fulldata += chunk;

        });
        
        res.on("end", function () {
               console.log("RESULT: " + fulldata);
               var json = JSON.parse(fulldata) ;
               console.log("status: " + json.status);
               console.log("-- concepts length: "+json.concepts.length);
               var keyword = json.concepts[0].text;
               next(keyword);
        });
    });

    post_req.write(post_data);
    post_req.end();
    
    post_req.on('error', function(e) {
        console.error(e);
    });
};

qEngine.getSentencesId = function(title, text, next) {
    
    //console.log("\n--text : " + text.length);
    var sentences = [];
    text = text.substring(0, 32000);
    var post_data = querystring.stringify({
        'user' : 'n54bxrHJRbYJGVPwlE3f',
        'title' : title,
        'text' : text
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'api.textteaser.com',
        port: '80',
        path : '/post',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        
        var fulldata = '';
        res.on('data', function (chunk) {
            fulldata += chunk;

        });
        
        res.on("end", function () {
               console.log("RESULT: " + fulldata);
               var json = JSON.parse(fulldata) ;
               //console.log(JSON.stringify(sentences));
               var id = json.id;
               next(id);
        });
    });

    post_req.write(post_data);
    post_req.end();
    
    post_req.on('error', function(e) {
        console.error(e);
    });
};

qEngine.getSentences = function(id, next) {

    // An object of options to indicate where to post to
    var post_options = {
        host: 'api.textteaser.com',
        port: '80',
        path : '/get/n54bxrHJRbYJGVPwlE3f/'+id,
        method: 'get'
    };

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        
        var fulldata = '';
        res.on('data', function (chunk) {
            fulldata += chunk;

        });
        
        res.on("end", function () {
               console.log("RESULT: " + fulldata);
               var json = JSON.parse(fulldata) ;
//               console.log(JSON.stringify(json.sentences));
               next(json.sentences);
        });
    });
    
    post_req.end();
    
    post_req.on('error', function(e) {
        console.error(e);
    });
};

//qEngine.makeQuestions = function(sentences, next) {
//    var count = 0;
//    var length = sentences.length;
//    var bakedSentences = [];
//    
//    for(index in sentences){
//        qEngine.decompose(sentences[index].sentence, function(rSentence){
//            bakedSentences.push(rSentence);
//            count++;
//            
//            if(length == count){
//                qEngine.generateQuestionHtml(bakedSentences);
//            }
//        });
//    }
//};

qEngine.makeQuestions = function(article, randomData, next) {
//    var count = 0;
//    var length = sentences.length;
//    var bakedSentences = [];
//    
//    for(index in sentences){
//        qEngine.decompose(sentences[index].sentence, function(rSentence){
//            bakedSentences.push(rSentence);
//            count++;
//            
//            if(length == count){
//                qEngine.generateQuestionHtml(bakedSentences);
//            }
//        });
//    }
    
    qEngine.decompose(article, randomData, function(rSentence){
        var html = qEngine.generateQuestionHtml(rSentence, randomData);
        
        next(html);
    });
};

qEngine.generateQuestionHtml = function(sentences, randomData) {
    console.log(JSON.stringify(sentences));
    
//    var html = "<div>" +
//    "<fieldset>" +
//      "<legend>Question 1) Alexander died in ?</legend>" +
//      "<div><input type='radio' id='aq_radios_0' value='0' name='question1'/><span>Persia</span></div>" +
//      "<div><input type='radio' id='aq_radios_0' value='1' name='question1'/><span>India</span></div>" +
//      "<div><input type='radio' id='aq_radios_0' value='2' name='question1'/><span>Babylon</span></div>" +
//      "<div><input type='radio' id='aq_radios_0' value='3' name='question1'/><span>Macedon</span></div>" +
//    "</fieldset>" +
//    "<fieldset>" +
//    "<legend>Question 2) Alexander was tutored by ?</legend>" +
//    "<div><input type='radio' id='aq_radios_1' value='0' name='question2'/><span>David Hume</span></div>" +
//    "<div><input type='radio' id='aq_radios_1' value='1' name='question2'/><span>Plato</span></div>" +
//    "<div><input type='radio' id='aq_radios_1' value='2' name='question2'/><span>Aristotle</span></div>" +
//    "<div><input type='radio' id='aq_radios_1' value='3' name='question2'/><span>John Rawls</span></div>" +
//  "</fieldset>" +
//    "<div><input type='button' value='submit' onclick='checkAnswer()'></div>" +
//"</div>";
    var html = "<div>" +
                "<fieldset>";
    var questions = [];
    for (rIndex in sentences) {
        var sentence = sentences[rIndex];
        var question, answer;
        var isSubject = false, isObject = false, isLocation = false;
        var qSubject = "", qObject = "", qLocation = "";
        var qSubjectAnswer = "", qObjectAnswer = "", qLocationAnswer = "";
        var subject = "", object = "", verb = "", location = "";
        var rType;
        
        
        if (sentence.subject) {
            subject = sentence.subject.text;
            if(sentence.subject.empty == false && sentence.subject.type != undefined) {
                qSubject = rType = sentence.subject.type;
                isSubject = true;
                qSubjectAnswer = sentence.subject.rText;
            }

        }
//        
        if (sentence.object) {
            object = sentence.object.text;
            if (sentence.object.empty == false && sentence.object.type != undefined) {
                qObject = rType = sentence.object.type;
                isObject = true;
                qObjectAnswer = sentence.object.rText;
            }

        }
//        
        if (sentence.location) {
            location = sentence.location.text;
            if (sentence.location.empty == false) {
                qLocation = rType = "Where";
                isLocation = true;
                qLocationAnswer = sentence.location.rText;
            }

        }
        
        verb = sentence.verb.text;
        
        if (isLocation) {
            question = qLocation + " " + subject + " " + verb + " " + object;
            answer = qLocationAnswer;
        }
        else if (isSubject) {
            question = qSubject + " " + verb + " " + object + " " + location;
            answer = qSubjectAnswer;
        }
        else if (isObject) {
            question = qObject + " " + subject + " " + object + " " + location;
            answer = qObjectAnswer;
        }
        
        question = question.replace(/^\s+|\s+$/g, "");
      
      var questionNo = rIndex + 1;
      html += "<fieldset>" +
      "<legend>Question "+ questionNo + ")" + question + " ?</legend>";
      
      html += getAnswerElements(answer, randomData, rType);
      
      html += "</fieldset>";
        
        //questions.push({ "question": question + "?", "answer": answer});
        
        
    }
    
      html += "<div><input type='button' value='submit' onclick='checkAnswer()'></div>" +
      "</div>";
      
      return html;
        //console.log("Questions:" + JSON.stringify(questions));
};

function getAnswerElements(answer, randomData, rType) {
    var html = "";
    var randomNumber;
    var rData;
    
    switch(rType){
    case "who":
    case "Who":
        rData = randomData.who;
        break;
    case "what":
    case "What":
        
        rData = randomData.what;
        break;
    case "where":
    case "Where":
        rData = randomData.where;
        break;
    }
    
    console.log("++++++++++++++"+JSON.stringify(rData));
    
    while(true) {
        randomNumber = Math.floor(Math.random() * 3) + 1;
        
        if (randomNumber < 4) {
            break;
        }
    }
    
    console.log("Random Number:" + randomNumber);
    var min = 0;
    var max = rData.length > 4 ? 4 : rData.length;
    for(i=0; i<max; i++) {
        if (i == randomNumber) {
            html += "<div><input type='radio' id='aq_radios_" + i + "' value='" + i + "' name='question" + i + "'/><span>" + answer + "</span></div>";
        }else {
            html += "<div><input type='radio' id='aq_radios_" + i + "' value='" + i + "' name='question" + i + "'/><span>" + rData[i] + "</span></div>";
        }
    }
    
    return html;
}

function Sentence(){
    this.subject = new SentencePart();
    this.verb = new SentencePart();
    this.object = new SentencePart();
    this.location = new SentencePart();
}

//Sentence.prototype = {
//    text: "", isExists: false, type:undefined, rText: "", empty:true
//};

function SentencePart() {
    this.text = "";
    this.isExists = false;
    this.type = undefined;
    this.rText = "";
    this.empty = true;
}

//qEngine.decompose = function(sentence, next) {
//    
//    //console.log("\n sentence: "+sentence);
//    //var initData = { text: "", isExists: false, type:undefined, rText: "", empty:true};
//    var rSentenceArray = [];//{ subject: new Sentence(), verb: new Sentence(), object: new Sentence(), location: new Sentence() };
////    var isWho = false, isWhere = false, isWhen = false, isWhat = false;
//    
//    var post_data = querystring.stringify({
//        'apikey' : 'ca4eaca5879e6cb9a41498ad9dde03bb7cffc8af',
//        'text' : sentence,
//        'outputMode': 'json',
//        'entities' : 1
//    });
//
//    // An object of options to indicate where to post to
//    var post_options = {
//        host: 'access.alchemyapi.com',
//        port: '80',
//        path: '/calls/text/TextGetRelations',
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/x-www-form-urlencoded',
//            'Content-Length': Buffer.byteLength(post_data)
//        },
//        rejectUnauthorized: false
//    };
//
//    var post_req = http.request(post_options, function(res) {
//        res.setEncoding('utf8');
//        
//        var fulldata = '';
//        res.on('data', function (chunk) {
//            fulldata += chunk;
//
//        });
//        
//        res.on("error", function(){
//           console.log("Error!!!"); 
//        });
//        
//        res.on("end", function () {
//               console.log("\n++++++++ DECOMPOSE:"+fulldata);
//               var json = JSON.parse(fulldata) ;
//               //var relation = json.relations[0];
//               
//               var sCount = 0;
//               for( rIndex in json.relations) {
//                   
//                   if (sCount == 2) {
//                       break;
//                   }
//                   
//                   var relation = json.relations[rIndex];
//                   var rSentence = new Sentence();
//                   if (relation != undefined) {
//                       if(relation.subject) {
//                           rSentence.subject.text = relation.subject.text;
//                           rSentence.subject.empty = false;
//                           
//                           if(relation.subject.entities && relation.subject.entities.length > 0){
//                               if(relation.subject.entities[0]) {
//                                   //console.log("Entity:"+JSON.stringify(relation.subject.entities[0]));
//                                   qEngine.getType(relation.subject.entities[0], function(type, rText) {
//                                       rSentence.subject.type = type;
//                                       rSentence.subject.rText = rText;
//                                   });
//                               }
//                           }
//                       }
//                       
//                       if(relation.action) {
//                           rSentence.verb.text = relation.action.text;
//                           rSentence.verb.empty = false;
//                       }
//                       
//                       if(relation.object) {
//                           rSentence.object.text = relation.object.text;
//                           rSentence.object.empty = false;
//                           
//                           if(relation.object.entities && relation.object.entities.length > 0){
//                               if(relation.object.entities[0]) {
//                                   qEngine.getType(relation.object.entities[0], function(type, rText) {
//                                       rSentence.object.type = type;
//                                       rSentence.object.rText = rText;
//                                   });
//                               }
//                           }
//                       }
//                       
//                       if(relation.location) {
//                           rSentence.location.text = relation.location.text;
//                           rSentence.location.empty = false;
//                       }
//                   }
//                   
//                   //console.log("\n+++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n");
//                   //console.log(JSON.stringify(rSentence));
//                   
//                   
//                   if (rSentence.subject.type != undefined || rSentence.object.type != undefined) {
//                       sCount++;
//                       rSentenceArray.push(rSentence);
//                   }
//               }
//
//               
//               next(rSentenceArray);
//        });
//    });
//
//    post_req.write(post_data);
//    post_req.end();
//    
//    post_req.on('error', function(e) {
//        console.error(e);
//    });
//}

qEngine.decompose = function(sentence, randomData, next) {
    
    //console.log("\n sentence: "+sentence);
    //var initData = { text: "", isExists: false, type:undefined, rText: "", empty:true};
    var rSentenceArray = [];//{ subject: new Sentence(), verb: new Sentence(), object: new Sentence(), location: new Sentence() };
//    var isWho = false, isWhere = false, isWhen = false, isWhat = false;
    
    var post_data = querystring.stringify({
        'apikey' : 'ca4eaca5879e6cb9a41498ad9dde03bb7cffc8af',
        'text' : sentence,
        'outputMode': 'json',
        'entities' : 1
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'access.alchemyapi.com',
        port: '80',
        path: '/calls/text/TextGetRelations',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        },
        rejectUnauthorized: false
    };

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        
        var fulldata = '';
        res.on('data', function (chunk) {
            fulldata += chunk;

        });
        
        res.on("error", function(){
           console.log("Error!!!"); 
        });
        
        res.on("end", function () {
//               console.log("\n++++++++ DECOMPOSE:"+fulldata);
               var json = JSON.parse(fulldata) ;
               //var relation = json.relations[0];
               
               var sCount = 0;
//               for( rIndex in json.relations) {
//                   
//                   if (sCount == 2) {
//                       break;
//                   }
               var maxlength = json.relations.length;
               while (sCount < 2) {
                   
                   var rIndex = Math.floor(Math.random() * maxlength) + 1;
                   
                   if (rIndex > maxlength) {
                       continue;
                   }
                   
                   var relation = json.relations[rIndex];
                   var rSentence = new Sentence();
                   if (relation != undefined) {
                       if(relation.subject) {
                           rSentence.subject.text = relation.subject.text;
                           rSentence.subject.empty = false;
                           
                           if(relation.subject.entities && relation.subject.entities.length > 0){
                               if(relation.subject.entities[0]) {
                                   //console.log("Entity:"+JSON.stringify(relation.subject.entities[0]));
                                   qEngine.getType(relation.subject.entities[0], function(type, rText) {
                                       rSentence.subject.type = type;
                                       rSentence.subject.rText = rText;
                                   });
                               }
                           }
                       }
                       
                       if(relation.action) {
                           rSentence.verb.text = relation.action.text;
                           rSentence.verb.empty = false;
                       }
                       
                       if(relation.object) {
                           rSentence.object.text = relation.object.text;
                           rSentence.object.empty = false;
                           
                           if(relation.object.entities && relation.object.entities.length > 0){
                               if(relation.object.entities[0]) {
                                   qEngine.getType(relation.object.entities[0], function(type, rText) {
                                       rSentence.object.type = type;
                                       rSentence.object.rText = rText;
                                   });
                               }
                           }
                       }
                       
                       if(relation.location) {
                           rSentence.location.text = relation.location.text;
                           rSentence.location.empty = false;
                       }
                   }
                   
                   //console.log("\n+++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n");
                   //console.log(JSON.stringify(rSentence));
                   
                   
                   if (rSentence.subject.type != undefined || rSentence.object.type != undefined) {
                       sCount++;
                       rSentenceArray.push(rSentence);
                   }
               }

               
               next(rSentenceArray);
        });
    });

    post_req.write(post_data);
    post_req.end();
    
    post_req.on('error', function(e) {
        console.error(e);
    });
}

qEngine.getType = function (entity, next) {
    var type = undefined;
    var rText = "";
    switch(entity.type){
    case 'Person':
        type = "Who";
        rText = entity.text;
        break;
    case 'Company':
    case 'Technology':
    case 'Organization':
        type = "What";
        rText = entity.text;
        break;
    case 'City':
    case 'Continent':
    case 'Country':
    case 'GeographicFeature':
    case 'StateOrCounty':
        type = "Where";
        rText = entity.text;
        break;
    }
    
    next(type, rText);
}

qEngine.getNamedEntites = function(text, next) {
    var post_data = querystring.stringify({
        'apikey' : 'ca4eaca5879e6cb9a41498ad9dde03bb7cffc8af',
        'text' : text,
        'outputMode': 'json'
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'access.alchemyapi.com',
        port: '80',
        path: '/calls/text/TextGetRankedNamedEntities',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        },
        rejectUnauthorized: false
    };

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        
        var fulldata = '';
        res.on('data', function (chunk) {
            fulldata += chunk;

        });
        
        res.on("end", function () {
               console.log("RESULT: " + fulldata);
               var json = JSON.parse(fulldata) ;
               var who = [];
               var where = [];
               var what = [];
               
               for( idx in json.entities){
                   var entity = json.entities[idx];
                   
                   var rText = "";
                   switch(entity.type){
                   case 'Person':
                       who.push(entity.text);
                       break;
                   case 'Company':
                   case 'Technology':
                   case 'Organization':
                       what.push(entity.text);
                       break;
                   case 'City':
                   case 'Continent':
                   case 'Country':
                   case 'GeographicFeature':
                   case 'StateOrCounty':
                       where.push(entity.text);
                       break;
                   }
               }
               
               next({'who': who, 'what' : what, 'where' : where});
       });
    });

    post_req.write(post_data);
    post_req.end();
    
    post_req.on('error', function(e) {
        console.error(e);
    });
}


qEngine.getType = function (entity, next) {
    var type = undefined;
    var rText = "";
    switch(entity.type){
    case 'Person':
        type = "Who";
        rText = entity.text;
        break;
    case 'Company':
    case 'Technology':
    case 'Organization':
        type = "What";
        rText = entity.text;
        break;
    case 'City':
    case 'Continent':
    case 'Country':
    case 'GeographicFeature':
    case 'StateOrCounty':
        type = "Where";
        rText = entity.text;
        break;
    }
    
    next(type, rText);
}

//qEngine.getSentences = function(text, next) {
//    
//    console.log("\n--text : " + text.length);
//    var sentences = [];
//    text = text.substring(0, 32000);
//    //html_content = html_content.substring(0, 4096);
//    var post_data = querystring.stringify({
//        'apikey' : 'ca4eaca5879e6cb9a41498ad9dde03bb7cffc8af',
//        'text' : text,
//        'outputMode': 'json'
//    });
//
//    // An object of options to indicate where to post to
//    var post_options = {
//        host: 'access.alchemyapi.com',
//        port: '80',
//        path : '/calls/text/TextGetRelations',
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/x-www-form-urlencoded',
//            'Content-Length': Buffer.byteLength(post_data)
//        },
//        rejectUnauthorized: false
//    };
//
//    var post_req = http.request(post_options, function(res) {
//        res.setEncoding('utf8');
//        
//        var fulldata = '';
//        res.on('data', function (chunk) {
//            fulldata += chunk;
//
//        });
//        
//        res.on("end", function () {
//               console.log("RESULT: " + fulldata);
//               var json = JSON.parse(fulldata) ;
//               var i = 0;
//               for( value in json.relations) {
////                   console.log(JSON.stringify(value));
//                   if (json.relations[value].subject && json.relations[value].action && json.relations[value].object) {
//                       sentences.push(json.relations[value].subject.text + " ", json.relations[value].action.text + " " + json.relations[value].object.text);
//                       
//                       if (i == 5) {
//                           break;
//                       } else {
//                           i++;
//                       }
//                   }
//               }
//               
//               console.log(JSON.stringify(sentences));
////               console.log("status: " + json.status);
////               console.log("-- concepts length: "+json.concepts.length);
////               var keyword = json.concepts[0].text;
////               next(keyword);
//        });
//    });
//
//    post_req.write(post_data);
//    post_req.end();
//    
//    post_req.on('error', function(e) {
//        console.error(e);
//    });
//};

