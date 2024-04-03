import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css'],
})
export class KeyboardComponent implements OnInit {
  del = faDeleteLeft;
  firstRowKeysArray = [{class: '', key: 'q'}, {class: '', key: 'w'}, {class: '', key: 'e'}, {class: '', key: 'r'}, {class: '', key: 't'}, {class: '', key: 'y'}, {class: '', key: 'u'}, {class: '', key: 'i'}, {class: '', key: 'o'}, {class: '', key: 'p'}];
  scndRowKeysArray = [{class: '', key:'a'}, {class: '', key:'s'}, {class: '', key:'d'}, {class: '', key:'f'}, {class: '', key:'g'}, {class: '', key:'h'}, {class: '', key:'j'}, {class: '', key:'k'}, {class: '', key:'l'}];
  trdRowKeysArray = [{class: '', key: 'z'}, {class: '', key: 'x'}, {class: '', key: 'c'}, {class: '', key: 'v'}, {class: '', key: 'b'}, {class: '', key: 'n'}, {class: '', key: 'm'}];
  badInput = false;
  submitted = false;
  currentGuessNumber = 0;
  currentGuessNumberSubscription: Subscription | null = null;
  guessesSubscription: Subscription | null = null;
  badInputSubscription: Subscription | null = null;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.currentGuessNumberSubscription = this.gameService.currentGuessNumberChanged.subscribe((guessNumber: number) => {
      this.currentGuessNumber = guessNumber;
    });
    this.guessesSubscription = this.gameService.guessesChanged.subscribe((guesses: {class: string, letter: string}[][]) => {
      this.updateKeyBoard(guesses);
      this.triggerRotateAnimation();
    });
    this.badInputSubscription = this.gameService.badInputAlert.subscribe((alert: string) => {
      if (alert.length > 0) {
        this.triggerShakeAnimation();
      }
    })
  }

  updateKeyBoard(guesses: {class: string, letter: string}[][]) {
    const lettersInWord = 5;
    let isLetterUpdated = false;
    console.log(this.currentGuessNumber);
    for (let i = 0; i < lettersInWord; i++) {
      isLetterUpdated = false;
      let guessClassPower = guesses[this.currentGuessNumber-1][i].class === 'right' ? 3 : 
                            guesses[this.currentGuessNumber-1][i].class === 'half' ? 2 : 
                            guesses[this.currentGuessNumber-1][i].class === 'wrong' ? 1 : 0;

      this.firstRowKeysArray.forEach(item => {
        if (item.key === guesses[this.currentGuessNumber-1][i].letter) {
          let itemClassPower = item.class === 'right' ? 3 : item.class === 'half' ? 2 : item.class === 'wrong' ? 1 : 0;
          
          if (guessClassPower > itemClassPower) {
            item.class = guesses[this.currentGuessNumber-1][i].class;
          }
          isLetterUpdated = true;
        }
      });

      if (isLetterUpdated) { continue; }

      this.scndRowKeysArray.forEach(item => {
        if (item.key === guesses[this.currentGuessNumber-1][i].letter) {
          let itemClassPower = item.class === 'right' ? 3 : item.class === 'half' ? 2 : item.class === 'wrong' ? 1 : 0;
          
          if (guessClassPower > itemClassPower) {
            item.class = guesses[this.currentGuessNumber-1][i].class;
          }
          isLetterUpdated = true;
        }
      });

      if (isLetterUpdated) { continue; }

      this.trdRowKeysArray.forEach(item => {
        if (item.key === guesses[this.currentGuessNumber-1][i].letter) {
          let itemClassPower = item.class === 'right' ? 3 : item.class === 'half' ? 2 : item.class === 'wrong' ? 1 : 0;
          
          if (guessClassPower > itemClassPower) {
            item.class = guesses[this.currentGuessNumber-1][i].class;
          }
        }
      });
    }
  }

  onKeyClick(key: string) {
    if (!this.gameService.isGamePlayable()) {
      return;
    }

    if (key === 'delete') {
      this.gameService.onDeleteLastLetter();
      return;
    }

    if (key === 'enter') {
      if (this.badInput || this.submitted) {
        return;
      }
      if (!this.gameService.checkValidInput()) {
        return;
      }

      this.gameService.onSubmitWord();
      return;
    }

    this.gameService.onAddLetter(key);
  }

  triggerShakeAnimation() {
    this.badInput = true;
    setTimeout(() => {
      this.badInput = false;
    }, 750);
  }

  triggerRotateAnimation() {
    this.submitted = true;
    setTimeout(() => {
      this.submitted = false;
    }, 1500);
  }
}
