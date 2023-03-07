/* ***************************************************************
                          Websocket
  ****************************************************************
*/
function startWebsocket() {
    if (DEBUG) {
      socket = new WebSocket("ws://" + DEBUG_ESP32_WEBSOCKET_ADDRESS + "/ws");
    } else {
      socket = new WebSocket("ws://" + window.location.hostname + "/ws");
    }
    socket.onopen = function (e) {
      socket.send("CONNECTED");
      $("#status").removeClass("text-danger");
      $("#status").removeClass("text-muted");
      $("#status").addClass("text-success");
      $("#status").text("Connected");
      var alertConnected = document.getElementById("alertConnected");
      if (alertConnected) {
      var toast = new bootstrap.Toast(alertConnected);   
        toast.show();
      }
      sendTimeStamp();
      $("#control-panel").toggle(false);
      $("#intervalometer").toggle(true);
      getIntervalometerProfiles(true);
    };
    var previousStatus = -1;
    socket.onmessage = function (event) {
      // TODO
      try {
        var object = JSON.parse(event.data);
        if (object.SHOTS !== undefined) {
          var callback = {
            SHOTS: object.SHOTS,
          };
          console.log(callback);
        }
        if (object.COMMAND_STATUS !== undefined && previousStatus !== object.COMMAND_STATUS) {
            previousStatus = object.COMMAND_STATUS;
          var callback = {
            COMMAND_STATUS: object.COMMAND_STATUS,
          };
          console.log(callback);
        }
  
      } catch (e) {
        // Callback not to be proccessed here. Do nothing
      }
    };
  
    socket.onclose = function (event) {
      if (event.wasClean) {
        //  Connection closed cleanly
      } else {
        // e.g. server process killed or network down
        retryConnectWebsocketTimeout = null;
        retryConnectWebsocketTimeout = setTimeout(tryReconnect, 10000);
      }
      $("#status").removeClass("text-success");
      $("#status").removeClass("text-muted");
      $("#status").addClass("text-danger");
      $("#status").text("Error");
      var alertConnected = document.getElementById("alertConnectionClose");
      var toast = new bootstrap.Toast(alertConnected);
      toast.show();
    };
  
    socket.onerror = function (error) {
      //ALERT ERROR
      $("#status").removeClass("text-success");
      $("#status").removeClass("text-muted");
      $("#status").addClass("text-danger");
      $("#status").text("Error");
      var alertConnected = document.getElementById("alertConnectionError");
      var toast = new bootstrap.Toast(alertConnected);
      toast.show();
    //   retryConnectWebsocketTimeout = null;
    //   retryConnectWebsocketTimeout = setTimeout(tryReconnect, 10000);
    //   socket.close();
    //   socket = null;
    };
  }