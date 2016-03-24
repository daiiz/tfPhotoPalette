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
        var imgSize = $('#select-img-size')[0].value;
        // backgroundに対して，minifyされた画像のbase64コードを要求する
        chrome.runtime.sendMessage({
            type: "request-base64-img",
            options: {
                image_size: imgSize
            }
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
    $('#ans').text('');
    var appUrl = 'http://localhost:52892/api/classify';
    $.ajax({
        url: appUrl,
        data: JSON.stringify({
            jpg: base64jpg
        }),
        type: "POST",
        contentType:'application/json',
        success: function (response) {
            showDetailJSON(response);
            $('#ans').text(response.description);
            console.log(response);
        },
        error: function (response) {
            console.info(response);
        }
    });
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
