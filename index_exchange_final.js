var TEAM_UID = "qyYHOXILX99RQ657y-OvAQ";
//var SYMBOLS = ["0005","0001","0388","0386","3988"];
var SYMBOLS = ["0005","0001","0388"];
var EXCHANGE_CENTERS_CNT = 3;

var POTENTIAL_PROFIT_THRESHOLD = 1.005;  // potential profit
var VOLUME_THRESHOLD = 20;
var MIN_TRADE_INTERVAL = 2000;

var express = require('express')
var request = require('request')
var app = express()
var path = require('path')

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))


var sellList=[];  // CONSIDER THIS VARIABLE LOCKED
for (var i=0; i<SYMBOLS.length; ++i) {
  sellList[SYMBOLS[i]] = [];
}
var buyList=[];   // CONSIDER THIS VARIABLE LOCKED
for (var i=0; i<SYMBOLS.length; ++i) {
  buyList[SYMBOLS[i]] = [];
}
var dataSyncCounter = [];  // DO NOT MODIFY THIS VARIABLE ELSEWHERE
for (var i=0; i<SYMBOLS.length; ++i) {
  dataSyncCounter[SYMBOLS[i]] = EXCHANGE_CENTERS_CNT;
}
var lastTransactionTime = [];
for (var i=0; i<SYMBOLS.length; ++i) {
  lastTransactionTime[SYMBOLS[i]] = 0;
}

var team_data;

///////////////////////////////////////////////////////////////////////////////////////////
// utility functions
////////////////////////////////////////////////////////////////////////////////////////////
function min(list) {
  // implement me
  if (!list.length) {
    return undefined;
  }
  var currMin = list[0].price;
  var currMinObj = list[0];
  for (var i=0; i<list.length; ++i) {
    if (currMin > list[i].price) {
      currMin = list[i].price;
      currMinObj = list[i];
    }
  }
  return currMinObj;
}

function max(list) {
  // implement me
  if (!list.length) {
    return undefined;
  }
  var currMin = list[0].price;
  var currMinObj = list[0];
  for (var i=0; i<list.length; ++i) {
    if (currMin < list[i].price) {
      currMin = list[i].price;
      currMinObj = list[i];
    }
  }
  return currMinObj;
}

function avg(list) {
  // implement me
  if (!list.length) {
    return undefined;
  }
  var priceSum = 0;
  for (var i=0; i<list.length; ++i) {
    priceSum+=list[i].price;
  }
  return priceSum/list.length;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// helper functions
//////////////////////////////////////////////////////////////////////////////////////////////
function pullSymbolData(exchangevenue, symbol, callback) {
  request.get('http://cis2016-exchange'+exchangevenue+'.herokuapp.com/api/market_data/'+symbol, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(exchangevenue, symbol, body);
    }
  })
}

function pullTeamData(callback) {
  request.get('http://cis2016-teamtracker.herokuapp.com/api/teams/'+TEAM_UID, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(body);
    }
  })
}

function createBuyRequest(venue, symbol, ask, qty, limit, callback) {
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
  request.post({url:'http://cis2016-exchange'+venue+'.herokuapp.com/api/orders', formData:requestData}, function (error, response, body) {
    console.log("createBuyRequest(): "+order_type+"_"+symbol+" $"+ask+" x"+qty);
    if (!error && response.statusCode == 200) {
      pullTeamData(function(){});
      callback(body);
    } else {
      console.log("ERR createBuyRequest(): "+error);
    }
  })
}

function createSellRequest(venue, symbol, bid, qty, limit, callback) {
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
  request.post({url:'http://cis2016-exchange'+venue+'.herokuapp.com/api/orders', formData:requestData}, function (error, response, body) {
    console.log("createSellRequest(): "+order_type+"_"+symbol+" $"+bid+" x"+qty);
    if (!error && response.statusCode == 200) {
      pullTeamData(function(){});
      callback(body);
    } else {
      console.log("ERR createSellRequest(): "+error);
    }
  })
}

//////////////////////////////////////////////////////////////////////////////////////////////
// automated scripts
//////////////////////////////////////////////////////////////////////////////////////////////
// team data every 5 secs, also after buy or sell
function repeatPullTeamData(data) {
  team_data=data;
  setTimeout(pullTeamData,5000,repeatPullTeamData);
}
pullTeamData(function(data){
  repeatPullTeamData();
});


/////////////////////////////////////////////////////////////////////
// pull all pending buy and sell lists from all exchange centers for each symbol
////////////////////////////////////////////////////////////////////

function symbolDataHandler(buyList, sellList, _symbol) {
  //console.log("symbol data handler for "+_symbol);
  // don't allow another transaction for 10 secs
  var currTime = (new Date());
  if ((currTime - lastTransactionTime[_symbol]) < MIN_TRADE_INTERVAL) {
    //console.log("transaction already made");
    return;
  }

  var minSell = min(sellList); // what they sell
  var maxBuy = max(buyList); // what they buy
  // error check
  if (!minSell || !maxBuy) {
    return;
  }
  var potentialMaxProfit = maxBuy.price/minSell.price;
  var tradableVolumeUnderEstimate = Math.min(minSell.volume, maxBuy.volume);

  // if it is tradable, profitable, risk-free, then SELL AND BUY AT THE SAME TIME.
  if (potentialMaxProfit>POTENTIAL_PROFIT_THRESHOLD /*&& riskIndex>RISK_TOLERENCE_THRESHOLD*/ && tradableVolumeUnderEstimate>VOLUME_THRESHOLD) {
    console.log("tradableVolumeUnderEstimate = "+tradableVolumeUnderEstimate);
    // BUY AND SELL
    // TODO: sell extra volumes when running high on stocks
    createBuyRequest(minSell.venue, _symbol, minSell.price, Math.max(tradableVolumeUnderEstimate/6,5), true, function(data) {
      d = JSON.parse(data);
      console.log(d.side + " "+d.status+" $"+d.price+" x"+d.qty);
    });
    createSellRequest(maxBuy.venue, _symbol, maxBuy.price, Math.max(tradableVolumeUnderEstimate/5,5), true, function(data) {
      d = JSON.parse(data);
      console.log(d.side + " "+d.status+" $"+d.price+" x"+d.qty);
    })
    lastTransactionTime[_symbol] = currTime;

  }

}

function assembleAndRepeatPullSymbolData(_venue, _symbol, data){
  //console.log("parse "+_symbol+" Data from exchange "+_venue+" ("+dataSyncCounter[_symbol]+")");
  // reset all data for new incoming dataset
  if (dataSyncCounter[_symbol]==EXCHANGE_CENTERS_CNT) {
    sellList[_symbol]=[];
    buyList[_symbol]=[];
  }
  var dd = JSON.parse(data);
  for (var k in dd.sell){
    sellList[_symbol].push({venue:_venue, price:parseFloat(k), volume:dd.sell[k]});
  }
  for (var k in dd.buy){
    buyList[_symbol].push({venue:_venue, price:parseFloat(k), volume:dd.buy[k]});
  }
  --dataSyncCounter[_symbol];

  // DATA download COMPLETED: handle and repeat
  if (dataSyncCounter[_symbol]==0) {
    symbolDataHandler(buyList[_symbol], sellList[_symbol], _symbol); // sellList and buyList as parameters
    dataSyncCounter[_symbol]=EXCHANGE_CENTERS_CNT;
    initPullSymbolData();
  }

}

function initPullSymbolData() {
  //console.log("initPullSymbolData");
  for (var i=0; i<SYMBOLS.length; ++i) {
    pullSymbolData(1, SYMBOLS[i], assembleAndRepeatPullSymbolData);
    pullSymbolData(2, SYMBOLS[i], assembleAndRepeatPullSymbolData);
    pullSymbolData(3, SYMBOLS[i], assembleAndRepeatPullSymbolData);
  }
}

initPullSymbolData();
