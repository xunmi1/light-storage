/*!
 * light-storage v0.2.2
 * (c) 2019-2020 xunmi
 * Released under the MIT License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.LightStorage = factory());
}(this, (function () { 'use strict';

  var version = "0.2.2";

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
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
  }

  function _classPrivateFieldGet(receiver, privateMap) {
    var descriptor = privateMap.get(receiver);

    if (!descriptor) {
      throw new TypeError("attempted to get private field on non-instance");
    }

    if (descriptor.get) {
      return descriptor.get.call(receiver);
    }

    return descriptor.value;
  }

  function _classPrivateFieldSet(receiver, privateMap, value) {
    var descriptor = privateMap.get(receiver);

    if (!descriptor) {
      throw new TypeError("attempted to set private field on non-instance");
    }

    if (descriptor.set) {
      descriptor.set.call(receiver, value);
    } else {
      if (!descriptor.writable) {
        throw new TypeError("attempted to set read only private field");
      }

      descriptor.value = value;
    }

    return value;
  }

  /**
   * LightStorage
   * 保证数据类型一致，缓解键名冲突, 具有存储有效期
   * @param {string} prefix - 自定义前缀
   * @author xunmi <xunmi1@outlook.com>
   */
  var LightStorage = /*#__PURE__*/function () {
    function LightStorage() {
      var _this = this;

      var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'light-storage';

      _classCallCheck(this, LightStorage);

      _localStorage.set(this, {
        writable: true,
        value: void 0
      });

      _keys.set(this, {
        writable: true,
        value: void 0
      });

      _prefix.set(this, {
        writable: true,
        value: void 0
      });

      _initKeys.set(this, {
        writable: true,
        value: function value() {
          _classPrivateFieldSet(_this, _keys, new Set());

          Object.keys(_classPrivateFieldGet(_this, _localStorage)).forEach(function (key) {
            // 或者使用正则从**首位**判断
            if (key.slice(0, _classPrivateFieldGet(_this, _prefix).length) === _classPrivateFieldGet(_this, _prefix)) {
              _classPrivateFieldGet(_this, _keys).add(key);
            }
          });
        }
      });

      _getFullData.set(this, {
        writable: true,
        value: function value(key) {
          key = _this.getFullKey(key);

          if (_classPrivateFieldGet(_this, _keys).has(key)) {
            var origin = _classPrivateFieldGet(_this, _localStorage).getItem(key);

            try {
              var value = JSON.parse(origin);
              return _typeof(value) === 'object' ? value : {
                value: value
              };
            } catch (_unused) {
              return {
                value: origin
              };
            }
          }
        }
      });

      try {
        _classPrivateFieldSet(this, _localStorage, (window || self).localStorage);
      } catch (_unused2) {
        throw new TypeError('Current environment does not support localStorage');
      }

      this.prefix = prefix;
    }

    _createClass(LightStorage, [{
      key: "getFullKey",

      /**
       * 获取实际键名
       * @param {string} key 查询键名
       * @return {string} 实际键名
       */
      value: function getFullKey(key) {
        if (key.slice(0, _classPrivateFieldGet(this, _prefix).length) === _classPrivateFieldGet(this, _prefix)) {
          return key;
        }

        return "".concat(_classPrivateFieldGet(this, _prefix), "-").concat(key);
      }
      /**
       * 添加数据
       * @param {string} key 键名，在内部会转换
       * @param {*} value 键值
       * @param {number} [timeLimit] 有效期
       * @param {boolean} [update=false] 是否更新创建时间
       */

    }, {
      key: "set",
      value: function set(key, value, timeLimit) {
        var update = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
        key = this.getFullKey(key);
        var data = {
          value: value,
          version: LightStorage.version
        };

        if (timeLimit) {
          if (typeof timeLimit !== 'number' || timeLimit < 0) {
            throw new TypeError('Please enter a valid time limit');
          }

          data.time = update ? Date.now() : this.getCreatedTime(key) || Date.now();
          data.timeLimit = timeLimit;
        }

        _classPrivateFieldGet(this, _localStorage).setItem(key, JSON.stringify(data));

        _classPrivateFieldGet(this, _keys).add(key);
      }
      /**
       * 访问数据
       * @param {string} key 键名
       * @param {*} [defaultValue] 默认值
       * @returns {*} 键值，若过期，则自动删除，返回默认值
       */

    }, {
      key: "get",
      value: function get(key, defaultValue) {
        var data = _classPrivateFieldGet(this, _getFullData).call(this, key);

        if (data && data.value !== undefined) {
          if (!data.time) return data.value;
          var valid = Date.now() - data.time < data.timeLimit;
          if (valid) return data.value;
          this.remove(key);
          return defaultValue;
        }

        return defaultValue;
      }
      /**
       * 获取创建时间
       * @param {string} key 键名
       * @returns {number|undefined} 创建时间
       */

    }, {
      key: "getCreatedTime",
      value: function getCreatedTime(key) {
        var data = _classPrivateFieldGet(this, _getFullData).call(this, key);

        if (data && data.time) {
          return data.time;
        }
      }
      /**
       * 判断是否含有该 key
       * @param {string} key - 数据键名
       * @return {boolean}
       */

    }, {
      key: "has",
      value: function has(key) {
        key = this.getFullKey(key);
        if (!_classPrivateFieldGet(this, _keys).has(key)) return false;
        var result = this.get(key);
        return result !== undefined;
      }
      /**
       * 移除指定数据
       * @param {string} key - 数据键名
       * @return {boolean}
       */

    }, {
      key: "remove",
      value: function remove(key) {
        key = this.getFullKey(key);

        if (_classPrivateFieldGet(this, _keys).has(key)) {
          _classPrivateFieldGet(this, _localStorage).removeItem(key);

          return _classPrivateFieldGet(this, _keys).delete(key);
        }

        return false;
      }
      /**
       * 清理全部数据
       */

    }, {
      key: "clear",
      value: function clear() {
        var _this2 = this;

        _classPrivateFieldGet(this, _keys).forEach(function (key) {
          return _this2.remove(key);
        });
      }
    }, {
      key: "prefix",
      get: function get() {
        return _classPrivateFieldGet(this, _prefix);
      },
      set: function set(value) {
        _classPrivateFieldSet(this, _prefix, value);

        _classPrivateFieldGet(this, _initKeys).call(this);
      }
      /**
       * TODO babel-eslint bug
       * @see https://github.com/babel/babel-eslint/issues/749
       */

    }]);

    return LightStorage;
  }();

  var _localStorage = new WeakMap();

  var _keys = new WeakMap();

  var _prefix = new WeakMap();

  var _initKeys = new WeakMap();

  var _getFullData = new WeakMap();

  _defineProperty(LightStorage, "version", void 0);

  LightStorage.version = version;

  return LightStorage;

})));
//# sourceMappingURL=light-storage.umd.js.map
