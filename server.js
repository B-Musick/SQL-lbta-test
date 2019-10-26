var express = require('express');
var app     = express();
// Useful to figure out where went wrong in the routes
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
app.set('view engine','ejs');


app.use(express.static('./public')); // App server is now serving all the files in this folder, just use root
app.use(morgan('short'));

var mysql = require('mysql');

// Middleware to help process requests, it can go in POST request and retrieve data
app.use(bodyParser.urlencoded({extended: false}));

// METHOD-OVERRIDE (PUT form action) ?_method=PUT
app.use(methodOverride('_method'));
function getConnection(){
    return mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "#kernal32",
        database: 'lbta_node'
    });
}
// Create Database
// con.connect(function (err) {
//     if (err) throw err;
//     console.log("Connected!");
//     con.query("CREATE DATABASE mydb", function (err, result) {
//         if (err) throw err;
//         console.log("Database created");
//     });
// });
app.get('/users', (req, res) => {
    console.log('Fetching user with id: ' + req.params.id);

    // Connect to database
    var con = getConnection();

    const userId = req.params.id;
    const queryString = "SELECT * FROM users";
    con.query(queryString, (err, rows, fields) => {
        if (err) {
            console.log('failed to query users' + err)
            res.sendStatus(500);
            // throw err (can do this istead)
            res.end()
            return
        }

        // Rename the values from SQL for JSON
        const users = rows.map(row => {
            return { firstName: row.first_name, lastName: row.last_name, id:row.id }
        });

        res.render('users', {users});
    })
});

app.get('/user/:id', (req, res) => {
    console.log('Fetching user with id: ' + req.params.id);

    // Connect to database
    var con = getConnection();

    const userId = req.params.id;
    
    const queryString = "SELECT * FROM users WHERE id = ?";
    con.query(queryString, [userId], (err, rows, fields) => {
        if(err) {
            console.log('failed to query users'+err)
            res.sendStatus(500);
            // throw err (can do this istead)
            res.end()
            return
        }

        // Rename the values from SQL for JSON
        const users = rows.map(row=>{
            return { firstName: row.first_name, lastName: row.last_name, id: row.id}
        });

        res.json(users);
    })
});

app.get('/',(req,res)=>{
    console.log('Responding to root');
    res.send('Hi');
});

// INSERT ROUTE (CREATE)
app.post('/user',(req,res)=>{
    // Gets post from the user/create page
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;

    let queryString = 'INSERT INTO users (first_name, last_name) VALUES (?,?)'
    // The values in the brackets are inserted into the query string (?,?)
    getConnection().query(queryString,[firstName,lastName],(err,results,fields)=>{
        if(err){
            console.log('Failed to input new user');
            res.sendStatus(500);
            return
        }
        console.log('Inserted a new user '+results.insertId);
        res.redirect('/user');
    })
    
    
});

// LOAD EDIT PAGE FOR UPDATE ROUTE
app.get('/user/:id/edit',(req,res)=>{
    var con = getConnection();

    const userId = req.params.id;

    const queryString = "SELECT * FROM users WHERE id = ?";
    con.query(queryString, [userId], (err, rows, fields) => {
        if (err) {
            console.log('failed to query users' + err)
            res.sendStatus(500);
            // throw err (can do this istead)
            res.end()
            return
        }
        
  
        // rows returns [{user}] so need to take it out of the array
        res.render('update',{user:rows[0]});
    });
    
})

// UPDATE ROUTE
app.put('/user/:id',(req,res)=>{
    
    let userId = req.params.id;
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    console.log(userId);
    let queryString = 'UPDATE users SET first_name= ?, last_name= ? WHERE id= ?';
    // The values in the brackets are inserted into the query string (?,?)
    getConnection().query(queryString, [firstName, lastName,userId], (err, results, fields) => {
        if (err) {
            console.log('Failed to update user');
            res.sendStatus(500);
            return
        }
        console.log('Updated a user ' + results);
        res.redirect('/users');
    })
});

// DELETE ROUTE
app.delete('/user/:id', (req, res) => {

    let userId = req.params.id;
    
    let queryString = 'DELETE FROM users WHERE id= ?';
    // The values in the brackets are inserted into the query string (?,?)
    getConnection().query(queryString, [userId], (err, results, fields) => {
        if (err) {
            console.log('Failed to delete user');
            res.sendStatus(500);
            return
        }
        console.log('Updated a user ' + results);
        res.redirect('/users');
    })
});

app.listen(3002,()=>{
    console.log('Server is running and listening on 3002...');
})

