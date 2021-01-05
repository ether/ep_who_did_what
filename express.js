const exportWhoDidWhat = require('./exportWhoDidWhat');

exports.expressCreateServer = function (hook_name, args, cb) {
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
