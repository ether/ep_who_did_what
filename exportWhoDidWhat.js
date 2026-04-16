'use strict';

const async = require('ep_etherpad-lite/node_modules/async');
const Changeset = require('ep_etherpad-lite/static/js/Changeset');
const padManager = require('ep_etherpad-lite/node/db/PadManager');
const authorManager = require('ep_etherpad-lite/node/db/AuthorManager');

// Returns the volume of a changeset — i.e. how many characters were inserted
// plus how many were deleted. The previous implementation used the difference
// between oldLen and newLen, which incorrectly reported zero when a user
// REPLACED text (e.g. fixed a typo) and so excluded their contribution from
// the report whenever delete length matched insert length. See issue #89.
exports.changesetVolume = (changeset) => {
  const unpacked = Changeset.unpack(changeset);
  const iter = Changeset.opIterator(unpacked.ops);
  let volume = 0;
  while (iter.hasNext()) {
    const op = iter.next();
    if (op.opcode === '+' || op.opcode === '-') volume += op.chars;
  }
  return volume;
};

// Returns "-", "+" or "=" depending on the dominant op type.
exports.typeOfOp = (changeset) => {
  const unpacked = Changeset.unpack(changeset);
  const iter = Changeset.opIterator(unpacked.ops);
  let code;
  while (iter.hasNext()) {
    const o = iter.next();
    switch (o.opcode) {
      case '=':
        code = '=';
        break;
      case '-':
        code = '-';
        break;
      case '+':
        code = '+';
        break;
    }
  }
  return code;
};

exports.whoDidWhat = async (padId, revNum, cb) => {
  const exists = await padManager.doesPadExists(padId);
  if (!exists) {
    console.error('Pad does not exist');
    return cb('pad does not exist', null);
  }

  const pad = await padManager.getPad(padId);
  const head = pad.getHeadRevisionNumber();

  const revisions = [];
  for (let i = 0; i <= head; i++) revisions.push(i);

  const authors = await pad.getAllAuthors();
  const authorsObj = {};
  const items = {};
  // Edits smaller than this fraction of the document are excluded from the
  // report. Compared with `>=` (was previously `>`) so that small but real
  // edits at the threshold aren't dropped.
  const thresholdPercent = 1;

  for (const author of Object.keys(authors)) {
    let color = await authorManager.getAuthorColorId(authors[author]);
    const authorName = await authorManager.getAuthorName(authors[author]);
    authorsObj[authors[author]] = {};
    authorsObj[authors[author]].name = authorName;

    if (typeof color === 'string' && color.indexOf('#') !== -1) {
      authorsObj[authors[author]].color = color;
    } else {
      const palette = authorManager.getColorPalette();
      color = palette[color];
      authorsObj[authors[author]].color = color;
    }
  }

  async.forEachSeries(revisions, async (revNum) => {
    const revision = await pad.getRevision(revNum);

    if (!authorsObj[revision.meta.author]) return;
    let authorName = authorsObj[revision.meta.author].name;
    if (!authorName) authorName = 'Anonymous';

    const opType = exports.typeOfOp(revision.changeset);
    const unpacked = Changeset.unpack(revision.changeset);
    const changeLength = exports.changesetVolume(revision.changeset);

    // The first edit grows the pad from oldLen=0; use the post-edit length
    // for the percentage so we don't divide by zero.
    const denom = unpacked.oldLen || unpacked.newLen;
    const per = denom ? Math.round((100 / denom) * changeLength) : 0;

    if (per >= thresholdPercent) {
      const humanTime = new Date(revision.meta.timestamp).toLocaleTimeString();
      const humanDate = new Date(revision.meta.timestamp).toDateString();
      items[revNum] = {
        timestamp: revision.meta.timestamp,
        time: humanTime,
        date: humanDate,
        authorName,
        opType,
        changeLength,
        percent: per,
      };
    }
  }, () => {
    cb(null, items);
  });
};
