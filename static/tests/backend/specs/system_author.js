'use strict';

const assert = require('assert').strict;
const common = require('ep_etherpad-lite/tests/backend/common');
const padManager = require('ep_etherpad-lite/node/db/PadManager');
const randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;
const exporter = require('../../../../exportWhoDidWhat');

const SYSTEM_AUTHOR_ID = 'a.etherpad-system';

const whoDidWhat = async (padId) => await new Promise((resolve, reject) => {
  exporter.whoDidWhat(padId, null, (err, items) => err ? reject(err) : resolve(items));
});

describe(__filename, function () {
  before(async function () {
    await common.init();
  });

  it('labels revisions nobody authored as the system, not as a person',
      async function () {
        // A pad created with text but no authorId attributes the revision to
        // `a.etherpad-system`, which has no author record — the same shape as
        // default pad content and API-written pads (ether/etherpad#8044).
        const padId = `wdw-${randomString(10)}`;
        const pad = await padManager.getPad(padId, 'some content that a machine wrote\n');
        try {
          assert.equal(await pad.getRevisionAuthor(0), SYSTEM_AUTHOR_ID);

          const items = await whoDidWhat(padId);
          const names = Object.values(items).map((i) => i.authorName);
          assert.ok(names.length > 0, 'the report should not be empty');
          // "Anonymous" is what a real user with no display name gets; machine
          // writes must not be indistinguishable from them.
          assert.deepEqual(names.filter((n) => n === 'Anonymous'), []);
          assert.ok(names.includes('Etherpad'), `got ${JSON.stringify(names)}`);
        } finally {
          await pad.remove();
        }
      });
});
