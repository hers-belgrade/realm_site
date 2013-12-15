angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;

    $scope.menu = [{
        "title": "Avatars",
        "link": "avatars"
    }];
    
    $scope.isCollapsed = false;
}]);
