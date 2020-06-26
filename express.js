var exportWhoDidWhat = require('./exportWhoDidWhat');

exports.expressCreateServer = function (hook_name, args, cb) {
  args.app.get('/p/:pad/:rev?/export/whoDidWhat', function(req, res, next) {
    var padID = req.params.pad;
    var revision = req.params.rev ? req.params.rev : null;

    exportWhoDidWhat.whoDidWhat(padID, revision, function(err, result) {
      res.contentType('text/json');
      res.send(result);
    });
  });
};
