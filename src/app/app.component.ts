import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from '../pages/home/home';

import { VotesService } from './services/votes.service';
import { ChannelsService } from './services/channels.service';
import { CommentsService } from './services/comments.service';

@Component({
  templateUrl: 'app.html',
  providers: [CommentsService, VotesService, ChannelsService]
})
export class MyApp {
  rootPage = HomePage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }
}
