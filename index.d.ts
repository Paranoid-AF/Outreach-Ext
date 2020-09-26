export interface OutreachTask {
  uuid: string,
  issuer: string,
  action: string,
  time: string,
  payload: string
}

export interface OutreachResult {
  uuid: string,
  resolver: string,
  action: string,
  time: string,
  timeIssued: string,
  payload: string,
  ref: string
}

export interface OutreachService {
  actions: {
    [index: string]: (data: OutreachTask) => Promise<string>
  },
  requestCounter: number,
  dispatch: (identifier: string, targetService: string, targetAction: string, payload: string) => Promise<OutreachResult>
}

export interface OutreachList {
  [index: string]: OutreachService
}

declare const Outreach: OutreachList

export default Outreach