const hljs = require("highlight.js");
const Md = require("markdown-it");

module.exports = function (data, theme) {
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
	let themes = {};
	if (theme == 1) {
		// Light
		themes.highlight = "stackoverflow-light";
	} else {
		// Dark -- Default
		themes.highlight = "stackoverflow-dark";
	}

	const html = `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.4.1/styles/${themes.highlight}.min.css">
	</head>
    <body>
        <div class="container">
            ${renderedQuestion}
        </div>
    </body>

    <style>
    body{
        font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif
    }
    .container{
        margin: 30px;
        padding: 30px;
        // background: #F9F9FA;
        // box-shadow: 0px 13px 31px rgba(12, 20, 33, 0.04), 0px 9.45547px 20.8947px rgba(12, 20, 33, 0.032375), 0px 6.58125px 13.5141px rgba(12, 20, 33, 0.027), 0px 4.31641px 8.38574px rgba(12, 20, 33, 0.023125), 0px 2.6px 5.0375px rgba(12, 20, 33, 0.02), 0px 1.37109px 2.99707px rgba(12, 20, 33, 0.016875), 0px 0.56875px 1.79219px rgba(12, 20, 33, 0.013), inset 0px 2px 1px #FFFFFF;
        // border-radius: 20px;
    }
    pre{
        padding: 1rem !important;
        border-radius: 3px;
    }

    </style>
	</html>`;
	return html;
};
