<template>
    <form ref="fileuploadForm">
        <input type="file" id="webupload" style="width:100%;height:100%;cursor:pointer;" @click="clear" ref="fileupload" @change="loadFile" :accept="accept">{{nowPercent}}
    </form>
</template>

<script>

import temp from  './ImageClipboard'
//import utils from './utils'

/**
 * 
 * @success
 * @checkFaild
 * @error
 * @beforeUpload
 */
export default {
    props: {
        accept: {
            type: String,
            default: 'image/gif, image/jpeg, image/png'
        },

        percent: {
            type: Number,
            default: 0
        },

        compress: {
            type: Object,
            default: function () {
                return {
                    'png': {
                        quality: 90,
                        width: 70,
                        size: 1024 * 1024 * 0.4
                    },
                    'jpg': {
                        quality: 95,
                        width: 100,
                        size: 1024 * 1024 * 0.3
                    },
                    'jpeg': {
                        quality: 80,
                        width: 100,
                        size: 1024 * 1024 * 0.3
                    }

                }
            }
        },

        clipbloard: {
            type: Boolean,
            default: false
        },

        formData: {
            type: Object
        },

        // 上传地址
        server: {
            type: String
        },

        // 分片的大小
        chunkSize: {
            type: Number,
            default: 1.5 * 1024 * 1024
        },

        // 各文件类型的大小限制
        sizeLimit: {
            type: Object,
            default: function () {
                return {
                    'mp3': 1.9 * 1024 * 1024,
                    'gif': 1 * 1024 * 1024
                }
            }
        }
    },

    //********************************************************************

    computed: {
        nowPercent() {
            return this.percent.toFixed(2) + '%';
        }
    },

    methods: {

        /**
         * 清空input的file，高级浏览器可以直接清空
         * form.reset方法可以重置所有的input
         */
        clear() {
            let f = this.$refs.fileuploadForm;
            if (!f) return;
            f.reset();
        },

        /**
         * 读取文件
         */
        loadFile(e) {
            let self = this;
            // 获取文件列表
            let file = event.target.files[0]
            if (!file) {
                return;
            }

            // 类型校验
            if (!file.type || this.accept.indexOf(file.type) == -1) {
                this.$emit('checkFaild', {
                    type: 'fileTypeWrong',
                    accept: this.accept,
                    fileType: file.type
                });
                return;
            }

            // 判断文件类型
            let type = file.type.split('/')[1];

            // 图片,且大于300k,走压缩逻辑,png 转 jpeg，压缩率更高
            let realType = 'jpg';
            if (['jpg', 'jpeg', 'png'].indexOf(type) > -1 && file.size > this.compress[realType].size) {
                // 读取图片到base64
                let img = document.createElement("img");
                let reader = new FileReader();
                reader.onload = () => {
                    img.src = reader.result

                    img.onload = () => {
                        // 压缩图片
                        let compressData = this.compressIMG(img, this.compress[realType].quality, realType, this.compress[realType].width)
                        let imgFile = this.getBolbFile(compressData, realType, file.name.split('.')[0] + '.' + realType);

                        // 文件上传
                        this.uploadFile(imgFile);
                    }

                };
                reader.readAsDataURL(file);
            } else if (['mp4', 'mp3'].indexOf(type) > -1 && file.size > 1024 * 1024 * 2) {
                this.chunkUploadFile(file);
            } else {
                // 大小限制
                let limitsize = this.sizeLimit[type] || 1024 * 1024 * 1.9;
                if (file.size < limitsize) {
                    this.uploadFile(file);
                } else {
                    this.$emit('checkFaild', {
                        type: 'sizeLimitFailed',
                        fileType: file.type,
                        sizeLimit: limitsize / 1024 / 1024,
                        size: file.size
                    });
                    return;
                }
            }

        },

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
                xhr.onreadystatechange = function () {
                    if (xhr.status == 200 && xhr.readyState == 4) {
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
                xhr.onerror = function (err) {
                    reject(err);
                }
            });
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
         * base64转file对象
         */
        getBolbFile(base64, type, fileName) {
            var base64ImageContent = base64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
            var blob = this.base64ToBlob(base64ImageContent, type);
            if(fileName){
                return new File([blob], fileName); // 添加文件名
            }else{
                return blob;
            }
        },

        /**
         * 分片上传
         * 递归上传切割出来的分片
         * 注意上传的额外formData，告诉server如何合并文件
         */
        chunkUploadFile(file) {

            let chunkUpload = () => {

                curChunkIndex += 1;
                let start = curChunkIndex * this.chunkSize;  // 切割数据
                let end = Math.min(file.size, start + this.chunkSize);

                // 准备formData
                var formData = new FormData();
                let chunkFile = file.slice(start, end);
                chunkFile = new File([chunkFile], file.name);
                chunkFile.filename = file.name;
                formData.append('file', chunkFile);
                formData.append('size', chunkFile.size);
                formData.append('lastModifiedDate', file.lastModifiedDate);
                formData.append('name', file.name);
                formData.append('chunks', chunkCount);
                formData.append('type', file.type);
                formData.append('chunk', curChunkIndex);
                formData.append('id', 'WU_FILE_0');  // 这个名字是固定，估计是server用来合并文件
                for (var prop in this.formData) {
                    formData.append(prop, this.formData[prop]);
                }

                // 开始上传
                this.ajax({
                    url: this.server,
                    data: formData,
                }).then((res) => {
                    if (curChunkIndex + 1 < chunkCount) {
                        chunkUpload();
                    } else {
                        self.$emit('success', res);
                    }
                }, (e) => {
                    self.$emit('error', e);
                })
            }

            // 上传之前
            this.$emit('beforeUpload', file);
            let self = this;
            let chunkCount = Math.ceil(file.size / this.chunkSize);
            let curChunkIndex = -1;

            chunkUpload();

        },


        /**
         * 普通上传, 比如图片,音频, < 2m
         */
        uploadFile(file) {

            // 上传之前
            this.$emit('beforeUpload', file);
            let self = this;

            // 准备formData
            var formData = new FormData();
            formData.append('file', file);
            for (var prop in this.formData) {
                formData.append(prop, this.formData[prop]);
            }

            // 开始上传
            this.ajax({
                url: this.server,
                data: formData,
            }).then((res) => {
                self.clear();
                self.$emit('success', res);
            }, (e) => {
                self.$emit('error', e);
            })

        },

    },

    mounted() {

        var clipboard = new ImageClipboard();
        let self = this;

        clipboard.onpaste = function (base64) {
            //do stuff with the pasted image
            self.uploadFile(self.getBolbFile(base64));
        };

    }
}

</script>

