import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";

interface IEventData {
  filterDropped?: boolean;
  currentlyHold?: boolean;
}

interface IHolder {
  potato: { id: string, droppedDate: string };
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
        potato: {
          ${filterDropped ? "droppedDate_lt: $currentDate," : ""}
          ${currentlyHold ? "lastHeldBy: { id: $userId }" : ""}
        }
      }) {
        potato {
          id
          droppedDate
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
    .then((res) => res.allHolders.map((holder) => holder.potato));
}
