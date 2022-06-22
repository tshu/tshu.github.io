---
title: "Leaves"
layout: archive
permalink: /leaves/
author_profile: false
---

{% for post in site.pages %}
	{% if post.title == "Sort by Category" or post.title == "Sort by Tag" or post.title == "Sort by Year"%}
  		{% include archive-single.html %}
	{% endif %}
{% endfor %}
