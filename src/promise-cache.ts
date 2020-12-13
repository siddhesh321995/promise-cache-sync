const _cache: { [id: string]: PromiseCache<any> } = {};

declare let module: any;

export declare class ExtendedWindow extends Window {
  FakePromise: typeof FakePromise;
  PromiseCache: typeof PromiseCache;
}

declare let window: ExtendedWindow;

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
export class FakePromise<T> {
  /**
   * Private, cache instance.
   * @property promCache
   * @type {PromiseCache<T>}
   * @private
   * @member
   */
  private promCache: PromiseCache<T>;

  /**
   * Public constructor
   * @param {PromiseCache<T>} promCache Instance of cached promise.
   */
  constructor(promCache: PromiseCache<T>) {
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
  then<TResult1 = T, TResult2 = never>(success?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    fail?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): FakePromise<TResult1 | TResult2> {
    let cbData: TResult1 | PromiseLike<TResult1>;
    if (this.promCache.isComplete && typeof this.promCache.value !== "undefined" && success) {
      cbData = success(this.promCache.value);
      const newProm = new PromiseCache('', (res, rej) => {
        res(cbData);
      }, false);
      const newInst = new FakePromise(newProm);
      newInst.promCache.value = cbData;
      newInst.promCache.isComplete = true;
      return newInst as FakePromise<TResult1 | TResult2>;
    }
    else {
      return this.promCache.promise.then(success, fail) as any;
    }
  }

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
  catch<TResult = never>(callback?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null):
    FakePromise<T | TResult> {
    let cbData: TResult | PromiseLike<TResult>;
    if (this.promCache.isComplete && typeof this.promCache.error !== "undefined" && callback) {
      cbData = callback(this.promCache.error);
      const newProm = new PromiseCache<T>('', (res, rej) => {
        rej(cbData);
      }, false);
      const newInst = new FakePromise<T>(newProm);
      newInst.promCache.error = cbData;
      newInst.promCache.isComplete = true;
      return newInst as FakePromise<T | TResult>;
    }
    else {
      return this.promCache.promise.catch(callback) as any;
    }
  }

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
  finally(callback: () => any): FakePromise<T> {
    if (this.promCache.isComplete) {
      callback();
    } else if (typeof (this.promCache.promise as any).finally === "function") {
      (this.promCache.promise as any).finally(callback);
    } else {
      this.promCache.promise.then(callback).catch(callback);
    }
    return this;
  }
}

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
export class PromiseCache<T> {
  /**
   * Flag which indicates if promise is completed or not.
   * @property isComplete
   * @type {boolean}
   * @public
   * @member
   */
  isComplete: boolean = false;
  /**
   * Holds resolved value.
   * @property value
   * @type {T}
   * @public
   * @member
   */
  value: T | undefined = void 0;
  /**
   * Holds promise instance.
   * @property promise
   * @type {Promise<T>}
   * @public
   * @member
   */
  promise: Promise<T>;
  /**
   * Holds error value.
   * @property error
   * @type {any}
   * @public
   * @member
   */
  error: any = void 0;
  /**
   * Resolver function of the promise.
   * @property resolver
   * @type {(value?: T | PromiseLike<T>) => void}
   * @public
   * @member
   */
  resolver: ((value?: T | PromiseLike<T> | undefined) => void) | undefined = void 0;
  /**
   * Rejector function of the promise.
   * @property rejector
   * @type {(reason?: any) => void}
   * @public
   * @member
   */
  rejector: ((reason?: any) => void) | undefined = void 0;

  /**
   * Public constructor
   * @param {string} path Path on which the promise will be cached.
   * @param {(resolve: (value?: T | PromiseLike<T> | undefined) => void,
   *  reject: (reason?: any) => void) => void} callback 
   * Executor callback function, as same as promise executor.
   * @param {boolean} isSave Flag indicating if cacher should cache the response.
   */
  constructor(path: string, callback: (resolve: (value?: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void) => void, isSave: boolean = true) {
    this.isComplete = false;
    this.promise = new Promise((res, rej) => {
      this.resolver = res;
      this.rejector = rej;
      callback(res, rej);
    });
    this.promise.then((val) => {
      this.isComplete = true;
      this.value = val;
    }).catch((err) => {
      this.isComplete = true;
      this.error = err;
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
  static get<T>(path: string): FakePromise<T> | Promise<T> | undefined {
    if (_cache[path]) {
      if (_cache[path].isComplete) {
        return new FakePromise<T>(_cache[path]);
      } else {
        return _cache[path].promise as Promise<T>;
      }
    }
  }

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
  static set<T>(path: string,
    callback: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void): Promise<T> {
    new PromiseCache(path, callback);
    return _cache[path].promise as Promise<T>;
  }
}

if (typeof module != "undefined") {
  module.exports = { FakePromise, PromiseCache };
}
if (typeof window != "undefined") {
  window.FakePromise = FakePromise;
  window.PromiseCache = PromiseCache;
}
