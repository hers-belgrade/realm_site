/*
angular.module('mean.ui').directive('spinner',function(){
  return {
    restrict: 'E',
    link: function(scope,elem,attrs){
      var d = $('<div>');
      d.css({width:'100%',height:'100%'});
      elem.append(d);
      var spinner = new Spinner({
        lines: 13, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#aaa', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'hers-spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
        }).spin(d[0]);
    }
  }
});
*/

angular.module('mean.ui').directive('sparkline',function(){
  return {
    restrict: 'E',
    link: function(scope,elem,attrs){
      var clr = (window.getComputedStyle(elem[0])).color;
      scope.$watch(attrs.ngModel,function(val){
        elem.sparkline(val,{barColor:clr,chartRangeMin:attrs.min,type:attrs.type});
      },true);
    }
  };
});

angular.module('mean.ui').directive('trend',function(){
  return {
    restrict: 'E',
    link: function(scope,elem,attrs){
      var upgood=(attrs.good !== 'down');
      var lastval;
      scope.$watch(attrs.ngModel,function(val){
        if(typeof lastval !== 'undefined'){
          if(val > lastval){
            elem.addClass('stat-up');
            elem.removeClass('stat-down');
            if(upgood){
              elem.addClass('stat-green');
              elem.removeClass('stat-red');
            }else{
              elem.addClass('stat-red');
              elem.removeClass('stat-green');
            }
          }else if(val < lastval){
            elem.addClass('stat-down');
            elem.removeClass('stat-up');
            if(upgood){
              elem.addClass('stat-red');
              elem.removeClass('stat-green');
            }else{
              elem.addClass('stat-green');
              elem.removeClass('stat-red');
            }
          }else{
            elem.removeClass('stat-down');
            elem.removeClass('stat-up');
          }
          elem[0].innerHTML = ~~((val-lastval)/val*100)+'%';
          //console.log(elem,'trend',elem.innerHTML,val,lastval);
        }
        lastval = val;
      },true);
    }
  };
});

angular.module('mean.ui').directive('age',function(){
  return {
    restrict: 'E',
    replace:true,
    controller: function ($scope) {
      $scope.calc = function () {
        if(!(this.t instanceof Date)){
          this.t = new Date(this.t);
        }
        var diff = (new Date())-this.t;
        diff = ~~(diff/1000);
        if(diff<5){
          this.klass = 'red';
          diff = 'now';
        }else if(diff<60){
          this.klass = 'green';
          diff = diff+' secs';
        }else if(diff<60*60){
          this.klass = 'green';
          diff = ~~(diff/60);
          diff = diff+' mins';
        }else if(diff<60*60*24){
          diff = ~~(diff/60/60);
          diff = diff+' hours';
        }else{
          diff = ~~(diff/60/60/24);
          diff = diff+' days';
        }
        return diff;
      }
    },
    template:'<span class={{klass}}>{{calc()}}</span>',
    scope: {
      t : '=date'
    },
  
  };
});
