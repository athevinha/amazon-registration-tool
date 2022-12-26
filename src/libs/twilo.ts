import { Browser, Page } from "puppeteer";
import speakeasy from "speakeasy";
export default class i_art_twiilo {
    page: Page;
    browser: Browser;
    constructor(page?: Page, browser?: Browser) {
        this.page = page;
        this.browser = browser;
    }
    async barcod2otp(secret: string) {
        const epoch = Math.round(new Date().getTime() / 1000.0);
        const counter = Math.floor(epoch / 30);
        secret = secret.replace(/\s/g, "");
        const token = speakeasy.totp({
            secret,
            counter,
            encoding: 'base32'
        })
        return token
    }
}