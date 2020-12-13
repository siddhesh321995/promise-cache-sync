# promise-cache-sync
> Reuse your promises with synchronous operations.

[![Build Status](https://travis-ci.com/siddhesh321995/promise-cache-sync.svg?branch=main)](https://travis-ci.com/siddhesh321995/promise-cache-sync)
![Node.js CI](https://github.com/siddhesh321995/promise-cache-sync/workflows/Node.js%20CI/badge.svg?branch=main)

## Overview
Promises in JavaScript
```
const prom = new Promise((res, rej) => {
    res(50);
});
console.log("1st Run");
console.log("Promise 1 Before");
prom.then(console.log);
console.log("Promise 1 After");
setTimeout(() => {
    console.log("2nd Run");
    console.log("Promise 2 Before");
    prom.then(console.log);
    console.log("Promise 2 After");
}, 50);
```
Output:
```
1st Run
Promise 1 Before
Promise 1 After
50
2nd Run
PromiseCache 2 Before
PromiseCache 2 After
50
```
New cached Promises in JavaScript
```
PromiseCache.set('mypath', (res, rej) => {
    res(500);
});
const prom = PromiseCache.get('mypath');
console.log("1st Run");
console.log("PromiseCache 1 Before");
prom.then(console.log);
console.log("PromiseCache 1 After");
setTimeout(() => {
    console.log("2nd Run");
    const prom2 = PromiseCache.get('mypath');
    console.log("PromiseCache 2 Before");
    prom2.then(console.log);
    console.log("PromiseCache 2 After");
}, 50);
```
Output:
```
1st Run
Promise 1 Before
Promise 1 After
50
2nd Run
PromiseCache 2 Before
50
PromiseCache 2 After
```
<!-- - The elements in a linked list are linked using pointers.
- Head is generally used as a pointer currently pointing to an element.
- Given example shows elements are connected with `next` pointers and each element has a data assosiated with it. -->
## Installation
Using npm
```
npm install promise-cache-sync --save
```
Or directly on your browser, simply download your file from the following:
- [promise-cache-sync.js](dist/promise-cache-sync.js) Development version
- [promise-cache-sync.min.js](dist/promise-cache-sync.min.js) Deployment version
```
<script type="application/javascript" src="promise-cache-sync.js"></script>
<script type="application/javascript" src="promise-cache-sync.min.js"></script>
```
## Usage
```
const { PromiseCache } = require("promise-cache-sync");
```
```
newProm = PromiseCache.set('mypath', (res, rej) => {
    res(500);
});
PromiseCache.get('mypath').then(shouldBe(500));
setTimeout(() => {
    PromiseCache.get('mypath').then(val => val * 2).then(val => val * 2).then(shouldBe(2000));
    PromiseCache.get('mypath').then(shouldBe(500));
}, 25);
```
## All Features:
- All Promise functions supported, like then(), catch(), finally().
- Sync promise value for future events.

<!-- ## Complete Documentation
Checkout [DOCUMENTATION.md](DOCUMENTATION.md) for complete documentation or View Documentation online at
[https://dsinjs.github.io/linked-list/](https://dsinjs.github.io/linked-list/).
> Note: May need to use polyfills for Array.entries(), to make Linked List work in older browsers like IE11. -->

## Help us expand
Let me know in issues/github page or on email which javascript functions to include in next release.
Or help us writing the complex test cases for the project.
Check all the [Contributing authors](CONTRIBUTING.md) to this library.