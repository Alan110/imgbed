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
          <div class="upload-btn">点击选择文件</div>
          <upload 
            :server="upload_url" 
            :formData="formData"
            @success="success"
            class="upload-file"></upload>
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
      upload_url: 'http://upload.qiniu.com/'
    }
  },
  components: {
    Upload
  },

  methods:{
    success (res){
      console.log(config.url_prefix + res.key);
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
.upload-wrapper {
  width: 50%;
  background-color: #f9f9f9;
  height: 338px;
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -100px);
}

.upload {
  text-align: center;
  padding: 80px 0;
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
  border-radius: 3px;
  margin-top: 20px;
  background-color: #5cb85c;
  color: #fff;
  width: 126px;
  height: 38px;
  font-weight: bold;
  font-size: 14px;
  line-height: 38px;

  &:hover {
    background-color: #449d44;
  }
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

.upload-btn-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}
</style>
