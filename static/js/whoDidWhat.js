'use strict';

window.toggleWhoDidWhatReport = () => {
  let hasRun = false;
  const module = $('#whoDidWhat');
  if (module.hasClass('popup-show')) {
    $('#whoDidWhat').removeClass('popup-show');
  } else {
    if (!hasRun) {
      hasRun = true;
      const whoDidWhat = $('#whoDidWhatOutput').html('');
      $.getJSON('./export/whoDidWhat', (data) => {
        const $sdiv = $('<ul />', {class: 'scrollable'}).appendTo(whoDidWhat);
        $sdiv.parent().parent().parent().css('overflow', 'auto');
        $sdiv.parent().parent().parent().css('max-height', '100%');
        let oldDate;
        $.each(data, (rev, edit) => {
          let actionString;
          let keyword;
          if (edit.opType === '=') {
            actionString = 'changed some attributes';
            keyword = 'orange';
          }
          if (edit.opType === '-') {
            actionString = `removed some content(${edit.changeLength} chars[${edit.percent}%])`;
            keyword = 'red';
          }
          if (edit.opType === '+') {
            actionString = `added some content(${edit.changeLength} chars[${edit.percent}%])`;
            keyword = 'green';
          }
          if (oldDate !== edit.date) {
            const $date = $('<h2>').appendTo($sdiv);
            $date.text(edit.date);
          }
          const $item = $('<a class="whoDidWhatClickable">').appendTo($sdiv);
          $item.css('color', keyword);
          $item.css('display', 'block');
          $item.text(`#${rev} at ${edit.time} ${edit.authorName} ${actionString}`);
          // it makes sense to update the UI to the revision BEFORE the applied revision
          const newRev = parseInt(rev) - 1;
          $item.attr('href', `#${newRev}`);
          oldDate = edit.date;
        });
      });
    }
    $('#whoDidWhat').addClass('popup-show');
  }
  $('body').on('click', '.whoDidWhatClickable', function () {
    const rev = $(this).attr('href').replace('#', '');
    window.location.hash = `#${rev}`;
    location.reload(); // temp fix until I can fix interacting with timeslider..
  });
};
