// Universal Module Definition: http://git.io/J7vtzw
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.returnExports = factory();
    }
}(this, function () {
    function MicroEvent(){}

    MicroEvent.prototype = {
        constructor: MicroEvent,
        bind: function(event, fct){
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(fct);
        },
        unbind: function(event, fct){
            this._events = this._events || {};
            if(event in this._events === false) { return; }
            this._events[event].splice(this._events[event].indexOf(fct), 1);
        },
        trigger: function(event /* , args... */){
            this._events = this._events || {};
            if (event in this._events === false) { return; }
            var callbacks = (this._events[event] || []).slice();
            while (callbacks.length) {
                callbacks.shift().apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    };

    MicroEvent.mixin = function(destObject){
        var props = ['bind', 'unbind', 'trigger'];
        for(var i = 0; i < props.length; i ++){
            if( typeof destObject === 'function' ){
                destObject.prototype[props[i]] = MicroEvent.prototype[props[i]];
            }else{
                destObject[props[i]] = MicroEvent.prototype[props[i]];
            }
        }
    }

    return MicroEvent;
}));
