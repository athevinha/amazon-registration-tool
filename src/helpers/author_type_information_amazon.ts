import { Browser, Page, Touchscreen } from "puppeteer";
import check_and_action from "../libs/check_and_action.js";
import i_art_sheet from "../libs/i_art_sheet.js";
import { setTimeout } from 'timers/promises';
export default class author_type_information_amazon {
    page: Page;
    browser: Browser;
    caa: check_and_action;
    constructor(page, browser) {
        this.page = page;
        this.browser = browser
        this.caa = new check_and_action(this.page, this.browser)
    }
    async start(kdp_account) {
        await setTimeout(5000)
        await this.caa.check_and_click('input#mat-radio-2-input')
        await this.caa.check_and_type('input#address-dateOfBirth', kdp_account[12])
        await this.caa.check_and_type('input#address-country', "United Kingdom")

        await this.caa.check_and_type('input#address-name', kdp_account[4])
        const address_arr = kdp_account[5].split(',');
        await this.caa.check_and_type('input#address-line-one', address_arr[0])
        await this.caa.check_and_type('input#address-line-two', address_arr[1])
        await this.caa.check_and_type('input#address-city', address_arr[2])
        await this.caa.check_and_type('input#address-state', address_arr[2])
        await this.caa.check_and_type('input#address-postal-code', address_arr[address_arr?.length - 1])
        await this.caa.check_and_type('input#address-phone', kdp_account[16])

        await this.caa.check_and_type('input#interview-bank-country', "United States")
        await this.caa.check_and_type('input#interview-bank-accountHolder', kdp_account[3])
        await this.caa.check_and_click('input#mat-radio-5-input')
        await this.caa.check_and_type('input[name="accountNumber"]', kdp_account[6])
        await this.caa.check_and_type('input[placeholder="Re-enter account number"]', kdp_account[6])
        await setTimeout(3000)
        await this.caa.check_and_type('input#interview-bank-routingNumber', kdp_account[7])
        await this.caa.check_and_click('button#interview-save-button')

    }
}