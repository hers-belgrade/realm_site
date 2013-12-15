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
    console.log(files[0]);
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
}]);
