import * as vscode from "vscode";
import { QotdPanel } from "./QotdPanel";

export class StateManager {
	static globalState: vscode.Memento;

	static async setState(key: string, value: string | null) {
		await this.globalState.update(key, value);
		await QotdPanel.updateQotdPanelLocals({ accessToken: await this.globalState.get("accessToken") });
		return;
	}

	static getState(key: string): string | undefined {
		return this.globalState.get(key);
	}
}
