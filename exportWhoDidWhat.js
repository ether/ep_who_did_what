'use strict';

const async = require('ep_etherpad-lite/node_modules/async');
const Changeset = require('ep_etherpad-lite/static/js/Changeset');
const padManager = require('ep_etherpad-lite/node/db/PadManager');
const authorManager = require('ep_etherpad-lite/node/db/AuthorManager');

exports.whoDidWhat = async (padId, revNum, cb) => {
  const exists = await padManager.doesPadExists(padId);
  if (!exists) {
    console.error('Pad does not exist');
    cb('pad does not exist', null);
  }

  // get the pad
  const pad = await padManager.getPad(padId);
  const head = pad.getHeadRevisionNumber();

  // create an array with all revisions
  const revisions = [];

  for (let i = 0; i <= head; i++) {
    revisions.push(i);
  }

  const authors = await pad.getAllAuthors();
  const authorsObj = {};
  const items = {};
  const threshold = 1; // CAKE TODO

  for (const author of Object.keys(authors)) {
    let color = await authorManager.getAuthorColorId(authors[author]);
    const authorName = await authorManager.getAuthorName(authors[author]);
    authorsObj[authors[author]] = {};
    authorsObj[authors[author]].name = authorName;

    if (typeof color === 'string' && color.indexOf('#') !== -1) {
      authorsObj[authors[author]].color = color;
    } else {
      // color needs to come from index
      const palette = authorManager.getColorPalette();
      color = palette[color];
      authorsObj[authors[author]].color = color;
    }
  }

  // run trough all revisions
  async.forEachSeries(revisions, async (revNum, callback) => {
    const revision = await pad.getRevision(revNum);

    if (authorsObj[revision.meta.author]) {
      let authorName = authorsObj[revision.meta.author].name;
      if (!authorName) authorName = 'Anonymous';
      const opType = typeOfOp(revision.changeset);
      const unpacked = Changeset.unpack(revision.changeset);
      const changeLength = Math.abs(unpacked.oldLen - unpacked.newLen);
      const per = Math.round((100 / unpacked.oldLen) * changeLength);
      const humanTime = new Date(revision.meta.timestamp).toLocaleTimeString();
      const humanDate = new Date(revision.meta.timestamp).toDateString();

      // By default we ignore any percentage that is lower than 1%
      if (per > threshold) {
        // console.log(keyword, logString);
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
    }

    // setImmediate required else it will crash on large pads
    // See https://caolan.github.io/async/v3/ Common Pitfalls
    /*
    async.setImmediate(() => {
      callback();
    });
    */
  }, () => {
    cb(null, items);
  });
};

// returns "-", "+" or "=" depending on the type of edit
const typeOfOp = (changeset) => {
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
      {
        code = '+';
        break;
      }
    }
  }

  return code;
};
