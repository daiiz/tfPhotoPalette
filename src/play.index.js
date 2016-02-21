// 結果表示パネルのサイズをウィンドウの横幅に合わせる
var resizeResultPanel = () => {
    var $panel = $('#res-panel');
    var w = window.innerWidth;
    var h = window.innerHeight;
    $panel.css({
        width: w - 12,
        height: h - 122,
        left: 6
    });
}

var bindEvents = () => {
    // ウィンドウのサイズが変更されたとき
    window.addEventListener('resize', e => {
        resizeResultPanel();
    }, false);

    // 分類実行ボタンがクリックされたとき
    $('#btn-classify').on('click', e => {
        // backgroundに対して，minifyされた画像のbase64コードを要求する
        chrome.runtime.sendMessage({
            type: "request-base64-img"
        }, null);
    });
}

// 画面UIの初期化
var initUi = () => {
    resizeResultPanel();
    bindEvents();
    showDetailJSON({});
}

// 得られた分類の確率詳細を表示
var showDetailJSON = (json) => {
    $('#res-panel').JSONView(json);
}

// 分類実行
var classify = (base64jpg) => {
    var appUrl = 'http://localhost:6000/';
    var theme = $('#input-theme')[0].value || '';
    if (theme !== '') {
        $.ajax({
            url: appUrl,
            data: {
                jpg: base64jpg,
                theme: theme
            },
            type: "POST",
            success: function (response) {
                console.log(response);
            },
            error: function (response) {
                console.info(response);
            }
        });
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // MainWindowから受信する
    if (request.type === 'base64-img') {
        var base64code = request.body;
        $('#cropped-img')[0].src = base64code;
        classify(base64code);
    }
});

$(function () {
    initUi();
});
