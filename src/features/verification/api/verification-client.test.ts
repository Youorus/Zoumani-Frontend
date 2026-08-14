import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchDocuments, uploadDocument } from "./verification-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("contrat des pièces d'identité", () => {
  it("envoie le nom canonique de la carte d'identité", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "doc-1" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await uploadDocument({
      documentType: "national_id_card",
      front: new File(["recto"], "recto.jpg", { type: "image/jpeg" }),
      back: new File(["verso"], "verso.jpg", { type: "image/jpeg" }),
      issuingCountry: "CM",
      expiresOn: "2030-01-01",
    });

    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get("document_type")).toBe("national_id_card");
    expect(body.get("issuing_country")).toBe("CM");
    expect(body.get("back")).toBeInstanceOf(File);
  });

  it("conserve les métadonnées nécessaires à un remplacement fidèle", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            verification_id: "verification-1",
            documents: [
              {
                id: "doc-1",
                document_type: "residence_permit",
                status: "rejected",
                issuing_country: "FR",
                expires_on: "2030-01-01",
                has_back_side: true,
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    await expect(fetchDocuments()).resolves.toEqual([
      {
        id: "doc-1",
        documentType: "residence_permit",
        status: "rejected",
        issuingCountry: "FR",
        expiresOn: "2030-01-01",
        hasBackSide: true,
      },
    ]);
  });
});
