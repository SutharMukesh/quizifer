const hljs = require("highlight.js");
const Md = require("markdown-it");

function getDesiredConfig(options={}) {
	const opt = {};
	opt.theme = options.theme == 1 ? "stackoverflow-light" : "stackoverflow-dark";
	opt.fontFamily = options.fontFamily || "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif";
	opt.fontSize = options.fontSize || "14px";
	opt.fontWeight = options.fontWeight || "normal";
	return opt
}

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
	const config = getDesiredConfig(options);

	const html = `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.4.1/styles/${config.theme}.min.css">
	</head>
    <body>
        <div class="container">
            ${renderedQuestion.replace(/<code>/g, '<code class="hljs">')}
        </div>
    </body>

    <style>
    body{
		background: #F1F2F8;
		font-family: ${config.fontFamily};
		font-size: ${config.fontSize};
		font-weight: ${config.fontWeight};
    }
    .container{
        margin: 30px;
        padding: 30px;
        background: #F9F9FA;
        box-shadow: 0px 13px 31px rgba(12, 20, 33, 0.04), 0px 9.45547px 20.8947px rgba(12, 20, 33, 0.032375), 0px 6.58125px 13.5141px rgba(12, 20, 33, 0.027), 0px 4.31641px 8.38574px rgba(12, 20, 33, 0.023125), 0px 2.6px 5.0375px rgba(12, 20, 33, 0.02), 0px 1.37109px 2.99707px rgba(12, 20, 33, 0.016875), 0px 0.56875px 1.79219px rgba(12, 20, 33, 0.013), inset 0px 2px 1px #FFFFFF;
        border-radius: 20px;
    }
    pre {
        padding: 1rem !important;
        border-radius: 3px;
    }
    code{
		display: inline !important;
		padding: 0 0.5rem !important;
        border-radius: 2px;
	}
    </style>
	</html>`;
	console.log(html);
	return html;
};
