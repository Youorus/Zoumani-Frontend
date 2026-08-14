import { afterEach, describe, expect, it, vi } from "vitest";

import { requestAction } from "./admin-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("demande de correction administrative", () => {
  it("transmet la pièce visée pour une reprise de photo", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "request-1" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await requestAction(
      "verification-1",
      "retake_selfie",
      "Reprenez la photo dans un endroit lumineux.",
      "selfie-1",
    );

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(options.body as string)).toEqual({
      kind: "retake_selfie",
      message: "Reprenez la photo dans un endroit lumineux.",
      document_id: "selfie-1",
    });
  });

  it("n'invente pas de pièce pour une correction d'information", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "request-2" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await requestAction(
      "verification-1",
      "correct_information",
      "Corrigez votre prénom légal.",
    );

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(options.body as string)).toEqual({
      kind: "correct_information",
      message: "Corrigez votre prénom légal.",
    });
  });
});
