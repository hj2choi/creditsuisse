var TEAM_UID = "yPlWaf6NAoM6yjTTEs4_5g"

var express = require('express')
var request = require('request')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

var market_data;


///////////////////////////////////////////////////////////////////
// functions
///////////////////////////////////////////////////////////////////
function pullMarketData(callback) {
  request.get('http://cis2016-exchange1.herokuapp.com/api/market_data', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("pulled market_data");
      //console.log(body) // Show the HTML for the Google homepage.
      callback(body);
    }
  })
}

function createBuyRequest(symbol, ask, qty, limit, callback) {
  var order_type = "market";
  if (limit) {
    order_type = "limit";
  }

  var requestData = {
  	"team_uid":TEAM_UID,
  	"side":"buy",
  	"symbol": symbol,
  	"ask": ask,
    "price": ask,
  	"qty": qty,
  	"order_type":order_type
  };

  request.post({url:'http://cis2016-exchange1.herokuapp.com/api/orders', formData:requestData}, function (error, response, body) {
    console.log("createBuyRequest(): "+order_type+"_"+symbol+" $"+ask+" x"+qty);
    if (!error && response.statusCode == 200) {
      //console.log(body) // Show the HTML for the Google homepage.
      callback(body);
    } else {
      console.log("ERR createBuyRequest(): "+error);
    }
  })
}


function createSellRequest(symbol, bid, qty, limit, callback) {
  var order_type = "market";
  if (limit) {
    order_type = "limit";
  }

  var requestData = {
  	"team_uid":TEAM_UID,
  	"side":"sell",
  	"symbol": symbol,
  	"bid": bid,
    "price": bid,
  	"qty": qty,
  	"order_type":order_type
  };

  request.post({url:'http://cis2016-exchange1.herokuapp.com/api/orders', formData:requestData}, function (error, response, body) {
    console.log("createSellRequest(): "+order_type+"_"+symbol+" $"+bid+" x"+qty);
    if (!error && response.statusCode == 200) {
      //console.log(body) // Show the HTML for the Google homepage.\
      callback(body);
    } else {
      console.log("ERR createSellRequest(): "+error);
    }
  })
}



app.get('/api/market_data', function(req, res) {
  res.send(market_data);
});

app.get('/', function(req, res) {
  // request.get('http://cis2016-exchange1.herokuapp.com/api/market_data', function (error, response, body) {
  //   if (!error && response.statusCode == 200) {
  //     console.log("market_data:");
  //     console.log(body) // Show the HTML for the Google homepage.
  //   }
  // })
  // request.post({url:'http://cis2016-exchange1.herokuapp.com/api/orders', formData:buyRequest}, function (error, response, body) {
  //   console.log("sending buy request: ");
  //   if (!error && response.statusCode == 200) {
  //     console.log(body) // Show the HTML for the Google homepage.
  //   } else {
  //     console.log("ERR: "+error);
  //   }
  // })
  /*pullMarketData(function(data){console.log(data)});
  createBuyRequest("0001",103,5,false,function(data){
    console.log(data);
    createSellRequest("0001",105,5,false,function(data){console.log(data)});
  });*/

  res.send("done");

})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})


function repeatPullMarketData(data) {
  market_data=data;
  pullMarketData(repeatPullMarketData);
}
pullMarketData(function(data) {
  repeatPullMarketData(data);
});
