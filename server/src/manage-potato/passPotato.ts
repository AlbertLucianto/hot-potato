import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";

interface IEventData {
  receiverId: string;
  potatoId: string;
}

interface IUser {
  id: string;
}

interface IHolder {
  id: string;
  user: { id: string };
}

interface IPotato {
  id: string;
  holders: Array<{ id: string }>;
  droppedDate: string;
  duration: number;
}

export default async (event: FunctionEvent<IEventData>) => {
  console.log(event);

  try {
    if (!event.context.auth || !event.context.auth.nodeId || event.context.auth.typeName !== "User") {
      return { error: "You are not logged in!" };
    }

    const graphcool = fromEvent(event);
    const api = graphcool.api("simple/v1");

    const { receiverId, potatoId } = event.data;
    const userId = event.context.auth.nodeId;

    // check if sender is holding the potato
    const userIsHolding: boolean = await isHolding(api, userId, potatoId);
    if (!userIsHolding) {
      return { error: "User is not holding the potato" };
    }

    // check if the potato has dropped
    const isDropped: boolean = await isPotatoDropped(api, potatoId);
    if (isDropped) {
      return { error: "You have dropped the potato" };
    }

    // check if receiver exists
    const receiverExists: boolean = await getUser(api, receiverId)
      .then((r) => r.User !== null);
    if (!receiverExists) {
      return { error: "User does not exist" };
    }

    // check if receiver has already held the potato
    const userHadReceived: boolean = await hadReceived(api, receiverId, potatoId);
    if (userHadReceived) {
      return { error: "User has already received the potato" };
    }

    // Add to list of holders in the potato
    const { id } = await passPotato(api, potatoId, receiverId, userId);

    const droppedDate = await updateDroppedDate(api, potatoId, receiverId);

    return { data: { id, droppedDate } };
  } catch (e) {
    console.log(e);
    return { error: "An unexpected error occured during passPotato" };
  }
};

async function getUser(api: GraphQLClient, receiverId: string): Promise<{ User }> {
  const query = `
    query getUser($receiverId: ID!) {
      User(id: $receiverId) {
        id
      }
    }
  `;

  const variables = {
    receiverId,
  };

  return api.request<{ User }>(query, variables);
}

async function isHolding(api: GraphQLClient, userId: string, potatoId: string): Promise<boolean> {
  const query = `
    query isHolding($potatoId: ID!) {
      Potato(id: $potatoId) {
        lastHeldBy {
          id
        }
      }
    }
  `;

  const variables = {
    potatoId,
  };

  return api.request<{ Potato: { lastHeldBy: IUser } }>(query, variables)
    .then((r) => !r.Potato.lastHeldBy || r.Potato.lastHeldBy.id === userId);
}

async function isPotatoDropped(api: GraphQLClient, potatoId: string): Promise<boolean> {
  const query = `
    query isDropped($potatoId: ID!) {
      Potato(id: $potatoId) {
        droppedDate
      }
    }
  `;

  const variables = {
    potatoId,
  };

  return api.request<{ Potato: IPotato }>(query, variables)
    .then((r) => new Date(r.Potato.droppedDate) < new Date());
}

async function hadReceived(api: GraphQLClient, receiverId: string, potatoId: string): Promise<boolean> {
  const query = `
    query hasReceived($receiverId: ID!, $potatoId: ID!) {
      Potato(id: $potatoId) {
        holders(filter: {
          user: {
            id: $receiverId
          }
        }) {
          id
        }
      }
    }
  `;

  const variables = {
    potatoId,
    receiverId,
  };

  return api.request<{ Potato: IPotato }>(query, variables)
    .then((r) => !!r.Potato.holders.length);
}

async function passPotato(
  api: GraphQLClient,
  potatoId: string,
  receiverId: string,
  passedFromId: string,
): Promise<IHolder> {
  const mutation = `
    mutation passPotato($potatoId: ID!, $receiverId: ID!, $passedFromId: ID!) {
      createHolder(potatoId: $potatoId, userId: $receiverId, passedFromId: $passedFromId) {
        id
      }
    }
  `;

  const variables = {
    passedFromId,
    potatoId,
    receiverId,
  };

  return api.request<{ createHolder: IHolder }>(mutation, variables)
    .then((r) => r.createHolder);
}

async function updateDroppedDate(
  api: GraphQLClient,
  potatoId: string,
  receiverId: string,
): Promise<string> {

  const { duration } = await api.request<{ Potato: IPotato }>(`
    query potatoDuration($potatoId: ID!) {
      Potato(id: $potatoId) {
        duration
      }
    }
  `, { potatoId })
    .then((r) => r.Potato);

  const newDroppedDate = new Date(new Date().setTime(new Date().getTime() + duration * 60 * 60 * 1000)).toISOString();

  const mutation = `
    mutation updateDroppedDate($potatoId: ID!, $droppedDate: DateTime!, $receiverId: ID!) {
      updatePotato(id: $potatoId, droppedDate: $droppedDate, lastHeldById: $receiverId) {
        id
        droppedDate
      }
    }
  `;

  const variables = {
    droppedDate: newDroppedDate,
    potatoId,
    receiverId,
  };

  return api.request<{ updatePotato: IPotato }>(mutation, variables)
    .then((r) => r.updatePotato.droppedDate);
}
