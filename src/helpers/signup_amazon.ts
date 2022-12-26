import { Browser, Page, Touchscreen } from "puppeteer";
import check_and_action from "../libs/check_and_action.js";
import i_art_sheet from "../libs/i_art_sheet.js";
import { setTimeout } from 'timers/promises';
export default class signup_amazon {
    page: Page;
    browser: Browser;
    caa: check_and_action;
    constructor(page, browser) {
        this.page = page;
        this.browser = browser
        this.caa = new check_and_action(this.page, this.browser)
    }
    async start(kdp_account: any) {
        await this.caa.check_and_click('span#signupButton')
        await this.caa.check_and_click('a#createAccountSubmit')
        await this.caa.check_and_type('input#ap_customer_name', kdp_account[3])
        await this.caa.check_and_type('input#ap_email', kdp_account[10]) // 
        // await this.caa.check_and_type('input#ap_email', "vin234234hdsad@gmail.com") // 
        await this.caa.check_and_type('input#ap_password', kdp_account[11])
        await this.caa.check_and_type('input#ap_password_check', kdp_account[11])
        await this.caa.check_and_click('input#continue')

    }
}