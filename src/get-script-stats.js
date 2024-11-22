/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	const waitTime = 2000;
	
	function formatMoney(amount) {
		if (amount >= 1e9) {
			return `$${Math.floor(amount / 1e9)}B`;
		} else if (amount >= 1e6) {
			return `$${Math.floor(amount / 1e6)}M`;
		} else {
			return `$${amount.toLocaleString()}`;
		}
	}

	while (true) {
		ns.clearLog();
		ns.print(`Total Script XP: ${ns.getTotalScriptExpGain()}`);
		ns.print(`Total Script Money: ${formatMoney(ns.getTotalScriptIncome())}`);

		await ns.sleep(waitTime);
	}
}
