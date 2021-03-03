import * as vscode from "vscode";
import { API_BASE_URL } from "./constants";
import { getNonce } from "./getNonce";
import { StateManager } from "./StateManager";
import { UserProvider } from "./UserProvider";
import { getLogger } from "./logger";

export class QotdPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: QotdPanel | undefined;

	public static readonly viewType = "qotd";

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private readonly _id: string;
	private _disposables: vscode.Disposable[] = [];
	private static panels: any = new Map();

	public static createOrShow(extensionUri: vscode.Uri, _arguments?: { _id?: string; caption?: string }) {
		const logger = getLogger("QotdPanel");
		const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

		const _id = _arguments?._id || "qotd";
		const title = _arguments?.caption || "Question of the day";
		/**
		 * This was a real headache!!
		 * Conventional panel reveal code only works if you have one panel to show at a time
		 * so i need to create a hashmap which stores different panel objects
		 * and reveal accordingly
		 */
		if (this.panels.has(_id)) {
			logger.info(`Revealing existing panel`);
			this.panels.get(_id)._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		logger.info(`Creating panel for ${title}`);
		const panel = vscode.window.createWebviewPanel(QotdPanel.viewType, title, column || vscode.ViewColumn.Active, this.getWebviewOptions(extensionUri));

		const qotdPanel = new QotdPanel(panel, extensionUri, _id);
		this.panels.set(_id, qotdPanel);
	}

	public static getWebviewOptions(extensionUri: vscode.Uri): any {
		return {
			// Enable javascript in the webview
			enableScripts: true,
			// dont load the question again if users is just switching between existing panels.
			retainContextWhenHidden: true,
			// And restrict the webview to only loading content from our extension's `media` directory.
			localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media"), vscode.Uri.joinPath(extensionUri, "out/compiled")],
		};
	}

	public static kill(_id: string) {
		this.panels.get(_id)?.dispose();
		this.panels.delete(_id);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, _id: string) {
		const qotdPanel = new QotdPanel(panel, extensionUri, _id);
		this.panels.set(_id, qotdPanel);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, _id: string) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._id = _id;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	public dispose() {
		QotdPanel.panels.delete(this._id);

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private async _update() {
		const logger = getLogger("QotdPanel._update");
		const webview = this._panel.webview;

		this._panel.webview.html = await this._getHtmlForWebview(webview);

		webview.onDidReceiveMessage(async (data) => {
			switch (data.type) {
				case "upsertBookmark": {
					logger.info(`Inside ${data.type}`);
					if (!data.value) {
						return;
					}
					const { _id, caption, bookmark, accessToken } = data.value;
					if (bookmark) {
						await UserProvider.bookmarkProvider.upsertBookmark(accessToken, { _id, caption }, "qotd");
					} else {
						await UserProvider.bookmarkProvider.removeBookmark(accessToken, _id);
					}
					break;
				}

				case "openSideBar": {
					logger.info(`Opening sideBar`);
					vscode.commands.executeCommand("quizifer.sidebar.user.focus");
					break;
				}
				case "onDebug": {
					logger.debug(`${data.type}: ${data.value}`);
					break;
				}
				case "onInfo": {
					if (!data.value) {
						return;
					}
					vscode.window.showInformationMessage(data.value);
					break;
				}
				case "onError": {
					if (!data.value) {
						return;
					}
					logger.error(`${data.type}: ${data.stack ? data.stack : data.value}`);
					vscode.window.showErrorMessage(data.value);
					break;
				}
			}
		});
	}

	private async _getHtmlForWebview(webview: vscode.Webview) {
		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out/compiled", "qotd.js"));
		const stylesQotdUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "css", "qotd.css"));
		const options = {
			accessToken: await StateManager.getState("accessToken"),
			bookmarkTreeItems: await StateManager.getState("bookmarkTreeItems"),
			id: this._id,
		};

		// Uri to load styles into webview
		// const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
		const quiziferLogoUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "icon.png"));
		const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "css", "vscode.css"));
		const stylesHighlightUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", vscode.window.activeColorTheme.kind === 1 ? "light" : "dark", "stackoverflow.min.css"));

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		webview.postMessage({ type: "get-qotd", value: options });

		return `<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">
					<!--
						Use a content security policy to only allow loading images from https or from our extension directory,
						and only allow scripts that have a specific nonce.
					-->
					<meta http-equiv="Content-Security-Policy" content=" img-src ${webview.cspSource} https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<link href="" rel="stylesheet">
					<link href="${stylesMainUri}" rel="stylesheet">

					<link href="${stylesHighlightUri}" rel="stylesheet">					
					<link href="${stylesQotdUri}" rel="stylesheet">
					<script nonce="${nonce}">
						const tsvscode = acquireVsCodeApi();
						const API_BASE_URL = ${JSON.stringify(API_BASE_URL)}; 
						const quiziferLogoUri = "${quiziferLogoUri}";
					</script>
				</head>
				<body>
				</body>
				<script src="${scriptUri}" nonce="${nonce}"/>
			</html>`;
	}

	public static async callQotdPanelListener(listener: string, value: any): Promise<void> {
		getLogger("QotdPanel.callQotdPanelListener").info(`Post message to qotd svelte code: ${JSON.stringify(Object.keys(value))}`);
		// Update all panel instances variables.
		for (let _id in this.panels) {
			this.panels[_id]._panel.webview.postMessage({ type: listener, value });
		}
		return;
	}
}
