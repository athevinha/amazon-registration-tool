import { Browser, Page, Frame } from 'puppeteer';
import { setTimeout } from 'timers/promises';
import { DateTime } from 'luxon';
import fetch from 'node-fetch';
import check_and_action from './check_and_action.js';
// import ac from "@antiadmin/anticaptchaofficial"
class i_art_capcha {
    page: Page;
    browser: Browser;
    key_ = 'a20b4e7bed270afed51378edd9f8eb5a';
    key__ = '60dd1f42ebf57d98433689f2a0ab5341';
    method_ = 'funcaptcha';
    surl_ = 'https://client-api.arkoselabs.com';
    publickey = '2F1CD804-FE45-F12B-9723-240962EBA6F8';
    constructor(page, browser) {
        this.page = page;
        this.browser = browser;
    }
    get_public_key = async () => {
        await this.page.waitForSelector('.aacb-captcha-iframe');
        return await this.page.$eval('.aacb-captcha-iframe', (res) => {
            console.log(res);
            return res.getAttribute('src').split('/')[3];
        });
    };

    async sloveCaptchar() {
        this.enjectArkoseScript();
        await this.page.reload({ timeout: 60 * 1000, waitUntil: 'domcontentloaded' })

        let frame: Frame;
        let token = '';
        let data = '';
        let blob = '';
        while (!token) {
            try {
                await setTimeout(7 * 1000);
                frame = this.page
                    .frames()
                    .find((f) => f.url().startsWith('https://iframe.arkoselabs.com/'))
                    .childFrames()
                    .find((f) => f.url().startsWith('https://client-api.arkoselabs.com/v2/'));

                token = await frame.$eval('input[name="fc-token"]', (e: HTMLInputElement) => e.value);
                data = await frame.evaluate(() => decodeURIComponent((window as any).data));
                blob = await frame.evaluate(() => (window as any).blob);
            } catch { }
        }

        const slovedToken = await this.sloveBy2Captchar(token, blob);
        if (!slovedToken) {
            console.log('Lỗi: quá thời gian giải captcha');
            return;
        }
        await frame.evaluate((token) => {
            (window as any).arkoselabs_callback(token);
        }, slovedToken);

        await setTimeout(15 * 1000);
    }

    enjectArkoseScript() {
        this.page.on('frameattached', (frame) => {
            frame.evaluate(() => {
                let originalFunCaptcha;
                Object.defineProperty(window, 'FunCaptcha', {
                    get: function () {
                        return function (e) {
                            handleArkoselabsInit(e);
                            return originalFunCaptcha(e);
                        };
                    },
                    set: function (e) {
                        (window as any).ArkoseEnforcement = new Proxy((window as any).ArkoseEnforcement, {
                            construct: function (target, args) {
                                handleArkoselabsInit(args[0]);
                                return new target(...args);
                            },
                        });

                        originalFunCaptcha = e;
                    },
                    configurable: true,
                });
                const handleArkoselabsInit = function (params) {
                    (window as any).arkoselabs_callback = params.callback;
                    if (params.data) {
                        (window as any).data = encodeURIComponent(JSON.stringify(params.data));
                        (window as any).blob = params.data.blob;
                    }
                };
            });
        });
    }

    async sloveBy2Captchar(token: string, blob: string) {
        const splited: any = token.split('|').map((s) => s.split('='));
        const sUrl = decodeURIComponent(splited.find((arr) => arr[0] == 'surl')[1]);
        const pk = decodeURIComponent(splited.find((arr) => arr[0] == 'pk')[1]);

        const params = new URLSearchParams();
        params.append('key', 'a20b4e7bed270afed51378edd9f8eb5a');
        params.append('method', 'funcaptcha');
        params.append('publickey', pk);
        params.append('surl', sUrl);
        params.append('data[blob]', blob);
        params.append('userAgent', await this.page.browser().userAgent());
        params.append('pageurl', this.page.url());
        params.append('json', '1');

        const res = await fetch(`http://2captcha.com/in.php?${params.toString()}`);
        const json: any = await res.json();
        if (!json.status) {
            throw new Error('Lỗi: không thể submit 2captchar');
        }

        const statusParams = new URLSearchParams();
        statusParams.append('key', 'a20b4e7bed270afed51378edd9f8eb5a');
        statusParams.append('action', 'get');
        statusParams.append('id', json.request);
        statusParams.append('json', '1');

        const statusUrl = `http://2captcha.com/res.php?${statusParams.toString()}`;
        let slovedToken = '';
        const waitUntil = DateTime.now().plus({ seconds: 90 });
        const sloveAt = DateTime.now();
        while (!slovedToken && DateTime.now() < waitUntil) {
            try {
                await setTimeout(5 * 1000);
                const statusRes = await fetch(statusUrl);
                const statusJson: any = await statusRes.json();
                if (statusJson.request == 'CAPCHA_NOT_READY') {
                    continue;
                }
                if (statusJson.request == 'ERROR_CAPTCHA_UNSOLVABLE') {
                    throw new Error('Lỗi: không giải được captchar từ 2captcha');
                }
                slovedToken = statusJson.request;
                console.log(`Thời gian slove Captcha ${sloveAt.diffNow('seconds').seconds * -1} giây`);
                return slovedToken;
            } catch { }
        }

        return '';
    }

    async sloveByAntiCapcha(token: string, data: string) {
        const splited = token.split('|').map((s) => s.split('='));
        const sUrl = decodeURIComponent(splited.find((arr) => arr[0] == 'surl')[1]);
        const pk = decodeURIComponent(splited.find((arr) => arr[0] == 'pk')[1]);

        const res = await fetch(`https://api.anti-captcha.com/createTask`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clientKey: this.key__,
                task: {
                    type: 'FunCaptchaTaskProxyless',
                    websiteURL: this.page.url(),
                    websitePublicKey: pk,
                    funcaptchaApiJSSubdomain: sUrl,
                    data,
                },
                softId: 0,
            }),
        });
        const json: any = await res.json();
        // console.log(json)
        if (json.errorId != 0) {
            throw new Error('Lỗi: ' + json.errorDescription);
        }

        // const statusParams = new URLSearchParams();
        // statusParams.append('clientKey', this.key__);
        // // statusParams.append('action', 'get');
        // statusParams.append('taskId', json.taskId);
        // // statusParams.append('json', '1');

        const statusUrl = `https://api.anti-captcha.com/getTaskResult`;
        let slovedToken = '';
        const waitUntil = DateTime.now().plus({ minutes: 1 });
        const sloveAt = DateTime.now();
        while (!slovedToken && DateTime.now() < waitUntil) {
            try {
                await setTimeout(5 * 1000);
                const statusRes = await fetch(statusUrl, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        clientKey: this.key__,
                        taskId: json.taskId,
                    }),
                });
                const statusJson: any = await statusRes.json();
                if (statusJson.status == 'processing') {
                    // console.log(statusJson.status)
                    continue;
                }
                if (statusJson.errorId != 0) {
                    throw new Error('Lỗi: không giải được captchar từ AntiCapcha');
                }
                slovedToken = statusJson?.solution?.token;
                console.log(`Thời gian slove Captcha ${sloveAt.diffNow('seconds').seconds * -1} giây`);
            } catch (err) {
                console.log(err);
            }
        }

        return slovedToken;
    }

    solve_capcha = async () => {
        const url = this.page.url();
        const response = await fetch(
            `http://2captcha.com/in.php?key=${this.key_}&method=${this.method_}&publickey=${this.publickey}&surl=${this.surl_}&pageurl=${url}`
        );
        const res_status = await response.text();
        if (res_status.split('|')[0] === 'OK' && res_status.split('|')[1] !== '') {
            // await setTimeout(50000)
            let flag_capcha = true;
            while (flag_capcha) {
                const capcha_solve_res = await fetch(`http://2captcha.com/res.php?key=${this.key_}&action=get&id=${res_status.split('|')[1]}`);
                const capcha_solve_value = await capcha_solve_res.text();
                const capcha_solve_status = capcha_solve_value.replaceAll('OK|', '');
                if (capcha_solve_status !== 'CAPCHA_NOT_READY' && capcha_solve_status !== 'ERROR_CAPTCHA_UNSOLVABLE') {
                    flag_capcha = false;
                    await this.submit_capcha(capcha_solve_value.replaceAll('OK|', ''));
                } else {
                    console.log(capcha_solve_status.toLocaleLowerCase());
                    // console.log("Waiting for capcha solving")
                    await setTimeout(5000);
                }
            }
        }
    };
    submit_capcha = async (capcha_ans: string) => {
        const elementHandle = await this.page.$('iframe[id="cvf-aamation-challenge-iframe"]');
        const frame = await elementHandle.contentFrame();

        const elementHandle_ = await frame.$('iframe[id="aacb-arkose-frame"]');
        const frame_ = await elementHandle_.contentFrame();

        const elementHandle__ = await frame_.$(
            'iframe[src="https://client-api.arkoselabs.com/v2/2F1CD804-FE45-F12B-9723-240962EBA6F8/enforcement.df9bcb44b38c3428caa963b7d557a47a.html"]'
        );
        const frame__ = await elementHandle__.contentFrame();

        await frame__.evaluate((capcha_ans) => {
            const anchor = document.querySelector('input[name="fc-token"]');
            const anchor2 = document.querySelector('input[name="verification-token"]');

            anchor.setAttribute('value', capcha_ans);
            anchor2.setAttribute('value', capcha_ans);
            console.log(anchor.getAttribute('value'));
        }, capcha_ans);

        const elementHandle___ = await frame__.$('iframe[id="fc-iframe-wrap"]');
        const frame___ = await elementHandle___.contentFrame();

        const elementHandle____ = await frame___.$('iframe[id="CaptchaFrame"]');
        const frame____ = await elementHandle____.contentFrame();

        await this.page.evaluate((capcha_ans) => {
            try {
                document.querySelector('input[name="verifyToken"]').setAttribute('value', capcha_ans);
                (document.querySelector('form#cvf-aamation-challenge-form') as any).submit();
            } catch (error) {
                console.log(error);
            }
        }, capcha_ans);

        // await frame____.click('button[id="home_children_button"]')
        await this.page.reload();
        // await this.page.waitForNavigation({ waitUntil: "networkidle0" })
    };
}

export default i_art_capcha;
