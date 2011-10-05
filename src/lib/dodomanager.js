(function(win, doc) {
    var DoDoManager = {};
    win.DoDoManager = DoDoManager;
    
    function mix(dest, src) {
        for (var p in src) {
            if (src.hasOwnProperty(p)) {
                dest[p] = src[p];
            }
        }
    }
    
    mix(DoDoManager, (function() {
        var manager = {};
        var todos = [];
        var format = function(s, args) { return s.replace(/\{(\w+)\}/g, function(source, token) { return args[token] || ''; }); };
        var todoSepFormat = '<li class="sep">{title}</li>';
        var todoLiFormat = '<li class="{completed} {priority}" data-tid="{tid}"><button></button><div><em>{todo}</em><cite>{notes}</cite></div></li>';
        
        function storeGet(name, default_val) {
            var str = window.localStorage[name] || '';
            return str.length > 0 ? JSON.parse(str) : (typeof default_val == 'undefined' ? null : default_val);
        }
        
        function storeSet(name, val) { window.localStorage[name] = JSON.stringify(val); }
        
        function guid() {
            var guid = storeGet('guid', 0) + 1;
            storeSet('guid', guid);
            return guid;
        }
        
        function todoSort(a, b) {
            if (a.completed == b.completed) {
                if (a.priority == b.priority) {
                    var time = a.due_date - b.due_date;
                    return time > 0 ? -1 : (time < 0 ? 1 : a.guid - b.guid);
                } else {
                    return a.priority > 0 ? -1 : 1;
                }
            } else {
                return a.completed ? 1 : -1;
            }
        }
        
        function todoSections(list) {
            list = list.sort(function(a, b) { return a.due_date - b.due_date; });
            var ret = [], now = new Date();
            now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);
            now = now*1;
            var sections = [0, 1, 2, 7, 30, 999999999999];
            var titles = ['已过期', '今天', '明天', '一周内', '一月内', '一月以后'];
            var section = { title : '已过期', list : [] };
            
            for (var i = 0; i < list.length; ++i) {
                var todo = list[i];
                var time_diff = (todo.due_date - now) / 1000 / 3600 / 24;
                
                while (time_diff >= sections[0]) {
                    sections.shift();
                    titles.shift();
                    section.list.length > 0 && ret.push(section);
                    section = { title : titles[0], list : [] };
                }
                
                section.list.push(todo);
            }
            
            if (section.list.length > 0) {
                ret.push(section);
            }
            
            return ret;
        }
        
        function load() {
            todos.push.apply(todos, storeGet('todos', []));
        }
        
        function save() {
            storeSet('todos', todos);
        }
        
        function todoListHtml() {
            var html = [], sections = todoSections(todos), todo, height = 0;
            for (var j = 0; j < sections.length; ++j) {
                var section = sections[j];
                height += 41;
                html.push(format(todoSepFormat, section));
                var list = section.list.sort(todoSort);
                for (var i = 0; i < list.length; ++i) {
                    todo = list[i];
                    height += 89;
                    html.push(format(todoLiFormat, {
                        tid : todo.guid,
                        todo : todo.todo,
                        notes : todo.notes.substr(0, Math.min(todo.notes.length, 20)) || 'No Notes',
                        checked : todo.completed == true ? 'checked="checked"' : '',
                        completed : todo.completed == true ? 'completed' : '',
                        priority : 'priority' + todo.priority
                    }));
                }
            }
            return { html : html.join('\n'), height : height };
        }
        
        function findIndexById(guid) {
            for (var i = 0; i < todos.length; ++i) {
                if (todos[i].guid == guid) {
                    return i;
                }
            }
            
            return -1;
        }
        
        function add(todo) {
            if (!todo.guid) {
                todo.guid = guid();
                todos.push(todo);
                save();
                return todo.guid;
                
            } else {
                return modify(todo);
            }
        }
        
        function remove(todo) {
            if (todo.guid) {
                var index = findIndexById(todo.guid);
                if (index != -1) {
                    todos.splice(index, 1);
                    save();
                    return todo.guid;
                }
            }
            
            return false;
        }
        
        function modify(todo) {
            if (todo.guid) {
                var index = findIndexById(todo.guid);
                if (index != -1) {
                    todos.splice(index, 1, todo);
                    save();
                    return true;
                }
            }
            
            return false;
        }
        
        function getById(guid) {
            var index = findIndexById(guid);
            if (index != -1) {
                return todos[index];
            }
            
            return null;
        }
        
        function removeCompleted() {
            for (var i = todos.length-1; i >= 0; --i) {
                var todo = todos[i];
                if (todo.completed) {
                    todos.splice(i, 1);
                }
            }
            save();
        }
        
        function defaultDueDays() {
            return storeGet('default_due_days', 0);
        }
        
        function setDefaultDueDays(days) {
            storeSet('default_due_days', days);
        }
        
        manager.defaultDueDays = defaultDueDays;
        manager.setDefaultDueDays = setDefaultDueDays;
        manager.removeCompleted = removeCompleted;
        manager.getById = getById;
        manager.add = add;
        manager.modify = modify;
        manager.remove = remove;
        manager.init = function() { load(); };
        manager.todoListHtml = todoListHtml;
        
        return manager;
    })());
})(window, window.document);
