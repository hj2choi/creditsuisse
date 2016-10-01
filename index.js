var TEAM_UID = "yPlWaf6NAoM6yjTTEs4_5g";
var SYMBOLS = ["0005","0001","0388","0386","3988"];

var LONG_MA_CNT = 50;
var SHORT_MA_CNT = 10;
var MA_MEMORY = 5;

var express = require('express')
var request = require('request')
var app = express()
var path = require('path')

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

var stocks = {"0005":[{qty:1, price:5},{qty:3, price:15}],"0001":[{qty:1, price:5},{qty:3, price:15}]};


var profit=0;

var team_data;
var market_data_1;
var market_data_2;
var market_data_3;
var historical_market_data_1;
var historical_market_data_2;
var historical_market_data_3;

var ma_5 = [];
var ma_20 = []; // SYMBOL 0005
var ask_20 = [];

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
      //console.log("pulled team_data");
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
  market_data_1=JSON.parse(data);

  //console.log(market_data_1[0]);
  for (var i=0; i<market_data_1.length; ++i) {
    //console.log(market_data_1[i].symbol);
    if (market_data_1[i].symbol == "0005") {
      var currAsk = market_data_1[i].bid;
      var currBid = market_data_1[i].ask;

      //console.log(currAsk);
      // update recent ask values
      if (ask_20.length<LONG_MA_CNT) {
        ask_20.push(currAsk);
      } else {
        ask_20.splice(0,1);
        ask_20.push(currAsk);
      }

      // update recent ma_20 values
      var tmp_ma_20 = 0;
      if (ma_20.length==0) {
        tmp_ma_20 = currAsk;
      } else {
        //tmp_ma_20 = ma_20[ma_20.length] + (currAsk - ask_20[0]) / ask
        //tmp_ma_20 = (ma_20[ma_20.length-1] * ask_20.length -  ask_20[0] + currAsk) / ask_20.length;
        if (ask_20.length==LONG_MA_CNT) {
          var sum = 0;
          for (var k=0; k<LONG_MA_CNT; ++k) {
            sum+=ask_20[k];
          }
          tmp_ma_20 = sum/LONG_MA_CNT;
        }
      }
      if(ma_20.length < MA_MEMORY){
        ma_20.push(tmp_ma_20);
      }
      else {
        ma_20.splice(0,1);
        ma_20.push(tmp_ma_20);
      }

      // update recent ma_5 values
      var tmp_ma_5 = 0;
      if (ma_5.length==0) {
        tmp_ma_5 = currAsk;
      } else {
        //tmp_ma_5 = (ma_5[ma_5.length-1] * Math.min(ask_20.length, SHORT_MA_CNT) - ask_20[Math.max(ask_20.length - SHORT_MA_CNT,0)] + currAsk) / Math.min(ask_20.length, SHORT_MA_CNT);
        if (ask_20.length==LONG_MA_CNT) {
          var sum = 0;
          for (var k=LONG_MA_CNT-SHORT_MA_CNT; k<LONG_MA_CNT; ++k) {
            sum+=ask_20[k];
          }
          tmp_ma_5 = sum/SHORT_MA_CNT;
        }
      }
      if(ma_5.length < MA_MEMORY){
        ma_5.push(tmp_ma_5);
      }
      else {
        ma_5.splice(0,1);
        ma_5.push(tmp_ma_5);
      }
      // log currAsk, long and short MAs
      //console.log("currAsk = "+currAsk+"     ma_20 = "+ma_20[ma_20.length-1]+"       ma_5 = "+ma_5[ma_5.length-1]);

      var prev_ma20above = false;
      if(ma_5.length == ma_20.length && ask_20.length==LONG_MA_CNT/*&& ma_5.length == 2*/){
        if(ma_20[ma_20.length-2] > ma_5[ma_5.length-2]) prev_ma20above = true;
        //break;
      }

      if(ma_20[ma_20.length - 1] < ma_5[ma_5.length - 1] && prev_ma20above){
        //buy
        createBuyRequest("0005", currAsk, 1, true, function(data){
          // d = JSON.parse(data);
          // if (d.fills[0]) {
          //   profit-=d.fills[0].price;
          // }
          // console.log("profit so far = " + profit);
        });
      }

      // protection mechanism for selling at low price
      if (currAsk==0 || currBid == 0 || currAsk<ma_20*0.8 || currBid<ma_20*0.8) {
        break;
      }
      if(ma_20[ma_20.length - 1] > ma_5[ma_5.length - 1] && !prev_ma20above){
        // sell
        createSellRequest("0005", currBid, 1, true, function(data){
          // d = JSON.parse(data);
          // if (d.fills[0]) {
          //   profit+=d.fills[0].price;
          // }
          // console.log("profit so far = " + profit);
        });
      }

    }
    break;
  }
  //console.log(ask_20);

  pullMarketData_1(repeatPullMarketData_1);
}
pullMarketData_1(function(data) {
  repeatPullMarketData_1(data);
});

function repeatPullMarketData_2(data) {
  market_data_2=JSON.parse(data);
  pullMarketData_2(repeatPullMarketData_2);
}
pullMarketData_2(function(data) {
  repeatPullMarketData_2(data);
});

function repeatPullMarketData_3(data) {
  market_data_3=JSON.parse(data);
  pullMarketData_3(repeatPullMarketData_3);
}
pullMarketData_3(function(data) {
  repeatPullMarketData_3(data);
});


pullSymbolData_1(function() {

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
