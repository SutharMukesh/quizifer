import * as vscode from "vscode";
import { QotdPanel } from "./QotdPanel";

export class StateManager {
	static globalState: vscode.Memento;

	static async setState(key: string, value: string | null | any) {
		await this.globalState.update(key, value);
		await QotdPanel.callQotdPanelListener("updateLocals", { accessToken: await this.globalState.get("accessToken") });
		return;
	}

	static getState(key: string): string | undefined {
		return this.globalState.get(key);
	}
}
