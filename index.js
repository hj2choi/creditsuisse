var express = require('express')
var request = require('request')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
/*
request('http://cis2016-exchange1.herokuapp.com/api/market_data', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage.
  }
})

request.get('http://cis2016-exchange1.herokuapp.com/api/market_data').on('response', function(error, response, body) {
    //console.log(response.statusCode) // 200
    //console.log(response.headers['content-type']) // 'image/png'
    console.log(body);
  })
*/
app.get('/', function(req, res) {
  request('http://cis2016-exchange1.herokuapp.com/api/market_data', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Show the HTML for the Google homepage.
    }
  })

})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
