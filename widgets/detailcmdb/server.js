(function () {

    data.match = {};
    data.attributes = [];
    data.signalChart = [];
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



        // Create NOT DUPLICATE record

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



        // Update match score

        matchGR.u_decision = "Reject";
        matchGR.update();



        data.success = true;


        return;

    }


    var matchId = $sp.getParameter("sys_id");

    if (!matchId)
        return;

    var match = new GlideRecord("x_angda_avante_c_0_match_score");

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
    // CI Attribute Comparison
    // ----------------------------

    var fields = [
        {label: "Name", field: "name"},
        {label: "FQDN", field: "fqdn"},
        {label: "IP Address", field: "ip_address"},
        {label: "MAC Address", field: "mac_address"},
        {label: "Serial Number", field: "serial_number"}
    ];

    for (var i = 0; i < fields.length; i++) {

        var item = fields[i];

        var valueA = ciA.getValue(item.field) || "";
        var valueB = ciB.getValue(item.field) || "";

        var status = "attr-diff";

        if (!valueA && !valueB)
            status = "attr-missing";
        else if (valueA == valueB)
            status = "attr-match";

        data.attributes.push({
            label: item.label,
            ci_a: valueA,
            ci_b: valueB,
            status: status
        });
    }

    // ----------------------------
    // Signal Chart
    // ----------------------------

    if (match.u_signals) {
				gs.info("Signals JSON = " + match.u_signals);

        try {

            var signals = JSON.parse(match.u_signals + "");
					  gs.info("json conversion"+JSON.stringify(signals));

            var weightGR = new GlideRecord("x_angda_avante_c_0_signal_weight");
            weightGR.addQuery("u_ci_class", ciA.sys_class_name + "");
            weightGR.addQuery("u_active", true);
            weightGR.query();

            var weights = {};

            while (weightGR.next()) {
                weights[weightGR.u_signal + ""] = parseFloat(weightGR.u_weight);
            }

            for (var signal in signals) {

								var rawValue = signals[signal];

								// Ignore non-numeric signals
								if (isNaN(parseFloat(rawValue))) {
										continue;
								}

								var similarity = parseFloat(rawValue);

								var weight = weights[signal] || 1;

								data.signalChart.push({
										label: signal,
										similarity: similarity,
										weight: weight,
										contribution: similarity * weight
								});
						}

            data.signalChart.sort(function(a, b) {
                return b.contribution - a.contribution;
            });

        } catch (e) {
					  
					
            gs.error("JSON Error: " + e.message);
            data.signalChart = [];

        }

    }

})();
