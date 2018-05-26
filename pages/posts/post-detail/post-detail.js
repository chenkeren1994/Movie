var postsData = require('../../../data/posts-data.js')
var app = getApp();
Page({
  data:{
    isPlayingMusic: false
  },
  onLoad: function(option){
    var globalData = app.globalData;
    var postId = option.id;
    var postData = postsData.postList[postId];
    this.setData({
      post_detail: postData,
      currentPostId: postId
    })
    var postsCollected = wx.getStorageSync('posts_collected')
    if(postsCollected){
      var postCollected = postsCollected[postId];
      if(postCollected){
        this.setData({
          collected: postCollected
        })
      }
    }else{
      var postsCollected = {};
      postsCollected[postId] = false;
      wx.setStorageSync('posts_collected', postsCollected)
    }
    if (app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicPostId === postId){
      this.setData({
        isPlayingMusic: true
      })
    }
    this.setAudioMonitor();
  },
  setAudioMonitor: function(){
    wx.onBackgroundAudioPlay(() => {
      this.setData({
        isPlayingMusic: true
      })
      app.globalData.g_isPlayingMusic = true;
      app.globalData.g_currentMusicPostId = this.data.currentPostId;
    })
    wx.onBackgroundAudioPause(() => {
      this.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
      app.globalData.currentPostId = null;
    })
    wx.onBackgroundAudioStop(() => {
      this.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
      app.globalData.currentPostId = null;
    })
  },
  onCollectionTap: function(event){
    var postsCollected = wx.getStorageSync('posts_collected');
    var postCollected = postsCollected[this.data.currentPostId];
    postCollected = !postCollected;
    postsCollected[this.data.currentPostId] = postCollected;
    this.showToast(postsCollected, postCollected);
  },
  showToast: function (postsCollected, postCollected){
    wx.setStorageSync('posts_collected', postsCollected);
    this.setData({
      collected: postCollected
    })
    wx.showToast({
      title: postCollected ? '收藏成功' : '取消收藏',
      duration: 1000
    })
  },
  onShareTap: function(event){
    var itemList = [
      "分享给微信好友",
      "分享到朋友圈",
      "分享到QQ",
      "分享到微博"
    ]
    wx.showActionSheet({
      itemList: itemList,
      itemColor: '#405f80',
      success: function(res){
        wx.showModal({
          title: `用户${itemList[res.tapIndex]}`,
          content: '还没有实现分享功能！',
        })
      }
    })
  },
  onMusicTab: function(event){
    var currentPostId = this.data.currentPostId;
    var postData = postsData.postList[currentPostId];
    var isPlayingMusic = this.data.isPlayingMusic;
    if(isPlayingMusic){
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic: false
      })
    } else{
      wx.playBackgroundAudio({
        dataUrl: postData.music.url,
        title: postData.music.title,
        coverImgUrl: postData.music.coverImg
      })
      this.setData({
        isPlayingMusic: true
      })
    }
  }
})