import {VectorContainer} from '../view/VectorContainer';
import {TransformTool} from '../transform/TransformTool';

export class StickerMain {
    constructor(rootLayer, stickerLayer) {
        console.log('StickerMain(' + rootLayer + ', ' + stickerLayer + ')');

        this.rootLayer = rootLayer;
        this.stickerLayer = stickerLayer;

        this.stickers = [];
        this.svgs = [
            './img/svg/amazon.svg',
            './img/svg/dribbble.svg',
            './img/svg/facebook.svg',
            './img/svg/foursquare.svg',
            './img/svg/periscope.svg',
            './img/svg/pinterest.svg',
            './img/svg/shutterstock.svg',
            './img/svg/skype.svg',
            './img/svg/whatsapp.svg',
            './img/svg/wordpress.svg'
        ];

        this.initialize();
        this.addDebug();
    }


    initialize() {
        this.createStickers();
    };


    createStickers() {
        this.loadStickerCount = 0;
        this.totalSticker = 4 + parseInt(Math.random() * this.svgs.length - 3);
        console.log('createStickers(), totalSticker:', this.totalSticker);

        for(var i=0; i<this.totalSticker; i++) {
            var url = this.svgs[i];
            var sticker = new VectorContainer();
            sticker.x = parseInt(Math.random() * 800);
            sticker.y = parseInt(Math.random() * 600);
            sticker.on('click', this.onStickerClick.bind(this));
            sticker.on('mousedown', this.onStickerDown.bind(this));
            sticker.on('mouseup', this.onStickerUp.bind(this));
            sticker.on(VectorContainer.LOAD_COMPLETE, this.onLoadComplete.bind(this));
            sticker.load(url);
            this.stickerLayer.addChild(sticker);
            this.stickers[i] = sticker;
        }
    }


    addDebug() {
        window.document.addEventListener('keyup', this.onKeyUp.bind(this));
    }


    startTest() {
        console.log('START TEST');

        // 컨테이너에 스케일이 있는 경우 스케일 값을 전달해줍니다.
        //this.stickerLayer.scale.x = 0.75;
        //this.stickerLayer.scale.y = 0.75;
        //this.stickerLayer.scale.x = 1.5;
        //this.stickerLayer.scale.y = 1.5;
        this.stickerLayer.updateTransform();

        var options = {
            canvasOffsetX: 0,
            canvasOffsetY: 0,
            deleteButtonOffsetY: 0,
            //rotationLineLength: 25,
            containerScaleX: this.stickerLayer.scale.x,
            containerScaleY: this.stickerLayer.scale.y
        };

        this.transformTool = new TransformTool(this.rootLayer, this.stickerLayer, options);
    }


    onLoadComplete(e) {
        if(++this.loadStickerCount == this.totalSticker)
            this.startTest();
    }


    onStickerClick(e) {
        var target = e.target;
        this.stickerLayer.setChildIndex(target, this.stickerLayer.children.length - 1);
        this.transformTool.setTarget(target);
    }


    onStickerDown(e) {
        e.stopPropagation();
        this.downTarget = e.target;
        this.downMouseX = e.data.global.x;
        this.downMouseY = e.data.global.y;
    }


    onStickerUp(e) {
        e.stopPropagation();
        var upMouseX = e.data.global.x;
        var upMouseY = e.data.global.y;

        if(this.downTarget === e.target &&
            Math.abs(this.downMouseX - upMouseX) < 10 &&
            Math.abs(this.downMouseY - upMouseY) < 10) {

            this.onStickerClick(e);
        }
    }


    onKeyUp(e) {
        switch (e.keyCode) {
            case 27: //consts.KeyCode.ESC:
                break;
            case 32: //consts.KeyCode.SPACE:
                break;
            case 49: //consts.KeyCode.NUM_1:
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
    };

    resize() {

    };
}

