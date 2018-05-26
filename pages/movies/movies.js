var util = require("../../utils/util.js");
var app = getApp();
Page({
  data: {
    inTheaters: {},
    commingSoon: {},
    top250: {},
    searchResult: {},
    containerShow: true,
    searchPanelShow: false
  },
  onLoad: function(event){
    var inTheatersUrl = app.globalData.doubanUrl + '/v2/movie/in_theaters' + '?start=0&count=3';
    var commingSoonUrl = app.globalData.doubanUrl + '/v2/movie/coming_soon' + '?start=0&count=3';
    var top250Url = app.globalData.doubanUrl + '/v2/movie/top250' + '?start=0&count=3';
    this.getMovieListData(inTheatersUrl, "inTheaters", "正在热映");
    this.getMovieListData(commingSoonUrl, "commingSoon", "即将上映");
    this.getMovieListData(top250Url, "top250", "豆瓣Top250");
  },
  getMovieListData: function (url, settedKey, categoryTitle){
    var _this = this;
    wx.request({
      url: url,
      method: 'GET',
      header: {
        "Content-Type": 'json'
      },
      success: function(res){
        _this.processDoubanData(res.data, settedKey, categoryTitle);
      },
      fail: function(){
        console.log('failed');
      }
    })
  },
  
  processDoubanData: function (moviesDouban, settedKey, categoryTitle){
    var movies = [];
    for (var idx in moviesDouban.subjects){
      var subject = moviesDouban.subjects[idx];
      var title = subject.title;
      if(title.length >= 6){
        title = title.substring(0,6)+'...';
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
    var readyData = {};
    readyData[settedKey] = {
      categoryTitle: categoryTitle,
      movies: movies
    };
    this.setData(readyData)
  },
  onMoreTap: function(event){
    var category = event.currentTarget.dataset.category;
    wx.navigateTo({
      url: 'more-movie/more-movie?category=' + category,
    })
  },
  onBindFocus: function(event){
    this.setData({
      containerShow: false,
      searchPanelShow: true
    })
  },
  onCancelImageTap: function(event){
    this.setData({
      containerShow: true,
      searchPanelShow: false,
      searchResult: {}
    })
  },
  onBindChange: function(event){
    var text = event.detail.value;
    var searchUrl = `${app.globalData.doubanUrl}/v2/movie/search?q=${text}`;
    this.getMovieListData(searchUrl, "searchResult", "")
  },
  onMovieTap: function(event){
    var movieId = event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: `movie-detail/movie-detail?id=${movieId}`,
    })
  }
})