/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");

	const homeServer = "home";
	const virus = "basic-hack.js";
	const virusRam = ns.getScriptRam(virus);
	const minCash = 1000000;
	const threshold = 0.6;

	const cracks = {
		"BruteSSH.exe": ns.brutessh,
		"FTPCrack.exe": ns.ftpcrack,
		"relaySMTP.exe": ns.relaysmtp,
		"HTTPWorm.exe": ns.httpworm,
		"SQLInject.exe": ns.sqlinject
	};

	let stockSymbols = [];

	try {
		stockSymbols = ns.stock.getSymbols();
	} catch (e) {
		ns.print("TIX API Access not available.");
	}

	function formatMoney(amount) {
		if (amount >= 1e9) {
			return `$${Math.floor(amount / 1e9)}B`;
		} else if (amount >= 1e6) {
			return `$${Math.floor(amount / 1e6)}M`;
		} else {
			return `$${amount.toLocaleString()}`;
		}
	}

	// Function to get the number of cracks available
	function getNumCracks() {
		return Object.keys(cracks).filter(file => ns.fileExists(file, homeServer)).length;
	}

	// Function to penetrate a server
	function penetrate(server) {
		for (const file of Object.keys(cracks)) {
			if (ns.fileExists(file, homeServer)) {
				cracks[file](server);
			}
		}
	}

	// Function to copy and run the virus on a server
	async function copyAndRunVirus(server, target) {
		await ns.scp(virus, server);

		if (!ns.hasRootAccess(server)) {
			const requiredPorts = ns.getServerNumPortsRequired(server);
			if (requiredPorts > 0) {
				penetrate(server);
			}
			ns.nuke(server);
		}

		if (ns.scriptRunning(virus, server)) {
			ns.scriptKill(virus, server);
		}

		const maxThreads = Math.floor(ns.getServerMaxRam(server) / virusRam);
		ns.exec(virus, server, maxThreads, target);
	}

	// Function to get all network nodes
	function getNetworkNodes() {
		const visited = new Set();
		const stack = ["home"];

		while (stack.length > 0) {
			const node = stack.pop();
			if (!visited.has(node)) {
				visited.add(node);
				stack.push(...ns.scan(node));
			}
		}
		return Array.from(visited);
	}

	// Function to check if a server can be hacked
	function canHack(server) {
		const numCracks = getNumCracks();
		const reqPorts = ns.getServerNumPortsRequired(server);
		const ramAvail = ns.getServerMaxRam(server);
		const hackingSkill = ns.getHackingLevel();
		const serverRequiredSkill = ns.getServerRequiredHackingLevel(server);
		return numCracks >= reqPorts && ramAvail > virusRam && hackingSkill >= serverRequiredSkill;
	}

	// Function to get the best target
	function getBestTarget() {
		const networkNodes = getNetworkNodes().filter(node => canHack(node));
		let bestServer = null;
		let bestValue = 0;

		for (const server of networkNodes) {
			const moneyMax = ns.getServerMaxMoney(server);
			const weakenTime = ns.getWeakenTime(server);
			const growTime = ns.getGrowTime(server);
			const hackTime = ns.getHackTime(server);
			const value = moneyMax / (weakenTime + growTime + hackTime);

			if (value > bestValue) {
				bestValue = value;
				bestServer = server;
			}
		}
		return bestServer;
	}

	// Function to deploy hacks to targets
	async function deployHacks(targets) {
		for (const serv of targets) {
			const bestTarget = getBestTarget();
			if (bestTarget) {
				await copyAndRunVirus(serv, bestTarget);
				ns.clearLog();
				ns.print(`Targeting server: ${bestTarget}`);
				ns.print(`Server security: ${ns.getServerSecurityLevel(bestTarget)}`);
				ns.print(`Server money: ${formatMoney(ns.getServerMoneyAvailable(bestTarget))}`);
				ns.print(`Weaken time: ${ns.tFormat(ns.getWeakenTime(bestTarget))}`);
				ns.print(`Grow time: ${ns.tFormat(ns.getGrowTime(bestTarget))}`);
				ns.print(`Hack time: ${ns.tFormat(ns.getHackTime(bestTarget))}`);
				ns.print(`Potential money gain: ${formatMoney(ns.getServerMaxMoney(bestTarget) * 0.5)}`);
			}
		}
	}

	// Function to manage Hacknet nodes
	async function manageHacknet() {
		const maxNodes = 20;
		const upgradeLimit = 10;

		while (true) {
			if (ns.hacknet.numNodes() < maxNodes) {
				if (ns.getPlayer().money > ns.hacknet.getPurchaseNodeCost()) {
					ns.hacknet.purchaseNode();
				}
			}

			for (let i = 0; i < ns.hacknet.numNodes(); i++) {
				const cheapestUpgrade = Math.min(
					ns.hacknet.getLevelUpgradeCost(i, 1),
					ns.hacknet.getRamUpgradeCost(i, 1),
					ns.hacknet.getCoreUpgradeCost(i, 1)
				);

				if (ns.getPlayer().money > cheapestUpgrade) {
					if (cheapestUpgrade === ns.hacknet.getLevelUpgradeCost(i, 1) && ns.hacknet.getNodeStats(i).level < upgradeLimit) {
						ns.hacknet.upgradeLevel(i, 1);
					} else if (cheapestUpgrade === ns.hacknet.getRamUpgradeCost(i, 1) && ns.hacknet.getNodeStats(i).ram < upgradeLimit) {
						ns.hacknet.upgradeRam(i, 1);
					} else if (cheapestUpgrade === ns.hacknet.getCoreUpgradeCost(i, 1) && ns.hacknet.getNodeStats(i).cores < upgradeLimit) {
						ns.hacknet.upgradeCore(i, 1);
					}
				}
			}

			await ns.sleep(1000);
		}
	}

	// Function to manage stocks
	async function manageStocks() {
		while (stockSymbols.length > 0) {
			for (const symbol of stockSymbols) {
				const position = ns.stock.getPosition(symbol);
				const [shares, avgPrice, sharesShort, avgShortPrice] = position;
				const forecast = ns.stock.getForecast(symbol);
				const price = ns.stock.getPrice(symbol);
				const playerMoney = ns.getPlayer().money;

				if (forecast > threshold && playerMoney > minCash) {
					const maxShares = ns.stock.getMaxShares(symbol);
					const toBuy = Math.min(maxShares - shares, Math.floor((playerMoney - minCash) / price));
					if (toBuy > 0) {
						ns.stock.buy(symbol, toBuy);
					}
				}

				if (forecast < 0.5 && shares > 0) {
					ns.stock.sell(symbol, shares);
				}
			}
			await ns.sleep(60000);
		}
	}

	// Function to maximize XP gains
	async function maximizeXPGains(target) {
		const xpBefore = ns.getPlayer().hacking_exp;
		await ns.hack(target);
		const xpAfter = ns.getPlayer().hacking_exp;
		const xpGained = xpAfter - xpBefore;
		ns.print(`Gained XP: ${xpGained} from hacking ${target}`);
	}

	// Main script execution
	const curTargets = [];
	const waitTime = 2000;

	ns.run("manageHacknet.js");
	if (stockSymbols.length > 0) {
		ns.run("manageStocks.js");
	}

	while (true) {
		ns.clearLog(); // Clear log at the start of each iteration

		const newTargets = getNetworkNodes().filter(node => canHack(node));

		if (newTargets.length !== curTargets.length) {
			await deployHacks(newTargets);
			curTargets.length = newTargets.length;
		}

		const target = getBestTarget();

		if (target) {
			await maximizeXPGains(target);
		}
		await ns.sleep(waitTime);
	}
}
