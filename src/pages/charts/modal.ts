import { Component } from '@angular/core';

import { ModalController, Platform, NavParams, ViewController } from 'ionic-angular';

import { Comment } from '../../app/interfaces/comment.interface';
import { Vote } from '../../app/interfaces/vote.interface';

@Component({
    selector: 'page-modal',
    templateUrl: './modal.html'
})
export class ModalContentPage {
    item: { comments: Comment[], date: Date, format: string, votes: Vote[] }[];

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController
    ) {
        this.item = this.params.get('item');
        console.log(this.item);
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    getAverageScore(voteList) {
        if (voteList != undefined) {
            let sum = 0;
            let count = 0;
            voteList.forEach((element) => {
                for (let i = 1; i < 6; i++) {
                    sum += element.votes[i].length * i;
                    count += element.votes[i].length;
                }
            });
            return Math.round(sum / count * 10) / 10 || 0; // Rounded to one decimal, if 0 votes return 0
        }
    }

    getVoteCount(element) {
        let slice = element.slice(1, element.length);
        let sum = [];
        slice.forEach((e) => {
            sum.push(e.length);
        });
        return sum.reduce(function (acc, val) {
            return acc + val;
        }, 0);
    }
    
    getVotePercentage(element, i: number) {
        let total = this.getVoteCount(element);
        return (total != 0) ? Math.round(element[i].length / total * 100) : 0;
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
}