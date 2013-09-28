;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var SerialActor = require('../src/atropa-SerialActor.js');

try {
    Object.keys(SerialActor).forEach(
        function (prop) {
            if(!atropa[prop]) {
                atropa[prop] = SerialActor[prop];
            }
        }
    );
} catch (ignore) {
    atropa = require('../src/atropa-SerialActor.js');
}

Object.keys(SerialActor.data).filter(
    function (prop) {
        return prop !== 'requirements';
    }
).forEach(
    function (prop) {
        atropa.data[prop] = SerialActor.data[prop];
    }
);

},{"../src/atropa-SerialActor.js":2}],2:[function(require,module,exports){
/**
 * Container for all Glorious classes, functions, etc.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @namespace Container for all Glorious classes, functions, etc.
 */
var atropa = require('atropa-header');
/// <reference path="../docs/vsdoc/OpenLayersAll.js"/>
/*jslint 
    indent: 4,
    maxerr: 50,
    white: true,
    browser: true,
    devel: true,
    plusplus: true,
    regexp: true
*/
/*global atropa */
// end header

/**
 * A polling class designed for executing long running processes that return
 *  nothing and have no callback parameter.
 * @class A polling class designed for executing long running processes that
 *  return nothing and have no callback parameter.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @version 20130220
 * @param {String} actorName The name for the SerialActor instance.
 * @param {Function} actorFunction The function to execute when the
 *  SerialActor is free. This function must call the <code>free</code> function
 *  when it is finished in order to allow the actor to continue.
 * @returns {atropa.SerialActor} Returns an <code>atropa.SerialActor</code>
 *  instance.
 * @see <a href="../../../AtropaToolboxTests.html?spec=atropa.SerialActor">tests</a>
 * @example
 * function dummyActor(){
 *     var that = this;
 *     console.log('actorFunction would execute');
 *     console.log('freeing ' + this.name + ' in 10000 ms');
 *     setTimeout(function(){that.free();}, 10000);
 * };
 * var actor = new atropa.SerialActor('dummy', dummyActor);
 *     // change the name of the actor from
 *     // dummy to awesome
 * actor.name = "awesome";
 *     // set the polling interval (milliseconds)
 * actor.interval = 3000;
 *     // set the blocking timeout value (milliseconds)
 * actor.blockTimeoutValue = 120000;
 *     // start polling
 * actor.start();
 *     // dynamically change the SerialActor
 * setTimeout(function(){
 *     // change the polling interval
 *     // while the SerialActor is running.
 *     actor.changeInterval(2000);
 *         // change the actor function
 *     actor.actorFunction = function() {
 *         console.log('new actorFunction executing');
 *         console.log('freeing ' + this.name + ' immediately');
 *         this.free();
 *     };
 * },10000);
 */
atropa.SerialActor = function(actorName, actorFunction) {
    "use strict";
    var that, dummyActor;
    /**
     * Reference to <code>this</code>
     * @fieldOf atropa.SerialActor-
     * @private
     * @type {Object}
     */
    that = this;
    /**
     * Default actorFunction
     * @author <a href="mailto:matthewkastor@gmail.com">
     *  Matthew Christopher Kastor-Inare III </a><br />
     *  ☭ Hial Atropa!! ☭
     * @version 20130220
     * @methodOf atropa.SerialActor-
     * @private
     * @see atropa.SerialActor#actorFunction
     * @example
     * dummyActor = function(){
     *     console.log('actorFunction would execute');
     *     console.log('freeing Serial Actor in 10000 ms');
     *     setTimeout(function(){that.free();}, 10000);
     * };
     */
    dummyActor = function(){
        console.log('actorFunction would execute');
        console.log('freeing Serial Actor in 10000 ms');
        setTimeout(function(){that.free();}, 10000);
    };
    /**
     * The name of this instance. Defaults to "SerialActor"
     * @fieldOf atropa.SerialActor#
     * @type String
     * @default "SerialActor"
     */
    this.name = atropa.setAsOptionalArg('SerialActor', actorName);
    /**
     * Polling interval in milliseconds. This determines how frequently the
     *  actor function will try to execute. Defaults to 100 milliseconds.
     * @fieldOf atropa.SerialActor#
     * @type Number
     * @default 100
     */
    this.interval = 100; // milliseconds
    /**
     * The id of the interval set to poll the actor. You should not change
     *  this manually, use the start and stop functions instead. Defauls to
     *  undefined.
     * @fieldOf atropa.SerialActor#
     * @type Number
     * @default undefined
     */
    this.intervalId = undefined;
    /**
     * The state of the SerialActor. If true, the actor will sleep. If false the
     *  actor will execute the actor function when next polled. Defaults to
     *  false.
     * @fieldOf atropa.SerialActor#
     * @type Boolean
     * @default false
     */
    this.blocked = false;
    /**
     * Stores id's of currently running timeout functions used to free the actor
     *  if it has been blocked for too long.
     * @fieldOf atropa.SerialActor#
     * @see atropa.SerialActor#blockTimeoutValue
     * @type Array
     * @default []
     */
    this.timeouts = [];
    /**
     * The maximum time, in milliseconds, which the actor may be blocked for.
     *  After this duration has been reached the actor will be freed. Defaults
     *  to 60 seconds.
     * @fieldOf atropa.SerialActor#
     * @type Number
     * @default 60000
     */
    this.blockTimeoutValue = 60000;
    /**
     * The function to execute when the SerialActor is free. This function
     *  must call the <code>free</code> function when it is finished in order to
     *  allow the actor to continue. Defaults to the <code>dummyActor</code>
     *  function.
     * @fieldOf atropa.SerialActor#
     * @type Function
     * @default dummyActor
     * @see atropa.SerialActor-dummyActor
     * @example
     * dummyActor = function(){
     *     console.log('actorFunction would execute');
     *     console.log('freeing Serial Actor in 10000 ms');
     *     setTimeout(function(){that.free();}, 10000);
     * };
     */
    this.actorFunction = atropa.setAsOptionalArg(dummyActor, actorFunction);
    /**
     * The action function is called when the actor is polled and it's blocked
     *  state is false. This method should not be set or called manually, set
     *  the <code>actorFunction</code> instead.
     * @author <a href="mailto:matthewkastor@gmail.com">
     *  Matthew Christopher Kastor-Inare III </a><br />
     *  ☭ Hial Atropa!! ☭
     * @version 20130220
     * @methodOf atropa.SerialActor#
     * @see atropa.SerialActor#actorFunction
     */
    this.action = function() {
        if(false === that.blocked) {
            that.block();
            setTimeout(function() {
                that.actorFunction();
            }, 10);
        } else {
            console.log(that.name + ' sleeping for ' + that.interval + ' ms');
        }
    };
};
/**
 * Prevents the actor from executing it's actorFunction. This block will timeout
 *  once the <code>blockTimeoutValue</code> has been reached.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @version 20130220
 * @methodOf atropa.SerialActor#
 * @returns {Boolean} Returns the value of this instances <code>blocked</code>
 *  property.
 * @see atropa.SerialActor#blocked
 * @example
 * function d() {
 *     console.log('doing stuff to things');
 *     this.free();
 * }
 * 
 * var actor = new atropa.SerialActor('dummy', d);
 * actor.interval = 2000;
 * actor.blockTimeoutValue = 5000;
 * actor.start();
 * // 5 seconds after starting the actor will be blocked.
 * // It will remain blocked until the block timeout is reached.
 * setTimeout(function() {
 *     console.log('blocking!!!');
 *     actor.block();
 * }, 5000);
 */
atropa.SerialActor.prototype.block = function() {
    "use strict";
    var that = this;
    console.log(this.name + ' block');
    this.blocked = true;
    this.timeouts.push(
        setTimeout(function() {that.blockTimeout();}, that.blockTimeoutValue));
    return this.blocked;
};
/**
 * Called when the <code>blockTimeoutValue</code> has been reached. This frees
 *  the actor and removes the timeout reference from the timeouts array.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @version 20130220
 * @methodOf atropa.SerialActor#
 * @returns {Boolean} Returns the value of this instances <code>blocked</code>
 *  property.
 * @see atropa.SerialActor#blocked
 */
atropa.SerialActor.prototype.blockTimeout = function() {
    "use strict";
    console.log(this.name + ' block timeout');
    return this.free();
};
/**
 * Frees the actor so it may execute its actor function when next polled.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @version 20130220
 * @methodOf atropa.SerialActor#
 * @returns {Boolean} Returns the value of this instances <code>blocked</code>
 *  property.
 * @see atropa.SerialActor#blocked
 * @example
 * function d() {
 *     console.log('doing stuff to things');
 *     this.free();
 * }
 * 
 * var actor = new atropa.SerialActor('dummy', d);
 * actor.interval = 2000;
 * actor.blockTimeoutValue = 50000;
 * actor.start();
 * actor.block();
 * // 5 seconds after starting the actor will be freed.
 * setTimeout(function() {
 *     actor.free();
 * }, 5000);
 */
atropa.SerialActor.prototype.free = function() {
    "use strict";
    console.log(this.name + ' free');
    this.blocked = false;
    clearTimeout(this.timeouts.shift());
    return this.blocked;
};
/**
 * Starts polling the actor.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @version 20130220
 * @methodOf atropa.SerialActor#
 * @param {Number} interval Optional. The polling interval. Defaults to the
 *  value of <code>this.interval</code>
 * @see atropa.SerialActor#interval
 * @returns {Number} Returns the value of this instance's
 *  <code>intervalId</code> property.
 * @see atropa.SerialActor#intervalId
 * @example
 * var actor = new atropa.SerialActor('dummy');
 * actor.start();
 */
atropa.SerialActor.prototype.start = function(interval) {
    "use strict";
    var that = this;
    this.interval = atropa.setAsOptionalArg(this.interval, interval);
    
    if(this.intervalId !== undefined) {
        // clear the old timeout before creating a new one.
        this.stop();
    }
    this.intervalId = setInterval(that.action, that.interval);
    console.log(this.name + ' started');
    return this.intervalId;
};
/**
 * Adjusts the polling interval after <code>start</code> has
 * been called.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @version 20130220
 * @methodOf atropa.SerialActor#
 * @param {Number} interval The new polling interval in milliseconds.
 * @returns {Number} Returns the value of this instance's 
 *  <code>intervalId</code> property.
 * @see atropa.SerialActor#intervalId
 * @example
 * var actor = new atropa.SerialActor('dummy');
 * actor.start();
 *     // 5 seconds after starting the polling interval will be changed.
 * setTimeout(function(){
 *     actor.changeInterval(2000);
 * }, 5000);
 */
atropa.SerialActor.prototype.changeInterval = function(interval) {
    "use strict";
    console.log(this.name + ' changing interval');
    return this.start(interval);
};
/**
 * Stops polling the actor. Note that the actor will be freed once the
 *  <code>blockTimeoutValue</code> has been reached. This will not restart the
 *  polling.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @version 20130220
 * @methodOf atropa.SerialActor#
 * @see atropa.SerialActor#blocked
 * @see atropa.SerialActor#blockTimeoutValue
 * @example
 * var actor = new atropa.SerialActor('dummy');
 * actor.start();
 *     // 5 seconds after starting the actor will be stopped.
 * setTimeout(function(){
 *     actor.stop();
 * }, 5000);
 */
atropa.SerialActor.prototype.stop = function() {
    "use strict";
    clearInterval(this.intervalId);
    this.intervalId = undefined;
    console.log(this.name + ' stopped');
};




while(atropa.data.requirements.length > 0) {
    atropa.data.requirements.pop()();
}
module.exports = atropa;

},{"atropa-header":3}],3:[function(require,module,exports){
var atropa = {};

/// <reference path="../../docs/vsdoc/OpenLayersAll.js"/>

/*jslint
    indent: 4,
    maxerr: 50,
    white: true,
    browser: true,
    devel: true,
    plusplus: true,
    regexp: true
*/
/*global XPathResult */
// end header

/**
 * Container for all Glorious classes, functions, etc.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @namespace Container for all Glorious classes, functions, etc.
 */
var atropa;
atropa = {};
/**
 * Checks whether this class has been marked as unsupported and throws an 
 *  error if it has.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @version 20130308
 * @param {String} className The name of the class.
 * @param {String} errorMessage Optional. A custom error message. Defaults to
 *  atropa.data[className].error
 */
atropa.supportCheck = function (className, errorMessage) {
    "use strict";
    className = String(className);
    errorMessage = errorMessage || atropa.data[className].error;
    errorMessage = String(errorMessage);
    
    if(atropa.data[className].support === 'unsupported') {
        throw new Error(errorMessage);
    }
};
/**
 * Pushes a requirement check into atropa.data.requirements. The test
 *  tests whether the class is supported in this environment. Sets
 *  atropa.data[className]'s support to unsupported and error to errorMessage
 *  if the requirementFn returns false. The requirement checks will all be run
 *  after the library has loaded.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @version 20130308
 * @param {String} className The name of the class.
 * @param {Function} requirementFn A function to test whether or not the class
 *  is supported in this environment. If supported, returns true otherwise
 *  return false.
 * @param {String} errorMessage The error message to use when this class or its
 *  methods are called in unsupported environments. Defaults to:
 *  'The atropa.' + className + ' class is unsupported in this environment.';
 */
atropa.requires = function (className, requirementFn, errorMessage) {
    "use strict";
    var check = function () {
        var test = false;
        if(typeof className !== 'string') {
            throw new Error('atropa.requires requires the class name to be ' +
                'specified');
        }
        
        if(atropa.data[className] === undefined) {
            atropa.data[className] = {};
            
            if(typeof requirementFn !== 'function') {
                requirementFn = false;
            }
            errorMessage = errorMessage || 'The atropa.' + className +
                    ' class is unsupported in this environment.';
            try {
                test = requirementFn();
            } catch (e) {
                test = false;
            }
            
            atropa.data[className].error = errorMessage;
            
            if(test === false) {
                atropa.data[className].support = 'unsupported';
            }
        }
    };
    
    atropa.data.requirements.push(check);
};
/**
 * Container for gobal data related to the classes and functions.
 * @author <a href="mailto:matthewkastor@gmail.com">
 *  Matthew Christopher Kastor-Inare III </a><br />
 *  ☭ Hial Atropa!! ☭
 * @namespace Container for gobal data related to the classes and functions.
 */
atropa.data = {};

atropa.data.requirements = [];

atropa.nop = function nop () {
    "use strict";
    return null;
};
module.exports = atropa;


},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXGthc3RvclxcRGVza3RvcFxcZXhwZXJpbWVudHNcXGF0cm9wYS1jb21wb25lbnRzXFxub2RlX21vZHVsZXNcXGF0cm9wYS1TZXJpYWxBY3RvclxcZGV2XFxicm93c2VyTWFpbi5qcyIsIkM6XFxVc2Vyc1xca2FzdG9yXFxEZXNrdG9wXFxleHBlcmltZW50c1xcYXRyb3BhLWNvbXBvbmVudHNcXG5vZGVfbW9kdWxlc1xcYXRyb3BhLVNlcmlhbEFjdG9yXFxzcmNcXGF0cm9wYS1TZXJpYWxBY3Rvci5qcyIsIkM6XFxVc2Vyc1xca2FzdG9yXFxEZXNrdG9wXFxleHBlcmltZW50c1xcYXRyb3BhLWNvbXBvbmVudHNcXG5vZGVfbW9kdWxlc1xcYXRyb3BhLWhlYWRlclxcc3JjXFxhdHJvcGEtaGVhZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciBTZXJpYWxBY3RvciA9IHJlcXVpcmUoJy4uL3NyYy9hdHJvcGEtU2VyaWFsQWN0b3IuanMnKTtcclxuXHJcbnRyeSB7XHJcbiAgICBPYmplY3Qua2V5cyhTZXJpYWxBY3RvcikuZm9yRWFjaChcclxuICAgICAgICBmdW5jdGlvbiAocHJvcCkge1xyXG4gICAgICAgICAgICBpZighYXRyb3BhW3Byb3BdKSB7XHJcbiAgICAgICAgICAgICAgICBhdHJvcGFbcHJvcF0gPSBTZXJpYWxBY3Rvcltwcm9wXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn0gY2F0Y2ggKGlnbm9yZSkge1xyXG4gICAgYXRyb3BhID0gcmVxdWlyZSgnLi4vc3JjL2F0cm9wYS1TZXJpYWxBY3Rvci5qcycpO1xyXG59XHJcblxyXG5PYmplY3Qua2V5cyhTZXJpYWxBY3Rvci5kYXRhKS5maWx0ZXIoXHJcbiAgICBmdW5jdGlvbiAocHJvcCkge1xyXG4gICAgICAgIHJldHVybiBwcm9wICE9PSAncmVxdWlyZW1lbnRzJztcclxuICAgIH1cclxuKS5mb3JFYWNoKFxyXG4gICAgZnVuY3Rpb24gKHByb3ApIHtcclxuICAgICAgICBhdHJvcGEuZGF0YVtwcm9wXSA9IFNlcmlhbEFjdG9yLmRhdGFbcHJvcF07XHJcbiAgICB9XHJcbik7XHJcbiIsIi8qKlxyXG4gKiBDb250YWluZXIgZm9yIGFsbCBHbG9yaW91cyBjbGFzc2VzLCBmdW5jdGlvbnMsIGV0Yy5cclxuICogQGF1dGhvciA8YSBocmVmPVwibWFpbHRvOm1hdHRoZXdrYXN0b3JAZ21haWwuY29tXCI+XHJcbiAqICBNYXR0aGV3IENocmlzdG9waGVyIEthc3Rvci1JbmFyZSBJSUkgPC9hPjxiciAvPlxyXG4gKiAg4pitIEhpYWwgQXRyb3BhISEg4pitXHJcbiAqIEBuYW1lc3BhY2UgQ29udGFpbmVyIGZvciBhbGwgR2xvcmlvdXMgY2xhc3NlcywgZnVuY3Rpb25zLCBldGMuXHJcbiAqL1xyXG52YXIgYXRyb3BhID0gcmVxdWlyZSgnYXRyb3BhLWhlYWRlcicpO1xyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZG9jcy92c2RvYy9PcGVuTGF5ZXJzQWxsLmpzXCIvPlxyXG4vKmpzbGludCBcclxuICAgIGluZGVudDogNCxcclxuICAgIG1heGVycjogNTAsXHJcbiAgICB3aGl0ZTogdHJ1ZSxcclxuICAgIGJyb3dzZXI6IHRydWUsXHJcbiAgICBkZXZlbDogdHJ1ZSxcclxuICAgIHBsdXNwbHVzOiB0cnVlLFxyXG4gICAgcmVnZXhwOiB0cnVlXHJcbiovXHJcbi8qZ2xvYmFsIGF0cm9wYSAqL1xyXG4vLyBlbmQgaGVhZGVyXHJcblxyXG4vKipcclxuICogQSBwb2xsaW5nIGNsYXNzIGRlc2lnbmVkIGZvciBleGVjdXRpbmcgbG9uZyBydW5uaW5nIHByb2Nlc3NlcyB0aGF0IHJldHVyblxyXG4gKiAgbm90aGluZyBhbmQgaGF2ZSBubyBjYWxsYmFjayBwYXJhbWV0ZXIuXHJcbiAqIEBjbGFzcyBBIHBvbGxpbmcgY2xhc3MgZGVzaWduZWQgZm9yIGV4ZWN1dGluZyBsb25nIHJ1bm5pbmcgcHJvY2Vzc2VzIHRoYXRcclxuICogIHJldHVybiBub3RoaW5nIGFuZCBoYXZlIG5vIGNhbGxiYWNrIHBhcmFtZXRlci5cclxuICogQGF1dGhvciA8YSBocmVmPVwibWFpbHRvOm1hdHRoZXdrYXN0b3JAZ21haWwuY29tXCI+XHJcbiAqICBNYXR0aGV3IENocmlzdG9waGVyIEthc3Rvci1JbmFyZSBJSUkgPC9hPjxiciAvPlxyXG4gKiAg4pitIEhpYWwgQXRyb3BhISEg4pitXHJcbiAqIEB2ZXJzaW9uIDIwMTMwMjIwXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rvck5hbWUgVGhlIG5hbWUgZm9yIHRoZSBTZXJpYWxBY3RvciBpbnN0YW5jZS5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gYWN0b3JGdW5jdGlvbiBUaGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZVxyXG4gKiAgU2VyaWFsQWN0b3IgaXMgZnJlZS4gVGhpcyBmdW5jdGlvbiBtdXN0IGNhbGwgdGhlIDxjb2RlPmZyZWU8L2NvZGU+IGZ1bmN0aW9uXHJcbiAqICB3aGVuIGl0IGlzIGZpbmlzaGVkIGluIG9yZGVyIHRvIGFsbG93IHRoZSBhY3RvciB0byBjb250aW51ZS5cclxuICogQHJldHVybnMge2F0cm9wYS5TZXJpYWxBY3Rvcn0gUmV0dXJucyBhbiA8Y29kZT5hdHJvcGEuU2VyaWFsQWN0b3I8L2NvZGU+XHJcbiAqICBpbnN0YW5jZS5cclxuICogQHNlZSA8YSBocmVmPVwiLi4vLi4vLi4vQXRyb3BhVG9vbGJveFRlc3RzLmh0bWw/c3BlYz1hdHJvcGEuU2VyaWFsQWN0b3JcIj50ZXN0czwvYT5cclxuICogQGV4YW1wbGVcclxuICogZnVuY3Rpb24gZHVtbXlBY3Rvcigpe1xyXG4gKiAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gKiAgICAgY29uc29sZS5sb2coJ2FjdG9yRnVuY3Rpb24gd291bGQgZXhlY3V0ZScpO1xyXG4gKiAgICAgY29uc29sZS5sb2coJ2ZyZWVpbmcgJyArIHRoaXMubmFtZSArICcgaW4gMTAwMDAgbXMnKTtcclxuICogICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXt0aGF0LmZyZWUoKTt9LCAxMDAwMCk7XHJcbiAqIH07XHJcbiAqIHZhciBhY3RvciA9IG5ldyBhdHJvcGEuU2VyaWFsQWN0b3IoJ2R1bW15JywgZHVtbXlBY3Rvcik7XHJcbiAqICAgICAvLyBjaGFuZ2UgdGhlIG5hbWUgb2YgdGhlIGFjdG9yIGZyb21cclxuICogICAgIC8vIGR1bW15IHRvIGF3ZXNvbWVcclxuICogYWN0b3IubmFtZSA9IFwiYXdlc29tZVwiO1xyXG4gKiAgICAgLy8gc2V0IHRoZSBwb2xsaW5nIGludGVydmFsIChtaWxsaXNlY29uZHMpXHJcbiAqIGFjdG9yLmludGVydmFsID0gMzAwMDtcclxuICogICAgIC8vIHNldCB0aGUgYmxvY2tpbmcgdGltZW91dCB2YWx1ZSAobWlsbGlzZWNvbmRzKVxyXG4gKiBhY3Rvci5ibG9ja1RpbWVvdXRWYWx1ZSA9IDEyMDAwMDtcclxuICogICAgIC8vIHN0YXJ0IHBvbGxpbmdcclxuICogYWN0b3Iuc3RhcnQoKTtcclxuICogICAgIC8vIGR5bmFtaWNhbGx5IGNoYW5nZSB0aGUgU2VyaWFsQWN0b3JcclxuICogc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gKiAgICAgLy8gY2hhbmdlIHRoZSBwb2xsaW5nIGludGVydmFsXHJcbiAqICAgICAvLyB3aGlsZSB0aGUgU2VyaWFsQWN0b3IgaXMgcnVubmluZy5cclxuICogICAgIGFjdG9yLmNoYW5nZUludGVydmFsKDIwMDApO1xyXG4gKiAgICAgICAgIC8vIGNoYW5nZSB0aGUgYWN0b3IgZnVuY3Rpb25cclxuICogICAgIGFjdG9yLmFjdG9yRnVuY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuICogICAgICAgICBjb25zb2xlLmxvZygnbmV3IGFjdG9yRnVuY3Rpb24gZXhlY3V0aW5nJyk7XHJcbiAqICAgICAgICAgY29uc29sZS5sb2coJ2ZyZWVpbmcgJyArIHRoaXMubmFtZSArICcgaW1tZWRpYXRlbHknKTtcclxuICogICAgICAgICB0aGlzLmZyZWUoKTtcclxuICogICAgIH07XHJcbiAqIH0sMTAwMDApO1xyXG4gKi9cclxuYXRyb3BhLlNlcmlhbEFjdG9yID0gZnVuY3Rpb24oYWN0b3JOYW1lLCBhY3RvckZ1bmN0aW9uKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciB0aGF0LCBkdW1teUFjdG9yO1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZWZlcmVuY2UgdG8gPGNvZGU+dGhpczwvY29kZT5cclxuICAgICAqIEBmaWVsZE9mIGF0cm9wYS5TZXJpYWxBY3Rvci1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICovXHJcbiAgICB0aGF0ID0gdGhpcztcclxuICAgIC8qKlxyXG4gICAgICogRGVmYXVsdCBhY3RvckZ1bmN0aW9uXHJcbiAgICAgKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86bWF0dGhld2thc3RvckBnbWFpbC5jb21cIj5cclxuICAgICAqICBNYXR0aGV3IENocmlzdG9waGVyIEthc3Rvci1JbmFyZSBJSUkgPC9hPjxiciAvPlxyXG4gICAgICogIOKYrSBIaWFsIEF0cm9wYSEhIOKYrVxyXG4gICAgICogQHZlcnNpb24gMjAxMzAyMjBcclxuICAgICAqIEBtZXRob2RPZiBhdHJvcGEuU2VyaWFsQWN0b3ItXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHNlZSBhdHJvcGEuU2VyaWFsQWN0b3IjYWN0b3JGdW5jdGlvblxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGR1bW15QWN0b3IgPSBmdW5jdGlvbigpe1xyXG4gICAgICogICAgIGNvbnNvbGUubG9nKCdhY3RvckZ1bmN0aW9uIHdvdWxkIGV4ZWN1dGUnKTtcclxuICAgICAqICAgICBjb25zb2xlLmxvZygnZnJlZWluZyBTZXJpYWwgQWN0b3IgaW4gMTAwMDAgbXMnKTtcclxuICAgICAqICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhhdC5mcmVlKCk7fSwgMTAwMDApO1xyXG4gICAgICogfTtcclxuICAgICAqL1xyXG4gICAgZHVtbXlBY3RvciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2FjdG9yRnVuY3Rpb24gd291bGQgZXhlY3V0ZScpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdmcmVlaW5nIFNlcmlhbCBBY3RvciBpbiAxMDAwMCBtcycpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXt0aGF0LmZyZWUoKTt9LCAxMDAwMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGlzIGluc3RhbmNlLiBEZWZhdWx0cyB0byBcIlNlcmlhbEFjdG9yXCJcclxuICAgICAqIEBmaWVsZE9mIGF0cm9wYS5TZXJpYWxBY3RvciNcclxuICAgICAqIEB0eXBlIFN0cmluZ1xyXG4gICAgICogQGRlZmF1bHQgXCJTZXJpYWxBY3RvclwiXHJcbiAgICAgKi9cclxuICAgIHRoaXMubmFtZSA9IGF0cm9wYS5zZXRBc09wdGlvbmFsQXJnKCdTZXJpYWxBY3RvcicsIGFjdG9yTmFtZSk7XHJcbiAgICAvKipcclxuICAgICAqIFBvbGxpbmcgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzLiBUaGlzIGRldGVybWluZXMgaG93IGZyZXF1ZW50bHkgdGhlXHJcbiAgICAgKiAgYWN0b3IgZnVuY3Rpb24gd2lsbCB0cnkgdG8gZXhlY3V0ZS4gRGVmYXVsdHMgdG8gMTAwIG1pbGxpc2Vjb25kcy5cclxuICAgICAqIEBmaWVsZE9mIGF0cm9wYS5TZXJpYWxBY3RvciNcclxuICAgICAqIEB0eXBlIE51bWJlclxyXG4gICAgICogQGRlZmF1bHQgMTAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMuaW50ZXJ2YWwgPSAxMDA7IC8vIG1pbGxpc2Vjb25kc1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaWQgb2YgdGhlIGludGVydmFsIHNldCB0byBwb2xsIHRoZSBhY3Rvci4gWW91IHNob3VsZCBub3QgY2hhbmdlXHJcbiAgICAgKiAgdGhpcyBtYW51YWxseSwgdXNlIHRoZSBzdGFydCBhbmQgc3RvcCBmdW5jdGlvbnMgaW5zdGVhZC4gRGVmYXVscyB0b1xyXG4gICAgICogIHVuZGVmaW5lZC5cclxuICAgICAqIEBmaWVsZE9mIGF0cm9wYS5TZXJpYWxBY3RvciNcclxuICAgICAqIEB0eXBlIE51bWJlclxyXG4gICAgICogQGRlZmF1bHQgdW5kZWZpbmVkXHJcbiAgICAgKi9cclxuICAgIHRoaXMuaW50ZXJ2YWxJZCA9IHVuZGVmaW5lZDtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHN0YXRlIG9mIHRoZSBTZXJpYWxBY3Rvci4gSWYgdHJ1ZSwgdGhlIGFjdG9yIHdpbGwgc2xlZXAuIElmIGZhbHNlIHRoZVxyXG4gICAgICogIGFjdG9yIHdpbGwgZXhlY3V0ZSB0aGUgYWN0b3IgZnVuY3Rpb24gd2hlbiBuZXh0IHBvbGxlZC4gRGVmYXVsdHMgdG9cclxuICAgICAqICBmYWxzZS5cclxuICAgICAqIEBmaWVsZE9mIGF0cm9wYS5TZXJpYWxBY3RvciNcclxuICAgICAqIEB0eXBlIEJvb2xlYW5cclxuICAgICAqIEBkZWZhdWx0IGZhbHNlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuYmxvY2tlZCA9IGZhbHNlO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9yZXMgaWQncyBvZiBjdXJyZW50bHkgcnVubmluZyB0aW1lb3V0IGZ1bmN0aW9ucyB1c2VkIHRvIGZyZWUgdGhlIGFjdG9yXHJcbiAgICAgKiAgaWYgaXQgaGFzIGJlZW4gYmxvY2tlZCBmb3IgdG9vIGxvbmcuXHJcbiAgICAgKiBAZmllbGRPZiBhdHJvcGEuU2VyaWFsQWN0b3IjXHJcbiAgICAgKiBAc2VlIGF0cm9wYS5TZXJpYWxBY3RvciNibG9ja1RpbWVvdXRWYWx1ZVxyXG4gICAgICogQHR5cGUgQXJyYXlcclxuICAgICAqIEBkZWZhdWx0IFtdXHJcbiAgICAgKi9cclxuICAgIHRoaXMudGltZW91dHMgPSBbXTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1heGltdW0gdGltZSwgaW4gbWlsbGlzZWNvbmRzLCB3aGljaCB0aGUgYWN0b3IgbWF5IGJlIGJsb2NrZWQgZm9yLlxyXG4gICAgICogIEFmdGVyIHRoaXMgZHVyYXRpb24gaGFzIGJlZW4gcmVhY2hlZCB0aGUgYWN0b3Igd2lsbCBiZSBmcmVlZC4gRGVmYXVsdHNcclxuICAgICAqICB0byA2MCBzZWNvbmRzLlxyXG4gICAgICogQGZpZWxkT2YgYXRyb3BhLlNlcmlhbEFjdG9yI1xyXG4gICAgICogQHR5cGUgTnVtYmVyXHJcbiAgICAgKiBAZGVmYXVsdCA2MDAwMFxyXG4gICAgICovXHJcbiAgICB0aGlzLmJsb2NrVGltZW91dFZhbHVlID0gNjAwMDA7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBmdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIFNlcmlhbEFjdG9yIGlzIGZyZWUuIFRoaXMgZnVuY3Rpb25cclxuICAgICAqICBtdXN0IGNhbGwgdGhlIDxjb2RlPmZyZWU8L2NvZGU+IGZ1bmN0aW9uIHdoZW4gaXQgaXMgZmluaXNoZWQgaW4gb3JkZXIgdG9cclxuICAgICAqICBhbGxvdyB0aGUgYWN0b3IgdG8gY29udGludWUuIERlZmF1bHRzIHRvIHRoZSA8Y29kZT5kdW1teUFjdG9yPC9jb2RlPlxyXG4gICAgICogIGZ1bmN0aW9uLlxyXG4gICAgICogQGZpZWxkT2YgYXRyb3BhLlNlcmlhbEFjdG9yI1xyXG4gICAgICogQHR5cGUgRnVuY3Rpb25cclxuICAgICAqIEBkZWZhdWx0IGR1bW15QWN0b3JcclxuICAgICAqIEBzZWUgYXRyb3BhLlNlcmlhbEFjdG9yLWR1bW15QWN0b3JcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBkdW1teUFjdG9yID0gZnVuY3Rpb24oKXtcclxuICAgICAqICAgICBjb25zb2xlLmxvZygnYWN0b3JGdW5jdGlvbiB3b3VsZCBleGVjdXRlJyk7XHJcbiAgICAgKiAgICAgY29uc29sZS5sb2coJ2ZyZWVpbmcgU2VyaWFsIEFjdG9yIGluIDEwMDAwIG1zJyk7XHJcbiAgICAgKiAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe3RoYXQuZnJlZSgpO30sIDEwMDAwKTtcclxuICAgICAqIH07XHJcbiAgICAgKi9cclxuICAgIHRoaXMuYWN0b3JGdW5jdGlvbiA9IGF0cm9wYS5zZXRBc09wdGlvbmFsQXJnKGR1bW15QWN0b3IsIGFjdG9yRnVuY3Rpb24pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYWN0aW9uIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aGVuIHRoZSBhY3RvciBpcyBwb2xsZWQgYW5kIGl0J3MgYmxvY2tlZFxyXG4gICAgICogIHN0YXRlIGlzIGZhbHNlLiBUaGlzIG1ldGhvZCBzaG91bGQgbm90IGJlIHNldCBvciBjYWxsZWQgbWFudWFsbHksIHNldFxyXG4gICAgICogIHRoZSA8Y29kZT5hY3RvckZ1bmN0aW9uPC9jb2RlPiBpbnN0ZWFkLlxyXG4gICAgICogQGF1dGhvciA8YSBocmVmPVwibWFpbHRvOm1hdHRoZXdrYXN0b3JAZ21haWwuY29tXCI+XHJcbiAgICAgKiAgTWF0dGhldyBDaHJpc3RvcGhlciBLYXN0b3ItSW5hcmUgSUlJIDwvYT48YnIgLz5cclxuICAgICAqICDimK0gSGlhbCBBdHJvcGEhISDimK1cclxuICAgICAqIEB2ZXJzaW9uIDIwMTMwMjIwXHJcbiAgICAgKiBAbWV0aG9kT2YgYXRyb3BhLlNlcmlhbEFjdG9yI1xyXG4gICAgICogQHNlZSBhdHJvcGEuU2VyaWFsQWN0b3IjYWN0b3JGdW5jdGlvblxyXG4gICAgICovXHJcbiAgICB0aGlzLmFjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmKGZhbHNlID09PSB0aGF0LmJsb2NrZWQpIHtcclxuICAgICAgICAgICAgdGhhdC5ibG9jaygpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5hY3RvckZ1bmN0aW9uKCk7XHJcbiAgICAgICAgICAgIH0sIDEwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0Lm5hbWUgKyAnIHNsZWVwaW5nIGZvciAnICsgdGhhdC5pbnRlcnZhbCArICcgbXMnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG4vKipcclxuICogUHJldmVudHMgdGhlIGFjdG9yIGZyb20gZXhlY3V0aW5nIGl0J3MgYWN0b3JGdW5jdGlvbi4gVGhpcyBibG9jayB3aWxsIHRpbWVvdXRcclxuICogIG9uY2UgdGhlIDxjb2RlPmJsb2NrVGltZW91dFZhbHVlPC9jb2RlPiBoYXMgYmVlbiByZWFjaGVkLlxyXG4gKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86bWF0dGhld2thc3RvckBnbWFpbC5jb21cIj5cclxuICogIE1hdHRoZXcgQ2hyaXN0b3BoZXIgS2FzdG9yLUluYXJlIElJSSA8L2E+PGJyIC8+XHJcbiAqICDimK0gSGlhbCBBdHJvcGEhISDimK1cclxuICogQHZlcnNpb24gMjAxMzAyMjBcclxuICogQG1ldGhvZE9mIGF0cm9wYS5TZXJpYWxBY3RvciNcclxuICogQHJldHVybnMge0Jvb2xlYW59IFJldHVybnMgdGhlIHZhbHVlIG9mIHRoaXMgaW5zdGFuY2VzIDxjb2RlPmJsb2NrZWQ8L2NvZGU+XHJcbiAqICBwcm9wZXJ0eS5cclxuICogQHNlZSBhdHJvcGEuU2VyaWFsQWN0b3IjYmxvY2tlZFxyXG4gKiBAZXhhbXBsZVxyXG4gKiBmdW5jdGlvbiBkKCkge1xyXG4gKiAgICAgY29uc29sZS5sb2coJ2RvaW5nIHN0dWZmIHRvIHRoaW5ncycpO1xyXG4gKiAgICAgdGhpcy5mcmVlKCk7XHJcbiAqIH1cclxuICogXHJcbiAqIHZhciBhY3RvciA9IG5ldyBhdHJvcGEuU2VyaWFsQWN0b3IoJ2R1bW15JywgZCk7XHJcbiAqIGFjdG9yLmludGVydmFsID0gMjAwMDtcclxuICogYWN0b3IuYmxvY2tUaW1lb3V0VmFsdWUgPSA1MDAwO1xyXG4gKiBhY3Rvci5zdGFydCgpO1xyXG4gKiAvLyA1IHNlY29uZHMgYWZ0ZXIgc3RhcnRpbmcgdGhlIGFjdG9yIHdpbGwgYmUgYmxvY2tlZC5cclxuICogLy8gSXQgd2lsbCByZW1haW4gYmxvY2tlZCB1bnRpbCB0aGUgYmxvY2sgdGltZW91dCBpcyByZWFjaGVkLlxyXG4gKiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gKiAgICAgY29uc29sZS5sb2coJ2Jsb2NraW5nISEhJyk7XHJcbiAqICAgICBhY3Rvci5ibG9jaygpO1xyXG4gKiB9LCA1MDAwKTtcclxuICovXHJcbmF0cm9wYS5TZXJpYWxBY3Rvci5wcm90b3R5cGUuYmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgY29uc29sZS5sb2codGhpcy5uYW1lICsgJyBibG9jaycpO1xyXG4gICAgdGhpcy5ibG9ja2VkID0gdHJ1ZTtcclxuICAgIHRoaXMudGltZW91dHMucHVzaChcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge3RoYXQuYmxvY2tUaW1lb3V0KCk7fSwgdGhhdC5ibG9ja1RpbWVvdXRWYWx1ZSkpO1xyXG4gICAgcmV0dXJuIHRoaXMuYmxvY2tlZDtcclxufTtcclxuLyoqXHJcbiAqIENhbGxlZCB3aGVuIHRoZSA8Y29kZT5ibG9ja1RpbWVvdXRWYWx1ZTwvY29kZT4gaGFzIGJlZW4gcmVhY2hlZC4gVGhpcyBmcmVlc1xyXG4gKiAgdGhlIGFjdG9yIGFuZCByZW1vdmVzIHRoZSB0aW1lb3V0IHJlZmVyZW5jZSBmcm9tIHRoZSB0aW1lb3V0cyBhcnJheS5cclxuICogQGF1dGhvciA8YSBocmVmPVwibWFpbHRvOm1hdHRoZXdrYXN0b3JAZ21haWwuY29tXCI+XHJcbiAqICBNYXR0aGV3IENocmlzdG9waGVyIEthc3Rvci1JbmFyZSBJSUkgPC9hPjxiciAvPlxyXG4gKiAg4pitIEhpYWwgQXRyb3BhISEg4pitXHJcbiAqIEB2ZXJzaW9uIDIwMTMwMjIwXHJcbiAqIEBtZXRob2RPZiBhdHJvcGEuU2VyaWFsQWN0b3IjXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGlzIGluc3RhbmNlcyA8Y29kZT5ibG9ja2VkPC9jb2RlPlxyXG4gKiAgcHJvcGVydHkuXHJcbiAqIEBzZWUgYXRyb3BhLlNlcmlhbEFjdG9yI2Jsb2NrZWRcclxuICovXHJcbmF0cm9wYS5TZXJpYWxBY3Rvci5wcm90b3R5cGUuYmxvY2tUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMubmFtZSArICcgYmxvY2sgdGltZW91dCcpO1xyXG4gICAgcmV0dXJuIHRoaXMuZnJlZSgpO1xyXG59O1xyXG4vKipcclxuICogRnJlZXMgdGhlIGFjdG9yIHNvIGl0IG1heSBleGVjdXRlIGl0cyBhY3RvciBmdW5jdGlvbiB3aGVuIG5leHQgcG9sbGVkLlxyXG4gKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86bWF0dGhld2thc3RvckBnbWFpbC5jb21cIj5cclxuICogIE1hdHRoZXcgQ2hyaXN0b3BoZXIgS2FzdG9yLUluYXJlIElJSSA8L2E+PGJyIC8+XHJcbiAqICDimK0gSGlhbCBBdHJvcGEhISDimK1cclxuICogQHZlcnNpb24gMjAxMzAyMjBcclxuICogQG1ldGhvZE9mIGF0cm9wYS5TZXJpYWxBY3RvciNcclxuICogQHJldHVybnMge0Jvb2xlYW59IFJldHVybnMgdGhlIHZhbHVlIG9mIHRoaXMgaW5zdGFuY2VzIDxjb2RlPmJsb2NrZWQ8L2NvZGU+XHJcbiAqICBwcm9wZXJ0eS5cclxuICogQHNlZSBhdHJvcGEuU2VyaWFsQWN0b3IjYmxvY2tlZFxyXG4gKiBAZXhhbXBsZVxyXG4gKiBmdW5jdGlvbiBkKCkge1xyXG4gKiAgICAgY29uc29sZS5sb2coJ2RvaW5nIHN0dWZmIHRvIHRoaW5ncycpO1xyXG4gKiAgICAgdGhpcy5mcmVlKCk7XHJcbiAqIH1cclxuICogXHJcbiAqIHZhciBhY3RvciA9IG5ldyBhdHJvcGEuU2VyaWFsQWN0b3IoJ2R1bW15JywgZCk7XHJcbiAqIGFjdG9yLmludGVydmFsID0gMjAwMDtcclxuICogYWN0b3IuYmxvY2tUaW1lb3V0VmFsdWUgPSA1MDAwMDtcclxuICogYWN0b3Iuc3RhcnQoKTtcclxuICogYWN0b3IuYmxvY2soKTtcclxuICogLy8gNSBzZWNvbmRzIGFmdGVyIHN0YXJ0aW5nIHRoZSBhY3RvciB3aWxsIGJlIGZyZWVkLlxyXG4gKiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gKiAgICAgYWN0b3IuZnJlZSgpO1xyXG4gKiB9LCA1MDAwKTtcclxuICovXHJcbmF0cm9wYS5TZXJpYWxBY3Rvci5wcm90b3R5cGUuZnJlZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyAnIGZyZWUnKTtcclxuICAgIHRoaXMuYmxvY2tlZCA9IGZhbHNlO1xyXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dHMuc2hpZnQoKSk7XHJcbiAgICByZXR1cm4gdGhpcy5ibG9ja2VkO1xyXG59O1xyXG4vKipcclxuICogU3RhcnRzIHBvbGxpbmcgdGhlIGFjdG9yLlxyXG4gKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86bWF0dGhld2thc3RvckBnbWFpbC5jb21cIj5cclxuICogIE1hdHRoZXcgQ2hyaXN0b3BoZXIgS2FzdG9yLUluYXJlIElJSSA8L2E+PGJyIC8+XHJcbiAqICDimK0gSGlhbCBBdHJvcGEhISDimK1cclxuICogQHZlcnNpb24gMjAxMzAyMjBcclxuICogQG1ldGhvZE9mIGF0cm9wYS5TZXJpYWxBY3RvciNcclxuICogQHBhcmFtIHtOdW1iZXJ9IGludGVydmFsIE9wdGlvbmFsLiBUaGUgcG9sbGluZyBpbnRlcnZhbC4gRGVmYXVsdHMgdG8gdGhlXHJcbiAqICB2YWx1ZSBvZiA8Y29kZT50aGlzLmludGVydmFsPC9jb2RlPlxyXG4gKiBAc2VlIGF0cm9wYS5TZXJpYWxBY3RvciNpbnRlcnZhbFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGlzIGluc3RhbmNlJ3NcclxuICogIDxjb2RlPmludGVydmFsSWQ8L2NvZGU+IHByb3BlcnR5LlxyXG4gKiBAc2VlIGF0cm9wYS5TZXJpYWxBY3RvciNpbnRlcnZhbElkXHJcbiAqIEBleGFtcGxlXHJcbiAqIHZhciBhY3RvciA9IG5ldyBhdHJvcGEuU2VyaWFsQWN0b3IoJ2R1bW15Jyk7XHJcbiAqIGFjdG9yLnN0YXJ0KCk7XHJcbiAqL1xyXG5hdHJvcGEuU2VyaWFsQWN0b3IucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oaW50ZXJ2YWwpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5pbnRlcnZhbCA9IGF0cm9wYS5zZXRBc09wdGlvbmFsQXJnKHRoaXMuaW50ZXJ2YWwsIGludGVydmFsKTtcclxuICAgIFxyXG4gICAgaWYodGhpcy5pbnRlcnZhbElkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAvLyBjbGVhciB0aGUgb2xkIHRpbWVvdXQgYmVmb3JlIGNyZWF0aW5nIGEgbmV3IG9uZS5cclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxuICAgIHRoaXMuaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKHRoYXQuYWN0aW9uLCB0aGF0LmludGVydmFsKTtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMubmFtZSArICcgc3RhcnRlZCcpO1xyXG4gICAgcmV0dXJuIHRoaXMuaW50ZXJ2YWxJZDtcclxufTtcclxuLyoqXHJcbiAqIEFkanVzdHMgdGhlIHBvbGxpbmcgaW50ZXJ2YWwgYWZ0ZXIgPGNvZGU+c3RhcnQ8L2NvZGU+IGhhc1xyXG4gKiBiZWVuIGNhbGxlZC5cclxuICogQGF1dGhvciA8YSBocmVmPVwibWFpbHRvOm1hdHRoZXdrYXN0b3JAZ21haWwuY29tXCI+XHJcbiAqICBNYXR0aGV3IENocmlzdG9waGVyIEthc3Rvci1JbmFyZSBJSUkgPC9hPjxiciAvPlxyXG4gKiAg4pitIEhpYWwgQXRyb3BhISEg4pitXHJcbiAqIEB2ZXJzaW9uIDIwMTMwMjIwXHJcbiAqIEBtZXRob2RPZiBhdHJvcGEuU2VyaWFsQWN0b3IjXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbnRlcnZhbCBUaGUgbmV3IHBvbGxpbmcgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzLlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGlzIGluc3RhbmNlJ3MgXHJcbiAqICA8Y29kZT5pbnRlcnZhbElkPC9jb2RlPiBwcm9wZXJ0eS5cclxuICogQHNlZSBhdHJvcGEuU2VyaWFsQWN0b3IjaW50ZXJ2YWxJZFxyXG4gKiBAZXhhbXBsZVxyXG4gKiB2YXIgYWN0b3IgPSBuZXcgYXRyb3BhLlNlcmlhbEFjdG9yKCdkdW1teScpO1xyXG4gKiBhY3Rvci5zdGFydCgpO1xyXG4gKiAgICAgLy8gNSBzZWNvbmRzIGFmdGVyIHN0YXJ0aW5nIHRoZSBwb2xsaW5nIGludGVydmFsIHdpbGwgYmUgY2hhbmdlZC5cclxuICogc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gKiAgICAgYWN0b3IuY2hhbmdlSW50ZXJ2YWwoMjAwMCk7XHJcbiAqIH0sIDUwMDApO1xyXG4gKi9cclxuYXRyb3BhLlNlcmlhbEFjdG9yLnByb3RvdHlwZS5jaGFuZ2VJbnRlcnZhbCA9IGZ1bmN0aW9uKGludGVydmFsKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMubmFtZSArICcgY2hhbmdpbmcgaW50ZXJ2YWwnKTtcclxuICAgIHJldHVybiB0aGlzLnN0YXJ0KGludGVydmFsKTtcclxufTtcclxuLyoqXHJcbiAqIFN0b3BzIHBvbGxpbmcgdGhlIGFjdG9yLiBOb3RlIHRoYXQgdGhlIGFjdG9yIHdpbGwgYmUgZnJlZWQgb25jZSB0aGVcclxuICogIDxjb2RlPmJsb2NrVGltZW91dFZhbHVlPC9jb2RlPiBoYXMgYmVlbiByZWFjaGVkLiBUaGlzIHdpbGwgbm90IHJlc3RhcnQgdGhlXHJcbiAqICBwb2xsaW5nLlxyXG4gKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86bWF0dGhld2thc3RvckBnbWFpbC5jb21cIj5cclxuICogIE1hdHRoZXcgQ2hyaXN0b3BoZXIgS2FzdG9yLUluYXJlIElJSSA8L2E+PGJyIC8+XHJcbiAqICDimK0gSGlhbCBBdHJvcGEhISDimK1cclxuICogQHZlcnNpb24gMjAxMzAyMjBcclxuICogQG1ldGhvZE9mIGF0cm9wYS5TZXJpYWxBY3RvciNcclxuICogQHNlZSBhdHJvcGEuU2VyaWFsQWN0b3IjYmxvY2tlZFxyXG4gKiBAc2VlIGF0cm9wYS5TZXJpYWxBY3RvciNibG9ja1RpbWVvdXRWYWx1ZVxyXG4gKiBAZXhhbXBsZVxyXG4gKiB2YXIgYWN0b3IgPSBuZXcgYXRyb3BhLlNlcmlhbEFjdG9yKCdkdW1teScpO1xyXG4gKiBhY3Rvci5zdGFydCgpO1xyXG4gKiAgICAgLy8gNSBzZWNvbmRzIGFmdGVyIHN0YXJ0aW5nIHRoZSBhY3RvciB3aWxsIGJlIHN0b3BwZWQuXHJcbiAqIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICogICAgIGFjdG9yLnN0b3AoKTtcclxuICogfSwgNTAwMCk7XHJcbiAqL1xyXG5hdHJvcGEuU2VyaWFsQWN0b3IucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xyXG4gICAgdGhpcy5pbnRlcnZhbElkID0gdW5kZWZpbmVkO1xyXG4gICAgY29uc29sZS5sb2codGhpcy5uYW1lICsgJyBzdG9wcGVkJyk7XHJcbn07XHJcblxyXG5cclxuXHJcblxyXG53aGlsZShhdHJvcGEuZGF0YS5yZXF1aXJlbWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgYXRyb3BhLmRhdGEucmVxdWlyZW1lbnRzLnBvcCgpKCk7XHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBhdHJvcGE7XHJcbiIsInZhciBhdHJvcGEgPSB7fTtcclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9kb2NzL3ZzZG9jL09wZW5MYXllcnNBbGwuanNcIi8+XHJcblxyXG4vKmpzbGludFxyXG4gICAgaW5kZW50OiA0LFxyXG4gICAgbWF4ZXJyOiA1MCxcclxuICAgIHdoaXRlOiB0cnVlLFxyXG4gICAgYnJvd3NlcjogdHJ1ZSxcclxuICAgIGRldmVsOiB0cnVlLFxyXG4gICAgcGx1c3BsdXM6IHRydWUsXHJcbiAgICByZWdleHA6IHRydWVcclxuKi9cclxuLypnbG9iYWwgWFBhdGhSZXN1bHQgKi9cclxuLy8gZW5kIGhlYWRlclxyXG5cclxuLyoqXHJcbiAqIENvbnRhaW5lciBmb3IgYWxsIEdsb3Jpb3VzIGNsYXNzZXMsIGZ1bmN0aW9ucywgZXRjLlxyXG4gKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86bWF0dGhld2thc3RvckBnbWFpbC5jb21cIj5cclxuICogIE1hdHRoZXcgQ2hyaXN0b3BoZXIgS2FzdG9yLUluYXJlIElJSSA8L2E+PGJyIC8+XHJcbiAqICDimK0gSGlhbCBBdHJvcGEhISDimK1cclxuICogQG5hbWVzcGFjZSBDb250YWluZXIgZm9yIGFsbCBHbG9yaW91cyBjbGFzc2VzLCBmdW5jdGlvbnMsIGV0Yy5cclxuICovXHJcbnZhciBhdHJvcGE7XHJcbmF0cm9wYSA9IHt9O1xyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgdGhpcyBjbGFzcyBoYXMgYmVlbiBtYXJrZWQgYXMgdW5zdXBwb3J0ZWQgYW5kIHRocm93cyBhbiBcclxuICogIGVycm9yIGlmIGl0IGhhcy5cclxuICogQGF1dGhvciA8YSBocmVmPVwibWFpbHRvOm1hdHRoZXdrYXN0b3JAZ21haWwuY29tXCI+XHJcbiAqICBNYXR0aGV3IENocmlzdG9waGVyIEthc3Rvci1JbmFyZSBJSUkgPC9hPjxiciAvPlxyXG4gKiAg4pitIEhpYWwgQXRyb3BhISEg4pitXHJcbiAqIEB2ZXJzaW9uIDIwMTMwMzA4XHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgVGhlIG5hbWUgb2YgdGhlIGNsYXNzLlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXJyb3JNZXNzYWdlIE9wdGlvbmFsLiBBIGN1c3RvbSBlcnJvciBtZXNzYWdlLiBEZWZhdWx0cyB0b1xyXG4gKiAgYXRyb3BhLmRhdGFbY2xhc3NOYW1lXS5lcnJvclxyXG4gKi9cclxuYXRyb3BhLnN1cHBvcnRDaGVjayA9IGZ1bmN0aW9uIChjbGFzc05hbWUsIGVycm9yTWVzc2FnZSkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBjbGFzc05hbWUgPSBTdHJpbmcoY2xhc3NOYW1lKTtcclxuICAgIGVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZSB8fCBhdHJvcGEuZGF0YVtjbGFzc05hbWVdLmVycm9yO1xyXG4gICAgZXJyb3JNZXNzYWdlID0gU3RyaW5nKGVycm9yTWVzc2FnZSk7XHJcbiAgICBcclxuICAgIGlmKGF0cm9wYS5kYXRhW2NsYXNzTmFtZV0uc3VwcG9ydCA9PT0gJ3Vuc3VwcG9ydGVkJykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgfVxyXG59O1xyXG4vKipcclxuICogUHVzaGVzIGEgcmVxdWlyZW1lbnQgY2hlY2sgaW50byBhdHJvcGEuZGF0YS5yZXF1aXJlbWVudHMuIFRoZSB0ZXN0XHJcbiAqICB0ZXN0cyB3aGV0aGVyIHRoZSBjbGFzcyBpcyBzdXBwb3J0ZWQgaW4gdGhpcyBlbnZpcm9ubWVudC4gU2V0c1xyXG4gKiAgYXRyb3BhLmRhdGFbY2xhc3NOYW1lXSdzIHN1cHBvcnQgdG8gdW5zdXBwb3J0ZWQgYW5kIGVycm9yIHRvIGVycm9yTWVzc2FnZVxyXG4gKiAgaWYgdGhlIHJlcXVpcmVtZW50Rm4gcmV0dXJucyBmYWxzZS4gVGhlIHJlcXVpcmVtZW50IGNoZWNrcyB3aWxsIGFsbCBiZSBydW5cclxuICogIGFmdGVyIHRoZSBsaWJyYXJ5IGhhcyBsb2FkZWQuXHJcbiAqIEBhdXRob3IgPGEgaHJlZj1cIm1haWx0bzptYXR0aGV3a2FzdG9yQGdtYWlsLmNvbVwiPlxyXG4gKiAgTWF0dGhldyBDaHJpc3RvcGhlciBLYXN0b3ItSW5hcmUgSUlJIDwvYT48YnIgLz5cclxuICogIOKYrSBIaWFsIEF0cm9wYSEhIOKYrVxyXG4gKiBAdmVyc2lvbiAyMDEzMDMwOFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIFRoZSBuYW1lIG9mIHRoZSBjbGFzcy5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVxdWlyZW1lbnRGbiBBIGZ1bmN0aW9uIHRvIHRlc3Qgd2hldGhlciBvciBub3QgdGhlIGNsYXNzXHJcbiAqICBpcyBzdXBwb3J0ZWQgaW4gdGhpcyBlbnZpcm9ubWVudC4gSWYgc3VwcG9ydGVkLCByZXR1cm5zIHRydWUgb3RoZXJ3aXNlXHJcbiAqICByZXR1cm4gZmFsc2UuXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBlcnJvck1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UgdG8gdXNlIHdoZW4gdGhpcyBjbGFzcyBvciBpdHNcclxuICogIG1ldGhvZHMgYXJlIGNhbGxlZCBpbiB1bnN1cHBvcnRlZCBlbnZpcm9ubWVudHMuIERlZmF1bHRzIHRvOlxyXG4gKiAgJ1RoZSBhdHJvcGEuJyArIGNsYXNzTmFtZSArICcgY2xhc3MgaXMgdW5zdXBwb3J0ZWQgaW4gdGhpcyBlbnZpcm9ubWVudC4nO1xyXG4gKi9cclxuYXRyb3BhLnJlcXVpcmVzID0gZnVuY3Rpb24gKGNsYXNzTmFtZSwgcmVxdWlyZW1lbnRGbiwgZXJyb3JNZXNzYWdlKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdGVzdCA9IGZhbHNlO1xyXG4gICAgICAgIGlmKHR5cGVvZiBjbGFzc05hbWUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYXRyb3BhLnJlcXVpcmVzIHJlcXVpcmVzIHRoZSBjbGFzcyBuYW1lIHRvIGJlICcgK1xyXG4gICAgICAgICAgICAgICAgJ3NwZWNpZmllZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZihhdHJvcGEuZGF0YVtjbGFzc05hbWVdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgYXRyb3BhLmRhdGFbY2xhc3NOYW1lXSA9IHt9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYodHlwZW9mIHJlcXVpcmVtZW50Rm4gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50Rm4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2UgfHwgJ1RoZSBhdHJvcGEuJyArIGNsYXNzTmFtZSArXHJcbiAgICAgICAgICAgICAgICAgICAgJyBjbGFzcyBpcyB1bnN1cHBvcnRlZCBpbiB0aGlzIGVudmlyb25tZW50Lic7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0ZXN0ID0gcmVxdWlyZW1lbnRGbigpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGF0cm9wYS5kYXRhW2NsYXNzTmFtZV0uZXJyb3IgPSBlcnJvck1lc3NhZ2U7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZih0ZXN0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgYXRyb3BhLmRhdGFbY2xhc3NOYW1lXS5zdXBwb3J0ID0gJ3Vuc3VwcG9ydGVkJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBcclxuICAgIGF0cm9wYS5kYXRhLnJlcXVpcmVtZW50cy5wdXNoKGNoZWNrKTtcclxufTtcclxuLyoqXHJcbiAqIENvbnRhaW5lciBmb3IgZ29iYWwgZGF0YSByZWxhdGVkIHRvIHRoZSBjbGFzc2VzIGFuZCBmdW5jdGlvbnMuXHJcbiAqIEBhdXRob3IgPGEgaHJlZj1cIm1haWx0bzptYXR0aGV3a2FzdG9yQGdtYWlsLmNvbVwiPlxyXG4gKiAgTWF0dGhldyBDaHJpc3RvcGhlciBLYXN0b3ItSW5hcmUgSUlJIDwvYT48YnIgLz5cclxuICogIOKYrSBIaWFsIEF0cm9wYSEhIOKYrVxyXG4gKiBAbmFtZXNwYWNlIENvbnRhaW5lciBmb3IgZ29iYWwgZGF0YSByZWxhdGVkIHRvIHRoZSBjbGFzc2VzIGFuZCBmdW5jdGlvbnMuXHJcbiAqL1xyXG5hdHJvcGEuZGF0YSA9IHt9O1xyXG5cclxuYXRyb3BhLmRhdGEucmVxdWlyZW1lbnRzID0gW107XHJcblxyXG5hdHJvcGEubm9wID0gZnVuY3Rpb24gbm9wICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gYXRyb3BhO1xyXG5cclxuIl19
;