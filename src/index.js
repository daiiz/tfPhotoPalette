
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
            width : 300,
            height: 460
        }
    }, null);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // PlayWindowから受信する
    if (request.type === 'request-base64-img') {
        var base64code = $('.minfy')[0].toDataURL('image/jpeg');
        // PlayWindowに返答する
        chrome.runtime.sendMessage({
            type: "base64-img",
            body: base64code
        }, null);
    }
});

$(function () {
    var canvasEditor = new CanvasEditor($('#editor'), $('#crop'), $('#minfy'));
    canvasEditor.src = 'sample.jpg';
    bindEvents();
    openPlayWindow();
});
