// Tests
const should = require('should');
const assert = require('assert');
const { PromiseCache, FakePromise } = require("./dist/promise-cache");

let newProm;

function shouldBe(value) {
  return (newValue) => {
    should.equal(newValue, value);
    return newValue;
  };
}

describe('PromiseCache', () => {
  describe('class PromiseCache', () => {
    it('Constructor', (done) => {
      const cache = new PromiseCache("", (res, rej) => {
        res(50);
      }, false);
      cache.isComplete.should.equal(false);
      shouldBe(cache.value)(void 0);
      done();
    });
    it('set', (done) => {
      newProm = PromiseCache.set('mypath', (res, rej) => {
        res(500);
      });
      done();
    });
    it('get, then', (done) => {
      PromiseCache.get('mypath').then(shouldBe(500));
      setTimeout(() => {
        PromiseCache.get('mypath').then(val => val * 2).then(val => val * 2).then(shouldBe(2000));
        PromiseCache.get('mypath').then(shouldBe(500));
        done();
      }, 25);
    });
    it('catch', (done) => {
      newProm = PromiseCache.set('mypath', (res, rej) => {
        rej("My Error");
      });
      newProm.catch((err) => {
        //handleError
        err.should.equal("My Error");
        done();
      });
    });
  });
  describe('class FakePromise', () => {
    it('Constructor', (done) => {
      const cache = new PromiseCache("", (res, rej) => {
        res(50);
      }, false);
      const inst = new FakePromise(cache);
      inst.then(shouldBe(50)).then(done.bind(null, void 0));
    });
    it('then', (done) => {
      const cache = new PromiseCache("", (res, rej) => {
        res(50);
      }, false);
      const inst = new FakePromise(cache);
      inst.then(shouldBe(50)).then(done.bind(null, void 0));
    });
    it('catch', (done) => {
      const cache = new PromiseCache("", (res, rej) => {
        rej("My Error 2");
      }, false);
      const inst = new FakePromise(cache);
      inst.catch((err) => {
        err.should.equal("My Error 2");
        done();
      });
    });
    it('then, catch', (done) => {
      const cache = new PromiseCache("", (res, rej) => {
        rej("My Error 2");
      }, false);
      const inst = new FakePromise(cache);
      inst.then(num => num * 2).then(shouldBe(100)).catch((err) => {
        err.should.equal("My Error 2");
        done();
      });
    });
    it('then, then, catch', (done) => {
      const cache = new PromiseCache("", (res, rej) => {
        res(50);
      }, false);
      const inst = new FakePromise(cache);
      inst.then(num => num * 2)
        .then((val) => {
          shouldBe(val)(100);
          done();
        }).catch((err) => {
          err.should.equal("My Error 2");
        });
    });
  });
});