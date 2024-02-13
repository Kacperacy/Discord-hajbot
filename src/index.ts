import { Client } from "discord.js";
import config from "./config";

import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
import messageCreate from "./listeners/messageCreate";
import { connectToDatabase } from "./services/database.service";
import voiceStateUpdate from "./listeners/voiceStateUpdate";
import { setClient } from "./util/clientObj";

const client = new Client({
  intents: [
    "Guilds",
    "GuildMembers",
    "GuildMessages",
    "MessageContent",
    "GuildVoiceStates",
  ],
});

connectToDatabase();
ready(client);
interactionCreate(client);
messageCreate(client);
voiceStateUpdate(client);
setClient(client);

client.login(config.TOKEN);
