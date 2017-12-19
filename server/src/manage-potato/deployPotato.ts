import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";

interface IPotato {
  id: string;
}

export default async (event: FunctionEvent<{}>) => {
  console.log(event);

  try {
    if (!event.context.auth || !event.context.auth.nodeId || event.context.auth.typeName !== "User") {
      return { error: "Insufficient Permissions" };
    }

    const graphcool = fromEvent(event);
    const api = graphcool.api("simple/v1");

    const userId = event.context.auth.nodeId;

    const potatoId = await createNewPotato(api, userId);

    return { data: { id: potatoId } };
  } catch (e) {
    console.log(e);
    return { error: "An unexpected error occured during deployPotato." };
  }
};

async function createNewPotato(api: GraphQLClient, userId: string): Promise<string> {
  const mutation = `
    mutation createNewPotato($userId: ID!) {
      createPotato(
        createdById: $userId
      ) {
        id
      }
    }
  `;

  const variables = {
    userId,
  };

  return api.request<{ createPotato: IPotato }>(mutation, variables)
    .then((res) => res.createPotato.id);
}
