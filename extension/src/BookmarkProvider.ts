import * as vscode from "vscode";
import type { Bookmark } from "./types";
import axios from "axios";
import { API_BASE_URL } from "./constants";
import { QotdPanel } from "./QotdPanel";
export const bookmarkHelper = {
	add: async function (accessToken: string, bookmarkId: string) {
		let response: any = await axios.put(
			`${API_BASE_URL}/bookmarks/${bookmarkId}`,
			{},
			{
				headers: {
					authorization: `Bearer ${accessToken}`,
				},
			}
		);
		const { message } = response.data;
		vscode.window.showInformationMessage(message);
	},
	remove: async function (accessToken: string, bookmarkId: string) {
		let response: any = await axios.delete(`${API_BASE_URL}/bookmarks/${bookmarkId}`, {
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
		});
		console.log(response);
		const { message } = response.data;
		vscode.window.showInformationMessage(message);
	},
};

export class BookmarkProvider implements vscode.TreeDataProvider<TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

	private bookmarks: TreeItem[];

	constructor(accessToken: string, bookmarksData: Array<Bookmark>) {
		this.bookmarks = bookmarksData.map((bookmark) => new TreeItem(bookmark));
		vscode.window.registerTreeDataProvider("quizifer.sidebar.bookmark", this);
		vscode.commands.registerCommand("quizifer.bookmark.refresh", () => this.refresh());

		vscode.commands.registerCommand("quizifer.bookmark.delete", async (data) => {
			await this.removeBookmark(accessToken, data.id);
		});
	}

	getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
		if (element === undefined) {
			return this.bookmarks;
		}
		return element.children;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	onlogout(): void {
		this.bookmarks = [];
		this.refresh();
	}

	async saveBookmark(accessToken: string, bookmark: Bookmark): Promise<void> {
		try {
			await bookmarkHelper.add(accessToken, bookmark.id);
			this.bookmarks = [...this.bookmarks, new TreeItem(bookmark)];
			await this.refresh();
		} catch (error) {
			QotdPanel.updateQotdPanelLocals({ bookmark: false });
			console.error(`BookmarkProvider: add: ${error.stack ? error.stack : error}`);
			vscode.window.showErrorMessage(error.message);
		}
	}

	async removeBookmark(accessToken: string, id: string): Promise<void> {
		try {
			await bookmarkHelper.remove(accessToken, id);
			this.bookmarks = this.bookmarks.filter((bookmark) => bookmark.id !== id);
			await this.refresh();
		} catch (error) {
			QotdPanel.updateQotdPanelLocals({ bookmark: true });
			console.error(`BookmarkProvider: remove: ${error.stack ? error.stack : error}`);
			vscode.window.showErrorMessage(error.message);
		}
	}
}

class TreeItem extends vscode.TreeItem {
	children: TreeItem[] | undefined;

	constructor(bookmark: Bookmark, children?: TreeItem[]) {
		super(bookmark.caption, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
		this.command = {
			command: "quizifer.qotd",
			title: "sometitle",
			arguments: [bookmark.id],
		};
		this.id = bookmark.id;
		// this.iconPath = this.getIcon(valueNode);
		// this.contextValue = valueNode.type;
		this.children = children;
	}
}
