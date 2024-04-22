import { Inject, Injectable } from "@nestjs/common";
import * as fs from "fs";
import csv from "csv-parser";
import { Pool } from "pg";

type AccuzipOutputObject = {
    wsid: string;
    wcid: string;
    wcaid: string;
    software: string;
    sid: string;
    cid: string;
    shop_name: string;
    authdate: string;
    mbdayyr: string;
    mbdaymo: string;
    tbdayyr: string;
    first: string;
    last: string;
    address: string;
    address2: string;
    city: string;
    st: string;
    zip: string;
    status_: string;
    dpv_: string;
    errno_: string;
    errno_desc: string;
    movedate_: string;
    nxi_: string;
    dfl_: string;
    dfldate_: string;
    vacant_: string;
    latitude_: string;
    longitude_: string;
    crrt: string;
    apt_abrcd: string;
    apt_unitcd: string;
    acoa_: string;
    acoalevel_: string;
    acoadate_: string;
    acoanxi_: string;
    acoatype_: string;
}

@Injectable()
export class AccuzipWriteToDBService {
    constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

    async writeAccuzipOutputToDB(filePath: string) {
        const rawAccuzipOutput = await this.readAccuzipOutput(filePath);
        const chunkSize = 5000;
        for (let i = 0; i < rawAccuzipOutput.length; i += chunkSize) {
            const chunk = rawAccuzipOutput.slice(i, i + chunkSize);
            const accuzipCustomers = chunk.reduce(
                (result, customer) => ({
                    ids: [...result.ids, customer.customerId],
                    wcaIds: [...result.wcaIds, customer.wcaId],
                    softwares: [...result.softwares, customer.software],
                    shopIds: [...result.shopIds, customer.shopId],
                    wsids: [...result.wsids, customer.wsId],
                    shopnames: [...result.shopnames, customer.shopName],
                    authDates: [...result.authDates, customer.authDate],
                    mbdayyrs: [...result.mbdayyrs, customer.mbdayyr],
                    mbdaymos: [...result.mbdaymos, customer.mbdaymo],
                    tbdayyrs: [...result.tbdayyrs, customer.tbdayyr],
                    firstnames: [...result.firstnames, customer.firstName],
                    lastnames: [...result.lastnames, customer.lastName],
                    addresses: [...result.addresses, customer.address],
                    cities: [...result.cities, customer.city],
                    states: [...result.states, customer.state],
                    zips: [...result.zips, customer.zip],
                    statuses: [...result.statuses, customer.status],
                    dpvs: [...result.dpvs, customer.dpv],
                    errornos: [...result.errornos, customer.errorNo],
                    errornodescs: [...result.errornodescs, customer.errorNoDesc],
                    movedates: [...result.movedates, customer.moveDate],
                    nxis: [...result.nxis, customer.nxi],
                    dfls: [...result.dfls, customer.dfl],
                    dfldates: [...result.dfldates, customer.dflDate],
                    vacants: [...result.vacants, customer.vacant],
                    latitudes: [...result.latitudes, customer.latitude],
                    longitudes: [...result.longitudes, customer.longitude],
                    crrts: [...result.crrts, customer.crrt],
                    aptabrcds: [...result.aptabrcds, customer.aptAbrCD],
                    aptunitcds: [...result.aptunitcds, customer.aptUnitCD],
                    acoas: [...result.acoas, customer.acoa],
                    acoalevels: [...result.acoalevels, customer.acoaLevel],
                    acoadates: [...result.acoadates, customer.acoaDate],
                    acoanxis: [...result.acoanxis, customer.acoaNxi],
                    acoatypes: [...result.acoatypes, customer.acoaType],
                    isbdayappends: [...result.isbdayappends, false],
                    isendhanceds: [...result.isendhanceds, true],
                }),
                {
                    ids: [] as string [],
                    wcaIds: [] as string [],
                    softwares: [] as string [],
                    shopIds: [] as string [],
                    wsids: [] as string [],
                    shopnames: [] as string [],
                    authDates: [] as Date [],
                    mbdayyrs: [] as string [],
                    mbdaymos: [] as string [],
                    tbdayyrs: [] as string [],
                    firstnames: [] as string [],
                    lastnames: [] as string [],
                    addresses: [] as string [],
                    cities: [] as string [],
                    states: [] as string [],
                    zips: [] as string [],
                    statuses: [] as string [],
                    dpvs: [] as string [],
                    errornos: [] as string [],
                    errornodescs: [] as string [],
                    movedates: [] as (Date | null) [],
                    nxis: [] as string [],
                    dfls: [] as string [],
                    dfldates: [] as string [],
                    vacants: [] as string [],
                    latitudes: [] as number [],
                    longitudes: [] as number [],
                    crrts: [] as string [],
                    aptabrcds: [] as string [],
                    aptunitcds: [] as string [],
                    acoas: [] as string [],
                    acoalevels: [] as string [],
                    acoadates: [] as (Date | null) [],
                    acoanxis: [] as string [],
                    acoatypes: [] as string [],
                    isbdayappends: [] as boolean [],
                    isendhanceds: [] as boolean []
                },
            );
    
            await this.db.query(
                `
                INSERT INTO accuzipcustomertb(
                    id,
                    wcaid,
                    software,
                    shopid,
                    wsid,
                    shopname,
                    authdate,
                    mbdayyr,
                    mbdaymo,
                    tbdayyr,
                    firstname,
                    lastname,
                    address_,
                    city,
                    state_,
                    zip,
                    status_,
                    dpv,
                    errorno,
                    errornodesc,
                    movedate,
                    nxi,
                    dfl,
                    dfldate,
                    vacant,
                    latitude,
                    longitude,
                    crrt,
                    aptabrcd,
                    aptunitcd,
                    acoa,
                    acoalevel,
                    acoadate,
                    acoanxi,
                    acoatype,
                    isbdayappend,
                    isenhanced
                ) SELECT * FROM UNNEST (
                    $1::varchar(150)[],
                    $2::varchar(15)[],
                    $3::varchar(10)[],
                    $4::varchar(10)[],
                    $5::varchar(15)[],
                    $6::varchar(100)[],
                    $7::date[],
                    $8::varchar(10)[],
                    $9::varchar(10)[],
                    $10::varchar(10)[],
                    $11::varchar(20)[],
                    $12::varchar(20)[],
                    $13::varchar(100)[],
                    $14::varchar(50)[],
                    $15::varchar(50)[],
                    $16::varchar(20)[],
                    $17::varchar(5)[],
                    $18::varchar(20)[],
                    $19::varchar(100)[],
                    $20::varchar(50)[],
                    $21::date[],
                    $22::varchar(10)[],
                    $23::varchar(50)[],
                    $24::varchar(20)[],
                    $25::varchar(5)[],
                    $26::double precision[],
                    $27::double precision[],
                    $28::varchar(20)[],
                    $29::varchar(20)[],
                    $30::varchar(20)[],
                    $31::varchar(20)[],
                    $32::varchar(20)[],
                    $33::date[],
                    $34::varchar(20)[],
                    $35::varchar(20)[],
                    $36::boolean[],
                    $37::boolean[]
                )
                ON CONFLICT (id, wsid, software)
                DO UPDATE
                SET
                id = EXCLUDED.id,
                wcaid = EXCLUDED.wcaid,
                software = EXCLUDED.software,
                shopid = EXCLUDED.shopid,
                wsid = EXCLUDED.wsid,
                shopname = EXCLUDED.shopname,
                authdate = EXCLUDED.authdate,
                mbdayyr = EXCLUDED.mbdayyr,
                mbdaymo = EXCLUDED.mbdaymo,
                tbdayyr = EXCLUDED.tbdayyr,
                firstname = EXCLUDED.firstname,
                lastname = EXCLUDED.lastname,
                address_ = EXCLUDED.address_,
                city = EXCLUDED.city,
                state_ = EXCLUDED.state_,
                zip = EXCLUDED.zip,
                status_ = EXCLUDED.status_,
                dpv = EXCLUDED.dpv,
                errorno = EXCLUDED.errorno,
                errornodesc = EXCLUDED.errornodesc,
                movedate = EXCLUDED.movedate,
                nxi = EXCLUDED.nxi,
                dfl = EXCLUDED.dfl,
                dfldate = EXCLUDED.dfldate,
                vacant = EXCLUDED.vacant,
                latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                crrt = EXCLUDED.crrt,
                aptabrcd = EXCLUDED.aptabrcd,
                aptunitcd = EXCLUDED.aptunitcd,
                acoa = EXCLUDED.acoa,
                acoalevel = EXCLUDED.acoalevel,
                acoadate = EXCLUDED.acoadate,
                acoanxi = EXCLUDED.acoanxi,
                acoatype = EXCLUDED.acoatype,
                isbdayappend = EXCLUDED.isbdayappend,
                isenhanced = EXCLUDED.isenhanced
                `,
                [
                    accuzipCustomers.ids,
                    accuzipCustomers.wcaIds,
                    accuzipCustomers.softwares,
                    accuzipCustomers.shopIds,
                    accuzipCustomers.wsids,
                    accuzipCustomers.shopnames,
                    accuzipCustomers.authDates,
                    accuzipCustomers.mbdayyrs,
                    accuzipCustomers.mbdaymos,
                    accuzipCustomers.tbdayyrs,
                    accuzipCustomers.firstnames,
                    accuzipCustomers.lastnames,
                    accuzipCustomers.addresses,
                    accuzipCustomers.cities,
                    accuzipCustomers.states,
                    accuzipCustomers.zips,
                    accuzipCustomers.statuses,
                    accuzipCustomers.dpvs,
                    accuzipCustomers.errornos,
                    accuzipCustomers.errornodescs,
                    accuzipCustomers.movedates,
                    accuzipCustomers.nxis,
                    accuzipCustomers.dfls,
                    accuzipCustomers.dfldates,
                    accuzipCustomers.vacants,
                    accuzipCustomers.latitudes,
                    accuzipCustomers.longitudes,
                    accuzipCustomers.crrts,
                    accuzipCustomers.aptabrcds,
                    accuzipCustomers.aptunitcds,
                    accuzipCustomers.acoas,
                    accuzipCustomers.acoalevels,
                    accuzipCustomers.acoadates,
                    accuzipCustomers.acoanxis,
                    accuzipCustomers.acoatypes,
                    accuzipCustomers.isbdayappends,
                    accuzipCustomers.isendhanceds
                ]
            )
        }

    }

    async readAccuzipOutput(filePath: string): Promise<{
        wsId: string;
        wcaId: string;
        software: string;
        shopId: string;
        customerId: string;
        shopName: string;
        authDate: Date;
        mbdayyr: string;
        mbdaymo: string;
        tbdayyr: string;
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        status: string;
        dpv: string;
        errorNo: string;
        errorNoDesc: string;
        moveDate: Date | null;
        nxi: string;
        dfl: string;
        dflDate: string;
        vacant: string;
        latitude: number;
        longitude: number;
        crrt: string;
        aptAbrCD: string;
        aptUnitCD: string;
        acoa: string;
        acoaLevel: string;
        acoaDate: Date | null;
        acoaNxi: string;
        acoaType: string;
    } []> {
        const results: any = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (data: AccuzipOutputObject) => results.push({
                    wsId: data['wsid'].trim(),
                    wcaId: data['wcaid'].trim(),
                    software: data['software'].trim(),
                    shopId: data['sid'].trim(),
                    customerId: data['cid'].trim(),
                    shopName: data['shop_name'].trim(),
                    authDate: new Date(data['authdate'].trim()),
                    mbdayyr: data['mbdayyr'].trim(),
                    mbdaymo: data['mbdaymo'].trim(),
                    tbdayyr: data['tbdayyr']?.trim()??"",
                    firstName: data['first'].trim(),
                    lastName: data['last'].trim(),
                    address: data['address'].trim(),
                    city: data['city'].trim(),
                    state: data['st'].trim(),
                    zip: data['zip'].trim(),
                    status: data['status_'].trim(),
                    dpv: data['dpv_'].trim(),
                    errorNo: data['errno_'].trim(),
                    errorNoDesc: data['errno_desc'].trim(),
                    moveDate: data['movedate_'].trim() !== '' ? new Date(parseInt(data['movedate_'].trim().substring(0, 4), 10), parseInt(data['movedate_'].trim().substring(4, 6), 10) - 1): null,
                    nxi: data['nxi_'].trim(),
                    dfl: data['dfl_'].trim(),
                    dflDate: data['dfldate_'].trim(),
                    vacant: data['vacant_'].trim(),
                    latitude: parseFloat(data['latitude_']?.trim()),
                    longitude: parseFloat(data['longitude_']?.trim()),
                    crrt: data['crrt'].trim(),
                    aptAbrCD: data['apt_abrcd'].trim(),
                    aptUnitCD: data['apt_unitcd'].trim(),
                    acoa: data['acoa_'].trim(),
                    acoaLevel: data['acoalevel_'].trim(),
                    acoaDate: data['acoadate_'].trim() !== '' ? new Date(parseInt(data['acoadate_'].trim().substring(0, 4), 10), parseInt(data['acoadate_'].trim().substring(4, 6), 10) - 1): null,
                    acoaNxi: data['acoanxi_'].trim(),
                    acoaType: data['acoatype_'].trim()
                }))
                .on("end", () => {
                    resolve(results);
                })
                .on("error", (error) => {
                    reject(error)
                })
        })
    }
}
