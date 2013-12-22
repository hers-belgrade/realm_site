angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;

    $scope.menu = [{
      "title": "Bots",
      "link": "bots"
    },{
        "title": "Avatars",
        "link": "avatars"
    }];
    
    $scope.isCollapsed = false;
}]);
