const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const importTarget = `import { loadProfiles, saveProfilesServer, loadActiveProfile, saveActiveProfileServer, loadPlaylistsServer, savePlaylistsServer, deletePlaylistsServer } from "./storage";`;
const importReplace = `import { loadProfiles, saveProfilesServer, loadActiveProfile, saveActiveProfileServer, loadPlaylistsServer, savePlaylistsServer, deletePlaylistsServer } from "./storage";
import { Onboarding } from "./Onboarding";
import { logout, type AuthUser } from "./auth";`;

code = code.replace(importTarget, importReplace);
fs.writeFileSync('src/app/page.tsx', code);
