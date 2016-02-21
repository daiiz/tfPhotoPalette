
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

$(function () {
    var canvasEditor = new CanvasEditor($('#editor'), $('#crop'), $('#minfy'));
    canvasEditor.src = 'sample.jpg';
    bindEvents();
    openPlayWindow();
});
