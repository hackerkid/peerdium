$( document ).ready(function() {
    var quill = new Quill('#editor', {
        theme: 'snow'
    });
    
    var client = new WebTorrent();

    $("#post-public-button").on("click", function () {
        var content = quill.getContents();
        var stringified_content = JSON.stringify(content);
        var file_name = Math.round(Math.random() * 10000);
        var f = new File([stringified_content], file_name.toString());
        var csrf_token = $("#csrf-holder").data("csrf");
        client.seed(f, function (torrent) {
            console.log('Client is seeding ' + torrent.magnetURI);
            var data = {
                magnet_link: torrent.magnetURI,
                csrfmiddlewaretoken: csrf_token,
            };
            $.post("publish", data, function(response) {
                console.log(response);
                history.pushState(null, '', response.secret_id);
            });
        })
    });

    const magnet_link = $("#magnet-holder").data("magnet-link");
    console.log(magnet_link);

    var json_file;
    if (magnet_link) {
        client.add(magnet_link, function (torrent) {
            console.log('Client is downloading:', torrent.infoHash)
            torrent.files.forEach(function (file) {
                var text;
                var reader = new FileReader();
                reader.addEventListener("loadend", function() {
                    var object = JSON.parse(reader.result);
                    quill.setContents(object);
                });
                
                file.getBlob(function(err, blob) {
                    reader.readAsText(blob);
                });
                
            })
        })
    }

});
