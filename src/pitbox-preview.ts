import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

type RectCoords = {
    top: number,
    height: number,
    left: number,
    width: number,
}

type PitboxStyle = {
    /** Width of the source images, in pixels */
    width: number,
    /** Height of the source images, in pixels */
    height: number,
    /** Image source for "black" pitbox reference */
    black: string,
    /** Image source for "white" pitbox reference */
    white: string,
    /** Location of the roof of the pitbox within the reference images. */
    roof: RectCoords,
    /** Location of the toolbox area of the pit within the reference images. */
    box: RectCoords,
}

const PITBOXES: Record<string, PitboxStyle> = {
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
}

/**
 * Constructs a Promise that can be manually resolved outside of its own handler
 */
function createResolvablePromise<T>() {
    const promiseState = {
        status: "wait" as "wait" | "resolved" | "rejected",
        resolvedValue: null as any,
        rejectedError: null as any,
        resolve: (_value: T) => { },
        reject: (_err: any) => { },
    }

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

    const promise = new Promise<T>((res, rej) => {
        // If the promise was manually resolved before this handler runs, resolve/reject immediately
        if (promiseState.status === "resolved") {
            res(promiseState.resolvedValue);
        } else if (promiseState.status === "rejected") {
            rej(promiseState.rejectedError);
        } else {

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
            }
        }
    });

    return {
        /** 
         * The promise to be resolved, which can be used in other async chains ("then", "finally", etc.)
         */
        promise,
        /**
         * Resolves the promise using the given resolution value
         */
        resolve: (value: T) => promiseState.resolve(value),
        /**
         * Rejects the promise with the given error
         */
        reject: (err: any) => promiseState.reject(err),
    };
}

@customElement('pitbox-preview')
export class PitboxPreview extends LitElement {

    /**
     * Color of the pit roof canopy.
     */
    @property()
    roofColor = "#00FF00";

    /**
     * Color of the pit toolboxes
     */
    @property()
    boxColor = "#FF0000";

    /**
     * Pitbox style. ("road", "oval", etc...)
     */
    @property()
    boxType = "road";

    blackImg = null as null | HTMLImageElement;
    whiteImg = null as null | HTMLImageElement;
    canvas = null as null | HTMLCanvasElement;

    override render() {
        const pitboxStyle = PITBOXES[this.boxType];

        if(!pitboxStyle) {
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

            const ctx = canvas.getContext("2d")!;

            // start with the "white" pitbox image and apply colors to it
            ctx.drawImage(whiteImg, 0, 0);
            ctx.save();

            // roof color
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = this.roofColor;
            const roofLocation = PITBOXES[this.boxType].roof;
            ctx.fillRect(roofLocation.left, roofLocation.top, roofLocation.width, roofLocation.height);

            // box color
            const boxLocation = PITBOXES[this.boxType].box;
            ctx.fillStyle = this.boxColor;
            ctx.fillRect(boxLocation.left, boxLocation.top, boxLocation.width, boxLocation.height);

            ctx.restore();

            // use the "black" image to restore the normal appearance of non-pitbox areas of the image
            ctx.save();
            ctx.globalCompositeOperation = "lighten";
            ctx.drawImage(blackImg, 0, 0);
            ctx.restore();
        }
    }
}