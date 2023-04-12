import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

client_id = "<YOUR CLIENT ID>"
client_secret = "<YOUR CLIENT SECRET>"

client_credentials_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)

sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

# Define playlist_uris and fetch_types as arrays
playlist_uris = ['2P9Ni3d3X6g7esyjt4bcxe','0cc8YMQWsSzODyTpdVB6mI']
fetch_types = ['albums', 'tracks']  # specify fetch type for each playlist URI

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

# Print item details with comma after each array
for item in all_items:
    print(item, end=(', '+'\n'))