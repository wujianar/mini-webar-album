export class WebAr {
    constructor(config, canvas) {
        this.config = config;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.isRunning = false;
        this.lastSearchTime = 0;
        this.listener = null;
    }

    /**
     * 搜索到目标的回调
     * @param {*} callback 
     */
    searchCallback(callback) {
        this.listener = wx.createCameraContext().onCameraFrame(frame => {
            // 上一次搜索未结束，或未到间隔时间，则不搜索。
            if (this.isRunning || (this.lastSearchTime + this.config.interval) > Date.now()) {
                return;
            }

            // 设置canvas与相机的宽高一致
            if (this.canvas.width != frame.width || this.canvas.height != frame.height) {
                this.canvas.width = frame.width;
                this.canvas.height = frame.height;
            }

            this.isRunning = true;
            this.lastSearchTime = Date.now();

            this.search(frame).then(res => {
                this.isRunning = false;
                // code为0时搜索到目标
                if (res.code == 0) {
                    callback(res.result);
                }
            }).catch(err => {
                this.isRunning = false;
                console.info(err);
            });
        });
    }

    /**
     * 开始搜索
     */
    startSearch() {
        this.listener.start();
    }

    /**
     * 停止搜索
     */
    stopSearch() {
        this.listener.stop();
    }

    /**
     * 将相机的数据画在canvas上，并截取一张图片
     * @param {*} frame 
     */
    capture(frame) {
        const image = this.context.createImageData(frame.width, frame.height);
        image.data.set(new Uint8ClampedArray(frame.data));
        this.context.putImageData(image, 0, 0);
        const data = this.canvas.toDataURL('image/jpeg', this.config.quantity);
        return data.split(',').pop();
    }

    search(frame) {
        const imageData = this.capture(frame);

        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.config.endpoint}/search`,
                method: 'POST',
                data: {
                    image: imageData
                },
                header: {
                    'Authorization': this.config.token,
                    'content-type': 'application/json'
                },
                success: res => resolve(res.data),
                fail: err => reject(err),
            });
        });
    }
}