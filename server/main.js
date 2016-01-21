var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
app.use('/assets', express.static('assets'));
app.use(express.static('build/static'));

// create application/json parser
var jsonParser = bodyParser.json()

app.use(session({secret: 'reakky123', resave: true, saveUninitialized: true}));

app.set('views', 'build/views');
app.set('view engine', 'mustache');
app.engine('mustache', require('hogan-middleware').__express);

app.get('/go', function(req, res){
  res.render('index', {title: "Working"});
});

app.post('/',  jsonParser, function(req, res){

		console.log ('got the post from salesforce');

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

		expectedSig = crypto.createHmac('sha256', secret).update(encodedEnvelope).digest('base64');
		if (encodedSig !== expectedSig) {
			throw 'Bad signed JSON Signature!';
		}
    req.session.signedreq = json_envelope;
		res.render('index', {canvas_req: json_envelope});
	});

  app.listen(process.env.PORT || 5000);
