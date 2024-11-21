/** @param {NS} ns **/
export async function main(ns) {
    const maxNodes = 20;
    const upgradeLimit = 10;

    while (true) {
        if (ns.hacknet.numNodes() < maxNodes) {
            if (ns.getPlayer().money > ns.hacknet.getPurchaseNodeCost()) {
                ns.hacknet.purchaseNode();
            }
        }

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            let cheapestUpgrade = Math.min(
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
