import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ChannelsService {
    constructor(private http: Http) {
    }

    getChannels() {
        return this.http.get('http://localhost:3000/api/channels').map(res => res.json());
    }

    getChannel(channelId) {
        return this.http.get('http://localhost:3000/api/channel/' + channelId).map(res => res.json()).catch(this.handleError);
    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    addChannel(newChannel) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/api/channel', JSON.stringify(newChannel), { headers: headers }).map(res => res.json());
    }
}
