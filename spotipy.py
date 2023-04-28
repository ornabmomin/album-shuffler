import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

client_id = "<YOUR CLIENT ID>"
client_secret = "<YOUR CLIENT SECRET>"

client_credentials_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)

sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

# Define playlist_uris and fetch_types as arrays
playlist_uris = ['2P9Ni3d3X6g7esyjt4bcxe','2AvYq77xcAvAbQZBzqEWxX','3PK8Co8awIrAwHxMq3cFfw']
fetch_types = ['albums', 'tracks', 'albums']  # specify fetch type for each playlist URI

# Function to fetch playlist items
def get_playlist_items(playlist_uri, fetch_type='albums'):
    item_list = []
    item_set = set()
    # Extract playlist ID from playlist URI
    if ':' in playlist_uri:
        playlist_id = playlist_uri.split(':')[-1]
    else:
        playlist_id = playlist_uri
    # Get playlist details
    playlist = sp.playlist(playlist_id)
    # Get total number of tracks in the playlist
    total_tracks = playlist['tracks']['total']
    # Set initial offset and limit
    offset = 0
    limit = 100
    # Loop through tracks in paginated results
    while offset < total_tracks:
        tracks = sp.playlist_tracks(playlist_id, offset=offset, limit=limit)
        for track in tracks['items']:
            if fetch_type == 'albums':
                item = track['track']['album']
                if item['name'] not in item_set:
                    item_set.add(item['name'])
                    item_list.append(['album', item['artists'][0]['name'], item['name'], item['uri'].split(':')[-1], playlist['name']])
            elif fetch_type == 'tracks':
                item = track['track']
                if item['name'] not in item_set:
                    item_set.add(item['name'])
                    item_list.append(['track', item['artists'][0]['name'], item['name'], item['uri'].split(':')[-1], playlist['name']])
        offset += limit
    return item_list

all_items = []
# Get items from each playlist in playlist_uris based on fetch_type argument
for playlist_uri, fetch_type in zip(playlist_uris, fetch_types):
    items = get_playlist_items(playlist_uri, fetch_type=fetch_type)
    all_items.extend(items)

# Convert all_items to JSON
json_data = json.dumps(all_items, indent=4)

# Read musiclist.js file
with open('musiclist.js', 'r') as f:
    file_content = f.read()

# Replace contents of spotifyAlbums const with JSON data
const_start = file_content.find('const spotifyAlbums = ') + len('const spotifyAlbums = ')
const_end = file_content.find('];', const_start)
if const_start != -1 and const_end != -1:
    file_content = file_content[:const_start] + json_data + file_content[const_end + 2:]
else:
    raise ValueError("spotifyAlbums const not found in musiclist.js")

# Write updated contents to musiclist.js file
with open('musiclist.js', 'w') as f:
    f.write(file_content)