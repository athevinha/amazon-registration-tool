import { setTimeout } from 'timers/promises';
import { DateTime } from 'luxon';

import Imap from 'imap';
import { simpleParser } from 'mailparser';

import jsdom from 'jsdom';
import { Page } from 'puppeteer';

export default class i_art_phone {
    account: {
        phone: string
    };
    constructor(account: { phone: string }) {
        this.account = account
    }

    async findOTP(): Promise<string> {
        const sendDateFrom = DateTime.now().plus({ minutes: -1 }).toJSDate();
        const waitTo = DateTime.now().plus({ minutes: 1 });
        let otp = ''
        while (otp === '') {
            console.log("waiting...")
            const res = await i_art_phone.postApple('/auto-sms/message/find-from', {
                phoneNumber: this.account.phone,
                sendDateFrom,
            });
            console.log(res.ok)
            if (res.ok) {
                otp = (res.data.content as string).slice(0, 6).replaceAll(' ', '')
                console.log(otp)
            }

            await setTimeout(15 * 1000);
        }

        return otp;
    }

    static async postApple(path: string, data: any) {
        let retry = 3;
        while (retry-- > 0) {
            try {
                const url = process.env.API_URL + path;
                const res = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        token: process.env.COOKIE_TOKEN,
                    },
                    method: 'post',
                    body: JSON.stringify(data),
                });
                return await res.json();
            } catch {
                await setTimeout(1000);
            }
        }
        return {
            ok: false
        };
    }
}
