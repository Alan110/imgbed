<template>
  <div class="page-upload">
    <div class="upload-wrapper">

      <div class="upload">
        <div class="">
          <img :src="icon_url" width="38px">
        </div>
        <div class="upload-tip">截图后粘贴、拖拽图片到这里上传</div>
        <div class="upload-tip2">或者</div>
        <div class="upload-btn-wrapper" style="">
          <div class="btn upload-btn">点击选择文件</div>
          <upload 
            :server="upload_url" 
            :formData="formData"
            @success="success"
            class="upload-file"></upload>
        </div>
      </div>

      <div class="imgList">
          <div :style="{'backgroundImage':'url(' + img.url  + ')'}" class="img-item" v-for="(img,index) in imgList" :key="index" >
            <div class="img-url">
                <input type="text" class="input-url" ref="url_input" :value="img.url" />
                <div class="btn copy-button" @click="copy(index)">复制</div>
            </div>
          </div>
      </div>

    </div>
  </div>
</template>

<script>
import upload_icon from '@/assets/upload_icon.png'
import Upload from './upload/uploador'
import config from '@/common/config.js'
import axios from 'axios'

export default {
  name: 'hello',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
      icon_url: upload_icon,
      formData: {},
      imgList :[],
      upload_url: 'http://upload.qiniu.com/'
    }
  },
  components: {
    Upload
  },

  methods:{
    success (res){
      let img = {
         url : config.url_prefix + res.key
      };
      this.imgList.push(img);

      // 滚动到底部
      setTimeout(function() {
          document.body.scrollTop = document.body.scrollHeight;
      }, 30);
    },

    copy(index){
        let input = this.$refs.url_input[index];
        input.focus();
        input.select();
        document.execCommand('copy', false, null);
    }
  },

  mounted() {
    axios.get(config.getUpTokenUrl)
    .then((res) => {
      console.log(res);
      let data = res.data;
      if (data.status == 0) {
        this.formData.token = data.uptoken;
      }
    }).catch(function (error) {
      console.log(error);
    });
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.page-upload{
    padding: 100px 0;
}
.upload-wrapper {
  width: 600px;
  min-height: 338px;
  margin: 0 auto;
}

.upload {
  text-align: center;
  padding: 80px 0;
  background-color: #f9f9f9;
  margin-bottom: 20px;
}

.upload-tip {
  font-size: 28px;
  color: #777777;
}

.upload-tip2 {
  color: #c3c3c3;
  margin-top: 10px;
}

.upload-btn {
  margin-top: 20px;
}

.btn{
  border-radius: 3px;
  background-color: #5cb85c;
  color: #fff;
  width: 126px;
  height: 38px;
  cursor: pointer;
  font-weight: bold;
  text-align: center;
  font-size: 14px;
  line-height: 38px;

  &:hover {
    background-color: #449d44;
  }
}

.label{
    margin : 0 10px;
    text-align: center;
}


.upload-file {
  cursor: pointer;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.imgList{
    .img-item{
        margin-bottom: 20px;
        width: 100%;
        height: 300px;
        background-size: cover;
        position: relative;
        box-shadow: -1px 0 10px rgba(0, 0, 0, 0.5);
    }
    .input-url{
        flex : 1;
        margin-right: 10px;
        outline: none;
        padding: 0 10px;
        border: none;
    }
    .img-url{
        position: absolute;
        bottom: 0;
        background-color: #fff;
        height: 38px;
        line-height: 38px;
        width : 100%;
        display: flex;
    }
    .copy-button{
        width :100px;
    }
}

.upload-btn-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}
</style>
