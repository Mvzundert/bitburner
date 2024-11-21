/** @param {NS} ns **/
export async function main(ns) {
    const stockSymbols = ns.stock.getSymbols();
    const minCash = 1000000;
    const threshold = 0.6;

    while (true) {
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
                    ns.print(`Bought ${toBuy} shares of ${symbol} at ${price}`);
                }
            }

            if (forecast < 0.5 && shares > 0) {
                ns.stock.sell(symbol, shares);
                ns.print(`Sold ${shares} shares of ${symbol} at ${price}`);
            }
        }
        await ns.sleep(60000);
    }
}
