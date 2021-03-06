var assert = require('assert');
var format = require('util').format;
var MicroEvent = require('./microevent');

test('.on() allows a handler to be bound for an event', function () {
    var events = new MicroEvent();
    var handler = createSpy();
    events.on('suprise', handler);
    events.trigger('suprise');
    assert(handler.called, 'Expected handler to be called when event was triggered');
});

test('.off() removes a registered handler', function () {
    var events = new MicroEvent();
    var handler = createSpy();
    events.on('suprise', handler);
    events.off('suprise', handler);
    events.trigger('suprise');
    assert(!handler.called, 'Expected handler not to be called when event was triggered');
});

test('.trigger() calls registered handlers for an event name', function () {
    var events = new MicroEvent();
    var handlerOne = createSpy();
    var handlerTwo = createSpy();
    events.on('suprise', handlerOne);
    events.on('suprise', handlerTwo);

    events.trigger('suprise');
    assert(handlerOne.called, 'Expected handlerOne to be called when event was triggered');
    assert(handlerTwo.called, 'Expected handlerTwo to be called when event was triggered');
});

test('.trigger() calls the handler once for each call', function () {
    var events = new MicroEvent();
    var handler = createSpy();
    events.on('suprise', handler);

    events.trigger('suprise');
    events.trigger('suprise');
    assert(handler.called === 2, 'Expected handler to be called twice');
});

test('.trigger() passes additional arguments through to handler', function () {
    var events = new MicroEvent();
    var handler = createSpy();
    events.on('suprise', handler);

    events.trigger('suprise', 'one', 'two', 'three');
    assert(handler.args.lastCall[0] === 'one', 'Expected first argument of handler to be one');
    assert(handler.args.lastCall[1] === 'two', 'Expected second argument of handler to be two');
    assert(handler.args.lastCall[2] === 'three', 'Expected third argument of handler to be three');
});

test('.trigger() allows handlers to be unbound in handler', function () {
    var events = new MicroEvent();
    var A = createSpy();
    var B = createSpy(function () { events.off('suprise', B); });
    var C = createSpy();

    events.on('suprise', A);
    events.on('suprise', B);
    events.on('suprise', C);

    events.trigger('suprise');
    assert(A.called === 1, 'Expected A to be called once');
    assert(B.called === 1, 'Expected B to be called once');
    assert(C.called === 1, 'Expected C to be called once');

    events.trigger('suprise');
    assert(A.called === 2, 'Expected A to be called twice');
    assert(B.called === 1, 'Expected B to be called once');
    assert(C.called === 2, 'Expected C to be called twice');
});

test('.mixin() applies the methods to the provided object', function () {
    var events = new MicroEvent();
    var obj = {};
    MicroEvent.mixin(obj);
    assert(obj.on === MicroEvent.prototype.on, 'Expected the on method to be present');
    assert(obj.off === MicroEvent.prototype.off, 'Expected the off method to be present');
    assert(obj.trigger === MicroEvent.prototype.trigger, 'Expected the trigger method to be present');
});

test('.mixin() applies the methods to the provided function prototype', function () {
    var events = new MicroEvent();
    function Klass() {}
    MicroEvent.mixin(Klass);
    assert(Klass.prototype.on === MicroEvent.prototype.on, 'Expected the on method to be present');
    assert(Klass.prototype.off === MicroEvent.prototype.off, 'Expected the off method to be present');
    assert(Klass.prototype.trigger === MicroEvent.prototype.trigger, 'Expected the trigger method to be present');
});

// Run the tests.
if (require.main === module) {
    run(test.suite);
}

// Test Suite Helpers

function createSpy(fn) {
    return function spy() {
        fn && fn.apply(this, arguments);

        var args = Array.prototype.slice.call(arguments);
        spy.args = (spy.args || []);
        spy.args.push(args);
        spy.args.lastCall = args;
        spy.called = (spy.called || 0) + 1;
    };
}

function test(msg, fn) {
    test.suite = test.suite || [];
    test.suite.push({msg: msg, fn: fn});
}

function run(suite) {
    var fails = [], total = suite.length, test;
    suite = suite.slice();

    while (suite.length) {
        test = suite.shift();
        try {
            test.fn();
        } catch (err) {
            fails.push({msg: test.msg, fn: test.fn, err: err});
        }
    }

    print(fails, total);
}

function print(fails, total) {
    if (fails.length) {
        fails.forEach(function (test) {
            var source = test.fn.toString().replace(/\n/g, '\n    ');
            puts('Test:\n    %s\n%s\nSource:\n    %s\n', test.msg, test.err.stack, source);
        });
        puts('%d tests completed with %d error(s)', total, fails.length);
        process.exit(1);
    } else {
        puts('%d tests passing with 0 errors', total);
        process.exit(0);
    }
}

function puts(msg) {
    var args = [].slice.call(arguments, 1);
    process.stdout.write(format.apply(null, [(msg || '') + '\n'].concat(args)));
}
