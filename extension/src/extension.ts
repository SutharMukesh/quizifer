import * as vscode from "vscode";
import { QotdPanel } from "./QotdPanel";
import { StateManager } from "./StateManager";

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
	console.log('Extension "quizifer" is now active!!!');
	StateManager.globalState = context.globalState;

	context.subscriptions.push(
		vscode.commands.registerCommand("quizifer.qotd", () => {
			QotdPanel.createOrShow(context.extensionUri);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("quizifer.refreshWebView", async () => {
			QotdPanel.kill();
			QotdPanel.createOrShow(context.extensionUri);
			setTimeout(() => {
				vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
			}, 500);
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
