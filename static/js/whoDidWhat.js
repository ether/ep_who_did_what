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
      $.getJSON("./export/whoDidWhat", function(data){
        $('#whoDidWhatOutput').text(data);
        console.log(data);
      });
    }
    $('#whoDidWhat').addClass('popup-show');
  }
}
</script>
