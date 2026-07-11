(function () {

    data.match = {};
    data.attributes = [];
    data.signals = {};

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
        score: match.u_score + "",
        decision: match.u_decision + "",
        computed_at: match.u_computed_at.getDisplayValue(),
        ci_a: ciA.getDisplayValue(),
        ci_b: ciB.getDisplayValue()
    };


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

        var status = "attr-diff";


        if (!valueA && !valueB) {

            status = "attr-missing";

        } else if (valueA == valueB) {

            status = "attr-match";

        }


        data.attributes.push({

            label: item.label,
            ci_a: valueA,
            ci_b: valueB,
            status: status

        });

    }


    if (match.u_signals) {

        try {

            data.signals = JSON.parse(match.u_signals + "");

        } catch(e) {

            data.signals = {};

        }

    }


})();
