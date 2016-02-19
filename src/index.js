var canvasEditor;
$(function () {
    canvasEditor = new CanvasEditor($('#editor'), $('#crop'), $('#minfy'));
    canvasEditor.src = 'https://scontent.cdninstagram.com/t51.2885-15/e35/12555849_1563879047267004_2071587360_n.jpg';
    //canvasEditor.src = 'https://www.google.co.jp/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
});
