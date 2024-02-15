import { Client } from "discord.js";
import { ExpManager } from "../managers/ExpManager";
import { ObjectManager } from "../managers/ObjectManager";
import { MongoDBClient } from "../MongoDBClient";

interface UsersInVoice {
  id: string;
  joinedAt: Date;
}

const usersInVoice: UsersInVoice[] = [];

async function updateUserTimeSpent(
  userId: string,
  timeSpent: number,
): Promise<void> {
  const user = await MongoDBClient.getInstance().getUser(userId);
  if (user === null || user === undefined) return;
  user.timeSpent += timeSpent;

  const manager = ObjectManager.getInstance().getObject(
    ExpManager.name,
  ) as ExpManager;

  await manager.addExp(user, timeSpent);
}

export default (client: Client): void => {
  client.on("voiceStateUpdate", (oldState, newState) => {
    const member = oldState.member || newState.member;

    if (!member) return;
    if (
      !client.user ||
      !client.application ||
      oldState.member?.user.bot ||
      newState.member?.user.bot
    ) {
      return;
    }

    if (oldState.channelId === null && newState.channelId !== null) {
      usersInVoice.push({ id: member.user.id, joinedAt: new Date() });
    } else if (oldState.channelId !== null && newState.channelId === null) {
      const user = usersInVoice.find((u) => u.id === member.user.id);
      if (user) {
        const timeSpent = Math.floor(
          (new Date().getTime() - user.joinedAt.getTime()) / 1000,
        );
        updateUserTimeSpent(member.user.id, timeSpent);
      }
    }
  });
};
