var assert = require('assert');
var format = require('util').format;
var MicroEvent = require('./microevent');
var events = new MicroEvent();

test('.bind() allows a handler to be bound for an event', function () {
    var handler = createSpy();
    events.bind('suprise', handler);
    events.trigger('suprise');
    assert(handler.called, 'Expected handler to be called when event was triggered');
});

test('.unbind() removes a registered handler', function () {
    var handler = createSpy();
    events.bind('suprise', handler);
    events.unbind('suprise', handler);
    events.trigger('suprise');
    assert(!handler.called, 'Expected handler not to be called when event was triggered');
});

test('.trigger() calls registered handlers for an event name', function () {
    var handlerOne = createSpy();
    var handlerTwo = createSpy();
    events.bind('suprise', handlerOne);
    events.bind('suprise', handlerTwo);

    events.trigger('suprise');
    assert(handlerOne.called, 'Expected handlerOne to be called when event was triggered');
    assert(handlerTwo.called, 'Expected handlerTwo to be called when event was triggered');
});

test('.trigger() calls the handler once for each call', function () {
    var handler = createSpy();
    events.bind('suprise', handler);

    events.trigger('suprise');
    events.trigger('suprise');
    assert(handler.callCount === 2, 'Expected handler to be called twice');
});

test('.trigger() passes additional arguments through to handler', function () {
    var handler = createSpy();
    events.bind('suprise', handler);

    events.trigger('suprise', 'one', 'two', 'three');
    assert(handler.args.lastCall[0] === 'one', 'Expected first argument of handler to be one');
    assert(handler.args.lastCall[1] === 'two', 'Expected second argument of handler to be two');
    assert(handler.args.lastCall[2] === 'three', 'Expected third argument of handler to be three');
});

// Run the tests.
if (require.main === module) {
    run(test.suite);
}

// Test Suite Helpers

function createSpy() {
    return function spy() {
        var args = Array.prototype.slice.call(arguments);
        spy.args = (spy.args || []);
        spy.args.push(args);
        spy.args.lastCall = args;
        spy.called = true;
        spy.callCount = (spy.callCount || 0) + 1;
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
