const music = getMusic();
const homeassistant = global.get("homeassistant").homeAssistant.states;

// format message for generic media_player call service message
const callService = (service, entity = "media_player.owntone_server") => {
  return {
    payload: {
      domain: "media_player",
      service: service,
      data: {
        entity_id: entity,
      },
    },
  };
};

// appends data keys for playing media or text-to-speech services
const playMedia = (id, content, queue) => ({
  payload: {
    ...callService("play_media").payload,
    data: {
      ...callService("play_media").payload.data,
      media_content_id: id,
      media_content_type: content,
      enqueue: queue,
    },
  },
});

// provides info about the song that is currently playing
const nowPlaying = () => {
  const owntone_server =
    homeassistant["media_player.owntone_server"].attributes;
  const title = owntone_server.media_title,
    artist = owntone_server.media_artist,
    album = owntone_server.media_album_name;
  const nowPlayingPhrases = [
    `Now playing ${title} by ${artist} on the album ${album}.`,
    `You're listening to ${title} by ${artist} from ${album}.`,
    `This is ${artist} with ${title} from the album ${album}`,
  ];
  return playMedia(
    `media-source://tts/google_cloud?message=${
      nowPlayingPhrases[Math.floor(Math.random() * nowPlayingPhrases.length)]
    }`,
    "provider",
    "play"
  );
};

// increments or decrements the volume by 1% every X seconds
const setVolume = (
  target_volume,
  entity = "media_player.owntone_server",
  frequency = 1000
) => {
  const volume =
    homeassistant["media_player.owntone_server"].attributes.volume_level;
  let current_volume = volume;
  if (target_volume > current_volume) {
    increment = 0.01;
  } else if (target_volume < current_volume) {
    increment = -0.01;
  } else {
    return;
  }
  let loop = setInterval(function () {
    current_volume = Math.round((current_volume + increment) * 100) / 100;
    msg = callService("volume_set", entity);
    msg.payload.data.volume_level = current_volume;
    node.send(msg);
    if (current_volume === target_volume) {
      clearInterval(loop);
    }
  }, frequency);
};

// shuffles music and adds it to the end of the queue
const queueMedia = (array) => {
  shuffle(array);
  // queue the first music item
  node.send(playMedia(array[0].content_id, array[0].content_type, "add"));
  // wait 2 seconds and then queue the remaining items
  const queueRemainingMusic = () => {
    for (let i = 1; i < array.length; i++) {
      node.send(playMedia(array[i].content_id, array[i].content_type, "add"));
    }
  };
  setTimeout(queueRemainingMusic, 2000);
};

// searches for an album in an array and returns the content_id and content_type
const searchMedia = (search, queue = "play") => {
  const result = music.find((item) => item.title === search),
    id = result.content_id,
    type = result.content_type;
  return playMedia(id, type, queue);
};

// events triggered by msg.topic
const actions = {
  "input_button.clear_playlist": () => callService("clear_playlist"),
  "input_button.queue_playlist": () => {
    const playlistMap = {
      Morning: "morning",
      Dinner: "dinner jazz",
      Dance: "dance",
    };
    const selected_playlist = homeassistant["input_select.playlist"].state;
    const playlistFilter = playlistMap[selected_playlist];
    if (playlistFilter) {
      const arr = music.filter((item) => item.playlist === playlistFilter);
      return queueMedia(arr);
    } else {
      return;
    }
  },
  "input_number.volume": () => {
    const target_volume = Number(msg.payload) / 100;
    return setVolume(target_volume, "media_player.owntone");
  },
  "input_button.search_music": () => {
    const queueMap = {
      "Play now": "play",
      "Play next": "next",
      "Add to queue": "queue",
      "Play and clear": "replace",
    };
    const queue = queueMap[homeassistant["input_select.queue"].state],
      search_str = homeassistant["input_text.media_search"].state;
    return searchMedia(search_str, queue);
  },
};

const action = actions[msg.topic];
if (action) {
  return action();
} else {
  return;
}

function getMusic() {
  const spotifyAlbum = spotifyAlbumsArray(),
    owntoneAlbum = owntoneAlbumsArray(),
    spotifyOrderedPlaylist = spotifyOrderedPlaylistsArray();

  const albumsAndTracks = [...spotifyAlbum, ...owntoneAlbum].map(
    ([type, artist, title, id, playlist]) => {
      const music = {
        artist,
        title,
        playlist,
      };
      if (type === "owntone album") {
        music.content_type = "album";
        music.content_id = `owntone:Albums / ${title}:library:album:${id}:`;
      } else {
        music.content_type = `spotify://${type}`;
        music.content_id = `spotify:${type}:${id}`;
      }
      return music;
    }
  );

  const orderedPlaylist = spotifyOrderedPlaylist.map(([title, id]) => {
    const playlists = {
      title,
      content_id: `spotify:playlist:${id}`,
      content_type: "spotify://playlist",
    };
    return playlists;
  });
  return [...albumsAndTracks, ...orderedPlaylist];
}

// shuffle array
function shuffle(array) {
  let m = array.length,
    t,
    i;

  while (m) {
    i = Math.floor(Math.random() * m--);

    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function spotifyAlbumsArray() {
  const spotifyAlbums = [
    [
      "album",
      "Terrace Martin",
      "Dinner Party: Dessert",
      "6qqa1vvE1Q3qj2k8Gc3iEY",
      "dinner jazz",
    ],
  ];
  return spotifyAlbums;
}

function owntoneAlbumsArray() {
  return [
    [
      "owntone album",
      "Neil Young",
      "Harvest",
      "4535440331117785443",
      "morning",
    ],
  ];
}

function spotifyOrderedPlaylistsArray() {
  return [["Blonded", "6HEegfWHhUcytwQFAm1QbK"]];
}
