const html = await fetch("https://www.chemistwarehouse.co.nz/shop-online/81/vitamins", {
  headers: { "user-agent": "Mozilla/5.0" },
}).then((response) => response.text());

const srcs = [];
const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
let match;
while ((match = scriptRegex.exec(html))) srcs.push(match[1]);

console.log(srcs.join("\n"));
