import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { GET, OPTIONS, POST } from "@/app/connections/route";
import { getDb } from "@/db";
import { jsonRequest, resetDb, setupDb } from "./helpers";

beforeAll(setupDb);
beforeEach(() => {
  resetDb();
  getDb().$client.exec("insert into users (name, avatar, whatsapp, bio) values ('a', 'b', 'c', 'd')");
});

describe("GET /connections", () => {
  it("retorna total 0 sem conexões", async () => {
    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ total: 0 });
  });

  it("conta as conexões criadas", async () => {
    await POST(jsonRequest("/connections", "POST", { user_id: 1 }));
    await POST(jsonRequest("/connections", "POST", { user_id: 1 }));

    expect(await (await GET()).json()).toEqual({ total: 2 });
  });
});

describe("POST /connections", () => {
  it("cria a conexão e responde 201 sem corpo", async () => {
    const res = await POST(jsonRequest("/connections", "POST", { user_id: 1 }));

    expect(res.status).toBe(201);
    expect(await res.text()).toBe("");
    expect(getDb().$client.prepare("select id, user_id from connections").all()).toEqual([
      { id: 1, user_id: 1 },
    ]);
  });

  it("não exige que o usuário exista (o schema original não impõe chave estrangeira)", async () => {
    const res = await POST(jsonRequest("/connections", "POST", { user_id: 999 }));
    expect(res.status).toBe(201);
  });
});

describe("CORS", () => {
  it("envia Access-Control-Allow-Origin: * e responde ao preflight", async () => {
    expect((await GET()).headers.get("access-control-allow-origin")).toBe("*");

    const pre = OPTIONS(new Request("http://localhost/connections", { method: "OPTIONS" }));
    expect(pre.status).toBe(204);
    expect(pre.headers.get("access-control-allow-origin")).toBe("*");
  });
});
