import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";

interface IEventData {
  length: number;
}

interface IPotato {
  lastHeldBy: {
    id: string;
    name: string;
    email: string;
  };
}

export default async (event: FunctionEvent<IEventData>) => {
  console.log(event);

  try {
    const graphcool = fromEvent(event);
    const api = graphcool.api("simple/v1");

    // get all users that are shameful
    const allShamefulUsers = await getAllDroppedPotatoes(api, new Date());

    const shamefulUserCount = {};
    allShamefulUsers.forEach((user) => (user.id in shamefulUserCount) ?
      shamefulUserCount[user.id].count++ :
      shamefulUserCount[user.id] = { count: 1, ...user });

    const shamefulUserList = Object.keys(shamefulUserCount)
      .map((key) => shamefulUserCount[key])
      .sort((l, r) => r.count - l.count);

    return { data: ("length" in event.data && event.data.length < shamefulUserList.length) ?
      shamefulUserList.slice(0, event.data.length) : shamefulUserList };
  } catch (e) {
    console.log(e);
    return { error: "An unexpected error occured during hallOfShame" };
  }
};

async function getAllDroppedPotatoes(api: GraphQLClient, currentTime: Date) {
  // TODO: convert to groupBy format when the API is supported
  // https://github.com/graphcool/framework/issues/1312
  const query = `
    query getAllDroppedPotatoes($currentTime: DateTime!) {
      allPotatoes(filter: {
        droppedDate_lt: $currentTime
      }) {
        lastHeldBy {
          id,
          name,
          email,
        }
      }
    }
  `;

  const variables = {
    currentTime,
  };

  return api.request<{ allPotatoes: [IPotato] }>(query, variables)
    .then((r) => r.allPotatoes.map((potato) => potato.lastHeldBy));
}
