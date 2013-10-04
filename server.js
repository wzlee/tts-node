var express     = require('express'),
    https       = require('https'),
    hbs         = require('hbs'),
    path        = require('path'),
    fs          = require('fs'),
    util        = require('util'),
    FS          = require("q-io/fs"),
    app         = express();


/*
app.configure('development', function(){
    app.set("dbURL","mongodb://localhost:27017/node-mongo-ex");
});

app.configure('production', function(){
    app.set("dbURL",process.env.MONGOHQ_URL);
});
*/


app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.engine('html', require('hbs').__express);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

/*----Routes----*/

app.get("/", function (req, res) {
    res.render("index")

});
app.post("/audioTest",  function (req, res) {
    var name = "ryan";
    if (name && req.body.msg) {
        var exec        = require('child_process').exec,
            txtName     = 'tmpAudio.txt',
            message     = req.body.msg,
            audioPath   = path.join(__dirname ,'public/audio',name, '/'),
            wavOutput   = audioPath + 'ttsSample.wav',
            mp3Output   = audioPath + 'ttsSample.mp3',
            fileName    = path.join(audioPath,txtName),
            mp3Response = path.join('audio',name, 'ttsSample.mp3'),
            child;
        console.log("Audio Path is: " + audioPath);

        FS.exists(audioPath).then(function(exists){
            var promise;
            if (!exists) {
                promise = FS.makeDirectory(audioPath).then(FS.write(fileName, message));
            }
            else {
                promise = FS.write(fileName, message)
            }
            //error handling with promise??? maybe simple def check
            promise.then(function(){
                console.log("file created...creating audio output");
                child = exec('cat ' + fileName + ' | text2wave -o ' + wavOutput,
                    function (err, stdout, stderr) {
                        if (err) throw err;
                        console.log('audio output created....compressions');
                        child = exec('lame ' + wavOutput + ' ' + mp3Output, function(err) {
                            if (err) throw err;
                            console.log("compression done!");
                            res.send(200,{audioSource:mp3Response});
                        });
                    });
            });
        });
    }

});

app.listen(app.get('port'), function(){
    console.log("robot server listening on port " + app.get('port'));
});

