angular.module('mean.avatars').controller('AvatarsController',['$scope','$upload','Avatars',function($scope,$upload,Avatars){
  $scope.list = function() {
    Avatars.query(function(avs){
      $scope.avatars = [];
      for(var i in avs){
        $scope.avatars.push(avs[i]);
      }
    });
  };
  $scope.onFileSelect = function(files){
    $scope.upload = $upload.upload({
      url: '/avatars/upload',
      method: 'PUT',
      fileFormDataName: 'avatarfile',
      file: files[0]
    }).progress(function(e){
      console.log('done',e.loaded,'out of',e.total);
    }).success(function(data,status){
      $scope.list();
    });
  };
}]).
directive('selectAvatar',function(){
  return {
    restrict: 'E',
    controller: function ($scope, Avatars) {
      $scope.load = function(){
        Avatars.query(function(avs){
          $scope.avatars = avs;
        });
      }
      $scope.load();
    },
    scope: {
      av_mdel: '=avMdel',
      av_size: '@avSize'
    },
    template: '<select ng-model="av_mdel"><option data-ng-repeat="avatar in avatars">{{avatar.name}}</option></select><img src="/img/avatars/{{av_mdel}}" width="{{av_size}}"/>'
  };
});
