// place spotipy output in array
const spotify_music = [],
  owntone_music = [];

// define Music class
const Music = class {
  constructor(type, artist, title, content_id, playlist) {
    (this.type = type),
      (this.artist = artist),
      (this.title = title),
      (this.content_id = content_id),
      (this.playlist = playlist);
  }
  // return corresponding content strings based on type of music
  get contentType_string() {
    if (this.type === "owntone album") return "album";
    if (this.type === "album") return "spotify://album";
    if (this.type === "track") return "spotify://track";
  }
  get contentID_string() {
    if (this.type === "owntone album")
      return `owntone:Albums / ${this.title}:library:album:${this.content_id}:`;
    if (this.type === "album") return `spotify:album:${this.content_id}`;
    if (this.type === "track") return `spotify:track:${this.content_id}`;
  }
};

// create Music objects from array
const createMusicObject = () => {
  let arr = [];
  for (let music of [...spotify_music, ...owntone_music]) {
    arr.push(new Music(...music));
  }
  return arr;
};

const music_list = createMusicObject();

// fhuffle array in place
const shuffle = (array) => {
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
};

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

// append data keys for playing media or TTS
const playMedia = (id, content, queue) => {
  msg = callService("play_media");
  msg.payload.data = {
    ...msg.payload.data,
    media_content_id: id,
    media_content_type: content,
    enqueue: queue,
  };
  return msg;
};

// provide info about the song that is currently playing
const nowPlaying = () => {
  const title = owntone_server.media_title,
    artist = owntone_server.media_artist,
    album = owntone_server.media_album_name,
    playing_array = [
      `Now playing ${title} by ${artist} on the album ${album}.`,
      `You're listening to ${title} by ${artist} from ${album}.`,
      `This is ${artist} with ${title} from the album ${album}`,
    ];
  return playMedia(
    `media-source://tts/google_cloud?message=${
      playing_array[Math.floor(Math.random() * playing_array.length)]
    }`,
    "provider",
    "play"
  );
};

// increment or decrement volume by 1% every X seconds
const setVolume = (
  target_volume,
  entity = "media_player.owntone_server",
  frequency = 1000
) => {
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

// shuffle an array of music and add it to the end of the queue
const queueMedia = (array) => {
  shuffle(array);
  for (let i = 0; i < array.length; i++) {
    node.send(playMedia(array[i].content_id, array[i].content_type, "add"));
  }
};

// search for an album in an array and returns the content_id and content_type
const searchMedia = (search = search_str) => {
  id = music.find((x) => x.name === search).content_id;
  type = music.find((x) => x.name === search).content_type;
  return playMedia(id, type, "play");
};

// control owntone based on button presses
switch (msg.topic) {
  case "input_button.clear_playlist":
    return callService("clear_playlist");
  case "input_button.queue_playlist":
    switch (selected_playlist) {
      case "Morning":
        arr = music.filter((item) => item.playlist === "morning");
        return queueMedia(arr);
      case "Dinner":
        arr = music.filter((item) => item.playlist === "dinner");
        return queueMedia(arr);
      case "Dance":
        arr = music.filter((item) => item.playlist === "dance");
        return queueMedia(arr);
      default:
        break;
    }
  case "input_number.airplay_volume":
    target_volume = Number(msg.payload) / 100;
    return setVolume(target_volume, "media_player.owntone");
  default:
    break;
}
