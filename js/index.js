window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 320 || document.documentElement.scrollTop > 320) {
    document.getElementById("navbar").style.backgroundColor = "#fbf4f5";
    document.getElementById("navbar").style.boxShadow = "0 0 .5em rgba(0, 0, 0, .5)";

  } else {
    document.getElementById("navbar").style.backgroundColor = "rgba(0,0,0,0)";
    document.getElementById("navbar").style.boxShadow = "0 0 0 rgba(0, 0, 0, 0)";

  }
}
