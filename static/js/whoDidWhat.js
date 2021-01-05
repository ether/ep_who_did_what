<script type="text/javascript">

toggleWhoDidWhatReport = function(){
  var hasRun = false;
  var module = $("#whoDidWhat");
  if (module.hasClass('popup-show')) {
    $('#whoDidWhat').removeClass('popup-show');
  } else {
    if(!hasRun){
      hasRun = true;
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
            var actionString = "removed some content("+edit.changeLength+" chars[" + edit.percent +"%])";
            var keyword = "red";
          }
          if(edit.opType === "+"){
            var actionString = "added some content("+edit.changeLength+" chars[" + edit.percent +"%])";
            var keyword = "green"
          }
          if(oldDate !== edit.date){
            var $date = $('<h2>').appendTo($sdiv);
            $date.text(edit.date);
          }
          var $item = $('<a class="whoDidWhatClickable">').appendTo($sdiv);
          $item.css("color", keyword);
          $item.css("display", "block");
          $item.text("#" + rev + " at " + edit.time + " " + edit.authorName + " " + actionString);
          // it makes sense to update the UI to the revision BEFORE the applied revision
          var newRev = parseInt(rev) -1;
          $item.attr("href", "#"+newRev);
          oldDate = edit.date;
        });
      });
    }
    $('#whoDidWhat').addClass('popup-show');
  }
  $('body').on('click', '.whoDidWhatClickable', function(){
    var rev = $(this).attr("href").replace("#", "");
    window.location.hash = `#${rev}`;
    location.reload(); // temp fix until I can fix interacting with timeslider..
  });
}

</script>
