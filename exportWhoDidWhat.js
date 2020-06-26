var async = require("ep_etherpad-lite/node_modules/async");
var Changeset = require("ep_etherpad-lite/static/js/Changeset");
var padManager = require("ep_etherpad-lite/node/db/PadManager");
var ERR = require("ep_etherpad-lite/node_modules/async-stacktrace");
var Security = require('ep_etherpad-lite/static/js/security');
var authorManager = require('ep_etherpad-lite/node/db/AuthorManager')
var Pad = require('ep_etherpad-lite/node/db/Pad')

exports.whoDidWhat = async function(padId, revNum, callback)
{
  let exists = await padManager.doesPadExists(padId);
  if (!exists) {
    console.error("Pad does not exist");
    process.exit(1);
  }

  // get the pad
  let pad = await padManager.getPad(padId);
  var head = pad.getHeadRevisionNumber();

  //create an array with all revisions
  var revisions = [];
  var beginningTime;
  var endTime;

  for(var i=0;i<=head;i++)
  {
    revisions.push(i);
  }

  let authors = await pad.getAllAuthors();
  var authorsObj = {};
  var items = {};
  var prevDate;
  var threshold = 10; // CAKE TODO

  for(var author in authors){
    let authr = await authorManager.getAuthor(authors[author]);
    let color = await authorManager.getAuthorColorId(authors[author]);
    let authorName = await authorManager.getAuthorName(authors[author]);
    authorsObj[authors[author]] = {};
    authorsObj[authors[author]].name = authorName;

    if(typeof color === "string" && color.indexOf("#") !== -1){
      authorsObj[authors[author]].color = color;
    }else{
      // color needs to come from index
      let palette = authorManager.getColorPalette();
      color = palette[color];
      authorsObj[authors[author]].color = color;
    }
  }

  //run trough all revisions
  async.forEachSeries(revisions, async function(revNum, callback){

    let revision = await pad.getRevision(revNum);

    if(authorsObj[revision.meta.author]){
      var authorColor = authorsObj[revision.meta.author].color.toUpperCase();
      var authorName = authorsObj[revision.meta.author].name;
      if(!authorName) authorName = "Anonymous"
      var opType = typeOfOp(revision.changeset);
      var unpacked = Changeset.unpack(revision.changeset);
      var changeLength = Math.abs(unpacked.oldLen - unpacked.newLen);
      var per = Math.round(( 100 / unpacked.oldLen) * changeLength);
      var humanTime = new Date(revision.meta.timestamp).toLocaleTimeString();
      var humanDate = new Date(revision.meta.timestamp).toDateString();

      if(opType === "="){
        var actionString = "changed some attributes"
        var keyword = "orange";
      }
      if(opType === "-"){
        var actionString = "removed some content("+changeLength+" chars[" + per +"%]";
        var keyword = "red";
      }
      if(opType === "+"){
        var actionString = "added some content("+changeLength+" chars[" + per +"%]";
        var keyword = "green"
      }

      if(prevDate === humanDate){
        var logString = "#" + revNum + 	" at " + humanTime + " " + authorName + " " + actionString;
      }else{
        if(per > threshold){
          // console.log(humanDate);
          var logString = "#" + revNum + 	" at " + humanTime + " " + authorName + " " + actionString;
        }
      }

      // By default we ignore any percentage that is lower than 1%
      if(per > threshold){
        // console.log(keyword, logString);
        prevDate = humanDate;
        items[revNum] = {
          "timestamp": revision.meta.timestamp,
          "time": humanTime,
          "date": humanDate,
          "authorName": authorName,
          "opType": opType,
          "changeLength": changeLength,
          "percent": per
        }
      }

    }

    // setImmediate required else it will crash on large pads
    // See https://caolan.github.io/async/v3/ Common Pitfalls
    async.setImmediate(function() {
      callback()
    });
  }, function(){
    callback(null, items);
  });
};

// returns "-", "+" or "=" depending on the type of edit
function typeOfOp(changeset){
  var unpacked = Changeset.unpack(changeset);
  var iter = Changeset.opIterator(unpacked.ops);
  while (iter.hasNext()) {
    var o = iter.next();
    var code;
    switch (o.opcode) {
    case '=':
      code = "="
      break;
    case '-':
      code = "-"
      break;
    case '+':
      {
        code = "+"
        break;
      }
    }
  }

  return code;
}


