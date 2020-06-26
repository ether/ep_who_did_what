<script type="text/javascript">

toggleWhoDidWhatReport = function(){
  var hasRun = false;
  var module = $("#whoDidWhat");
  if (module.hasClass('popup-show')) {
    $('#whoDidWhat').removeClass('popup-show');
  } else {
    if(!hasRun){
      hasRun = true;
      console.log("getting who did what report");
      var whoDidWhat = $('#whoDidWhatOutput').html("");
      $.getJSON("./export/whoDidWhat", function(data){
        var $sdiv = $('<ul />', { class: 'scrollable' }).appendTo(whoDidWhat);
        $sdiv.parent().parent().parent().css("overflow", "auto");
        $sdiv.parent().parent().parent().css("max-height", "100%");
        var oldDate;
        $.each(data, function(rev, edit){
          if(edit.opType === "="){
            var actionString = "changed some attributes"
            var keyword = "orange";
          }
          if(edit.opType === "-"){
            var actionString = "removed some content("+edit.changeLength+" chars[" + edit.percent +"%]";
            var keyword = "red";
          }
          if(edit.opType === "+"){
            var actionString = "added some content("+edit.changeLength+" chars[" + edit.percent +"%]";
            var keyword = "green"
          }
          if(oldDate !== edit.date){
            var $date = $('<h2>').appendTo($sdiv);
            $date.text(edit.date);
          }
          var $item = $('<a>').appendTo($sdiv);
          $item.css("color", keyword);
          $item.css("display", "block");
          $item.text("#" + rev + " at " + edit.time + " " + edit.authorName + " " + actionString);
          $item.attr("href", "#"+rev);
          oldDate = edit.date;
        });
      });
    }
    $('#whoDidWhat').addClass('popup-show');
  }
}

</script>
