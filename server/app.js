var http = require('http');
var crypto = require('crypto');
var querystring = require('querystring');
var templates = require('./templates.js');
var messages = require('./messages')

var port = (process.env.PORT || 1337);
var root = ''

var reHome = new RegExp('^\/$','i');
var reItem = new RegExp('^\/messages\/.*','i');
var reScript = new RegExp('^\/script.js$','i');
var reList = new RegExp('^\/messages$','i')

function handler(req, res){
    root = 'http://' + req.headers.host
    flg = false
    //home
    if(reHome.test(req.url)){
        flg = true
        if(req.method=='GET'){
            sendHtmlHome(req, res);
        }
        else{
            sendHtmlError(req, res, 'Method Not Allowed', 405)
        }
    }

    // script file
    if(flg===false && reScript.test(req.url)) {
        flg=true;
        if(req.method==='GET') {
            sendScript(req, res);
        }
        else {
            sendHtmlError(req, res, 'Method Not Allowed', 405);
        }
    }

    // updata list
    if(flg===false && reList.test(req.url)) {
        flg=true;
        switch(req.method) {
            case 'GET':
                sendHtmlList(req, res);
                break;
            case 'POST':
                postHtmlItem(req, res);
                break;
            default:
                sendHtmlError(req, res, 'Method Not Allowed', 405);
                break;
        }
    }

}

function sendHtmlHome(req, res) {
    var t;

    try {
        t = templates('home.html');
        t = t.replace(/{@host}/g, root);
        sendHtmlResponse(req, res, t, 200);
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }
}

if(flg===false && reItem.test(req.url)) {
    flg=true;
    if(req.method==='GET') {
        sendHtmlItem(req, res, parts[1]);
    }
    else {
        sendHtmlError(req, res, 'Method Not Allowed', 405);
    }
}

function postHtmlItem(req, res) {
    var body, item, rtn, lmDate;

    body = '';
    req.on('data', function(chunk) {
        body += chunk.toString();
    });

    req.on('end', function() {
        try {
            item = messages('add', querystring.parse(body)).item;
            res.writeHead(303,'See Other', {'Location' : root+'/messages/'+item.id});
            res.end();
        }
        catch (ex) {
            sendHtmlError(req, res, 'Server Error', 500);
        }
    });
}

function sendScript(req, res) {
    var t;
  
    try {
        t = templates('script.js');
        t = t.replace(/{@host}/g, root);
        res.writeHead(200, {'Content-Type':'application/javascript; charset=utf-8'});
        res.end(t);
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }
  
}




function sendHtmlResponse(req, res, body, code, lmDate) {
    res.writeHead(code, 
            {'Content-Type' : 'text/html; charset=utf-8',
            'ETag' : generateETag(body),
            // 'Last-Modified' : lmDate});
        });
    res.end(body);
}

function sendHtmlError(req, res, title, code) {
    var body = '<h1>' + title + '<h1>';
    sendHtmlResponse(req, res, body, code);
}

function generateETag(data) {
    var md5;

    md5 = crypto.createHash('md5');
    md5.update(data);
    return '"'+ md5.digest('hex') + '"';
}


http.createServer(handler).listen(port)