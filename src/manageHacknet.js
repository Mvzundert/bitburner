/** @param {NS} ns **/
export async function main(ns) {
    const maxNodes = 20;
    const upgradeLimit = 10;
    let initialMoney = ns.getPlayer().money;
    let moneySpent = 0;
    let nodesBought = 0;
    let upgrades = { levels: 0, ram: 0, cores: 0 };

    function formatMoney(amount) {
        if (amount >= 1e6) {
            return `$${(amount / 1e6).toFixed(2)}M`;
        } else if (amount >= 1e5) {
            return `$${(amount / 1e5).toFixed(2)}00K`;
        } else {
            return `$${amount.toLocaleString()}`;
        }
    }

    while (true) {
        if (ns.hacknet.numNodes() < maxNodes) {
            let nodeCost = ns.hacknet.getPurchaseNodeCost();
            if (ns.getPlayer().money > nodeCost) {
                ns.hacknet.purchaseNode();
                nodesBought++;
                moneySpent += nodeCost;
            }
        }

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            let levelCost = ns.hacknet.getLevelUpgradeCost(i, 1);
            let ramCost = ns.hacknet.getRamUpgradeCost(i, 1);
            let coreCost = ns.hacknet.getCoreUpgradeCost(i, 1);
            let cheapestUpgrade = Math.min(levelCost, ramCost, coreCost);

            if (ns.getPlayer().money > cheapestUpgrade) {
                if (cheapestUpgrade === levelCost && ns.hacknet.getNodeStats(i).level < upgradeLimit) {
                    ns.hacknet.upgradeLevel(i, 1);
                    upgrades.levels++;
                    moneySpent += levelCost;
                } else if (cheapestUpgrade === ramCost && ns.hacknet.getNodeStats(i).ram < upgradeLimit) {
                    ns.hacknet.upgradeRam(i, 1);
                    upgrades.ram++;
                    moneySpent += ramCost;
                } else if (cheapestUpgrade === coreCost && ns.hacknet.getNodeStats(i).cores < upgradeLimit) {
                    ns.hacknet.upgradeCore(i, 1);
                    upgrades.cores++;
                    moneySpent += coreCost;
                }
            }
        }

        ns.clearLog();
        ns.print(`Initial Money: ${formatMoney(initialMoney)}`);
        ns.print(`Money Spent: ${formatMoney(moneySpent)}`);
        ns.print(`Money Left: ${formatMoney(ns.getPlayer().money)}`);
        ns.print(`Nodes Bought: ${nodesBought}`);
        ns.print(`Upgrades: Levels - ${upgrades.levels}, RAM - ${upgrades.ram}, Cores - ${upgrades.cores}`);

        await ns.sleep(1000);
    }
}
