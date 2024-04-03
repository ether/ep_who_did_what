'use strict';

const exportWhoDidWhat = require('./exportWhoDidWhat');

exports.expressCreateServer = (hookName, args, cb) => {
  args.app.get('/p/:pad/:rev?/export/whoDidWhat', (req, res, next) => {
    const padID = req.params.pad;
    const revision = req.params.rev ? req.params.rev : null;

    exportWhoDidWhat.whoDidWhat(padID, revision, (err, result) => {
      res.contentType('text/json');
      res.send(result);
    });
  });
  cb();
};

exports.expressCreateServer = (hookName, args, cb) => {
  args.app.get('/whoDidWhat/:pad', (req, res, next) => {
    const padID = req.params.pad;

    exportWhoDidWhat.whoDidWhat(padID, null, (err, result) => {
      res.contentType('text/json');
      res.json(result);
    });
  });
  cb();
};


