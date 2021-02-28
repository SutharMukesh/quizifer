import * as vscode from "vscode";

let isInit = false;
let logger: vscode.OutputChannel;
let loggerObj: any;

/**
 * logs to outputChannel.
 * 
 * @param {vscode.OutputChannel} this 
 * @param {string} module - File/Module Name. 
 * @param {string} level - logger level 
 * @param {string} msg
 */
function logHandler(this: vscode.OutputChannel, module: string, level: string, msg: string) {
	this.appendLine(`[${new Date().toLocaleString()}] [${module}] [${level}] : ${msg}`);
}

/**
 * Creates an OutputChannel as per extensionName
 * 
 * @param {string} extensionName - Vscode Extension name
 */
export const initLogger = (extensionName:string) => {
	logger = vscode.window.createOutputChannel(extensionName);
	isInit = true;
	loggerObj = (module: string) => {
		return {
			info: logHandler.bind(logger, module, "info"),
			warn: logHandler.bind(logger, module, "warn"),
            debug: logHandler.bind(logger, module, "debug"),
			error: logHandler.bind(logger, module, "error"),
		};
	};
};

/**
 * Get logger object.
 * 
 * @param module - Module/file name
 * @returns - logger object which has (info, warn, error) method. 
 */
export const getLogger = (module: string) => {
	if (!isInit) {
		throw new Error(`logger: Cannot get logger, please initialize first!`);
	}
	return loggerObj(module);
};
