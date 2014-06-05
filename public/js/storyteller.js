
(function($, win, doc) {

    var _getCaretInfo = function(element){
        var res = {
            text: '',
            start: 0,
            end: 0
        };

        if (!element.value && !element.textContent) {
            return res;
        }

        try {
            if (win.getSelection) {
                /* IE */
                res.start = element.selectionStart;
                res.end = element.selectionEnd;
                res.text = element.value.slice(res.start, res.end);
            } else if (doc.selection) {
                /* for IE */
                element.focus();

                var range = doc.selection.createRange(),
                    range2 = doc.body.createTextRange(),
                    tmpLength;

                console.log("range:"+range);
                console.log("range2:"+range2);
                console.log("tmpLength:"+tmpLength);
                res.text = range.text;

                try {
                    range2.moveToElementText(element);
                    range2.setEndPoint('StartToStart', range);
                } catch (e) {
                    range2 = element.createTextRange();
                    range2.setEndPoint('StartToStart', range);
                }

                res.start = element.value.length - range2.text.length;
                res.end = res.start + range.text.length;
            }
        } catch (e) {
        }

        return res;
    };


    var _CaretOperation = {

        getPos: function(element) {
            var tmp = _getCaretInfo(element);
            return {start: tmp.start, end: tmp.end};
        },

        setPos: function(element, toRange, caret) {
            caret = this._caretMode(caret);

            if (caret == 'start') {
                toRange.end = toRange.start;
            } else if (caret == 'end') {
                toRange.start = toRange.end;
            }

            element.focus();
            try {
                if (element.createTextRange) {
                    var range = element.createTextRange();

                    if (win.navigator.userAgent.toLowerCase().indexOf("msie") >= 0) {
                        toRange.start = element.value.substr(0, toRange.start).replace(/\r/g, '').length;
                        toRange.end = element.value.substr(0, toRange.end).replace(/\r/g, '').length;
                    }

                    range.collapse(true);
                    range.moveStart('character', toRange.start);
                    range.moveEnd('character', toRange.end - toRange.start);

                    range.select();
                } else if (element.setSelectionRange) {
                    element.setSelectionRange(toRange.start, toRange.end);
                }
            } catch (e) {

            }
        },

        getText: function(element) {
            return _getCaretInfo(element).text;
        },

        _caretMode: function(caret) {
            caret = caret || "keep";
            if (caret == false) {
                caret = 'end';
            }

            switch (caret) {
                case 'keep':
                case 'start':
                case 'end':
                    break;

                default:
                    caret = 'keep';
            }

            return caret;
        },

        replace: function(element, text, caret) {
            var tmp = _getCaretInfo(element),
                orig = element.value,
                pos = $(element).scrollTop(),
                range = {start: tmp.start, end: tmp.start + text.length};

            element.value = orig.substr(0, tmp.start) + text + orig.substr(tmp.end);

            $(element).scrollTop(pos);
            this.setPos(element, range, caret);
        },

        insertBefore: function(element, text, caret) {
            var tmp = _getCaretInfo(element),
                orig = element.value,
                pos = $(element).scrollTop(),
                range = {start: tmp.start + text.length, end: tmp.end + text.length};

            element.value = orig.substr(0, tmp.start) + text + orig.substr(tmp.start);

            $(element).scrollTop(pos);
            this.setPos(element, range, caret);
        },

        insertAfter: function(element, text, caret) {
            var tmp = _getCaretInfo(element),
                orig = element.value,
                pos = $(element).scrollTop(),
                range = {start: tmp.start, end: tmp.end};

            element.value = orig.substr(0, tmp.end) + text + orig.substr(tmp.end);

            $(element).scrollTop(pos);
            this.setPos(element, range, caret);
        }
    };

    /* jQuery.selection*/
    $.extend({

        selection: function(mode) {
            var getText = ((mode || 'text').toLowerCase() == 'text');

            try {
                if (win.getSelection) {
                    if (getText) {
                        // get text
                        return win.getSelection().toString();
                    } else {
                        // get html
                        var sel = win.getSelection(), range;

                        if (sel.getRangeAt) {
                            range = sel.getRangeAt(0);
                        } else {
                            range = doc.createRange();
                            range.setStart(sel.anchorNode, sel.anchorOffset);
                            range.setEnd(sel.focusNode, sel.focusOffset);
                        }

                        return $('<div></div>').append(range.cloneContents()).html();
                    }
                } else if (doc.selection) {
                    if (getText) {
                        // get text
                        return doc.selection.createRange().text;
                    } else {
                        // get html
                        return doc.selection.createRange().htmlText;
                    }
                }
            } catch (e) {

            }

            return '';
        }
    });
    
    $.fn.extend({
    	htmlselect: function() {
    	    var html = "";
    	    if (typeof window.getSelection != "undefined") {
    	        var sel = window.getSelection();
    	        if (sel.rangeCount) {
    	            var container = document.createElement("div");
    	            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
    	                container.appendChild(sel.getRangeAt(i).cloneContents());
    	            }
    	            html = container.innerHTML;
    	        }
    	    } else if (typeof document.selection != "undefined") {
    	        if (document.selection.type == "Text") {
    	            html = document.selection.createRange().htmlText;
    	        }
    	    }
    	    return html;
    	}
    });

    /* selection */
    $.fn.extend({
        selection: function(mode, opts) {
            opts = opts || {};

            switch (mode) {
                case 'getPos':
                    return _CaretOperation.getPos(this[0]);
                    break;

                case 'setPos':
                    return this.each(function() {
                        _CaretOperation.setPos(this, opts);
                    });
                    break;

                case 'replace':
                    return this.each(function() {
                        _CaretOperation.replace(this, opts.text, opts.caret);
                    });
                    break;

                case 'insert':
                    return this.each(function() {
                        if (opts.mode == 'before') {
                            _CaretOperation.insertBefore(this, opts.text, opts.caret);
                        } else {
                            _CaretOperation.insertAfter(this, opts.text, opts.caret);
                        }
                    });

                    break;

                case 'get':
                default:
                    return _CaretOperation.getText(this[0]);
                    break;
            }

            return this;
        }
    });
    
    /* selection */
    $.fn.extend({
        story: function() {
            var html = "<div><input id='story-extract' name='story-extract' type='button' value='extract' onclick='$().makeStory($(\"body\").htmlselect());' /><div id='storyPlayer'></div></div>";
            
            return html;
        }
    });
    
    /* make story */
    $.fn.extend({
    	makeStory: function(story) {
                $( "#loadingDiv" ).dialog({
                                        height:132,
                                        width:260,
                                        modal: true
                                        });
    		$.get('/process', {paragraph:story
                }).done(function(data){
                    $( "#loadingDiv" ).dialog('close');
                    makeHtml(data, function(htmlstr){
                            //alert(html);
                            $("#storyPlayer").html(htmlstr);
                            $( "#storyPlayer" ).dialog({
                            height: 650,
                            width:900,
                            modal: true
                            });
                    });
    		});
//    		var story = "<div id='bb-bookblock' class='bb-bookblock' style='overflow:hidden; margin:5px; padding:5px; border:solid red;'><link rel='stylesheet' type='text/css' href='/css/default.css' /><link rel='stylesheet' type='text/css' href='/css/bookblock.css' /><link rel='stylesheet' type='text/css' href='/css/demo1.css' /><div class='bb-item'>Once upon a time there were three little pigs.<img src='http://www.v-ixtt.com/news_attachments/6_28_201315310AM_628366130_2.jpg' alt='image01' width='200' height='200'/></div><div class='bb-item'>Once upon a time there were three little pigs.<img src='http://3.bp.blogspot.com/_zilFNcOEQRw/Sfm4GYV-cXI/AAAAAAAAD0E/_c7uQpMIYSg/s800/sw1.jpg' alt='image01' width='200' height='200'/></div><div class='bb-item'>Once upon a time there were three little pigs.<img src='http://4.bp.blogspot.com/-sPFgwRup8eY/UPJW2TJTjtI/AAAAAAAABPE/KtxZPpYRtoY/s1600/3rd%2B-little-pigs.jpg' alt='image01' width='200' height='200'/></div><div><audio controls><source src='http://media.tts-api.com/0aaeeadde2f395c134a640fff8c04b6e1016155f.mp3' type='audio/mpeg'><source src='http://media.tts-api.com/fc1694c82a33913858410af42d79c3802f3a0389.mp3' type='audio/mpeg'><source src='http://media.tts-api.com/5fb949dc2f5137b52fcf2a54c1a83fb776af928c.mp3' type='audio/mpeg'></audio></div><script src='/js/modernizr.custom.js'></script><script src='https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js'></script><script src='/js/jquerypp.custom.js'></script><script src='/js/jquery.bookblock.js'></script><script> var Page = (function() {	var config = {		$bookBlock : $( '#bb-bookblock' )	},	init = function() {	config.$bookBlock.bookblock( {		speed : 5000,		shadowSides : 1.8,		shadowFlip : 1.7,		autoplay : true,		interval : 3000,		circular : false,		shadow : true	});};	return { init : init };	})();	Page.init();</script></div>";
//    		$("#storyPlayer").html(story);
    	}
    }); 
    
    
})(jQuery, window, window.document);

function makeHtml1(jsonStr, next){
	var json = JSON.parse(JSON.stringify(eval("("+jsonStr+")")));
	console.log(json.items[0]);
	//var items = json.items;
	
	var story = "<div id='bb-bookblock' class='bb-bookblock' style='overflow:hidden; margin:5px; padding:5px; border:solid red;'>" +
	"<link rel='stylesheet' type='text/css' href='/css/default.css' />" +
	"<link rel='stylesheet' type='text/css' href='/css/bookblock.css' />" +
	"<link rel='stylesheet' type='text/css' href='/css/demo1.css' />";
	
	var i = 0;
	for(i=0; i < json.items.length; i++){
		 story += "<div class='bb-item'>" + json.items[i].text +
		"<img src='"+json.items[i].image+"' alt='image01' width='200' height='200'/>" +
		"</div>";
	}
	story += "<div><audio controls>";

	for(i=0; i<json.items.length; i++){
		story += "<source src='"+json.items[i].audio+"' type='audio/mpeg'>";
	}
	story += "</audio></div>" +
	"<script src='/js/modernizr.custom.js'></script><script src='https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js'></script>" +
	"<script src='/js/jquerypp.custom.js'></script><script src='/js/jquery.bookblock.js'></script>" +
	"<script>" +
	" var Page = (function() {" +
	"	var config = {" +
	"		$bookBlock : $( '#bb-bookblock' )" +
	"	}," +
	"	init = function() {" +
	"	config.$bookBlock.bookblock( {" +
	"		speed : 5000," +
	"		shadowSides : 1.8," +
	"		shadowFlip : 1.7," +
	"		autoplay : true," +
	"		interval : 3000," +
	"		circular : false," +
	"		shadow : true" +
	"	});};" +
	"	return { init : init };" +
	"	})();" +
	"	Page.init();" +
	"</script>" +
	"</div>";
	next(story);
}


function makeHtml(jsonStr, next){
	var json = JSON.parse(JSON.stringify(eval("("+jsonStr+")")));
	console.log(json.items[0]);
	//var items = json.items;
	
	 var html = '<div id="magazine"><div class="book-title book-page">'+json.concept+'</div>';
		var i = 0;
		for(i=0; i < json.items.length; i++){
			html += "<div><div class='book-page'>" +
						"<div class='page-image'><img src='"+json.items[i].image+"' alt='image01' width='200' height='200'/></div>" +
						"<div class='page-text'>" + json.items[i].text + "</div>" +
						"<div class='page-audio'><audio controls><source src='"+json.items[i].audio+"' type='audio/mpeg'></audio></div>" +
					"</div></div>";
		}
		html += '<div class="book-end book-page">The End</div>';
		 
		html += '</div>';
	    html += '<link rel="stylesheet" type="text/css" href="css/mag.css" />';
	    html += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>';
	    html += '<script src="js/turn.js"></script>';
	    html += '<script>';
	    html += '$("#magazine").turn({gradients: true, acceleration: true}); $("#magazine").turn("size", 800, 500);';
	    html += '</script>';
	next(html);
}