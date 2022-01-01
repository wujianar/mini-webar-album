import {
    WebAr
} from "../../utils/WebAr";

const systemInfo = wx.getSystemInfoSync();

// 识别配置 portal.wujianar.com
const CONFIG = {
    token: 'YTU5NjgxYzU1NDAxM2ZiNWQ0OGMxOGY5Yjk2ZThlYjYxNzY2M2EwOGQ5NmIzMTYzZjYwZDkxOTQwODk2NTc2ZHsiYWNjZXNzS2V5IjoiODg3ZjE2MmFlYTY4NDk0OGE3OTI1MzNkNWZlZjY0NmQiLCJleHBpcmVzIjozMjc4MjM0NzU5NTk4fQ==', // 认证token, 请从开发者中心获取
    endpoint: 'https://iss-cn1.wujianar.com',
    quantity: 0.7, // 图片压缩质量, 0~1
    interval: 1000, // 识别间隔(毫秒)
}

Page({
    data: {
        isScanning: false,
        isShowScanButton: false,
        isShowCloseButton: false,
        isShowVideo: false,
        videoUrl: '',
    },

    onShow: function () {
        wx.showToast({
            title: 'waiting...',
            icon: 'loading',
            duration: 2000
        });
    },

    onReady: function () {
        if (systemInfo.platform === "devtools") {
            this.cameraInitDone();
        }
    },

    onUnload: function () {
        this.stop();
    },

    scan: function () {
        wx.showToast({
            title: '扫描中...',
            icon: 'none',
            duration: 2000
        });
        this.setData({
            isScanning: true,
            isShowScanButton: false,
        });

        // 开始搜索
        this.webAr.startSearch();
    },

    stop: function () {
        this.setData({
            isScanning: false
        });

        // 停止搜索
        this.webAr.stopSearch();
    },

    cameraInitDone: function () {
        this.setData({
            isShowScanButton: true
        });

        const query = wx.createSelectorQuery();
        query.select('#canvas').fields({
            node: true,
            size: true
        }).exec((res) => {
            this.webAr = new WebAr(CONFIG, res[0].node);

            // 设置搜索到目标后的回调
            this.webAr.searchCallback(res => {
                this.stop();
                this.showResult(res);
            });
        });
    },

    showResult: function (setting) {
        wx.showToast({
            title: '识别成功',
            icon: 'success',
            duration: 1500,
        });

        console.info(setting);
        // 视频信息如： {"videoUrl":"https://..."}
        const brief = JSON.parse(setting.brief);
        // demo中简单处理
        this.setData({
            isShowVideo: true,
            videoUrl: brief.videoUrl,
            isShowCloseButton: true,
        });
    },


    closeVideo: function() {
        this.setData({
            isShowVideo: false,
            isShowCloseButton: false,
            isShowScanButton: true,
        });
    },
});