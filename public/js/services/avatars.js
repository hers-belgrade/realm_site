angular.module('mean.avatars').factory("Avatars",['$resource',function($resource) {
  return $resource('avatars/:name', {
  }, {
  });
}]);
