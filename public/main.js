$(function () {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput');
  var $messages = $('.messages');
  var $inputMessage = $('#inputMessage');
  var $canvi = $('#canvi');
  var $usuaris = $('#usuaris');
  var $preus = $('.butopreu');
  var $preus2 = $('#preus2');
  var $preus3 = $('#preus3');
  var $preus4 = $('#preus4');
  var $comanda = $('#comanda');
  var $comanda2 = $('#comanda2');
  var $comanda3 = $('#comanda3');
  var $reset = $('#reset');

  var $loginPage = $('.login.page');
  var $chatPage = $('.chat.page');
  var $comercialPage = $('.comercial.page');

  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  function addParticipantsMessage(data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "hi ha 1 participant";
    } else {
      message += "hi han " + data.numUsers + " participants";
    }
    log(message);
  }





  function setUsername() {
    username = cleanInput($usernameInput.val().trim());
    var client = "client";
    var comercial = "comercial";

    if (username == client) {
      $loginPage.fadeOut();
      $comercialPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();


      socket.emit('add user', username);
    }
    else if (username == comercial) {
      $loginPage.fadeOut();
      $comercialPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();


      socket.emit('add user', username);
    }
  }


  function sendMessage() {
    var message = $inputMessage.val();

    message = cleanInput(message);
    if (message && connected) {
      $inputMessage.val('');
      if (message.includes("puta") || message.includes("cabron") || message.includes("marica") || message.includes("gay") || message.includes("subnormal") || message.includes("gilipollas") || message.includes("tonto") || message.includes("malparit") || message.includes("fill de puta")) {
        message = "aixo es una paraula que no has de dir mai, maleducat";
        praulesDites();
      };
      addChatMessage({ username: username, message: message });
      socket.emit('new message', message);
    }
  }

  function canviarUser() {
    noms = $usernameInput.val();
    noms = cleanInput(noms);
    if (noms && connected) {
      $usernameInput.val('');
      document.getElementById("proves").innerHTML = noms;
      console.log(noms);
      socket.emit('users', noms);
    };

  }



  function nomUsuaris() {
    canviarUser();
  }

  var contador = 0;
  function praulesDites() {
    contador = contador + 1;
    if (contador == 3) {
      document.getElementById("inputMessage").disabled = true;
    }
    document.getElementById("contador").innerHTML = contador;
  }

  function canviarColor() {
    var message = "Color canviat";
    canviat();
    socket.emit('canvi color', message);
  }


  function log(message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  function addChatMessage(data, options) {
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  function addChatTyping(data) {
    data.typing = true;
    data.message = 'escrivint';
    addChatMessage(data);
  }

  function removeChatTyping(data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  function addMessageElement(el, options) {
    var $el = $(el);
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  function cleanInput(input) {
    return $('<div/>').text(input).html();
  }

  function updateTyping() {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  function getTypingMessages(data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }
  function getUsernameColor(username) {

    var hash = 7;
    for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }

    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }


  $window.keydown(function (event) {

    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }

    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function () {
    updateTyping();
  });

  $canvi.on('click', function () {
    canviarColor();
  });

  $usuaris.on('click', function () {
    canviarUser();
  });

  $loginPage.click(function () {
    $currentInput.focus();
  });

  $inputMessage.click(function () {
    $inputMessage.focus();
  });


  socket.on('new message', function (data) {
    addChatMessage(data);
  });
  socket.on('canvi color', function (data) {
    canviat();
  });

  socket.on('users', function (data) {
    canviarUser();
  });

  $reset.on('click', function (data) {
    reset(data);
  });

  function reset(data) {
    socket.emit('reset');
  }


  $preus.on('click', function (data) {
    var id = $(this).attr('data-id');
    socket.emit('productevenut', id);
  });
  preu = 0;
  socket.on('updateproducte', function (data) {
    console.log('Updateproducte', data);
    data.forEach(element => {
      document.getElementById('preu' + element.id).innerHTML = (element.preuFinal + "€");
      document.getElementById('card' + element.id).innerHTML = ("Stock: " + element.stock);
      document.getElementById('actu' + element.id).innerHTML = ("Preu actualitzat: " + element.preuFinal + "€");
    });
  });


  function insert(data) {
    socket.emit('insert');
  }

  socket.on('entrar', function (datti) {
    entrar(datti);
  });

  function entrar(datti) {
    document.getElementById('preuCervesa').innerHTML = (datti.resultatactu[0].preuFinal + "€");
  };

  preu2 = 0;
  socket.on('producte2', function (data) {
    preu2 = data.resultatactu2[0].preuFinal;
    document.getElementById('preuRef').innerHTML = (preu2 + "€");
  });

  function canviarPreu2(data) {
    socket.emit('producte2', preu2);
  }

  function insert2(data) {
    socket.emit('insert2');
  }

  socket.on('entrar2', function (datti) {
    entrar2(datti);
  });

  function entrar2(datti) {
    document.getElementById('preuRef').innerHTML = (datti.resultatactu2[0].preuFinal + "€");
  };

  preu3 = 0;
  socket.on('producte3', function (data) {
    preu3 = data.resultatactu3[0].preuFinal;
    document.getElementById('preuCubata').innerHTML = (preu3 + "€");
  });

  function canviarPreu3(data) {
    socket.emit('producte3', preu3);
  }

  function insert3(data) {
    socket.emit('insert3');
  }

  socket.on('entrar3', function (datti) {
    entrar3(datti);
  });

  function entrar3(datti) {
    document.getElementById('preuCubata').innerHTML = (datti.resultatactu3[0].preuFinal + "€");
  };

  socket.on('missatge', function (datos) {
    render(datos);
  });

  function render(datos) {
    document.getElementById('card-title').innerHTML = (datos.resultat[0].nom);
    document.getElementById('card-text').innerHTML = ("Preu inicial: " + datos.resultat[0].preuBase + "€");
  };

  socket.on('mensaje', function (dades) {
    renderCubata(dades);
  });

  function renderCubata(dades) {
    document.getElementById('titul').innerHTML = (dades.resultatCubata[0].nom);
    document.getElementById('text').innerHTML = ("Preu inicial: " + dades.resultatCubata[0].preuBase + "€");
  };

  socket.on('refresc', function (datti) {
    renderRefresc(datti);
  });

  function renderRefresc(datti) {
    document.getElementById('tituld').innerHTML = (datti.resultatRefresc[0].nom);
    document.getElementById('textd').innerHTML = ("Preu inicial: " + datti.resultatRefresc[0].preuBase + "€");
  };


  socket.on('actu', function (datti) {
    renderActu(datti);
  });

  function renderActu(datti) {
    document.getElementById('card-text2').innerHTML = ("Preu actualitzat: " + datti.resultatactu[0].preuFinal + "€");
  };

  socket.on('actu2', function (datti) {
    renderActu2(datti);
  });

  function renderActu2(datti) {
    document.getElementById('card-text4').innerHTML = ("Preu actualitzat: " + datti.resultatactu2[0].preuFinal + "€");
  };

  socket.on('actu3', function (datti) {
    renderActu3(datti);
  });

  function renderActu3(datti) {
    document.getElementById('card-text6').innerHTML = ("Preu actualitzat: " + datti.resultatactu3[0].preuFinal + "€");
  };

  socket.on('stock', function (datti) {
    renderStock(datti);
  });

  function renderStock(datti) {
    document.getElementById('card-text3').innerHTML = ("Stock pendent: " + datti.stock[0].stock);
  };

  socket.on('stock2', function (datti) {
    renderStock2(datti);
  });

  function renderStock2(datti) {
    document.getElementById('card-text5').innerHTML = ("Stock pendent: " + datti.stock2[0].stock);
  };

  socket.on('stock3', function (datti) {
    renderStock3(datti);
  });

  function renderStock3(datti) {
    document.getElementById('card-text7').innerHTML = ("Stock pendent: " + datti.stock3[0].stock);
  };

  $comanda.on('click', function (data) {
    document.getElementById('aacomanda').innerHTML = ("Preu a cobrar cervesa: 9€");
  });
  $comanda2.on('click', function (data) {
    document.getElementById('aacomanda').innerHTML = ("Preu a cobrar refresc: 8.5€");
  });
  $comanda3.on('click', function (data) {
    document.getElementById('aacomanda').innerHTML = ("Preu a cobrar cubata: 25.5€");
  });
  comandaPreu = 0;
  socket.on('comanda', function (data) {
    comandaPreu = (data.comanda[0].comanda) * 5;
    document.getElementById('aacomanda').innerHTML = ("Preu a cobrar cervesa: " + comandaPreu + "€");
  });

  function comanda1(data) {
    socket.emit('comanda', comandaPreu);

  };

  $comanda2.on('click', function (data) {
    comanda2(data);
  });
  comandaPreu2 = 0;
  socket.on('comanda2', function (data) {
    comandaPreu2 = (data.comanda2[0].comanda) * 5;
    document.getElementById('aacomanda').innerHTML = ("Preu a cobrar refresc: " + comandaPreu2 + "€");
  });

  function comanda2(data) {
    socket.emit('comanda2', comandaPreu2);

  };

  $comanda3.on('click', function (data) {
    comanda3(data);
  });
  comandaPreu3 = 0;
  socket.on('comanda3', function (data) {
    comandaPreu3 = (data.comanda3[0].comanda) * 5;
    document.getElementById('aacomanda').innerHTML = ("Preu a cobrar cubata: " + comandaPreu3 + "€");
  });

  function comanda3(data) {
    socket.emit('comanda3', comandaPreu3);

  };
});
