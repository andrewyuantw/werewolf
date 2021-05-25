
import { connect, play } from "./networking"
import './style.css';

const playMenu = document.getElementById('play-menu');
const playButton = document.getElementById('play-button');
const usernameInput = document.getElementById('username-input');


Promise.all([
    
]).then(() => {
    playButton.onclick = () => {
        var usernameInput = document.getElementById('username-input').value;
        play(usernameInput);
        console.log(usernameInput);
    };
    
})

export function changeDisplay(username){
    console.log("I'm clicked " + username);
    document.getElementById("debug").innerHTML = username;
}
