api.controller=function($scope, $location) {
  
  var c = this;
	c.openDetail = function(sysId) {

        window.location.href =
            "?id=cmdb_review_detail&sys_id=" + sysId;

    };
};
