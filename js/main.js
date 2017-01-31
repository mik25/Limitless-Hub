(function($){

  var titledbApp = angular.module('titledbApp', ['ngMaterial', 'ngCookies', 'angular-inview']);
	const settings = require('electron-settings');

  titledbApp.controller('TitleListController', ['$cookieStore', '$scope', '$http', function($cookieStore, $scope, $http) {

    $scope.selectedIndex = 0;
    $scope.movies_newest_page = 1;
    $scope.movies_action_page = 1;
    $scope.movies_adventure_page = 1;
    $scope.movies_animation_page = 1;
    $scope.movies_comedy_page = 1;
    $scope.movies_crime_page = 1;
    $scope.movies_drama_page = 1;
    $scope.movies_family_page = 1;
    $scope.movies_fantasy_page = 1;
    $scope.movies_horror_page = 1;
    $scope.movies_mystery_page = 1;
    $scope.movies_romance_page = 1;
    $scope.movies_scifi_page = 1;
    $scope.tvshows_page = 1;

    $scope.search = function() {
	    var query = document.getElementById("search").value;
    	if($scope.selectedIndex == 0) {
    		alert($scope.selectedMovieTab);
	      $http.get('https://yts.ag/api/v2/list_movies.json?query_term='+query).success(function(data, status, headers, config) {
	        $scope.movies = JSON.parse(JSON.stringify(data));
	      });
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
      });
    };

    $scope.moreMovies = function (actuallyIncrease, category) {
      if (actuallyIncrease) {
        eval("$scope.movies_"+category.toLowerCase()+"_page++;");
        if(category=='newest'){var url='https://yts.ag/api/v2/list_movies.json?limit=50&page='+eval("$scope.movies_"+category.toLowerCase()+"_page")} else
        if(category=='SciFi'){var url='https://yts.ag/api/v2/list_movies.json?limit=50&page='+$scope.movies_scifi_page+'&genre=Sci-Fi'} else {
          var url = 'https://yts.ag/api/v2/list_movies.json?limit=50&page='+eval("$scope.movies_"+category.toLowerCase()+"_page")+'&genre='+category;
        };
        $http.get(url).success(function(data, status, headers, config) {
          var temp = [];
          if(category=='newest'){temp=$scope.movies} else {
            eval("temp = $scope.movies."+category.toLowerCase()+";");
          }
          temp.data.movies = temp.data.movies.concat(data.data.movies);
          eval("$scope.movies."+category.toLowerCase()+" = temp;");
        }).error(function(){console.log("Failed to load Featured Movies!")});
      }
    };

    $scope.favMovie = function(movie){
    	var temp = [];
    	settings.get('favMovies').then(val => {
    		temp = temp.concat(val);
    		temp.push(movie);
    		settings.set('favMovies', temp);
    		$scope.fav = temp;
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

    settings.get('favMovies').then(val => {
	    $scope.fav = val;
	  });

    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50').
    success(function(data, status, headers, config) {
      $scope.movies = data;
      $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Action').success(function(data, status, headers, config) {
	      $scope.movies.action = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Action Movies!")});

	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Adventure').success(function(data, status, headers, config) {
	      $scope.movies.adventure = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Adventure Movies!")});

	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Animation').success(function(data, status, headers, config) {
	      $scope.movies.animation = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Animation Movies!")});

	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Comedy').success(function(data, status, headers, config) {
	      $scope.movies.comedy = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Comedy Movies!")});
	    
	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Crime').success(function(data, status, headers, config) {
	      $scope.movies.crime = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Crime Movies!")});

	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Drama').success(function(data, status, headers, config) {
	      $scope.movies.drama = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Drama Movies!")});

	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Family').success(function(data, status, headers, config) {
	      $scope.movies.family = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Family Movies!")});

	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Fantasy').success(function(data, status, headers, config) {
	      $scope.movies.fantasy = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Fantasy Movies!")});

	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Horror').success(function(data, status, headers, config) {
	      $scope.movies.horror = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Horror Movies!")});

	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Mystery').success(function(data, status, headers, config) {
	      $scope.movies.mystery = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Mystery Movies!")});
	    
	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Romance').success(function(data, status, headers, config) {
	      $scope.movies.romance = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Romance Movies!")});

	    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Sci-Fi').success(function(data, status, headers, config) {
	      $scope.movies.scifi = JSON.parse(JSON.stringify(data));
	    }).error(function(){console.log("Failed to load Sci-Fi Movies!")});
    }).error(function(){console.log("Failed to load Featured Movies!")});

  }]);

  titledbApp.controller('tv-page', ['$scope', '$http', function($scope, $http) {
    
    $scope.moreTVShows = function(actuallyIncrease) {
      if (actuallyIncrease) {
        $scope.tvshows_page++
        $http.get('http://eztvapi.ml/shows/'+$scope.tvshows_page).success(function(data, status, headers, config) {
	    		var temp = [];
        	temp=$scope.shows;
	    		console.dir(temp);
	    		console.dir($scope.shows);
        	temp = temp.concat(data);
        	$scope.shows = temp;
	  		});
      }
    };

  	$http.get('http://eztvapi.ml/shows/1').
  	success(function(data, status, headers, config) {
    	$scope.shows = data;
  	});

  }]);

  titledbApp.controller('anime-page', ['$scope', '$http', function($scope, $http) {

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