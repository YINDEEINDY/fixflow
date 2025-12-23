/**
 * Unified Notification Dispatcher
 * Sends notifications to both Discord and LINE Bot
 */

import * as discordNotify from './discord-notify.service.js';
import * as lineBotNotify from './line-bot.service.js';

// Request data types
interface NewRequestData {
  requestNumber: string;
  title: string;
  category: string;
  location: string;
  priority: string;
  userName: string;
}

interface RequestAssignedData {
  requestNumber: string;
  title: string;
  technicianName: string;
}

interface RequestAcceptedData {
  requestNumber: string;
  title: string;
  technicianName: string;
}

interface RequestStartedData {
  requestNumber: string;
  title: string;
  technicianName: string;
}

interface RequestCompletedData {
  requestNumber: string;
  title: string;
  technicianName: string;
  note?: string;
}

interface RequestCancelledData {
  requestNumber: string;
  title: string;
  userName: string;
  reason?: string;
}

interface RequestRejectedData {
  requestNumber: string;
  title: string;
  technicianName: string;
  reason: string;
}

interface RequestStatusChangeData {
  requestNumber: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
}

interface DailyReportData {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedToday: number;
}

// Dispatch results
interface DispatchResult {
  discord: boolean;
  lineBot: boolean;
}

/**
 * Dispatch notification to all enabled channels
 */
async function dispatch(
  discordFn: () => Promise<boolean>,
  lineBotFn: () => Promise<boolean>
): Promise<DispatchResult> {
  const results = await Promise.allSettled([discordFn(), lineBotFn()]);

  return {
    discord: results[0].status === 'fulfilled' ? results[0].value : false,
    lineBot: results[1].status === 'fulfilled' ? results[1].value : false,
  };
}

// Notification dispatchers
export async function notifyNewRequest(data: NewRequestData): Promise<DispatchResult> {
  console.log(`[Notify] New request: ${data.requestNumber}`);
  return dispatch(
    () => discordNotify.notifyNewRequest(data),
    () => lineBotNotify.notifyNewRequest(data)
  );
}

export async function notifyRequestAssigned(data: RequestAssignedData): Promise<DispatchResult> {
  console.log(`[Notify] Request assigned: ${data.requestNumber}`);
  return dispatch(
    () => discordNotify.notifyRequestAssigned(data),
    () => lineBotNotify.notifyRequestAssigned(data)
  );
}

export async function notifyRequestAccepted(data: RequestAcceptedData): Promise<DispatchResult> {
  console.log(`[Notify] Request accepted: ${data.requestNumber}`);
  return dispatch(
    () => discordNotify.notifyRequestAccepted(data),
    () => lineBotNotify.notifyRequestAccepted(data)
  );
}

export async function notifyRequestStarted(data: RequestStartedData): Promise<DispatchResult> {
  console.log(`[Notify] Request started: ${data.requestNumber}`);
  return dispatch(
    () => discordNotify.notifyRequestStarted(data),
    () => lineBotNotify.notifyRequestStarted(data)
  );
}

export async function notifyRequestCompleted(data: RequestCompletedData): Promise<DispatchResult> {
  console.log(`[Notify] Request completed: ${data.requestNumber}`);
  return dispatch(
    () => discordNotify.notifyRequestCompleted(data),
    () => lineBotNotify.notifyRequestCompleted(data)
  );
}

export async function notifyRequestCancelled(data: RequestCancelledData): Promise<DispatchResult> {
  console.log(`[Notify] Request cancelled: ${data.requestNumber}`);
  return dispatch(
    () => discordNotify.notifyRequestCancelled(data),
    () => lineBotNotify.notifyRequestCancelled(data)
  );
}

export async function notifyRequestRejected(data: RequestRejectedData): Promise<DispatchResult> {
  console.log(`[Notify] Request rejected: ${data.requestNumber}`);
  return dispatch(
    () => discordNotify.notifyRequestRejected(data),
    () => lineBotNotify.notifyRequestRejected(data)
  );
}

export async function notifyRequestStatusChange(
  data: RequestStatusChangeData
): Promise<DispatchResult> {
  console.log(
    `[Notify] Status change: ${data.requestNumber} (${data.oldStatus} → ${data.newStatus})`
  );
  return dispatch(
    () => discordNotify.notifyRequestStatusChange(data),
    () => lineBotNotify.notifyRequestStatusChange(data)
  );
}

export async function notifyDailyReport(data: DailyReportData): Promise<DispatchResult> {
  console.log(`[Notify] Daily report`);
  return dispatch(
    () => discordNotify.notifyDailyReport(data),
    () => lineBotNotify.notifyDailyReport(data)
  );
}

// Test functions
export async function testDiscord(): Promise<boolean> {
  return discordNotify.testDiscordWebhook();
}

export async function testLineBot(): Promise<boolean> {
  return lineBotNotify.testLineBotConnection();
}

export async function testAll(): Promise<DispatchResult> {
  const results = await Promise.allSettled([
    discordNotify.testDiscordWebhook(),
    lineBotNotify.testLineBotConnection(),
  ]);

  return {
    discord: results[0].status === 'fulfilled' ? results[0].value : false,
    lineBot: results[1].status === 'fulfilled' ? results[1].value : false,
  };
}
