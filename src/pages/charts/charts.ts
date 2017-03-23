import { Component } from '@angular/core';
import { ModalController, ViewController, NavController, NavParams } from 'ionic-angular';

import { ModalContentPage } from './modal';

import { ChannelsService } from '../../app/services/channels.service';
import { CommentsService } from '../../app/services/comments.service';
import { VotesService } from '../../app/services/votes.service';

import { Comment } from '../../app/interfaces/comment.interface';
import { Vote } from '../../app/interfaces/vote.interface';

import * as moment from 'moment';
import * as _ from 'underscore';

@Component({
  selector: 'page-charts',
  templateUrl: 'charts.html'
})
export class ChartsPage {
  channelTitle: string;
  channelId: string;
  period: string;
  timeStart: Date;
  timeEnd: Date;
  votes: Vote[];  //channel's votes
  comments: Comment[]; // channel's comments
  voteList: { comments: Comment[], date: Date, format: string, votes: Vote[] }[];   // sorted votes

  public doughnutChartLabels: string[] = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
  public doughnutChartData: number[] = [350, 450, 100];
  public doughnutChartType: string = 'doughnut';
  public doughnutChartOptions = { responsive: false };

  public lineChartData: Array<any> = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  public lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartType: string = 'line';


  constructor(
    public navCtrl: NavController,
    public params: NavParams,
    private votesService: VotesService,
    private commentsService: CommentsService,
    private channelsService: ChannelsService,
    public modalCtrl: ModalController
  ) {
    this.channelId = params.get('channelId');
    this.channelTitle = params.get('title');
    this.period = "global";
    this.timeStart = new Date();
    this.timeEnd = new Date();
  }

  openModal(i: number) {
    let modal = this.modalCtrl.create(ModalContentPage, { item: this.voteList[i] });
    modal.present();
  }

  ionViewWillEnter() {
    this.getVotes(this.channelId);
    this.getComments(this.channelId);
  }

  periodOnChange() {
    console.log("aze");
    this.formatData(this.votes, this.comments);
  }

  // Get the channel's comments
  getComments(channelId) {
    this.commentsService.getComments(channelId).subscribe(comments => {
      let tableau = [];
      comments.forEach(function (e) {
        e.time = new Date(e.time);  // Change ISO date format into JavaScript date object
        tableau.push(e);
      });
      this.comments = comments;
      this.loadData();
    });
  }

  // Get the channel's votes
  getVotes(channelId) {
    this.votesService.getVotes(channelId).subscribe(votes => {
      let tableau = [];
      votes.forEach(function (e) {
        e.time = new Date(e.time);  // Change ISO date format into JavaScript date object
        tableau.push(e);
      });
      this.votes = votes;
      this.timeStart = votes[0].time;
      this.loadData();
    });
  }

  loadData() {
    if (this.votes != undefined && this.comments != undefined) // Promise on both subscribe()
      this.formatData(this.votes, this.comments);
  }

  // Format votes and comments
  formatData(votes: { _id: string, channelId: string, status: number, time: Date, userId: string }[], comments) {
    let dates = [];
    if (this.period == "global") {
      let tmp = _.uniq(votes.slice().reverse(), (e) => { return e.userId });  // Unique userId
      let tmp2 = _.groupBy(tmp, (e) => { return e.status });          // Group by status  
      let arrFlatten = [];
      _.each(tmp2, function (e, index) {
        arrFlatten[index] = e;
      });

      dates.push({
        date: this.timeStart,
        format: "global",
        votes: arrFlatten,
        comments: comments
      });
    } else if (this.period == "day") {
      let startDate = moment(this.timeStart).clone().startOf('day');
      let endDate = moment(this.timeEnd).clone().startOf('day');

      while (startDate.diff(endDate) < 1) {
        dates.push({
          date: startDate.clone().toDate(), // A day
          votes: [],                      // Votes that day
          comments: []
        });
        startDate.add(1, 'd');                // Adding one day
      }
      let votesCursor = 0;
      let commentsCursor = 0;
      dates.forEach((element) => {
        while (votesCursor < votes.length && moment(element.date).diff(moment(votes[votesCursor].time).startOf('day')) == 0) {
          element.votes.push(votes[votesCursor]);
          votesCursor++;
        }

        while (commentsCursor < comments.length && moment(element.date).diff(moment(comments[commentsCursor].time).startOf('day')) == 0) {
          element.comments.push(comments[commentsCursor]);
          commentsCursor++;
        }
      });

      let res = [];
      dates.forEach((element) => {
        let tmp = _.uniq(element.votes.reverse(), (e: Vote) => { return e.userId });
        let tmp2 = _.groupBy(tmp, (e) => { return e.status });
        let arrFlatten = [];
        _.each(tmp2, function (e, index) {
          arrFlatten[index] = e;
        });
        res.push({
          date: element.date,
          format: 'day',
          votes: arrFlatten,
          comments: element.comments
        });
      });
      dates = res;
    } else if (this.period == "week") {
      let startDate = moment(this.timeStart).clone().startOf('week');
      let endDate = moment(this.timeEnd).clone().startOf('week');

      while (startDate.isoWeeks() <= endDate.isoWeeks()) {
        dates.push({
          date: startDate.clone().add(1, 'd').toDate(), // Starting day of the week, moment set it to sunday so we change it to monday
          votes: [],                                     // Votes that week
          comments: []
        });
        startDate.add(1, 'w');                            // Adding one week
      }

      let votesCursor = 0;
      let commentsCursor = 0;
      dates.forEach((element) => {
        while (votesCursor < votes.length && moment(element.date).startOf('week').diff(moment(votes[votesCursor].time).startOf('week')) == 0) {
          element.votes.push(votes[votesCursor]);
          votesCursor++;
        }

        while (commentsCursor < comments.length && moment(element.date).startOf('week').diff(moment(comments[commentsCursor].time).startOf('week')) == 0) {
          element.comments.push(comments[commentsCursor]);
          commentsCursor++;
        }
      });

      let res = [];
      dates.forEach((element) => {
        let tmp = _.uniq(element.votes.reverse(), (e: Vote) => { return e.userId });
        let tmp2 = _.groupBy(tmp, (e) => { return e.status });
        let arrFlatten = [];
        _.each(tmp2, function (e, index) {
          arrFlatten[index] = e;
        });
        res.push({
          date: element.date,
          format: 'week',
          votes: arrFlatten,
          comments: element.comments
        });
      });
      dates = res;
    } else if (this.period == "month") {
      let startDate = moment(this.timeStart).clone().startOf('month');
      let endDate = moment(this.timeEnd).clone().startOf('month');
      while (startDate.month() <= endDate.month()) {
        dates.push({
          date: startDate.clone().toDate(),               // Starting day of the month
          votes: [],                                       // Votes that month
          comments: []
        });
        startDate.add(1, 'month');                          // Adding one month
      }

      let votesCursor = 0;
      let commentsCursor = 0;
      dates.forEach((element) => {
        while (votesCursor < votes.length && moment(element.date).startOf('month').diff(moment(votes[votesCursor].time).startOf('month')) == 0) {
          element.votes.push(votes[votesCursor]);
          votesCursor++;
        }

        while (commentsCursor < comments.length && moment(element.date).startOf('month').diff(moment(comments[commentsCursor].time).startOf('month')) == 0) {
          element.comments.push(comments[commentsCursor]);
          commentsCursor++;
        }
      });

      let res = [];
      dates.forEach((element) => {
        let tmp = _.uniq(element.votes.reverse(), (e: Vote) => { return e.userId });
        let tmp2 = _.groupBy(tmp, (e) => { return e.status });
        let arrFlatten = [];
        _.each(tmp2, function (e, index) {
          arrFlatten[index] = e;
        });
        res.push({
          date: element.date,
          format: 'month',
          votes: arrFlatten,
          comments: element.comments
        });
      });
      dates = res;
    }

    // Filling with empty arrays for ngFor
    let max;
    //this.commentList = [];
    dates.forEach((element) => {
      max = 0;
      for (let i = 0; i < 6; i++) {
        if (element.votes[i] == undefined) {
          element.votes[i] = [];
        }
        if (element.votes[i].length > max) {
          max = element.votes[i].length;
        }
      }

      element.votes[0] = max; // get the max vote count
      //this.commentList.push(false);   // Comments are not shown
    });
    this.voteList = dates.reverse();
  }

  // Get the vote count in a period (does not count duplicates)
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

  getBestAverageScore(voteList) {
    if (voteList != undefined) {
      let res = 0;
      let sum;
      let count;
      let average;
      voteList.forEach((element) => {
        sum = 0;
        count = 0;
        for (let i = 1; i < 6; i++) {
          sum += element.votes[i].length * i;
          count += element.votes[i].length;
        }
        average = Math.round(sum / count * 10) / 10 || 0;
        if (average > res) {
          res = average;
        }
        if (res == 5) {
          return res;
        }
      });
      return res;
    }
  }

  getWorstAverageScore(voteList) {
    if (voteList != undefined) {
      let res = 5;
      let sum;
      let count;
      let average;
      voteList.forEach((element) => {
        sum = 0;
        count = 0;
        for (let i = 1; i < 6; i++) {
          sum += element.votes[i].length * i;
          count += element.votes[i].length;
        }
        average = Math.round(sum / count * 10) / 10 || 0;
        if (average != 0 && average < res) {
          res = average;
        }
        if (res == 1) {
          return res;
        }
      });
      return res;
    }
  }

  getMostRecentMood(voteList, i: number) { // i = score
    if (voteList != undefined) {
      let res = "Date not found";
      voteList.slice().forEach((element) => {
        if (i == this.getAverageScore([element])) {
          res = element.date;
        }
      });
      return res;
    }
  }

  getAverageScore_Rounded(voteList) {
    return Math.round(this.getAverageScore(voteList));
  }

  getBestAverageScore_Rounded(voteList) {
    return Math.round(this.getBestAverageScore(voteList));
  }

  getWorstAverageScore_Rounded(voteList) {
    return Math.round(this.getWorstAverageScore(voteList));
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