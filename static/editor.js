const localstorage_available = typeof (Storage) !== "undefined";
var quill;
var client = new WebTorrent();

function get_info_hash_from_url() {
    return window.location.pathname.substring(1);
}

const info_hash = get_info_hash_from_url();
var magnet_link;
if (info_hash) {
    var template_magnet_link = "magnet:?xt=urn:btih:{{INFO_HASH}}&dn=inetd.c&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com";
    magnet_link = template_magnet_link.replace("{{INFO_HASH}}", info_hash)
}
var file_name = "hooli";

function is_published() {
    return window.location.pathname.length >= 32;
}

function get_local_content() {
    if (is_published()) {
        if (localstorage_available) {
            const secret_id = get_info_hash_from_url();
            return localStorage.getItem(secret_id);
        }
    }
}

function peer_info_updater(torrent) {
    var interval = setInterval(function () {
        console.log(torrent.numPeers);
        post_info.num_peers = torrent.numPeers;
    }, 4000)
};

function update_heart(class_name) {
    var heart_div_parent = document.getElementById("heart-parent");
    while (heart_div_parent.hasChildNodes()) {
        heart_div_parent.removeChild(heart_div_parent.lastChild);
    }
    var heart_div = document.createElement("div");
    heart_div.className = class_name;
    heart_div_parent.appendChild(heart_div);
}

function save_doc() {
    var content = quill.getContents();
    var stringified_content = JSON.stringify(content);
    if (localstorage_available) {
        localStorage.setItem(get_info_hash_from_url(), stringified_content);
    }
}

function remove_doc() {
    if (localstorage_available) {
        localStorage.removeItem(get_info_hash_from_url());
    }
}
var post_info = new Vue({
    el: "#post-info-section",
    data: {
        show: true,
        class_name: "",
        num_peers: 0,
    },
    methods: {
        post_document: function() {
            var content = quill.getContents();
            var stringified_content = JSON.stringify(content);
            var f = new File([stringified_content], file_name);
            client.seed(f, function (torrent) {
                console.log('Client is seeding ' + torrent.magnetURI);
                const secret_id = torrent.infoHash;
                history.pushState(null, '', secret_id);
                if (localstorage_available) {
                    localStorage.setItem(secret_id, stringified_content);
                }
                post_info.show = false;
                post_info.class_name = "fas fa-heart";
                update_heart(post_info.class_name);
                quill.enable(false);
                peer_info_updater(torrent);
            })
        },
        toogle_heart: function() {
            if (post_info.class_name === "fas fa-heart") {
                post_info.class_name = "far fa-heart";
                update_heart(post_info.class_name);
                remove_doc();
            } else {
                post_info.class_name = "fas fa-heart";
                update_heart(post_info.class_name);
                save_doc();
            }
        }
    },
});

var editor = new Vue({
    el: "#editor",
    mounted() {
        quill = new Quill('#editor-holder', {
            theme: 'bubble',
        });
    
        const local_content = get_local_content();
        if (local_content) {
            var object = JSON.parse(local_content);
            quill.setContents(object);
            post_info.class_name = "fas fa-heart";
            quill.enable(false);
            var f = new File([local_content], file_name);
            post_info.show = false;
            client.seed(f, function (torrent) {
                console.log('Client is seeding ' + torrent.magnetURI);
                peer_info_updater(torrent);
            });
        } else {
            var json_file;
            if (magnet_link) {
                post_info.class_name = "far fa-heart";
                post_info.show = false;
                client.add(magnet_link, function (torrent) {
                    console.log('Client is downloading:', torrent.infoHash)
                    torrent.files.forEach(function (file) {
                        var reader = new FileReader();
                        reader.addEventListener("loadend", function () {
                            var object = JSON.parse(reader.result);
                            quill.setContents(object);
                            quill.enable(false);
                        });
        
                        file.getBlob(function (err, blob) {
                            reader.readAsText(blob);
                        });

                        var interval = setInterval(function () {
                            console.log(torrent.numPeers);
                            post_info.num_peers = torrent.numPeers;
                        }, 4000)
                    })
                });
            }
        }
    },
});
