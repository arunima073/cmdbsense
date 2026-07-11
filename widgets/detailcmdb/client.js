api.controller=function($scope) {
  var c = this;
	c.rejectMatch = function() {


        if (!c.data.rejectReason) {

            alert("Please enter rejection reason");
            return;

        }


        c.server.get({

            action: "reject",

            match_id: c.data.match.sys_id,

            reason: c.data.rejectReason

        }).then(function(response) {


            alert("Match rejected successfully");


            // redirect back to review queue

            window.location.href =
            "?id=cmdb_review";


        });


    };
	
};
