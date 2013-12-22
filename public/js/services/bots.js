angular.module('mean.bots').factory('Bots', ['$resource', function($resource) {
  return $resource('bots/:name', {
    name: '@username'
  }, {
    update: {
      method: 'PUT'
    }
  });
}]);
