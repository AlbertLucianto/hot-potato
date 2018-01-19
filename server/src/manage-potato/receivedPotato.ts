import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";

interface IEventData {
  filterDropped?: boolean;
  currentlyHold?: boolean;
}

interface IHolder {
  id: string;
  potato: { id: string, droppedDate: string };
  passedFrom: { id: string, name: string, email: string };
  seen: boolean;
}

export default async (event: FunctionEvent<IEventData>) => {
  console.log(event);

  try {
    if (!event.context.auth || !event.context.auth.nodeId || event.context.auth.typeName !== "User") {
      return { error: "Insufficient Permissions" };
    }

    const graphcool = fromEvent(event);
    const api = graphcool.api("simple/v1");

    const userId = event.context.auth.nodeId;
    const { filterDropped, currentlyHold } = event.data;

    const listPotato = await getListPotato(api, userId, !!filterDropped, !!currentlyHold);

    const unseenHolders = listPotato
      .filter((holder) => !holder.seen)
      .map((holder) => holder.id);

    await Promise.all(unseenHolders.map((holderId) => setSeen(api, holderId)));

    return { data: listPotato };
  } catch (e) {
    console.log(e);
    return { error: "An unexpected error occured during deployPotato." };
  }
};

async function getListPotato(
  api: GraphQLClient,
  userId: string,
  filterDropped: boolean,
  currentlyHold: boolean,
) {
  const query = `
    query getListPotato(
      $userId: ID!,
      ${filterDropped ? "$currentDate: DateTime!" : ""}
    ) {
      allHolders(filter: {
        user: { id: $userId },
        passedFrom: { id_not: $userId },
        potato: {
          ${filterDropped ? "droppedDate_gt: $currentDate," : ""}
          ${currentlyHold ? "lastHeldBy: { id: $userId }" : ""}
        }
      }) {
        id
        seen
        potato {
          id
          droppedDate
        }
        passedFrom {
          id
          name
          email
        }
      }
    }
  `;

  const variables: {
    currentDate?: string,
    userId: string,
  } = { userId };

  if (filterDropped) {
    variables.currentDate = new Date().toISOString();
  }

  return api.request<{ allHolders: [IHolder] }>(query, variables)
    .then((res) => res.allHolders);
}

async function setSeen(api: GraphQLClient, holderId: string) {
  const mutation = `
    mutation setSeen($holderId: ID!) {
      updateHolder(id: $holderId, seen: true) {
        id
      }
    }
  `;

  const variables = { holderId };

  return api.request<{ IHolder }>(mutation, variables);
}
