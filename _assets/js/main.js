
import $ from "jquery";
import Turbolinks from "turbolinks";

document.addEventListener("turbolinks:before-visit", function(e) {
	if (!document.body.classList.contains("loading")) {
		document.body.classList.add("loading");
		$("html, body").animate({ scrollTop: 0 }, 350);

		// Slightly delay the loading to allow the animation to render properly
		e.preventDefault();
		setTimeout(function() {
			Turbolinks.visit(e.data.url);
		}, 350);
	}
});
document.addEventListener("turbolinks:load", function(e) {
	document.body.classList.remove("loading");
});


Turbolinks.start();


var timer;
document.addEventListener("turbolinks:load", function(e) {
	if (timer) {
		clearInterval(timer);
	}
	var container = $(".home .rotate");
	if (container) {
		timer = setInterval(function() {
			var current = container.find('.current');
			var next = current.next();
			if (!next.length) {
				next = container.children().first();
			}
			current.removeClass('current').addClass('previous');
			next.removeClass('previous').addClass('current');
		}, 3000);
	}
});


