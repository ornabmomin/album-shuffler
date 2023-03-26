// Define media classes
const Owntone_Album = class {
  constructor(name, content_id) {
    (this.name = name), (this.content_id = content_id);
  }
  get contentID_string() {
    return `owntone:Albums / ${this.name}:library:album:${this.content_id}:`;
  }
  get contentType_string() {
    return "album";
  }
};

const Spotify_Album = class {
  constructor(name, content_id) {
    (this.name = name), (this.content_id = content_id);
  }
  get contentID_string() {
    return `spotify:album:${this.content_id}`;
  }
  get contentType_string() {
    return "spotify://album";
  }
};

const Spotify_Playlist = class {
  constructor(name, content_id) {
    (this.name = name), (this.content_id = content_id);
  }
  get contentID_string() {
    return `spotify:playlist:${this.content_id}`;
  }
  get contentType_string() {
    return "spotify://playlist";
  }
};

// Set music array
const music = [
  new Owntone_Album("Neil Young - Harvest", "4535440331117785443"),
  new Spotify_Album("The New Four Seasons", "6J7CIQ4ReSZa611kZjCRkb"),
  new Spotify_Album("Peter and the Wolf", "3QtuozLIqApRQP6K2OeMLz"),
  new Spotify_Album("Mozart & Contemporaries", "70RFSsaRzmyH4IlZv76VKA"),
  new Spotify_Album("Vol 1: Feminine", "1ld3DxwlntRQIplsQci5x2"),
  new Spotify_Album("Toumani Diabaté - Kôrôlén", "4jew4Tqjgd9RW17afU15Vi"),
  new Spotify_Album(
    "Sofia Gubaidulina - Dialog Ich und Du",
    "3OWebM6dry0YlYZaoDmbPt"
  ),
  new Spotify_Album("Recap - Count to Five", "1wT74vHNvzxItAPQCPDNxV"),
  new Spotify_Album("Spektral Quartet", "1mlGXW9NBkaGUoR6geA3Sk"),
  new Spotify_Album("Lithuanian Symphony Orchestra", "4Qam3SXejH3rYSHKuG1Fvm"),
  new Spotify_Album("Milosz Magin - Zal", "1G1FkYUZw9bWSuyXoonfry"),
];

// Shuffle the array in place
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

// Format call service message
const callService = (media, queue) => {
  return {
    payload: {
      data: {
        media_content_id: media.contentID_string,
        media_content_type: media.contentType_string,
        enqueue: queue,
      },
    },
  };
};

// Send each call service node sequentially
const queueMedia = (array) => {
  shuffle(array);
  for (let i = 0; i < array.length; i++) {
    node.send(callService(array[i], "add"));
  }
};

return queueMedia(music);
