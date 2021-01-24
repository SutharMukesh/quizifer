import * as vscode from "vscode";
import { authenticate } from "./authenticate";
import { API_BASE_URL } from "./constants";
import { getNonce } from "./getNonce";
import { StateManager } from "./StateManager";
import { fetchBookmarks, BookmarkProvider } from "./BookmarkProvider";
import { Bookmark } from "./types";

export class UserProvider implements vscode.WebviewViewProvider {
	_view?: vscode.WebviewView;
	_doc?: vscode.TextDocument;

	constructor(private readonly _extensionUri: vscode.Uri) {}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;
		let bookmarkProvider:BookmarkProvider;
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
					const token = await StateManager.getState("accessToken");
					if (token) {
						webviewView.webview.postMessage({ type: "get-user-info", value: token });
					}else{
						webviewView.webview.postMessage({ type: "stop-loading", value: undefined });
					}
					break;
				}
				case "authenticate": {
					authenticate(async () => {
						webviewView.webview.postMessage({ type: "get-user-info", value: await StateManager.getState("accessToken") });
					});
					break;
				}

				case "load-bookmarks": {
					const bookmarks:Array<Bookmark> = await fetchBookmarks("sajdhjksad");
					bookmarkProvider = new BookmarkProvider(bookmarks);
					// const treeDataProvider = new TreeDataProvider(bookmarks);
					bookmarkProvider.refresh();
					break;
				}
				case "logout": {
					bookmarkProvider.onlogout();
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
		const styleVscodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
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