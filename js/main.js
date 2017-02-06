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

  var app = angular.module('app', ['ngMaterial', 'ngCookies', 'angular-inview']);
	const settings = require('electron-settings');

  app.controller('TitleListController', ['$cookieStore', '$scope', '$http', '$mdToast', '$q', function($cookieStore, $scope, $http, $mdToast, $q) {

    // Default Values
    angular.extend($scope,{selectedIndex:0, searching:false, results:true, pages:{Newest:1}, movies:{Newest:{},Search:{}}});

    // Movies
    $scope.movie_tabs = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi'];
    $scope.movie_tabs.forEach(function(genre){
      $scope.movies[genre] = {};
      $scope.pages[genre] = 1;
    });

    $scope.search = function(clear) {
      $scope.searching = true;
      var query = document.getElementById("search").value;
      if($scope.selectedIndex == 0) {
        if(query.length == 0) {
          $scope.searching = false;
        } else if(query.length > 3) {
          $http.get('https://yts.ag/api/v2/list_movies.json?query_term='+query).success(function(data, status, headers, config) {
            $scope.movies["Search"] = data;
            if(data.data.movies == undefined){$scope.results = false;} else {$scope.results = true;}
          });
        }
      };
    };

    $scope.initMovie = function(movie) {
      $scope.show = movie;
      $scope.poster = movie.medium_cover_image;
      $scope.backdrop = movie.background_image_original;
      $scope.show_id = movie.id;

      $http.get('https://yts.ag/api/v2/movie_suggestions.json?limit=12&movie_id='+$scope.show_id).
      success(function(data, status, headers, config) {
        $scope.movies.suggestions = JSON.parse(JSON.stringify(data));
      });
      $scope.selectedIndex=3;
    };

    $scope.loadMovie = function(movie) {
      angular.element(document.getElementById("watchPlayer")).empty();
      var client=new WebTorrent;
      client.add(movie.torrents[0].url,function(a){
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
                temp = val.filter((obj) => obj !== movie.title);
              }
              temp.push(movie.title);
              settings.set('watchedMovies', temp);
              $scope.movies.watched = temp;
              $mdToast.show(
                $mdToast.simple()
                .textContent('Marked "'+movie.title+'" as watched.')
                .position('top right')
                .hideDelay(2000)
              );
            });
          }
        });
      });
    };

    $scope.moreMovies = function (actuallyIncrease, category) {
      if (actuallyIncrease) {
        $scope.pages[category]++;
        if(category=='Newest'){
          var url = 'https://yts.ag/api/v2/list_movies.json?limit=50&page='+$scope.pages[category];
        } else {
          var url = 'https://yts.ag/api/v2/list_movies.json?limit=50&page='+$scope.pages[category]+'&genre='+category;
        };
        $http.get(url).success(function(data, status, headers, config) {
          var temp = {};
          temp = $scope.movies[category];
          temp["data"]["movies"] = temp["data"]["movies"].concat(data["data"]["movies"]);
          $scope.movies[category] = temp;
        }).error(function(){console.log("Failed to load Featured Movies!")});
      }
    };

    $scope.inFavs = function(title) {
      return $scope.movies["Watchlist"].some(m => m.title == title)
    }

    $scope.fav = function(movie){
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

    $scope.unfav = function(title){
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

  	$scope.initTVShow = function(show) {
      $scope.show = show;
      $scope.poster = show.images.poster;
      $scope.backdrop = show.images.poster;
      $scope.seasons = [];

      $http.get('http://eztvapi.ml/show/'+show.imdb_id).
	  	success(function(data, status, headers, config) {
	    	for (let i = 0; i < 51 || function(){$scope.selectedIndex=3}(); i++) {
          $scope.seasons[i] = data.episodes.filter((episode) => episode.season === i);
        }
	  	});
    };

    $scope.loadTVShow = function(episode) {
      angular.element(document.getElementById("watchPlayer")).empty();
      var client=new WebTorrent;
      client.add(episode.torrents["480p"].url,function(a){
        console.log("Client is downloading: " + a.infoHash);
        a.files.forEach(function(a){angular.element(a.appendTo("#watchPlayer"))});
      });
    };

    $scope.settings={eur:'',usa:'',leak:''};
    if($cookieStore.get('eur') != undefined) { $scope.settings.eur = $cookieStore.get('eur'); }
    if($cookieStore.get('usa') != undefined) { $scope.settings.usa = $cookieStore.get('usa'); }
    if($cookieStore.get('leak') != undefined) { $scope.settings.leak = $cookieStore.get('leak'); }

    $scope.changeSetting = function(ev) {
      //alert('EUR: ' + $scope.settings.eur + '| USA: ' + $scope.settings.usa + '| Leak: ' + $scope.settings.leak);
      $cookieStore.put('eur', $scope.settings.eur);
      $cookieStore.put('usa', $scope.settings.usa);
      $cookieStore.put('leak', $scope.settings.leak);
    };

    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50').success(function(data, status, headers, config) {

      settings.get('favMovies').then(val => {
        $scope.movies["Newest"] = data; //Featured
        $scope.movies["Watchlist"] = val; //Watchlist
      });
      settings.get('watchedMovies').then(val => {
        $scope.movies.watched = val; //Watched
      });

      $q.all($scope.movie_tabs.map(genre=>$http.get('https://yts.ag/api/v2/list_movies.json',{params:{limit:50,genre:genre}}).then(res=>{
        $scope.movies[genre] = res.data;
      }, error => {
        console.log(`Failed to load ${genre} Movies!`)
      })));

    }).error(function(){console.log("Failed to load Movies!")});

  }]);

  app.controller('tv-page', ['$scope', '$http', '$mdToast', function($scope, $http, $mdToast) {

    // Default Values
    angular.extend($scope,{shows:{}});
    $scope.pages['shows'] = 1;

    $scope.inFavs = function(title) {
      return $scope.shows_fav.some(s => s.title == title)
    };

    $scope.moreTVShows = function(actuallyIncrease) {
      if (actuallyIncrease) {
        $scope.pages['shows']++;
        $http.get('http://eztvapi.ml/shows/'+$scope.pages['shows']).success(function(data, status, headers, config) {
	    		var temp = [];
        	temp = $scope.shows;
        	temp = temp.concat(data);
        	$scope.shows = $scope.shows.concat(data);
	  		});
      }
    };

    $scope.fav = function(show){
    	console.dir(show);
    	var temp = [];
    	settings.get('favTVShows').then(val => {
    		if(val != null) {
	    		temp = temp.concat(val);
        		temp = val.filter((obj) => obj.slug !== show.slug);
    		}
    		temp.push(show);
    		settings.set('favTVShows', temp);
    		$scope.shows_fav = temp;
    		$mdToast.show(
		      $mdToast.simple()
		        .textContent('Added "'+show.title+'" to watchlist!')
		        .position('top right')
		        .hideDelay(3000)
		    );
		  });
    };

    $scope.unfav = function(title){
    	var temp = [];
    	settings.get('favTVShows').then(val => {
    		temp = val.filter((obj) => obj.title !== title);
    		settings.set('favTVShows', temp);
    		$scope.shows_fav = temp;
    		$mdToast.show(
		      $mdToast.simple()
		        .textContent('Removed "'+title+'" from watchlist!')
		        .position('top right')
		        .hideDelay(3000)
		    );
		  });
    };

  	$http.get('http://eztvapi.ml/shows/1').
  	success(function(data, status, headers, config) {
	    settings.get('favTVShows').then(val => {
		    $scope.shows_fav = val;
        $scope.shows = data;
		  });
  	});

  }]);

  app.controller('anime-page', ['$scope', '$http', function($scope, $http) {

    $http.get('https://raw.githubusercontent.com/initPRAGMA/Quick-Hub-Server/master/anime.json').
    success(function(data, status, headers, config) {

      // Parse the JSON
      $scope.anime = data;

      // Sort the JSON alphabetically
      $scope.anime.sort(function(a, b){
        if(a.name.toUpperCase() < b.name.toUpperCase()) return -1;
        if(a.name.toUpperCase() > b.name.toUpperCase()) return 1;
        return 0;
      });

      // Stringify the JSON and get its Length
      var json = JSON.stringify($scope.anime);

      // Remove double back slashes
      json.replace('\\', '');

      //Create the Titles Scope from the finished JSON
      $scope.anime = JSON.parse(json);

    }).
    error(function(error){

      console.log('Error' + error);

    });

  }]);

})();