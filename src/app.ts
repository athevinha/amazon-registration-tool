
import puppeteer, { Browser, Page } from 'puppeteer';
import register from './controllers/register_amazon.js'
import * as dotenv from 'dotenv'
import * as url from 'url';
import * as _cf from "./config.js"
import register_amazon from './controllers/register_amazon.js';
import ExtraBrowser from './libs/extra_browser.js';
import get_kdp_account_info_amazon from './helpers/get_kdp_account_info_amazon.js';
import multilogin from './libs/multilogin.js';
import { setTimeout } from 'timers/promises';
import PQueue from 'p-queue';
const total = process.env.TOTAL_KDP
const queue = new PQueue({ concurrency: 10 });
const cf = _cf.default
dotenv.config()
export default class App {
    browser: Browser;
    page: any;
    exb: ExtraBrowser;
    kdp_accounts: any;
    constructor() {
    }
    start = async () => {
        const browserFetcher = puppeteer.createBrowserFetcher({ platform: 'win64' });
        const revisionInfo = await browserFetcher.download('901912');
        let options = {
            executablePath: revisionInfo.executablePath,
            headless: false,
            args: [
                '--start-maximized' // you can also use '--start-fullscreen'
            ]
        }
        let count = 0, total_KDP = process.env.TOTAL_KDP
        this.kdp_accounts = await this.get_kdp_account_info_amazon()
        const mutilogin_datas = await multilogin.getProfiles();
        let c_ = 0;
        while (count < Number(total_KDP)) {
            if (this.kdp_accounts[c_]?.[10]) {
                if (this.kdp_accounts[c_]?.[22] === "TRUE" || this.kdp_accounts[c_]?.[22] === "PENDING" || this.kdp_accounts[c_]?.[22] === "ALREADY") {
                    console.log(`Account email ${this.kdp_accounts[c_]?.[10]} is done`)
                }
                else {
                    count++;
                    const kdp_email_amz = this.kdp_accounts[c_][10]
                    const idMultilogin = mutilogin_datas.filter((mtdata) => mtdata.name.includes(kdp_email_amz))[0]?.uuid;
                    if (idMultilogin) {
                        this.exb = new ExtraBrowser();
                        const opened = await this.exb.open(idMultilogin);
                        if (!opened.ok) {
                            console.log(`Không mở được trình duyệt. ID: ${idMultilogin} - Lỗi: ${opened.message}`);
                        } else {
                            this.page = opened.page;
                            this.browser = this.page.browser();
                            // const client = await this.page.target().createCDPSession()
                            // await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: cf.__dirname });
                            (async () => {
                                console.log(`==========================================`);
                                console.log(`Start create ${this.kdp_accounts[c_]?.[10]}`);
                                console.log(`==========================================`);
                                await queue.add(() => {
                                    const register_system = new register_amazon(this.browser, this.page, this.exb)
                                    register_system.start(c_)
                                });
                                console.log(`==========================================`);
                                console.log(`${this.kdp_accounts[c_]?.[10]} is DONE`);
                                console.log(`==========================================`);
                            })();

                            // await this.browser.close();
                        }
                    }
                    else {
                        console.log(`Email ${kdp_email_amz} not exist in mutilogin DB`)
                    }
                }
                c_++;
            }
        }
        // this.browser = await puppeteer.launch({ headless: false, args: ['--single-process'] });
        // this.page = await this.browser.newPage();
        // await this.page.setViewport({ height: 1080, width: 1920 });
        // const register_system = new register_amazon(this.browser, this.page, this.page)
        // await register_system.start(0)
    }
    // step 0: get google sheet information
    get_kdp_account_info_amazon = async () => {
        const response = new get_kdp_account_info_amazon()
        const sheet_ = response.sheet_
        const kdpas = await sheet_.start({ type: "getdata" })
        if (kdpas?.type === 'success') this.kdp_accounts = kdpas.result.data;
        else this.kdp_accounts = [];
        return this.kdp_accounts
    }
}