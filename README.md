# Album Shuffler
## What it do?
I wanted to randomly select an album or playlist and play that album/playlist in order, kind of like how those six CD changers would let you do. From what I could tell, this functionality is not available in Spotify. I also wanted to play my own local music in case I wanted to play music from a certain artist who pulled their music from Spotify...

## My setup
[music.js](music.js) is read by a function node in nodeRED, which sends the output to a Home Assistant call service function, which controls an OwnTone server through an integration.
