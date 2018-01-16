import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";

interface IPotato {
  id: string;
  duration: number;
}

interface IEventData {
  duration: number;
}

const MIN_DURATION = 12;

export default async (event: FunctionEvent<IEventData>) => {
  console.log(event);

  try {
    if (!event.context.auth || !event.context.auth.nodeId || event.context.auth.typeName !== "User") {
      return { error: "You are not logged in!" };
    }

    const graphcool = fromEvent(event);
    const api = graphcool.api("simple/v1");

    const userId = event.context.auth.nodeId;
    const { duration } = event.data;

    if (!Number.isInteger(duration)) {
      return { error: "Duration must be an integer, representing hour" };
    }

    if (duration < MIN_DURATION) {
      return { error: "Duration must not be less than 12 (hours)" };
    }

    const potatoId = await createNewPotato(api, userId, duration);

    return { data: { id: potatoId } };
  } catch (e) {
    console.log(e);
    return { error: "An unexpected error occured during deployPotato." };
  }
};

async function createNewPotato(api: GraphQLClient, userId: string, duration: number): Promise<string> {
  const mutation = `
    mutation createNewPotato($userId: ID!, $droppedDate: DateTime!, $duration: Int!) {
      createPotato(
        createdById: $userId
        droppedDate: $droppedDate
        duration: $duration
      ) {
        id
      }
    }
  `;

  const variables = {
    droppedDate: new Date(new Date().setTime(new Date().getTime() + duration * 60 * 60 * 1000)).toISOString(),
    duration,
    userId,
  };

  return api.request<{ createPotato: IPotato }>(mutation, variables)
    .then((res) => res.createPotato.id);
}
