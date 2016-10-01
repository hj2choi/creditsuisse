var TEAM_UID = "dmdx-gZILTVhit9u-kZ42Q"

var express = require('express')
var request = require('request')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))






var buyRequest = {
	"team_uid":TEAM_UID,
	"side":"buy",
	"symbol": "0388",
	"ask": 192,
	"qty": 10,
	"order_type":"market"
};

app.get('/', function(req, res) {
  request.get('http://cis2016-exchange1.herokuapp.com/api/market_data', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("market_data:");
      console.log(body) // Show the HTML for the Google homepage.
    }
  })
  request.post('http://cis2016-exchange1.herokuapp.com/api/orders', buyRequest, function (error, response, body) {
    console.log("sending buy request: ");
    if (!error && response.statusCode == 200) {
      console.log(body) // Show the HTML for the Google homepage.
    } else {
      console.log("ERR: "+error);
    }
  })
  res.send("done");

})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
