window.$lms = (function(){
    var $lms:any = {};
   
    $lms.userName = "Shruthi";
    $lms.points = 0;

    $lms.setup = function(){
        alert("Set up method is called");
    }
    $lms.updateUserPoints = function(howManyPoints){
        $lms.points =  $lms.points  + howManyPoints;
    }
    $lms.getUserPoints = function(){
        return $lms.points;
    }

    return $lms;

}())
