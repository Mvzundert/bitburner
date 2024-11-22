/** @param {NS} ns **/
export async function main(ns) {
		ns.disableLog("ALL");

    const args = ns.flags([
        ['help', false],
        ['secThresh', 5],
        ['moneyThresh', 0.75],
        ['refreshRate', 200],
        ['detailedLog', true]
    ]);

    const hostname = args._[0];

    if (args.help || !hostname) {
        ns.tprint("This script will generate money by hacking a target server.");
        ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME [OPTIONS]`);
        ns.tprint("Options:");
        ns.tprint("--secThresh VALUE     Set security threshold (default: 5)");
        ns.tprint("--moneyThresh VALUE   Set money threshold percentage (default: 0.75)");
        ns.tprint("--refreshRate VALUE   Set refresh rate in milliseconds (default: 200)");
        ns.tprint("--detailedLog         Disable detailed logging");
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} n00dles --secThresh 3 --moneyThresh 0.8 --refreshRate 100 --detailedLog`);
        return;
    }

    const securityThreshold = ns.getServerMinSecurityLevel(hostname) + args.secThresh;
    const moneyThreshold = ns.getServerMaxMoney(hostname) * args.moneyThresh;
    const refreshRate = args.refreshRate;
    const detailedLog = args.detailedLog;

    while (true) {
        const securityLevel = ns.getServerSecurityLevel(hostname);
        const availableMoney = ns.getServerMoneyAvailable(hostname);

        if (securityLevel > securityThreshold) {
            if (detailedLog) ns.print(`Weakening ${hostname} (security: ${securityLevel.toFixed(2)}/${securityThreshold})`);
            await ns.weaken(hostname);
        } else if (availableMoney < moneyThreshold) {
            if (detailedLog) ns.print(`Growing ${hostname} (money: ${ns.nFormat(availableMoney, "$0.000a")}/${ns.nFormat(moneyThreshold, "$0.000a")})`);
            await ns.grow(hostname);
        } else {
            if (detailedLog) ns.print(`Hacking ${hostname} (money: ${ns.nFormat(availableMoney, "$0.000a")})`);
            await ns.hack(hostname);
        }

        await ns.sleep(refreshRate);
    }
}
