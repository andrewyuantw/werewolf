
import './style.css';

const playMenu = document.getElementById('play-menu');
const playButton = document.getElementById('play-button');
var usernameInput = document.getElementById('username-input').value;

console.log(usernameInput);

Promise.all([
    
]).then(() => {
    playButton.onclick = () => {
        console.log("hi erwre");
        var usernameInput = document.getElementById('username-input').value;
        document.getElementById("debug").innerHTML = usernameInput;
    };
})

