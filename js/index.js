var nav = document.getElementById('navbar'); // Identify target
window.addEventListener('scroll', function(event) { // To listen for event
    event.preventDefault();

    if (window.scrollY <= 50) { // Just an example
        nav.style.backgroundColor = '#000'; // or default color
    } else {
        nav.style.backgroundColor = 'transparent';
    }
});

console.dir(nav);