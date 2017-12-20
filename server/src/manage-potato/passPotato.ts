import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";

interface IEventData {
  userId: string;
  potatoId: string;
}

interface IHolder {
  id: string;
}

interface IPotatoPayload {
  holders: Array<{ id: string }>;
}

export default async (event: FunctionEvent<IEventData>) => {
  console.log(event);

  try {
    if (!event.context.auth || !event.context.auth.nodeId || event.context.auth.typeName !== "User") {
      return { error: "Insufficient Permissions" };
    }

    const graphcool = fromEvent(event);
    const api = graphcool.api("simple/v1");

    const { userId, potatoId } = event.data;

    // check if sender is holding the potato
    // check if the potato has dropped

    // check if receiver exists
    const userExists: boolean = await getUser(api, userId)
      .then((r) => r.User !== null);
    if (!userExists) {
      return { error: "User does not exist" };
    }

    // check if receiver has already held the potato
    const userHadReceived: boolean = await hadReceived(api, userId, potatoId)
      .then((r) => !!r.Potato.holders.length);
    if (userHadReceived) {
      return { error: "User has already received the potato" };
    }

    const holderId = await passPotato(api, potatoId, userId);

    return { data: { id: holderId } };
  } catch (e) {
    console.log(e);
    return { error: "An unexpected error occured during passPotato" };
  }
};

async function getUser(api: GraphQLClient, userId: string): Promise<{ User }> {
  const query = `
    query getUser($userId: ID!) {
      User(id: $userId) {
        id
      }
    }
  `;

  const variables = {
    userId,
  };

  return api.request<{ User }>(query, variables);
}

async function hadReceived(api: GraphQLClient, userId: string, potatoId: string): Promise<{ Potato: IPotatoPayload }> {
  const query = `
    query hasReceived($userId: ID!, $potatoId: ID!) {
      Potato(id: $potatoId) {
        holders(filter: {
          user: {
            id: $userId
          }
        }) {
          id
        }
      }
    }
  `;

  const variables = {
    potatoId,
    userId,
  };

  return api.request<{ Potato }>(query, variables);
}

async function passPotato(api: GraphQLClient, potatoId: string, userId: string): Promise<string> {
  const mutation = `
    mutation passPotato($potatoId: ID!, $userId: ID!) {
      createHolder(potatoId: $potatoId, userId: $userId, sequence: 42) {
        id
      }
    }
  `;

  const variables = {
    potatoId,
    userId,
  };

  return api.request<{ createHolder: IHolder }>(mutation, variables)
    .then((r) => r.createHolder.id);
}
