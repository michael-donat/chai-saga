var effects = require('redux-saga/effects');

module.exports = function(chai, utils) {

	function checkGenerator(asrt) {
		const obj = utils.flag(asrt, 'object');
		new chai.Assertion(obj.constructor.name).to.be.equal('GeneratorFunctionPrototype');
	}

	function checkYield(asrt, value) {
		const obj = utils.flag(asrt, 'object');
		const err = utils.flag(asrt, 'yieldThrow');
		const push = utils.flag(asrt, 'yieldPush');
		utils.flag(asrt, 'yieldThrow', undefined);
		utils.flag(asrt, 'yieldPush', undefined);

		let val;

		if (err) {
			val = obj.throw(err).value;
		} else {
			val = obj.next(push).value;
		}

		new chai.Assertion(val).to.be.deep.equal(value);
	}

	function assertYield (value) {
		checkYield(this, value);
	}

	function assertPutYield(value) {
		checkYield(this, effects.put(value));
	}

	function assertFinish() {
		checkGenerator(this)
		new chai.Assertion(this._obj.next().done).to.be.equal(true);
	}

	function assertCallYield() {

		checkGenerator(this)
		const val = this._obj.next().value;

		if (!arguments.length) {
			new chai.Assertion(val.CALL).to.exist;
			return this;
		}

		const call = effects.call.apply(effects, arguments);

		new chai.Assertion(val.CALL).to.exist;
		new chai.Assertion(call.CALL).to.exist;

		new chai.Assertion(val.CALL.args).to.deep.equal(call.CALL.args);
		new chai.Assertion(val.CALL.fn).to.equal(call.CALL.fn);

	}

	function setThrow(value) {
		utils.flag(this, 'yieldThrow', value || new Error());
	}

	function setReturn(value) {
		utils.flag(this, 'yieldPush', value);
	}

	chai.Assertion.addMethod('yield', assertYield);
	chai.Assertion.addMethod('put', assertPutYield);
	chai.Assertion.addMethod('call', assertCallYield);
	chai.Assertion.addMethod('return', setReturn);
	chai.Assertion.addMethod('throw', setThrow);
	chai.Assertion.addMethod('finish', assertFinish);

}

