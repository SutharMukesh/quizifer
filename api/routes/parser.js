const hljs = require("highlight.js");
const Md = require("markdown-it");

module.exports = function (data, options) {
	let md = Md({
		html: true,
		highlight: function (str, lang) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return '<pre class="hljs"><code>' + hljs.highlight(lang, str, true).value + "</code></pre>";
				} catch (__) {}
			}

			return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>";
		},
	});

	const renderedQuestion = md.render(data);
	const html = renderedQuestion.replace(/<code>/g, '<code class="hljs">');
	return html;
};
