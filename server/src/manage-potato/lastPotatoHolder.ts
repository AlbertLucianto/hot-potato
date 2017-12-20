import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";

interface IEventData {
  potatoId: string;
}

interface IHolder {
  user: { id: string };
}

export default async (event: FunctionEvent<IEventData>) => {
  console.log(event);

  try {
    const graphcool = fromEvent(event);
    const api = graphcool.api("simple/v1");

    const { potatoId } = event.data;

    const holderId = await lastHeldBy(api, potatoId);

    return { data: { id: holderId } };
  } catch (e) {
    console.log(e);
    return { error: "An unexpected error occured during passPotato" };
  }
};

async function lastHeldBy(api: GraphQLClient, potatoId: string): Promise<string|null> {
  const query = `
    query isHolding($potatoId: ID!) {
      allHolders(
        filter: {
          potato: {
            id: $potatoId
          }
        },
        orderBy: sequence_ASC,
        last: 1
      ) {
        user {
          id
        }
      }
    }
  `;

  const variables = {
    potatoId,
  };

  return api.request<{ allHolders: [IHolder] }>(query, variables)
    .then((r) => r.allHolders[0] ? r.allHolders[0].user.id : null);
}
