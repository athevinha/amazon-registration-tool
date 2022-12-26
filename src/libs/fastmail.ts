
import { setTimeout } from 'timers/promises';
import { DateTime } from 'luxon';

import Imap from 'imap';
import { simpleParser } from 'mailparser';

import jsdom from 'jsdom';
import { Browser, Page } from 'puppeteer';
import check_and_action from './check_and_action.js';
const { JSDOM } = jsdom;

let _code = '';
let _email = '';
let flagRun = true;

export default class i_art_fastmail {
    _config: any;
    _email: string = '';
    // _code: string = '';
    page: Page;
    browser: Browser;
    caa: check_and_action;
    constructor(page: Page, browser: Browser) {
        this._config = {
            fastmail_user: process.env.FASTMAIL_USER,
            fastmail_pass: process.env.FASTMAIL_PASS,
        }
        this.page = page;
        this.browser = browser;
        this.caa = new check_and_action(this.page, this.browser)
    }

    async start(email: string = '') {
        let iRun = 1;
        while (flagRun == false) {
            this.log(`Đang đợi get email xong... ${iRun}s`);
            iRun++;
            await setTimeout(1000);
        }

        this._email = email;
        // this._config = config;
        flagRun = false;

        console.log('==============> Emai: ' + this._email);
        console.log(this._config)
        await setTimeout(20000);
        await this.connect(0, email);
        // await this.connect(1, email);
        // await setTimeout(2000);

        let i = 1;
        let reload = 0;
        while (_code == '') {
            this.log(`Đang đợi lấy code fastmail... ${i}s - Reload: ${reload}`);
            if (i % 15 == 0) {
                reload++;
                await this.connect(reload, email);
            }

            i++;
            await setTimeout(5000);
        }
        // while (_code === '') {
        //     console.log(_code)
        //     await setTimeout(5000)
        // }
        await this.caa.check_and_type('input#cvf-input-code', _code)
        await this.caa.check_and_click('span#cvf-submit-otp-button-announce')
        _code = ''

        console.log('==============> ' + this._email + ' ===========> Code: ' + _code);

        flagRun = true;

        return _code;
    }

    async connect(reload: number = 0, email: string) {
        if (reload > 0) {
            this.log(`Reload get info fastmail... ${reload}`);
        }
        const mailServer = new Imap({
            user: this._config['fastmail_user'],
            password: this._config['fastmail_pass'],
            host: 'imap.fastmail.com',
            port: 993,
            tls: true,
            tlsOptions: {
                rejectUnauthorized: false,
                secureProtocol: 'TLS_method'
            },
            authTimeout: 30000,
        });

        mailServer.once('ready', async () => {
            console.log('Connected to mail box server');
            await this.getEmailFromInbox(mailServer, email);
        });

        await mailServer.connect();
    }
    // async set_code(_code: string) {
    //     this._code = _code
    // }
    async getEmailFromInbox(mailServer: Imap, email: string) {
        const this_ = this
        let loop = true;
        await mailServer.openBox('INBOX', false, async (err: any, box: any) => {
            if (err) {
                console.log('Lỗi: ');
                console.log(err);
                throw err;
            }

            const from = DateTime.now().endOf('day').plus({ days: -1 }).toFormat('LLL dd, yyyy');
            const to = DateTime.now().endOf('day').plus({ days: 1 }).toFormat('LLL dd, yyyy');

            const searched = await this.search(mailServer, [['SINCE', from], ['BEFORE', to]]);
            const fetchMails = await mailServer.fetch(searched, {
                bodies: '',
                struct: true,
            });

            let countEmail = 0;
            await fetchMails.on('message', async (msg, seqno) => {
                await msg.on('body', async function (stream, info) {
                    if (loop) {
                        const data = await simpleParser(stream);
                        console.log("Find math email...", data.to.text)
                        console.log("email: ", email)
                        if (data.subject === 'Verify your new Amazon account' && data.to.text === email) {
                            console.log(data)
                            // if (data.to.text == _email) {
                            const newDate = new Date(data.date);
                            const secondsEmail = DateTime.fromISO(newDate.toISOString()).setLocale('vi').toSeconds();
                            const secondsNow = DateTime.now().setLocale('vi').toSeconds();

                            if ((secondsNow - secondsEmail) < 600) {
                                const dom = new JSDOM(data.html);
                                if (dom.window.document.querySelector(".otp") != null) {
                                    loop = false;
                                    const otp = dom.window.document.querySelector(".otp").textContent
                                    console.log(otp)
                                    _code = otp;
                                    return otp
                                }
                            }
                            // }
                        }
                    }
                });
            });

            await fetchMails.on('error', async (err: any) => {
                console.log('Fetch email error');
                countEmail++;
                console.log(err.message);
            });
        });

        mailServer.on('error', async (err: any) => {
            console.log(err);
        });

        mailServer.on('end', async () => {
            console.log('Completed report to google');
        });
    }

    async search(server: Imap, condition: any[]): Promise<number[]> {
        return new Promise((res, rej) => {
            server.search(condition, (err, results) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(results);
            });
        });
    }

    log(text: string) {
        console.log(`[${DateTime.now().setLocale('vi').toFormat('HH:mm:ss dd/MM')}] ${text[0].toUpperCase() + text.substr(1)}`);
    }
}
