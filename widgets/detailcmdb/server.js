(function () {

    data.match = {};

    var matchId = $sp.getParameter("sys_id");

    if (!matchId)
        return;

    var gr = new GlideRecord("x_angda_avante_c_0_match_score");

    if (gr.get(matchId)) {

        data.match = {
            sys_id: gr.getUniqueValue(),
            ci_a: gr.u_ci_a.getDisplayValue(),
            ci_b: gr.u_ci_b.getDisplayValue(),
            score: gr.u_score + "",
            decision: gr.u_decision + "",
            computed_at: gr.u_computed_at.getDisplayValue()
        };

    }

})();
