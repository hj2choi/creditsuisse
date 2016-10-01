var TEAM_UID = "yPlWaf6NAoM6yjTTEs4_5g";
var SYMBOLS = ["0005","0001","0388","0386","3988"];

var express = require('express')
var request = require('request')
var app = express()
var path = require('path')

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

var stocks = {"0005":[{qty:1, price:5},{qty:3, price:15}],"0001":[{qty:1, price:5},{qty:3, price:15}]};

var team_data;
var market_data_1;
var market_data_2;
var market_data_3;
var historical_market_data_1;
var historical_market_data_2;
var historical_market_data_3;

//////////////////////////////////////////////////////////////////////////////////////////////
// helper functions
//////////////////////////////////////////////////////////////////////////////////////////////
function pullMarketData_1(callback) {
  request.get('http://cis2016-exchange1.herokuapp.com/api/market_data', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log("pulled market_data_1");
      callback(body);
    }
  })
}
function pullMarketData_2(callback) {
  request.get('http://cis2016-exchange2.herokuapp.com/api/market_data', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log("pulled market_data_2");
      callback(body);
    }
  })
}
function pullMarketData_3(callback) {
  request.get('http://cis2016-exchange3.herokuapp.com/api/market_data', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log("pulled market_data_3");
      callback(body);
    }
  })
}


function pullTeamData(callback) {
  request.get('http://cis2016-teamtracker.herokuapp.com/api/teams/'+TEAM_UID, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("pulled team_data");
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
      pullTeamData(function(){});
      //TODO: update stock data here. body is a response data.


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
      pullTeamData(function(){});
      //TODO: update stock data here. body is a response data.


      callback(body);
    } else {
      console.log("ERR createSellRequest(): "+error);
    }
  })
}

//////////////////////////////////////////////////////////////////////////////////////////////
// automated scripts
//////////////////////////////////////////////////////////////////////////////////////////////
function repeatPullMarketData_1(data) {
  market_data_1=data;
  pullMarketData_1(repeatPullMarketData_1);
}
pullMarketData_1(function(data) {
  repeatPullMarketData_1(data);
});

function repeatPullMarketData_2(data) {
  market_data_2=data;
  pullMarketData_2(repeatPullMarketData_2);
}
pullMarketData_2(function(data) {
  repeatPullMarketData_2(data);
});

function repeatPullMarketData_3(data) {
  market_data_3=data;
  pullMarketData_3(repeatPullMarketData_3);
}
pullMarketData_3(function(data) {
  repeatPullMarketData_3(data);
});


// team data every 5 secs, also after buy or sell
function repeatPullTeamData(data) {
  team_data=data;
  setTimeout(pullTeamData,5000,repeatPullTeamData);
}
pullTeamData(function(data){
  repeatPullTeamData();
});

//////////////////////////////////////////////////////////////////////////////////////////////
// front-end APIs
//////////////////////////////////////////////////////////////////////////////////////////////
app.get('/bashboard', function(req,res) {
	res.sendFile(path.join(__dirname+'/view/bashboard.html'));
});

app.get('/api/market_data_1', function(req, res) {
  res.send(market_data_1);
});
app.get('/api/market_data_2', function(req, res) {
  res.send(market_data_2);
});
app.get('/api/market_data_3', function(req, res) {
  res.send(market_data_3);
});

app.get('/api/team_data', function(req, res) {
  res.send(team_data);
});
// remove costly stocks first!

app.get('/', function(req, res) {
  createBuyRequest("0001", 113, 3, false,function(data){console.log(data);});
  res.send("done");
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.	get('port'))
});
