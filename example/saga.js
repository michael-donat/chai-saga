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
