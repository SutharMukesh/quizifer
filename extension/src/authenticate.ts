import * as constants from "./constants";
import * as vscode from "vscode";
import * as polka from "polka";
import { StateManager } from "./StateManager";
import { getLogger } from "./logger";

export function authenticate(fn: () => void) {
	const logger = getLogger("authenticate");
	const app = polka();
	app.get("/auth/:token", async (req, res) => {
		logger.info(`Auth route /auth/:token called`);
		const { token } = req.params;
		if (!token) {
			res.end(`<h3>Something went wrong</h3>`);
			return;
		}

		await StateManager.setState("accessToken", token);
		fn();
		res.end(`<h3>Auth was Successful, you can close this window</h3>`);

		app.server?.close();
	});

	app.listen(54321, (err: Error) => {
		if (err) {
			vscode.window.showErrorMessage(err.message);
		}
		logger.info("Server Started");
		vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`${constants.API_BASE_URL}/auth/github`));
	});
}
