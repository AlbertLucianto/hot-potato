import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";

interface IEventData {
  length: number;
}

interface IHolder {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}

interface IHolders extends Array<IHolder> {}

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
      shamefulUserCount[user.id] = { count: 1, user });

    const shamefulUserList = Object.keys(shamefulUserCount)
      .map((key) => shamefulUserCount[key])
      .sort((l, r) => l.count - r.count);

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
        holders(orderBy: sequence_ASC, last:1) {
          user {
            id,
            name,
            email,
            createdAt
          }
        }
      }
    }
  `;

  const variables = {
    currentTime,
  };

  return api.request<{ allPotatoes: Array<{ holders: IHolders }> }>(query, variables)
    .then((r) => r.allPotatoes.filter((potato) => potato.holders.length > 0)
      .map((potato) => ({...potato.holders[0].user })));
}
