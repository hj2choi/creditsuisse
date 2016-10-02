{
	"id":7,
	"name":"Return undefined;",
	"members": ["Hong Joon", "Kevin", "Abay", "Saif"],
  "uid": "yPlWaf6NAoM6yjTTEs4_5g"
}
{"status":"Success","message":"Team was found: Return undefined;",
"next_stage":"Congratulations on achieving Stage 1! From here, make sure you write down any new\n"+
"URL's you come across as you will need to use these in your application! Your next URL to visit:\n"+
"http://cis2016-teamtracker.herokuapp.com/api/teams/{Team UID}?next_stage"}



{"id":14,"name":"Return undefined;",
"uid":"dmdx-gZILTVhit9u-kZ42Q",
"members":"[\"Hong Joon\", \"Kevin\", \"Abay\", \"Saif\"]",
"cash":"998148.0",
"reserved_cash":null,
"0001":null,"0388":"10.0","0005":null,"0386":null,"3988":null,
"0001_reserved":null,"0388_reserved":null,"0005_reserved":null,"0386_reserved":null,"3988_reserved":null,
"stages_complete":["CREATED_TEAM","EXEC_BUY"],
"created_at":"2016-10-01T01:33:41.499Z","updated_at":"2016-10-01T01:46:28.205Z",
"next_stage":"This API will allow you to view your own teams account balances and stock holdings. You may now wish to see what is available to buy and sell on our exchange."+
"To do this go here: http://cis2016-exchange1.herokuapp.com/api/market_data?next_stage"}



URL=
"http://cis2016-exchange1.herokuapp.com/api/market_data?next_stage"
{"market_data":[
  {"symbol":"0005","time":1475285957652.899,"bid":46.35,"ask":46.4},
  {"symbol":"0386","time":1475285957652.9092,"bid":5.79,"ask":5.84},
  {"symbol":"0388","time":1475285957652.9148,"bid":182.55,"ask":182.6},
  {"symbol":"3988","time":1475285957652.919,"bid":6.0,"ask":6.05},
  {"symbol":"0001","time":1475285957652.923,"bid":102.0,"ask":102.05}],
  "next_stage":"This API shows the current bid/ask prices on the exchange. When using this API, remove the '?next_stage' in the url!\n"+
  "If you wish to view the symbol buy/sell limit orders, try hitting(for example): 'http://cis2016-exchange1.herokuapp.com/api/market_data/0001'.\n"+
  "Now try to place a market buy or sell order by doing an HTTP POST to: http://cis2016-exchange1.herokuapp.com/api/orders?next_stage"}



var request = {
	"team_uid":"dmdx-gZILTVhit9u-kZ42Q",
	"side":"buy",
	"symbol": "0388",
	"ask": 182.3,
	"qty": 10,
	"order_type":"market"
};
var response = {
  "id": "d4204b17-ec2c-420d-a446-ac8817704935",
  "team_uid": "dmdx-gZILTVhit9u-kZ42Q",
  "symbol": "0388",
  "side": "buy",
  "qty": 10,
  "order_type": "market",
  "price": null,
  "status": "FILLED",
  "filled_qty": 10
}




Welcome to CodeIT Suisse 2016!
Gather around as a team and read this!

What to do
The aim is to create an application together as a team and make as much money as you can, as quick as you can!
Throughout Saturday, you are free to play with the testing servers however you like. If you run out of money during this test phase, just let us know! -- We are here to help in any way we can!
On Sunday, you will run your final application and see if you can outsmart the other teams around you!

Your team
You team will start off with 1 million in your account that you are free to use how you like.

Where to begin?
To start, our servers first need to know who you and your team are!
Spend one or two minutes to think up a team name amongst you and using any method you wish, start by performing an HTTP POST request to the following URL:

http://cis2016-teamtracker.herokuapp.com/api/teams
Provide any missing information that it may need in the body as json.
When your team is created, please store your secret UID that is generated for your team - you will need this later!
Once you have this ID, validate your secret team UID by visiting the following URL:

http://cis2016-teamtracker.herokuapp.com/api/teams/validate/{TEAM UID}
Once this is successful, check the dashboard on the big screens - this should update and show you have completed the first stage! - Give a loud cheer to show the other teams that you have done it!
Continue to complete the other stages by following the instructions provided when you successfully validated your team!
If at any stage, you wish to view the next stage hint, append '?next_steps' to any of the endpoints you have gathered over time. Once you have all the endpoints collected, this will not need to be appended.
On behalf of everyone here, we wish you the very best of luck!
Remember, reach out to any of us identified by a blue line on our name badges if you encounter any problems or have any questions and we will try our best to help out where we can!
