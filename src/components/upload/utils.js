import Vue from 'vue';
// import { getAuthInfoUrl } from 'common/datamodel/api';

export default {

    /**
     * 文件上传ajax
     * option.url    url
     * option.data   formData
     * @param {any} option 
     * @returns promise
     */
    ajax(option) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('post', option.url);
            xhr.send(option.data);
            xhr.onreadystatechange = function() {
                if (xhr.status == 200 && xhr.readyState==4) {
                    let result = null;
                    let grc = xhr.getResponseHeader("Content-Type");
                    if (grc.indexOf("json") > -1) {
                        result = JSON.parse(xhr.responseText);
                    } else if (grc.indexOf("xml") != -1) {
                        result = xhr.responseXML;
                    } else {
                        result = xhr.responseText;
                    }
                    resolve(result);
                }   
            };
            xhr.onerror = function(err){
                reject(err);
            }
        });
    },

    urlParse: function (url) {
        url = url || location.search
        url = url.replace(/#.*/, ''); // 避免hash干扰querystring
        let obj = {}
        let arr = url.match(new RegExp("[\?\&][^\?\&]+=[^\?\&]+", "g"))
        if (arr) {
            arr.forEach(function (item) {
                let _obj = item.substring(1).split('=')
                let key = decodeURIComponent(_obj[0])
                let val = decodeURIComponent(_obj[1])
                obj[key] = val
            })
        }
        return obj
    },

    base64ToBlob: function (base64, mime) {
        mime = mime || '';
        var sliceSize = 1024;
        var byteChars = window.atob(base64);
        var byteArrays = [];

        for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
            var slice = byteChars.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: mime });
    },

    /**
     * Receives an Image Object (can be JPG OR PNG) and returns a new Image Object compressed
     * @param {Image} source_img_obj The source Image Object
     * @param {Integer} quality The output quality of Image Object
     * @param {String} output format. Possible values are jpg and png
     * @param {Integer} 最大宽度百分比 100
     * @return {String} base64 url
     */
    compressIMG: function (img, quality, output_format, MAX_WIDTH) {

        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var MAX_HEIGHT = 300;
        var width = img.width;
        var height = img.height;

        let tempWidth = (MAX_WIDTH / 100) * width;

        //                if (width > height) {
        height *= tempWidth / width;
        width = tempWidth;
        //                } else {
        //                    if (height > MAX_HEIGHT) {
        //                        width *= MAX_HEIGHT / height;
        //                        height = MAX_HEIGHT;
        //                    }
        //                }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        var newImageData = canvas.toDataURL('image/jpeg', quality / 100); // 调整图片质量

        return newImageData;
    },


    /**
     * 图片头数据加载就绪事件 - 更快获取图片尺寸
     * 1、保证回调执行顺序：error > ready > load；
     * 2、回调函数this指向img本身
     * 3、注意回调不能放在箭头函数里面，否则this指向不对
     * @param  {String}  图片路径
     * @param  {Function}  尺寸就绪
     * @param  {Function}  加载完毕 (可选)
     * @param  {Function}  加载错误 (可选)
     * @example imgReady('http://www.google.com.hk/intl/zh-CN/images/logo_cn.png', function () { alert('size ready: width=' + this.width + '; height=' + this.height); });
     */
    imgReady: (function () {
        var list = [], intervalId = null,

            // 用来执行队列
            tick = function () {
                var i = 0;
                for (; i < list.length; i++) {
                    list[i].end ? list.splice(i--, 1) : list[i]();
                };
                !list.length && stop();
            },

            // 停止所有定时器队列
            stop = function () {
                clearInterval(intervalId);
                intervalId = null;
            };

        return function (url, ready, load, error) {
            var onready, width, height, newWidth, newHeight,
                img = new Image();

            img.src = url;

            // 如果图片被缓存，则直接返回缓存数据
            if (img.complete) {
                ready.call(img);
                load && load.call(img);
                return;
            };

            width = img.width;
            height = img.height;

            // 加载错误后的事件
            img.onerror = function () {
                error && error.call(img);
                onready.end = true;
                img = img.onload = img.onerror = null;
            };

            // 图片尺寸就绪
            onready = function () {
                newWidth = img.width;
                newHeight = img.height;
                if (newWidth !== width || newHeight !== height ||
                    // 如果图片已经在其他地方加载可使用面积检测
                    newWidth * newHeight > 1024
                ) {
                    ready.call(img);
                    onready.end = true;
                };
            };
            onready();

            // 完全加载完毕的事件
            img.onload = function () {
                // onload在定时器时间差范围内可能比onready快
                // 这里进行检查并保证onready优先执行
                !onready.end && onready();

                load && load.call(img);

                // IE gif动画会循环执行onload，置空onload即可
                img = img.onload = img.onerror = null;
            };

            // 加入队列中定期执行
            if (!onready.end) {
                list.push(onready);
                // 无论何时只允许出现一个定时器，减少浏览器性能损耗
                if (intervalId === null) intervalId = setInterval(tick, 40);
            };
        };
    })(),


    // getAuthInfo: function (callback) {
    //     var parmas = this.urlParse(location.href);
    //     $.ajax({
    //         url: getAuthInfoUrl,
    //         type: 'post',
    //         data: {
    //             code: parmas.code
    //         },
    //         success(res) {
    //             if (res.status == 302) {
    //                 location.href = res.location;
    //             } else if (res.status == 0) {
    //                 window.username = res.data.username;
    //                 callback(res.data);
    //             }
    //         }
    //     })
    // },

    // 全局事件中心
    eventBus: new Vue()
}

