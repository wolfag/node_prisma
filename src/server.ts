import Hapi from "@hapi/hapi";
import hapiAuthJWT from "hapi-auth-jwt2";
import status from "./plugins/status";
import prisma from "./plugins/prisma";
import users from "./plugins/users";
import email from "./plugins/email";
import auth from "./plugins/auth";

import dotenv from "dotenv";

dotenv.config();

const server: Hapi.Server = Hapi.server({
  port: process.env.PORT || 3000,
  host: process.env.HOST || "localhost",
});

export async function createServer(): Promise<Hapi.Server> {
  await server.register([hapiAuthJWT, auth, prisma, email, status, users]);
  await server.initialize();
  return server;
}

export async function startServer(server: Hapi.Server): Promise<Hapi.Server> {
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
  return server;
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
