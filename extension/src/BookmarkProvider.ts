import * as vscode from "vscode";
import type { Bookmark } from "./types";
import axios from "axios";
import { API_BASE_URL } from "./constants";
import { QotdPanel } from "./QotdPanel";
import { StateManager } from "./StateManager";

const progressBar = async function (fn: Function): Promise<void> {
	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			cancellable: false,
			title: "Syncing",
		},
		async (progress) => {
			// progress.report({ increment: 0 });
			return new Promise(async (res, rej) => {
				try {
					await fn();
					res(0);
				} catch (error) {
					rej(error);
				}
			});
			// progress.report({ increment: 100 });
		}
	);
};

export const bookmarkHelper = {
	add: async function (accessToken: string, bookmarkId: string) {
		await progressBar(async () => {
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
		});
	},
	remove: async function (accessToken: string, bookmarkId: string) {
		await progressBar(async () => {
			let response: any = await axios.delete(`${API_BASE_URL}/bookmarks/${bookmarkId}`, {
				headers: {
					authorization: `Bearer ${accessToken}`,
				},
			});
			const { message } = response.data;
			vscode.window.showInformationMessage(message);
		});
	},
};

export class BookmarkProvider implements vscode.TreeDataProvider<TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

	private bookmarks: TreeItem[];

	constructor(accessToken: string) {
		this.bookmarks = [];
		vscode.window.registerTreeDataProvider("quizifer.sidebar.bookmark", this);
		vscode.commands.registerCommand("quizifer.bookmark.refresh", async () => await this.refresh());
		vscode.commands.registerCommand("quizifer.bookmark.delete", async (data) => {
			await this.removeBookmark(accessToken, data.id);
		});
	}

	async initBookmarks(bookmarksData: Array<Bookmark>) {
		this.bookmarks = bookmarksData.map((bookmark) => new TreeItem(bookmark));
		await this.refresh();
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

	async refresh(): Promise<void> {
		this._onDidChangeTreeData.fire();
		await StateManager.setState("bookmarkTreeItems", this.bookmarks);
	}

	async onlogout(): Promise<void> {
		this.bookmarks = [];
		await this.refresh();
		QotdPanel.callQotdPanelListener("syncBookmarkState", { bookmarkTreeItems: StateManager.getState("bookmarkTreeItems") });
	}

	async saveBookmark(accessToken: string, bookmark: Bookmark): Promise<void> {
		try {
			await bookmarkHelper.add(accessToken, bookmark._id);
			this.bookmarks = [...this.bookmarks, new TreeItem(bookmark)];
			await this.refresh();
		} catch (error) {
			console.error(`BookmarkProvider: add: ${error.stack ? error.stack : error}`);
			vscode.window.showErrorMessage(error.message);
		}
		QotdPanel.callQotdPanelListener("syncBookmarkState", { bookmarkTreeItems: StateManager.getState("bookmarkTreeItems") });
	}

	async removeBookmark(accessToken: string, _id: string): Promise<void> {
		try {
			await bookmarkHelper.remove(accessToken, _id);
			this.bookmarks = this.bookmarks.filter((bookmark) => bookmark.id !== _id);
			await this.refresh();
		} catch (error) {
			console.error(`BookmarkProvider: remove: ${error.stack ? error.stack : error}`);
			vscode.window.showErrorMessage(error.message);
		}
		QotdPanel.callQotdPanelListener("syncBookmarkState", { bookmarkTreeItems: StateManager.getState("bookmarkTreeItems") });
	}
}

class TreeItem extends vscode.TreeItem {
	children: TreeItem[] | undefined;

	constructor(bookmark: Bookmark, children?: TreeItem[]) {
		super(bookmark.caption, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
		this.command = {
			command: "quizifer.qotd",
			title: "sometitle",
			arguments: [bookmark],
		};
		this.id = bookmark._id;
		// this.iconPath = this.getIcon(valueNode);
		// this.contextValue = valueNode.type;
		this.children = children;
	}
}
