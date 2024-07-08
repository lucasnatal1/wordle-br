import { Component, OnInit } from '@angular/core';

import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isVictory = false;
  isDefeat = false;
  showModal = true;
  message = '';
  badInput = false;
  word = '';
  state: string = 'ongoing';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.gameStateChanged.subscribe((state: string) => {
      setTimeout(() => {this.state = state;}, 1700);
      if (state === 'won') {
        this.message = 'Vitória!'
      } else {
        this.message = this.word;
      }
    });
    this.gameService.badInputAlert.subscribe((msg: string) => {
      this.message = msg;
      this.badInput = this.message.length > 0;
    });

    this.word = this.gameService.getCorrectWord();
  }
}
