import { createServer, startServer } from "./server";

createServer().then(startServer).catch(console.log);
