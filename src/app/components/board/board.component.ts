import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, OnDestroy {
  currentGuessSubscription: Subscription | null = null;
  guessesSubscription: Subscription | null = null;
  currentGuessNumberSubscription: Subscription | null = null;
  gameStateSubscription: Subscription | null = null;
  badInputSubscription: Subscription | null = null;
  letterIndexSubscription: Subscription | null = null;
  guesses = [
    [{class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}],
    [{class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}],
    [{class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}],
    [{class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}],
    [{class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}],
    [{class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}, {class: '', letter: ''}]
  ];
  currentGuess: string[] = ['', '', '', '', ''];
  currentGuessNumber = 0;
  badInput = false;
  submitted = false;
  hasWon = false;
  letterIndex = 0;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.currentGuessSubscription = this.gameService.currentGuessChanged.subscribe((guess: string[]) => {
      this.currentGuess = guess;
    });
    this.guessesSubscription = this.gameService.guessesChanged.subscribe((guesses: {class: string, letter: string}[][]) => {
      this.guesses = guesses;
      this.triggerRotateAnimation();
    });
    this.currentGuessNumberSubscription = this.gameService.currentGuessNumberChanged.subscribe((guessNumber: number) => {
      this.currentGuessNumber = guessNumber;
    });
    this.gameStateSubscription = this.gameService.gameStateChanged.subscribe((state: string) => {
      if (state === 'won') {
        this.hasWon = true;
      }
    })
    this.badInputSubscription = this.gameService.badInputAlert.subscribe((alert: string) => {
      if (alert.length > 0) {
        this.triggerShakeAnimation();
      }
    })
    this.letterIndexSubscription = this.gameService.letterIndexChanged.subscribe((index: number) => {
      this.letterIndex = index;
    })

    this.gameService.loadTodayGame();
  }

  onTileClick(index: number) {
    this.gameService.updateLetterIndex(index);
  }

  @HostListener('document:keyup', ['$event']) handleKeyboardEvent(event: KeyboardEvent) { 

    if (!this.gameService.isGamePlayable()) { 
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.moveLeft();
    }

    if (event.key === 'ArrowRight') {
      this.moveRight();
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      this.gameService.onDeleteLetter(this.letterIndex);
      if (event.key === 'Backspace') {
        this.moveLeft();
      }
      return;
    }

    const isLetter = event.keyCode >= 65 && event.keyCode <= 90;
    if (isLetter) {
      this.gameService.onAddLetter(event.key, this.letterIndex);
      this.moveRight();
      return;
    } 

    if (event.key === 'Enter') {
      if (this.badInput || this.submitted) {
        return;
      }
      if (!this.gameService.checkValidInput()) {
        return;
      }

      this.gameService.onSubmitWord();
    }
  }

  moveLeft() {
    if (this.letterIndex > 0) {
      this.letterIndex -= 1;
      this.gameService.updateLetterIndex(this.letterIndex);
    }
  }

  moveRight() {
    if (this.letterIndex < 4) {
      this.letterIndex += 1;
      this.gameService.updateLetterIndex(this.letterIndex);
    }
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

  ngOnDestroy(): void {
    this.currentGuessSubscription?.unsubscribe();
    this.guessesSubscription?.unsubscribe();
    this.currentGuessNumberSubscription?.unsubscribe();
    this.gameStateSubscription?.unsubscribe();
    this.badInputSubscription?.unsubscribe();
    this.letterIndexSubscription?.unsubscribe();
  }
}
