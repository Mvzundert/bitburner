/** @param {NS} ns **/
export async function main(ns) {
    // Get all servers in the network
    const servers = findAllServers(ns);

    let bestServer = null;
    let bestValue = 0;

    for (const server of servers) {
        // Skip servers that are not hackable
        if (!ns.hasRootAccess(server) || ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) {
            continue;
        }

        // Server stats
        const maxMoney = ns.getServerMaxMoney(server);
        const minSecurity = ns.getServerMinSecurityLevel(server);
        const hackTime = ns.getHackTime(server);
        const growTime = ns.getGrowTime(server);
        const weakenTime = ns.getWeakenTime(server);

        // Calculate a score based on maxMoney and combined times (lower is better)
        if (maxMoney > 0) {
            const efficiency = maxMoney / (hackTime + growTime + weakenTime);

            if (efficiency > bestValue) {
                bestValue = efficiency;
                bestServer = server;
            }
        }
    }

    if (bestServer) {
        ns.tprint(`Best server found: ${bestServer}`);
        ns.tprint(`Max Money: $${ns.getServerMaxMoney(bestServer).toLocaleString()}`);
        ns.tprint(`Hack Time: ${ns.tFormat(ns.getHackTime(bestServer))}`);
        ns.tprint(`Grow Time: ${ns.tFormat(ns.getGrowTime(bestServer))}`);
        ns.tprint(`Weaken Time: ${ns.tFormat(ns.getWeakenTime(bestServer))}`);
    } else {
        ns.tprint("No suitable server found.");
    }
}

/**
 * Helper function to find all servers in the network
 * @param {NS} ns
 * @returns {string[]} Array of server names
 */
function findAllServers(ns) {
    const visited = new Set();
    const servers = [];

    function dfs(server) {
        if (visited.has(server)) return;
        visited.add(server);
        servers.push(server);
        const neighbors = ns.scan(server);
        for (const neighbor of neighbors) {
            dfs(neighbor);
        }
    }

    dfs('home');
    return servers;
}

