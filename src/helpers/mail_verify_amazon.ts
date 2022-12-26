import { Browser, Page } from "puppeteer";

export default class mail_verify_amazon {
    page: Page;
    browser: Browser;

    constructor(page: Page, browser: Browser) {
        this.page = page;
        this.browser = browser;
    }
    get_mail_otp = async (mail_address: string) => {
        console.log(mail_address)
    }

}