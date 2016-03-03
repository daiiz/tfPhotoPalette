class CanvasEditor {
    constructor ($stage, $cropStage, $minfyStage) {
        this.version_photo_cropper = "0.0.1";
        this.$stage = $stage;
        this.$cropStage = $cropStage;
        this.$minfyStage = $minfyStage;

        this.$canvas = $stage.find('canvas.org');
        this.$cropCanvas = $cropStage.find('canvas.crop');
        this.$minfyCanvas = $minfyStage.find('canvas.minfy');
        this.editCtx = null;
        this.cropCtx = null;
        this.minfyCtx = null;
        this._initVariables();
        this._initEditCanvas();
        this._initCropCanvas();
        this._initMinfyCanvas();
        this._initCropper();
        this.bindEvents();
        this.width = this.resWidth;
        this.height = this.resHeight;
        // ギャラリーで選択されている画像
        this.selectedImage = null;
        console.info('OK, CanvasEditor');
    }

    _initVariables () {
        this.editCtxImg = null;
        this.imageUri = null;
        // 画像のスケールを管理する
        // ツールで表示したときに各辺がどれだけ縮小拡大されたかの値
        this.xW = 1;
        this.xH = 1;
        // デフォルト値
        this.w = 200;
        this.h = 200;
        this.maxw = 612;
        this.maxh = 612;
        this.resWidth = 32;
        this.resHeight = 32;
    }

    _initCropper () {
        var $cropper = this.$stage.find('div#cropper');
        $cropper.css({
            top: 0,
            left: 0,
            width: 50,
            height: 50
        })
        // ドラッグ可能にする
        $cropper.draggable({
            stop: (ev, ui) => {
                this.highlightSelectedGalleryImage(null);
                this.updateCropCtx();
                this.setCanvasPosition();
            },
            containment: '#editor',
            snap: true,
            snapMode: "outer"
        });
        // リサイズ可能にする
        $cropper.resizable({
            stop: (ev, ui) => {
                this.highlightSelectedGalleryImage(null);
                this.updateCropCtx();
                this.setCanvasPosition();
            },
            containment: '#editor',
            aspectRatio: this.resWidth / this.resHeight,
            handles: "all"
        });
    }

    _initCropCanvas () {
        this.cropCtx = this._initCanvas(this.$cropCanvas, this.$cropStage);
    }

    _initMinfyCanvas() {
        this.minfyCtx = this._initCanvas(this.$minfyCanvas, this.$minfyStage);
    }

    _initEditCanvas () {
        this.editCtx = this._initCanvas(this.$canvas, this.$stage);
    }

    _initCanvas ($canvas, $stage) {
        var ctx = null;
        if ($canvas.length > 0) {
            var canvas = $canvas[0];
            var stage = $stage[0]
            canvas.width = this.w;
            canvas.height = this.h;
            ctx = canvas.getContext('2d');
            this._setSize(this.w, this.h, canvas, stage);
        }
        return ctx;
    }

    _setSize (width, height, canvas, stage) {
        var w = width, h = height;
        if (width > height) {
            if (width > this.maxw) {
                height = (height / width) * this.maxw;
                width = this.maxw;
                this.xW = w / this.maxw;
                this.xH = h / height;
            }
        }else {
            if (height > this.maxw) {
                width = (width / height) * this.maxw;
                height = this.maxw;
                this.xH = h / this.maxw;
                this.xW = w / width;
            }
        }

        width = Math.floor(width);
        height = Math.floor(height);

        canvas.width = width;
        canvas.height = height;
        stage.style.width = width + 'px';
        stage.style.height = height + 'px';
        return {width: width, height: height};
    }

    _px2num (px) {
        return +(px.replace('px', ''));
    }

    updateCropCtx () {
        var $cropper = this.$stage.find('div#cropper');
        var x = this._px2num($cropper.css('left'));
        var y = this._px2num($cropper.css('top'));
        var w = $cropper[0].offsetWidth;
        var h = $cropper[0].offsetHeight;
        if (this.editCtxImg !== null) {
            this._setSize(w, h, this.$cropCanvas[0], this.$cropStage[0]);
            this.cropCtx.drawImage(this.editCtxImg, x * this.xW, y * this.xH, w * this.xW, h * this.xH, 0, 0, w, h);
            this.updateMinfyCtx(x, y);
            this.setCanvasPosition();
        }
    }

    updateMinfyCtx (x, y) {
        var $cropper = this.$stage.find('div#cropper');
        if (this.editCtxImg !== null) {
            var w = $cropper[0].offsetWidth;
            var h = $cropper[0].offsetHeight;
            this.minfyCtx.fillStyle = "#fff";
            this.minfyCtx.fillRect(0, 0, w, h);
            this.minfyCtx.drawImage(this.editCtxImg, x * this.xW, y * this.xH, w * this.xW, h * this.xH, 0, 0, this.resWidth, this.resHeight);
        }
    }

    /* editCtxの高さに合わせて，他のCanvasを縦中央揃えする */
    setCanvasPosition () {
        var baseHeight = this.$stage[0].offsetHeight;
        var cropStageHeight = this.$cropStage[0].offsetHeight;
        var minfyStageHeight = this.$minfyStage[0].offsetHeight;
        var dc = baseHeight - cropStageHeight;
        var dm = baseHeight - minfyStageHeight;
        this.$cropStage[0].style.top = (dc / 2) + 'px';
        this.$minfyStage[0].style.top = (dm / 2) + 'px';
        var lineTop = (dm / 2) + $('#ce-main')[0].offsetTop + 1;
        var lineLeft = this.$minfyStage[0].offsetLeft + 1;
        $('#line').css({top: lineTop, height: this.resHeight});
        $('#resH').css({top: lineTop + ((this.resHeight - 20) / 2), left: lineLeft + this.resWidth + 10});
        $('#line-v').css({left: lineLeft, width: this.resWidth});
        $('#resW').css({top: lineTop + this.resHeight + 10, left: lineLeft - ((40 - this.resWidth) / 2)});
    }

    /* editCtxに画像をセットする */
    set src (val) {
        this._initVariables();
        this._initCropper();
        this.imageUri = val;
        var canvas = this.$canvas[0];
        var stage = this.$stage[0];
        var photoUrlBox = $('#photo-uri')[0];
        var self = this;

        if (val.match(/^data:image.*/)) {
            // base64エンコードされた画像を表示
            var img = $('#hidden-img')[0];
            img.onload = function (e) {
                self._src(img, canvas, stage);
            };
            img.src = val;
        }else {
            // 画像のURLにアクセスして表示
            var xhr = new XMLHttpRequest();
            xhr.open('GET', val, true);
            xhr.responseType = 'blob';
            xhr.onload = function (e) {
                var img = new Image();
                img.className = 'original';
                img.onload = () => {
                    self._src(img, canvas, stage);
                }
                img.src = window.URL.createObjectURL(this.response);
                self.$stage[0].appendChild(img);
            };
            xhr.send();
        }
    }

    _src (img, canvas, stage) {
        this.editCtxImg = img;
        var w = img.offsetWidth;
        var h = img.offsetHeight;
        var size = this._setSize(w, h, canvas, stage);
        this.editCtx.drawImage(img, 0, 0, w, h, 0, 0, size.width, size.height);
        this.updateCropCtx();
        this.setCanvasPosition();
    }

    /* 最終的に出力する横幅 */
    set width (val) {
        this.resWidth = val;
        $('#resW')[0].value = val;
        this._setSize(this.resWidth, this.resHeight, this.$minfyCanvas[0], this.$minfyStage[0]);
        this._initCropper();
        this.updateCropCtx();
    }

    /* 最終的に出力する高さ */
    set height (val) {
        this.resHeight = val;
        $('#resH')[0].value = val;
        this._setSize(this.resWidth, this.resHeight, this.$minfyCanvas[0], this.$minfyStage[0]);
        this._initCropper();
        this.updateCropCtx();
    }

    setResWidth (w) {
        if (w > this.maxw / 2) w = this.maxw / 2;
        this.width = w;
    }

    setResHeight (h) {
        if (h > this.maxh / 2) h = this.maxh / 2;
        this.height = h;
    }

    // ギャラリーに保持した画像DOMをJSON形式に整形する
    dumpJson (keptImgObj) {
        var res = {};
        // オリジナル画像URLを設定
        res.original = keptImgObj.dataset.original;
        // ラベルを設定
        var labels = keptImgObj.dataset.labels || '';
        res.labels = labels.split(',');
        // 切り出しサイズを設定
        res.crop_size = {
            width: +keptImgObj.dataset.resw,
            height: +keptImgObj.dataset.resh
        };
        // cropperを設定
        res.cropper = {
            width: +keptImgObj.dataset.cropw,
            height: +keptImgObj.dataset.croph,
            left: +keptImgObj.dataset.cropx,
            top: +keptImgObj.dataset.cropy
        }
        // mnifyした画像のbase64コード
        var base64 = keptImgObj.style.backgroundImage.split('url(')[1].split(')')[0].replace(/"/gi, '');
        res.img_base64_cropped = base64;
        // 表示時のサイズ情報
        res.tool_size = {
            editor_canvas_org_width: +keptImgObj.dataset.ecow,
            editor_canvas_org_height: +keptImgObj.dataset.ecoh
        };

        return res;
    }

    // インポートした写真をGalleryに追加する
    addToGallery (photo) {
        var $gallery = $('#collect-area');
        var keepImg = document.createElement('div');
        keepImg.className = 'keep-cropped-img';
        // mnifyにした画像の情報を保持する
        var dataUrl = photo.img_base64_cropped;
        keepImg.style.backgroundImage = `url(${dataUrl})`;
        keepImg.dataset.original = photo.original;
        keepImg.dataset.labels = photo.labels.join(',');
        keepImg.dataset.cropx = photo.cropper.left;
        keepImg.dataset.cropy = photo.cropper.top;
        keepImg.dataset.cropw = photo.cropper.width;
        keepImg.dataset.croph = photo.cropper.height;
        keepImg.dataset.resw = photo.crop_size.width;
        keepImg.dataset.resh = photo.crop_size.height;
        keepImg.dataset.ecow = photo.tool_size.editor_canvas_org_width;
        keepImg.dataset.ecoh = photo.tool_size.editor_canvas_org_height;
        $gallery.prepend(keepImg);
    }

    bindEvents () {
        $('#resH').on('change', (e) => {
            var h = +e.target.value;
            this.setResHeight(h);
        });
        $('#resW').on('change', (e) => {
            var w = +e.target.value;
            this.setResWidth(w);
        });
        $('#btn-photo-uri').on('click', (e) => {
            var uri = $('#photo-uri')[0].value || '';
            if (uri !== '') {
                this.src = uri;
                this.highlightSelectedGalleryImage(null);
            }
        });
        $('#head').on('click', (e) => {
            $('#photo-uri')[0].focus();
        });

        // ギャラリーに追加する
        $('.minfy').on('click', (e) => {
            if (this.selectedImage !== null) return;
            var $gallery = $('#collect-area');
            var $cropper = this.$stage.find('div#cropper');
            var x = this._px2num($cropper.css('left'));
            var y = this._px2num($cropper.css('top'));
            var w = $cropper[0].offsetWidth - 2;
            var h = $cropper[0].offsetHeight - 2;

            var dataUrl = e.target.toDataURL('image/jpeg');
            var labels = $('#photo-labels')[0].value || '';
            var keepImg = document.createElement('div');
            keepImg.className = 'keep-cropped-img';
            // mnifyにした画像の情報を保持する
            keepImg.style.backgroundImage = `url(${dataUrl})`;
            keepImg.dataset.original = this.imageUri;
            keepImg.dataset.labels = labels;
            keepImg.dataset.cropx = x;
            keepImg.dataset.cropy = y;
            keepImg.dataset.cropw = w;
            keepImg.dataset.croph = h;
            keepImg.dataset.resw = this.resWidth;
            keepImg.dataset.resh = this.resHeight;
            keepImg.dataset.ecow = this.$canvas[0].offsetWidth;
            keepImg.dataset.ecoh = this.$canvas[0].offsetHeight;
            $gallery.prepend(keepImg);
        });

        // ギャラリーの写真を復元する
        $('#collect-area').on('click', '.keep-cropped-img', (e) => {
            var keptImg = e.target;
            // 選択された画像を保持する
            // 選択されたことをハイライトして示す
            this.highlightSelectedGalleryImage(keptImg);
            var $cropper = this.$stage.find('div#cropper');
            // オリジナル画像URLを設定
            $('#photo-uri')[0].value = keptImg.dataset.original;
            if (this.src !== keptImg.dataset.original) {
                this.src = keptImg.dataset.original;
            }
            // ラベルを設定
            $('#photo-labels')[0].value = keptImg.dataset.labels || '';
            // 切り出しサイズを設定
            var resw = +keptImg.dataset.resw;
            var resh = +keptImg.dataset.resh;
            $('#resW')[0].value = resw;
            this.setResWidth(resw);
            this.width = resw;
            $('#resH')[0].value = resh;
            this.setResHeight(resh);
            this.height = resh;
            // cropperを設定
            $cropper.css({
                left: +keptImg.dataset.cropx,
                top: +keptImg.dataset.cropy,
                width: +keptImg.dataset.cropw,
                height: +keptImg.dataset.croph
            });

            return false;
        });

        // ギャラリーの写真をエクスポートする
        $('#btn-export-keptImgs').on('click', (e) => {
            var res = [];
            var $dl_a_tag = $('#export-dl');
            $dl_a_tag.text('Preparing...');
            var keptImgs = $('.keep-cropped-img');
            for (var i = 0; i < keptImgs.length; i++) {
                res.push(this.dumpJson(keptImgs[i]));
            }
            res = JSON.stringify({items: res, version: this.version_photo_cropper}, null, 4);
            var blob = new Blob([res], {type: 'text/plain'});
            var url = window.URL.createObjectURL(blob);
            var d = new Date();
            var fname = `photocropper-${d.getTime()}.json`;
            $dl_a_tag.attr('download', fname);
            $dl_a_tag.attr('href', url);
            $dl_a_tag.text(fname);
            return false;
        });

        // 選択中の写真をギャラリーから削除する
        $('#btn-remove-photo').on('click', (e) => {
            if (this.selectedImage !== null) {
                this.selectedImage.outerHTML = '';
                this.selectedImage = null;
                this.highlightSelectedGalleryImage(null);
            }
        });

        // 選択中の写真のラベルを更新する
        $('#btn-update-labels').on('click', (e) => {
            if (this.selectedImage !== null) {
                var labels = $('#photo-labels')[0].value || '';
                this.selectedImage.dataset.labels = labels;
            }
        });

        // 本ツールでエクスポートしたJSONをインポートする
        $('#btn-import-keptImgs').on('change', (e) => {
            var self = this;
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                var jsonstr = e.target.result;
                // 読み込んだ写真をGalleryに流し込む
                var photo_json = JSON.parse(jsonstr);
                var photo_items = photo_json.items;
                photo_items.forEach(photo => {
                    self.addToGallery(photo);
                });
            }
            fileReader.readAsText(e.target.files[0]);
        });

        // 画像ファイルをドラッグアンドドロップで読み込む機能
        this.bindEvents_PhotoDragLoad();
    }

    bindEvents_PhotoDragLoad () {
        var self = this;

        // ドロップ領域はタイトルヘッダ
        $('#head').bind('drop', e => {
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;
            var reader = new FileReader();
            if (files.length <= 0) return false;

            // 複数与えられた場合でも，読み込むのは最初のファイルのみ
            var file = files[0];
            // MIMEタイプを確認してからbase64コードに変換する
            if (!file.type.match('image.*')) return false;

            reader.onload = function (e) {
                var base64code = e.target.result;
                $('#photo-uri')[0].value = base64code;
                // 読み込みボタンを自動クリックする
                $('#btn-photo-uri').click();
            }

            reader.readAsDataURL(file);
        }).bind('dragenter', e => {
            return false;
        }).bind('dragover', e => {
            return false;
        });
    }

    highlightSelectedGalleryImage (new_selectedImage) {
        if (this.selectedImage !== null) {
            // 前回選択されていたものをクリアする
            this.selectedImage.style.border = '0px';
        }
        this.selectedImage = new_selectedImage;
        if (new_selectedImage !== null) {
            // 選択が他の画像に移った
            this.selectedImage.style.border = '4px solid #FFB300';
            $('#btn-update-labels').css({
                display: 'inline-block'
            });
            $('#btn-remove-photo').css({
                display: 'inline-block'
            });
        }else {
            // 選択が解除されただけ
            // 「ラベル更新ボタン」と「選択中の画像を削除ボタン」を非表示にする
            $('#btn-update-labels').css({
                display: 'none'
            });
            $('#btn-remove-photo').css({
                display: 'none'
            });
        }
    }
}
