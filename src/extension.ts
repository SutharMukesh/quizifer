// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import axios from "axios";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "quizifer" is now active!');
	let panel: vscode.WebviewPanel | any = undefined;
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(
		vscode.commands.registerCommand("quizifer.helloWorld", () => {
			// The code you place here will be executed every time your command is executed
			const columnToShowIn: any = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
			if (panel) {
				panel.reveal(columnToShowIn);
			} else {
				// Display a message box to the user
				vscode.window.showInformationMessage("Hello World from quizifer!");
				panel = vscode.window.createWebviewPanel("quiz", "Question Of The Day", columnToShowIn, {});
				const options = {
					theme: vscode.window.activeColorTheme.kind,
					fontFamily: vscode.workspace.getConfiguration("editor").get("fontFamily"),
					fontSize: vscode.workspace.getConfiguration("editor").get("fontSize"),
					fontWeight: vscode.workspace.getConfiguration("editor").get("fontWeight"),
					cardBackground: "var(--vscode-sideBar-background)",
				};
				let loading = true;
				axios
					.get(`http://192.168.0.112:8888/qotd`,{
						params:options
					})
					.then(function (response: any) {
						// handle success
						loading = false;
						panel.webview.html = response.data;
					})
					.catch(function (error: any) {
						// handle error
						console.log(error);
					});
			}
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
