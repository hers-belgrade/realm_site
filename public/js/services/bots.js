angular.module('mean.bots').factory('Bots', ['$resource', function($resource) {
  return $resource('bots/:username', {
    username: '@username'
  }, {
    update: {
      method: 'POST'
    }
  });
}]);
