# Chai-saga

A small and naive chai helper to make redux-saga testing easier.

## Installation

```shell
npm install chai-saga --save
```

## Supported effects

Chai-saga supports following subset of redux-saga effects

- put
- call

For more effects please either open a PR or submit an issue.

## API

*Assertion methods need to be chained, calling multiple should is not supported*

```
	obj.should
		.put(effectVal) // checks if generator returned value equal redux-saga/effects/put(effectVal)
		.call(fn, arg1, arg2) // checks if generator returned value equal redux-saga/effects/call(fn, arg1, arg2)
		.call() // checks if generator returned value equal redux-saga/effects/call without checkin parameters
		.return(value) // sets yield to returns value on next progression
		.throw(value) // makes generator throw value
```

## Example

Run with `make example`

```
const chai = require('chai');
const chaiSaga = require('../');
const sinon = require('sinon');

chai.use(chaiSaga);
chai.should();

const effects = require('redux-saga/effects');

const api = {
	call () {}
};

const runSaga = function * (action) {
	yield effects.put({type: 'LOADING'});

	try {
		const result = yield effects.call(api.call, action.id);

		if (result) {
			return yield effects.put({type: 'OK'});
		}

		yield effects.put({type: 'BAD'});

	} catch (err) {
		if (err.status === 401) {
				return yield effects.put({type: 'AUTH'});
		}
		yield effects.put({type: 'ERROR'});
	}
};

describe('saga-testing', function () {
	beforeEach(function() {
		sinon.stub(api, 'call');
	});
	afterEach(function() {
		api.call.restore();
	});

	it('puts LOADING when called', function () {
		const saga = runSaga();

		saga.should.put({type: 'LOADING'});
	});

	it('calls API with id and puts OK on success', function () {

		const action = {id: 1};
		const saga = runSaga(action);
		const stub = api.call;

		saga.next();

		saga.should
			.call(stub, action.id)
			.return('a value')
			.put({type: 'OK'});

	});

	it('puts BAD on empty api response', function () {
		const action = {id: 1};
		const saga = runSaga(action);
		const stub = api.call;

		saga.next();

		saga.should
			.call() // not asserting arguments of call
			.put({type: 'BAD'});

	});

	it('puts AUTH on api 401', function () {
		const action = {id: 1};
		const saga = runSaga(action);
		const stub = api.call;

		saga.next();

		saga.should
			.call()
			.throw({status: 401})
			.put({type: 'AUTH'});

	});

	it('puts ERROR on api error', function () {
		const action = {id: 1};
		const saga = runSaga(action);
		const stub = api.call;

		saga.next();

		saga.should
			.call()
			.throw()
			.put({type: 'ERROR'});

	});
});
```
