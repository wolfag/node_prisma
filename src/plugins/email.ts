import { ServerApplicationState } from "./../../node_modules/@types/hapi__hapi/index.d";
import Hapi from "@hapi/hapi";
import Joi from "@hapi/joi";
import Boom from "@hapi/boom";
import sendgrid from "@sendgrid/mail";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    sendEmailToken(email: string, token: string): Promise<void>;
  }
}

const emailPlugin: Hapi.Plugin<null> = {
  name: "app/email",
  register: async (server: Hapi.Server) => {
    if (!process.env.SENDGRID_API_KEY) {
      console.log(
        `The SENDGRID_API_KEY env var must be set, otherwise the API won't be able to send emails.`,
        `Using debug mode which logs the email tokens instead.`
      );
      server.app.sendEmailToken = debugSendEmailToken;
    } else {
      sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
      server.app.sendEmailToken = sendEmailToken;
    }
  },
};

export default emailPlugin;

async function sendEmailToken(email: string, token: string) {
  const msg = {
    to: email,
    from: "bittetdo@yahoo.com.vn",
    subject: "Login token for the modern backend API",
    text: `The login for the API is: ${token}`,
  };

  console.log({ msg });

  await sendgrid.send(msg);
}

async function debugSendEmailToken(email: string, token: string) {
  console.log("<<<<<");
  console.log(`email token for ${email}: ${token}`);
}
