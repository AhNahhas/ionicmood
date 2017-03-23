import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { VotePage } from '../vote/vote';
import { ChannelsService } from '../../app/services/channels.service';

import * as moment from 'moment';
import * as _ from 'underscore';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  storedChannels: { title: string, lastJoin: string }[];

  constructor(public navCtrl: NavController, private channelsService: ChannelsService) {
    this.storedChannels = [{ "title": "456", "lastJoin": "2017-03-02T11:54:50.583Z" }, { "title": "456", "lastJoin": "2017-03-02T11:54:50.583Z" }, { "title": "456", "lastJoin": "2017-03-02T11:54:50.583Z" }];
    this.retrieve();
  }

  daysAgo(date: string) {
    return moment(new Date(date)).fromNow();
  }

  addToStorage(title: string) {
    let arr = _.filter(this.storedChannels, function (e) { return e.title == title; });
    if (!(arr.length > 0)) {
      this.storedChannels.push({
        title: title,
        lastJoin: (new Date()).toISOString()
      });
    }
  }

  removeAll() {
    this.storedChannels = [];
    localStorage.removeItem('channels');
  }

  store() {
    localStorage.setItem('channels', JSON.stringify(this.storedChannels));
  }

  retrieve() {
    let chan = JSON.parse(localStorage.getItem('channels'));
    if (chan) {
      this.storedChannels = chan;
    }
  }

  addChannel(title: string) {
    var newChannel = {
      title: title
    };
    this.channelsService.addChannel(newChannel).subscribe(newChannelId => {
      this.navCtrl.push(VotePage, {
        title: title,
        channelId: newChannelId
      });
    });
  }

  checkChannel(title: string) {
    this.channelsService.getChannels().subscribe(channels => { //Get all channels
      let chan = channels.filter(x => x.title == title); //Filter results
      this.addToStorage(title);
      this.store();
      if (chan.length == 0) { //Join if it exists
        this.addChannel(title);
      } else {
        this.navCtrl.push(VotePage, {
            title: title,
            channelId: chan[0]._id
        });
      }
    });
  }
}
