import { MongoClient, ServerApiVersion } from "mongodb";
import config from "./config";
import { Logger } from "./Logger";
import User from "./models/User";

export class MongoDBClient {
  private client: MongoClient;

  private static instance: MongoDBClient;

  static getInstance(): MongoDBClient {
    if (!this.instance) this.instance = new MongoDBClient();
    return this.instance;
  }

  constructor() {
    this.client = new MongoClient(config.DB_CONN_STRING, {
      serverApi: {
        version: ServerApiVersion.v1,
        deprecationErrors: true,
      },
    });
  }

  public async createUser(discordId: string) {
    try {
      const users = this.client
        .db(config.DB_NAME)
        .collection(config.USERS_COLLECTION_NAME);

      await users?.insertOne({
        discordId,
        yoCount: 0,
        yoTotal: 0,
        yoStreak: 0,
        yoBestStreak: 0,
        yoBestStreakDate: new Date(),
        yoLastDate: new Date(),
        timeSpent: 0,
        exp: 0,
        expTotal: 0,
        level: 0,
      });
    } catch (err) {
      Logger.getInstance().error(
        `Error creating user with discordId: ${discordId}`,
        err,
      );
    }
  }

  public async getUser(discordId: string): Promise<User | undefined> {
    try {
      const users = this.client
        .db(config.DB_NAME)
        .collection(config.USERS_COLLECTION_NAME);

      const user = (await users?.findOne({
        discordId: discordId,
      })) as User;

      if (!user) {
        await this.createUser(discordId);
        return (await users?.findOne({
          discordId: discordId,
        })) as User;
      }

      return user;
    } catch (err) {
      Logger.getInstance().error(
        `Error getting user with discordId: ${discordId}`,
        err,
      );
    }
  }

  public async getTopStreaks(amount: number): Promise<User[] | undefined> {
    try {
      const users = this.client
        .db(config.DB_NAME)
        .collection(config.USERS_COLLECTION_NAME);

      return (await users
        ?.find()
        .sort({ yoBestStreak: -1 })
        .limit(amount)
        .toArray()) as User[];
    } catch (err) {
      Logger.getInstance().error("Error getting top streaks", err);
    }
  }

  public async getTopCount(amount: number): Promise<User[] | undefined> {
    try {
      const users = this.client
        .db(config.DB_NAME)
        .collection(config.USERS_COLLECTION_NAME);

      return (await users
        ?.find()
        .sort({ yoCount: -1 })
        .limit(amount)
        .toArray()) as User[];
    } catch (err) {
      Logger.getInstance().error("Error getting top count", err);
    }
  }

  public async updateUser(update: User): Promise<void> {
    try {
      const users = this.client
        .db(config.DB_NAME)
        .collection(config.USERS_COLLECTION_NAME);

      await users?.updateOne(
        { discordId: update.discordId },
        { $set: update },
        { upsert: true },
      );
    } catch (err) {
      Logger.getInstance().error("Error updating user", err);
    }
  }
}
