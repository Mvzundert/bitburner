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

	function getNumCracks() {
		return Object.keys(cracks).filter(file => ns.fileExists(file, homeServer)).length;
	}

	function penetrate(server) {
		for (const file of Object.keys(cracks)) {
			if (ns.fileExists(file, homeServer)) {
				cracks[file](server);
			}
		}
	}

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

	function canHack(server) {
		const numCracks = getNumCracks();
		const reqPorts = ns.getServerNumPortsRequired(server);
		const ramAvail = ns.getServerMaxRam(server);
		const hackingSkill = ns.getHackingLevel();
		const serverRequiredSkill = ns.getServerRequiredHackingLevel(server);
		return numCracks >= reqPorts && ramAvail > virusRam && hackingSkill >= serverRequiredSkill;
	}

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

	function getTargetServers() {
		var networkNodes = getNetworkNodes();
		const targets = networkNodes.filter(function (node) { return canHack(node); });

		// Add purchased servers
		var i = 0;
		var servPrefix = "pserv-";

		while (ns.serverExists(servPrefix + i)) {
			targets.push(servPrefix + i);
			++i;
		}

		return targets;
	}

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

	var curTargets = [];
	const waitTime = 2000;

	ns.run("manageHacknet.js");

	if (stockSymbols.length > 0) {
		ns.run("manageStocks.js");
	}

	while (true) {
		var newTargets = getTargetServers();

		if (newTargets.length !== curTargets.length) {
			await deployHacks(newTargets);

			curTargets = newTargets;
		}

		await ns.sleep(waitTime);
	}
}
