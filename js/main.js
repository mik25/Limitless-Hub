const remote = require('electron').remote;
var WebTorrent = require('webtorrent');

document.addEventListener("keydown", function (e) {
  if (e.which === 123) { remote.getCurrentWindow().toggleDevTools(); }
  if (!e.metaKey) {
    if(e.keyCode >= 65 && event.keyCode <= 90 || e.keyCode >= 48 && event.keyCode <= 57) {
      document.getElementById("search").focus();
    }
  } else {
    if(e.ctrlKey && e.keyCode === 65) {
      document.getElementById("search").focus();
    }
  }
});

(function($){

  var app = angular.module('app', ['ngMaterial', 'angular-inview']);
	const settings = require('electron-settings');

  app.controller('main-ctrl', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.searched = function(selectedIndex){
      if(selectedIndex == 0) { $rootScope.searchedMovies=Math.random(); } else
      if(selectedIndex == 1) { $rootScope.searchedTVShows=Math.random(); }
    }
  }]);

  app.controller('movie-page', ['$scope', '$rootScope', '$http', '$mdToast', '$q', function($scope, $rootScope, $http, $mdToast, $q) {

    // Default Values
    angular.extend($scope,{searching:false,results:true, pages:{Newest:1}, watched:{episodes:[],movies:[]}, movies:{Newest:[],Search:[]}});

    // Movies
    $scope.movie_tabs = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi'];
    $scope.movie_tabs.forEach(function(genre){
      $scope.movies[genre] = [];
      $scope.pages[genre] = 1;
    });

    $scope.lastsearch = "";
    $rootScope.$watch('searchedMovies', function() {
      $scope.searching = true;
      var query = document.getElementById('search').value;
      if(query.length != 0 && ($scope.lastsearch != query)) {
        $scope.lastsearch = query;
        $http.get('https://yts.ag/api/v2/list_movies.json?query_term='+query).then(function(data) {
          $scope.movies["Search"] = data['data']['data']['movies'];
        });
      } else {
        $scope.searching = false;
      }
    });

    // Fetch Movies
    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50').success(function(data) {
      settings.get('favMovies').then(favMovies => {
        $scope.movies["Newest"] = data; // Featured
        $scope.movies["Watchlist"] = favMovies; // Watchlist
      });
      settings.get('watchedMovies').then(watchedMovies => {
        $scope.movies["watched"] = watchedMovies; // Watched
      });
      // Genres
      $q.all($scope.movie_tabs.map(genre=>$http.get('https://yts.ag/api/v2/list_movies.json',{params:{limit:50,genre:genre}}).then(res=>{
        $scope.movies[genre] = res.data;
      }, error => {
        console.log(`Failed to load ${genre} Movies!`)
      })));
    }).error(function(){console.log("Failed to load Movies!")});

    $scope.initiate = function(json) {
      $rootScope.title = json;
      $rootScope.title["cover"] = json.medium_cover_image;
      $rootScope.title["backdrop"] = json.background_image;
      $http.get('https://yts.ag/api/v2/movie_suggestions.json?limit=12&movie_id='+json.id).success(function(data) {
        $rootScope.title["suggestions"] = JSON.parse(JSON.stringify(data));
      });
    };

    $scope.more = function (actuallyIncrease, category) {
      if (actuallyIncrease) {
        $scope.pages[category]++;
        if(category=='Newest'){
          var url = 'https://yts.ag/api/v2/list_movies.json?limit=50&page='+$scope.pages[category];
        } else {
          var url = 'https://yts.ag/api/v2/list_movies.json?limit=50&page='+$scope.pages[category]+'&genre='+category;
        };
        $http.get(url).success(function(data) {
          var temp = [];
          temp = $scope.movies[category];
          if(temp["data"] != undefined) {
            temp["data"]["movies"] = temp["data"]["movies"].concat(data["data"]["movies"]);
          }
          $scope.movies[category] = temp;
        }).error(function(){console.log("Failed to load Featured Movies!")});
      }
    };

    $scope.isFav = function(title) {
      if($scope.movies["Watchlist"] != undefined){return $scope.movies["Watchlist"].some(m => m.title == title)}else{return false}
    }

    $scope.addFav = function(movie){
      var temp = [];
      settings.get('favMovies').then(val => {
        if(val != null) {
          temp = temp.concat(val);
          temp = val.filter((obj) => obj.title !== movie.title);
        }
        temp.push(movie);
        settings.set('favMovies', temp);
        $scope.movies['Watchlist'] = temp;
        $mdToast.show(
          $mdToast.simple()
          .textContent('Added "'+movie.title+'" to watchlist!')
          .position('top right')
          .hideDelay(3000)
        );
      });
    };

    $scope.unFav = function(title){
      var temp = [];
      settings.get('favMovies').then(val => {
        temp = val.filter((obj) => obj.title !== title);
        settings.set('favMovies', temp);
        $scope.movies['Watchlist'] = temp;
        $mdToast.show(
          $mdToast.simple()
          .textContent('Removed "'+title+'" from watchlist!')
          .position('top right')
          .hideDelay(3000)
        );
      });
    };

  }]);

  app.controller('tv-page', ['$scope', '$rootScope', '$http', '$mdToast', function($scope, $rootScope, $http, $mdToast) {

    // Default Values
    angular.extend($scope,{searching:false, results:true, page:{Popular:1,Search:{Current:1,Maximum:37}}, lastsearch:"", shows:{Popular:[],Watchlist:[],Watched:{Episodes:[]},Search:[]}});

    $http.get('http://eztvapi.ml/shows').success(function(data) {$scope.page["Search"]["Maximum"]=data.length;});

    $rootScope.$watch('searchedTVShows', function() {
      $scope.searching = true;
      var query = document.getElementById('search').value;
      if(query.length != 0 && ($scope.lastsearch != query)) {
        console.log('Searching for '+query)
        $scope.lastsearch = query;
        $scope.page["Search"]["Current"] = 1;
        function i() {
          $http.get('http://eztvapi.ml/shows/'+$scope.page["Search"]["Current"]+'?keywords='+encodeURIComponent(query)).then(function successCallback(response) {
            if(response.data.length > 0) {
              $scope.shows["Search"] = response.data;
              $scope.results = true;
            } else if($scope.page["Search"]["Current"] <= $scope.page["Search"]["Maximum"]) {
              console.log('Nothing found for '+query+' in '+$scope.page["Search"]["Current"]+'/37');
              $scope.shows["Search"] = {}; // Make sure theres no cached shows
              i(); // loop
            } else if($scope.page["Search"]["Current"] == $scope.page["Search"]["Maximum"]+1) {
              $scope.results = false;
              console.log('No results');
            }
            $scope.page["Search"]["Current"]++;
          }, function errorCallback(response) {
            console.log('Error! '+response);
          });
        };
        i();
      } else {
        $scope.searching = false;
        $scope.lastsearch = query;
      }
    });

    $http.get('http://eztvapi.ml/shows/1').success(function(data) {
      settings.get('favTVShows').then(favTVShows => {
        $scope.shows["Popular"] = data; // Popular
        $scope.shows["Watchlist"] = favTVShows; // Watchlist
        settings.get('watchedTVShowEpisodes').then(watchedTVShowEpisodes => {
          $scope.shows["Watched"]["Episodes"] = watchedTVShowEpisodes; // Watched
        });
      });
    });

    $scope.initiate = function(json) {
      $rootScope.title = json;
      $rootScope.title["cover"] = json.images.poster;
      $rootScope.title["backdrop"] = json.images.poster;
      var seasons = [];

      $http.get('http://eztvapi.ml/show/'+json.imdb_id).success(function(data1) {
        // Filter and extract up to 40 seasons of data;
        for (let i = 0; i <= 40; i++) { seasons[i] = data1["episodes"].filter((episode) => episode["season"] === i); }
        // Get the Episode Screenshots
        $http.get('http://api.tvmaze.com/lookup/shows?imdb='+json.imdb_id).success(function(data2) {
          $http.get('http://api.tvmaze.com/shows/'+data2["id"]+'/episodes').success(function(data3) {
            for (let i = 0; i <= 40 || function(){$scope.selectedIndex=2}(); i++) {
              var filter = data3.filter((episode) => episode["season"] === i);
              for (let x = 0; x < filter.length || function(){$rootScope.title["seasons"]=seasons}(); x++) {
                var temp = [];
                if(seasons[i][x] != undefined) {
                  temp = JSON.parse(JSON.stringify(seasons[i][x]));
                  if(filter[x]["image"] == null) {
                    var image = {"original": "http://static.tvmaze.com/images/no-img/no-img-landscape-text.png"};
                  } else {
                    var image = filter[x]["image"];
                  };
                  temp["image"] = image;
                  seasons[i][x] = temp;
                }
              }
            }
          });
        });
      });
    };

    $scope.more = function(actuallyIncrease) {
      if (actuallyIncrease) {
        $scope.page["Popular"]++;
        $http.get('http://eztvapi.ml/shows/'+$scope.page["Popular"]).success(function(data) {
          var temp = [];
          temp = $scope.shows["Popular"];
          temp = temp.concat(data);
          $scope.shows["Popular"] = $scope.shows["Popular"].concat(data);
        });
      }
    };

    $scope.isFav = function(title) {
      if($scope.shows["Watchlist"] != undefined){return $scope.shows["Watchlist"].some(s => s.title == title)}else{return false}
    };

    $scope.addFav = function(show){
      var temp = [];
      settings.get('favTVShows').then(val => {
        if(val != null) {
          temp = temp.concat(val);
          temp = val.filter((obj) => obj.slug !== show.slug);
        }
        temp.push(show);
        settings.set('favTVShows', temp);
        $scope.shows["Watchlist"] = temp;
        $mdToast.show(
          $mdToast.simple()
          .textContent('Added "'+show.title+'" to watchlist!')
          .position('top right')
          .hideDelay(3000)
        );
      });
    };

    $scope.unFav = function(title){
      var temp = [];
      settings.get('favTVShows').then(val => {
        temp = val.filter((obj) => obj.title !== title);
        settings.set('favTVShows', temp);
        $scope.shows["Watchlist"] = temp;
        $mdToast.show(
          $mdToast.simple()
            .textContent('Removed "'+title+'" from watchlist!')
            .position('top right')
            .hideDelay(3000)
        );
      });
    };

  }]);

  app.controller('watch-page', ['$scope', '$rootScope', '$http', '$mdToast', function($scope, $rootScope, $http, $mdToast) {
    
    // Default Values
    $scope.title = $rootScope.title;
    $scope.title["cover"] = $rootScope.title["cover"];
    $scope.title["backdrop"] = $rootScope.title["backdrop"];
    $scope.title["suggestions"] = $rootScope.title["suggestions"];
    $scope.title["Watched"] = {Episodes:{}};
    settings.get("watchedTVShowEpisodes").then(watchedTVShowEpisodes => {
      $scope.title["Watched"]["Episodes"] = watchedTVShowEpisodes; // Watched
    });

    $scope.loadMovie = function(title) {
      angular.element(document.getElementById("watchPlayer")).empty();
      var client=new WebTorrent;
      settings.get('config.quality').then(quality => {
        if(quality==undefined){var quality='720p'}else
        if(quality=='High'){
          if(title.torrents.filter((index) => index.quality === "1080p")[0] != undefined){var quality='1080p'}else
          if(title.torrents.filter((index) => index.quality === "720p")[0] != undefined){var quality='720p'}
        }
        if(quality=='Low'){var quality='720p'}
        client.add(title.torrents.filter((index) => index.quality === quality)[0].url,function(a){
          console.log("Client is downloading: " + a.infoHash);
          a.files.forEach(function(a){angular.element(a.appendTo("#watchPlayer"))});
          var markedAsWatched = false;
          document.getElementById("watchPlayer").getElementsByTagName("video")[0].addEventListener('timeupdate',function(event){
            if(((this.currentTime/this.duration) * 100).toFixed(2) >= 80 && markedAsWatched == false) {
              markedAsWatched = true;
              var temp = [];
              settings.get('watchedMovies').then(val => {
                if(val != null) {
                  temp = temp.concat(val);
                  temp = val.filter((obj) => obj !== title.title);
                }
                temp.push(title.title);
                settings.set('watchedMovies', temp);
                $scope.movies.watched = temp;
                $mdToast.show(
                  $mdToast.simple()
                  .textContent('Marked "'+title.title+'" as watched.')
                  .position('top right')
                  .hideDelay(2000)
                );
              });
            }
          });
        });
      });
    };

    $scope.loadTVShow = function(episode) {
      angular.element(document.getElementById("watchPlayer")).empty();
      var client=new WebTorrent;
      client.add(episode.torrents["0"].url,function(a){
        console.log("Client is downloading: " + a.infoHash);
        a.files.forEach(function(a){angular.element(a.appendTo("#watchPlayer"))});
        var markedAsWatched = false;
        document.getElementById("watchPlayer").getElementsByTagName("video")[0].addEventListener('timeupdate',function(event){
          if(((this.currentTime/this.duration) * 100).toFixed(2) >= 80 && markedAsWatched == false) {
            markedAsWatched = true;
            var temp = [];
            settings.get('watchedTVShowEpisodes').then(val => {
              if(val != null) {
                temp = temp.concat(val);
                temp = val.filter((obj) => obj !== episode["tvdb_id"] + "-" + episode["title"]);
              }
              temp.push(episode["tvdb_id"] + "-" + episode["title"]);
              settings.set('watchedTVShowEpisodes', temp);
              $scope.title["Watched"]["Episodes"] = temp;
              $mdToast.show(
                $mdToast.simple()
                .textContent('Marked "'+episode["title"]+'" as watched.')
                .position('top right')
                .hideDelay(2000)
              );
            });
          }
        });
      });
    };

  }]);

  app.controller('config-page', ['$scope', '$http', '$mdToast', function($scope, $http, $mdToast) {

    // Default Values
    angular.extend($scope,{qualityOptions:['High', 'Low']});
    settings.get('config.quality').then(val => {$scope.savedQuality=val})
    
    $scope.changeQuality=function(){settings.set('config',{quality:$scope.chosenQuality});}

  }]);

})();