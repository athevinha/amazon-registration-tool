import fs from 'fs';
import { google } from 'googleapis';
import { setTimeout } from 'timers/promises';
import { DateTime } from 'luxon';

import cf from '../config.js';
import path from 'path';

export default class i_art_sheet {
    CREDENTIALS_PATH = '';
    TOKEN_PATH = '';
    GOOGLE_SHEET_ID = '';
    GOOGLE_RANGE = '';
    GOOGLE_RANGE_INPUT = '';
    GOOGLE_RANGE_OUTPUT = '';

    _oAuth2Client: any;

    _config: any;

    constructor(config: any) {
        this._config = config;

        this.CREDENTIALS_PATH = path.join(cf.__dirname, 'credentials.json');
        this.TOKEN_PATH = path.join(cf.__dirname, 'token.json');

        this.GOOGLE_SHEET_ID = this._config['GOOGLE_SHEET_ID'];
        this.GOOGLE_RANGE_INPUT = this._config['GOOGLE_RANGE_INPUT'];
        this.GOOGLE_RANGE_OUTPUT = this._config['GOOGLE_RANGE_OUTPUT'];

        const credentials = JSON.parse(fs.readFileSync(this.CREDENTIALS_PATH, 'utf8'));

        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        const token = JSON.parse(fs.readFileSync(this.TOKEN_PATH, 'utf8'));
        oAuth2Client.setCredentials(token);

        this._oAuth2Client = oAuth2Client;
    }

    async start(oSheet: any) {
        if (oSheet['type'] == 'getdata') {
            return await this.getData();
        }

        if (oSheet['type'] == 'getProductID') {
            return await this.getProductID();
        }

        if (oSheet['type'] == 'update') {
            return this.updateData(oSheet);
        }
    }

    async getProductID() {
        this.log('Running get Product ID Sheet...');

        let data = {
            'type': '',
            'result': {}
        };

        const auth = this._oAuth2Client;
        const sheets = google.sheets({ version: 'v4', auth });

        let dataSheet = [];

        await new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get({
                spreadsheetId: this.GOOGLE_SHEET_ID,
                range: this.GOOGLE_RANGE_OUTPUT + '!J2:J'
            }, (err, res) => {
                if (err) {
                    data.type = 'error';
                    data.result = `Error connect ${this.GOOGLE_SHEET_ID} - ${this.GOOGLE_RANGE}: ${err}`;
                } else {
                    let flagData = false;
                    if (res.data.values != undefined) {
                        const rows = res.data.values;
                        if (rows.length) {
                            let i = 2;
                            for (let row of rows) {
                                if (row[0] != '') {
                                    if (!dataSheet.includes(row[0])) {
                                        flagData = true;
                                        data.type = 'success';
                                        dataSheet.push(row[0]);
                                    }
                                }

                                i++;
                            }
                        }
                    }

                    if (flagData == false) {
                        data.type = 'error';
                        data.result = 'Empty Data';
                    }
                }

                resolve(data);
            });
        });

        if (data.type == 'success') {
            data.result = dataSheet;
        }

        return data;
    }

    async getData() {
        this.log('Running get data...');

        let data = {
            'type': '',
            'result': {}
        };

        const auth = this._oAuth2Client;
        const sheets = google.sheets({ version: 'v4', auth });

        await new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get({
                spreadsheetId: this.GOOGLE_SHEET_ID,
                range: 'Sheet1!A2:W'
            }, (err, res) => {
                if (err) {
                    data.type = 'error';
                    data.result = `Error connect ${this.GOOGLE_SHEET_ID} - ${this.GOOGLE_RANGE}: ${err}`;
                } else {
                    let flagData = true;

                    if (res.data.values != undefined) {
                        const rows = res.data.values;
                        if (rows.length) {
                            data.type = 'success';
                            data['result']['data'] = rows;
                            data['result']['range_sheet'] = rows.length;
                            // let i = 2;
                            // for (let row of rows) {
                            //     if (row.length == 3 && row[0] != '' && row[1] != '' && row[2] == 'Pending') {
                            //         flagData = true;
                            //         data.type = 'success';
                            //         data['result']['data'] = row;
                            //         data['result']['range_sheet'] = i;
                            //         i++;
                            //     }

                            // }
                        }
                    }

                    // if (flagData == false) {
                    //     data.type = 'error';
                    //     data.result = 'Empty Data';
                    // }
                }

                resolve(data);
            });
        });

        return data;
    }

    async updateData(oSheet: any) {
        let data = {
            'type': '',
            'result': {}
        };

        const auth = this._oAuth2Client;
        const sheets = google.sheets({ version: 'v4', auth });

        let rengSheet = 2;

        let aData = [
            '1',
            '2',
        ];

        this.saveData(sheets, aData, this.GOOGLE_RANGE + '!A' + rengSheet);

        data.type = 'success';

        return data;
    }

    async updateDataOne(dataSave: any, rangeSheet: string = '') {
        const auth = this._oAuth2Client;
        const sheets = google.sheets({ version: 'v4', auth });

        await this.saveData(sheets, dataSave, rangeSheet);
    }

    async addDataOne(dataSave: any, rangeSheet: string = '') {
        const auth = this._oAuth2Client;
        const sheets = google.sheets({ version: 'v4', auth });

        this.addData(sheets, dataSave, rangeSheet);
    }

    async addData(sheets: any, dataSave: any, rangeSheet, errorSave: number = 0) {
        if (errorSave > 1) {
            await setTimeout(1000);
        }

        if (errorSave >= 5) {
            this.log(`Add Error Data...`);
            return;
        }

        const result: any = await new Promise((resolve, reject) => {
            sheets.spreadsheets.values.append({
                spreadsheetId: this.GOOGLE_SHEET_ID,
                range: rangeSheet,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                /* resource        : {
                    values: [
                        dataSave
                    ],
                }, */
                resource: {
                    values: dataSave,
                },
            }, (err, res) => {
                if (err) {
                    console.log("Data Error :", err);
                    // reject('error');
                    resolve('error');
                }

                resolve('oke');
            });
        });

        if (result == 'oke') {
            // this.log('Add thành công');
        }

        if (result == 'error') {
            errorSave++;
            this.log('Add lại lần: ' + errorSave);
            await setTimeout(5000);
            await this.addData(sheets, dataSave, rangeSheet, errorSave);
        }
    }

    async saveData(sheets: any, dataSave: any, range: string, errorSave: number = 0) {
        if (errorSave > 1) {
            await setTimeout(1000);
        }

        if (errorSave >= 5) {
            this.log(`Save Error Data... ${range}`);
            return;
        }

        const result: any = await new Promise((resolve, reject) => {
            sheets.spreadsheets.values.update({
                spreadsheetId: this.GOOGLE_SHEET_ID,
                range: range,
                valueInputOption: 'RAW',
                resource: {
                    values: [
                        dataSave
                    ],
                },
            }, (err, res) => {
                if (err) {
                    console.log("Data Error :", err);
                    // reject('error');
                    resolve('error');
                }

                resolve('oke');
            });
        });

        if (result == 'oke') {
            // this.log('Save thành công: ' + range);
        }

        if (result == 'error') {
            errorSave++;
            this.log('Save lại lần: ' + errorSave);
            await setTimeout(3000);
            await this.saveData(sheets, dataSave, range, errorSave);
        }
    }
    log(text: string) {
        console.log(`[${DateTime.now().setLocale('vi').toFormat('HH:mm:ss')}] ${text[0].toUpperCase() + text.substr(1)}`);
    }
}