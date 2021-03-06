jQuery(document).ready(function() {
  var socket = io();

  jQuery('#form').on('submit', function (e) {
    e.preventDefault(); //prevents the page from reloading after the form is submitted

    let messageTextbox = jQuery('[name=messageTextBox]');
    //console.log('Message is', messageTextbox.val());
    let chatroom = $('#chatroom-title').html();
    console.log("Chatroom is ", chatroom);

    socket.emit('createMessage', {
        text: messageTextbox.val(),
        chatRoom: chatroom
    }, function () {
      messageTextbox.val(''); //clear the val after message is sent
    }); //acknowlegment callback

  });

  socket.on('redirectUser', function() {
      alert("Session timed out. You will be redirected to login page.");
      window.location.href = '/auth/login';
  });

  socket.on('connect', function() {
    // console.log('Connected to server');

    let room = prompt("Please enter the name of chat room", "Test");

    if(!room || room===""){
      alert("You will be redirected to login page. Next time please choose a room.");
      window.location.href = '/auth/login';
    }

    //set h3 tag to title
    $('#chatroom-title').text(room);

    socket.emit('join', room , function (err, oldMessages) {
      //acknowlegment
      if(!!err) {
        console.log('An error occured when joining a chatroom');
        alert(err);
        window.location.href = '/auth/login';
        return;
      }

      console.log('User joined successfully.');

      let template = $('#message-template').html();
      let html;

      Mustache.parse(template); //speeds up future use

      for(const message of oldMessages){

        const timeInLT = moment(message.messageTimestamp).format('LT');

        html = Mustache.render(template, {
          from: message.messageSender,
          text: message.messageText,
          timeCreated: timeInLT
        });

        $('#messages').append(html);
      };
        
    });
  });

  socket.on('createUserMessages', function(messages) {

  });

  socket.on('userConnected', function(message) {
    console.log(message);

    /** clear the message div for ONLY the user joining the room */
    if(message.text.indexOf('Welcome to the chat app') === 0){
      $('#messages').html('');
    }

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

  socket.on('updateList', function(listObject){
    let ul = jQuery('<ul></ul>');
    let list = listObject.list;
    let reason = listObject.reason;

    if(reason === 'updateUserList'){
      list.forEach(function(user) {
        ul.append(jQuery('<li></li>').text(user));
      });

        /** We don't want to append a list but completely wipe out the old one and replace it with the new one */
      jQuery('#users').html(ul);

      $(".users li" ).bind('click', function(){
        switchRooms($(this).text());
      });
    }else if (reason === 'updateRoomList') {
      ul = jQuery('<ul class="userList"></ul>');

      list.forEach(function(user) {
        ul.append(jQuery('<li></li>').text(user));
      });

        /** We don't want to append a list but completely wipe out the old one and replace it with the new one */
      jQuery('.available__rooms').html(ul);

      $(".available__rooms li" ).bind('click', function(){
        switchRooms($(this).text());
      });
    }

  });

  function switchRooms(newRoom= ''){
    let currentRoom = $('#chatroom-title').text();

    if(!newRoom || newRoom.trim() === ''){
      alert("Please enter a valid room");
      return;
    }

    /** Do nothing */
    if(newRoom === currentRoom ) return;

    socket.emit('join', newRoom, function (err, messages) {

      //acknowlegment
      if(!! err) {
        alert(err);
        window.location.href = '/auth/login';
      }

      console.log(`User switched from ${currentRoom} to ${newRoom} successfully.`);

      $('#chatroom-title').text(newRoom);

      let template = $('#message-template').html();
      let html;

      Mustache.parse(template); //speeds up future use

      for(const message of messages){

        const timeInLT = moment(message.messageTimestamp).format('LT');

        html = Mustache.render(template, {
          from: message.messageSender,
          text: message.messageText,
          timeCreated: timeInLT
        });

        $('#messages').append(html);
      };

    });
  }

});
