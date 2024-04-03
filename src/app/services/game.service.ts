import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { words, wordsNormalized } from '../words-array';

@Injectable({ providedIn: 'root' })
export class GameService {
  private WORD_LENGTH = 5;
  private MAX_GUESSES = 6;

  private correctWord: string = '';
  private correctWordNormalized: string = '';
  public guessesChanged = new Subject<{ class: string; letter: string }[][]>();
  private guesses = [
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
  ];
  public currentGuessChanged = new Subject<string>();
  private currentGuess: string = '';
  public currentGuessNumberChanged = new Subject<number>();
  private currentGuessNumber: number = 0;
  public gameStateChanged = new Subject<string>();
  private gameState: 'won' | 'lost' | 'ongoing' = 'ongoing';
  public badInputAlert = new Subject<string>();

  constructor() {}

  public getCorrectWord(): string {
    if (this.correctWord.length === 0) {
      this.correctWord = this.generateWord();
      this.correctWordNormalized = this.getWordNormalized(
        this.correctWord.slice()
      );
    }

    return this.correctWord.slice();
  }

  private generateWord(): string {
    const word = words[Math.floor(Math.random() * words.length)];
    console.log(word);
    return word;
  }

  public getCorrectWordNormalized(): string {
    return this.correctWordNormalized.slice();
  }

  private getWordNormalized(word: string): string {
    let w = word.replace(/[àáâãäå]/g, 'a');
    w = w.replace(/[éèêë]/g, 'e');
    w = w.replace(/[íìîï]/g, 'i');
    w = w.replace(/[óòôõö]/g, 'o');
    w = w.replace(/[úùûü]/g, 'u');
    w = w.replace(/[ç]/g, 'c');
    return w;
  }

  public isGamePlayable(): boolean {
    return this.gameState === 'ongoing';
  }

  public onDeleteLastLetter(): void {
    this.currentGuess = this.currentGuess.slice(0, this.currentGuess.length - 1);
    this.currentGuessChanged.next(this.currentGuess.slice());
  }

  public onAddLetter(letter: string): void {
    if (this.currentGuess.length >= this.WORD_LENGTH) {
      return;
    }
    this.currentGuess += letter.toLowerCase();
    this.currentGuessChanged.next(this.currentGuess.slice());
  }

  public checkValidInput(): boolean {
    if (this.currentGuess.length < this.WORD_LENGTH) {
      this.badInputAlert.next('Faltam letras');
      setTimeout(() => {
        this.badInputAlert.next('');
      }, 1000);
      return false;
    }
    if (!wordsNormalized.includes(this.currentGuess)) {
      this.badInputAlert.next('Palavra não está na lista');
      setTimeout(() => {
        this.badInputAlert.next('');
      }, 1000);
      return false;
    }
    return true;
  }

  public onSubmitWord(): void {
    this.currentGuessNumber += 1;
    this.currentGuessNumberChanged.next(this.currentGuessNumber);
    let wordArray = this.getCorrectWordNormalized().split('');
    let currentGuessArray = this.currentGuess.split('');
    for (let i = 0; i < this.WORD_LENGTH; i++) {
      this.guesses[this.currentGuessNumber-1][i].letter = this.currentGuess.charAt(i);
      if (
        this.currentGuess.charAt(i) ===
        this.getCorrectWordNormalized().charAt(i)
      ) {
        this.guesses[this.currentGuessNumber-1][i].class = 'right';
        wordArray[i] = '1';
        currentGuessArray[i] = '1';
      } else if (
        !this.getCorrectWordNormalized().includes(this.currentGuess.charAt(i))
      ) {
        this.guesses[this.currentGuessNumber-1][i].class = 'wrong';
        currentGuessArray[i] = '1';
      }
    }
    // cases half
    for (let i = 0; i < currentGuessArray.length; i++) {
      if (currentGuessArray[i] === '1') {
        //1 is treated
        continue;
      }
      if (wordArray.includes(currentGuessArray[i])) {
        this.guesses[this.currentGuessNumber-1][i].class = 'half';
        wordArray[wordArray.indexOf(currentGuessArray[i])] = '1';
      } else {
        this.guesses[this.currentGuessNumber-1][i].class = 'wrong';
      }
      currentGuessArray[i] = '1';
    }

    this.checkResult();
    this.guessesChanged.next(JSON.parse(JSON.stringify(this.guesses))); //copy
  }

  private checkResult(): void {
    if (this.currentGuess === this.getCorrectWordNormalized()) {
      this.currentGuess = '';
      this.currentGuessChanged.next(this.currentGuess.slice());
      for (let i = 0; i < this.WORD_LENGTH; i++) {
        this.guesses[this.currentGuessNumber-1][i].letter = this.correctWord.charAt(i);
      }
      this.gameState = 'won';
      this.gameStateChanged.next(this.gameState.slice());
      return;
    }
    if (this.currentGuessNumber >= this.MAX_GUESSES) {
      this.gameState = 'lost';
      this.gameStateChanged.next(this.gameState.slice());
      return;
    }
    this.currentGuess = '';
    this.currentGuessChanged.next(this.currentGuess.slice());
  }
}
