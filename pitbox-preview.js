var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
const PITBOXES = {
    "road": {
        width: 1280,
        height: 1280,
        black: "assets/road_black.png",
        white: "assets/road_white.png",
        roof: {
            left: 0,
            width: 1280,
            top: 0,
            height: 450
        },
        box: {
            left: 0,
            width: 1280,
            top: 450,
            height: (1280 - 450)
        },
    }
};
function createResolvablePromise() {
    const promiseState = {
        status: "wait",
        resolvedValue: null,
        rejectedError: null,
        resolve: (_value) => { },
        reject: (_err) => { },
    };
    // Set up these functions first, in case the promise is manually resolved before it has a chance to run on its own
    promiseState.resolve = (value) => {
        if (promiseState.status === "wait") {
            promiseState.status = "resolved";
            promiseState.resolvedValue = value;
        }
    };
    promiseState.reject = (err) => {
        if (promiseState.status === "wait") {
            promiseState.status = "rejected";
            promiseState.rejectedError = err;
        }
    };
    const promise = new Promise((res, rej) => {
        // If the promise was manually resolved before this handler runs, resolve/reject immediately
        if (promiseState.status === "resolved") {
            res(promiseState.resolvedValue);
        }
        else if (promiseState.status === "rejected") {
            rej(promiseState.rejectedError);
        }
        else {
            // otherwise, replace the handlers with these ones
            promiseState.resolve = (value) => {
                // check "wait" again in case they try to call resolve or reject more than once.
                if (promiseState.status === "wait") {
                    promiseState.status = "resolved";
                    promiseState.resolvedValue = value;
                    res(value);
                }
            };
            promiseState.reject = (err) => {
                if (promiseState.status === "wait") {
                    promiseState.status = "rejected";
                    promiseState.rejectedError = err;
                    rej(err);
                }
            };
        }
    });
    return {
        promise,
        resolve: (value) => promiseState.resolve(value),
        reject: (err) => promiseState.reject(err),
    };
}
let PitboxPreview = class PitboxPreview extends LitElement {
    constructor() {
        super(...arguments);
        this.roofColor = "#00FF00";
        this.boxColor = "#FF0000";
        this.boxType = "road";
        this.blackImg = null;
        this.whiteImg = null;
        this.canvas = null;
    }
    render() {
        const pitboxStyle = PITBOXES[this.boxType];
        if (!pitboxStyle) {
            return;
        }
        const whiteImgSrc = pitboxStyle.white;
        const blackImgSrc = pitboxStyle.black;
        const whiteImgLoaded = createResolvablePromise();
        const blackImgLoaded = createResolvablePromise();
        const bothImagesLoaded = Promise.all([whiteImgLoaded.promise, blackImgLoaded.promise]);
        bothImagesLoaded.then(() => this.draw());
        this.whiteImg = document.createElement("img");
        this.whiteImg.onload = whiteImgLoaded.resolve;
        this.whiteImg.onerror = whiteImgLoaded.reject;
        this.whiteImg.src = whiteImgSrc;
        this.whiteImg.hidden = true;
        this.blackImg = document.createElement("img");
        this.blackImg.onload = blackImgLoaded.resolve;
        this.whiteImg.onerror = blackImgLoaded.reject;
        this.blackImg.src = blackImgSrc;
        this.blackImg.hidden = true;
        this.canvas = document.createElement("canvas");
        this.canvas.width = pitboxStyle.width;
        this.canvas.height = pitboxStyle.height;
        const d = document.createElement("div");
        d.appendChild(this.whiteImg);
        d.appendChild(this.blackImg);
        d.appendChild(this.canvas);
        return d;
    }
    draw() {
        if (this.canvas !== null && this.blackImg !== null && this.whiteImg !== null) {
            const canvas = this.canvas;
            const blackImg = this.blackImg;
            const whiteImg = this.whiteImg;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(whiteImg, 0, 0);
            ctx.save();
            // roof color
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = this.roofColor;
            const roofLocation = PITBOXES[this.boxType].roof;
            ctx.fillRect(roofLocation.left, roofLocation.top, roofLocation.width, roofLocation.height);
            const boxLocation = PITBOXES[this.boxType].box;
            ctx.fillStyle = this.boxColor;
            ctx.fillRect(boxLocation.left, boxLocation.top, boxLocation.width, boxLocation.height);
            ctx.restore();
            ctx.save();
            ctx.globalCompositeOperation = "lighten";
            ctx.drawImage(blackImg, 0, 0);
            ctx.restore();
        }
    }
};
__decorate([
    property()
], PitboxPreview.prototype, "roofColor", void 0);
__decorate([
    property()
], PitboxPreview.prototype, "boxColor", void 0);
__decorate([
    property()
], PitboxPreview.prototype, "boxType", void 0);
PitboxPreview = __decorate([
    customElement('pitbox-preview')
], PitboxPreview);
export { PitboxPreview };
//# sourceMappingURL=pitbox-preview.js.map