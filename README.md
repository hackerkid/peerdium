# Peerdium
<img src="static/images/peerdium2.png">

Peerdium is a peer to peer publishing platform. The posts are stored as torrents
in the browser. Only the people with link to the post can see the content of the
post.

## How it works?
When the publish button is clicked the browser encrypts the post using a random 15 digit key, creates a torrent and starts seeding the torrent.  Each post has a URL in the format https://peerdium.com/post_id. The first 40 characters of the post_id is the magnet URI of the torrent and the rest 15 is the key used for encrypting the content of the torrent. When someone open a post for the first time the magnet URI encoded in the link is used for fetching the torrent from other seeders and the key is used for decrypting the torrent.

Click on the heart button If you like a post and want to to access it later. The post would be saved to your browser and you can see the content of the post even if no one else is seeding.

## How to contribute
Setting up peerdium development environment is quite easy. There is no backend involved. All you need to do is start a static file server that can serve the index.html and the static assets in /static folder. Make sure that the server is configured to return `index.html` for all the requests to `localhost/<post_id>` where
`post_id` can be any 55(40 + 15) characters long string. Here is how to do this with an nginx server in Ubuntu/Debian/Elementary OS.

Install nginx

```
sudo apt-get update
sudo apt-get install nginx
```

Now clone the peerdium repository to `/var/www/` folder by doing these commands.You can clone this anywhere but if you don't have much experience with linux or command line just follow these steps.

```
cd /var/www/
git clone https://github.com/hackerkid/peerdium
```

Now open the `/etc/nginx/sites-available/default` file with your favorite text editor.

Find the line that says `root /var/www/html;` and change it to `root /var/www/peerdium;`
Great! You are almost done. Now find the line thats says `try_files $uri $uri/ =404;` and replace it with `try_files $uri $uri/ /index.html;`. There would be two lines in the file. You have to change the first occurance (And not for example.com site)

Now restart nginx server by running `sudo service nginx restart`

You are all set. Now head over to [localhost](http://localhost) in browser and start experimenting.
