import * as vscode from "vscode";
import axios from "axios";

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "quizifer" is now active!');
	let panel: vscode.WebviewPanel | any = undefined;

	context.subscriptions.push(
		vscode.commands.registerCommand("quizifer.helloWorld", () => {
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
				axios
					.get(`http://192.168.0.112:8888/qotd`, {
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
			}
		})
	);

	vscode.window.showInformationMessage("Question of the day", { title: "Let's do it!" }, { title: "Not today" }).then((data) => {
		if (data?.title === "Let's do it!") {
			vscode.commands.executeCommand("quizifer.helloWorld");
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	console.log("deactivated");
}
