// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

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
				panel.webview.html = getWebViewContent();
			}
		})
	);
}

function getWebViewContent() {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Cat Coding</title>
	</head>
	<body>
		<img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
	</body>
	</html>
	`;
}

// this method is called when your extension is deactivated
export function deactivate() {}
