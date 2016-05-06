/* CREDENTIALS */
var messageBirdKey= 'test_WKqa20Mhy44OIWt9Rv9TiDCKU';


// Import the HTTP module
var http = require('http');
var twilio = require('twilio');
var messageBird = require('messagebird')(messageBirdKey);
var express = require('express');
var logger = require('morgan');
var app = express();
//app.use(logger());
// Define the port to listen to (80 is the standard for http:// over IP)
const PORT=8000; 

// List of drivers
var drivers = [];

// URL decoder
function decode(str) {
     return unescape(str.replace(/\_/g, ' '));
}

function passengerRequestsDriver(userData){

}

function driverRequestsDriver(userData){

}

function handlePassengerResponse(userData){
    if (userData['type']=='R'){
        PassengerRequestsDriver(userData);
    }
}


function doesDriverExist(driverData){
    var exists = false;
    for (var i = 0; i < drivers.length && !exists; i++) {
        var old_driver_str = drivers[i];
        var old_driver = JSON.parse(old_driver_str);
        //console.log("Checking against: " + old_driver['phone']);
        if (old_driver['phone'] == driverData['phone']) {
            exists = true;
            /*Updating Driver Information */
            old_driver['lat'] = new_driver['lat'];
            old_driver['lon'] = new_driver['lon'];
            old_driver['name'] = new_driver['name'];
            console.log('updateDriver');
            return true;
        }
    }
    return false;
}


function handleDriverRequest(driverData){
    if (!doesDriverExist(driverData)){
        regsiterDriver(driverData);
    }

    if(driverData['type']=='S'){
        driverRequestsRider(driverData);
    }
}

function registerDriver(driverData) {
    var new_driver = {};
    
    new_driver['lat']   = driverData['lat'];
    new_driver['lon']   = driverData['lon'];
    new_driver['phone'] = driverData['phone'];
    new_driver['name']  = driverData['name'];
    console.log("Incoming phone number: " + phone);
    drivers.push(JSON.stringify(new_driver));
    console.log('registerDriver');
}

// A handler so that the main handleRequest function can be swapped out with the SMS functionality easily
function handleList(data_list) {
    var info = {};
    info['type']    = data_list[0];
    info['lat']     = data_list[1];
    info['lon']     = data_list[2];
    info['phone']   = data_list[3];
    info['message'] = data_list[4];
    info['name']    = data_list[5];

    /*Checks for request type and calls requestHandlers accordingly*/
    if (info['type'] == 'S' || info['type'] == 'U') {
        registerDriver(info); // for now both go to the same function
    }

    if (info['type'] == 'D'){
        handleDriverResponse(info);
    }
    if (info['type'] == 'R'){
        handlePassengerResponse(info);
    }
    // This response is for debugging purposes and will eventually change.
    var response_text = info['type']+'|'+info['lat']+'|'+info['lon']+'|'+info['phone']+'|'+info['message']+'|'+info['name'];
    
    return response_text;
}

function calculateDistance(destination, point){
    var squareSum =Math.pow((destination.lat - point.lat),2) + Math.pow((destination.lng - point.lng));
    return (Math.sqrt(squareSum));

}

function sendMessage(recipients, message){
    var params = {
        'originator': 'MessageBird',
        'recipients': recipients, // recipients is an array
        'body': message
    };

    messageBird.messages.create(params, function (err, data) {
    if (err) {
        return console.log(err);
    }
    console.log(data);
    });
}

// The function which handles requests and send response
function handleRequest(request, response){
    var raw_data = decode(request.url.slice(1));
    var data_list = raw_data.split('|');
    var response_text = '';
    if (data_list.length == 6) {
        response_text = handleList(data_list);
    } else {
        response_text = 'ERROR: Incorrect number of fields.\n';
    }
    response.write(response_text, 'ascii');
    response.end();
}

//Create the server
app.all('*',handleRequest)
var server = http.createServer(app);

// Start the server
server.listen(process.env.PORT || PORT, function(){
    // Triggered when server is listening.
    console.log('Server listening on: http://localhost:%s', PORT);
});

//sendMessage(['971563052935'], 'MessageBird working');
