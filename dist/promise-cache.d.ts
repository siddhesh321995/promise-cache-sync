export declare class ExtendedWindow extends Window {
    FakePromise: typeof FakePromise;
    PromiseCache: typeof PromiseCache;
}
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
export declare class FakePromise<T> {
    /**
     * Private, cache instance.
     * @property promCache
     * @type {PromiseCache<T>}
     * @private
     * @member
     */
    private promCache;
    /**
     * Public constructor
     * @param {PromiseCache<T>} promCache Instance of cached promise.
     */
    constructor(promCache: PromiseCache<T>);
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
    then<TResult1 = T, TResult2 = never>(success?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, fail?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): FakePromise<TResult1 | TResult2>;
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
    catch<TResult = never>(callback?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): FakePromise<T | TResult>;
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
    finally(callback: () => any): FakePromise<T>;
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
export declare class PromiseCache<T> {
    /**
     * Flag which indicates if promise is completed or not.
     * @property isComplete
     * @type {boolean}
     * @public
     * @member
     */
    isComplete: boolean;
    /**
     * Holds resolved value.
     * @property value
     * @type {T}
     * @public
     * @member
     */
    value: T | undefined;
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
    error: any;
    /**
     * Resolver function of the promise.
     * @property resolver
     * @type {(value?: T | PromiseLike<T>) => void}
     * @public
     * @member
     */
    resolver: ((value?: T | PromiseLike<T> | undefined) => void) | undefined;
    /**
     * Rejector function of the promise.
     * @property rejector
     * @type {(reason?: any) => void}
     * @public
     * @member
     */
    rejector: ((reason?: any) => void) | undefined;
    /**
     * Public constructor
     * @param {string} path Path on which the promise will be cached.
     * @param {(resolve: (value?: T | PromiseLike<T> | undefined) => void,
     *  reject: (reason?: any) => void) => void} callback
     * Executor callback function, as same as promise executor.
     * @param {boolean} isSave Flag indicating if cacher should cache the response.
     */
    constructor(path: string, callback: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void, isSave?: boolean);
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
    static get<T>(path: string): FakePromise<T> | Promise<T> | undefined;
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
    static set<T>(path: string, callback: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void): Promise<T>;
}
