import { Browser, Page, Touchscreen } from "puppeteer";
import check_and_action from "../libs/check_and_action.js";
import i_art_sheet from "../libs/sheet.js";
import { setTimeout } from 'timers/promises';
export default class delete_phone_verify_amazon {
    page: Page;
    browser: Browser;
    caa: check_and_action;
    constructor(page, browser) {
        this.page = page;
        this.browser = browser
        this.caa = new check_and_action(this.page, this.browser)
    }
    async start() {
        let flag = true
        while (flag) {
            try {
                await setTimeout(10000)
                await this.page.goto("https://www.amazon.com/")
                await setTimeout(2000)
                await this.caa.check_and_click('a#nav-link-accountList')
                await setTimeout(2000)
                await this.caa.check_and_click('div[data-card-identifier="SignInAndSecurity"]')
                await setTimeout(2000)

                await this.caa.check_and_click('input#auth-cnep-edit-phone-button')
                await setTimeout(2000)
                await this.caa.check_and_click('a#ap_delete_mobile_claim_link')
                await setTimeout(2000)
                await this.caa.check_and_click('input#ap-remove-mobile-claim-submit-button')
                await setTimeout(5000)

                await this.caa.check_and_click('input#auth-cnep-advanced-security-settings-button')
                // await setTimeout(2000)
                // await this.caa.check_and_click('div#ch-settings-otp-remove-backup-0 > span')
                // await setTimeout(2000)
                // await this.caa.check_and_click('input#confirm-remove-dialog-backup-0-submit')
                flag = false

            } catch (error) {
                console.log(error)
            }
            await setTimeout(10000)
        }

    }
}