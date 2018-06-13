var socket = io();

jQuery('#form').on('submit', function (e) {
  e.preventDefault(); //prevents the page from reloading after the form is submitted

  let messageTextbox = jQuery('[name=messageTextBox]');
  console.log('Message is', messageTextbox.val());

  socket.emit('createMessage', {
      text: messageTextbox.val()
  }, function () {
    messageTextbox.val(''); //clear the val after message is sent
  }); //acknowlegment callback

});
