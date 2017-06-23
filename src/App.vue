<template>
  <div id="app">
    <div class="navBar">
      <div class="bar-left">
        <div class="bar-action">我的图床</div>
        <div class="bar-action">首页</div>
        <div class="bar-action">我的上传</div>
        <div class="bar-action">chrome插件</div>
      </div>
      <div class="bar-right">
        <div class="bar-action">blog</div>
        <div class="bar-action">注册</div>
        <div class="bar-action">登录</div>
        <div class="bar-action">设置</div>
      </div>
      <div></div>
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style rel="stylesheet/css" lang="scss">
body,html{
   margin: 0;
   padding: 0;
   font-size: 14px;
}
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}


#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  .navBar{
    background-color: #000;
    color: #ccc;
    height: 50px;
    font-weight: bold;
    line-height: 50px;
  }

  .bar-action{
    text-align: center;
    cursor: pointer;
    margin: 0 20px;
    &:hover{
      color: #fff;
    }
  }

  .navBar,.bar-left,.bar-right{
    display: flex;
  }

  .bar-left{
    width: 70%;
  }
}
</style>
