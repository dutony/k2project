var cgApp = angular.module('cgApp', []);

cgApp.controller('cgController', ['$scope', '$http', function($scope, $http) {
    
    $scope.accountId = '362218778955';
    
    $scope.generateCfnButton = function() {
                
        var myWindow = window.open("./detail.html", "_self");
        myWindow.focus();
                
    }
    
}]);