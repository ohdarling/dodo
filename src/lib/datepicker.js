(function(win, doc) {
    win.DatePicker = function(container) {
        $(container).html('<label><select name="due_date_year"></select>年</label><label><select name="due_date_month"></select>月</label><label><select name="due_date_day"></select>日</label>');
        var sels = $('select', $(container));
        var selYear = sels.get(0), selMonth = sels.get(1), selDay = sels.get(2);
        var i, now = new Date();
        for (i = now.getFullYear()-10; i < now.getFullYear()+90; ++i) {
            var opt = new Option(i, i);
            selYear.options.add(opt);
        }
        
        for (i = 0; i < 12; ++i) {
            selMonth.options.add(new Option(i+1, i+1));
        }
        
        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function refreshDays() {
            var month = $(selMonth).val(), year = $(selYear).val();
            var c = days[month-1];
            if (month == 2) {
                c = ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) ? 29 : 28;
            }
            
            if (c != selDay.options.length) {
                var selectedDay = $(selDay).val();
                
                while (selDay.options.length > 0) {
                    selDay.remove(0);
                }
                
                for (var i = 0; i < c; ++i) {
                    selDay.options.add(new Option(i+1, i+1));
                }
                
                $(selDay).val(selectedDay);
            }
        }
        refreshDays();
        
        $(selYear).change(refreshDays);
        $(selMonth).change(refreshDays);
        
        var picker = {
            setDate : function(date) {
                if (typeof date == 'number') { date = new Date(date); }
                $(selYear).val(date.getFullYear());
                $(selMonth).val(date.getMonth()+1);
                $(selDay).val(date.getDate());
                refreshDays();
            },
            
            getDate : function() {
                var date = new Date($(selYear).val(), $(selMonth).val()-1, $(selDay).val());
                return date;
            }
        };
        
        return picker;
    };
})(window, window.document);
