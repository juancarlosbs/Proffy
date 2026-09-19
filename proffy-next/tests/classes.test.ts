import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { GET, OPTIONS, POST } from "@/app/classes/route";
import { getDb } from "@/db";
import { jsonRequest, resetDb, setupDb, teacher } from "./helpers";

beforeAll(setupDb);
beforeEach(resetDb);

const search = (qs: string) => GET(jsonRequest(`/classes?${qs}`, "GET"));

describe("POST /classes", () => {
  it("cria usuário, aula e horários e responde 201 sem corpo", async () => {
    const res = await POST(jsonRequest("/classes", "POST", teacher));

    expect(res.status).toBe(201);
    expect(await res.text()).toBe("");

    const { $client } = getDb();
    expect($client.prepare("select name, avatar, whatsapp, bio from users").all()).toEqual([
      { name: "Diego", avatar: teacher.avatar, whatsapp: "11999999999", bio: teacher.bio },
    ]);
    expect($client.prepare("select subject, cost, user_id from classes").all()).toEqual([
      { subject: "Química", cost: 80, user_id: 1 },
    ]);
    expect($client.prepare("select week_day, `from`, `to` from class_schedule").all()).toEqual([
      { week_day: 1, from: 480, to: 720 },
      { week_day: 3, from: 810, to: 1080 },
    ]);
  });

  it("responde 400 e não grava nada quando o corpo é inválido", async () => {
    const res = await POST(jsonRequest("/classes", "POST", { ...teacher, schedule: undefined }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Unexpected error while creating new class" });
    expect(getDb().$client.prepare("select count(*) as n from users").get()).toEqual({ n: 0 });
    expect(getDb().$client.prepare("select count(*) as n from classes").get()).toEqual({ n: 0 });
  });

  it("responde 400 quando falta um campo obrigatório", async () => {
    const res = await POST(jsonRequest("/classes", "POST", { ...teacher, name: undefined }));

    expect(res.status).toBe(400);
  });
});

describe("GET /classes", () => {
  beforeEach(async () => {
    await POST(jsonRequest("/classes", "POST", teacher));
    await POST(
      jsonRequest("/classes", "POST", {
        ...teacher,
        name: "Maria",
        subject: "Matemática",
        cost: 50.5,
        schedule: [{ week_day: 1, from: "8:00", to: "12:00" }],
      }),
    );
  });

  it("retorna as aulas com dados da aula e do professor achatados (id = id do usuário)", async () => {
    const res = await search("subject=Química&week_day=1&time=10:00");

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(body).toEqual([
      {
        id: 1,
        subject: "Química",
        cost: 80,
        user_id: 1,
        name: "Diego",
        avatar: teacher.avatar,
        whatsapp: "11999999999",
        bio: teacher.bio,
      },
    ]);
    expect(Object.keys(body[0])).toEqual([
      "id", "subject", "cost", "user_id", "name", "avatar", "whatsapp", "bio",
    ]);
  });

  it("filtra por matéria", async () => {
    const body = await (await search("subject=Matemática&week_day=1&time=10:00")).json();
    expect(body.map((c: { name: string }) => c.name)).toEqual(["Maria"]);
  });

  it("filtra por dia da semana", async () => {
    expect(await (await search("subject=Química&week_day=2&time=10:00")).json()).toEqual([]);
    expect(await (await search("subject=Química&week_day=3&time=14:00")).json()).toHaveLength(1);
  });

  it("início do horário é inclusivo e o fim é exclusivo", async () => {
    expect(await (await search("subject=Química&week_day=1&time=8:00")).json()).toHaveLength(1);
    expect(await (await search("subject=Química&week_day=1&time=11:59")).json()).toHaveLength(1);
    expect(await (await search("subject=Química&week_day=1&time=12:00")).json()).toEqual([]);
    expect(await (await search("subject=Química&week_day=1&time=7:59")).json()).toEqual([]);
  });

  it("aceita week_day=0 (domingo)", async () => {
    expect((await search("subject=Química&week_day=0&time=10:00")).status).toBe(200);
  });

  it.each([
    ["sem subject", "week_day=1&time=10:00"],
    ["sem week_day", "subject=Química&time=10:00"],
    ["sem time", "subject=Química&week_day=1"],
    ["sem filtros", ""],
    ["filtro vazio", "subject=&week_day=1&time=10:00"],
  ])("responde 400 %s", async (_label, qs) => {
    const res = await search(qs);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing filters to search classes" });
  });

  it("filtros não numéricos não quebram e retornam lista vazia", async () => {
    expect(await (await search("subject=Química&week_day=abc&time=10:00")).json()).toEqual([]);
    expect(await (await search("subject=Química&week_day=1&time=abc")).json()).toEqual([]);
  });
});

describe("CORS", () => {
  it("responde com Access-Control-Allow-Origin: * nas respostas normais e de erro", async () => {
    const ok = await search("subject=Química&week_day=1&time=10:00");
    const bad = await search("");
    const created = await POST(jsonRequest("/classes", "POST", teacher));

    for (const res of [ok, bad, created]) {
      expect(res.headers.get("access-control-allow-origin")).toBe("*");
    }
  });

  it("responde ao preflight OPTIONS com 204", async () => {
    const req = new Request("http://localhost/classes", {
      method: "OPTIONS",
      headers: { "access-control-request-headers": "content-type" },
    });
    const res = await OPTIONS(req);

    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("access-control-allow-methods")).toBe("GET,HEAD,PUT,PATCH,POST,DELETE");
    expect(res.headers.get("access-control-allow-headers")).toBe("content-type");
  });
});
