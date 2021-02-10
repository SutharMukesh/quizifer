import * as vscode from "vscode";
import { QotdPanel } from "./QotdPanel";
import { UserProvider } from "./UserProvider";
import { StateManager } from "./StateManager";
import { statModule } from "./stats";
import { BookmarkProvider } from "./BookmarkProvider";

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
	try {
		console.log('Extension "quizifer" is now active!!!');
		const userProvider = new UserProvider(context.extensionUri);
		StateManager.globalState = context.globalState;

		vscode.window.registerWebviewViewProvider("quizifer.sidebar.user", userProvider);

		context.subscriptions.push(
			vscode.commands.registerCommand("quizifer.qotd", (_arguments) => {
				QotdPanel.createOrShow(context.extensionUri, _arguments);
			})
		);

		// Register Bookmark provider if user is loggedIn
		const accessToken = StateManager.getState("accessToken");
		if (accessToken) {
			UserProvider.bookmarkProvider = new BookmarkProvider(accessToken);
		}

		context.subscriptions.push(
			vscode.commands.registerCommand("quizifer.refreshWebView", async () => {
				// await vscode.commands.executeCommand("workbench.action.closeSidebar");
				// await vscode.commands.executeCommand("workbench.view.extension.quizifer-sidebar");
				QotdPanel.kill("qotd");
				QotdPanel.createOrShow(context.extensionUri);
				// setTimeout(() => {
				// 	vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
				// }, 500);
			})
		);

		// notify everyday when vscode starts
		await showNotification(context);

		// notify everyday even if user doesn't closes vscode for many days
		// by checking the lastInteractOnDate with todays date every 1 hr
		setInterval(async function () {
			await showNotification(context);
		}, 3600000);
	} catch (error) {
		console.error(error);
	}
}
// this method is called when your extension is deactivated
export function deactivate() {
	console.log("deactivated");
}
