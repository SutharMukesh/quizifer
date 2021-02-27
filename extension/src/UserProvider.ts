import * as vscode from "vscode";
import { authenticate } from "./authenticate";
import { API_BASE_URL } from "./constants";
import { getNonce } from "./getNonce";
import { StateManager } from "./StateManager";
import { BookmarkProvider } from "./BookmarkProvider";
import { QotdPanel } from "./QotdPanel";

export class UserProvider implements vscode.WebviewViewProvider {
	_view?: vscode.WebviewView;
	_doc?: vscode.TextDocument;
	public static bookmarkProvider: BookmarkProvider;
	constructor(private readonly _extensionUri: vscode.Uri) {}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri],
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async (data) => {
			switch (data.type) {
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
					vscode.window.showErrorMessage(data.value);
					break;
				}

				case "get-token": {
					// This is called when user view is loaded.
					const accessToken = StateManager.getState("accessToken");
					if (accessToken) {
						// Initialize bookmark Provider if user is already logged in
						webviewView.webview.postMessage({ type: "get-user-info", value: accessToken });
					} else {
						// user is not loggedIn
						webviewView.webview.postMessage({ type: "stop-loading", value: undefined });
					}
					break;
				}

				case "login": {
					authenticate(async () => {
						const accessToken: string | any = StateManager.getState("accessToken");

						// Initialize bookmark Provider View after user authenticates
						UserProvider.bookmarkProvider = new BookmarkProvider(accessToken);

						// Gets user info and after that load bookmarks
						webviewView.webview.postMessage({ type: "get-user-info", value: accessToken });
						QotdPanel.kill("qotd");
						QotdPanel.createOrShow(this._extensionUri);
					});
					break;
				}

				case "load-bookmarks": {
					// this is triggered after get-user-info
					const { user } = data.value;
					const bookmarks = user.bookmarks || [];
					await UserProvider.bookmarkProvider.initBookmarks(bookmarks);
					break;
				}

				case "logout": {
					// Empty bookmarks.
					await UserProvider.bookmarkProvider.onlogout();
					await StateManager.setState("accessToken", null);
					vscode.window.showInformationMessage("logout success");
					break;
				}
			}
		});
	}

	public revive(panel: vscode.WebviewView) {
		this._view = panel;
	}

	private _getHtmlForWebview(webview: vscode.Webview): string {
		const styleVscodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "css", "vscode.css"));
		const styleUserUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "css", "user.css"));
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/user.js"));
		// const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/user.css"));

		const nonce = getNonce();

		return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleVscodeUri}" rel="stylesheet">
			<link href="${styleUserUri}" rel="stylesheet">
            
            <script nonce="${nonce}">
                const tsvscode = acquireVsCodeApi();
                const API_BASE_URL = ${JSON.stringify(API_BASE_URL)}; 
            </script>
        </head>
        <body>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
	}
}
// <link href="${styleUri}" rel="stylesheet">
