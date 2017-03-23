import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { VotesService } from '../../app/services/votes.service';
import { CommentsService } from '../../app/services/comments.service';

import { ChartsPage } from '../charts/charts';

import * as Fingerprint2 from 'fingerprintjs2';

@Component({
  selector: 'page-vote',
  templateUrl: 'vote.html'
})
export class VotePage {
  channelTitle: string;
  channelId: string;
  fingerprintId: string;
  status: string;
  message: string;
  vote: number;
  submitted: number;
  promise: number;

  constructor(
    public navCtrl: NavController,
    public params: NavParams,
    private votesService: VotesService,
    private commentsService: CommentsService
  ) {
    this.channelId = params.get('channelId');
    this.channelTitle = params.get('title');
    this.status = "";
    this.message = "";

    new Fingerprint2().get((result) => {
      this.fingerprintId = result;
    });
  }

  submitData() {
    if (this.vote != null) {
      this.addVote();
    }
    if (this.message != null) {
      this.addComment();
    }
    this.nextPage();
  }

  addVote() {
    var newVote = {
      channelId: this.channelId,
      userId: this.fingerprintId,
      time: new Date(),
      status: parseInt(this.vote.toString()) // this.vite is sent as : "NUMBER" instead of NUMBER otherwise
    };

    this.votesService.addVote(newVote).subscribe(data => {
    });
  }

  // Menu button trigger
  nextPagee() {
    this.navCtrl.push(ChartsPage, {
      title: this.channelTitle,
      channelId: this.channelId
    });
  }

  nextPage() {
    if (this.submitted == this.promise) {
      this.navCtrl.push(ChartsPage, {
        title: this.channelTitle,
        channelId: this.channelId
      });
    }
  }

  getSmiley(i: number) {
    let smiley: String;
    if (i == 1) {
      smiley = ":(";
    } else if (i == 2) {
      smiley = ":/";
    } else if (i == 3) {
      smiley = ":|";
    } else if (i == 4) {
      smiley = ":)";
    } else if (i == 5) {
      smiley = ":D";
    }
    return smiley;
  }

  getSmileyText(i: number) {
    let smileyText: String;
    if (i == 1) {
      smileyText = "Sad";
    } else if (i == 2) {
      smileyText = "Meh";
    } else if (i == 3) {
      smileyText = "Average";
    } else if (i == 4) {
      smileyText = "Good";
    } else if (i == 5) {
      smileyText = "Happy";
    }
    return smileyText;
  }

  addComment() {
    if (this.message.length == 0) {
      return;
    }
    if (this.message.length > 500) {
      this.message = this.message.substring(0, 501);
    }
    let newComment = {
      channelId: this.channelId,
      userId: this.fingerprintId,
      time: new Date(),
      message: this.message
    };
    this.message = "";
    this.commentsService.addComment(newComment).subscribe(data => {
    });
  }


}
