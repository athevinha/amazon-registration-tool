import { DateTime } from 'luxon';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer-core';
import { setTimeout } from 'timers/promises';

const localApi = 'http://127.0.0.1:35000';
const onlineApi = `http://localhost.multiloginapp.com:35000/api/v2`;
const closeProfileUrl = `${localApi}/closeProcess/`;
const focusProfileUrl = `${localApi}/bringToFront/`;
const startRemoteProfileUrl = `${localApi}/api/v1/profile/start?automation=true&puppeteer=true&profileId=`;
const runningProfileUrl = `${localApi}/sessions/get-running`;

async function closeProfile(id: string) {
  const url = `${closeProfileUrl}${id}?ts=${Math.round(DateTime.now().toSeconds())}`;
  try {
    await fetch(url);
  } catch { }
  await setTimeout(3 * 1000);

  try {
    await fetch(url);
  } catch { }
  await setTimeout(3 * 1000);
}

async function focusProfile(uuid: string) {
  const url = `${focusProfileUrl}${uuid}`;
  const res = await fetch(url);
  await res.json();
}

async function startRemoteProfile(uuid: string) {
  const res = await fetch(`${startRemoteProfileUrl}${uuid}`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const json: any = await res.json();
  if (!json.hasOwnProperty('value')) throw new Error('Internal Server Error');

  console.log(json.value);
  const browser = await puppeteer.connect({
    browserWSEndpoint: json.value,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
  });
  return browser;
}

async function connect(endpoint: string) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: endpoint,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
  });

  return browser;
}

async function getProfiles(): Promise<MultiProfile[]> {
  // sure muiltilogin opened
  const res = await fetch(`${onlineApi}/profile`);
  if (!res.ok) {
    console.error(`get multilogin list profiles error: ${res.statusText}`);
    return [];
  }

  const json: any = await res.json();
  return json;
}

async function getRunningUuids() {
  const profiles = await getRunningProfiles();
  return Object.keys(profiles).map(x => x.trim());
}


async function getRunningProfiles() {
  const res = await fetch(runningProfileUrl);
  if (!res.ok) {
    console.log('can not get Multilogin running profiles');
    console.log(res.statusText);
    return [];
  }

  const json: any = await res.json();
  if (json.status !== 'OK') return [];

  return json.value.profiles || [];
}

function convertUuidToProfile(uuids: string[], profiles: MultiProfile[]) {
  return uuids.map((x) => profiles.find((p) => p.uuid === x)).filter(Boolean);
}

export default {
  closeProfile,
  focusProfile,
  startRemoteProfile,
  getProfiles,
  getRunningProfiles,
  convertUuidToProfile,
  getRunningUuids,
  connect
};


interface MultiProfile {
  name: string;
  marketplaces: string[];
  uuid: string;
  updated: string;
  browser: string;
  group: string;
}