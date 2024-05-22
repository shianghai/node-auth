// Import required modules
const express = require('express');
const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const cors  = require('cors')
const path = require('path');
const bodyParser = require("body-parser")


// Create an instance of the Express application
const app = express();

// Define a dummy array of clients for demonstration purposes
const clients = [
  { clientId: '123', name: 'Client A' },
  { clientId: '456', name: 'Client B' },
  { clientId: '789', name: 'Client C' }
];

// Function to find a client by its ID
const findByClientId = (clientId, done) => {
  for (let i = 0, len = clients.length; i < len; i++) {
    if (clients[i].clientId === clientId) return done(null, clients[i]);
  }
  return done(new Error('Client Not Found'));
};

// Configure Passport.js to use the bearer strategy
passport.use(
  new BearerStrategy((token, done) => {
    // Call the findByClientId function to find the client
    findByClientId(token, (err, client) => {
      if (err) return done(err);
      if (!client) return done(null, false, { message: 'Invalid access token' });

      // If the client is found, return it as the user
      return done(null, client);
    });
  })
);

// Configure Passport.js to serialize and deserialize the user
passport.serializeUser((user, done) => {
  done(null, user.clientId);
});

passport.deserializeUser((clientId, done) => {
  // Call the findByClientId function to find the client
  findByClientId(clientId, (err, client) => {
    if (err) return done(err);
    return done(null, client);
  }); 
});

// Configure Express application
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
//app.use(passport.initialize());

// Define a route for the protected endpoint
app.get('/api/policy/underwriting/integration', passport.authenticate('bearer', { session: false }), (req, res) => {
  // User authentication was successful
  // Return the same data
  console.log(req.params)
  res.json({ message: 'Authenticated successfully', state: true, data: req.params });
});


app.post('/api/policy/underwriting/integration', (req, res) => {
  const returnData = {
    "state": true,
    "message": "Success",
    "data": {
      "customerCode": "ID0037152",
      "policyNumber": "SAC-6000-23-0092885-P",
      "debitNoteNumber": "PRMDN-23-0110304",
      "policyId": 113580,
      "documents": [{ name: "Fire Schedule", link: "https://www.files.com" }, { name: "Motor Schedule", link: "https://www.files.com" }]
      }
    }
    console.log("sending response");
    res.json(returnData);
});

app.post('/api/v1.0/paysmallsmallrefunds', (req, res) => {
  const returnData = {
    "message": `refund payment of order ${req.body.orderId} in progress`,
    "responseCode": "0000",
    "code": 200,
    "data": {
      "isSuccessful": true,
      "amountToRefund": 200.90
    },
    "subCode": 0,
    "errors": null
  }
  console.log("sending response");
  res.json(returnData);
});

app.get('/schedules', (req, res)=>{
  const schedulePath = path.join(__dirname, 'pdf');
  console.log("schedule type:", req.query.type)
  switch(req.query.type){
    case 'certificate':
      res.sendFile(path.join(schedulePath, 'Cert.pdf'), (err) => {
        if (err) {
          console.log("error", err);
          res.status(500).send("Could Not Get Policy Schedule");
        }
      })
      break;
    case 'receipt':
      res.sendFile(path.join(schedulePath, 'ReceiptVoucher.pdf'), (err) => {
        if (err) {
          console.log("error", err);
          res.status(500).send("Could Not Get Policy Schedule");
        }
      })
      break;


    case 'schedule':
      res.sendFile(path.join(schedulePath, 'Cert.pdf'), (err) => {
        if (err) {
          console.log("error", err);
          res.status(500).send("Could Not Get Policy Schedule");
        }
      })
  }

  
});

app.post('api/accesscard/void', (req, res)=>{
  console.log(req.body);
  res.status(200).json({
    responseCode: "200",
    transactionId: req.body.transactionId,
    orderId: req.body.orderId
  })
});

app.post('api/accesscard/process-refund', (req, res) => {
  res.status(200).send({
    responseCode: "200",
    transactionId: req.body.transactionId,
    orderId: req.body.orderId
  })
});


// Start the server
app.listen(3300, () => {
  console.log('Server is running on http://localhost:3300');
});
