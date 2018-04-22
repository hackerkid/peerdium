const localstorage_available = typeof (Storage) !== "undefined";
var quill;
var client = new WebTorrent();
const magnet_link = $("#magnet-holder").data("magnet-link");
var file_name = "hooli";

function is_published() {
    return window.location.pathname.length >= 32;
}

function get_local_content() {
    if (is_published()) {
        if (localstorage_available) {
            const secret_id = window.location.pathname.substring(1);
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
            var csrf_token = $("#csrf-holder").data("csrf");
            client.seed(f, function (torrent) {
                console.log('Client is seeding ' + torrent.magnetURI);
                var data = {
                    magnet_link: torrent.magnetURI,
                    csrfmiddlewaretoken: csrf_token,
                };
                $.post("publish", data, function (response) {
                    history.pushState(null, '', response.secret_id);
                    if (localstorage_available) {
                        localStorage.setItem(response.secret_id, stringified_content);
                    }
                    post_info.show = false;
                    post_info.class_name = "fas fa-heart";
                    quill.enable(false);
                });
                peer_info_updater(torrent);
            })
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
