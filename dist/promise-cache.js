"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseCache = exports.FakePromise = void 0;
var _cache = {};
/**
 * Fake Promise class, a promise like class to support caching functionality.
 * @class FakePromise
 * @public
 * @example
 * const cache = new PromiseCache("mypath", (res, rej) => {
 *   res(50);
 * });
 * const inst = new FakePromise(cache);
 * inst.then(shouldBe(50)).then(done.bind(null, void 0));
 */
var FakePromise = /** @class */ (function () {
    /**
     * Public constructor
     * @param {PromiseCache<T>} promCache Instance of cached promise.
     */
    function FakePromise(promCache) {
        this.promCache = promCache;
    }
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param {(value: T) => TResult1 | PromiseLike<TResult1>} success
     * Optional, The callback to execute when the Promise is resolved.
     * @param {(reason: any) => TResult2 | PromiseLike<TResult2>} fail
     * Optional, The callback to execute when the Promise is rejected.
     * @method then
     * @member
     * @public
     * @returns {FakePromise<TResult1 | TResult2>} A new Fake Promise for the completion of which
     * ever callback is executed.
     * @example
     * const cache = new PromiseCache("", (res, rej) => {
     *    res(50);
     * }, false);
     * const inst = new FakePromise(cache);
     * inst.then(console.log); // => 50
     */
    FakePromise.prototype.then = function (success, fail) {
        var cbData;
        if (this.promCache.isComplete && typeof this.promCache.value !== "undefined" && success) {
            cbData = success(this.promCache.value);
            var newProm = new PromiseCache('', function (res, rej) {
                res(cbData);
            }, false);
            var newInst = new FakePromise(newProm);
            newInst.promCache.value = cbData;
            newInst.promCache.isComplete = true;
            return newInst;
        }
        else {
            return this.promCache.promise.then(success, fail);
        }
    };
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param {(reason: any) => TResult | PromiseLike<TResult>} callback
     * Optional, The callback to execute when the Promise is rejected.
     * @method catch
     * @member
     * @public
     * @returns {FakePromise<T | TResult>} A new Fake Promise for the completion of the callback.
     * @example
     * const cache = new PromiseCache("", (res, rej) => {
     *   rej("My Error 2");
     * }, false);
     * const inst = new FakePromise(cache);
     * inst.catch((err) => {
     *   console.warn(err);
     * });
     */
    FakePromise.prototype.catch = function (callback) {
        var cbData;
        if (this.promCache.isComplete && typeof this.promCache.error !== "undefined" && callback) {
            cbData = callback(this.promCache.error);
            var newProm = new PromiseCache('', function (res, rej) {
                rej(cbData);
            }, false);
            var newInst = new FakePromise(newProm);
            newInst.promCache.error = cbData;
            newInst.promCache.isComplete = true;
            return newInst;
        }
        else {
            return this.promCache.promise.catch(callback);
        }
    };
    /**
     * Attaches a callback for which will be called once all the main operations are completed.
     * @param {(reason: any) => TResult | PromiseLike<TResult>} callback
     * Optional, The callback to execute when the Promise is rejected.
     * @method finally
     * @member
     * @public
     * @returns {FakePromise<T>} A Fake Promise for the completion of the callback.
     * @example
     * const cache = new PromiseCache("", (res, rej) => {
     *   rej("My Error 2");
     * }, false);
     * const inst = new FakePromise(cache);
     * inst.finally(() => {
     *   // do cleanup..
     * });
     */
    FakePromise.prototype.finally = function (callback) {
        if (this.promCache.isComplete) {
            callback();
        }
        else if (typeof this.promCache.promise.finally === "function") {
            this.promCache.promise.finally(callback);
        }
        else {
            this.promCache.promise.then(callback).catch(callback);
        }
        return this;
    };
    return FakePromise;
}());
exports.FakePromise = FakePromise;
/**
 * Promise Cache class, caches a given promise to a given path.
 * @class PromiseCache
 * @public
 * @example
 * const cache = new PromiseCache("mypath", (res, rej) => {
 *   res(50);
 * });
 * cache.then(console.log); // => 50
 */
var PromiseCache = /** @class */ (function () {
    /**
     * Public constructor
     * @param {string} path Path on which the promise will be cached.
     * @param {(resolve: (value?: T | PromiseLike<T> | undefined) => void,
     *  reject: (reason?: any) => void) => void} callback
     * Executor callback function, as same as promise executor.
     * @param {boolean} isSave Flag indicating if cacher should cache the response.
     */
    function PromiseCache(path, callback, isSave) {
        var _this = this;
        if (isSave === void 0) { isSave = true; }
        /**
         * Flag which indicates if promise is completed or not.
         * @property isComplete
         * @type {boolean}
         * @public
         * @member
         */
        this.isComplete = false;
        /**
         * Holds resolved value.
         * @property value
         * @type {T}
         * @public
         * @member
         */
        this.value = void 0;
        /**
         * Holds error value.
         * @property error
         * @type {any}
         * @public
         * @member
         */
        this.error = void 0;
        /**
         * Resolver function of the promise.
         * @property resolver
         * @type {(value?: T | PromiseLike<T>) => void}
         * @public
         * @member
         */
        this.resolver = void 0;
        /**
         * Rejector function of the promise.
         * @property rejector
         * @type {(reason?: any) => void}
         * @public
         * @member
         */
        this.rejector = void 0;
        this.isComplete = false;
        this.promise = new Promise(function (res, rej) {
            _this.resolver = res;
            _this.rejector = rej;
            callback(res, rej);
        });
        this.promise.then(function (val) {
            _this.isComplete = true;
            _this.value = val;
        }).catch(function (err) {
            _this.isComplete = true;
            _this.error = err;
        });
        if (isSave) {
            _cache[path] = this;
        }
    }
    /**
     * Gets the cached promise, if not cached then returns undefined.
     * @param {string} path
     * Path to cacher to look for.
     * @method get
     * @static
     * @public
     * @returns {FakePromise<T>} A Fake Promise or Promise.
     * @example
     * PromiseCache.get('mypath').then(console.log);
     */
    PromiseCache.get = function (path) {
        if (_cache[path]) {
            if (_cache[path].isComplete) {
                return new FakePromise(_cache[path]);
            }
            else {
                return _cache[path].promise;
            }
        }
    };
    /**
     * Sets the cached promise.
     * @param {string} path
     * Path to cacher to look for.
     * @param {(resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void} callback
     * Executor callback function, as same as promise executor.
     * @method set
     * @static
     * @public
     * @returns {Promise<T>} A Promise instance.
     * @example
     * newProm = PromiseCache.set('mypath', (res, rej) => {
     *   res(500);
     * });
     */
    PromiseCache.set = function (path, callback) {
        new PromiseCache(path, callback);
        return _cache[path].promise;
    };
    return PromiseCache;
}());
exports.PromiseCache = PromiseCache;
if (typeof module != "undefined") {
    module.exports = { FakePromise: FakePromise, PromiseCache: PromiseCache };
}
if (typeof window != "undefined") {
    window.FakePromise = FakePromise;
    window.PromiseCache = PromiseCache;
}
