import { Browser, ElementHandle, HTTPRequest, Page, PuppeteerLifeCycleEvent } from 'puppeteer-core';
import { setTimeout } from 'timers/promises';
import multiLogin from './multilogin.js';
const homepage = 'https://app.multiloginapp.com/WhatIsMyIP';
const _3minutes = 3 * 60 * 1000;
const _1minute = 1 * 60 * 1000;
const _1sec = 1000;
const _3secs = 3000;
const _7secs = 7000;

export default class ExtraBrowser {
  page: Page;
  browser: Browser;
  profile: string;
  market: string;
  isLoadImage = true;

  constructor(page?: Page) {
    this.page = page;
  }

  async open(uuid: string): Promise<{
    ok: boolean;
    page?: Page;
    message?: string;
  }> {
    // open home page and try catch Internal problem

    let message = '';
    let retry = 5;
    while (retry-- > 0) {
      try {
        this.browser = await multiLogin.startRemoteProfile(uuid);
        this.page = (await this.browser.pages()).shift();
        return {
          ok: true,
          page: this.page,
        };
      } catch (error) {
        message = error.message;
        await multiLogin.closeProfile(uuid);
        await setTimeout(10 * 1000);
      }
    }
    return {
      ok: false,
      message,
    };
  }

  async connect(endpoint: string) {
    this.browser = await multiLogin.connect(endpoint);
    this.page = (await this.browser.pages()).shift();
    return {
      ok: true,
      page: this.page,
    };
  }

  async goto(url: string, timeout = 180 * 1000, waitUntil: PuppeteerLifeCycleEvent = 'networkidle2') {
    let retry = 3;
    let message = '';
    while (retry-- > 0) {
      try {
        await this.page.goto(url, {
          waitUntil,
          timeout,
        });
        return;
      } catch (error) {
        if (error.message.includes('ERR_INVALID_AUTH_CREDENTIALS')) {
          await setTimeout(7000);
          continue;
        }
        message = error.message;
      }
    }

    throw new Error(`go to url ${url} failed. ${message}`);
  }

  async clickJS(selector: string, throwError = true) {
    try {
      await this.page.$eval(selector, (ele: HTMLElement) => ele.click());
      await setTimeout(_1sec);
      return true;
    } catch (error) {
      if (throwError) {
        throw error;
      }
      return false;
    }
  }

  async clickSelector(selector: string, throwError = true) {
    try {
      await this.clickElement(await this.page.$(selector));
      return true;
    } catch (error) {
      if (throwError) {
        throw error;
      }
      return false;
    }
  }

  async waitButtonText(text: string, throwError = true, exact = false, timeout = _7secs) {
    return await this.waitText(text, 'button', throwError, exact, timeout);
  }

  async waitText(text: string, htmlTag = '*', throwError = true, exact = false, timeout = _7secs) {
    try {
      const slt = exact ? `//${htmlTag}[.='${text}']` : `//${htmlTag}[contains(.,'${text}')]`;
      await this.page.waitForXPath(slt, { timeout });
      return true;
    } catch (error) {
      if (throwError) {
        throw error;
      }
      return false;
    }
  }

  async clickButtonText(text: string, throwError = true, exact = false) {
    return await this.clickText(text, 'button', throwError, exact);
  }

  async clickText(text: string, htmlTag = '*', throwError = true, exact = false) {
    try {
      const slt = exact ? `//${htmlTag}[.='${text}']` : `//${htmlTag}[contains(.,'${text}')]`;

      await this.clickElement(((await this.page.$x(slt)) as ElementHandle<HTMLInputElement>[])[0]);
      return true;
    } catch (error) {
      if (throwError) {
        throw error;
      }
      return false;
    }
  }

  async clickElement(element: ElementHandle<Element>) {
    await element.focus();
    await setTimeout(_1sec);

    const point = await element.clickablePoint();
    await this.page.mouse.click(point.x, point.y);
    await setTimeout(_1sec);
  }

  async waitTitleInclude(text: string, throwError = true, timeout = 7000) {
    try {
      await this.page.waitForFunction(async (text: string) => document.title.includes(text), { timeout }, text);
      return true;
    } catch (error) {
      if (throwError) {
        throw error;
      }
      return false;
    }
  }

  async waitSelector(selector: string, throwError = true, timeout = 7000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      if (throwError) {
        throw error;
      }
      return false;
    }
  }

  async type(selector: string, text: string, clear = true, throwError = true) {
    try {
      if (clear) {
        await this.setElementValue(selector, '');
        await setTimeout(500);
      }

      await this.page.type(selector, text, { delay: 70 });
      return true;
    } catch (error) {
      if (throwError) {
        throw error;
      }
      return false;
    }
  }

  async setElementValue(selector: string, value: string, throwError = true) {
    try {
      await this.page.$eval(selector, (ele: any, value: string) => (ele.value = value), value);
      return true;
    } catch (error) {
      if (throwError) {
        throw error;
      }
      return false;
    }
  }

  async clearTextByKeyboard(selector: string) {
    await this.page.focus(selector);
    await setTimeout(500);
    await this.page.keyboard.down('Control');
    await this.page.keyboard.press('A');
    await this.page.keyboard.up('Control');
    await this.page.keyboard.press('Backspace');
    await setTimeout(500);
  }

  $(selector: string) {
    return this.page.$(selector);
  }

  $$(selector: string) {
    return this.page.$$(selector);
  }

  async reload(throwError = true) {
    try {
      await this.page.reload({ waitUntil: 'networkidle0' });
      return true;
    } catch (error) {
      if (throwError) {
        throw error;
      }
      return false;
    }
  }

  async isVisile(selector: string) {
    const ele = await this.page.$(selector);
    if (!ele) {
      return false;
    }

    return await this.isVisibleEle(ele);
  }

  async isVisibleEle(ele: ElementHandle<Element>) {
    return await ele.evaluate(
      (ele: HTMLElement) => !!(window.getComputedStyle(ele).getPropertyValue('display') !== 'none' && ele.offsetHeight && ele.offsetWidth)
    );
  }

  async clean() {
    const pages = await this.browser.pages();
    for (let page of pages) {
      const client = await page.target().createCDPSession();
      await client.send('Network.clearBrowserCookies');
    }
  }

  async interceptRequest() {
    await this.page.setRequestInterception(true);
    this.page.on('request', (request: HTTPRequest) => {
      if (!this.isLoadImage && request.resourceType() == 'image') {
        request.abort();
        return;
      }
      request.continue();
    });
  }
}
