// Imported for its side effect, and imported first, in standalone scripts
// (seed, promote-admin). A plain `config()` call below other imports doesn't
// work: import statements are hoisted above ordinary statements, so a DB
// client imported afterward would still initialize before env vars are set.
import { config } from "dotenv";

config({ path: ".env.local" });
