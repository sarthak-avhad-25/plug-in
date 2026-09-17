const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetCatch = `    } catch (err: any) {
      console.error("Download error:", err);
      setDownloadErrors(prev => ({ ...prev, [song.id]: "Failed" }));
      setDownloadProgress(prev => { const n = {...prev}; delete n[song.id]; return n; });
      if (err.name === 'QuotaExceededError' || err.message.includes('Quota')) {
        alert("Not enough storage to download this song.");
      }
    }`;

const replaceCatch = `    } catch (err: any) {
      console.warn("Download error:", err.message || err);
      setDownloadErrors(prev => ({ ...prev, [song.id]: "Failed" }));
      setDownloadProgress(prev => { const n = {...prev}; delete n[song.id]; return n; });
      if (err.name === 'QuotaExceededError' || (err.message && err.message.includes('Quota'))) {
        alert("Not enough storage to download this song.");
      }
    }`;

code = code.replace(targetCatch, replaceCatch);
fs.writeFileSync('src/app/page.tsx', code);
