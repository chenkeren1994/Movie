// pages/movies/more-movie/more-movie.js
var app = getApp();
var util = require("../../../utils/util.js");
Page({
  data: {
    movies: {},
    totalCount: 0,
    requestUrl: '',
    navigateTitle: '',
    isEmpty: true
  },
  onLoad: function (options) {
    var category = options.category;
    this.setData({
      navigateTitle: category
    });
    var dataUrl;
    switch(category){
      case '正在热映':
        dataUrl = app.globalData.doubanUrl + '/v2/movie/in_theaters';
        break;
      case '即将上映':
        dataUrl = app.globalData.doubanUrl + '/v2/movie/coming_soon';
        break;
      case '豆瓣Top250':
        dataUrl = app.globalData.doubanUrl + '/v2/movie/top250';
        break;
    }
    this.setData({
      requestUrl: dataUrl
    });
    util.http(dataUrl, this.processDoubanData);
  },
  // onScrollLower: function(event){
  //   var nextUrl = `${this.data.requestUrl}?start=${this.data.totalCount}&count=20`;
  //   util.http(nextUrl, this.processDoubanData);
  //   wx.showNavigationBarLoading();
  // },
  onReachBottom: function (event) {
    var nextUrl = this.data.requestUrl +
      "?start=" + this.data.totalCount + "&count=20";
    util.http(nextUrl, this.processDoubanData)
    wx.showNavigationBarLoading()
  },
  onPullDownRefresh: function(event){
    var refreshUrl = `${this.data.requestUrl}?start=0&count=20`;
    this.setData({
      movies: {},
      isEmpty: true,
      totalCount: 0
    });
    util.http(refreshUrl, this.processDoubanData);
    wx.showNavigationBarLoading()
  },
  processDoubanData: function (moviesDouban){
    var movies = [];
    for (var idx in moviesDouban.subjects) {
      var subject = moviesDouban.subjects[idx];
      var title = subject.title;
      if (title.length >= 6) {
        title = title.substring(0, 6) + '...';
      }
      var temp = {
        stars: util.convertToStarsArray(subject.rating.stars),
        title: title,
        average: subject.rating.average,
        coverageUrl: subject.images.large,
        movieId: subject.id
      }
      movies.push(temp);
    }
    var totalMovies = {};
    var totalCount = this.data.totalCount + 20;
    if(!this.data.isEmpty){
      totalMovies = this.data.movies.concat(movies);
    } else {
      totalMovies = movies;
      this.setData({
        isEmpty: false
      })
    }
    this.setData({
      movies: totalMovies,
      totalCount: totalCount
    })
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  onReady: function (event){
    wx.setNavigationBarTitle({
      title: this.data.navigateTitle,
    })
  },
  onMovieTap: function (event) {
    var movieId = event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: '../movie-detail/movie-detail?id=' + movieId
    })
  }
})