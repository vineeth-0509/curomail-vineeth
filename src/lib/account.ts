import axios from "axios";
import type {
  EmailAddress,
  EmailMessage,
  SyncResponse,
  SyncUpdatedResponse,
} from "./types";
import { db } from "@/server/db";
import { syncEmailsToDatabase } from "./sync-to-database";
export class Account {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async startSync(daysWithin: number): Promise<SyncResponse> {
    const response = await axios.post<SyncResponse>(
      "https://api.aurinko.io/v1/email/sync",
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: {
          daysWithin: 2,
          bodyType: "html",
        },
      },
    );
    return response.data;
  }

  async getUpdatedEmails({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }) {
    const params: Record<string, string> = {};
    if (deltaToken) params.deltaToken = deltaToken;
    if (pageToken) params.pageToken = pageToken;
    const response = await axios.get<SyncUpdatedResponse>(
      "https://api.aurinko.io/v1/email/sync/updated",
      {
        params,
        headers: { Authorization: `Bearer ${this.token}` },
      },
    );
    return response.data;
  }

  async performEmailSync() {
    try {
      //start the sync process
      const daysWithin = 3;
      let syncResponse = await this.startSync(daysWithin);
      while (!syncResponse.ready) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        syncResponse = await this.startSync(daysWithin);
      }

      //get the bookmark delta token
      let storeDeltaToken: string = syncResponse.syncUpdatedToken;

      // get the email messages using the delta token
      let updatedResponse = await this.getUpdatedEmails({
        deltaToken: storeDeltaToken,
      });
      if (updatedResponse.nextDeltaToken) {
        //sync has completed
        storeDeltaToken = updatedResponse.nextDeltaToken;
      }
      let allEmails: EmailMessage[] = updatedResponse.records;
      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEmails({
          pageToken: updatedResponse.nextPageToken,
        });
        allEmails = allEmails.concat(updatedResponse.records);
        if (updatedResponse.nextDeltaToken) {
          //sync has ended
          storeDeltaToken = updatedResponse.nextDeltaToken;
        }
      }
      console.log(
        "intial sync completed, we have synced",
        allEmails.length,
        "emails",
      );
      //store the latest delta token for the future incremental syncs.
      return {
        emails: allEmails,
        deltaToken: storeDeltaToken,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error during sync:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error during sync:", error);
      }
    }
  }

  async syncEmails() {
    const account = await db.account.findUnique({
      where: {
        accessToken: this.token,
      },
    });
    if (!account) throw new Error("Account not found");
    if (!account.nextDeltaToken) throw new Error("Account not ready for sync");
    let response = await this.getUpdatedEmails({
      deltaToken: account.nextDeltaToken,
    });
    let storedDeltaToken = account.nextDeltaToken;
    let allEmails: EmailMessage[] = response.records;
    if (response.nextDeltaToken) {
      storedDeltaToken = response.nextDeltaToken;
    }
    while (response.nextPageToken) {
      response = await this.getUpdatedEmails({
        pageToken: response.nextPageToken,
      });
      allEmails = allEmails.concat(response.records);
      if (response.nextDeltaToken) {
        storedDeltaToken = response.nextDeltaToken;
      }
    }
    try {
      syncEmailsToDatabase(allEmails, account.id);
    } catch (error) {
      console.error("Error during sync:", error);
    }
    await db.account.update({
      where: {
        id: account.id,
      },
      data: {
        nextDeltaToken: storedDeltaToken,
      },
    });
    return {
      email: allEmails,
      deltaToken: storedDeltaToken,
    };
  }

  async sendEmail({
    from,
    subject,
    body,
    inReplyTo,
    references,
    to,
    cc,
    bcc,
    replyTo,
    threadId,
  }: {
    from: EmailAddress;
    subject: string;
    body: string;
    threadId?: string;
    inReplyTo?: string;
    references?: string;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    replyTo: EmailAddress;
  }) {
    try {
      const response = await axios.post(
        "https://api.aurinko.io/v1/email/messages",
        {
          from,
          subject,
          body,
          inReplyTo,
          references,
          to,
          cc,
          threadId,
          bcc,
          replyTo: [replyTo],
        },
        {
          params: {
            returnIds: true,
          },
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      console.log("email sent", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error sendin email:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error sending email:", error);
      }
      throw error;
    }
  }
}
