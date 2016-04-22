
var bindEvents = () => {
    // 学習結果を試すための画面を開く
    $('#btn-open-play-window').on('click', e => {
        openPlayWindow();
    });
}

/* Open play window */
var openPlayWindow = () => {
    chrome.app.window.create('play.index.html', {
        singleton: true,
        id: 'pp-play-window',
        outerBounds: {
            left: 300,
            top : 20,
            width : 350,
            height: 300
        }
    }, null);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // PlayWindowから受信する
    if (request.type === 'request-base64-img') {
        // 要求された種類のcanvas画像をbase64エンコードして返却する
        var imgSize = request.options.image_size || 'mini';
        var photo_type = '';
        var base64code = '';
        // オリジナル画像
        if (imgSize === 'org') {
            base64code = $('.org')[0].toDataURL('image/jpeg');
            photo_type = 'original';
        }
        // トリミングした画像
        else if (imgSize === 'crop') {
            base64code = $('.crop')[0].toDataURL('image/jpeg');
            photo_type = 'cropped';
        }
        // トリミングしたものを縮小した画像
        else {
            base64code = $('.minfy')[0].toDataURL('image/jpeg');
            photo_type = 'reduced';
        }
        // PlayWindowに返答する
        chrome.runtime.sendMessage({
            type: "base64-img",
            body: base64code,
            photo_type: photo_type
        }, null);
    }
});

$(function () {
    var canvasEditor = new CanvasEditor($('#editor'), $('#crop'), $('#minfy'));
    canvasEditor.src = 'sample.jpg';
    bindEvents();
});
