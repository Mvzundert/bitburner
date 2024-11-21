export async function main(ns) {
    const args = ns.flags([['help', false]]);
    const hostname = args._[0];

    if(args.help || !hostname) {
        ns.tprint("This script will generate money by hacking a target server.");
        ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} n00dles`);
        return;
    }

	var securityThreshold = ns.getServerMinSecurityLevel(hostname) + 5;
	var moneyThreshold = ns.getServerMaxMoney(hostname) * 0.75;

    while (true) {
        if (ns.getServerSecurityLevel(hostname) > securityThreshold) {
            await ns.weaken(hostname);
        } else if (ns.getServerMoneyAvailable(hostname) < moneyThreshold) {
            await ns.grow(hostname);
        } else {
            await ns.hack(hostname);
        }
    }
}
