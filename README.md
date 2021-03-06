# Werewolf.io

### About

This is an online version of Werewolf, a party game similar to Mafia but with more complicated character roles. At the start of the game, players get randomly assigned a role, with werewolves choosing a victim to kill at night, while villagers discuss and try to vote the werewolves out during the day. There are other villagers, referred to as "gods", whose specialized powers that give the villagers a better chance at successfully finding all the werewolves. This current branch holds a multiplayer version for 9 players, with the player / character arrangement consisting of 3 wolves, 3 villagers, 1 seer, 1 witch, and 1 hunter. 

### Gameplay Screenshots

<img src="https://i.imgur.com/lgL9U0s.png" width=700px/>

<img src="https://i.imgur.com/Y7SIhHc.png" width=700px/>

<img src="https://i.imgur.com/xVA1FGY.png" width=700px/>

<img src="https://i.imgur.com/dMkE3We.png" width=700px/>

<img src="https://i.imgur.com/dMkE3We.png" width=700px/>

### How to play

Be sure to have node installed beforehand.

Once you have node installed, navigate to the base directory in which the repository is located. 

On one open terminal, run the following command.

> node src/server/server.js

This should start the website at http://localhost:3000/.

To get your friends in the same game, you can use a tool like *ngrok* to generate a public-facing link that tunnels to the application running locally.

To do so, run the following command.

> ngrok http 3000

If successful, you should see a XXXXX.ngrok.io link pointing to http://localhost:3000 under "Forwarding". Supply this link to your friends and they will be able to join the game.

### Future Plans

* Host the website online with a custom domain once adequate testing has been conducted
* Add game modes to support up to 12 players (currently only 9 people can play)
* Develop more playable character roles 
* Allow players to dynamically configure what roles they want to include in the game before starting
* Implement different game rooms so multiple games can take place simultaneously
