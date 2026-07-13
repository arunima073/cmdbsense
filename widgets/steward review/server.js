(function() {

	data.matches = [];

	var isAdmin = gs.hasRole('admin');

	// Get current user's assigned classes
	var user = new GlideRecord('sys_user');
	user.get(gs.getUserID());

	var assignedClasses = [];

	if (!isAdmin && user.x_angda_avante_c_0_assigned_classes) {

			var ids = (user.x_angda_avante_c_0_assigned_classes + '').split(',');

			for (var i = 0; i < ids.length; i++) {

					var cls = new GlideRecord('sys_db_object');

					if (cls.get(ids[i])) {
							assignedClasses.push(cls.name.toString());
					}
			}
	}

	gs.info("Resolved classes: " + assignedClasses.join(','));
	
	gs.info("Current user: " + gs.getUserName());
	gs.info("Assigned classes raw: " + user.x_angda_avante_c_0_assigned_classes);
	gs.info("Assigned array: " + assignedClasses);

	var gr = new GlideRecord('x_angda_avante_c_0_match_score');
	gr.addQuery('u_decision', 'Steward-review');
	gr.orderByDesc('u_score');
	gr.setLimit(500);
	gr.query();

	while (gr.next()) {

		if (!isAdmin) {

			var ci = gr.u_ci_a.getRefRecord();

			if (!ci.isValidRecord())
				continue;

			var ciClass = ci.sys_class_name + '';

			if (assignedClasses.indexOf(ciClass) == -1)
				continue;
		}

		data.matches.push({
			sys_id: gr.getUniqueValue(),
			ci_a: gr.u_ci_a.getDisplayValue(),
			ci_b: gr.u_ci_b.getDisplayValue(),
			score: gr.u_score + '',
			decision: gr.u_decision + '',
			computed_at: gr.u_computed_at.getDisplayValue()
		});
	}

})();
