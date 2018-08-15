const PORT = 3005;
const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const routes = require('./router/router.js');
const chalk = require('chalk');
const ejs = require('ejs');

//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
	secret: 'bakribilli',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge:900000},
    store: new MemoryStore({
      //checkPeriod: 86400000 // prune expired entries every 24h
    })
}));

app.use('/public',express.static(path.join(__dirname,'public')));

app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'views')));
app.listen(PORT,()=>console.log(chalk.blue('*listening on ')+chalk.red(PORT)));

app.use('/',routes);