var chai = require('chai'),
  sinonChai = require('sinon-chai');

global.expect = chai.expect;
global.sinon = require('sinon');
chai.use(sinonChai);

requireFromRoot = (function (root) {
  return function (resource) {
    return require(root + "/../" + resource);
  }
})(__dirname);
