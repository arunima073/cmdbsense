(function () {

    data.match = {};
    data.attributes = [];
    data.signalChart = [];


    // ----------------------------
    // Reject Action
    // ----------------------------

    if (input && input.action == "reject") {


        if (!input.reason) {

            data.error = "Reason is mandatory";
            return;

        }


        var matchGR = new GlideRecord(
            "x_angda_avante_c_0_match_score"
        );


        if (!matchGR.get(input.match_id)) {

            data.error = "Match record not found";
            return;

        }



        var nd = new GlideRecord(
            "x_angda_avante_c_0_not_duplicate"
        );


        nd.initialize();


        nd.u_ci_a = matchGR.u_ci_a;
        nd.u_ci_b = matchGR.u_ci_b;
        nd.u_recorded_by = gs.getUserID();
        nd.u_recorded_at = new GlideDateTime();
        nd.u_reason = input.reason;


        nd.insert();



        matchGR.u_decision = "Reject";
        matchGR.update();



        data.success = true;


        return;

    }


    // ----------------------------
		// Approve Action
		// ----------------------------


		if(input && input.action=="approve"){



				if(!input.reason){


						data.error =
						"Reason is mandatory";


						return;


				}





				var matchApprove =
						new GlideRecord(
						"x_angda_avante_c_0_match_score"
						);



				if(!matchApprove.get(input.match_id)){


						data.error =
						"Match record not found";


						return;


				}




				// Create Merge Log


				var mergeLog =
						new GlideRecord(
						"x_angda_avante_c_0_merge_log"
						);



				mergeLog.initialize();




				// CI A becomes winner
				// CI B becomes loser


				mergeLog.u_winner =
						matchApprove.u_ci_a;



				mergeLog.u_loser =
						matchApprove.u_ci_b;



				mergeLog.u_steward =
						gs.getUserID();



				mergeLog.u_decision_type =
						"Manual";



				mergeLog.u_reason =
						input.reason;



				mergeLog.u_score_at_merge =
						matchApprove.u_score;



				mergeLog.u_merged_at =
						new GlideDateTime();



				mergeLog.u_match_score_ref =
						matchApprove.sys_id;



				mergeLog.insert();





				// Update Match Score


				matchApprove.u_decision =
						"Auto-merge";



				matchApprove.update();





				data.success=true;


				return;


		}

    // ----------------------------
    // Get Match Record
    // ----------------------------


    var matchId = $sp.getParameter("sys_id");


    if (!matchId)
        return;



    var match = new GlideRecord(
        "x_angda_avante_c_0_match_score"
    );


    if (!match.get(matchId))
        return;



    var ciA = match.u_ci_a.getRefRecord();
    var ciB = match.u_ci_b.getRefRecord();




    data.match = {

        sys_id: match.getUniqueValue(),

        score: parseFloat(match.u_score),

        decision: match.u_decision + "",

        computed_at: match.u_computed_at.getDisplayValue(),

        ci_a: ciA.getDisplayValue(),

        ci_b: ciB.getDisplayValue()

    };





    // ----------------------------
    // Attribute Comparison
    // Using same logic as AvnCmdbScorer
    // ----------------------------


    var fields = [

        {
            label: "Name",
            field: "name"
        },

        {
            label: "FQDN",
            field: "fqdn"
        },

        {
            label: "IP Address",
            field: "ip_address"
        },

        {
            label: "MAC Address",
            field: "mac_address"
        },

        {
            label: "Serial Number",
            field: "serial_number"
        }

    ];





    for (var i = 0; i < fields.length; i++) {


        var item = fields[i];


        var valueA = ciA.getValue(item.field) || "";

        var valueB = ciB.getValue(item.field) || "";



        var similarity = calculateSimilarity(
            valueA,
            valueB,
            item.field
        );



        var status = "attr-missing";



        if (similarity >= 0.80) {


            status = "attr-match";


        } 
        else if (similarity > 0) {


            status = "attr-diff";

        }



        data.attributes.push({

            label: item.label,

            ci_a: valueA,

            ci_b: valueB,

            similarity: similarity,

            status: status

        });


    }





    // ----------------------------
    // Signal Contribution Chart
    // ----------------------------


    if (match.u_signals) {


        try {


            var signals = JSON.parse(
                match.u_signals + ""
            );



            var weightGR = new GlideRecord(
                "x_angda_avante_c_0_signal_weight"
            );


            weightGR.addQuery(
                "u_ci_class",
                ciA.sys_class_name + ""
            );


            weightGR.addQuery(
                "u_active",
                true
            );


            weightGR.query();



            var weights = {};



            while(weightGR.next()) {


                weights[
                    weightGR.u_signal + ""
                ] = parseFloat(
                    weightGR.u_weight
                );


            }




            for(var signal in signals) {


                var rawValue = signals[signal];



                if(isNaN(parseFloat(rawValue))) {

                    continue;

                }



                var similarity =
                    parseFloat(rawValue);



                var weight =
                    weights[signal] || 1;




                data.signalChart.push({

                    label: signal,

                    similarity: similarity,

                    weight: weight,

                    contribution:
                        similarity * weight

                });


            }




            data.signalChart.sort(
                function(a,b){

                    return b.contribution -
                           a.contribution;

                }
            );




        }
        catch(e){


            gs.error(
                "JSON Error: " + e.message
            );


            data.signalChart = [];


        }


    }





    // ==================================================
    // Similarity Functions
    // Same logic as AvnCmdbScorer
    // ==================================================



    function calculateSimilarity(a,b,field){



        if(!a || !b)

            return 0;



        a = a.toString()
             .trim()
             .toLowerCase();



        b = b.toString()
             .trim()
             .toLowerCase();





        // MAC

        if(field == "mac_address"){


            var na =
                a.replace(/[^a-f0-9]/g,'');


            var nb =
                b.replace(/[^a-f0-9]/g,'');



            return na == nb ? 1 : 0;


        }






        // SERIAL


        if(field == "serial_number"){


            return a == b ? 1 : 0;


        }






        // FQDN


        if(field == "fqdn"){



            if(a == b)

                return 1;




            if(
                a.endsWith("." + b) ||
                b.endsWith("." + a)
            )

                return 0.85;





            var hostA =
                a.split('.')[0];


            var hostB =
                b.split('.')[0];



            if(hostA == hostB)

                return 0.65;




            return 0;


        }






        // IP ADDRESS


        if(field == "ip_address"){



            var ipsA =
                a.split(/[,\s]+/);



            var ipsB =
                b.split(/[,\s]+/);



            var intersection = 0;

            var union = {};




            ipsA.forEach(function(ip){


                union[ip]=true;


                if(
                    ipsB.indexOf(ip)>=0
                )

                    intersection++;


            });




            ipsB.forEach(function(ip){


                union[ip]=true;


            });




            var unionSize =
                Object.keys(union).length;



            return unionSize ?
                intersection / unionSize :
                0;



        }






        // NAME / DEFAULT


        if(a == b)

            return 1;



        return jaroWinkler(a,b);



    }






    function jaroWinkler(s1,s2){


        if(s1 == s2)

            return 1;



        if(!s1.length || !s2.length)

            return 0;



        var distance =
            Math.floor(
                Math.max(
                    s1.length,
                    s2.length
                ) / 2
            ) - 1;



        var matches = 0;



        for(var i=0;i<s1.length;i++){


            var start =
                Math.max(
                    0,
                    i-distance
                );



            var end =
                Math.min(
                    i+distance+1,
                    s2.length
                );



            for(var j=start;j<end;j++){


                if(s1[i] == s2[j]){


                    matches++;

                    break;


                }


            }


        }



        if(matches == 0)

            return 0;



        return matches /
               Math.max(
                    s1.length,
                    s2.length
               );


    }



})();
