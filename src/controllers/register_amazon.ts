import puppeteer, { Browser, Page, Touchscreen } from 'puppeteer';
import UserAgent from 'user-agents';
import { setTimeout } from 'timers/promises';
import get_kdp_account_info_amazon from '../helpers/get_kdp_account_info_amazon.js';
import { time } from 'console';
import check_and_action from '../libs/check_and_action.js';
import i_art_capcha from '../libs/i_art_capcha.js';
import i_art_fastmail from '../libs/i_art_fastmail.js';
import { DateTime } from 'luxon';
import i_art_phone from '../libs/i_art_phone.js';
import i_art_twiilo from '../libs/i_art_twilo.js';
import capture_screen_shots from '../helpers/capture_screen_shot.js';
import tex_interview_type_amazon from '../helpers/tex_interview_type_amazon.js';
import author_type_information_amazon from '../helpers/author_type_information_amazon.js';
import i_art_sheet from '../libs/i_art_sheet.js';
import cf from '../config.js';
import ExtraBrowser from '../libs/extra-browser.js';
import delete_phone_verify_amazon from '../helpers/delete_phone_verify_amazon.js';
import signup_amazon from '../helpers/signup_amazon.js';
export default class RegisterAmazon {
    browser: Browser;
    page: Page;
    kdp_accounts: any[];
    caa: check_and_action;
    exb: ExtraBrowser
    sheet_: i_art_sheet;
    constructor(browser: Browser, page: Page, exb: ExtraBrowser) {
        this.browser = browser;
        this.page = page;
        this.exb = exb
        this.caa = new check_and_action(this.page, this.browser)
    }
    // content: register amazon
    start = async (count: number) => {
        this.kdp_accounts = await this.get_kdp_account_info_amazon()
        let flag = false, isCreateAccount = false;
        try {
            await this.sheet_.updateDataOne(["PENDING"], `${cf.GOOGLE_RANGE_INPUT}!W${count + 2}`)
            await this.goto_amazon()
            await this.signup_amazon(this.kdp_accounts[count])
            await this.capcha_solve_amazon()
            await this.mail_verify_amazon(this.kdp_accounts[count])
            await this.phone_verify_amazon(this.kdp_accounts[count])
            isCreateAccount = true;
            await this.phone_two_step_verify_amazon(this.kdp_accounts[count])
            await this.author_type_information_amazon(this.kdp_accounts[count])
            await this.tex_interview_type_information_amazon(this.kdp_accounts[count])
            await this.delete_phone_verify_amazon()
            await this.add_2sv_authenticator(count)
            flag = true;
        } catch (error) {
            console.log(error)
            flag = false;
            isCreateAccount = false;
        }
        const capture_con = new capture_screen_shots(this.page, this.browser)
        const status = await capture_con.capture(this.kdp_accounts[count]?.[10])
        await this.sheet_.updateDataOne([status], `${cf.GOOGLE_RANGE_INPUT}!X${count + 2}`)

        if (flag === true && isCreateAccount === true) await this.sheet_.updateDataOne(["TRUE"], `${cf.GOOGLE_RANGE_INPUT}!W${count + 2}`)
        else if (flag === false && isCreateAccount === false) await this.sheet_.updateDataOne(["FALSE"], `${cf.GOOGLE_RANGE_INPUT}!W${count + 2}`)
        else if (flag === false && isCreateAccount === true) await this.sheet_.updateDataOne(["ALREADY"], `${cf.GOOGLE_RANGE_INPUT}!W${count + 2}`)
        else await this.sheet_.updateDataOne(["FALSE"], `${cf.GOOGLE_RANGE_INPUT}!W${count + 2}`)
        await this.browser.close()
    }
    // step 0: get google sheet information
    get_kdp_account_info_amazon = async () => {
        this.log("Start get KDP account")
        const response = new get_kdp_account_info_amazon()
        const sheet_ = response.sheet_
        this.sheet_ = sheet_
        const kdpas = await sheet_.start({ type: "getdata" })
        if (kdpas?.type === 'success') this.kdp_accounts = kdpas.result.data;
        else this.kdp_accounts = [];
        // this.log(this.kdp_accounts)
        return this.kdp_accounts
    }
    // step 1: goto amazon
    goto_amazon = async () => {
        this.log("Start go to amazon register")
        await this.exb.goto('https://kdp.amazon.com/en_US/')
        //await this.page.setViewport({ height: 1000, width: 1920 });
    }
    // step 2,3: click signup, create KDP, typing: name, email, password, cfpassword
    signup_amazon = async (kdp_account: any) => {
        this.log("Start type user infomation")
        const signup_amazon_ = new signup_amazon(this.page, this.browser)
        await signup_amazon_.start(kdp_account)

    }
    // step 4,5: capcha pass, 2capcha type: funcapcha
    capcha_solve_amazon = async () => {
        await setTimeout(10000)
        if (await this.page?.$('span#cvf-submit-otp-button-announce')) {
            return
        }
        let times = 10;
        while (--times > 0) {
            this.log('Start solve capcha')
            const i_art_capcha_ = new i_art_capcha(this.page, this.browser);
            await i_art_capcha_.sloveCaptchar();
            if (await this.page?.$('span#cvf-submit-otp-button-announce')) {
                return
            }
            await this.page.reload({ timeout: 60 * 1000, waitUntil: 'domcontentloaded' })
        }

        throw new Error('Không giải được Captcha')
    }


    // step 6,7: verify email with fastmail.com
    mail_verify_amazon = async (kdp_account: any) => {
        await setTimeout(30000)
        let isPassCapcha = await this.page.$('span[data-csa-c-func-deps="aui-da-a-dropdown-button"]')
        await this.page.waitForSelector('input#cvf-input-code')
        this.log("Start mail verify")
        const i_art_fastmail_ = new i_art_fastmail(this.page, this.browser);
        while (!isPassCapcha) {
            try {
                await i_art_fastmail_.start(kdp_account[10])
            } catch (error) {
                this.log('Canceled')
            }
            setTimeout(15000)
            isPassCapcha = await this.page.$('span[data-csa-c-func-deps="aui-da-a-dropdown-button"]')
        }
    }
    // step 8,9,10,11: add phone number, get OTP, verify phone, click agree button
    phone_verify_amazon = async (kdp_account) => {
        await setTimeout(2000)
        this.log("Start phone verify")
        await this.caa.check_and_click('span[data-csa-c-func-deps="aui-da-a-dropdown-button"]')
        await this.caa.check_and_click('li[aria-labelledby="cvf_phone_cc_native_221"]')
        await this.caa.check_and_type('input[name="cvf_phone_num"]', kdp_account[17])
        await this.caa.check_and_click('span#a-autoid-0-announce')
        await setTimeout(5000)
        let isPassPhone = await this.page.$('span#agree-button-announce')
        while (!isPassPhone) {
            try {
                const i_art_phone_ = new i_art_phone({ phone: kdp_account[17] })
                const OTP = await i_art_phone_.findOTP()
                await setTimeout(20000)
                await this.caa.check_and_type('input[name="code"]', OTP)
                await this.caa.check_and_click('span#a-autoid-0-announce')
            } catch (error) {
                console.log(error)
            }
            await setTimeout(20000)
            isPassPhone = await this.page.$('span#agree-button-announce')
        }


    }
    // step 12,13,14,15: click update button, add phone_2 ( collum U), get OTP, verify phone.
    phone_two_step_verify_amazon = async (kdp_account: any) => {

        await setTimeout(35000)
        await this.caa.check_and_click('span#agree-button-announce')
        await this.caa.check_and_click('div.a-alert-content > a')
        await this.caa.check_and_click('span.a-dropdown-prompt')
        await this.caa.check_and_click('a#cvf_phone_cc_native_221')
        await this.caa.check_and_type('input.a-input-text', kdp_account[17])
        await this.caa.check_and_click('input[name="cvf_action"]')
        const i_art_phone_ = new i_art_phone({ phone: kdp_account[17] })
        const OTP = await i_art_phone_.findOTP()
        await this.caa.check_and_type('input[name="code"]', OTP)
        await this.caa.check_and_click('input[name="cvf_action"]')
        this.log(OTP)
    }
    // step 16: add more information
    author_type_information_amazon = async (kdp_account: any) => {
        const author_type_information_amazon_ = new author_type_information_amazon(this.page, this.browser)
        await author_type_information_amazon_.start(kdp_account)

    }
    // step 17,18,19,20,21,22,23,24 click save => click complate tex information, type tex interview, cap_screen
    tex_interview_type_information_amazon = async (kdp_account: any) => {
        try {
            const tex_interview_type_amazon_ = new tex_interview_type_amazon(this.page, this.browser)
            await tex_interview_type_amazon_.start(kdp_account)
        } catch (error) {
            this.log(error)
        }

    }
    // step 25,26,27,28,29: click user info -> login security -> edit mobile phone -> delete
    delete_phone_verify_amazon = async () => {
        const delete_phone_verify_amazon_ = new delete_phone_verify_amazon(this.page, this.browser)
        await delete_phone_verify_amazon_.start()
    }
    // step 30,31,32,33: add 2SV authenticator, add barcode to twilo -> get otp -> type verify -> click got it 
    add_2sv_authenticator = async (count) => {

        await this.caa.check_and_click('a#sia-settings-enable-mfa')
        await this.caa.check_and_click('a#sia-otp-accordion-totp-header')
        await this.caa.check_and_click('a#sia-auth-app-cant-scan-link')
        const i_art_twiilo_ = new i_art_twiilo(this.page, this.browser)
        let flag = true;
        while (flag) {
            let barcode = await this.page.$eval('span#sia-auth-app-formatted-secret', data => data.textContent);
            const TOTP = await i_art_twiilo_.barcod2otp(barcode)
            this.log(barcode + " " + TOTP)
            if (TOTP) {
                await this.caa.check_and_type('input#ch-auth-app-code-input', TOTP)
                await this.caa.check_and_click('input#ch-auth-app-submit')
                await setTimeout(2000)
                // const result_status = await this.page.$eval('span#ch-auth-app-form-error', data => data.textContent);
                // if (result_status !== 'Incorrect code.If this error repeats, rescan the barcode.') {
                //     flag = false
                await this.sheet_.updateDataOne([barcode?.replaceAll(" ", "")], `${cf.GOOGLE_RANGE_INPUT}!U${count + 2}`)
                await this.caa.check_and_click('input#enable-mfa-form-submit')
                flag = false;
                // }
            }
        }
    }
    log(text: string) {
        console.log(`[${DateTime.now().setLocale('vi').toFormat('HH:mm:ss dd/MM')}] ${text[0].toUpperCase() + text.substr(1)}`);
    }
}