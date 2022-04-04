var url = 'wss://yorgio-chat-backend-v2.herokuapp.com/v2';
var createsocket = () => {
    ws = new WebSocket(url);
    ws.onopen = () => {
        var username = localStorage.getItem("name");
        if (username) {
            $('#register').hide();
            $('#msg').show();
            var reg = { "type": "register", "username": username };
            ws.send(JSON.stringify(reg));
        }
    }
    ws.onmessage = (e) => {
        var data = JSON.parse(e.data);
        if (data.type == 'history') {
            data.history.forEach(element => {
                if (element.username == localStorage.getItem("name")) {
                    $('#msg').append(`<div class="me msg card"><div class="name">${element.username}</div>${element.message}</div>`);
                }
                else {
                    $('#msg').append(`<div class="msg card"><div class="name">${element.username}</div>${element.message}</div>`);
                }
            });
            $('#msg').scrollTop($('#msg')[0].scrollHeight);
            $('#load').hide();
        }
        else if (data.type == 'message') {
            if (data.username == localStorage.getItem("name")) {
                $('#msg').append(`<div class="me msg card"><div class="name">${data.username}</div>${data.message}</div>`);
            } else {
                $('#msg').append(`<div class="msg card"><div class="name">${data.username}</div>${data.message}</div>`);
            }
            $('#msg').scrollTop($('#msg')[0].scrollHeight);
        }
        else if (data.type == 'spam') {
            $('#msg').append(`<div class="msg card"><div class="err">Error</div>Too ${data.kind}</div>`);
            $('#msg').scrollTop($('#msg')[0].scrollHeight);
        }
        else if (data.type == 'pong') {
        }
    }
    ws.onclose = () => {
        ws.close();
    }
}
window.onload = () => {
    $('#msg').attr('style', 'height:' + $(window).height() * 2/3 + 'px');
    var username = localStorage.getItem("name");
    if (username) {
        $('#register').hide();
        $('#load').show();
        $('#msg').show();
        $('#inputmsg').show();
        $('#send').show();
        $('#changename').show();
        createsocket();
    }
}
window.onbeforeunload = () => {
    ws.close();
}
window.onresize = () => {
    $('#msg').attr('style', 'height:' + $(window).height() *  2/3 + 'px');
}
var savename = (name) => {
    localStorage.setItem("name", name);
    $('#register').hide();
    $('#msg').show();
    $('#inputmsg').show();
    $('#send').show();
    $('#changename').show();
    $('#load').show();
    createsocket();
}
var changename = () => {
    $('#msg').hide();
    $('#msg').empty();
    $('#msg').append('<div id="load" class="spinner-border text-primary"></div>');
    $('#inputmsg').hide();
    $('#send').hide();
    $('#changename').hide();
    $('#register').show();
    ws.close();
}
var sendmsg = () => {
    var msg = $('#inputmsg').val();
    if (msg) {
        var data = { "message": msg };
        ws.send(JSON.stringify(data));
        $('#inputmsg').val('');
    }
}
var heartCheck = {
    timeout: 10000,
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function () {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function () {
        var self = this;
        this.timeoutObj = setTimeout(function () {
            var data = { "keepalive": true };
            ws.send(JSON.stringify(data));
            self.serverTimeoutObj = setTimeout(function () {
                ws.close();
            }, self.timeout)
        }, this.timeout)
    }
}
