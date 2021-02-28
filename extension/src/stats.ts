import axios from "axios";
import { API_BASE_URL } from "./constants";
import { getLogger } from "./logger";

export const statModule = {
	notified: async () => {
		await axios.put(`${API_BASE_URL}/stats/n`);
		getLogger("statModule").info("user got qotd notified");
	},
	attempted: async () => {
		await axios.put(`${API_BASE_URL}/stats/a`);
		getLogger("statModule").info("user attempted qotd");
	},
	ignored: async () => {
		await axios.put(`${API_BASE_URL}/stats/i`);
		getLogger("statModule").info("user ignored qotd");
	},
};
