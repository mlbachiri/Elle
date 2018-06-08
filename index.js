// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var mysql = require('mysql');
var io = require('../..')(server);
var port = process.env.PORT || 8081;

var db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  database: 'conntent'
});
db.connect(function (err) {
  if (err) console.log(err)
});

var resultat = null;
function primera() {
  var consulta = db.query('SELECT p.nom, va.preuBase FROM prod p left join ventasact va on va.id_prod = p.id where p.id=1', function (err, result, fields) {
    if (err) throw err;
    resultat = result;
  });
};
var resultatCubata = null;
var query = db.query('SELECT p.nom, va.preuBase FROM prod p left join ventasact va on va.id_prod = p.id where p.id=2', function (err, result, fields) {
  if (err) throw err;
  resultatCubata = result;
});


var resultatRefresc = null;
var queryd = db.query('SELECT p.nom, va.preuBase FROM prod p left join ventasact va on va.id_prod = p.id where p.id=3', function (err, result, fields) {
  if (err) throw err;
  resultatRefresc = result;
});


var resultatAigua = null;
var queryt = db.query('SELECT * FROM prod where id=7', function (err, result, fields) {
  if (err) throw err;
  resultatAigua = result;
});


var resultatactu = null;
var actuquery = db.query('SELECT * FROM ventasact where id=1', function (err, result, fields) {
  if (err) throw err;
  resultatactu = result;
});

var resultatactu2 = null;
var actuquery2 = db.query('SELECT * FROM ventasact where id=2', function (err, result, fields) {
  if (err) throw err;
  resultatactu2 = result;
});


var resultatactu3 = null;
var actuquery3 = db.query('SELECT * FROM ventasact where id=3', function (err, result, fields) {
  if (err) throw err;
  resultatactu3 = result;
});


var stock = null;
var stock1 = db.query('SELECT * FROM ventasact where id=1', function (err, result, fields) {
  if (err) throw err;
  stock = result;
});


var stock2 = null;
var stock21 = db.query('SELECT * FROM ventasact where id=2', function (err, result, fields) {
  if (err) throw err;
  stock2 = result;
});


var stock3 = null;
var stock32 = db.query('SELECT * FROM ventasact where id=3', function (err, result, fields) {
  if (err) throw err;
  stock3 = result;
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


app.use(express.static(path.join(__dirname, 'public')));



var numUsers = 0;

function usersConnectats(socket) {
  io.of('/').clients((error, clients) => {
    if (error) throw error;
    let numClients = clients.length;
    console.log(numClients);
    socket.broadcast.emit('userConnected', numClients);
  });
}

io.on('connection', function (socket) {
  var addedUser = false;

  io.on('connection', function (socket) {
    primera();
    socket.emit('missatge', { resultat });
  });


  function suma(a, b) {
    return a + b;
  }
  function novaventaBbdd(id_prod) {
    var insert = db.query('INSERT INTO avendre (`dataa`, `id_prod`) VALUES (now(),' + id_prod + ')', function (err, result, fields) {
      if (err) throw err;

    });
  }
  function enviapreusbbdd() {
    var resultatactu = null;
    var actuquery = db.query('SELECT * FROM ventasact', function (err, result, fields) {
      if (err) throw err;
      socket.broadcast.emit('updateproducte', result);
      socket.emit('updateproducte', result);
    });
  }
  socket.on('productevenut', function (data) {
    var sumaprova = suma(data, 5);
    novaventaBbdd(data);
    enviapreusbbdd();

  });


  socket.on('reset', function (data) {
    var reset = null;
    var reset = db.query('UPDATE ventasact SET preuFinal = preuBase', function (err, result, fields) {
      if (err) throw err;
      reset = result;
    });
  });

  socket.on('canvi color', function (data) {
    socket.broadcast.emit('canvi color', { username: socket.username, message: data });
  });

  socket.on('users', function (data) {
    socket.broadcast.emit('users', { username: socket.username, message: data });
    console.log(data);
  });

  socket.on('add user', function (username) {
    if (addedUser) return;

    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });

    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
