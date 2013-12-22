angular.module('mean.bots').controller('BotsController', ['$scope', 'Bots', function($scope,Bots) {
  $scope.list = function(){
    Bots.query(function(bots){
      $scope.bots = bots;
    });
  };
  $scope.load = function(name){
    Bots.get({name:name},function(bot){
      $scope.bot = bot;
    });
  };
  $scope.save = function(){
    var bot = new Bots(this.bot);
    bot.$save(function(response){
      console.log(response);
      $scope.list();
    });
  };
  $scope.set = function(b){
    $scope.bot = b;
  };
}]);
