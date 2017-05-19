// require our dependencies
var express = require('express')
var expressLayouts = require('express-ejs-layouts')
var bodyParser = require('body-parser')
var app = express()
var port = process.env.PORT || 8080

const URI = 'http://blackops.dev'

var WPAPI = require('wpapi')
var wp = new WPAPI({
	endpoint: URI + '/wp-json/'
})

// Grab all of the categories and store them in the global scope
wp.categories().perPage(100).then(function(response){
	app.set('categories', response)
})

// Grab the WordPress settings and store them in the global scope
wp.settings().then(function(response){
	app.set('settings', response)
})


// use ejs and express layouts
app.set('view engine', 'ejs')
app.use(expressLayouts)

// use body parser
app.use(bodyParser.urlencoded({
	extended: true
}))

// set static files (css and images, etc) location
app.use(express.static(__dirname + '/public'))

// route our app
var router = require('./app/routes')
app.use('/', router)

// start the server
app.listen(port, function() {
	console.log('app started')
})
