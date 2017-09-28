const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const config = require('./config/database')

mongoose.Promise = global.Promise
mongoose.connect(config.database)
// check connection
mongoose.connection.once('open', () => console.log('Connected to MongoDB'))
// check for db errors
mongoose.connection.on('error', err => console.log(err))

// init app
const app = express()

// article model
let Article = require('./models/article')

// load view engine
app.set('views', path.join(__dirname, 'views')) 
app.set('view engine', 'pug')

// body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// parse application/json
app.use(bodyParser.json())

// set public folder
app.use(express.static(path.join(__dirname, 'public')))

// express session middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}))

// express messsages middleware
app.use(require('connect-flash')())
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res)
    next()
})

// express validator middleware
app.use(expressValidator({
    errorFormatter(param, msg, value) {
        const namespace = param.split('.')
        const root = namespace.shift()
        let formParam = root
        while(namespace.length) {
            formParam += `[${namespace.shift()}]`
        }
        return {param: formParam, msg, value}
    }
}))

// passport config
require('./config/passport')(passport)
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null
    next()
})

// home route
app.get('/', (req, res) =>
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err)
        } else {
            res.render('index', {title: 'Articles', articles})
        }        
    }))

// route files
let articles = require('./routes/articles')
let users = require('./routes/users')
app.use('/articles', articles)
app.use('/users', users)

// start server
app.listen(3000, () => console.log('Listening on port 3000!'))