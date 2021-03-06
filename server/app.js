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

// setup for  API requests
var cjHeaders = {
    'Content-type' : 'application/json; charset=utf-8' //vnd.collection+json'
};
var reAPIList = new RegExp('^\/api\/$', 'i');
var reAPIItem = new RegExp('^\/api\/.*', 'i');


function handler(req, res){
    root = 'http://' + req.headers.host

    var parts, segments, flg;
    flg = false

    parts = [];
    segments = req.url.split('/');
    for(i=0, x=segments.length; i<x; i++) {
        if(segments[i]!=='') {
            parts.push(segments[i]);
        }
    }

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

    if(flg===false && reItem.test(req.url)) {
        flg=true;
        if(req.method==='GET') {
            sendHtmlItem(req, res, parts[1]);
        }
        else {
            sendHtmlError(req, res, 'Method Not Allowed', 405);
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
            case 'POST':
                postHtmlItem(req, res);
                break;
            default:
                sendHtmlError(req, res, 'Method Not Allowed', 405);
                break;
        }
    }

    // API List
    if(flg===false && reAPIList.test(req.url)) {
        flg=true;
        switch(req.method) {
            case 'GET':
                sendAPIList(req, res);
                break;
            case 'POST':
                postAPIItem(req, res);
                break;
            default:
                sendAPIError(req, res, 'Method Not Allowed', 405);
                break;
        }
    }
    
    // API Item
    if(flg===false && reAPIItem.test(req.url)) {
        flg=true;
        switch(req.method) {
            case 'GET':
                sendAPIItem(req, res, parts[1]);
                break;
            case 'PUT':
                updateAPIItem(req, res, parts[1]);
                break;
            case 'DELETE':
                removeAPIItem(req, res, parts[1]);
                break;
            default:
                sendAPIError(req, res, 'Method Not Allowed', 405);
                break;
        }
    }
    
    // not found
    if(flg===false) {
        sendHtmlError(req, res, 'Page Not Found', 404);
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


function postHtmlItem(req, res) {
    var body, item, rtn, lmDate;

    body = '';
    req.on('data', function(chunk) {
        body += chunk.toString();
    });

    req.on('end', function() {
        try {
            querystring.parse(body)
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

function sendHtmlItem(req, res, id) {
    var t, rtn, item, lmDate;

    try {
        rtn = messages('item', id);
        item = rtn.item;
        //lmDate = rtn.lastDate;
        t = templates('item.html');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@msg}/g, formatHtmlItem(item));
        sendHtmlResponse(req, res, t, 200);
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }
}

function sendAPIItem(req, res, id) {
    var t, rtn, item, lmDate;

    try {
        rtn = messages('item', id);
        item = rtn.item;
        //lmDate = rtn.lastDate;

        t = templates('collection.js');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@list}/g, formatAPIItem(item));
        
        sendAPIResponse(req, res, t, 200);
    }
    catch(ex) {
        sendAPIError(req, res, 'Server Error', 500);
    }
}

function sendAPIList(req, res) {
    var t, rtn, list, lmDate;

    try {
        rtn = messages('list');
        list = rtn.list;
        //lmDate = rtn.lastDate;
        
        t = templates('collection.js');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@list}/g, formatAPIList(list));
        
        // sendAPIResponse(req, res, t, 200, new Date(lmDate).toGMTString());
        sendAPIResponse(req, res, t, 200);
    }
    catch (ex) {
        sendAPIError(req, res, 'Server Error', 500);
    }
}
function updateAPIItem(req, res, id) {
    var body, item, msg;

    body = '';
    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        try {
            msg = eval('('+body+')');
            item = messages('update', id, msg.template.data).item;
            sendAPIItem(req, res, id);
        }
        catch(ex) {
            sendAPIError(req, res, 'Server Error', 500);
        }
    });
}

function removeAPIItem(req, res, id) {
    var t;

    try {
        messages('remove', id);
        t = templates('collection.js');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@list}/g, formatAPIList(messages('list')));
        res.writeHead(204, 'No Content', cjHeaders);
        res.end();
    }
    catch(ex) {
        sendAPIError(req, res, 'Server Error', 500);
    }
}

function postAPIItem(req, res) {
    var body, item, msg;

    body = '';
    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        try {
            // trans data to json input
            // body = body.replace('{', '').replace('}', '').split(',')
            // var wangyu = ''
            // for(i=0; i<body.length; i++){
            //     body[i] = body[i].split(':')
            //     body[i] = "\"" + body[i][0] + "\"" + ":\"" + body[i][1] + "\""
            //     wangyu = wangyu + body[i]
            //     if (i != body.length - 1){
            //         wangyu = wangyu + ","
            //     }
            // }
            // wangyu = "{" + wangyu + "}"
            msg = eval('('+body+')');
            item = messages('APIadd', msg.template.data).item;
            res.writeHead(201, 'Created', {'Location' : root + '/api/' + item.id});
            res.end();
        }
        catch(ex) {
            sendAPIError(req, res, 'Server Error', 500);
        }
    });
}

function formatAPIList(list) {
    var i, x, rtn, item;

    rtn = [];
    for(i=0,x=list.length; i<x; i++) {
        item = {};
        item.href = root + '/api/' + list[i].id;
        item.data = [];
        item.data.push({name:"date", value:list[i].date});
        item.data.push({name:"id", value:list[i].id});
        item.data.push({name:"name", value:list[i].name});
        item.data.push({name:"stuid", value:list[i].stuid});
        item.data.push({name:"tel", value:list[i].tel});
        item.data.push({name:"mail", value:list[i].mail});
        item.data.push({name:"interest", value:list[i].interest});
        rtn.push(item);
    }

    return JSON.stringify(rtn, null, 4);
}

function formatAPIItem(item) {
    var rtn = {};

    rtn.href = root + '/api/' + item.id;
    rtn.data = [];
    rtn.data.push({name:"data", value:item.data});
    rtn.data.push({name:"id", value:item.id});
    rtn.data.push({name:"name", value:item.name});
    rtn.data.push({name:"stuid", value:item.stuid});
    rtn.data.push({name:"tel", value:item.tel});
    rtn.data.push({name:"mail", value:item.mail});
    rtn.data.push({name:"interest", value:item.interest});
    

    return "[" + JSON.stringify(rtn, null, 4) + "]";
}

function sendAPIResponse(req, res, body, code, lmDate) {
    res.writeHead(code, 
        {"Content-Type" : "application/json; charset=utf-8", 
        "ETag" : generateETag(body),
        // "Last-Modified" : lmDate});
    });
    res.end(body);
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

function sendAPIError(req, res, title, code) {
    var err, t;

    err = {collection : {
                version : "1.0", href : "{@host}/api/",
                error : {title : title, code : code}
            }
        };

    t = JSON.stringify(err);
    t = t.replace(/{@host}/g, root);
    res.writeHead(code, 'Server Error', cjHeaders);
    res.end(t)
}


function formatHtmlItem(item) {
    var rtn;

    rtn = '<dl>\n';
    rtn += '<dt>ID</dt><dd>'+item.id+'</dd>\n';
    rtn += '<dt>DATE</dt><dd>'+item.date+'</dd>\n';
    rtn += '<dt>NAME</dt><dd>'+item.name+'</dd>';
    rtn += '<dt>STUID</dt><dd>'+item.stuid+'</dd>';
    rtn += '<dt>TEL</dt><dd>'+item.tel+'</dd>';
    rtn += '<dt>MAIL</dt><dd>'+item.mail+'</dd>';
    rtn += '<dt>INTEREST</dt><dd>'+item.interest+'</dd>';
    rtn += '</dl>\n';

    return rtn;
}

function generateETag(data) {
    var md5;

    md5 = crypto.createHash('md5');
    md5.update(data);
    return '"'+ md5.digest('hex') + '"';
}


http.createServer(handler).listen(port)