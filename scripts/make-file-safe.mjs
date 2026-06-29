import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const indexPath = resolve("dist/index.html");
let html = await readFile(indexPath, "utf8");

html = html
  .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/, '<script defer src="$1"></script>')
  .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/, '<link rel="stylesheet" href="$1">')
  .replace(
    '<div id="root"></div>',
    `<div id="root">
      <div style="font-family:Arial,sans-serif;padding:24px;color:#17211d;">
        Loading Kiwi Supplement Watch...
      </div>
    </div>
    <script>
      window.addEventListener('error', function (event) {
        var root = document.getElementById('root');
        if (root && root.textContent.indexOf('Loading Kiwi Supplement Watch') !== -1) {
          root.innerHTML = '<div style="font-family:Arial,sans-serif;margin:24px;padding:18px;border:1px solid #e2e8e4;border-radius:8px;"><strong>Kiwi Supplement Watch could not start.</strong><p style="color:#66736d;">' + String(event.message || 'Unknown browser error') + '</p></div>';
        }
      });
    </script>`
  );

await writeFile(indexPath, html);
console.log(`Made ${indexPath} safe for direct file:// viewing.`);
