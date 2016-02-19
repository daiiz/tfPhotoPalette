var canvasEditor;
$(function () {
    canvasEditor = new CanvasEditor($('#editor'), $('#crop'), $('#minfy'));
    canvasEditor.src = 'sample.jpg';
});
