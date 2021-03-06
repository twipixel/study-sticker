import {Calc} from '../utils/Calculator';
import {Painter} from './../utils/Painter';
import {VectorContainer} from '../view/VectorContainer';
import {TransformTool} from '../transform/TransformTool';
import Mouse from './../utils/Mouse';


export class StickerMain extends PIXI.utils.EventEmitter {

    static get DELETED() {
        return 'deleted';
    }

    static get SELECTED() {
        return 'selected';
    }

    static get DESELECTED() {
        return 'deselected';
    }

    constructor(renderer, stageLayer, stickerLayer) {
        super();
        this.renderer = renderer;
        this.stageLayer = stageLayer;
        this.stickerLayer = stickerLayer;

        this.initialize();
        this.addDebug();
        // this.initGUI();
        // this.testCreateStickers();

        this.startGuide();
    }


    tapOrClick(event) {
        this.stopGuide();
        window.removeEventListener('mouseup', this._tapOrClickListener, false);
        window.removeEventListener('touchend', this._tapOrClickListener, false);

        this.loadingText = Painter.getText('LOADING...', 0x1b1b1b, 0xf1c40f);
        this.loadingText.x = this.renderer.view.width / 2;
        this.loadingText.y = this.renderer.view.height / 2;
        this.stickerLayer.addChild(this.loadingText);

        setTimeout(this.delayTestStart.bind(this), 100);
    }


    delayTestStart() {
        this.initGUI();
        this.testCreateStickers();
    }


    set cursorArea(value) {
        this._cursorArea = value;
        this.transformTool.visibleCursorArea(value);
    }

    get cursorArea() {
        return this._cursorArea;
    }


    initialize() {
        this.stickers = [];
        this.isDemoMode = true;
        this.isRestore = false;
        this._cursorArea = false;
        this.stickerLayer.updateTransform();
        var options = {deleteButtonOffsetY: 0};
        this.canvas = document.getElementById('canvas');
        this.transformTool = new TransformTool(this.stageLayer, this.stickerLayer, options);
    }


    initGUI() {
        var gui = new dat.GUI();
        var title = gui.addFolder('커서 영역 화면에 표시');
        title.add(this, 'cursorArea');
        title.open();
        //gui.close();
    }


    createSticker(url, x, y, width, height, visible = true) {
        var sticker = new VectorContainer();
        sticker.visible = visible;
        window['s' + this.stickers.length] = sticker;
        this.stickerLayer.addChild(sticker);
        this.stickers.push(sticker);
        sticker.pivot = {x: width / 2, y: height / 2};
        sticker.x = x;
        sticker.y = y;
        sticker.rotation = -this.stickerLayer.rotation;
        sticker._stickerMouseDownListener = this.onStickerMouseDown.bind(this);
        sticker._stickerDeleteListener = this.onStickerDelete.bind(this);
        sticker._stickerSelectListener = this.onStickerSelect.bind(this);
        sticker._stickerDeselectListener = this.onStickerDeselect.bind(this);
        sticker._stickerLoadCompleteListener = this.onLoadComplete.bind(this);
        sticker.on('mousedown', sticker._stickerMouseDownListener);
        sticker.on('touchstart', sticker._stickerMouseDownListener);
        sticker.on(TransformTool.DELETE, sticker._stickerDeleteListener);
        sticker.on(TransformTool.SELECT, sticker._stickerSelectListener);
        sticker.on(TransformTool.DESELECT, sticker._stickerDeselectListener);
        sticker.on(VectorContainer.LOAD_COMPLETE, sticker._stickerLoadCompleteListener);
        sticker.load(url, 0, 0, width, height);
        return sticker;
    }


    deleteSticker(target) {
        if (target === null) return;

        target.off('mousedown', target._stickerMouseDownListener);
        target.off('touchstart', target._stickerMouseDownListener);
        target.off(TransformTool.DELETE, target._stickerDeleteListener);
        target.off(TransformTool.SELECT, target._stickerSelectListener);
        target.off(TransformTool.DESELECT, target._stickerDeselectListener);
        target.off(VectorContainer.LOAD_COMPLETE, target._stickerLoadCompleteListener);
        target._stickerMouseDownListener = null;
        target._stickerDeleteListener = null;
        target._stickerSelectListener = null;
        target._stickerDeselectListener = null;
        target._stickerLoadCompleteListener = null;

        for (var i = 0; i < this.stickers.length; i++) {
            var sticker = this.stickers[i];
            if (sticker === target) {
                this.stickers.splice(i, 1);
                this.stickerLayer.removeChild(sticker);
                this.transformTool.releaseTarget();
                sticker.delete();
                sticker = null;
            }
        }
    }


    restore(snapshot) {
        if (!snapshot) return;

        this.stickers = null;
        this.stickers = [];
        this.isRestore = true;
        this.restoreCount = 0;
        this.restoreTotal = snapshot.length;

        for (var i = 0; i < snapshot.length; i++) {
            var vo = snapshot[i];
            var sticker = new VectorContainer();
            this.stickerLayer.addChild(sticker);
            this.stickers.push(sticker);

            var transform = vo.transform;
            sticker.x = transform.x;
            sticker.y = transform.y;
            sticker.scale.x = transform.scaleX;
            sticker.scale.y = transform.scaleY;
            sticker.rotation = transform.rotation;
            sticker.childIndex = vo.childIndex;
            sticker._stickerMouseDownListener = this.onStickerMouseDown.bind(this);
            sticker._stickerDeleteListener = this.onStickerDelete.bind(this);
            sticker._stickerSelectListener = this.onStickerSelect.bind(this);
            sticker._stickerDeselectListener = this.onStickerDeselect.bind(this);
            sticker._stickerLoadCompleteListener = this.onLoadComplete.bind(this);
            sticker.on('mousedown', sticker._stickerMouseDownListener);
            sticker.on('touchstart', sticker._stickerMouseDownListener);
            sticker.on(TransformTool.DELETE, sticker._stickerDeleteListener);
            sticker.on(TransformTool.SELECT, sticker._stickerSelectListener);
            sticker.on(TransformTool.DESELECT, sticker._stickerDeselectListener);
            sticker.on(VectorContainer.LOAD_COMPLETE, sticker._stickerLoadCompleteListener);
            sticker.load(vo.url, vo.x, vo.y, vo.width, vo.height);
        }
    }


    updateTransformTool() {

        this.transformTool.updateGraphics();
    }


    releaseTarget() {
        this.transformTool.releaseTarget();
    }


    show() {
        for (var i = 0; i < this.stickers.length; i++)
            this.stickers[i].visible = true;
        this.transformTool.show();
    }


    hide() {
        for (var i = 0; i < this.stickers.length; i++)
            this.stickers[i].visible = false;
        this.transformTool.hide();
    }


    clear() {
        var cloneStickers = this.stickers.slice(0);
        for (var i = 0; i < cloneStickers.length; i++)
            this.deleteSticker(cloneStickers[i]);
    }


    update() {
        this.transformTool.update();
    }


    resize() {

    }


    onLoadComplete(e) {
        if(this.isDemoMode) return;

        if (this.isRestore === false) {
            this.stickerLayer.updateTransform();
            this.transformTool.activeTarget(e.target);
        } else {
            if (++this.restoreCount == this.restoreTotal) this.isRestore = false;
        }
    }


    onStickerClick(e) {
        var target = e.target;
        this.stickerLayer.setChildIndex(target, this.stickerLayer.children.length - 1);
        this.transformTool.setTarget(e);
    }


    onStickerMouseDown(e) {
        var target = e.target;
        //if (target.checkAlphaPoint(Mouse.global)) return;
        e.stopPropagation();
        this.onStickerClick(e);
    }


    onStickerDelete(target) {
        this.deleteSticker(target);
        this.emit(StickerMain.DELETED, target);
    }


    onStickerSelect(target) {
        this.emit(StickerMain.SELECTED, target);
    }


    onStickerDeselect(target) {
        this.emit(StickerMain.DESELECTED, target);
    }


    onKeyUp(e) {
        switch (e.keyCode) {
            case 27: //consts.KeyCode.ESC:
                this.clear();
                break;
            case 32: //consts.KeyCode.SPACE:
                this.testCreateStickers();
                break;
            case 49: //consts.KeyCode.NUM_1:
                this.deleteSticker(this.target);
                break;
            case 50: //consts.KeyCode.NUM_2:
                break;
            case 51: //consts.KeyCode.NUM_3:
                break;
            case 52: //consts.KeyCode.NUM_4:
                break;
            case 53: //consts.KeyCode.NUM_5:
                break;
            case 54: //consts.KeyCode.NUM_6:
                break;
        }
    }


    get snapshot() {
        var snapshot = [];
        for (var i = 0; i < this.stickers.length; i++) {
            var vo = this.stickers[i].snapshot;
            vo.childIndex = this.stickerLayer.getChildIndex(this.stickers[i]);
            snapshot[i] = vo;
        }

        snapshot.sort(function (a, b) {
            return a.childIndex < b.childIndex ? -1 : a.childIndex > b.childIndex ? 1 : 0;
        });

        return snapshot;
    }


    get modified() {
        return this.stickers.length !== 0;
    }

    get lastSticker() {

        if (this.stickers.length === 0) return null;

        let children = this.stickerLayer.children;

        for (var i = children.length; i--;) {

            if (this.stickers.indexOf(children[i]) != -1)
                return children[i];
        }

        return null;
    }

    get target() {
        return this.transformTool.target;
    }


    addDebug() {
        this.svgs = [
            './../img/svg/airplane.svg',
            './../img/svg/bank.svg',
            './../img/svg/beacon.svg',
            './../img/svg/beats.svg',
            './../img/svg/bell.svg',
            './../img/svg/bicycle.svg',
            './../img/svg/box.svg',
            './../img/svg/browser.svg',
            './../img/svg/bulb.svg',
            './../img/svg/casino.svg',
            './../img/svg/chair.svg',
            './../img/svg/config.svg',
            './../img/svg/cup.svg',
            './../img/svg/folder.svg',
            './../img/svg/football.svg',
            './../img/svg/headphones.svg',
            './../img/svg/heart.svg',
            './../img/svg/laptop.svg',
            './../img/svg/letter.svg',
            './../img/svg/like.svg',
            './../img/svg/map.svg',
            './../img/svg/medal.svg',
            './../img/svg/mic.svg',
            './../img/svg/milk.svg',
            './../img/svg/pencil.svg',
            './../img/svg/picture.svg',
            './../img/svg/polaroid.svg',
            './../img/svg/printer.svg',
            './../img/svg/search.svg',
            './../img/svg/shoppingbag.svg',
            './../img/svg/speed.svg',
            './../img/svg/stopwatch.svg',
            './../img/svg/tweet.svg',
            './../img/svg/watch.svg'
        ];

        window.document.addEventListener('keyup', this.onKeyUp.bind(this));
    }


    testCreateStickers() {
        if (this.stickers.length !== 0) return;

        var stickers = [];
        var defaultSize = 100;
        var defaultSticker = 3;
        var canvasWidth = this.canvas.width;
        var canvasHeight = this.canvas.height;
        // var totalSticker = defaultSticker + parseInt(Math.random() * (this.svgs.length - defaultSticker));
        var totalSticker = defaultSticker;

        for (var i = 0; i < totalSticker; i++) {
            var stickerSize = defaultSize + parseInt(Math.random() * 40);
            var direction = (Math.random() < 0.5) ? -1 : 1;
            var rotation = Calc.toRadians(Math.random() * 360) * direction;
            var randomIndex = parseInt(Math.random() * this.svgs.length);
            var url = this.svgs.splice(randomIndex, 1)[0];
            var randomX = stickerSize + parseInt(Math.random() * (canvasWidth - stickerSize * 2));
            var randomY = stickerSize + parseInt(Math.random() * (canvasHeight - stickerSize * 2));
            randomX = Math.round(randomX);
            randomY = Math.round(randomY);

            var sticker = this.createSticker(url, randomX, randomY, stickerSize, stickerSize, false);
            sticker.scale.x = sticker.scale.y = 0;

            var stickerVO = {
                sticker: sticker,
                scale: 1,
                rotation: rotation,
                animationTime: 60
            };

            stickers.push(stickerVO);
        }

        this.addStickerWithMotion(stickers);
    }


    addStickerWithMotion(stickerVOList = null) {
        if (stickerVOList != null) this.addStickerVOList = stickerVOList;
        if (!this.addStickerVOList || this.addStickerVOList.length <= 0) return;

        var displayTime = 4;
        var displayDuration = displayTime * this.addStickerVOList.length;

        cancelAnimFrame(this.addAniId);
        this.addAniId =
            animationLoop(
                this.startAddTween.bind(this, displayTime, stickerVOList), displayDuration, 'linear',
                function progress() {
                },
                function complete() {
                },
                this
            );

        /*var stickerVO = this.addStickerVOList.shift();
         stickerVO.sticker.visible = true;
         cancelAnimFrame(this.addAniId);
         this.addAniId =
         animationLoop(
         this.addTween.bind(this, stickerVO), 60, 'easeOutElastic',
         function progressHandler() {},
         this.addStickerWithMotion.bind(this),
         this
         );*/
    }


    roundPixelSticker(sticker) {
        sticker.scale.x = sticker.scale.y = 1;
    }

    activeLastTarget(sticker) {
        this.transformTool.activeTarget(sticker);
        this.stickerLayer.setChildIndex(sticker, this.stickerLayer.children.length - 1);
    }


    startAddTween(displayTime, stickerVOList, easeDecimal, stepDecimal, currentStep) {

        if (currentStep % displayTime == 0) {

            this.removeLoadingText();

            var stickerVO = stickerVOList.shift();
            var sticker = stickerVO.sticker;

            var completeCallBack = function() {};

            if (stickerVOList.length == 1)
                completeCallBack = this.activeLastTarget.bind(this, sticker);

            sticker.visible = true;

            animationLoop(
                this.addTween.bind(this, stickerVO), stickerVO.animationTime, 'easeOutElastic',
                function progress() {
                },
                completeCallBack,
                this
            );
        }
    }


    addTween(stickerVO, easeDecimal, stepDecimal, currentStep) {
        var vo = stickerVO;
        var sticker = vo.sticker;
        var scale = 0 + (vo.scale - 0) * easeDecimal;
        var rotation = 0 + (vo.rotation - 0) * easeDecimal;
        sticker.scale.x = sticker.scale.y = scale;
        sticker.rotation = rotation;

        if(currentStep == vo.animationTime) {
            sticker.scale.x = sticker.scale.y = vo.scale;
            // sticker.emit(TransformTool.TRANSFORM_COMPLETE);
        }
    }


    startGuide(delayTime = 800) {
        this.isGuide = false;
        this._guideId = setInterval(() => {
                this.doGuide();
        }, delayTime);


        this._tapOrClickListener = this.tapOrClick.bind(this);
        window.addEventListener('mouseup', this._tapOrClickListener, false);
        window.addEventListener('touchend', this._tapOrClickListener, false);
    }


    stopGuide() {
        clearInterval(this._guideId);
        if (this.guideText) this.stickerLayer.removeChild(this.guideText);
    }


    removeLoadingText() {
        if(this.loadingText)
            this.stickerLayer.removeChild(this.loadingText);
    }


    doGuide() {
        if (this.isGuide === false) {
            this.isGuide = true;

            if(!this.guideText) {
                this.guideText = Painter.getText('TOUCH SCREEN', 0x1b1b1b, 0xf1c40f);
                // this.guideText = Painter.getText('TOUCH SCREEN', 0xFFFFFF, 0x9b59b6);
            }

            this.guideText.x = this.renderer.view.width / 2;
            this.guideText.y = this.renderer.view.height / 2;
            this.stickerLayer.addChild(this.guideText);
        } else {
            this.isGuide = false;
            if (this.guideText) this.stickerLayer.removeChild(this.guideText);
        }
    }

}

