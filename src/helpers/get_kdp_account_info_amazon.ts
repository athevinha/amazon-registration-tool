import { Browser, Page } from "puppeteer";
import i_art_sheet from "../libs/i_art_sheet.js";
import cf from '../config.js'
export default class get_kdp_account_info_amazon {
    page: Page;
    browser: Browser;
    config_: {
        GOOGLE_SHEET_ID: string,
        GOOGLE_RANGE_INPUT: string,
        GOOGLE_RANGE_OUTPUT: string,
    };
    sheet_: any;
    constructor() {
        this.config_ = {
            GOOGLE_SHEET_ID: cf.GOOGLE_SHEET_ID,
            GOOGLE_RANGE_INPUT: cf.GOOGLE_RANGE_INPUT,
            GOOGLE_RANGE_OUTPUT: cf.GOOGLE_RANGE_OUTPUT,
        }
        this.sheet_ = new i_art_sheet(this.config_)
    }

}