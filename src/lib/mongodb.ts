import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "anime_worldcup";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export function isMongoConfigured(): boolean {
  return !!uri;
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!uri) {
    throw new Error("MONGODB_URI 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.");
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    retryWrites: true,
    w: "majority",
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
