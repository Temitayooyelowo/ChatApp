var socket = io();

jQuery('#form').on('submit', function (e) {
  e.preventDefault(); //prevents the page from reloading after the form is submitted

  let messageTextbox = jQuery('[name=messageTextBox]');
  //console.log('Message is', messageTextbox.val());

  socket.emit('createMessage', {
      text: messageTextbox.val()
  }, function () {
    messageTextbox.val(''); //clear the val after message is sent
  }); //acknowlegment callback

});

socket.on('connect', function() {
  // console.log('Connected to server');
  let params = jQuery.deparam(window.location.search);

  socket.emit('join', params, function (err) {
    //acknowlegment
    if(err) {
      alert(err);
      window.location.href = '/login';
    }else {
      console.log('User joined successfully.');
    }

  });
});

socket.on('userConnected', function(message) {
  console.log(message);

  let template = $('#message-template').html();
  Mustache.parse(template); //speeds up future use
  let html = Mustache.render(template, {
    from: message.user,
    text: message.text,
    timeCreated: message.createdAt
  });

  $('#messages').append(html);//adds the item as the last child in the unordered list
});

socket.on('broadcastMessage', function (message) {
  //The client should use a template rendering engine to dynamically display the message
  // when a message is broadcasted
  console.log('Broadcasted message is recieved from client:', message.text);

  let template = $('#message-template').html();
  Mustache.parse(template); //speeds up future use
  let html = Mustache.render(template, {
    from: message.user,
    text: message.text,
    timeCreated: moment().format('LT')
  });

  $('#messages').append(html);//adds the item as the last child in the unordered list

  //let formattedTime = moment(message.createdAt).format('h:mm a');
});

socket.on('updateUserList', function(users){
  let ul = jQuery('<ul></ul>');

  users.forEach(function(user) {
    ul.append(jQuery('<li></li>').text(user));
  });

    //We don't want to append a list but completely wipe out the old one and replace it with the new one
  jQuery('#users').html(ul);
});

socket.on('leaveRoom', function(message){
  let template = $('#message-template').html();
  Mustache.parse(template); //speeds up future use
  let html = Mustache.render(template, {
    from: message.user,
    text: message.text,
    timeCreated: message.createdAt
  });

  $('#messages').append(html);//adds the item as the last child in the unordered list
})
