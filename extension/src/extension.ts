import * as vscode from "vscode";
import { QotdPanel } from "./QotdPanel";
import { StateManager } from "./StateManager";
import { statModule } from "./stats";

async function showNotification(context: vscode.ExtensionContext) {
	if (StateManager.getState("lastInteractOnDate") !== new Date().toDateString()) {
		vscode.window.showInformationMessage("Question of the day 🎁", { title: "Let's do it!" }, { title: "Not today" }).then(async (data) => {
			if (data?.title === "Let's do it!") {
				await statModule.attempted();
				vscode.commands.executeCommand("quizifer.qotd");
			} else {
				await statModule.ignored();
			}
			await StateManager.setState("lastInteractOnDate", new Date().toDateString());
		});
		await statModule.notified();
	}
}

export async function activate(context: vscode.ExtensionContext) {
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
	await showNotification(context);

	// notify everyday even if user doesn't closes vscode for many days
	// by checking the lastInteractOnDate with todays date every 1 hr
	setInterval(async function () {
		await showNotification(context);
	}, 3600000);
}

// this method is called when your extension is deactivated
export function deactivate() {
	console.log("deactivated");
}
