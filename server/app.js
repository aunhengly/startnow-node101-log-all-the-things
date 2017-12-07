const express = require('express');
const fs = require('fs');
const morgan = require('morgan')

const app = express();

var info = [];
var counter = 0;
app.use(morgan('dev'));

var headers=['Agent','Time','Method', 'Resource', 'Version', 'Status']
app.use((req, res, next) => {
// write your logging code here
    var date = new Date();
    info = [
            req.headers['user-agent'].replace(/,/g, ';'), //in Regex (regular expression) the /,/g, g=global, /,/ find the ','. for more: https://www.regexpal.com/
            date.toISOString(),
            req.method,
            req.url,
            "HTTP/" + req.httpVersion,
            res.statusCode
        ].join(',');

        fs.stat('./logfiles/log'+ counter +'.csv', function(err, stats){
            if (err) console.log(err);
            if(!stats){
                fs.appendFile('./logfiles/log'+ counter +'.csv', headers ,function(err){
                    if(err) throw err;
                    console.log(info);
                });
            } 
            fs.appendFile('./logfiles/log'+ counter +'.csv', '\n' + info, next)    
        });
    });

app.get('/', (req, res) => {
// write your code to respond "ok" here
    res.send('ok');
});

app.get('/logs', (req, res) => {
// write your code to return a json object containing the log data here
    fs.readFile('./logfiles/log'+ counter +'.csv', "utf8", (err, data) =>{
        if(err) throw err;
        var logs = data.split('\n');
        var array = [];
        logs.forEach(function(log){
            var logAttr= log.split(',');
            var values = {};
            headers.forEach(function(header,i){
                values[header] = logAttr[i];
            });
            array.push(values);    
        });
            if (logs.length > 3){
                counter += 1;
            }
            res.json(array.slice(1));
    });  
});


app.get('/logs/all', function(req, res){
    var all=[];
    for(var i=0; i <=counter ; i++){
        var result = fs.readFileSync('./logfiles/log' + i + '.csv', 'utf8') 
        let logs = result.split('\n');
        logs.shift();   
        all = [...all, ...logs] //... mean combine all and spread all elements in the array.
    }
    res.json(all);
});

app.get('*', function(req, res){
    res.status(404).send("The resource requested is not found");
});
module.exports = app;