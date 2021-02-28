import * as vscode from "vscode";
import { QotdPanel } from "./QotdPanel";
import { getLogger } from "./logger";
export class StateManager {
	static globalState: vscode.Memento;

	static async setState(key: string, value: string | null | any) {
		const logger = getLogger("StateManager.setState");
		logger.info(`Set state for ${key}`);
		await this.globalState.update(key, value);
		await QotdPanel.callQotdPanelListener("updateLocals", { accessToken: await this.globalState.get("accessToken") });
		return;
	}

	static getState(key: string): string | undefined {
		const logger = getLogger("StateManager.getState");
		logger.info(`Get state for ${key}`);
		return this.globalState.get(key);
	}
}
