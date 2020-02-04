// Hamburger menu

$('#toggle').click(function() {
  $(this).toggleClass('active');
  $('#overlay').toggleClass('open').show();
});

$('#overlay li').on('click', function(){
  $('#overlay').hide();
  $('#overlay').toggleClass('open');
  $('#toggle').removeClass("active");
});

//Fade in 
AOS.init({
  once: true
})


//Scroll to link

$(document).ready(function() {
  $('html, body').hide();

  if (window.location.hash) {
      setTimeout(function() {
          $('html, body').scrollTop(0).show();
          $('html, body').animate({
              scrollTop: $(window.location.hash).offset().top
              }, 800)
      }, 0);
  }
  else {
      $('html, body').show();
  }
});
