<img src="static/images/peerdium_with_name.png">

[![Buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/hackerkid)

Peerdium is a peer to peer publishing platform. The posts are stored as torrents
in the browser. Only the people with link to the post can see the content of the post. Peerdium is built using [WebTorrent](https://github.com/webtorrent/webtorrent).


Peerdium was [featured](https://news.ycombinator.com/item?id=17060272) in the front page of Hacker News. There was a lot of interesting discussions in the comment section and you should defintely check it out.


## How it works?

When the publish button is clicked the browser encrypts the post using a random 15 digit key, creates a torrent and starts seeding the torrent.  Each post has a URL in the format `https://peerdium.com/#post_id`. The first 40 characters of the post_id is the magnet URI of the torrent and the rest 15 is the key used for encrypting the content of the torrent. When someone open a post for the first time the magnet URI encoded in the link is used for fetching the torrent from other seeders and the key is used for decrypting the torrent.

Click on the heart button If you like a post and want to to access it later. The post would be saved to your browser and you can see the content of the post even if no one else is seeding.

## How to contribute
Setting up peerdium development environment is quite easy. There is no backend involved. All you need to do is start a static file server that can serve the index.html and the static assets in /static folder.

Here is how to do this in Linux. Make sure that you have python3 and git installed.

```bash
git clone https://github.com/hackerkid/peerdium
cd peerdium
python3 -m http.server
```

You are all set. Now head over to [localhost:8000](http://localhost:8000) in browser and start experimenting.
