import fetch from "node-fetch";
import { v4 as uuid } from "uuid";

const fetchJson = async (url: string, params: any): Promise<any> => {
  params.headers = {
    accept: "application/json",
    "Content-Type": "application/json",
  };
  params.body = JSON.stringify(params.body);
  const res = await fetch(url, params);
  return res.json();
};

const makeEmail = () => `${uuid()}@example.com`;

describe("e2e tests", () => {
  it("can do the smoke sequence", async () => {
    const email = makeEmail();
    const email2 = makeEmail();
    const {
      user: { id: userId },
    } = await fetchJson("http://localhost:8080/user", {
      body: { email: email, firstName: "Mailer" },
      method: "POST",
    });

    const { users } = await fetchJson("http://localhost:8080/user", {
      method: "GET",
    });
    const user = users.find((u: any) => u.email === email);
    expect(user.id).toEqual(userId);

    await fetchJson(`http://localhost:8080/user/${userId}`, {
      method: "PUT",
      body: { email: email2 },
    });

    let { user: updatedUser } = await fetchJson(
      `http://localhost:8080/user/${userId}`,
      {
        method: "GET",
      }
    );
    expect(updatedUser.email).toEqual(email2);

    const {
      subscription: { id: subId },
    } = await fetchJson("http://localhost:8080/subscription", {
      method: "POST",
      body: { forUserId: userId },
    });

    const { subscriptions } = await fetchJson(
      "http://localhost:8080/subscription",
      {
        method: "GET",
      }
    );
    const sub = subscriptions.find((s: any) => s.userId === userId);
    expect(sub.id).toEqual(subId);

    await fetchJson(`http://localhost:8080/subscription/${subId}`, {
      method: "PUT",
      body: {
        enabled: false,
        time: "10:30+01:00",
        subreddits: ["funny", "spiritisland"],
      },
    });

    const { subscription: updatedSub } = await fetchJson(
      `http://localhost:8080/subscription/${subId}`,
      {
        method: "GET",
      }
    );
    expect(updatedSub.subreddits).toEqual(["funny", "spiritisland"]);

    await fetchJson(`http://localhost:8080/subscription/${subId}/trigger`, {
      method: "POST",
    });
  });
});
