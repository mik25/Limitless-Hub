(function($){

  var titledbApp = angular.module('titledbApp', ['ngMaterial', 'ngCookies']);
    
  titledbApp.controller('TitleListController', ['$mdToast', '$mdDialog', '$cookieStore', '$scope', '$http', function($mdToast, $mdDialog, $cookieStore, $scope, $http) {

  	$scope.watching = false;
    $scope.show = "";
    $scope.show_name = "";
    $scope.vid_obj = "";

    $scope.watchUrl = function(reinstance, url, show) {

      var rng = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < 10; i++ )
        rng += possible.charAt(Math.floor(Math.random() * possible.length));

      if(reinstance == "false") {
        $scope.show = show;
        $scope.show_name = show.name.split(' ').join('') + "-" + rng;
      }

      $scope.vid_obj = new videojs($scope.show_name);
      
      $scope.vid_obj.ready(function() {
        $scope.vid_obj.src([ { type: "video/mp4", src: url } ]);
        $scope.vid_obj.load();
      	$scope.vid_obj.toggleClass('vjs-hidden', false);
      	angular.element(document.getElementById("1st-divider")).toggleClass('hidden', false);
      });

    }

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

    $http.get('https://raw.githubusercontent.com/initPRAGMA/Quick-Hub-Server/master/movies.json').
    success(function(data, status, headers, config) {

      // Parse the JSON
      $scope.movies = data;

      // Sort the JSON alphabetically
      $scope.movies.sort(function(a, b){
        if(a.name.toUpperCase() < b.name.toUpperCase()) return -1;
        if(a.name.toUpperCase() > b.name.toUpperCase()) return 1;
        return 0;
      });

      // Stringify the JSON and get its Length
      var json = JSON.stringify($scope.movies);

      // Remove double back slashes
      json.replace('\\', '');

      //Create the Titles Scope from the finished JSON
      $scope.movies = JSON.parse(json);

    }).
    error(function(error){

      console.log('Error' + error);

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

})();