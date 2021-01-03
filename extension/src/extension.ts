import * as vscode from "vscode";
import axios from "axios";

function getLoadingView() {
	return `<html>
			<body></body>
			<style>
				body {
					background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' width='575' height='6px'%3E %3Cstyle%3E circle { animation: ball 2.5s cubic-bezier(0.000, 1.000, 1.000, 0.000) infinite; fill: %23bbb; } %23balls { animation: balls 2.5s linear infinite; } %23circle2 { animation-delay: 0.1s; } %23circle3 { animation-delay: 0.2s; } %23circle4 { animation-delay: 0.3s; } %23circle5 { animation-delay: 0.4s; } @keyframes ball { from { transform: none; } 20% { transform: none; } 80% { transform: translateX(864px); } to { transform: translateX(864px); } } @keyframes balls { from { transform: translateX(-40px); } to { transform: translateX(30px); } } %3C/style%3E %3Cg id='balls'%3E %3Ccircle class='circle' id='circle1' cx='-115' cy='3' r='3'/%3E %3Ccircle class='circle' id='circle2' cx='-130' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle3' cx='-145' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle4' cx='-160' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle5' cx='-175' cy='3' r='3' /%3E %3C/g%3E %3C/svg%3E") 50% no-repeat;
					height:200px;
				}
			</style>
		</html>`;
}

function showNotification(context: vscode.ExtensionContext) {
	if (context.globalState.get("lastOpenedOnDate") != new Date().toDateString()) {
		vscode.window.showInformationMessage("Question of the day 🎁", { title: "Let's do it!" }, { title: "Not today" }).then((data) => {
			if (data?.title === "Let's do it!") {
				vscode.commands.executeCommand("quizifer.qotd");
			}
		});
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "quizifer" is now active!');
	let panel: vscode.WebviewPanel | any = undefined;

	context.subscriptions.push(
		vscode.commands.registerCommand("quizifer.qotd", () => {
			// The code you place here will be executed every time your command is executed
			const columnToShowIn: any = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
			if (panel) {
				panel.reveal(columnToShowIn);
			} else {
				// Display a message box to the user
				panel = vscode.window.createWebviewPanel("quiz", "Question of the day", columnToShowIn, {});
				// reset panel variable on close
				panel.onDidDispose(() => {
					panel = null;
				}, null);

				const options = {
					theme: vscode.window.activeColorTheme.kind,
					fontFamily: vscode.workspace.getConfiguration("editor").get("fontFamily"),
					fontSize: vscode.workspace.getConfiguration("editor").get("fontSize"),
					fontWeight: vscode.workspace.getConfiguration("editor").get("fontWeight"),
					cardBackground: "var(--vscode-sideBar-background)",
				};
				let loading = true;
				panel.webview.html = getLoadingView();
				axios
					.get(`https://d64re11kk0.execute-api.ap-south-1.amazonaws.com/dev/qotd`, {
						params: options,
					})
					.then(function (response: any) {
						// handle success
						loading = false;
						panel.webview.html = response.data;
					})
					.catch(function (error: any) {
						// handle error
						console.log(error.stack ? error.stack : error);
						vscode.window.showErrorMessage(error.message ? error.message : error);
					});
				context.globalState.update("lastOpenedOnDate", new Date().toDateString());
			}
		})
	);

	// notify everyday when vscode starts
	showNotification(context);

	// notify everyday even if user doesn't closes vscode for many days
	setInterval(function () {
		showNotification(context);
	}, 21600000);
}

// this method is called when your extension is deactivated
export function deactivate() {
	console.log("deactivated");
}
