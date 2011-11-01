$(function(){

    window.dodo = {};

    window.jQT = $.jQTouch({
        icon: 'icon.png',
        startupScreen: 'startup.png',
        preloadImages: [
            'res/images/activeButton.png',
            'res/images/backButton.png',
            'res/images/cancel.png',
            'res/images/checked.png',
            'res/images/chevron.png',
            'res/images/grayButton.png',
            'res/images/greenButton.png',
            'res/images/listArrowSel.png',
            'res/images/listGroup.png',
            'res/images/loading.gif',
            'res/images/on_off.png',
            'res/images/pinstripes.png',
            'res/images/redButton.png',
            'res/images/selection.png',
            'res/images/thumb.png',
            'res/images/toggle.png',
            'res/images/toggleOn.png',
            'res/images/toolButton.png',
            'res/images/toolbar.png',
            'res/images/unchecked.png',
            'res/images/whiteButton.png'
        ]
    });
    
    
    var hasTouch = 'ontouchstart' in window,
        // Events
        START_EV = hasTouch ? 'touchstart' : 'mousedown',
        MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
        END_EV = hasTouch ? 'touchend' : 'mouseup',
        CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup';
        
    
    var editFormDatePicker = DatePicker($('#edit .due_date'));
    $('#edit .due_date select').decorateSelects();
    
    $('#jqt div.content').each(function(idx, el) {
        new iScroll(el, { checkDOMChanges: true });
    });
        
    function refreshList(todoid) {
        var ret = DoDoManager.todoListHtml();
        $('#todos ul').html(ret.html);
        /*
        $('#todos ul').html(ret.html).parent().css({ 'min-height' : Math.max(637, ret.height) + 'px' });
        if (todoid) {
            var top = $('#todos li[data-tid=' + todoid + ']').offset().top - $('#todos ul').offset().top;
            if (top > 500) {
                scrollView.scrollTo(-top, 0);
            }
        }
        */
    }
    
    function showEdit(todo) {
        $('#edit h1').html(todo ? '编辑待办事项' : '添加待办事项');
        $('#edit .redButton')[todo ? 'show' : 'hide']();
        var form = $('#edit form').get(0);
        form.reset();
        form.guid.value = '';
        
        if (todo) {
            form.guid.value = todo.guid;
            form.todo.value = todo.todo;
            form.notes.value = todo.notes;
            form.priority.checked = (todo.priority == 1);
            editFormDatePicker.setDate(todo.due_date);
        } else {
            var dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + DoDoManager.defaultDueDays());
            editFormDatePicker.setDate(dueDate);
        }
        
        jQT.goTo('#edit', 'slideup')
    }
    dodo.showEdit = showEdit;
    
    function initListPage() {
        refreshList();
        
        $('#todos .addtodo').bind(END_EV, function() { showEdit(); return false; });
        $('#todos ul li').live(END_EV, function(e) {
            if (e && e.target && (e.target.tagName == 'INPUT' || e.target.tagName == 'LABEL')) {
                return;
            }
            
            var guid = $(this).closest('li').attr('data-tid');
            var todo;
            if (guid) {
                todo = DoDoManager.getById(guid);
            }
            showEdit(todo);
            return false;
        });
        
        $('#todos li button').live(END_EV, function(){
            var $el = $(this);
            var todo = DoDoManager.getById($el.closest('li').attr('data-tid'));
            if (todo) {
                todo.completed = !$el.closest('li').hasClass('completed');
                DoDoManager.modify(todo);
                refreshList();
            }
            return false;
        });
    }
    
    function initSettingsPage() {
        $('#cleanup-todos').bind(END_EV, function() {
            if ((window.confirm && window.confirm('确定清除已完成的事项？')) || true) {
                DoDoManager.removeCompleted();
                refreshList();
            }
        });
        
        $('#default_due_days').change(function() {
            DoDoManager.setDefaultDueDays($(this).val()*1);
        });
        
        $('#default_due_days').val(DoDoManager.defaultDueDays());
    }
    
    function initEditPage() {
        
        function submitForm(){
            var form = $('#edit form').get(0);
            if (form.todo.value.length > 1) {
                var todo;
                if (form.guid.value.length > 0) {
                    todo = DoDoManager.getById(form.guid.value);
                }
                
                todo = todo || {};
                todo.todo = form.todo.value;
                todo.notes = form.notes.value;
                todo.due_date = editFormDatePicker.getDate()*1;
                todo.priority = form.priority.checked ? 1 : 0;
                
                var id = DoDoManager[todo.guid ? 'modify' : 'add'](todo);
                
                jQT.goBack();
                
                refreshList(id);
                
                
            } else {
                MessageBox.show('待办事项名称必须多于一个字符');
            }
            
            return false;
        }
        
        $('#edit form').submit(submitForm);
        $('#edit .whiteButton').bind(END_EV, submitForm);
        $('#edit .redButton').bind(END_EV, function() {
            var form = $('#edit form').get(0);
            DoDoManager.remove({ guid : form.guid.value });
            refreshList();
            jQT.goBack();
        });
    }

    DoDoManager.init();

    initListPage();
    initEditPage();
    initSettingsPage();
    
    
});