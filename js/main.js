(function($){

  var titledbApp = angular.module('titledbApp', ['ngMaterial', 'ngCookies']);

  titledbApp.controller('TitleListController', ['$mdToast', '$mdDialog', '$cookieStore', '$scope', '$http', function($mdToast, $mdDialog, $cookieStore, $scope, $http) {

  	$scope.watching = false;
    $scope.movies = "";
    $scope.movies.suggestions = "";
    $scope.movies.action = "";
    $scope.movies.comedy = "";
    $scope.show = "";
    $scope.show_name = "";
    $scope.backdrop = "";
    $scope.poster = "";

    $scope.functiontofindIndexByKeyValue = function(arraytosearch, key, valuetosearch) {
      for (var i = 0; i < arraytosearch.length; i++) {
        if (arraytosearch[i][key] == valuetosearch) { return i; }
      }
      return null;
    }

    $scope.initShow = function(show) {

      var rng = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for( var i=0; i < 10; i++ )
        rng += possible.charAt(Math.floor(Math.random() * possible.length));

      $scope.show = show;
      if(show.name) {
        $scope.show_name = show.name.split(' ').join('').split(' ').join('') + "-" + rng;
        $scope.poster = show.poster;
        $scope.backdrop = show.backdrop;
      } else {
        $scope.show_name = show.title_english.split(' ').join('').split(' ').join('') + "-" + rng;
        $scope.poster = show.large_cover_image;
        $scope.backdrop = show.background_image_original;
        $scope.show_id = show.id;
      };

      $http.get('https://yts.ag/api/v2/movie_suggestions.json?limit=12&movie_id='+$scope.show_id).
      success(function(data, status, headers, config) {
        $scope.movies.suggestions = JSON.parse(JSON.stringify(data));
      });

    };

    $scope.loadMovie = function(json) {
      var js = 'var client=new WebTorrent;client.add(\"'+json.torrents[0].url.replace('\\', '')+'\",function(a){console.log("Client is downloading:",a.infoHash),a.files.forEach(function(a){a.appendTo("#watchPlayer")})});';
      angular.element(document.getElementById('createPlayer')).append(js);
    };

    $scope.loadShow = function(json) {
      $scope.src_array = [
        {
          src: json._480p,
          type: json.type,
          label: '480p',
        res: 480
        },
        {
          src: json._720p,
          type: json.type,
          label: '720p',
        res: 720
        },
        {
          src: json._1080p,
          type: json.type,
          label: '1080p',
        res: 1080
        }
      ];
      if(!json._480p) { $scope.src_array.splice($scope.functiontofindIndexByKeyValue($scope.src_array, 'label', '480p'), 1) };
      if(!json._720p) { $scope.src_array.splice($scope.functiontofindIndexByKeyValue($scope.src_array, 'label', '720p'), 1) };
      if(!json._1080p) { $scope.src_array.splice($scope.functiontofindIndexByKeyValue($scope.src_array, 'label', '1080p'), 1) };
      var player = document.getElementById('player');
      player.src=json._720p;
      player.load();
    };

    $scope.selectedtab = 0;

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

    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50').
    success(function(data, status, headers, config) {
      $scope.movies = JSON.parse(JSON.stringify(data));
    });

    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Action').
    success(function(data, status, headers, config) {
      $scope.movies.action = JSON.parse(JSON.stringify(data));
    });

    $http.get('https://yts.ag/api/v2/list_movies.json?limit=50&genre=Comedy').
    success(function(data, status, headers, config) {
      $scope.movies.comedy = JSON.parse(JSON.stringify(data));
    });

  }]);

  titledbApp.controller('Dropdown', ['$scope', function($scope) {

    this.openMenu = function($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };

  }]);

  titledbApp.controller('tv-page', ['$scope', '$http', function($scope, $http) {

    $http.get('https://raw.githubusercontent.com/initPRAGMA/Quick-Hub-Server/master/tv.json').
    success(function(data, status, headers, config) {

      // Parse the JSON
      $scope.shows = data;

      // Sort the JSON alphabetically
      $scope.shows.sort(function(a, b){
        if(a.name.toUpperCase() < b.name.toUpperCase()) return -1;
        if(a.name.toUpperCase() > b.name.toUpperCase()) return 1;
        return 0;
      });

      // Stringify the JSON and get its Length
      var json = JSON.stringify($scope.shows);

      // Remove double back slashes
      json.replace('\\', '');

      //Create the Titles Scope from the finished JSON
      $scope.shows = JSON.parse(json);

    }).
    error(function(error){

      console.log('Error' + error);

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