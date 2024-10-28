"use strict";

const Controllers = module.exports;

Controllers.renderAdminPage = function (req, res /* , next */) {
  /*
		Make sure the route matches your path to template exactly.

		If your route was:
			myforum.com/some/complex/route/
		your template should be:
			templates/some/complex/route.tpl
		and you would render it like so:
			res.render('some/complex/route');
	*/

  res.render("admin/plugins/sensitive-words", {
    title: "敏感词过滤",
  });
};
