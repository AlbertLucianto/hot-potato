import * as FormData from "form-data";
import { FunctionEvent } from "graphcool-lib";
import * as fetch from "isomorphic-fetch";

interface IEventData {
  tag: string;
  from: string;
  to: [string];
  subject: string;
  text: string;
  recipientVariables: object | null;
}

export default async (event: FunctionEvent<IEventData>) => {
  console.log(event);

  if (!process.env.MAILGUN_API_KEY) {
    console.log("Please provide a valid mailgun secret key!");
    return { error: "Module not configured correctly." };
  }

  if (!process.env.MAILGUN_DOMAIN) {
    console.log("Please provide a valid mailgun domain!");
    return { error: "Module not configured correctly." };
  }

  try {
    const token = new Buffer(`api:${process.env.MAILGUN_API_KEY}`).toString("base64");
    const endpoint = `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;

    const { tag, to, from, subject, text } = event.data;
    const recipientVariables = event.data.recipientVariables || {};

    if (to.length > 1000) {
      return { error: `Can't batch more than 1000 emails!` };
    }

    const form = new FormData();
    form.append("from", from);

    for (const email of to) {
      form.append("to", email);
    }

    form.append("subject", subject);
    form.append("text", text);
    form.append("recipient-variables", JSON.stringify(recipientVariables));

    const data = await fetch(endpoint, {
      body: form,
      headers: {
        Authorization: `Basic ${token}`,
      },
      method: "POST",
    })
      .then((response) => response.json());

    return { data: { success: true } };
  } catch (e) {
    console.log(`Email could not be sent because an error occured:`);
    console.log(e);
    return { error: "An unexpected error occured while sending email." };
  }
};
