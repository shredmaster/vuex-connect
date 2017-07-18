/*!
 * vuex-connect v1.2.0
 * https://github.com/ktsn/vuex-connect
 *
 * Copyright (c) 2016 katashin
 * Released under the MIT license
 * https://github.com/ktsn/vuex-connect/blob/master/LICENSE
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var vuex = require('vuex');

function camelToKebab(str) {
  return str.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
}

function merge() {
  var target = {};

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  args.forEach(function (obj) {
    Object.keys(obj).forEach(function (key) {
      target[key] = obj[key];
    });
  });
  return target;
}

function pick(obj, keys) {
  var res = {};
  keys.forEach(function (key) {
    if (obj[key] !== void 0) {
      res[key] = obj[key];
    }
  });
  return res;
}

function omit(obj, keys) {
  var res = {};
  Object.keys(obj).forEach(function (key) {
    if (!includes(keys, key)) {
      res[key] = obj[key];
    }
  });
  return res;
}

function mapValues(obj, f) {
  var res = {};
  Object.keys(obj).forEach(function (key) {
    res[key] = f(obj[key], key);
  });
  return res;
}

function keys() {
  return Object.keys(merge.apply(undefined, arguments));
}

function includes(array, item) {
  return array.indexOf(item) > -1;
}

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var VERSION = Number(Vue.version.split('.')[0]);

var LIFECYCLE_KEYS = ['init', 'created', 'beforeCompile', 'compiled', 'ready', 'attached', 'detached', 'beforeDestroy', 'destroyed',

// 2.0
'beforeCreate', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'activated', 'deactivated'];

var createConnect = function createConnect(transform) {
  return function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _mapValues = mapValues(options, normalizeOptions),
        _mapValues$stateToPro = _mapValues.stateToProps,
        stateToProps = _mapValues$stateToPro === undefined ? {} : _mapValues$stateToPro,
        _mapValues$gettersToP = _mapValues.gettersToProps,
        gettersToProps = _mapValues$gettersToP === undefined ? {} : _mapValues$gettersToP,
        _mapValues$actionsToP = _mapValues.actionsToProps,
        actionsToProps = _mapValues$actionsToP === undefined ? {} : _mapValues$actionsToP,
        _mapValues$actionsToE = _mapValues.actionsToEvents,
        actionsToEvents = _mapValues$actionsToE === undefined ? {} : _mapValues$actionsToE,
        _mapValues$mutationsT = _mapValues.mutationsToProps,
        mutationsToProps = _mapValues$mutationsT === undefined ? {} : _mapValues$mutationsT,
        _mapValues$mutationsT2 = _mapValues.mutationsToEvents,
        mutationsToEvents = _mapValues$mutationsT2 === undefined ? {} : _mapValues$mutationsT2,
        _mapValues$methodsToP = _mapValues.methodsToProps,
        methodsToProps = _mapValues$methodsToP === undefined ? {} : _mapValues$methodsToP,
        _mapValues$methodsToE = _mapValues.methodsToEvents,
        methodsToEvents = _mapValues$methodsToE === undefined ? {} : _mapValues$methodsToE,
        _mapValues$lifecycle = _mapValues.lifecycle,
        lifecycle = _mapValues$lifecycle === undefined ? {} : _mapValues$lifecycle;

    return function (name, Component) {
      if (typeof name !== 'string') {
        Component = name;
        name = getOptions(Component).name || 'wrapped-anonymous-component';
      }

      var propKeys = keys(stateToProps, gettersToProps, actionsToProps, mutationsToProps, methodsToProps);

      var eventKeys = keys(actionsToEvents, mutationsToEvents, methodsToEvents);

      var containerProps = omit(getOptions(Component).props || {}, propKeys);

      var options = {
        name: 'connect-' + name,
        props: containerProps,
        components: defineProperty({}, name, Component),
        computed: merge(vuex.mapState(stateToProps), vuex.mapGetters(gettersToProps)),
        methods: merge(vuex.mapActions(merge(actionsToProps, actionsToEvents)), vuex.mapMutations(merge(mutationsToProps, mutationsToEvents)), mapValues(merge(methodsToProps, methodsToEvents), bindStore))
      };

      insertLifecycleMixin(options, lifecycle);
      insertRenderer(options, name, propKeys.concat(Object.keys(containerProps)), eventKeys);

      if (transform) {
        transform(options, lifecycle);
      }

      return Vue.extend(options);
    };
  };
};

function insertRenderer(options, name, propKeys, eventKeys) {
  if (VERSION >= 2) {
    options.render = function (h) {
      return h(name, {
        props: pick(this, propKeys),
        on: pick(this, eventKeys)
      }, this.$slots.default);
    };
  } else {
    var props = propKeys.map(bindProp);
    options.template = '<' + name + ' v-ref:component ' + props.join(' ') + '></' + name + '>';

    // register event listeners on the compiled hook
    // because vue cannot recognize camelCase name on the template
    options.compiled = function () {
      var _this = this;

      eventKeys.forEach(function (key) {
        _this.$refs.component.$on(key, _this[key]);
      });
    };
  }
}

function insertLifecycleMixin(options, lifecycle) {
  options.mixins = [mapValues(pick(lifecycle, LIFECYCLE_KEYS), function (f) {
    return function boundLifecycle() {
      f.call(this, this.$store);
    };
  })];
}

function getOptions(Component) {
  if (typeof Component === 'function') {
    return Component.options;
  }
  return Component;
}

function bindProp(key) {
  return ':' + camelToKebab(key) + '="' + key + '"';
}

function bindStore(fn) {
  return function boundFunctionWithStore() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return fn.call.apply(fn, [this, this.$store].concat(args));
  };
}

function normalizeOptions(options) {
  return Array.isArray(options) ? options.reduce(function (obj, value) {
    obj[value] = value;
    return obj;
  }, {}) : options;
}

var connect = createConnect();

exports.connect = connect;
exports.createConnect = createConnect;