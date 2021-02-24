const APP_ID = '3ee30362-8459-4ff8-b69c-091be04cfd7a';
const DEMO_CHANNEL_ID = 'demo channel';

let client;

$(document).ready(function () {
  reset();

  client = new TalkPlus.Client({appId: APP_ID});
  client.on('event', function (payload) {
    const parsedPayload = JSON.parse(payload);
    if (parsedPayload.type === 'message') {
      addMessage(parsedPayload.message);
    }
  });

  setupUsernameInputEventListener();
  sendMessageInputListener();
});

function hideUsernameWindow() {
  $('#username-window').hide();
}

function showChatWindow() {
  $('#main').show();
}

function setupUsernameInputEventListener() {
  $('#login-button').on('click', function () {
    const username = $('#username-input').val();
    if (!username) {
      return;
    }

    $('#username-input').val('');

    // login anonymously
    client.loginAnonymous({userId: username, username: username}, function (errResp, data) {
      if (errResp) {
        return alert(JSON.stringify(errResp));
      }

      // join demo channel
      client.joinChannel({channelId: DEMO_CHANNEL_ID}, function (errResp, data) {
        if (errResp) {
          if (errResp.code === '2003') { // if channel not found, create it
            client.createChannel({
              channelId: DEMO_CHANNEL_ID,
              name: DEMO_CHANNEL_ID,
              type: 'public',
              members: []
            }, function (errResp, data) {
              if (errResp) {
                return alert(JSON.stringify(errResp));
              }
              hideUsernameWindow();
              showChatWindow();
            });
          } else if (errResp.code === '2008') { // if user already had joined channel before, don't worry about error
            // don't handle
          } else {
            return alert(JSON.stringify(errResp));
          }
        }

        client.getMessages({channelId: DEMO_CHANNEL_ID}, function (errResp, data) {
          if (errResp) {
            return alert(JSON.stringify(errResp));
          }

          populateChatWindowWithMessages(data.messages);

          hideUsernameWindow();
          showChatWindow();
        });
      });
    });
  });
}

function sendMessageInputListener() {
  $('#enter').keypress((e) => {
    if (e.keyCode === 13) {
      const messageText = $('#enter').val();
      $('#enter').val('');

      addMessageText(messageText);
    }
  });
}

function populateChatWindowWithMessages(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    $('#users').append($('<p></p>').text(message.userId));
    $('#messages').append($('<p></p>').text(message.text));
    $('#timestamps').append($('<p></p>').text(new Date(message.createdAt).toLocaleTimeString()));
  }
}

function addMessageText(messageText) {
  client.sendMessage({channelId: DEMO_CHANNEL_ID, type: 'text', text: messageText}, function (err, data) {
    if (err) {
      return alert(err);
    }

    $('#users').append($('<p></p>').text(data.message.userId));
    $('#messages').append($('<p></p>').text(messageText));
    $('#timestamps').append($('<p></p>').text(new Date(data.message.createdAt).toLocaleTimeString()));
  });
}

function addMessage(messageObj) {
  $('#users').append($('<p></p>').text(messageObj.userId));
  $('#messages').append($('<p></p>').text(messageObj.text));
  $('#timestamps').append($('<p></p>').text(new Date(messageObj.createdAt).toLocaleTimeString()));
}

function reset() {
  $('#username-input').val('');
}
