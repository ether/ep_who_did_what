'use strict';

const assert = require('assert').strict;
const Changeset = require('ep_etherpad-lite/static/js/Changeset');
const exporter = require('../../../../exportWhoDidWhat');

// Build a changeset directly so we don't need a running pad/server.
const buildChangeset = (oldText, newText) => Changeset.makeSplice(
    oldText, 0, oldText.length, newText);

describe(__filename, function () {
  describe('changesetVolume()', function () {
    it('counts a pure insert', function () {
      const cs = buildChangeset('', 'hello world');
      assert.equal(exporter.changesetVolume(cs), 11);
    });

    it('counts a pure delete', function () {
      const cs = buildChangeset('hello world', '');
      assert.equal(exporter.changesetVolume(cs), 11);
    });

    // Regression for #89: same length REPLACE used to report volume 0
    // because the old impl was `Math.abs(oldLen - newLen)`, which lost
    // every contributor whose edits were corrections rather than appends.
    it('counts a same-length replace (regression for #89)', function () {
      const cs = buildChangeset('hello world', 'world hello');
      // 11 chars deleted + 11 inserted (the diff is a full swap).
      // Old impl returned 0; we just need this to be > 0.
      assert(exporter.changesetVolume(cs) > 0,
          'same-length replace must report non-zero volume');
    });

    it('counts a partial replace shorter than original', function () {
      const cs = buildChangeset('hello world', 'hi');
      // 11 deleted, 2 inserted = 13. Old impl reported abs(11-2)=9.
      assert.equal(exporter.changesetVolume(cs), 13);
    });
  });

  describe('typeOfOp()', function () {
    it('returns + for an insert', function () {
      assert.equal(exporter.typeOfOp(buildChangeset('', 'hello')), '+');
    });
    it('returns - for a delete', function () {
      assert.equal(exporter.typeOfOp(buildChangeset('hello', '')), '-');
    });
  });
});
