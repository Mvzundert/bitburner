/** @param {NS} ns **/
export async function main(ns) {
		ns.disableLog("ALL");
    const exes = [
        { name: "BruteSSH.exe", cost: 500000 },
        { name: "FTPCrack.exe", cost: 1500000 },
        { name: "relaySMTP.exe", cost: 5000000 },
        { name: "HTTPWorm.exe", cost: 30000000 },
        { name: "SQLInject.exe", cost: 250000000 },
    ];

    const torRouterCost = 200000;  // Update this with the actual cost of the TOR router if different
    const checkInterval = 300000;  // Check every 5 minutes to reduce frequent execution

    const bitnode = ns.getPlayer().bitNodeN;
    const canBuyTor = bitnode !== 1;  // TOR is accessible in all Bitnodes except Bitnode 1

    while (true) {
        if (canBuyTor && !ns.getPlayer().tor && ns.getServerMoneyAvailable("home") >= torRouterCost) {
            ns.purchaseTor();
            ns.tprint("Purchased TOR router.");
        }

        if (ns.getPlayer().tor) {
            for (const exe of exes) {
                if (!ns.fileExists(exe.name, "home") && ns.getServerMoneyAvailable("home") >= exe.cost) {
                    ns.purchaseProgram(exe.name);
                    ns.tprint(`Purchased ${exe.name}.`);
                } else if (!ns.fileExists(exe.name, "home")) {
                    ns.tprint(`Next available EXE: ${exe.name} for ${exe.cost}.`);
                    break; // Log the next available EXE and exit the loop
                }
            }
        }

        await ns.sleep(checkInterval);
    }
}
