api.controller=function($scope) {

    var c = this;



    // -------------------------
    // Reject
    // -------------------------

    c.rejectMatch = function(){


        if(!c.data.actionReason){


            alert("Reason is mandatory");

            return;

        }



        c.server.get({

            action:"reject",

            match_id:c.data.match.sys_id,

            reason:c.data.actionReason


        }).then(function(response){



            alert(
                "Match rejected successfully"
            );


            window.location.href =
            "?id=cmdb_review";



        });



    };





    // -------------------------
    // Approve
    // -------------------------


    c.approveMatch=function(){



        if(!c.data.actionReason){


            alert(
            "Reason is mandatory"
            );


            return;


        }




        c.server.get({


            action:"approve",

            match_id:c.data.match.sys_id,

            reason:c.data.actionReason



        }).then(function(response){



            if(response.data.success){



                alert(
                "Match approved successfully"
                );



                window.location.href =
                "?id=cmdb_review";



            }
            else{


                alert(
                response.data.error
                );


            }



        });



    };





    // -------------------------
    // Skip
    // -------------------------


    c.skipMatch=function(){



        window.location.href =
        "?id=cmdb_review";



    };

};
