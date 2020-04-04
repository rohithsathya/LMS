window.$lms = (function(){
    var $lms = {};
    $lms.setup = function(){
        alert("Set up method is called");
    }
    $lms.updateUserPoints = function(username){
        alert("add points to given user" + username);
    }
    return $lms;

}())