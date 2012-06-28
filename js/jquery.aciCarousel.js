
/*
 * aciCarousel jQuery Plugin v1.0
 * http://acoderinsights.ro
 *
 * Copyright (c) 2012 Dragos Ursu
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Require jQuery Library http://jquery.com
 * + (optional) MouseWheel Plugin (for mouse wheel support) https://github.com/brandonaaron/jquery-mousewheel
 * + (optional) TouchSwipe Plugin (for touch based devices) https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
 *
 * Date: Fri Jun 22 18:40 2012 +0200
 */

(function($){

    $.aciCarousel = {
        'nameSpace' : '.aciCarousel'
    };

    $.fn.aciCarousel = function(options, data){
        if (typeof options == 'string')
        {
            switch (options)
            {
                case 'options':
                case 'index':
                    // should be run only for one element
                    return $(this)._aciCarousel(options, data);
            }
        }
        return this.each(function(){
            return $(this)._aciCarousel(options, data);
        });
    };

    // default options
    $.fn.aciCarousel.defaults = {
        'scroll' : 'ul',        // selector to tell what element is the parent for the carousel elements (will be resized to fit all elements)
        'element' : 'li',       // carousel elements (must be unique determined as a parent from any child within the element)
        'focus' : 'li>a',       // element that can get focus on click (will be used to pass focus to the parent when 'bindKeyboard' is used)

        'hash' : null,          // selector to get a element for selection (used for hash scrolling) - NOT YET USED
        'attr' : 'id',          // attribute to match a element for selection (used for hash scrolling) - NOT YET USED

        'inView' : null,        // how many elements are in view (auto-calculated if null)
        'mainIndex' : 0,        // zero based index of the 'selected' (main/focused) element
        'easing' : 'swing',     // easing effect on scroll
        'duration' : 500,       // animation duration

        'rollIn' : null,        // callback called when element is set as the 'selected' one
        // function (jQuery 'element' object, duration in milliseconds, direction as -1/1 for left-top/righ-bottom roll)
        'rollOut' : null,       // callback called when a 'selected' element get to unselected state
        // function (jQuery 'element' object, duration in milliseconds, direction as -1/1 for left-top/righ-bottom roll)

        'fadeIn' : null,        // callback called for the first/last element in view when they fade in
        // function (jQuery 'element' object, duration in milliseconds, direction as -1/1 for left-top/righ-bottom roll)
        // Note: the callback must return true to apply the default fade-in effects !
        'fadeOut' : null,       // callback called for the first/last element in view when they fade out
        // function (jQuery 'element' object, duration in milliseconds, direction as -1/1 for left-top/righ-bottom roll)
        // Note: the callback must return true to apply the default fade-out effects !

        'bindMouse' : true,     // should we handle mouse wheel events?
        'bindTouch' : true,     // should we handle touch events?
        'bindKeyboard' : true,  // should we handle keyboard events?

        'beforePrev' : null,    // callback called before left/top roll
        // function (jQuery 'element' object - the one to be selected)
        'afterPrev' : null,     // callback called after left/top roll
        // function (jQuery 'element' object - the selected one)
        'beforeNext' : null,    // callback called before right/bottom roll
        // function (jQuery 'element' object - the one to be selected)
        'afterNext' : null      // callback called after right/bottom roll
    // function (jQuery 'element' object - the selected one)
    };

    $.fn._aciCarousel = function(options, data){

        var $this = this;

        var _options = $.extend({}, $.fn.aciCarousel.defaults, options);

        // init control based on options
        var _initUi = function(){
            if ((typeof options == 'undefined') || (typeof options == 'object'))
            {
                _customUi();
            }
            // process custom request
            if (typeof options == 'string')
            {
                switch (options)
                {
                    case 'options':
                        if ($this.data('customUi' + $.aciCarousel.nameSpace))
                        {
                            return $this.data('options' + $.aciCarousel.nameSpace);
                        }
                        else
                        {
                            return _options;
                        }
                    case 'index':
                        return _index(data);
                    case 'destroy':
                        // destroy the control
                        _destroyUi();
                }
            }
            // return this object
            return $this;
        };

        // find the 'real' element
        var _find = function (object, scroll, list)
        {
            var element = null;
            if (typeof object == 'object')
            {
                // should be a child
                var index = list.index(object);
                if (index != -1)
                {
                    element = list.eq(index);
                }
                else if (scroll.has(object))
                {
                    element = object.parents('li:first');
                }
            }
            else
            {
                if (object.toString().match(/^[0-9]+$/))
                {
                    // if it's a numeric value, find the index
                    for(var i = 0; i < list.length; i++)
                    {
                        var item = list.eq(i);
                        if (item.data('index' + $.aciCarousel.nameSpace) == object)
                        {
                            element = item;
                            break;
                        }
                    }
                }
                else
                {
                    // find the element
                    element = list.find(object).parents('li:first');
                }
            }
            return element;
        };

        // get element index
        var _index = function(object)
        {
            if ($this.data('customUi' + $.aciCarousel.nameSpace))
            {
                var options = $this.data('options' + $.aciCarousel.nameSpace);
                var scroll = $this.find(options.scroll + ':first');
                var list = scroll.find('li').slice(1, -1);
                var element = _find(object, scroll, list);
                if (element && element.length)
                {
                    return element.data('index' + $.aciCarousel.nameSpace);
                }
            }
            return null;
        };

        // destroy control
        var _destroyUi = function(){
            if ($this.data('customUi' + $.aciCarousel.nameSpace))
            {
                var options = $this.data('options' + $.aciCarousel.nameSpace);
                // destroy if initialized
                $this.removeData('customUi' + $.aciCarousel.nameSpace);
                $this.removeData('options' + $.aciCarousel.nameSpace);
                $this.off($.aciCarousel.nameSpace);
                // return elements to the initial position
                var scroll = $this.find(options.scroll + ':first');
                if (options.focus)
                {
                    scroll.find(options.focus).off($.aciCarousel.nameSpace);
                }
                scroll.find('li:first,li:last').remove();
                scroll.find('li').detach().sort(function(a, b){
                    return $(a).data('index' + $.aciCarousel.nameSpace) - $(b).data('index' + $.aciCarousel.nameSpace);
                }).removeData('index' + $.aciCarousel.nameSpace).appendTo(scroll);
                $this.scrollLeft(0).scrollTop(0);
            }
        }; // end _destroyUi

        // init custom UI
        var _customUi = function(){

            if ($this.data('customUi' + $.aciCarousel.nameSpace))
            {
                // return if already initialized
                return;
            }

            $this.data('customUi' + $.aciCarousel.nameSpace, true);
            // keep options
            $this.data('options' + $.aciCarousel.nameSpace, _options);

            // keep elemets parent
            var _scroll = $this.find(_options.scroll + ':first');

            var _first = _scroll.find(_options.element + ':first');

            // is horizontal carousel ?
            var _horizontal = (_first.css('float') == 'left') || (_first.css('float') == 'right');

            _first = null;

            // roll to a object within carousel
            var _rollTo = function (object, delay, easing, direction, before, after, step) {
                var list = _scroll.find('li').slice(1, -1);
                var element = _find(object, _scroll, list);
                if (element && element.length)
                {
                    // roll only it's not the 'selected' one
                    if (list.get(_options.mainIndex) != element.get(0))
                    {
                        var size = list.length / 2;
                        var current = list.eq(_options.mainIndex).data('index' + $.aciCarousel.nameSpace) + 1;
                        var search = element.data('index' + $.aciCarousel.nameSpace) + 1;
                        // compute distance and choose the smallest one in view
                        var distance;
                        if (search > current)
                        {
                            if ((_options.mainIndex <= _options.inView / 2) ? current + size >= search : current + size > search)
                            {
                                distance = search - current;
                            }
                            else
                            {
                                distance = (current + list.length - search) * -1;
                            }
                        }
                        else
                        {
                            if ((_options.mainIndex <= _options.inView / 2) ? search + size > current : search + size >= current)
                            {
                                distance = (current - search) * -1;
                            }
                            else
                            {
                                distance = search + list.length - current;
                            }
                        }
                        if (typeof step == 'undefined')
                        {
                            // the roll is done one element at a time
                            step = delay ? delay / Math.abs(distance) : 0;
                        }
                        if (typeof direction == 'undefined')
                        {
                            // roll by the smallest distance (to left-top/right-bottom)
                            if (distance > 0)
                            {
                                _rollNext(step, easing, before, function(){
                                    if (after)
                                    {
                                        after();
                                    }
                                    _rollTo(object, delay, easing, 1, before, after, step);
                                });
                            }
                            else
                            {
                                _rollPrev(step, easing, before, function(){
                                    if (after)
                                    {
                                        after();
                                    }
                                    _rollTo(object, delay, easing, -1, before, after, step);
                                });
                            }
                        }
                        else if (direction == 1)
                        {
                            _rollNext(step, easing, before, function(){
                                if (after)
                                {
                                    after();
                                }
                                _rollTo(object, delay, easing, 1, before, after, step);
                            });
                        }
                        else if (direction == -1)
                        {
                            _rollPrev(step, easing, before, function(){
                                if (after)
                                {
                                    after();
                                }
                                _rollTo(object, delay, easing, -1, before, after, step);
                            });
                        }
                    }
                }
            };

            // roll in selected
            var _rollIn = function (object, delay, direction) {
                if (_options.rollIn)
                {
                    _options.rollIn(object, delay, direction);
                }
            };

            // roll out selected
            var _rollOut = function (object, delay, direction) {
                if (_options.rollOut)
                {
                    _options.rollOut(object, delay, direction);
                }
            };

            // fade in first/last element in view
            var _fadeIn = function (object, delay, direction) {
                if (!_options.fadeIn || _options.fadeIn(object, delay, direction))
                {
                    object.fadeTo(0, 0).fadeTo(delay ? delay * 1.4 : 0, 1);
                }
            };

            // fade out first/last element in view
            var _fadeOut = function (object, delay, direction) {
                if (!_options.fadeOut || _options.fadeOut(object, delay, direction))
                {
                    object.fadeTo(delay ? delay : 0, 0);
                }
            };

            // sync animation
            var _roller = false;

            // roll to left/top with a element
            var _rollPrev = function (delay, easing, before, after) {
                if (_roller)
                {
                    return;
                }
                _roller = true;
                if (before)
                {
                    before(_scroll.find('li:eq(' + _options.mainIndex + ')'));
                }
                else if (_options.beforePrev)
                {
                    _options.beforePrev(_scroll.find('li:eq(' + _options.mainIndex + ')'));
                }
                // start roll in/out phase
                _rollOut(_scroll.find('li:eq(' + (_options.mainIndex + 1) + ')'), delay ? delay : 0, -1);
                _rollIn(_scroll.find('li:eq(' + _options.mainIndex + ')'), delay ? delay : 0, -1);
                // fade in/out the extra elements
                _fadeIn(_scroll.find('li:first'), delay, -1);
                _fadeOut(_scroll.find('li:eq(' + _options.inView + ')'), delay, -1);
                // do the scroll animation
                if (_horizontal)
                {
                    var animate = {
                        'scroll-left' : $this.scrollLeft() - _scroll.find('li:first').width()
                    };
                }
                else
                {
                    var animate = {
                        'scroll-top' : $this.scrollTop() - _scroll.find('li:first').height()
                    };
                }
                $this.animate(animate, {
                    'duration' : delay ? delay : 0,
                    'easing' : easing ? easing : 'linear',
                    'complete' : function(){
                        // do the magic of replacing the elements (and change their order)
                        _scroll.find('li:first,li:last').remove();
                        var first = _scroll.find('li:first');
                        var last = _scroll.find('li:last');
                        first.before(last);
                        first = _scroll.find('li:first');
                        last = _scroll.find('li:last');
                        _scroll.prepend(last.clone(true));
                        _scroll.append(first.clone(true));
                        // redo replaced elements :D
                        _rollOut(_scroll.find('li:first'), 0, -1);
                        _rollIn(_scroll.find('li:eq(' + (_options.mainIndex + 1) + ')'), 0, -1);
                        _fadeOut(_scroll.find('li:first'), 0, -1);
                        _fadeIn(_scroll.find('li:eq(1)'), 0, -1);
                        if (_horizontal)
                        {
                            $this.scrollLeft(_scroll.find('li:first').width());
                        }
                        else
                        {
                            $this.scrollTop(_scroll.find('li:first').height());
                        }
                        _roller = false;
                        if (after)
                        {
                            after(_scroll.find('li:eq(' + (_options.mainIndex + 1) + ')'));
                        }
                        else if (_options.afterPrev)
                        {
                            _options.afterPrev(_scroll.find('li:eq(' + (_options.mainIndex + 1) + ')'));
                        }
                    }
                });
            };

            // roll to right/bottom with a element
            var _rollNext = function (delay, easing, before, after) {
                if (_roller)
                {
                    return;
                }
                _roller = true;
                if (before)
                {
                    before(_scroll.find('li:eq(' + (_options.mainIndex + 2) + ')'));
                }
                else if (_options.beforeNext)
                {
                    _options.beforeNext(_scroll.find('li:eq(' + (_options.mainIndex + 2) + ')'));
                }
                // start roll in/out phase
                _rollOut(_scroll.find('li:eq(' + (_options.mainIndex + 1) + ')'), delay ? delay : 0, 1);
                _rollIn(_scroll.find('li:eq(' + (_options.mainIndex + 2) + ')'), delay ? delay : 0, 1);
                // fade in/out the extra elements
                _fadeOut(_scroll.find('li:eq(1)'), delay, 1);
                _fadeIn(_scroll.find('li:eq(' + (_options.inView + 1) + ')'), delay, 1);
                // do the scroll animation
                if (_horizontal)
                {
                    var animate = {
                        'scroll-left' : $this.scrollLeft() + _scroll.find('li:first').width()
                    };
                }
                else
                {
                    var animate = {
                        'scroll-top' : $this.scrollTop() + _scroll.find('li:first').height()
                    };
                }
                $this.animate(animate, {
                    'duration' : delay ? delay : 0,
                    'easing' : easing ? easing : 'linear',
                    'complete' : function(){
                        // do the magic of replacing the elements (and change their order)
                        _scroll.find('li:first,li:last').remove();
                        var first = _scroll.find('li:first');
                        var last = _scroll.find('li:last');
                        last.after(first);
                        first = _scroll.find('li:first');
                        last = _scroll.find('li:last');
                        _scroll.prepend(last.clone(true));
                        _scroll.append(first.clone(true));
                        // redo replaced elements :D
                        _rollOut(_scroll.find('li:last'), 0, 1);
                        _rollIn(_scroll.find('li:eq(' + (_options.mainIndex + 1) + ')'), 0, 1);
                        _fadeOut(_scroll.find('li:last'), 0, 1);
                        _fadeIn(_scroll.find('li:eq(' + _options.inView + ')'), 0, 1);
                        if (_horizontal)
                        {
                            $this.scrollLeft(_scroll.find('li:first').width());
                        }
                        else
                        {
                            $this.scrollTop(_scroll.find('li:first').height());
                        }
                        _roller = false;
                        if (after)
                        {
                            after(_scroll.find('li:eq(' + (_options.mainIndex + 1) + ')'));
                        }
                        else if (_options.afterNext)
                        {
                            _options.afterNext(_scroll.find('li:eq(' + (_options.mainIndex + 1) + ')'));
                        }
                    }
                });
            };

            // make elements unfocusable
            // ToDo: revert this on destroy too
            $this.find('*').css('outline', 'none').attr('tabIndex', -1);

            var _init = function(){
                var list = _scroll.find('li');
                // save the 'real' zero based index
                for (var i = 0; i < list.length; i++)
                {
                    var item = list.eq(i);
                    item.data('index' + $.aciCarousel.nameSpace, i);
                    if (i == _options.mainIndex)
                    {
                        //_rollIn(item, 0);
                        _rollOut(item, 0)
                    }
                    else
                    {
                        _rollOut(item, 0);
                    }
                }
                // we need two extra elements
                var first = list.eq(0);
                var last = list.eq(-1);
                _scroll.prepend(last.clone(true));
                _scroll.append(first.clone(true));
                if (_horizontal)
                {
                    _scroll.width(first.width() * (list.length + 2));
                }
                else
                {
                    _scroll.height(first.height() * (list.length + 2));
                }
                if (!_options.inView)
                {
                    if (_horizontal)
                    {
                        _options.inView = Math.floor($this.width() / first.width());
                    }
                    else
                    {
                        _options.inView = Math.floor($this.height() / first.height());
                    }
                }
                // initial roll
                if (_options.mainIndex == 0)
                {
                    if (_horizontal)
                    {
                        $this.scrollLeft(first.width());
                    }
                    else
                    {
                        $this.scrollTop(first.height());
                    }
                    _fadeOut(_scroll.find('li:eq(0)'), 0);
                    _fadeOut(_scroll.find('li:eq(' + (_options.inView + 1) + ')'), 0);
                    _rollIn(first, 0);
                }
                else
                {
                    _rollTo(0, 0);
                }
            };

            _init();

            // keep focus state
            var _focus = false;

            // bind event handlers to respond to
            $this.on('focus' + $.aciCarousel.nameSpace, function(){
                _focus = true;
            }).on('blur' + $.aciCarousel.nameSpace, function(){
                //alert("ll");
                _focus = false;
            }).on('roll' + $.aciCarousel.nameSpace, function(e, data){
                if (data)
                {
                    var duration = (typeof data.duration != 'undefined') ? data.duration : _options.duration;
                    var easing = (typeof data.easing != 'undefined') ? data.easing : _options.easing;
                    if (typeof data.object != 'undefined')
                    {
                        _rollTo(data.object, duration, easing, data.direction, data.before, data.after);
                    }
                    else if (typeof data.direction != 'undefined')
                    {
                        if (data.direction == -1)
                        {
                            _rollPrev(duration, easing, data.before, data.after);
                        }
                        else if (data.direction == 1)
                        {
                            _rollNext(duration, easing, data.before, data.after);
                        }
                    }
                }
            }).on('rollPrev' + $.aciCarousel.nameSpace, function(e, data){
                if (data)
                {
                    data.direction = -1;
                }
                else
                {
                    data = {
                        'direction': -1
                    };
                }
                $this.trigger('roll', data);
            }).on('rollNext' + $.aciCarousel.nameSpace, function(e, data){
                if (data)
                {
                    data.direction = 1;
                }
                else
                {
                    data = {
                        'direction': 1
                    };
                }
                $this.trigger('roll', data);
            }).on('scroll' + $.aciCarousel.nameSpace, function(){
                // ToDo: roll back to a element boundaries
                });

            if (_options.bindMouse)
            {
                // mouse wheel handling
                $this.on('mousewheel' + $.aciCarousel.nameSpace, function(e, delta){
                    if (delta > 0)
                    {
                        $this.trigger('rollPrev');
                    }
                    else
                    {
                        $this.trigger('rollNext');
                    }
                    return false;
                });
            }

            if (_options.bindTouch && (typeof $.fn.swipe != 'undefined'))
            {
                var _timed = false;
                // process content swipe
                var _swipe = function (e, phase, direction, distance){
                    if (!e.touches)
                    {
                        return;
                    }
                    switch (phase)
                    {
                        case 'move':
                            var now = new Date().getTime();
                            if (!_timed || (_timed < now - 250))
                            {
                                _timed = now;
                                switch (direction)
                                {
                                    case 'up':
                                        if (!_horizontal)
                                        {
                                            $this.trigger('rollNext');
                                        }
                                        break;
                                    case 'down':
                                        if (!_horizontal)
                                        {
                                            $this.trigger('rollPrev');
                                        }
                                        break;
                                    case 'left':
                                        if (_horizontal)
                                        {
                                            $this.trigger('rollNext');
                                        }
                                        break;
                                    case 'right':
                                        if (_horizontal)
                                        {
                                            $this.trigger('rollPrev');
                                        }
                                        break;
                                }
                            }
                            break;
                        case 'end':
                        case 'cancel':
                            _timed = false;
                            break;
                    }
                };
                // enable swipe on content
                $this.swipe({
                    swipeStatus: _swipe,
                    threshold: 5,
                    fingers: 1,
                    allowPageScroll: _horizontal ? 'vertical' : 'horizontal'
                });
            }

            if (_options.bindKeyboard)
            {
                if (_options.focus)
                {
                    _scroll.find(_options.focus).on('click' + $.aciCarousel.nameSpace, function(){
                        $this.focus();
                    });
                }
                // keyboard handling
                // ToDo: revert this on destroy too
                $this.css('outline', 'none').attr('tabIndex', 0).on('keydown' + $.aciCarousel.nameSpace, function(e){
                    if (!_focus)
                    {
                        // do not handle if we do not have focus
                        return;
                    }
                    switch (e.which)
                    {
                        case 37: // left
                            if (_horizontal)
                            {
                                $this.trigger('rollPrev', {
                                    'after': function(){
                                        $this.focus();
                                        if (_options.afterPrev)
                                        {
                                            _options.afterPrev();
                                        }
                                    }
                                });
                                return false;
                            }
                            break;
                        case 38: // up
                            if (!_horizontal)
                            {
                                $this.trigger('rollPrev', {
                                    'after': function(){
                                        $this.focus();
                                        if (_options.afterPrev)
                                        {
                                            _options.afterPrev();
                                        }
                                    }
                                });
                                return false;
                            }
                            break;
                        case 39: // right
                            if (_horizontal)
                            {
                                $this.trigger('rollNext', {
                                    'after': function(){
                                        $this.focus();
                                        if (_options.afterNext)
                                        {
                                            _options.afterNext();
                                        }
                                    }
                                });
                                return false;
                            }
                            break;
                        case 40: // down
                            if (!_horizontal)
                            {
                                $this.trigger('rollNext', {
                                    'after': function(){
                                        $this.focus();
                                        if (_options.afterNext)
                                        {
                                            _options.afterNext();
                                        }
                                    }
                                });
                                return false;
                            }
                            break;
                    }
                });
            }

        // ToDo: add support for url location hash - roll to a element

        };

        // init the control
        return _initUi();

    }; // end _customUi

})(jQuery);
