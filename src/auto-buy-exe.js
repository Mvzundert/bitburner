/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");

    const exes = [
        { name: "BruteSSH.exe", cost: 500000 },
        { name: "FTPCrack.exe", cost: 1500000 },
        { name: "relaySMTP.exe", cost: 5000000 },
        { name: "HTTPWorm.exe", cost: 30000000 },
        { name: "SQLInject.exe", cost: 250000000 },
        { name: "ServerProfiler.exe", cost: 500000000 },
        { name: "DeepscanV1.exe", cost: 500000000 },
        { name: "DeepscanV2.exe", cost: 2500000000 },
        { name: "AutoLink.exe", cost: 250000000 },
        { name: "Formulas.exe", cost: 50000000000 },
    ];

    const torRouterCost = 200000;  // Update this with the actual cost of the TOR router if different
    const checkInterval = 300000;  // Check every 5 minutes to reduce frequent execution

    const bitnode = ns.getPlayer().bitNodeN;
    const canBuyTor = bitnode !== 1;  // TOR is accessible in all Bitnodes except Bitnode 1

    while (true) {
        if (canBuyTor && !ns.getPlayer().tor && ns.getServerMoneyAvailable("home") >= torRouterCost) {
            ns.purchaseTor();
            ns.print("Purchased TOR router.");
        }

        ns.print("Installed EXEs:");
        for (const exe of exes) {
            if (ns.fileExists(exe.name, "home")) {
                ns.print(`- ${exe.name}, ${exe.cost}`);
            }

            if (!ns.fileExists(exe.name, "home") && ns.getServerMoneyAvailable("home") >= exe.cost) {
                ns.purchaseProgram(exe.name);
                ns.print(`Purchased ${exe.name}.`);
            } else if (!ns.fileExists(exe.name, "home")) {
                ns.print(`Next available EXE: ${exe.name} for ${exe.cost}.`);
                break; // Log the next available EXE and exit the loop
            }
        }

        await ns.sleep(checkInterval);
    }
}
