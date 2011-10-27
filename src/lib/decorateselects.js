$(function() {
    // Property Change (Jquery)
    // See http://e-infotainment.com/applications/jquery-plugins/events/property-change/
    (function(b){b.event.special.propchange={setup:function(c){var d=this,e=b(d),f={},g={type:"propchange"},h,i=function(a){return b.isFunction(e[a])?e[a].call(e):d[a]?d[a]:e.css(a)};b(c).each(function(a){f[c[a]]=i(c[a])});propChangeInt=setInterval(function(){h=!1;g.changedProps={};b(c).each(function(a){var b=c[a],a=i(c[a]);a!=f[b]&&(g.changedProps[b]={oldValue:f[b],newValue:a},f[b]=a,h=!0)});h&&b.event.handle.call(d,g)},50)},teardown:function(){clearInterval(propChangeInt)}}})(jQuery);

    var showing = false;
    var showSelectForEl = function(el) {
        if (showing) {
            return;
        }
        
        showing = true;
    
        var vals = {}, opts = el.options;
        for (var i = 0; i < opts.length; ++i) {
            vals[opts[i].value] = opts[i].text;
        }
        SpinningWheel.addSlot(vals, 'right', $(el).val());
    
        SpinningWheel.setCancelAction(function() {
        });
        
        SpinningWheel.setDoneAction(function() {
            $(el).val(SpinningWheel.getSelectedValues().keys[0]).trigger('change');
            showing = false;
        });
    
        SpinningWheel.open();
    };
    
    var decorateSelect = function(el) {
        if (el.tagName.toUpperCase() != 'SELECT' || el.decorated) {
            return;
        }
        
        el.decorated = true;
    
        var button = document.createElement('button');
        $(button).css({
            border : 0,
            display : 'inline-block',
            'min-width' : $(el).width(),
            background : 'none',
            'text-align' : 'center'
        });
        var cssmap = {},
            props = ['color', 'background', 'padding', 'margin', 'padding-top', 'padding-right',
                     'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom',
                     'margin-left', 'border', 'font-size', 'font-weight', 'font-family', 'background-color'];
        for (var i = 0; i < props.length; ++i) {
            cssmap[props[i]] = $(el).css(props[i]);
        }
        $(button).css(cssmap);
        $(button).html($('option:selected', el).text())
                 .click(function(e) { showSelectForEl(el); e.preventDefault(); });
        $(el).before(button).css({ display : 'none', visibility : 'hidden' });
        $(el).bind('propchange', ['selectedIndex'], function(e) {
            $(button).html($('option:selected', el).text());
        });
    };
    
    var isWebOS = /webos/gi.test(navigator.appVersion);
    
    $.fn.extend({
        decorateSelects : function(force) {
            if (isWebOS || force) {
                $(this).each(function(idx, el) {
                    decorateSelect(el);
                });
            }
        }
    });
    
    $('select').decorateSelects();
});