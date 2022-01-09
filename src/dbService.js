const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

var db_config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down or restarting (takes a while sometimes).
    if(err) {                                   
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }  
    else
    {
        console.log('Connected');
    }                                   // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else { 
      handleDisconnect();   
                                            // connnection idle timeout (the wait_timeout
      // throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();
    
module.exports = connection;

