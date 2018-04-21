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
        peer_info.num_peers = torrent.numPeers;
    }, 4000)
};

var heart_section = new Vue({
    el: '#heart-section',
    data: {
        class_name: "",
    },
});

var post_button = new Vue({
    el: "#post-public-button",
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
                        heart_section.class_name = "fas fa-heart fa-2x";
                    }
                });
                peer_info_updater(torrent);
            })
        }
    },
});

var peer_info = new Vue({
    el: "#peer-info",
    data: {
        num_peers: 0,
    }
})

var editor = new Vue({
    el: "#editor",
    mounted() {
        quill = new Quill('#editor', {
            theme: 'snow',
        });
    
        const local_content = get_local_content();
        if (local_content) {
            var object = JSON.parse(local_content);
            quill.setContents(object);
            heart_section.class_name = "fas fa-heart fa-2x";
            quill.enable(false);
            var f = new File([local_content], file_name);
            client.seed(f, function (torrent) {
                console.log('Client is seeding ' + torrent.magnetURI);
                peer_info_updater(torrent);
            });
        } else {
            var json_file;
            if (magnet_link) {
                client.add(magnet_link, function (torrent) {
                    console.log('Client is downloading:', torrent.infoHash)
                    torrent.files.forEach(function (file) {
                        var reader = new FileReader();
                        reader.addEventListener("loadend", function () {
                            var object = JSON.parse(reader.result);
                            quill.setContents(object);
                            heart_section.class_name = "far fa-heart fa-2x";
                        });
        
                        file.getBlob(function (err, blob) {
                            reader.readAsText(blob);
                        });

                        var interval = setInterval(function () {
                            console.log(torrent.numPeers);
                            peer_info.num_peers = torrent.numPeers;
                        }, 4000)
                    })
                });
            }
        }
    },
});
