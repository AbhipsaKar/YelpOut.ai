#!/usr/bin/env node

//  YELPOUT.AI SERVER
//  Author:  August Weinbren, Zixu Cheng (Cade)
//  Description:  From the created data tables in the a variety of API methods were created to develop an API that held to RESTful API principles.
//                As outlined by Red Hat (2020), the relevant architectural principles for our particular website are:
//                  -  Dividing source code between server and client, and storing resources elsewhere
//                  -  Storing no client information between GET requests, with all GET requests independent of eachother
//                  -  Data that is cacheable on client-side after retrieval from server
//                  -  Self-descriptive and easily modifiable GET request methods to allow for straightforward customisation of GET requests
//  Version: 1.0.1
//
//  Notes:
//  For the API the following functions need to be supported:
//     - weightsInEachState
//     - getTop100RestaurantsInEachStateWithSelectedAttributes
//     - NumberOfRestaurantsInEachWithAndWithoutEachSingleAttribute
//     - NumberOfRestaurantsInEachWithAndWithoutEachAttributeOfEachStarRating

//  Install Instructions
//      npm install moment mysql express ejs ....  
//         OR Groups will get more credit if they use
//      npm install and npm start shortcuts and include a package.json file
//          - See https://docs.npmjs.com/creating-a-package-json-file


var portNumber = 8871;
var mysql = require('mysql');
// MySQL Connection Variables
var dotenv = require('dotenv').config();
console.log("attempting connection\n");
var connection = mysql.createConnection({
    host : process.env.HOST_KEY,
    user : process.env.USERNAME_KEY,
    password : process.env.PASSWORD_KEY,
    database : process.env.DATABASE_KEY
});
connection.connect();
// Setup the Express Server
var express = require('express');
const { json } = require('express');
var app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
console.log("")

/*
 * weights in each state
 */
app.get('/weights/:state', function(request, response) {
    response.header("Access-Control-Allow-Origin", "*");
    var usState = request.params.state;
    if (usState == "all" || usState == "") {
        var query = "SELECT * FROM ucfnzc1.yelpout_predictors";
    } else {
        var query = "SELECT * FROM ucfnzc1.yelpout_predictors WHERE state = \'" + usState + "\'";
    }
    connection.query(query, function(err, rows, fields) {
        if (err) console.log("Err:" + err);
        if (rows != undefined) {
            response.send(rows);
        } else {
            response.send("");
        }
    });
});

/*
 * get Top100 restaurants in each state with selected attributes
 */
app.get('/top-rated/:state/:attribute/', function (request, response) {
    response.header("Access-Control-Allow-Origin", "*");
    var usState = request.params.state;
    const attribute = request.params.attribute;

    console.log("App.get: " + attribute);
    
    if (attribute != "") {
        var query =  "SELECT * FROM ucfnzc1.yelpout_restaurants WHERE state = '" + usState +
        "' AND " + attribute + " = 1 ORDER BY stars DESC LIMIT 100;";
        connection.query(query, function(err, rows, fields) {
            if (err) console.log("Err:" + err);
            if (rows != undefined) {
                response.send(rows);
            } else {
                response.send("");
            }
        });
    } else {
        response.send("");
    }
});

/*
 * Counts the number of entries with and without each attribute
 */
app.get('/attribute-count/:state/:attribute/:boolean', function(request, response) {
    response.header("Access-Control-Allow-Origin", "*");
    var usState = request.params.state;
    var attribute = request.params.attribute;
    var boolean = parseInt(request.params.boolean);


    var query = "SELECT COUNT(business_id) FROM ucfnzc1.yelpout_restaurants WHERE state = '" + usState +
    "' AND " + attribute + " = " + boolean + ";";
    connection.query(query, function(err, rows, fields) {
        if (err) console.log("Err:" + err);
        if (rows != undefined) {
            response.send(rows);
        } else {
            response.send("");
        }
    });
});

/*
 * Counts the number of entries with and without each attribute of each star rating
 */
app.get('/attribute-count-by-star-rating/:state/:attribute/:boolean/:starMin', function(request, response) {
    response.header("Access-Control-Allow-Origin", "*");
    var usState = request.params.state;
    var attribute = request.params.attribute;
    var boolean = parseInt(request.params.boolean);
    var starMin = parseInt(request.params.starMin);

    var starMax = starMin + 1;
    if (starMin == 1) {
        starMin = 0.9; // 
    }
    var query = "SELECT COUNT(business_id) FROM ucfnzc1.yelpout_restaurants WHERE state = '" + usState +
    "' AND " + attribute + " = " + boolean + " AND stars > " + starMin +
    " AND stars <= " + starMax + ";";

    connection.query(query, function(err, rows, fields) {
        if (err) console.log("Err:" + err);
        if (rows != undefined) {
            response.send(rows);
        } else {
            response.send("");
        }
    });
});





var server = app.listen(portNumber, function() {
    var host = server.address().address;
    var port = server.address().port;
});
