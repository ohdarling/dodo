(function(win, doc) {
    var timer = 0;

    var MessageBox = win.MessageBox = {
        show : function(msg, timeout) {
            timeout = (timeout || 3) * 1000;
            $('#messageboxMask').show();
            $('#messagebox p').html(msg)
            $('#messagebox').show();
            clearTimeout(timer);
            timer = setTimeout(function() {
                MessageBox.hide();
            }, timeout);
        },
        
        hide : function() {
            $('#messagebox').hide();
            $('#messageboxMask').hide();
        }
    };
    
    $('#messageboxMask').click(function() {
        MessageBox.hide();
        return false;
    });

})(window, window.document);