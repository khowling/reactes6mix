"use strict";

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var rest = require('restler'),
    Redis = require('ioredis'),
    redis = new Redis(process.env.REDIS_URL || 'localhost');
app.use('/assets', express.static('assets'));
app.use(express.static('build/static'));

// create application/json parser
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(session({secret: 'reakky123', resave: true, saveUninitialized: true}));

app.set('views', 'build/views');
app.set('view engine', 'mustache');
app.engine('mustache', require('hogan-middleware').__express);

function getData(key, canvasobj) {
  return new Promise((resolve, reject) => {

    rest.get ( canvasobj.client.instanceUrl +  canvasobj.context.links.queryUrl, {
      headers: {
        'Authorization': 'Bearer ' +canvasobj.client.oauthToken,
      } ,
      query: {
        q:`select Id, khowling__Bid__r.Name, khowling__Bid__r.khowling__Contract_Term__c,  khowling__Router_Selection__r.Name, khowling__Router_Selection__r.khowling__Cost__c, khowling__Router_Selection__r.khowling__Markup__c, khowling__Access_Method__r.Name, khowling__Access_Method__r.khowling__One_Off_Cost__c, khowling__Access_Method__r.khowling__Recurring_Cost__c, khowling__Access_Method__r.khowling__Markup__c, khowling__Bandwidth__c from khowling__Bid_Site__c where khowling__Bid__c = '${canvasobj.context.environment.record.Id}'`
      }
    }).on('complete', (sfrecs) => {
      console.log (JSON.stringify(sfrecs));
      if (sfrecs.records && sfrecs.records.length >0) {
        let leavers = {
          term: parseInt(sfrecs.records[0].khowling__Bid__r.khowling__Contract_Term__c),
          port_discount: 0,
          access_markup: 0,
          cpe_hardware: true,
          amort_oneoff: 0
        };

        let pnl = calcpnl (sfrecs.records, leavers);

        redis.hmset(`${key}:data`, {
            pnl: JSON.stringify(pnl),
            leavers: JSON.stringify(leavers),
            sfrecs: JSON.stringify(sfrecs.records)
          }).then((succ) =>
            redis.lpush(key, "done"), (succ) =>
              resolve(succ));

      }
    }).on('error', (err) => {
			console.error('error', err);
			reject('err : ' + err);
		}).on ('fail', (err) => {
			console.error('fail', err);
			reject('fail : ' + err);
		});
  })
}

function calcpnl (sfrecs, leavers) {
  let pnl = {
    revenue: 0.0,
    grossmargin: 0.0,
  };

  for (let r of sfrecs) {
    let router_1cost = r.khowling__Router_Selection__r.khowling__Cost__c,
        router_price = router_1cost + (r.khowling__Router_Selection__r.khowling__Markup__c * router_1cost),
        access_1cost = r.khowling__Access_Method__r.khowling__One_Off_Cost__c,
        access_ncost = r.khowling__Access_Method__r.khowling__Recurring_Cost__c * leavers.term,
        access_price = access_1cost  + (r.khowling__Access_Method__r.khowling__Markup__c * access_1cost)  + access_ncost  + (r.khowling__Access_Method__r.khowling__Markup__c * access_ncost),
        revenue = router_price + access_price,
        grossmargin = revenue - router_1cost - access_1cost - access_ncost;

    pnl.revenue+= revenue;
    pnl.grossmargin+= grossmargin;
  }
  pnl.marginage = ((pnl.grossmargin / pnl.revenue) * 100).toFixed(2);
  return pnl;
}

app.post('/recalc', jsonParser, function(req, res) {
  let leavers = req.body;
  console.log (`leavers ${JSON.stringify(leavers)}`);

  if (!req.session.signedreq)
    res.status(400).send("not authorized");
  else if (!req.session.sfdatakey)
    res.status(400).send("no data stored");
  else
    redis.hgetall(`${req.session.sfdatakey}:data`, (err, data) => {
      if (err)
        res.status(400).send(err);
      else {
        let newleavers = Object.assign({}, JSON.parse(data.leavers), leavers);
        res.json({leavers: newleavers, pnl: calcpnl(JSON.parse(data.sfrecs), newleavers)});
      }
    });
});

app.get('/go', function(req, res){
  let token = '00D58000000Hlh6!ARMAQE4PVltEI1Dsgug9alAyeMEChiQX.TlwdrrT7C6h3s0_oqrNs3MEFqn5ah3Gv9ejDjHBuMk0QHo4ncljJ4D0gbUOeBRl';
  let json_envelope = '{"algorithm":"HMACSHA256","issuedAt":1677461276,"userId":"00558000000R5HUAA0","client":{"refreshToken":null,"instanceId":"09H58000000PH5i:","targetOrigin":"https://kforce-dev-ed.my.salesforce.com","instanceUrl":"https://kforce-dev-ed.my.salesforce.com","oauthToken":"'+token+'"},"context":{"user":{"userId":"00558000000R5HUAA0","userName":"khowling@dev.org","firstName":"keith","lastName":"howling","email":"khowling@gmail.com","fullName":"keith howling","locale":"en_GB","language":"en_US","timeZone":"Europe/London","profileId":"00e58000000WBp8","roleId":null,"userType":"STANDARD","currencyISOCode":"GBP","profilePhotoUrl":"https://kforce-dev-ed--c.eu6.content.force.com/profilephoto/005/F","profileThumbnailUrl":"https://kforce-dev-ed--c.eu6.content.force.com/profilephoto/005/T","siteUrl":null,"siteUrlPrefix":null,"networkId":null,"accessibilityModeEnabled":false,"isDefaultNetwork":true},"links":{"loginUrl":"https://kforce-dev-ed.my.salesforce.com","enterpriseUrl":"/services/Soap/c/35.0/00D58000000Hlh6","metadataUrl":"/services/Soap/m/35.0/00D58000000Hlh6","partnerUrl":"/services/Soap/u/35.0/00D58000000Hlh6","restUrl":"/services/data/v35.0/","sobjectUrl":"/services/data/v35.0/sobjects/","searchUrl":"/services/data/v35.0/search/","queryUrl":"/services/data/v35.0/query/","recentItemsUrl":"/services/data/v35.0/recent/","chatterFeedsUrl":"/services/data/v31.0/chatter/feeds","chatterGroupsUrl":"/services/data/v35.0/chatter/groups","chatterUsersUrl":"/services/data/v35.0/chatter/users","chatterFeedItemsUrl":"/services/data/v31.0/chatter/feed-items","userUrl":"/00558000000R5HUAA0"},"application":{"name":"vf-flex","canvasUrl":"https://vf-flex.herokuapp.com","applicationId":"06P58000000PH7e","version":"1.0","authType":"SIGNED_REQUEST","referenceId":"09H58000000PH5i","options":[],"samlInitiationMethod":"None","developerName":"vf_flex","isInstalledPersonalApp":false,"namespace":"khowling"},"organization":{"organizationId":"00D58000000Hlh6EAC","name":"salesforce","multicurrencyEnabled":false,"namespacePrefix":"khowling","currencyIsoCode":"GBP"},"environment":{"locationUrl":"https://kforce-dev-ed.my.salesforce.com/canvas/proxy.jsp?a=%7B%22referenceId%22%3A%2209H58000000PH5i%22%7D&ns=undefined&dn=undefined&ri=09H58000000PH5i&s=00D58000000Hlh6!ARMAQM2DDXYRQ.nZD4TfWLQa6k2cdOOyz1CHuoTcFoPfD60ZFPeAi6LX46gJGRdK.56mBtRUKS.O.VeAJbEG6X4EF_APBrLl&sr=&dm=https://kforce-dev-ed.my.salesforce.com&o=%7B%22frameborder%22%3A%220%22%2C%22width%22%3A%7B%22value%22%3A%22100%25%22%2C%22max%22%3A%221200px%22%7D%2C%22height%22%3A%7B%22value%22%3A%22200px%22%2C%22max%22%3A%22infinite%22%7D%2C%22scrolling%22%3A%22no%22%2C%22displayLocation%22%3A%22PageLayout%22%2C%22showLoadingStatus%22%3Atrue%2C%22record%22%3A%7B%22Id%22%3A%22a05580000004Dwn%22%2C%22fields%22%3A%22%22%7D%2C%22clientWidth%22%3A%221197px%22%2C%22clientHeight%22%3A%2230px%22%7D&v=35.0","displayLocation":"PageLayout","sublocation":null,"uiTheme":"Theme3","dimensions":{"width":"100%","height":"200px","maxWidth":"1200px","maxHeight":"infinite","clientWidth":"1197px","clientHeight":"30px"},"parameters":{},"record":{"attributes":{"type":"khowling__Bid__c","url":"/services/data/v35.0/sobjects/khowling__Bid__c/a05580000004DwnAAE"},"Id":"a05580000004DwnAAE"},"version":{"season":"WINTER","api":"35.0"}}}}';
  req.session.signedreq = JSON.parse(json_envelope);
  req.session.sfdatakey = `sfdata:${req.sessionID}:${req.session.signedreq.context.environment.record.Id}`;
  getData (req.session.sfdatakey, req.session.signedreq);
  res.render('index', {canvas_req: json_envelope});
});

app.get('/data', (req, res) => {
  if (!req.session.signedreq)
    res.status(400).send("not authorized");
  else if (!req.session.sfdatakey)
    res.status(400).send("no data request recorded");
  else
    redis.blpop(req.session.sfdatakey, 10, (err, reply) => {
      if (err)
        res.status(400).send(err);
      else {
        redis.hgetall(`${req.session.sfdatakey}:data`, (err, data) => {
          if (err)
            res.status(400).send(err);
          else {
            res.json({leavers: JSON.parse(data.leavers), pnl: JSON.parse(data.pnl)});
          }
        });
      }
    });
});

var CONSUMER_SECRET = '141664825981593229';
app.post('/',  urlencodedParser, function(req, res){

		console.log ('got the post from salesforce ' + req.body);

		var   sreq = req.body.signed_request
			, sreq_split = sreq.split('.')
			, encodedSig = sreq_split[0]
			, encodedEnvelope = sreq_split[1]
			, crypto = require('crypto');

		var json_envelope = new Buffer(encodedEnvelope, 'base64').toString('utf8');
		console.log ('json envelope : ' + json_envelope);

		/*  verify signature  */
		var algorithm, canvasRequest;
		try {
			canvasRequest = JSON.parse(json_envelope);
			algorithm = canvasRequest.algorithm ? "HMACSHA256" : canvasRequest.algorithm;
		} catch (e) {
			throw 'Error deserializing JSON: '+ e;
		}

		// check algorithm - not relevant to error
		if (!algorithm || algorithm.toUpperCase() !== 'HMACSHA256') {
			throw 'Unknown algorithm '+algorithm+'. Expected HMACSHA256';
		}

		expectedSig = crypto.createHmac('sha256', CONSUMER_SECRET).update(encodedEnvelope).digest('base64');
		if (encodedSig !== expectedSig) {
			throw 'Bad signed JSON Signature!';
		}
    req.session.signedreq = json_envelope;
		res.render('index', {canvas_req: json_envelope});
});

console.log (`Connecting Redis ...... [${process.env.REDIS_URL}]`);
redis.on('connect', function () {
  app.listen(process.env.PORT || 5000);
});

redis.on('error', function (e) {
  console.error ('Redis error',e);
//  client.end();
});
